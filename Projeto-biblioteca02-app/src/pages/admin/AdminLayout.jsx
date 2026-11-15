import { Navigate, NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, FolderOpen, Users, CreditCard, MessageSquare, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const tabs = [
  { to: '/admin', label: 'Visão geral', icon: LayoutDashboard, end: true },
  { to: '/admin/materiais', label: 'Materiais', icon: FolderOpen },
  { to: '/admin/usuarios', label: 'Usuários', icon: Users },
  { to: '/admin/produtos', label: 'Produtos e webhooks', icon: CreditCard },
  { to: '/admin/feedback', label: 'Feedback', icon: MessageSquare }
];

export default function AdminLayout() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  // Área administrativa: nenhuma rota, dado ou ação é renderizada para quem não é admin.
  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading text-2xl font-bold">Painel administrativo</h1>
        <p className="mt-1 text-sm text-muted-foreground">Gestão de acervo, usuários e liberação de acesso.</p>
      </div>

      <div className="no-scrollbar flex gap-1.5 overflow-x-auto rounded-xl border border-border bg-card p-1.5">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
                isActive ? 'bg-navy text-white' : 'text-muted-foreground hover:bg-secondary'
              }`
            }
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  );
}