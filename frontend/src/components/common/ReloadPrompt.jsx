import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, Download, X } from 'lucide-react';

export default function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      if (r) {
        console.log('Workbox ServiceWorker successfully registered.');
      }
    },
    onRegisterError(error) {
      console.warn('SW registration error:', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!offlineReady && !needRefresh) {
    return null;
  }

  return (
    <div
      role="alert"
      className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 max-w-sm bg-slate-900 border border-blue-500/40 text-white p-4 rounded-2xl shadow-2xl flex items-start gap-3 backdrop-blur-md animate-in slide-in-from-bottom duration-300"
    >
      <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
        {needRefresh ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
      </div>
      <div className="flex-1 text-xs">
        <p className="font-bold text-white text-sm">
          {needRefresh ? 'Update Available' : 'App Ready Offline'}
        </p>
        <p className="text-slate-300 mt-0.5">
          {needRefresh
            ? 'A new version of LivelihoodAI is available. Reload to update.'
            : 'LivelihoodAI is cached and ready for offline use.'}
        </p>
        <div className="flex items-center gap-2 mt-3">
          {needRefresh && (
            <button
              onClick={() => updateServiceWorker(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition"
            >
              Update Now
            </button>
          )}
          <button
            onClick={close}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
          >
            Dismiss
          </button>
        </div>
      </div>
      <button
        onClick={close}
        aria-label="Close notification"
        className="text-slate-400 hover:text-white p-1"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
