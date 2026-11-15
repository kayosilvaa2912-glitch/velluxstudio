import { Link } from 'react-router-dom';
import { Zap, CalendarDays, Tags, ClipboardCheck, RotateCcw, Heart } from 'lucide-react';

const items = [
  { label: 'Todos os materiais', to: '/biblioteca', icon: Zap },
  { label: 'Por Bimestre', to: '/bimestres', icon: CalendarDays },
  { label: 'Por Assunto', to: '/assuntos', icon: Tags },
  { label: 'Avaliações', to: '/biblioteca?cat=Avaliações', icon: ClipboardCheck },
  { label: 'Revisões', to: '/biblioteca?cat=Revisões', icon: RotateCcw },
  { label: 'Favoritos', to: '/favoritos', icon: Heart }
];

export default function QuickAccess() {
  return (
    <section className="card-soft p-5">
      <div className="mb-4 flex items-center gap-2">
        <Zap className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold">Acesso rápido</h2>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {items.map(({ label, to, icon: Icon }) => (
          <Link
            key={label}
            to={to}
            className="flex flex-col items-center gap-2 rounded-xl px-2 py-3 text-center transition-colors hover:bg-accent"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <Icon className="h-[18px] w-[18px]" />
            </span>
            <span className="text-[11px] font-medium leading-tight text-foreground/80">{label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}