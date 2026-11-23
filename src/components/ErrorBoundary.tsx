import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in UI component:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 my-6 bg-slate-900/90 border border-rose-500/50 rounded-3xl max-w-2xl mx-auto shadow-[0_0_35px_rgba(244,63,94,0.25)] text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center mb-4">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-white mb-2">Interfeysni yuklashda xatolik yuz berdi</h2>
          <p className="text-xs sm:text-sm text-slate-300 font-mono bg-black/40 p-3 rounded-xl border border-slate-800 mb-5 overflow-x-auto text-left">
            {this.state.error?.message || 'Nomaʼlum xatolik'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-slate-950 font-black text-xs hover:scale-105 transition-all inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Qayta yuklash</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
