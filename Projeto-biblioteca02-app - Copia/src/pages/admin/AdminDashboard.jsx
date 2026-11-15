import { useEffect, useState } from 'react';
import { Users, UserCheck, Clock, FolderOpen, Eye, FileText, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const cards = [
  { key: 'users', label: 'Usuários cadastrados', icon: Users, tone: 'bg-blue-50 text-blue-600' },
  { key: 'active', label: 'Com acesso ativo', icon: UserCheck, tone: 'bg-emerald-50 text-emerald-600' },
  { key: 'pending', label: 'Pendentes de pagamento', icon: Clock, tone: 'bg-amber-50 text-amber-600' },
  { key: 'subjects', label: 'Conteúdos cadastrados', icon: FolderOpen, tone: 'bg-violet-50 text-violet-600' },
  { key: 'materials', label: 'Arquivos no acervo', icon: FileText, tone: 'bg-sky-50 text-sky-600' },
  { key: 'views', label: 'Materiais visualizados', icon: Eye, tone: 'bg-slate-100 text-slate-600' }
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [top, setTop] = useState([]);

  useEffect(() => {
    (async () => {
      const [users, active, pending, subjects, materials, views] = await Promise.all([
        base44.entities.User.list('-created_date', 200),
        base44.entities.UserAccess.count({ status: 'ativo' }),
        base44.entities.UserAccess.count({ status: 'pendente' }),
        base44.entities.Subject.count({}),
        base44.entities.Material.count({}),
        base44.entities.AccessLog.count({ action: 'view' })
      ]);
      setStats({
        users: users.length,
        active,
        pending,
        subjects,
        materials,
        views
      });
      setRecent(users.slice(0, 5));

      try {
        const agg = await base44.entities.AccessLog.aggregate({ query: {}, groupBy: 'resource_title' });
        const rows = (agg.rows || []).filter((r) => r.resource_title);
        setTop(rows.sort((a, b) => (b.count || 0) - (a.count || 0)).slice(0, 5));
      } catch {
        setTop([]);
      }
    })().catch(() => {});
  }, []);

  if (!stats) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {cards.map(({ key, label, icon: Icon, tone }) => (
          <div key={key} className="card-soft flex items-center gap-3 p-4">
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
              <Icon className="h-4 w-4" />
            </span>
            <div>
              <p className="font-heading text-xl font-bold leading-none">{stats[key]}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card-soft p-5">
          <p className="mb-3 text-sm font-semibold">Últimos cadastros</p>
          {recent.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">Nenhum usuário cadastrado ainda.</p>
          ) : (
            <ul className="divide-y divide-border/70">
              {recent.map((u) => (
                <li key={u.id} className="flex items-center justify-between gap-2 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium">{u.full_name || 'Sem nome'}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{u.email}</p>
                  </div>
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    {new Date(u.created_date).toLocaleDateString('pt-BR')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card-soft p-5">
          <p className="mb-3 text-sm font-semibold">Materiais mais acessados</p>
          {top.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">Sem registros de acesso ainda.</p>
          ) : (
            <ul className="space-y-2">
              {top.map((t) => (
                <li key={t.resource_title} className="flex items-center justify-between gap-2">
                  <span className="min-w-0 truncate text-[13px]">{t.resource_title}</span>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold">{t.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}