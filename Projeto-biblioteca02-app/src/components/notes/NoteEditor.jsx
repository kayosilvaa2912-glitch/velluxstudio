import { useState } from 'react';
import { Loader2, Save, X } from 'lucide-react';

export default function NoteEditor({ note, saving, onSave, onCancel }) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const canSave = content.trim().length > 0;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (canSave) onSave({ title: title.trim(), content: content.trim() });
      }}
      className="card-soft space-y-3 p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold">{note ? 'Editar anotação' : 'Nova anotação'}</p>
        <span className="text-[11px] text-muted-foreground">Sem limite de caracteres</span>
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título (opcional) — ex.: Aula de 14/11, 7º ano B"
        className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
      />

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={6}
        placeholder="Escreva o que precisa lembrar: combinados da turma, ideias de atividade, observações de aulas, recados..."
        className="min-h-[170px] w-full resize-y rounded-xl border border-border bg-background p-3 text-sm leading-relaxed outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] text-muted-foreground">{content.length} caracteres</p>
        <div className="flex gap-2">
          {note && (
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center gap-1.5 rounded-xl border border-border px-3.5 py-2 text-xs font-semibold text-muted-foreground"
            >
              <X className="h-3.5 w-3.5" /> Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={!canSave || saving}
            className="flex items-center gap-1.5 rounded-xl bg-navy px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            {note ? 'Salvar alterações' : 'Salvar anotação'}
          </button>
        </div>
      </div>
    </form>
  );
}