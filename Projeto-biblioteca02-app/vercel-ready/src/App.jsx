import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from '@/components/ErrorBoundary';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/components/AppLayout';

const PageNotFound = lazy(() => import('./lib/PageNotFound'));
const UserNotRegisteredError = lazy(() => import('@/components/UserNotRegisteredError'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const Mfa = lazy(() => import('@/pages/Mfa'));
const Home = lazy(() => import('@/pages/Home'));
const Biblioteca = lazy(() => import('@/pages/Biblioteca'));
const Bimestres = lazy(() => import('@/pages/Bimestres'));
const Assuntos = lazy(() => import('@/pages/Assuntos'));
const Favoritos = lazy(() => import('@/pages/Favoritos'));
const Downloads = lazy(() => import('@/pages/Downloads'));
const MeusDados = lazy(() => import('@/pages/MeusDados'));
const Ajuda = lazy(() => import('@/pages/Ajuda'));
const Conteudo = lazy(() => import('@/pages/Conteudo'));
const Anotacoes = lazy(() => import('@/pages/Anotacoes'));
const Agenda = lazy(() => import('@/pages/Agenda'));
const Feedback = lazy(() => import('@/pages/Feedback'));
const AdminLayout = lazy(() => import('@/pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminMateriais = lazy(() => import('@/pages/admin/AdminMateriais'));
const AdminUsuarios = lazy(() => import('@/pages/admin/AdminUsuarios'));
const AdminProdutos = lazy(() => import('@/pages/admin/AdminProdutos'));
const AdminFeedback = lazy(() => import('@/pages/admin/AdminFeedback'));
const Privacidade = lazy(() => import('@/pages/Privacidade'));
const Termos = lazy(() => import('@/pages/Termos'));

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    }
    if (authError.type === 'supabase_config_missing') {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-6">
          <div className="max-w-lg rounded-2xl border border-border bg-white px-6 py-8 text-center shadow-xl">
            <h1 className="text-lg font-bold text-foreground">Configuração do banco incompleta</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Cadastre as variáveis <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code>
              nas configurações do projeto Vercel e publique novamente.
            </p>
          </div>
        </div>
      );
    }
  }

  return (
    <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" /></div>}>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/mfa" element={<Mfa />} />
      <Route path="/termos" element={<Termos />} />
      <Route path="/privacidade" element={<Privacidade />} />

      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/biblioteca" element={<Biblioteca />} />
          <Route path="/bimestres" element={<Bimestres />} />
          <Route path="/assuntos" element={<Assuntos />} />
          <Route path="/favoritos" element={<Favoritos />} />
          <Route path="/anotacoes" element={<Anotacoes />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/downloads" element={<Downloads />} />
          <Route path="/meus-dados" element={<MeusDados />} />
          <Route path="/ajuda" element={<Ajuda />} />
          <Route path="/conteudo/:id" element={<Conteudo />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="materiais" element={<AdminMateriais />} />
            <Route path="usuarios" element={<AdminUsuarios />} />
            <Route path="produtos" element={<AdminProdutos />} />
            <Route path="feedback" element={<AdminFeedback />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
    </Suspense>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <ErrorBoundary>
            <AuthenticatedApp />
          </ErrorBoundary>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
