import React, { createContext, useState, useContext, useEffect } from 'react';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const resetAuthState = () => {
    setUser(null);
    setProfile(null);
    setIsAuthenticated(false);
    setAuthError(null);
  };

  const checkUserAuth = async () => {
    if (!isSupabaseConfigured) {
      setAuthError({ type: 'supabase_config_missing' });
      setIsLoadingAuth(false);
      setAuthChecked(true);
      return;
    }

    try {
      setIsLoadingAuth(true);
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Erro ao recuperar sessão:', error);
        setAuthError({ type: 'auth_required' });
        setIsLoadingAuth(false);
        setAuthChecked(true);
        return;
      }

      if (!session?.user) {
        resetAuthState();
        setAuthError({ type: 'auth_required' });
        setIsLoadingAuth(false);
        setAuthChecked(true);
        return;
      }

      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Falha ao carregar perfil do usuário:', profileError);
      }

      if (!data) {
        resetAuthState();
        setAuthError({ type: 'user_not_registered' });
        setIsLoadingAuth(false);
        setAuthChecked(true);
        return;
      }

      setUser(session.user);
      setProfile(data);
      setIsAuthenticated(true);
      setAuthError(null);
    } catch (err) {
      console.error('Falha ao verificar autenticação:', err);
      setAuthError({ type: 'auth_required' });
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  };

  useEffect(() => {
    checkUserAuth();

    if (!isSupabaseConfigured) return undefined;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        checkUserAuth();
      } else {
        resetAuthState();
        setAuthError({ type: 'auth_required' });
        setIsLoadingAuth(false);
        setAuthChecked(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const logout = async (shouldRedirect = true) => {
    await supabase.auth.signOut();
    resetAuthState();
    setAuthError({ type: 'auth_required' });
    if (shouldRedirect) {
      window.location.href = '/login';
    }
  };

  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{
      user: profile ? { ...user, ...profile } : user,
      profile,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      authChecked,
      logout,
      navigateToLogin,
      checkUserAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
