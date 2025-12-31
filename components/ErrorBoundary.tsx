import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full border-l-8 border-red-500">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                            <h1 className="text-2xl font-bold text-slate-800">Si è verificato un errore critico</h1>
                        </div>
                        <p className="text-slate-600 mb-4">
                            L'applicazione ha riscontrato un problema imprevisto. I dettagli qui sotto aiuteranno a risolvere il bug.
                        </p>
                        {this.state.error && (
                            <div className="bg-slate-100 p-4 rounded-lg overflow-auto max-h-64 mb-4 border border-slate-200">
                                <p className="font-mono text-xs text-red-600 font-bold mb-2 break-all">{this.state.error.toString()}</p>
                                <div className="font-mono text-[10px] text-slate-500 whitespace-pre-wrap">
                                    {this.state.errorInfo?.componentStack || "Stack trace non disponibile"}
                                </div>
                            </div>
                        )}
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    localStorage.clear();
                                    window.location.reload();
                                }}
                                className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-bold py-3 rounded-lg transition text-xs uppercase"
                            >
                                Reset Dati & Ricarica
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-lg transition text-xs uppercase"
                            >
                                Ricarica Pagina
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
