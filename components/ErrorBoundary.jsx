import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { failed: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Erro capturado pelo ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-6">
          <div className="card-soft max-w-lg px-6 py-8 text-center bg-white shadow-xl rounded-2xl border border-border">
            <p className="font-heading text-lg font-bold text-destructive">Algo saiu do esperado</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {this.state.error?.message || "Erro desconhecido na renderização do componente."}
            </p>
            {this.state.error?.stack && (
              <pre className="mt-3 p-3 text-[11px] text-left bg-slate-100 text-slate-800 rounded-lg overflow-x-auto max-h-48">
                {this.state.error.stack}
              </pre>
            )}
            <div className="mt-4 flex gap-2 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-white"
              >
                Recarregar
              </button>
              <button
                onClick={() => {
                  window.localStorage.clear();
                  window.location.href = '/login';
                }}
                className="rounded-lg bg-slate-200 px-4 py-2 text-xs font-semibold text-slate-700"
              >
                Voltar para o Login
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
