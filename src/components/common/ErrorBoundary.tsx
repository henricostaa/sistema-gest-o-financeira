import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught Error in ErrorBoundary:', error, errorInfo);
  }

  public handleReload = () => {
    localStorage.removeItem('finance_app_v1_user');
    window.location.href = window.location.origin;
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 text-white p-6 font-sans">
          <div className="max-w-md w-full rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertCircle className="h-7 w-7" />
            </div>

            <h2 className="text-xl font-bold text-white">Ops! Ocorreu um problema inesperado</h2>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Ocorreu uma falha temporária ao carregar este componente.
            </p>

            {this.state.error && (
              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900 p-3 text-left overflow-x-auto">
                <code className="text-[11px] font-mono text-rose-300">
                  {this.state.error.message || String(this.state.error)}
                </code>
              </div>
            )}

            <button
              onClick={this.handleReload}
              className="mt-6 w-full flex items-center justify-center space-x-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 transition cursor-pointer shadow-md"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Reiniciar Aplicação</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
