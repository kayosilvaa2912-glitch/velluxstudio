import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';

export const STATUS_LABEL = {
  pendente: 'Pendente de pagamento',
  ativo: 'Acesso ativo',
  suspenso: 'Suspenso',
  reembolsado: 'Reembolsado',
  cancelado: 'Cancelado',
  bloqueado: 'Bloqueado'
};

export default function useAccess() {
  const { user } = useAuth();
  const [state, setState] = useState({
    loading: true,
    user: null,
    access: null,
    isAdmin: false,
    hasAccess: false
  });

  useEffect(() => {
    let alive = true;

    async function loadAccess() {
      if (!user) {
        if (alive) {
          setState({ loading: false, user: null, access: null, isAdmin: false, hasAccess: false });
        }
        return;
      }

      const isAdmin = user.role === 'admin';

      // Administrador tem acesso irrestrito
      if (isAdmin) {
        if (alive) {
          setState({
            loading: false,
            user,
            access: { status: 'ativo', is_admin: true },
            isAdmin: true,
            hasAccess: true
          });
        }
        return;
      }

      // Buscar registro de acesso do usuário no Supabase
      const { data, error } = await supabase
        .from('user_access')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!alive) return;

      if (!error && data) {
        setState({
          loading: false,
          user,
          access: data,
          isAdmin: false,
          hasAccess: data.status === 'ativo'
        });
      } else {
        setState({
          loading: false,
          user,
          access: { status: 'pendente' },
          isAdmin: false,
          hasAccess: false
        });
      }
    }

    loadAccess();

    return () => {
      alive = false;
    };
  }, [user]);

  return state;
}
