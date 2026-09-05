import React from 'react';
import { 
  UserSearch, 
  Stethoscope, 
  FilePlus, 
  Video, 
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface QuickActionsProps {
  onActionClick: (actionKey: string, title: string, desc: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onActionClick }) => {
  const { t } = useLanguage();

  const ACTIONS = [
    {
      id: 'find_patient',
      title: t.actionFindPatient,
      desc: t.actionFindPatientDesc,
      icon: UserSearch,
      iconColor: 'text-brand-blue-600 dark:text-brand-blue-400',
      bgGradient: 'from-blue-500/10 to-brand-blue-500/5',
      borderColor: 'hover:border-brand-blue-400 dark:hover:border-brand-blue-600'
    },
    {
      id: 'new_consultation',
      title: t.actionNewConsultation,
      desc: t.actionNewConsultationDesc,
      icon: Stethoscope,
      iconColor: 'text-brand-teal-600 dark:text-brand-teal-400',
      bgGradient: 'from-teal-500/10 to-brand-teal-500/5',
      borderColor: 'hover:border-brand-teal-400 dark:hover:border-brand-teal-600'
    },
    {
      id: 'create_prescription',
      title: t.actionCreatePrescription,
      desc: t.actionCreatePrescriptionDesc,
      icon: FilePlus,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      bgGradient: 'from-emerald-500/10 to-emerald-500/5',
      borderColor: 'hover:border-emerald-400 dark:hover:border-emerald-600'
    },
    {
      id: 'start_teleconsult',
      title: t.actionStartTeleconsult,
      desc: t.actionStartTeleconsultDesc,
      icon: Video,
      iconColor: 'text-purple-600 dark:text-purple-400',
      bgGradient: 'from-purple-500/10 to-purple-500/5',
      borderColor: 'hover:border-purple-400 dark:hover:border-purple-600'
    }
  ];

  return (
    <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200/80 dark:border-brand-dark-border shadow-xs p-5 sm:p-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-brand-dark-border mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-brand-dark-heading">
            {t.quickActionsTitle}
          </h3>
          <p className="text-xs text-slate-500 dark:text-brand-dark-muted mt-0.5">
            {t.quickActionsSubtitle}
          </p>
        </div>
        <span className="text-[11px] font-semibold text-brand-blue-700 dark:text-brand-blue-300 bg-brand-blue-50 dark:bg-brand-blue-950/60 px-2 py-0.5 rounded-md border border-brand-blue-200 dark:border-brand-blue-800/60">
          Clinical Shortcuts
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              type="button"
              onClick={() => onActionClick(action.id, action.title, action.desc)}
              aria-label={action.title}
              className={`group flex flex-col justify-between text-left p-4 rounded-xl border border-slate-200/80 dark:border-brand-dark-border bg-gradient-to-br ${action.bgGradient} hover:shadow-md transition-all duration-200 ${action.borderColor} focus:outline-none focus:ring-2 focus:ring-brand-blue-500 hover:-translate-y-0.5`}
            >
              <div className="flex items-start justify-between w-full mb-3">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-brand-dark-elevated shadow-xs border border-slate-200/60 dark:border-brand-dark-border flex items-center justify-center transition-transform group-hover:scale-110">
                  <Icon className={`w-5 h-5 ${action.iconColor}`} />
                </div>
                <div className="p-1 rounded-full text-slate-300 dark:text-brand-dark-muted group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 group-hover:translate-x-0.5 transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-brand-dark-heading group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors">
                  {action.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-brand-dark-muted mt-1 leading-snug">
                  {action.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
