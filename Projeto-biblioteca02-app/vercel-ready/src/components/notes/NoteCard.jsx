import { Pencil, Trash2, CalendarDays } from 'lucide-react';

export default function NoteCard({ note, onEdit, onDelete }) {
  return (
    <article className="card-soft p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-heading text-sm font-bold">{note.title || 'Anotação'}</h3>
          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
            <CalendarDays className="h-3 w-3" />
            {new Date(note.created_date).toLocaleDateString('pt-BR')}
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            onClick={() => onEdit(note)}
            title="Editar anotação"
            className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-primary"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(note)}
            title="Excluir anotação"
            className="rounded-lg p-2 text-muted-foreground hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <p className="mt-3 whitespace-pre-wrap break-words text-[13px] leading-relaxed text-foreground/80">
        {note.content}
      </p>
    </article>
  );
}