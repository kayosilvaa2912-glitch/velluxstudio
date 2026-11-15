import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, Loader2, MessageSquare } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import FeedbackForm, { CATEGORIES } from '@/components/feedback/FeedbackForm';

const STATUS_LABEL = { novo: 'Recebido', lido: 'Lido', arquivado: 'Arquivado' };

export default function Feedback() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState(null);

  const load = useCallback(async () => {
    if (!user?.id) return;
    const page = await base44.entities.Feedback.filter(
      { user_id: user.id },
      { sort: '-created_date', limit: 20 }
    );
    setItems(page.items || []);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    load().catch(() => setLoading(false));
  }, [load]);

  const submit = async ({ category, message }) => {
    setSending(true);
    setNotice(null);
    try {
      const created = await base44.entities.Feedback.create({
        user_id: user.id,
        user_name: user.full_name || '',
        user_email: user.email || '',
        category,
        message
      });
      const res = await base44.functions.invoke('notifyFeedback', { feedback_id: created.id });
      setNotice(
        res?.data?.sent
          ? { ok: true, text: 'Feedback enviado! Obrigado por ajudar a melhorar o app.' }
          : {
              ok: false,
              text: 'Sua mensagem foi registrada, mas o e-mail automático não pôde ser enviado agora. Ela continua disponível para o responsável pela plataforma.'
            }
      );
      await load();
    } catch {
      setNotice({ ok: false, text: 'Não foi possível enviar seu feedback. Tente novamente.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading text-2xl font-bold">Feedback</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sua mensagem vai direto para o responsável pela plataforma. Diga o que está funcionando, o que pode melhorar e
          o que gostaria de ver por aqui.
        </p>
      </div>

      {notice && (
        <div
          className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-xs ${
            notice.ok
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-amber-200 bg-amber-50 text-amber-700'
          }`}
        >
          {notice.ok ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <span>{notice.text}</span>
        </div>
      )}

      <FeedbackForm sending={sending} onSubmit={submit} />

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Meus envios</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : items.length === 0 ? (
          <div className="card-soft px-6 py-12 text-center">
            <p className="text-sm font-medium">Você ainda não enviou nenhum feedback</p>
            <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
              Use o formulário acima para falar com a gente.
            </p>
          </div>
        ) : (
          <div className="card-soft divide-y divide-border/70">
            {items.map((item) => (
              <div key={item.id} className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-semibold">
                    {CATEGORIES.find((c) => c.value === item.category)?.label || 'Feedback'}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span>{STATUS_LABEL[item.status] || 'Recebido'}</span>
                    <span>·</span>
                    <span>{new Date(item.created_date).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
                <p className="mt-1.5 whitespace-pre-wrap break-words text-[13px] leading-relaxed text-foreground/80">
                  {item.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}