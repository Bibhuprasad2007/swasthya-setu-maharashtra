import React from 'react';
import { 
  FileText, 
  FlaskConical, 
  Share2, 
  CheckCircle2, 
  Clock,
  Activity
} from 'lucide-react';
import { RecentActivityItem } from '../../types/doctor';
import { useLanguage } from '../../context/LanguageContext';

interface RecentActivityProps {
  activities: RecentActivityItem[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const { t } = useLanguage();

  const getActivityIcon = (type: RecentActivityItem['type']) => {
    switch (type) {
      case 'prescription':
        return (
          <div className="p-2 rounded-xl bg-brand-blue-50 dark:bg-brand-blue-950/60 text-brand-blue-600 dark:text-brand-blue-400 border border-brand-blue-200 dark:border-brand-blue-800/60">
            <FileText className="w-4 h-4" />
          </div>
        );
      case 'lab_received':
        return (
          <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800/60">
            <FlaskConical className="w-4 h-4" />
          </div>
        );
      case 'referral_accepted':
        return (
          <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/60">
            <Share2 className="w-4 h-4" />
          </div>
        );
      case 'consultation_completed':
      default:
        return (
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200/80 dark:border-brand-dark-border shadow-xs p-5 sm:p-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-brand-dark-border mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-brand-dark-elevated text-slate-600 dark:text-brand-dark-muted">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-brand-dark-heading">
              {t.recentActivityTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-brand-dark-muted mt-0.5">
              {t.recentActivitySubtitle}
            </p>
          </div>
        </div>

        <span className="text-[11px] font-semibold text-slate-500 dark:text-brand-dark-muted flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Live Log
        </span>
      </div>

      <div className="relative pl-4 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-brand-dark-border">
        {activities.map((act) => {
          const title = t[act.titleKey] || act.titleKey;

          return (
            <div key={act.id} className="relative flex items-start gap-3">
              {/* Timeline marker */}
              <div className="flex-shrink-0 -ml-6 bg-white dark:bg-brand-dark-surface p-0.5 rounded-full">
                {getActivityIcon(act.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-brand-dark-heading truncate">
                    {title}
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-brand-dark-muted font-mono whitespace-nowrap">
                    {act.timestamp}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-brand-dark-muted">
                  <span>{t.patientIdLabel}: <strong className="font-mono text-slate-700 dark:text-brand-dark-text">{act.patientId}</strong></span>
                  {act.details && (
                    <>
                      <span>•</span>
                      <span className="truncate">{act.details}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
