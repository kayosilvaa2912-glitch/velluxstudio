import { useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

export const CATEGORIES = [
  { value: 'sugestao', label: 'Sugestão de melhoria' },
  { value: 'elogio', label: 'Elogio' },
  { value: 'problema', label: 'Problema ou erro' },
  { value: 'outro', label: 'Outro assunto' }
];

export default function FeedbackForm({ sending, onSubmit }) {
  const [category, setCategory] = useState('sugestao');
  const [message, setMessage] = useState('');

  const canSend = message.trim().length > 0;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSend) return;
        onSubmit({ category, message: message.trim() });
        setMessage('');
      }}
      className="card-soft space-y-4 p-5"
    >
      <div>
        <p className="text-sm font-semibold">Escreva sua mensagem</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Conte o que está funcionando, o que pode melhorar ou algo novo que gostaria de ver no app.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => setCategory(c.value)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
              category === c.value ? 'bg-navy text-white' : 'border border-border text-muted-foreground hover:bg-secondary'
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={6}
        placeholder="Sua opinião, sugestão ou relato..."
        className="min-h-[160px] w-full resize-y rounded-xl border border-border bg-background p-3 text-sm leading-relaxed outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] text-muted-foreground">{message.length} caracteres</p>
        <button
          type="submit"
          disabled={!canSend || sending}
          className="flex items-center gap-1.5 rounded-xl bg-navy px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50"
        >
          {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          Enviar feedback
        </button>
      </div>
    </form>
  );
}