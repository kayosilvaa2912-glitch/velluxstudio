import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

export const STATUS_LABEL = {
  pendente: 'Pendente de pagamento',
  ativo: 'Acesso ativo',
  suspenso: 'Suspenso',
  reembolsado: 'Reembolsado',
  cancelado: 'Cancelado',
  bloqueado: 'Bloqueado'
};

export default function useAccess() {
  const [state, setState] = useState({
    loading: true,
    user: null,
    access: null,
    isAdmin: false,
    hasAccess: false
  });

  useEffect(() => {
    let alive = true;
    (async () => {
      const res = await base44.functions.invoke('ensureMyAccess', {});
      const access = res?.data || null;
      const user = await base44.auth.me();
      if (!alive) return;
      const isAdmin = user?.role === 'admin' || access?.is_admin === true;
      setState({
        loading: false,
        user,
        access,
        isAdmin,
        hasAccess: isAdmin || access?.status === 'ativo'
      });
    })().catch(() => {
      if (alive) setState({ loading: false, user: null, access: null, isAdmin: false, hasAccess: false });
    });
    return () => {
      alive = false;
    };
  }, []);

  return state;
}