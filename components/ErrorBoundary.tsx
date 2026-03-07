
import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Trash2, Home } from "lucide-react";

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  declare props: Readonly<ErrorBoundaryProps>;

  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleHardReset = () => {
    if (window.confirm("⚠️ ¿Estás seguro? Esto borrará TODOS los datos locales y reiniciará la app.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-slate-950 flex items-center justify-center p-6 z-[9999]">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-8 max-w-md w-full text-center shadow-2xl">
            {/* Icon */}
            <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-rose-500/20">
              <AlertTriangle size={40} className="text-rose-500" />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-black text-white uppercase italic tracking-tight mb-2">
              Algo ha fallado
            </h1>
            <p className="text-sm text-slate-400 mb-6">
              Se ha producido un error inesperado. Tus datos están a salvo.
            </p>

            {/* Error details - ALWAYS VISIBLE NOW */}
            <div className="mb-6 text-left w-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                MENSAJE DE ERROR (Copia esto):
              </p>
              <pre className="p-4 bg-slate-950 rounded-xl text-xs text-rose-400 font-mono overflow-auto max-h-60 border-2 border-rose-500/30 whitespace-pre-wrap break-all select-all">
                {this.state.error?.message || 'Error desconocido'}
                {'\n\nStack:\n'}
                {this.state.error?.stack || 'No stack trace'}
              </pre>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={this.handleReload}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg"
              >
                <RefreshCw size={16} />
                Recargar Aplicación
              </button>
              <button
                onClick={this.handleReset}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Home size={16} />
                Intentar Continuar
              </button>
              <button
                onClick={this.handleHardReset}
                className="w-full py-2 text-rose-400/60 hover:text-rose-400 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1"
              >
                <Trash2 size={12} />
                Borrar datos y reiniciar
              </button>
            </div>

            {/* Version */}
            <p className="mt-6 text-[9px] font-mono text-slate-700 uppercase tracking-widest">
              Merello Planner 2026 — Error Recovery
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}