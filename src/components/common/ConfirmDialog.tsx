import React, { useEffect, useRef } from 'react';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  type = 'warning',
  onConfirm,
  onCancel
}) => {
  const { t } = useLanguage();
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        confirmBtnRef.current?.focus();
      }, 50);
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />;
      case 'info':
      default:
        return <Info className="w-6 h-6 text-brand-blue-600 dark:text-brand-blue-400" />;
    }
  };

  const getConfirmBtnStyle = () => {
    switch (type) {
      case 'danger':
        return 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20';
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20';
      case 'info':
      default:
        return 'bg-brand-blue-600 hover:bg-brand-blue-700 text-white shadow-brand-blue-600/20';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-fade-in"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-desc"
      onClick={onCancel}
    >
      <div
        className="relative w-full max-w-md bg-white dark:bg-brand-dark-surface rounded-2xl shadow-2xl border border-slate-200 dark:border-brand-dark-border p-6 overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-brand-dark-elevated flex items-center justify-center flex-shrink-0">
            {getIcon()}
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label={t.closeBtn || 'Close'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:text-brand-dark-muted dark:hover:text-brand-dark-heading hover:bg-slate-100 dark:hover:bg-brand-dark-elevated transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 id="dialog-title" className="text-lg font-bold text-slate-900 dark:text-brand-dark-heading mb-2">
          {title}
        </h3>

        <p id="dialog-desc" className="text-xs sm:text-sm text-slate-600 dark:text-brand-dark-text mb-6 leading-relaxed">
          {message}
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-brand-dark-text bg-slate-100 dark:bg-brand-dark-elevated hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            {cancelLabel || 'Cancel'}
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-brand-blue-500 ${getConfirmBtnStyle()}`}
          >
            {confirmLabel || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};
