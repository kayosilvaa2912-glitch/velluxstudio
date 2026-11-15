import { Link } from 'react-router-dom';
import { ArrowRight, Eye } from 'lucide-react';

export default function RecentMaterials({ items = [] }) {
  return (
    <section className="card-soft flex flex-col p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Materiais recentes</h2>
        <Link to="/biblioteca" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
          Ver todos <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center">
          <p className="text-sm font-medium">Nenhum material acessado ainda</p>
          <p className="max-w-xs text-xs text-muted-foreground">
            Explore os anos escolares e abra um conteúdo para vê-lo aqui.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border/70">
          {items.map((item) => (
            <li key={item.id || item.title} className="flex items-center gap-3 py-3">
              <span className={`rounded-lg px-2 py-1 text-[10px] font-bold uppercase ${item.kind === 'PDF' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                {item.kind}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium">{item.title}</p>
                <p className="truncate text-[11px] text-muted-foreground">{item.meta}</p>
              </div>
              <Link to={item.to || '/biblioteca'} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-primary">
                <Eye className="h-4 w-4" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}