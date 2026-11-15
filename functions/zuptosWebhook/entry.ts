import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { secrets } from 'base44:runtime';

const APPROVED = ['approved', 'paid', 'aprovado', 'pago', 'completed', 'succeeded'];
const PENDING = ['pending', 'pendente', 'waiting', 'processing', 'in_process', 'aguardando'];
const REFUNDED = ['refunded', 'reembolsado', 'refund'];
const CHARGEBACK = ['chargeback', 'disputed', 'contestado', 'contestacao'];
const CANCELED = ['canceled', 'cancelled', 'cancelado'];
const REFUSED = ['refused', 'declined', 'recusado', 'failed', 'falhou'];

function toHex(buffer) {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function hmacHex(secret, body) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
  return toHex(sig);
}

function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export default async function (req) {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const raw = await req.text();
  const secret = secrets.get('ZUPTOS_WEBHOOK_SECRET');
  const headerName = (secrets.get('ZUPTOS_SIGNATURE_HEADER') || 'x-zuptos-signature').toLowerCase();
  const sharedToken = secrets.get('ZUPTOS_WEBHOOK_TOKEN');

  if (!secret && !sharedToken) {
    return Response.json({ error: 'webhook_not_configured' }, { status: 503 });
  }

  // Autenticidade: assinatura HMAC do corpo bruto ou token compartilhado
  let authentic = false;
  if (secret) {
    const provided = (req.headers.get(headerName) || '').trim().replace(/^sha256=/i, '');
    if (provided) {
      const expected = await hmacHex(secret, raw);
      authentic = safeEqual(provided.toLowerCase(), expected.toLowerCase());
    }
  }
  if (!authentic && sharedToken) {
    const fromHeader = req.headers.get('x-zuptos-token') || req.headers.get('authorization') || '';
    const fromQuery = new URL(req.url).searchParams.get('token') || '';
    authentic =
      safeEqual(fromHeader.replace(/^Bearer\s+/i, ''), sharedToken) || safeEqual(fromQuery, sharedToken);
  }
  if (!authentic) {
    return Response.json({ error: 'invalid_signature' }, { status: 401 });
  }

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return Response.json({ error: 'invalid_payload' }, { status: 400 });
  }
  if (!payload || typeof payload !== 'object') {
    return Response.json({ error: 'invalid_payload' }, { status: 400 });
  }

  const base44 = createClientFromRequest(req);
  const db = base44.asServiceRole.entities;

  const data = payload.data && typeof payload.data === 'object' ? payload.data : payload;
  const eventType = String(payload.event_type || payload.event || data.event || 'unknown');
  const externalEventId = String(
    payload.event_id || payload.id || data.event_id || data.transaction_id || data.order_id || ''
  );
  const transactionId = String(data.transaction_id || data.order_id || data.id || '');
  const email = String(
    data.customer?.email || data.buyer?.email || data.email || payload.customer?.email || ''
  ).toLowerCase();
  const externalProductId = String(
    data.product_id || data.product?.id || data.offer_id || payload.product_id || ''
  );
  const rawStatus = String(data.payment_status || data.status || payload.status || eventType).toLowerCase();
  const amount = Number(data.amount || data.total || 0);

  if (!externalEventId) {
    return Response.json({ error: 'missing_event_id' }, { status: 400 });
  }

  // Idempotência: o mesmo evento nunca é processado duas vezes
  const previous = await db.WebhookEvent.filter(
    { provider: 'zuptos', external_event_id: externalEventId },
    { sort: '-created_date', limit: 1 }
  );
  const existing = previous?.items?.[0];
  if (existing && ['processed', 'ignored'].includes(existing.processing_status)) {
    return Response.json({ ok: true, duplicate: true });
  }

  const eventRecord =
    existing ||
    (await db.WebhookEvent.create({
      provider: 'zuptos',
      external_event_id: externalEventId,
      event_type: eventType,
      processing_status: 'received',
      payload,
      received_at: new Date().toISOString()
    }));

  const finish = async (processing_status, note, extra = {}) => {
    await db.WebhookEvent.update(eventRecord.id, {
      processing_status,
      note,
      processed_at: new Date().toISOString()
    });
    return Response.json({ ok: processing_status !== 'failed', status: processing_status, note, ...extra });
  };

  const matched = (list) => list.some((t) => rawStatus.includes(t));
  let paymentStatus = 'pending';
  if (matched(APPROVED)) paymentStatus = 'approved';
  else if (matched(REFUNDED)) paymentStatus = 'refunded';
  else if (matched(CHARGEBACK)) paymentStatus = 'chargeback';
  else if (matched(CANCELED)) paymentStatus = 'canceled';
  else if (matched(REFUSED)) paymentStatus = 'refused';
  else if (matched(PENDING)) paymentStatus = 'pending';

  // Produto precisa existir no catálogo configurado pelo administrador
  let product = null;
  if (externalProductId) {
    const products = await db.Product.filter({ external_product_id: externalProductId }, { limit: 1 });
    product = products?.items?.[0] || null;
  }
  if (!product) {
    return finish('failed', 'Produto não encontrado no catálogo configurado.');
  }
  if (!email) {
    return finish('failed', 'Evento sem e-mail de comprador.');
  }

  const users = await db.User.filter({ email }, { limit: 1 });
  const appUser = users?.items?.[0] || null;

  const purchaseData = {
    user_id: appUser?.id || '',
    user_email: email,
    provider: 'zuptos',
    external_transaction_id: transactionId,
    product_id: product.id,
    external_product_id: externalProductId,
    payment_status: paymentStatus,
    amount: Number.isFinite(amount) ? amount : 0,
    purchased_at: new Date().toISOString()
  };

  const existingPurchase = transactionId
    ? (await db.Purchase.filter({ external_transaction_id: transactionId }, { limit: 1 }))?.items?.[0]
    : null;
  if (existingPurchase) {
    await db.Purchase.update(existingPurchase.id, purchaseData);
  } else {
    await db.Purchase.create(purchaseData);
  }

  if (!appUser) {
    return finish('ignored', 'Compra registrada; o professor ainda não criou conta com este e-mail.');
  }

  const accessStatus =
    paymentStatus === 'approved'
      ? 'ativo'
      : paymentStatus === 'pending'
        ? 'pendente'
        : paymentStatus === 'refunded'
          ? 'reembolsado'
          : paymentStatus === 'chargeback'
            ? 'suspenso'
            : paymentStatus === 'canceled'
              ? 'cancelado'
              : 'pendente';

  const accessFound = await db.UserAccess.filter({ user_id: appUser.id }, { limit: 1 });
  const access = accessFound?.items?.[0];
  const accessData = {
    user_id: appUser.id,
    user_email: appUser.email,
    user_name: appUser.full_name || '',
    status: accessStatus,
    provider: 'zuptos',
    note: `Webhook ${eventType} (${paymentStatus})`,
    activated_at: paymentStatus === 'approved' ? new Date().toISOString() : access?.activated_at || null
  };
  if (access) await db.UserAccess.update(access.id, accessData);
  else await db.UserAccess.create(accessData);

  const entFound = await db.Entitlement.filter({ user_id: appUser.id }, { limit: 1 });
  const ent = entFound?.items?.[0];
  if (paymentStatus === 'approved') {
    if (ent) {
      await db.Entitlement.update(ent.id, {
        product_id: product.id,
        access_status: 'ativo',
        granted_at: new Date().toISOString(),
        revoked_at: null
      });
    } else {
      await db.Entitlement.create({
        user_id: appUser.id,
        product_id: product.id,
        access_status: 'ativo',
        granted_at: new Date().toISOString()
      });
    }
  } else if (ent) {
    await db.Entitlement.update(ent.id, {
      access_status: 'revogado',
      revoked_at: new Date().toISOString()
    });
  }

  return finish('processed', `Evento aplicado: ${paymentStatus}`, { payment_status: paymentStatus });
}