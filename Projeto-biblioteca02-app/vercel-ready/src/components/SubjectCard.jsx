import { Link } from 'react-router-dom';
import { FileText, ArrowUpRight } from 'lucide-react';
import { yearLabel, bimesterLabel } from '@/lib/constants';

export default function SubjectCard({ subject }) {
  return (
    <Link
      to={`/conteudo/${subject.id}`}
      className="card-soft group flex flex-col p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="mb-3 flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
        <span className="rounded-md bg-accent px-2 py-1 text-accent-foreground">{yearLabel(subject.school_year)}</span>
        <span className="rounded-md bg-secondary px-2 py-1">{bimesterLabel(subject.bimester)}</span>
        {subject.published === false && (
          <span className="rounded-md bg-amber-50 px-2 py-1 font-semibold text-amber-700">Rascunho</span>
        )}
      </div>
      <h3 className="font-heading text-base font-bold leading-snug group-hover:text-primary">{subject.title}</h3>
      {subject.description && (
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{subject.description}</p>
      )}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {(subject.categories || []).slice(0, 3).map((c) => (
          <span key={c} className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
            {c}
          </span>
        ))}
        {(subject.bncc_codes || []).slice(0, 2).map((code) => (
          <span key={code} className="rounded-full bg-primary/8 px-2 py-0.5 text-[10px] font-semibold text-primary">
            {code}
          </span>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5" /> Abrir conteúdo
        </span>
        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>
    </Link>
  );
}