import React from 'react';

export const PrototypeBanner: React.FC = () => {
  return (
    <aside aria-label="Prototype Notice" className="w-full bg-amber-500/10 dark:bg-amber-950/40 border-b border-amber-300/40 dark:border-amber-700/40 px-4 py-1.5 text-center">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 flex-wrap">
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50">
          SIH PROTOTYPE
        </span>
        <p className="text-xs font-medium text-amber-900 dark:text-amber-200/90 tracking-tight">
          Demonstration system — Not an official government portal
        </p>
      </div>
    </aside>
  );
};
