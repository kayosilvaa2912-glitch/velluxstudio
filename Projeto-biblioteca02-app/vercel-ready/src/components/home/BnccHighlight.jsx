import { Link } from 'react-router-dom';
import { Star, ArrowRight } from 'lucide-react';

export default function BnccHighlight({ skill }) {
  return (
    <section className="flex flex-col rounded-2xl border border-primary/15 bg-accent p-5">
      <div className="mb-3 flex items-center gap-2">
        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
        <h2 className="text-sm font-semibold text-accent-foreground">BNCC em foco</h2>
      </div>

      {skill ? (
        <>
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Habilidade em destaque</p>
          <p className="mt-1 font-heading text-lg font-bold text-navy">{skill.code}</p>
          <p className="mt-2 line-clamp-4 text-xs leading-relaxed text-foreground/70">{skill.description}</p>
          <Link
            to={`/biblioteca?bncc=${skill.code}`}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            Ver materiais desta habilidade <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </>
      ) : (
        <p className="text-xs leading-relaxed text-muted-foreground">
          As habilidades da BNCC serão exibidas aqui assim que forem cadastradas.
        </p>
      )}
    </section>
  );
}