import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function ErrorState({
  title = 'Failed to load content',
  message = 'An unexpected network error occurred while retrieving this information.',
  onRetry,
  className = ''
}) {
  return (
    <div
      role="alert"
      className={`w-full py-8 px-6 flex flex-col items-center justify-center text-center rounded-2xl bg-rose-500/5 border border-rose-500/20 text-rose-300 ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-3">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-rose-200 mb-1">
        {title}
      </h3>
      <p className="text-xs text-slate-600 dark:text-rose-300/80 max-w-md mx-auto leading-relaxed mb-4">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
}
