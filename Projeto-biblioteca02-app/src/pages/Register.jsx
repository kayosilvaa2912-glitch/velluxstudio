import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Lock, User, Loader2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: "user"
          }
        }
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data?.session) {
        navigate("/");
      } else {
        setSuccess(true);
      }
    } catch (err) {
      console.error("Erro no cadastro:", err);
      setError(err.message || "Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      icon={UserPlus}
      title="Criar sua conta"
      subtitle="Junte-se à Biblioteca do Professor"
      footer={
        <>
          Já possui uma conta?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Fazer login
          </Link>
        </>
      }
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      {success ? (
        <div className="p-4 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm">
          <p className="font-semibold mb-1">Conta criada com sucesso!</p>
          <p>Se o seu Supabase estiver com confirmação de e-mail ativada, verifique sua caixa de entrada para confirmar seu cadastro.</p>
          <div className="mt-4">
            <Button className="w-full" onClick={() => navigate("/login")}>
              Ir para o Login
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nome Completo</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="fullName"
                type="text"
                autoComplete="name"
                autoFocus
                placeholder="Prof. João Silva"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="pl-10 h-12"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="Crie uma senha segura"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-12"
                required
              />
            </div>
          </div>

          <label className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <input type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} required className="mt-0.5 h-4 w-4 accent-primary" />
            <span>Li e aceito os <Link to="/termos" target="_blank" className="font-medium text-primary underline">Termos de uso</Link> e a <Link to="/privacidade" target="_blank" className="font-medium text-primary underline">Política de privacidade</Link>.</span>
          </label>

          <Button type="submit" className="w-full h-12 font-medium" disabled={loading || !acceptedTerms}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Criando conta...
              </>
            ) : (
              "Cadastrar"
            )}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
