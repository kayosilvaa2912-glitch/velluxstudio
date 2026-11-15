import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const OWNER_EMAIL = 'kayosilvaa2912@gmail.com';
const LABELS = { elogio: 'Elogio', sugestao: 'Sugestão', problema: 'Problema', outro: 'Outro' };

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Sessão inválida.' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const feedbackId = typeof body.feedback_id === 'string' ? body.feedback_id : '';
    if (!feedbackId) return Response.json({ error: 'Feedback não informado.' }, { status: 400 });

    const feedback = await base44.asServiceRole.entities.Feedback
      .get(feedbackId)
      .catch((e) => (e.status === 404 ? null : Promise.reject(e)));
    if (!feedback) return Response.json({ error: 'Feedback não encontrado.' }, { status: 404 });
    if (feedback.user_id !== user.id) return Response.json({ error: 'Sem permissão.' }, { status: 403 });
    if (feedback.email_status === 'enviado') return Response.json({ sent: true, already: true });

    const label = LABELS[feedback.category] || 'Feedback';
    const message = String(feedback.message || '').slice(0, 8000);
    const author = feedback.user_name || user.full_name || user.email;
    const text = [
      'Novo feedback enviado pela plataforma Biblioteca do Professor.',
      '',
      `Tipo: ${label}`,
      `Professor(a): ${author}`,
      `E-mail: ${feedback.user_email || user.email}`,
      `Data: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`,
      '',
      'Mensagem:',
      message
    ].join('\n');

    // Limite simples de envios para evitar uso abusivo do e-mail.
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const recentSends = await base44.asServiceRole.entities.Feedback.count({
      user_id: user.id,
      email_status: 'enviado',
      created_date: { $gte: tenMinutesAgo }
    });
    if (recentSends >= 5) {
      return Response.json({ sent: false, limited: true });
    }

    let sent = true;
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: OWNER_EMAIL,
        subject: `[Biblioteca do Professor] ${label} de ${author}`,
        body: text,
        from_name: 'Biblioteca do Professor'
      });
    } catch (e) {
      sent = false;
    }

    await base44.asServiceRole.entities.Feedback.update(feedbackId, {
      email_status: sent ? 'enviado' : 'falhou'
    });

    return Response.json({ sent });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}