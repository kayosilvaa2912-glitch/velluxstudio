import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const encoder = new TextEncoder();
const response = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

function equal(a: string, b: string) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

async function verifySignature(body: string, signature: string, secret: string) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signed = new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(body)));
  const expected = [...signed].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  return equal(signature.trim().replace(/^sha256=/i, '').toLowerCase(), expected);
}

function statusFrom(raw: string) {
  const status = raw.toLowerCase();
  if (['approved', 'paid', 'aprovado', 'pago', 'completed', 'succeeded'].some((v) => status.includes(v))) return 'ativo';
  if (['refunded', 'reembolsado', 'refund'].some((v) => status.includes(v))) return 'reembolsado';
  if (['chargeback', 'disputed', 'contestado'].some((v) => status.includes(v))) return 'suspenso';
  if (['canceled', 'cancelled', 'cancelado'].some((v) => status.includes(v))) return 'cancelado';
  if (['refused', 'declined', 'recusado', 'failed', 'falhou'].some((v) => status.includes(v))) return 'bloqueado';
  return 'pendente';
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return response({ error: 'method_not_allowed' }, 405);
  const contentLength = Number(req.headers.get('content-length') || 0);
  if (contentLength > 1_000_000) return response({ error: 'payload_too_large' }, 413);
  const raw = await req.text();
  if (encoder.encode(raw).length > 1_000_000) return response({ error: 'payload_too_large' }, 413);

  const secret = Deno.env.get('ZUPTOS_WEBHOOK_SECRET');
  const signature = req.headers.get(Deno.env.get('ZUPTOS_SIGNATURE_HEADER') || 'x-zuptos-signature') || '';
  if (!secret || !signature || !(await verifySignature(raw, signature, secret))) {
    return response({ error: 'invalid_signature' }, 401);
  }

  let payload: Record<string, any>;
  try { payload = JSON.parse(raw); } catch { return response({ error: 'invalid_payload' }, 400); }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return response({ error: 'invalid_payload' }, 400);
  const data = payload.data && typeof payload.data === 'object' ? payload.data : payload;
  const eventId = String(payload.event_id || payload.id || data.event_id || data.transaction_id || data.order_id || '').trim();
  const eventType = String(payload.event_type || payload.event || data.event || 'unknown').slice(0, 120);
  const productId = String(data.product_id || data.product?.id || data.offer_id || payload.product_id || '').trim();
  const email = String(data.customer?.email || data.buyer?.email || data.email || payload.customer?.email || '').trim().toLowerCase();
  const rawStatus = String(data.payment_status || data.status || payload.status || eventType).slice(0, 120);
  if (!eventId || eventId.length > 200 || !productId || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return response({ error: 'missing_or_invalid_event_fields' }, 400);

  const url = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceKey) return response({ error: 'webhook_not_configured' }, 503);
  const db = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

  const safePayload = { event_type: eventType, payment_status: rawStatus, product_id: productId, transaction_id: String(data.transaction_id || data.order_id || '').slice(0, 200) };
  const { data: event, error: eventError } = await db.from('webhook_events').insert({
    provider: 'zuptos', external_event_id: eventId, event_type: eventType,
    processing_status: 'received', payload: safePayload, received_at: new Date().toISOString()
  }).select('id').single();
  if (eventError?.code === '23505') return response({ ok: true, duplicate: true });
  if (eventError || !event) return response({ error: 'could_not_record_event' }, 500);

  const finish = async (processing_status: string, note: string, status = 200) => {
    await db.from('webhook_events').update({ processing_status, note, processed_at: new Date().toISOString() }).eq('id', event.id);
    return response({ ok: status < 500, processing_status, note }, status);
  };

  try {
    const { data: product, error: productError } = await db.from('products').select('id,active').eq('external_product_id', productId).maybeSingle();
    if (productError) return await finish('failed', 'Falha ao validar o produto.', 500);
    if (!product || product.active === false) return await finish('failed', 'Produto ausente ou inativo.', 400);

    const { data: profile, error: profileError } = await db.from('profiles').select('id,full_name,email').eq('email', email).maybeSingle();
    if (profileError) return await finish('failed', 'Falha ao localizar a conta do comprador.', 500);
    if (!profile) return await finish('ignored', 'Compra recebida; conta ainda não cadastrada com este e-mail.');

    const accessStatus = statusFrom(rawStatus);
    const { data: currentAccess, error: accessReadError } = await db.from('user_access').select('id,activated_at').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (accessReadError) return await finish('failed', 'Falha ao consultar o acesso da conta.', 500);
    const accessPayload = {
      user_id: profile.id, user_email: email, user_name: profile.full_name || '', status: accessStatus,
      provider: 'zuptos', note: `Webhook ${eventType} (${accessStatus})`,
      activated_at: accessStatus === 'ativo' ? new Date().toISOString() : currentAccess?.activated_at || null
    };
    const write = currentAccess
      ? await db.from('user_access').update(accessPayload).eq('id', currentAccess.id)
      : await db.from('user_access').insert(accessPayload);
    if (write.error) return await finish('failed', 'Falha ao atualizar a autorização da conta.', 500);
    return await finish('processed', `Acesso atualizado: ${accessStatus}.`);
  } catch {
    return await finish('failed', 'Erro interno ao processar evento.', 500);
  }
});
