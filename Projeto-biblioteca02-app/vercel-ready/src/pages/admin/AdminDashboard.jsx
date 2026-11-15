import { useEffect, useState } from 'react';
import { Users, UserCheck, Clock, FolderOpen, Eye, FileText, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

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
    async function loadDashboard() {
      try {
        const [
          usersRes,
          activeRes,
          pendingRes,
          subjectsRes,
          materialsRes,
          viewsRes,
          recentUsersRes,
          logsRes
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('user_access').select('*', { count: 'exact', head: true }).eq('status', 'ativo'),
          supabase.from('user_access').select('*', { count: 'exact', head: true }).eq('status', 'pendente'),
          supabase.from('subjects').select('*', { count: 'exact', head: true }),
          supabase.from('materials').select('*', { count: 'exact', head: true }),
          supabase.from('access_logs').select('*', { count: 'exact', head: true }).eq('action', 'view'),
          supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(5),
          supabase.from('access_logs').select('resource_title').limit(200)
        ]);

        setStats({
          users: usersRes.count || 0,
          active: activeRes.count || 0,
          pending: pendingRes.count || 0,
          subjects: subjectsRes.count || 0,
          materials: materialsRes.count || 0,
          views: viewsRes.count || 0
        });

        setRecent(recentUsersRes.data || []);

        // Agregação dos materiais mais acessados
        const counts = {};
        (logsRes.data || []).forEach((l) => {
          if (l.resource_title) {
            counts[l.resource_title] = (counts[l.resource_title] || 0) + 1;
          }
        });

        const sortedTop = Object.entries(counts)
          .map(([resource_title, count]) => ({ resource_title, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        setTop(sortedTop);
      } catch (err) {
        console.warn('Erro ao carregar métricas:', err);
      }
    }

    loadDashboard();
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
                    {new Date(u.created_at).toLocaleDateString('pt-BR')}
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
