import { ConvexProvider, ConvexReactClient } from "convex/react";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

const CONVEX_URL = "https://confident-schnauzer-144.convex.cloud";
const CONVEX_SITE_URL = "https://confident-schnauzer-144.convex.site";

const convex = new ConvexReactClient(CONVEX_URL, { 
  unsavedChangesWarning: false
});

// Error Boundary
class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-[#0a0a0a] z-[100] flex items-center justify-center flex-col gap-4 text-center p-4">
          <div className="text-red-400 text-lg font-bold">Error al cargar Aurora Chat</div>
          <p className="text-gray-400 text-sm max-w-xs">{this.state.error?.message || 'Ha ocurrido un error desconocido'}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 w-full px-4 py-3 bg-white text-black rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-colors"
          >
            Reintentar
          </button>
          <button 
            onClick={() => {
              localStorage.clear();
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(registrations => {
                  for (let registration of registrations) registration.unregister();
                });
              }
              indexedDB.deleteDatabase('aurora_db');
              window.location.href = window.location.origin + '?reset=' + Date.now();
            }}
            className="w-full px-4 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-colors"
          >
            Limpiar Todo y Reiniciar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ConvexProvider client={convex}>
        <App />
      </ConvexProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
