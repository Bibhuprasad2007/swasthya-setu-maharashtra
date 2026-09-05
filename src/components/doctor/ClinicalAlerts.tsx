import React from 'react';
import { 
  FlaskConical, 
  Share2, 
  AlertTriangle, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { ClinicalAlertItem } from '../../types/doctor';
import { useLanguage } from '../../context/LanguageContext';

interface ClinicalAlertsProps {
  alerts: ClinicalAlertItem[];
  onReviewAlert: (alert: ClinicalAlertItem) => void;
}

export const ClinicalAlerts: React.FC<ClinicalAlertsProps> = ({ alerts, onReviewAlert }) => {
  const { t } = useLanguage();

  const getAlertIcon = (type: ClinicalAlertItem['type']) => {
    switch (type) {
      case 'lab':
        return <FlaskConical className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'referral':
        return <Share2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
      case 'followup':
        return <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />;
    }
  };

  const getAlertBadge = (alert: ClinicalAlertItem) => {
    switch (alert.severity) {
      case 'danger':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-300 dark:border-rose-700/60';
      case 'amber':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60';
      case 'warning':
      default:
        return 'bg-brand-blue-100 text-brand-blue-800 dark:bg-brand-blue-950/70 dark:text-brand-blue-300 border border-brand-blue-300 dark:border-brand-blue-700/60';
    }
  };

  return (
    <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200/80 dark:border-brand-dark-border shadow-xs p-5 sm:p-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-brand-dark-border mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-brand-dark-heading">
              {t.clinicalAttentionTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-brand-dark-muted mt-0.5">
              {t.clinicalAttentionSubtitle}
            </p>
          </div>
        </div>

        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60">
          3 Items Due
        </span>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => {
          const title = t[alert.titleKey] || alert.titleKey;
          const desc = t[alert.descKey] || alert.descKey;
          const actionLabel = t[alert.actionLabelKey] || 'Review';

          return (
            <div
              key={alert.id}
              className="p-4 rounded-xl bg-slate-50/70 dark:bg-brand-dark-elevated/60 border border-slate-200/70 dark:border-brand-dark-border/80 hover:border-amber-300 dark:hover:border-amber-700/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-white dark:bg-brand-dark-surface border border-slate-200/80 dark:border-brand-dark-border shadow-2xs flex-shrink-0">
                  {getAlertIcon(alert.type)}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-brand-dark-heading">
                      {title}
                    </h4>
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${getAlertBadge(alert)}`}>
                      {alert.count} Pending
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-brand-dark-muted mt-1">
                    {desc}
                  </p>
                </div>
              </div>

              <div className="self-end sm:self-center flex-shrink-0">
                <button
                  type="button"
                  onClick={() => onReviewAlert(alert)}
                  aria-label={`${actionLabel} for ${title}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-brand-dark-heading bg-white dark:bg-brand-dark-surface hover:bg-slate-100 dark:hover:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border rounded-lg shadow-2xs transition-all focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
                >
                  <span>{actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
