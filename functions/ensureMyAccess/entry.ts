import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    if (user.role === 'admin') {
      return Response.json({ is_admin: true, status: 'ativo', user_id: user.id, user_email: user.email });
    }

    const existing = await base44.asServiceRole.entities.UserAccess.filter(
      { user_id: user.id },
      { sort: '-created_date', limit: 1 }
    );
    const items = existing?.items || [];
    if (items.length) {
      return Response.json({ ...items[0], is_admin: false });
    }

    // Compra aprovada registrada pelo webhook antes de o professor criar a conta
    const email = (user.email || '').toLowerCase();
    const purchases = await base44.asServiceRole.entities.Purchase.filter(
      { user_email: email, payment_status: 'approved' },
      { sort: '-created_date', limit: 1 }
    );
    const approved = purchases?.items?.[0];
    const status = approved ? 'ativo' : 'pendente';

    const created = await base44.asServiceRole.entities.UserAccess.create({
      user_id: user.id,
      user_email: user.email,
      user_name: user.full_name || '',
      status,
      provider: approved?.provider || 'zuptos',
      activated_at: approved ? new Date().toISOString() : null
    });

    if (approved) {
      await base44.asServiceRole.entities.Purchase.update(approved.id, { user_id: user.id });
      await base44.asServiceRole.entities.Entitlement.create({
        user_id: user.id,
        product_id: approved.product_id || approved.external_product_id || '',
        access_status: 'ativo',
        granted_at: new Date().toISOString()
      });
    }

    return Response.json({ ...created, is_admin: false });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}