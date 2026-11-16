import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const palettes = {
  blue: 'bg-[#2563EB] shadow-[#2563EB]/25',
  green: 'bg-[#10B981] shadow-[#10B981]/25',
  purple: 'bg-[#8B5CF6] shadow-[#8B5CF6]/25',
  orange: 'bg-[#F59E0B] shadow-[#F59E0B]/25'
};

export default function YearCard({ year, label, color = 'blue', materials = 0 }) {
  return (
    <Link
      to={`/bimestres?ano=${year}`}
      className={`group relative flex min-h-32 items-center justify-between overflow-hidden rounded-2xl ${palettes[color]} px-6 py-6 text-white shadow-lg transition-transform duration-300 hover:-translate-y-0.5`}
    >
      <div className="absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/10" />
      <div className="relative">
        <p className="text-[11px] font-medium uppercase tracking-wider text-white/75">Anos Finais</p>
        <p className="font-heading text-2xl font-bold leading-tight">{label}</p>
        <p className="mt-1 text-[12px] text-white/80">{materials} conteúdos</p>
      </div>
      <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/20 transition-transform group-hover:translate-x-0.5">
        <ArrowRight className="h-4 w-4" />
      </div>
    </Link>
  );
}
