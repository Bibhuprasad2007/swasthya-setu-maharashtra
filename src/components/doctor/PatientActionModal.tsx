import React, { useEffect, useRef } from 'react';
import { 
  X, 
  Volume2, 
  User, 
  Clock, 
  Activity, 
  CreditCard, 
  Phone, 
  AlertCircle,
  CheckCircle2,
  Stethoscope
} from 'lucide-react';
import { PatientQueueItem } from '../../types/doctor';
import { useLanguage } from '../../context/LanguageContext';

interface PatientActionModalProps {
  patient: PatientQueueItem | null;
  mode: 'call' | 'view';
  isOpen: boolean;
  onClose: () => void;
  onConfirmCall?: (patient: PatientQueueItem) => void;
}

export const PatientActionModal: React.FC<PatientActionModalProps> = ({
  patient,
  mode,
  isOpen,
  onClose,
  onConfirmCall
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

  if (!isOpen || !patient) return null;

  const isHighPriority = patient.priority === 'high';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="patient-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-brand-dark-surface rounded-2xl shadow-2xl border border-slate-200 dark:border-brand-dark-border p-6 sm:p-7 overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-brand-dark-border">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white ${
              mode === 'call' 
                ? 'bg-gradient-to-tr from-brand-blue-600 to-brand-teal-500 shadow-md shadow-brand-blue-500/20' 
                : 'bg-gradient-to-tr from-indigo-600 to-brand-blue-600 shadow-md shadow-indigo-500/20'
            }`}>
              {mode === 'call' ? <Volume2 className="w-5 h-5 animate-pulse" /> : <User className="w-5 h-5" />}
            </div>
            <div>
              <h3 id="patient-modal-title" className="text-base sm:text-lg font-bold text-slate-900 dark:text-brand-dark-heading">
                {mode === 'call' ? t.patientCallScreenTitle : t.patientDetailsTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-brand-dark-muted font-medium">
                Token: <span className="font-mono font-bold text-brand-blue-600 dark:text-brand-blue-400">{patient.token}</span> • {patient.gender}, {patient.age} yrs
              </p>
            </div>
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

        {/* Patient Details Body */}
        <div className="py-4 space-y-3.5">
          {/* Patient Card */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-brand-dark-elevated/80 border border-slate-200/80 dark:border-brand-dark-border/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-slate-900 dark:text-brand-dark-heading">
                {patient.patientName}
              </span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                isHighPriority
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60'
              }`}>
                {isHighPriority && <AlertCircle className="w-3 h-3" />}
                {isHighPriority ? t.badgeHighPriority : t.badgeNormalPriority}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-600 dark:text-brand-dark-text mt-3 pt-3 border-t border-slate-200/60 dark:border-brand-dark-border/60">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-brand-dark-muted flex-shrink-0" />
                <span>{t.colWaiting}: <strong>{patient.waitingMinutes} {t.minutesAgo}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-slate-400 dark:text-brand-dark-muted flex-shrink-0" />
                <span>ABHA: <strong className="font-mono">{patient.abhaId || 'ABHA-LINKED'}</strong></span>
              </div>
              {patient.contactNumber && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-brand-dark-muted flex-shrink-0" />
                  <span>Contact: {patient.contactNumber}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-slate-400 dark:text-brand-dark-muted flex-shrink-0" />
                <span>Reason: <strong>{patient.reason}</strong></span>
              </div>
            </div>
          </div>

          {/* Vitals Summary */}
          {patient.vitalSummary && (
            <div className="p-3.5 rounded-xl bg-brand-blue-50/60 dark:bg-brand-blue-950/40 border border-brand-blue-100 dark:border-brand-blue-900/50">
              <div className="flex items-center gap-1.5 text-xs font-bold text-brand-blue-900 dark:text-brand-blue-200 mb-1">
                <Activity className="w-3.5 h-3.5 text-brand-blue-600 dark:text-brand-blue-400" />
                <span>{t.patientVitals} (OPD Triage Desk)</span>
              </div>
              <p className="text-xs text-brand-blue-800 dark:text-brand-blue-300 font-mono">
                {patient.vitalSummary}
              </p>
            </div>
          )}

          {mode === 'call' && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>{t.patientCallScreenDesc}</span>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-brand-dark-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-brand-dark-text bg-slate-100 dark:bg-brand-dark-elevated hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            {t.closeBtn}
          </button>

          {mode === 'call' ? (
            <button
              type="button"
              onClick={() => {
                onConfirmCall?.(patient);
                onClose();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-brand-blue-600 to-brand-teal-600 hover:from-brand-blue-700 hover:to-brand-teal-700 rounded-xl shadow-md shadow-brand-blue-600/20 transition-all focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
            >
              <Volume2 className="w-4 h-4" />
              <span>{t.callPatientBtn} (Chamber 1)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-brand-navy-900 dark:bg-brand-dark-elevated hover:bg-brand-navy-800 border border-brand-navy-700 dark:border-brand-dark-border rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
            >
              <span>{t.gotItBtn}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
