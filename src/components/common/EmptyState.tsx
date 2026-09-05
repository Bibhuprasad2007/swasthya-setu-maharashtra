import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionText?: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = Inbox,
  actionText,
  actionLabel,
  onAction,
  compact = false
}) => {
  const label = actionText || actionLabel;
  return (
    <div className={`flex flex-col items-center justify-center text-center rounded-xl border border-dashed border-slate-200 dark:border-brand-dark-border bg-slate-50/50 dark:bg-brand-dark-surface/40 ${compact ? 'p-6' : 'p-10'}`}>
      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-brand-dark-elevated text-slate-400 dark:text-brand-dark-muted flex items-center justify-center mb-3">
        <Icon className="w-6 h-6" aria-hidden="true" />
      </div>
      <h4 className="text-sm font-semibold text-slate-800 dark:text-brand-dark-heading mb-1">
        {title}
      </h4>
      <p className="text-xs text-slate-500 dark:text-brand-dark-muted max-w-sm mb-4 leading-relaxed">
        {description}
      </p>
      {label && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center justify-center px-3.5 py-1.5 text-xs font-semibold text-brand-blue-700 dark:text-brand-blue-300 bg-brand-blue-50 dark:bg-brand-blue-950/60 hover:bg-brand-blue-100 dark:hover:bg-brand-blue-900/60 border border-brand-blue-200 dark:border-brand-blue-800/60 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
        >
          {label}
        </button>
      )}
    </div>
  );
};
