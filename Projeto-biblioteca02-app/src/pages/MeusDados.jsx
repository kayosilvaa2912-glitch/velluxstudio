import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, ShieldCheck, KeyRound, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import useAccess, { STATUS_LABEL } from '@/hooks/useAccess';

export default function MeusDados() {
  const { user, logout } = useAuth();
  const { access, isAdmin, hasAccess, loading } = useAccess();
  const [name, setName] = useState(user?.full_name || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      // 1. Atualizar metadata do auth do Supabase
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: name.trim() }
      });
      if (authError) throw authError;

      // 2. Atualizar tabela pública profiles
      if (user?.id) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ full_name: name.trim(), updated_at: new Date().toISOString() })
          .eq('id', user.id);

        if (profileError) throw profileError;
      }

      setSaved(true);
    } catch (err) {
      alert(`Erro ao atualizar dados: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading text-2xl font-bold">Meus dados</h1>
        <p className="mt-1 text-sm text-muted-foreground">Suas informações de conta e situação de acesso.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <form onSubmit={save} className="card-soft space-y-4 p-5 lg:col-span-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Nome completo</label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">E-mail</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={user?.email || ''}
                readOnly
                className="h-11 w-full rounded-xl border border-border bg-secondary/60 pl-10 pr-3 text-sm text-muted-foreground"
              />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">O e-mail de acesso não pode ser alterado.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="flex items-center gap-2 rounded-xl bg-navy px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50"
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Salvar alterações
            </button>
            {saved && <span className="text-xs font-medium text-emerald-600">Dados atualizados.</span>}
          </div>

          <div className="border-t border-border/70 pt-4">
            <p className="mb-2 text-xs font-semibold text-muted-foreground">Segurança</p>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/forgot-password"
                className="flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-xs font-medium"
              >
                <KeyRound className="h-3.5 w-3.5" /> Alterar senha
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className="flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-xs font-medium"
              >
                <LogOut className="h-3.5 w-3.5" /> Encerrar sessão
              </button>
            </div>
          </div>
        </form>

        <div className="space-y-4">
          <div className="card-soft p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Situação do acesso</p>
            {loading ? (
              <div className="mt-3 h-6 w-24 animate-pulse rounded bg-secondary" />
            ) : (
              <>
                <p className="mt-2 font-heading text-lg font-bold">
                  {isAdmin ? 'Administrador' : STATUS_LABEL[access?.status] || 'Pendente de pagamento'}
                </p>
                <span
                  className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    hasAccess ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  <ShieldCheck className="h-3 w-3" />
                  {hasAccess ? 'Materiais liberados' : 'Materiais bloqueados'}
                </span>
                {access?.activated_at && (
                  <p className="mt-3 text-[11px] text-muted-foreground">
                    Liberado em {new Date(access.activated_at).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </>
            )}
          </div>

          <div className="card-soft p-5 text-xs leading-relaxed text-muted-foreground">
            <p className="mb-1 font-semibold text-foreground">Privacidade (LGPD)</p>
            Você pode solicitar a correção ou a exclusão dos seus dados pessoais a qualquer momento pelo suporte.{' '}
            <Link to="/privacidade" className="font-medium text-primary underline">
              Política de privacidade
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
