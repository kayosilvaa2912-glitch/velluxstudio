import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/components/AppLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
// Auth pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Mfa from '@/pages/Mfa';
// App pages
import Home from '@/pages/Home';
import Biblioteca from '@/pages/Biblioteca';
import Bimestres from '@/pages/Bimestres';
import Assuntos from '@/pages/Assuntos';
import Favoritos from '@/pages/Favoritos';
import Downloads from '@/pages/Downloads';
import MeusDados from '@/pages/MeusDados';
import Ajuda from '@/pages/Ajuda';
import Conteudo from '@/pages/Conteudo';
import Anotacoes from '@/pages/Anotacoes';
import Feedback from '@/pages/Feedback';
// Admin
import AdminLayout from '@/pages/admin/AdminLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminMateriais from '@/pages/admin/AdminMateriais';
import AdminUsuarios from '@/pages/admin/AdminUsuarios';
import AdminProdutos from '@/pages/admin/AdminProdutos';
import AdminFeedback from '@/pages/admin/AdminFeedback';
// Legal
import Privacidade from '@/pages/Privacidade';
import Termos from '@/pages/Termos';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

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
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/mfa" element={<Mfa />} />

      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/biblioteca" element={<Biblioteca />} />
          <Route path="/bimestres" element={<Bimestres />} />
          <Route path="/assuntos" element={<Assuntos />} />
          <Route path="/favoritos" element={<Favoritos />} />
          <Route path="/anotacoes" element={<Anotacoes />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/downloads" element={<Downloads />} />
          <Route path="/meus-dados" element={<MeusDados />} />
          <Route path="/ajuda" element={<Ajuda />} />
          <Route path="/conteudo/:id" element={<Conteudo />} />
          <Route path="/termos" element={<Termos />} />
          <Route path="/privacidade" element={<Privacidade />} />

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