import React, { useEffect, useRef } from 'react';
import { X, Sparkles, Shield, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureTitle?: string;
  featureDescription?: string;
}

export const ComingSoonModal: React.FC<ComingSoonModalProps> = ({
  isOpen,
  onClose,
  featureTitle,
  featureDescription
}) => {
  const { t } = useLanguage();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-headline"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white dark:bg-brand-dark-surface rounded-2xl shadow-2xl border border-slate-200 dark:border-brand-dark-border p-6 sm:p-7 overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-brand-blue-500/10 dark:bg-brand-blue-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-brand-teal-500/10 dark:bg-brand-teal-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-blue-600 to-brand-teal-500 flex items-center justify-center text-white shadow-md shadow-brand-blue-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label={t.closeBtn}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:text-brand-dark-muted dark:hover:text-brand-dark-heading hover:bg-slate-100 dark:hover:bg-brand-dark-elevated transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 id="modal-headline" className="text-lg font-bold text-slate-900 dark:text-brand-dark-heading mb-1.5">
          {featureTitle || t.comingSoonTitle}
        </h3>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-brand-dark-text mb-4 leading-relaxed">
          {featureDescription || t.comingSoonDesc}
        </p>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-brand-dark-elevated/80 border border-slate-200/80 dark:border-brand-dark-border/80 flex items-start gap-3 mb-6">
          <Shield className="w-4 h-4 text-brand-teal-600 dark:text-brand-teal-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-slate-500 dark:text-brand-dark-muted">
            <span className="font-semibold text-slate-700 dark:text-brand-dark-text block mb-0.5">Phase 2 Roadmap Milestone</span>
            Unified state-wide interoperability via ABDM & Ayushman Bharat digital protocol.
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-brand-blue-600 to-brand-teal-600 hover:from-brand-blue-700 hover:to-brand-teal-700 rounded-xl shadow-md shadow-brand-blue-600/20 transition-all focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
          >
            <span>{t.gotItBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
