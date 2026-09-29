import React from 'react';
import { AlertTriangle, RotateCcw, Home, WifiOff } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, isOffline: !navigator.onLine };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error, isOffline: !navigator.onLine };
  }

  componentDidCatch(error, errorInfo) {
    console.error('LivelihoodAI App Error Caught:', error, errorInfo);
  }

  componentDidMount() {
    window.addEventListener('online', this.handleNetworkChange);
    window.addEventListener('offline', this.handleNetworkChange);
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.handleNetworkChange);
    window.removeEventListener('offline', this.handleNetworkChange);
  }

  handleNetworkChange = () => {
    this.setState({ isOffline: !navigator.onLine });
  };

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const isNetworkIssue = this.state.isOffline || (this.state.error?.message && this.state.error.message.toLowerCase().includes('network'));

      return (
        <div className="min-h-[50vh] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-xl">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto ${
              isNetworkIssue ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'
            }`}>
              {isNetworkIssue ? <WifiOff className="w-7 h-7" /> : <AlertTriangle className="w-7 h-7" />}
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {isNetworkIssue ? 'Connection Interrupted' : 'Something went wrong'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-md mx-auto">
                {isNetworkIssue
                  ? 'We were unable to reach the server. Cached offline resources remain available.'
                  : this.state.error?.message || 'An unexpected interface error occurred. Please try reloading.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md transition transform active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Try Again</span>
              </button>

              <button
                onClick={this.handleReload}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition"
              >
                <span>Full Reload</span>
              </button>

              <button
                onClick={() => { window.location.href = '/'; }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition"
              >
                <Home className="w-4 h-4" />
                <span>Go to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
