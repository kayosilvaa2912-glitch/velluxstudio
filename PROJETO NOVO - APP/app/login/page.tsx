import LoginForm from "./login-form";

export default function LoginPage() {
  return <main className="auth-shell">
    <section className="auth-card">
      <div className="brand-mark">BP</div>
      <p className="eyebrow">LÍNGUA PORTUGUESA • 6º AO 9º ANO</p>
      <h1>Sua biblioteca pedagógica.</h1>
      <p className="muted">Entre para encontrar aulas, atividades e avaliações com mais rapidez.</p>
      <LoginForm />
      <p className="tiny muted">Acesso exclusivo para usuários autorizados.</p>
    </section>
  </main>;
}