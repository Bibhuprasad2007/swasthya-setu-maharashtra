import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { ToastMessage } from '../../types/doctor';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => {
        const getToastStyles = () => {
          switch (toast.type) {
            case 'success':
              return {
                bg: 'bg-emerald-50 dark:bg-brand-dark-surface border-emerald-300 dark:border-emerald-800/80',
                icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />,
                titleColor: 'text-emerald-900 dark:text-emerald-300',
                msgColor: 'text-emerald-800/80 dark:text-brand-dark-text'
              };
            case 'error':
              return {
                bg: 'bg-rose-50 dark:bg-brand-dark-surface border-rose-300 dark:border-rose-800/80',
                icon: <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />,
                titleColor: 'text-rose-900 dark:text-rose-300',
                msgColor: 'text-rose-800/80 dark:text-brand-dark-text'
              };
            case 'warning':
              return {
                bg: 'bg-amber-50 dark:bg-brand-dark-surface border-amber-300 dark:border-amber-800/80',
                icon: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />,
                titleColor: 'text-amber-900 dark:text-amber-300',
                msgColor: 'text-amber-800/80 dark:text-brand-dark-text'
              };
            case 'info':
            default:
              return {
                bg: 'bg-brand-blue-50 dark:bg-brand-dark-surface border-brand-blue-300 dark:border-brand-blue-800/80',
                icon: <Info className="w-5 h-5 text-brand-blue-600 dark:text-brand-blue-400 flex-shrink-0" />,
                titleColor: 'text-brand-blue-900 dark:text-brand-blue-300',
                msgColor: 'text-brand-blue-800/80 dark:text-brand-dark-text'
              };
          }
        };

        const style = getToastStyles();

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-slide-up ${style.bg}`}
          >
            <div className="mt-0.5">{style.icon}</div>
            <div className="flex-1 min-w-0">
              <h5 className={`text-xs sm:text-sm font-bold leading-tight ${style.titleColor}`}>
                {toast.title}
              </h5>
              {toast.message && (
                <p className={`text-xs mt-1 leading-snug ${style.msgColor}`}>
                  {toast.message}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-brand-dark-heading hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
