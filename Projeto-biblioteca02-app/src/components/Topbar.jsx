import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Bell, Menu, ChevronDown } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function Topbar({ onMenu }) {
  const { user } = useAuth();
  const [term, setTerm] = useState('');
  const navigate = useNavigate();
  const firstName = (user?.full_name || 'Professor(a)').split(' ').slice(0, 2).join(' ');

  const submit = (e) => {
    e.preventDefault();
    navigate(`/biblioteca${term.trim() ? `?q=${encodeURIComponent(term.trim())}` : ''}`);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
        <button onClick={onMenu} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary lg:hidden">
          <Menu className="h-5 w-5" />
        </button>

        <form onSubmit={submit} className="relative flex-1 max-w-xl">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Pesquisar por assunto, conteúdo ou habilidade da BNCC..."
            className="h-11 w-full rounded-full border border-border bg-card pl-10 pr-4 text-sm outline-none transition-shadow placeholder:text-muted-foreground/70 focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
          />
        </form>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <Link
            to="/favoritos"
            className="hidden h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary sm:flex"
          >
            <Bell className="h-[18px] w-[18px]" />
          </Link>
          <Link to="/meus-dados" className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2 hover:bg-secondary">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-xs font-semibold text-white">
              {firstName.slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden text-left leading-tight sm:block">
              <p className="text-[13px] font-semibold">Olá, {firstName}!</p>
              <p className="text-[11px] text-muted-foreground">Minha conta</p>
            </div>
            <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
          </Link>
        </div>
      </div>
    </header>
  );
}