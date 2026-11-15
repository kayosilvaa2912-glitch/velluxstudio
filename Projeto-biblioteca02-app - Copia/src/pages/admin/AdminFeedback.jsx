import { useCallback, useEffect, useState } from 'react';
import { Loader2, Check, Trash2, MailCheck, MailX } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const CATEGORY_LABEL = {
  elogio: 'Elogio',
  sugestao: 'Sugestão',
  problema: 'Problema',
  outro: 'Outro'
};

const STATUS_LABEL = { novo: 'Novo', lido: 'Lido', arquivado: 'Arquivado' };

export default function AdminFeedback() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const page = await base44.entities.Feedback.filter({}, { sort: '-created_date', limit: 100 });
    setItems(page.items || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load().catch(() => setLoading(false));
  }, [load]);

  const markRead = async (item) => {
    await base44.entities.Feedback.update(item.id, { status: 'lido' });
    await load();
  };

  const remove = async (item) => {
    if (!window.confirm('Excluir este feedback?')) return;
    await base44.entities.Feedback.delete(item.id);
    await load();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card-soft p-5">
        <p className="text-sm font-semibold">Feedback dos professores</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Tudo o que for enviado em “Feedback” aparece aqui. Cada novo envio também é encaminhado por e-mail para o
          responsável pela plataforma.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="card-soft px-6 py-14 text-center">
          <p className="text-sm font-medium">Nenhum feedback recebido ainda</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <article key={item.id} className="card-soft p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{CATEGORY_LABEL[item.category] || 'Feedback'}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {item.user_name || 'Professor'} · {item.user_email || '—'} ·{' '}
                    {new Date(item.created_date).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
                    {STATUS_LABEL[item.status] || 'Novo'}
                  </span>
                  <span
                    className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      item.email_status === 'enviado'
                        ? 'bg-emerald-50 text-emerald-600'
                        : item.email_status === 'falhou'
                          ? 'bg-red-50 text-red-600'
                          : 'bg-amber-50 text-amber-600'
                    }`}
                  >
                    {item.email_status === 'falhou' ? <MailX className="h-3 w-3" /> : <MailCheck className="h-3 w-3" />}
                    {item.email_status === 'enviado' ? 'E-mail enviado' : item.email_status === 'falhou' ? 'E-mail falhou' : 'E-mail pendente'}
                  </span>
                </div>
              </div>

              <p className="mt-3 whitespace-pre-wrap break-words text-[13px] leading-relaxed text-foreground/80">
                {item.message}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {item.status !== 'lido' && (
                  <button
                    onClick={() => markRead(item)}
                    className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold"
                  >
                    <Check className="h-3.5 w-3.5" /> Marcar como lido
                  </button>
                )}
                <button
                  onClick={() => remove(item)}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Excluir
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}