import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const ALLOWED = ['pendente', 'ativo', 'suspenso', 'reembolsado', 'cancelado', 'bloqueado'];

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const targetUserId = typeof body.user_id === 'string' ? body.user_id : '';
    const status = typeof body.status === 'string' ? body.status : '';
    const note = typeof body.note === 'string' ? body.note : '';
    if (!targetUserId || !ALLOWED.includes(status)) {
      return Response.json({ error: 'Dados inválidos.' }, { status: 400 });
    }

    const target = await base44.asServiceRole.entities.User
      .get(targetUserId)
      .catch((e) => (e.status === 404 ? null : Promise.reject(e)));
    if (!target) return Response.json({ error: 'Usuário não encontrado.' }, { status: 404 });

    const found = await base44.asServiceRole.entities.UserAccess.filter(
      { user_id: targetUserId },
      { sort: '-created_date', limit: 1 }
    );
    const existing = found?.items?.[0];

    const data = {
      user_id: targetUserId,
      user_email: target.email,
      user_name: target.full_name || '',
      status,
      note,
      provider: existing?.provider || 'zuptos',
      activated_at: status === 'ativo' ? new Date().toISOString() : existing?.activated_at || null
    };

    const record = existing
      ? await base44.asServiceRole.entities.UserAccess.update(existing.id, data)
      : await base44.asServiceRole.entities.UserAccess.create(data);

    const entitlements = await base44.asServiceRole.entities.Entitlement.filter(
      { user_id: targetUserId },
      { sort: '-created_date', limit: 1 }
    );
    const ent = entitlements?.items?.[0];
    if (status === 'ativo') {
      if (ent) {
        await base44.asServiceRole.entities.Entitlement.update(ent.id, {
          access_status: 'ativo',
          granted_at: new Date().toISOString(),
          revoked_at: null
        });
      } else {
        await base44.asServiceRole.entities.Entitlement.create({
          user_id: targetUserId,
          product_id: 'manual',
          access_status: 'ativo',
          granted_at: new Date().toISOString()
        });
      }
    } else if (ent) {
      await base44.asServiceRole.entities.Entitlement.update(ent.id, {
        access_status: 'revogado',
        revoked_at: new Date().toISOString()
      });
    }

    return Response.json({ ok: true, access: record });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}