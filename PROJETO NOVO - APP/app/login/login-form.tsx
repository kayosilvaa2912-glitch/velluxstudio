 "use client";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setMessage("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setMessage("Não foi possível entrar. Confira seus dados ou solicite suporte."); setBusy(false); return; }
    window.location.href = "/painel";
  }

  return <form className="form" onSubmit={submit}>
    <label>E-mail<input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="voce@exemplo.com" /></label>
    <label>Senha<input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Sua senha" /></label>
    <button disabled={busy}>{busy ? "Entrando..." : "Entrar na biblioteca"}</button>
    {message && <p className="error">{message}</p>}
  </form>;
}