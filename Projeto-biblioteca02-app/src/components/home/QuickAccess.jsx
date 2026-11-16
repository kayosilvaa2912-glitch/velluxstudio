import { Link } from 'react-router-dom';
import { Zap, CalendarDays, Tags, ClipboardCheck, RotateCcw, Heart } from 'lucide-react';

const items = [
  { label: 'Todos os materiais', to: '/biblioteca', icon: Zap },
  { label: 'Por Bimestre', to: '/bimestres', icon: CalendarDays },
  { label: 'Por Assunto', to: '/assuntos', icon: Tags },
  { label: 'Avaliações', to: '/biblioteca?cat=Avaliações', icon: ClipboardCheck },
  { label: 'Revisões', to: '/biblioteca?cat=Revisões', icon: RotateCcw },
  { label: 'Favoritos', to: '/favoritos', icon: Heart },
  { label: 'Agenda do professor', to: '/agenda', icon: CalendarDays }
];

const tones = ['bg-blue-50 text-blue-700', 'bg-emerald-50 text-emerald-700', 'bg-violet-50 text-violet-700', 'bg-amber-50 text-amber-700', 'bg-cyan-50 text-cyan-700', 'bg-rose-50 text-rose-700', 'bg-indigo-50 text-indigo-700'];

export default function QuickAccess() {
  return (
    <section className="card-soft p-5">
      <div className="mb-4 flex items-center gap-2">
        <Zap className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold">Acesso rápido</h2>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
        {items.map(({ label, to, icon: Icon }, index) => (
          <Link
            key={label}
            to={to}
            className="flex min-h-28 flex-col items-center justify-center gap-3 rounded-2xl border border-border/70 bg-card px-3 py-4 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tones[index]}`}>
              <Icon className="h-[18px] w-[18px]" />
            </span>
            <span className="text-xs font-semibold leading-tight text-foreground/80">{label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
