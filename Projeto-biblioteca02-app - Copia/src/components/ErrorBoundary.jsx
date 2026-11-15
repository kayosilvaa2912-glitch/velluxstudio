import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-6">
          <div className="card-soft max-w-md px-6 py-10 text-center">
            <p className="font-heading text-lg font-bold">Algo saiu do esperado</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Recarregue a página para continuar de onde parou. Seus materiais continuam salvos.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-white"
            >
              Recarregar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}