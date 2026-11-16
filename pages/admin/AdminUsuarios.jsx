import { useEffect, useState } from 'react';
import { Search, Loader2, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { STATUS_LABEL } from '@/hooks/useAccess';

const STATUS_OPTIONS = ['pendente', 'ativo', 'suspenso', 'reembolsado', 'cancelado', 'bloqueado'];

const badge = {
  ativo: 'bg-emerald-50 text-emerald-700',
  pendente: 'bg-amber-50 text-amber-700',
  suspenso: 'bg-orange-50 text-orange-700',
  reembolsado: 'bg-violet-50 text-violet-700',
  cancelado: 'bg-secondary text-muted-foreground',
  bloqueado: 'bg-red-50 text-red-700'
};

export default function AdminUsuarios() {
  const [users, setUsers] = useState([]);
  const [accessMap, setAccessMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [term, setTerm] = useState('');
  const [savingId, setSavingId] = useState(null);

  const load = async () => {
    try {
      const [profilesRes, accessRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(200),
        supabase.from('user_access').select('*').limit(500)
      ]);

      if (profilesRes.error) throw profilesRes.error;
      setUsers(profilesRes.data || []);

      const map = {};
      (accessRes.data || []).forEach((a) => {
        if (!map[a.user_id]) map[a.user_id] = a;
      });
      setAccessMap(map);
    } catch (err) {
      console.warn('Erro ao carregar usuários:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const changeStatus = async (userRecord, status) => {
    setSavingId(userRecord.id);
    try {
      const existing = accessMap[userRecord.id];
      const payload = {
        user_id: userRecord.id,
        user_email: userRecord.email,
        user_name: userRecord.full_name || '',
        status,
        note: `Alteração manual pelo Admin (${status})`,
        activated_at: status === 'ativo' ? new Date().toISOString() : existing?.activated_at || null,
        updated_at: new Date().toISOString()
      };

      if (existing) {
        const { error } = await supabase.from('user_access').update(payload).eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('user_access').insert(payload);
        if (error) throw error;
      }

      await load();
    } catch (err) {
      alert(`Erro ao alterar status: ${err.message}`);
    } finally {
      setSavingId(null);
    }
  };

  const filtered = users.filter((u) => {
    const t = term.trim().toLowerCase();
    if (!t) return true;
    return (u.email || '').toLowerCase().includes(t) || (u.full_name || '').toLowerCase().includes(t);
  });

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Pesquisar usuário por nome ou e-mail"
          className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-xs outline-none focus:border-primary/40"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-soft px-6 py-16 text-center text-xs text-muted-foreground">
          Nenhum usuário encontrado.
        </div>
      ) : (
        <div className="card-soft overflow-hidden">
          <ul className="divide-y divide-border/70">
            {filtered.map((u) => {
              const access = accessMap[u.id];
              const status = u.role === 'admin' ? 'ativo' : access?.status || 'pendente';
              return (
                <li key={u.id} className="flex flex-wrap items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold">{u.full_name || 'Sem nome'}</p>
                      {u.role === 'admin' && (
                        <span className="flex items-center gap-1 rounded-full bg-navy px-2 py-0.5 text-[10px] font-semibold text-white">
                          <ShieldCheck className="h-2.5 w-2.5" /> Admin
                        </span>
                      )}
                    </div>
                    <p className="truncate text-[11px] text-muted-foreground">{u.email}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      Cadastro em {new Date(u.created_at).toLocaleDateString('pt-BR')}
                      {access?.note ? ` · ${access.note}` : ''}
                    </p>
                  </div>

                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${badge[status] || badge.pendente}`}>
                    {STATUS_LABEL[status] || status}
                  </span>

                  {u.role !== 'admin' && (
                    <div className="flex items-center gap-1.5">
                      {savingId === u.id && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />}
                      <select
                        value={access?.status || 'pendente'}
                        onChange={(e) => changeStatus(u, e.target.value)}
                        disabled={savingId === u.id}
                        className="h-9 rounded-lg border border-border bg-card px-2 text-[11px]"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABEL[s]}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        A alteração de status é aplicada diretamente no PostgreSQL e protegida por RLS: apenas administradores podem conceder ou revogar acesso.
      </p>
    </div>
  );
}
