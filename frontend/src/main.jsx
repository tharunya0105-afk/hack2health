import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[NeuroBridge ErrorBoundary Caught]:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-slate-900 border border-rose-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <h2 className="text-xl font-bold text-rose-400">Something went wrong</h2>
            <p className="text-xs text-slate-300 font-mono bg-slate-950 p-3 rounded-lg border border-slate-800 break-words">
              {this.state.error?.message || String(this.state.error)}
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl"
              >
                Reload Page
              </button>
              <button
                onClick={() => {
                  try { localStorage.clear(); } catch(e) {}
                  window.location.reload();
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Clear Cache & Reload
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)

