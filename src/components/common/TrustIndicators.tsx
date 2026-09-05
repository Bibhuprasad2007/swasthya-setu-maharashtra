import React from 'react';
import { ShieldCheck, Lock, Network } from 'lucide-react';

export const TrustIndicators: React.FC = () => {
  const items = [
    {
      icon: <Lock className="w-3.5 h-3.5 text-brand-blue-600 dark:text-brand-blue-400" />,
      label: 'Consent-based access',
    },
    {
      icon: <ShieldCheck className="w-3.5 h-3.5 text-brand-teal-600 dark:text-brand-teal-400" />,
      label: 'Secure health records',
    },
    {
      icon: <Network className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />,
      label: 'Connected facilities',
    },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 pt-2">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-brand-dark-text font-medium bg-white/70 dark:bg-brand-dark-surface/80 px-3 py-1 rounded-full border border-slate-200/80 dark:border-brand-dark-border/80 shadow-xs"
        >
          {item.icon}
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
};
