import { NavLink } from 'react-router-dom';
import {
  BookOpen, LayoutGrid, CalendarDays, Tags, Heart, Download,
  User, HelpCircle, LogOut, GraduationCap, ShieldCheck, X, Library,
  StickyNote, MessageSquare
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { cn } from '@/lib/utils';

const nav = [
  { to: '/', label: 'Início', icon: LayoutGrid, end: true },
  { to: '/biblioteca', label: 'Minha Biblioteca', icon: Library },
  { to: '/bimestres', label: 'Por Bimestre', icon: CalendarDays },
  { to: '/assuntos', label: 'Por Assunto', icon: Tags },
  { to: '/favoritos', label: 'Favoritos', icon: Heart },
  { to: '/downloads', label: 'Histórico', icon: Download },
  { to: '/anotacoes', label: 'Minhas anotações', icon: StickyNote },
  { to: '/agenda', label: 'Agenda do professor', icon: CalendarDays },
  { to: '/feedback', label: 'Feedback', icon: MessageSquare },
  { to: '/meus-dados', label: 'Meus Dados', icon: User },
  { to: '/ajuda', label: 'Ajuda', icon: HelpCircle }
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-navy-deep/50 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-navy text-sidebar-foreground transition-transform duration-300 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center gap-3 px-6 pt-7 pb-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <BookOpen className="h-6 w-6" strokeWidth={2} />
          </div>
          <div className="leading-tight">
            <p className="font-heading text-[15px] font-bold text-white">Biblioteca do Professor</p>
            <p className="text-[11px] text-white/50">Língua Portuguesa · 6º ao 9º ano</p>
          </div>
          <button onClick={onClose} className="ml-auto rounded-lg p-1.5 text-white/60 hover:bg-white/10 lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 no-scrollbar">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                    : 'text-white/70 hover:bg-white/8 hover:text-white'
                )
              }
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
              {label}
            </NavLink>
          ))}

          {isAdmin && (
            <>
              <p className="px-3.5 pt-5 pb-2 text-[11px] font-semibold uppercase tracking-wider text-white/35">
                Administração
              </p>
              <NavLink
                to="/admin"
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors',
                    isActive ? 'bg-primary text-white' : 'text-white/70 hover:bg-white/8 hover:text-white'
                  )
                }
              >
                <ShieldCheck className="h-[18px] w-[18px]" />
                Painel Admin
              </NavLink>
            </>
          )}
        </nav>

        <div className="px-3 pb-5">
          <div className="mb-3 rounded-2xl bg-white/6 p-4 ring-1 ring-white/10">
            <GraduationCap className="mb-2 h-5 w-5 text-primary" />
            <p className="text-xs leading-relaxed text-white/70">
              Conteúdo de qualidade para suas aulas!
            </p>
          </div>
          <button
            onClick={() => logout()}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/8 hover:text-white"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Sair
          </button>
        </div>
      </aside>
    </>
  );
}
