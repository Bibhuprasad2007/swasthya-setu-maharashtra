import React from 'react';
import { Volume2, FileText, Clock, AlertCircle } from 'lucide-react';
import { PatientQueueItem } from '../../types/doctor';
import { useLanguage } from '../../context/LanguageContext';

interface PatientQueueCardProps {
  patient: PatientQueueItem;
  onCall: (patient: PatientQueueItem) => void;
  onView: (patient: PatientQueueItem) => void;
}

export const PatientQueueCard: React.FC<PatientQueueCardProps> = ({
  patient,
  onCall,
  onView
}) => {
  const { t } = useLanguage();
  const isHighPriority = patient.priority === 'high';

  return (
    <div className={`p-4 rounded-xl border transition-all ${
      isHighPriority
        ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60 shadow-xs'
        : 'bg-white dark:bg-brand-dark-surface border-slate-200 dark:border-brand-dark-border shadow-xs'
    }`}>
      {/* Header with Token, Priority & Time */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-brand-navy-900 dark:bg-brand-dark-elevated text-white font-mono font-bold text-xs shadow-xs border border-brand-navy-700 dark:border-brand-dark-border">
            {patient.token}
          </span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${
            isHighPriority
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60'
              : 'bg-slate-100 text-slate-700 dark:bg-brand-dark-elevated dark:text-brand-dark-muted border border-slate-200 dark:border-brand-dark-border'
          }`}>
            {isHighPriority && <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />}
            {isHighPriority ? t.badgeHighPriority : t.badgeNormalPriority}
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-brand-dark-muted">
          <Clock className="w-3.5 h-3.5" />
          <span>{patient.waitingMinutes} {t.minutesAgo}</span>
        </div>
      </div>

      {/* Patient Name and Info */}
      <div className="mb-3">
        <h4 className="text-sm font-bold text-slate-900 dark:text-brand-dark-heading">
          {patient.patientName}
        </h4>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-brand-dark-muted mt-0.5">
          <span>{patient.gender}, {patient.age} yrs</span>
          <span>•</span>
          <span className="font-mono text-slate-600 dark:text-brand-dark-text">{patient.abhaId || 'ABHA-VERIFIED'}</span>
        </div>
        <p className="text-xs text-slate-700 dark:text-brand-dark-text font-medium mt-1.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-blue-500 flex-shrink-0" />
          <span>{patient.reason}</span>
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-brand-dark-border/60">
        <button
          type="button"
          onClick={() => onCall(patient)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-gradient-to-r from-brand-blue-600 to-brand-teal-600 hover:from-brand-blue-700 hover:to-brand-teal-700 rounded-lg shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>{t.callPatientBtn}</span>
        </button>

        <button
          type="button"
          onClick={() => onView(patient)}
          aria-label={`${t.viewPatientBtn} for ${patient.patientName}`}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-brand-dark-text bg-slate-100 dark:bg-brand-dark-elevated hover:bg-slate-200 dark:hover:bg-brand-dark-border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>{t.viewPatientBtn}</span>
        </button>
      </div>
    </div>
  );
};
