import React from 'react';

export const NetworkStatus: React.FC = () => {
  return (
    <div
      role="status"
      aria-label="State Health Network Status: Operational"
      className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 shadow-xs"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
      </span>
      <span className="text-slate-600 dark:text-slate-300 font-medium">State Health Network:</span>
      <strong className="text-emerald-700 dark:text-emerald-400 font-semibold">Operational</strong>
    </div>
  );
};
