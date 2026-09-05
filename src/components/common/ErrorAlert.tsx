import React from 'react';
import { AlertCircle, X, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

interface ErrorAlertProps {
  type?: 'error' | 'warning' | 'info' | 'success';
  title?: string;
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  type = 'error',
  title,
  message,
  onDismiss,
  className = '',
}) => {
  const styles = {
    error: {
      bg: 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200',
      icon: <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />,
      btn: 'text-rose-500 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 hover:text-rose-800 dark:hover:text-rose-100',
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />,
      btn: 'text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/60 hover:text-amber-900 dark:hover:text-amber-100',
    },
    info: {
      bg: 'bg-sky-50 dark:bg-sky-950/50 border-sky-200 dark:border-sky-800/60 text-sky-900 dark:text-sky-200',
      icon: <Info className="w-5 h-5 text-sky-600 dark:text-sky-400 flex-shrink-0" />,
      btn: 'text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/60 hover:text-sky-900 dark:hover:text-sky-100',
    },
    success: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />,
      btn: 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 hover:text-emerald-900 dark:hover:text-emerald-100',
    },
  };

  const currentStyle = styles[type];

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl border shadow-xs animate-in fade-in duration-200 ${currentStyle.bg} ${className}`}
    >
      <div className="mt-0.5">{currentStyle.icon}</div>

      <div className="flex-1 text-xs sm:text-sm">
        {title && <h4 className="font-bold mb-0.5">{title}</h4>}
        <p className="leading-relaxed">{message}</p>
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss alert"
          className={`p-1 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${currentStyle.btn}`}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
