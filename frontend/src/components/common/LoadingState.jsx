import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingState({ message = 'Loading content...', height = 'h-64', showSkeleton = true }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`w-full ${height} flex flex-col items-center justify-center p-6 text-center rounded-2xl bg-white/50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60`}
    >
      <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin mb-3" />
      <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 animate-pulse">
        {message}
      </p>

      {showSkeleton && (
        <div className="w-full max-w-sm mt-5 space-y-2 opacity-50">
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full w-5/6 mx-auto animate-pulse" />
        </div>
      )}
    </div>
  );
}
