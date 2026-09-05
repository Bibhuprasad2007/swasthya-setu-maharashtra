import React from 'react';
import { Calendar, Users, AlertTriangle, Activity } from 'lucide-react';
import { DashboardStatItem } from '../../types/doctor';
import { useLanguage } from '../../context/LanguageContext';

interface DashboardStatCardProps {
  stat: DashboardStatItem;
  onClick?: () => void;
}

export const DashboardStatCard: React.FC<DashboardStatCardProps> = ({ stat, onClick }) => {
  const { t } = useLanguage();

  const getIcon = () => {
    switch (stat.iconName) {
      case 'calendar':
        return <Calendar className="w-6 h-6 text-brand-blue-600 dark:text-brand-blue-400" />;
      case 'users':
        return <Users className="w-6 h-6 text-brand-teal-600 dark:text-brand-teal-400" />;
      case 'alert':
        return <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />;
      case 'activity':
        return <Activity className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />;
      default:
        return <Activity className="w-6 h-6 text-brand-blue-600 dark:text-brand-blue-400" />;
    }
  };

  const getAccentBg = () => {
    switch (stat.accentColor) {
      case 'blue':
        return 'bg-brand-blue-50 dark:bg-brand-blue-950/50 border-brand-blue-100 dark:border-brand-blue-900/50';
      case 'teal':
        return 'bg-brand-teal-50 dark:bg-brand-teal-950/50 border-brand-teal-100 dark:border-brand-teal-900/50';
      case 'amber':
        return 'bg-amber-50 dark:bg-amber-950/50 border-amber-100 dark:border-amber-900/50';
      case 'emerald':
        return 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-100 dark:border-emerald-900/50';
      default:
        return 'bg-slate-50 dark:bg-brand-dark-elevated border-slate-200 dark:border-brand-dark-border';
    }
  };

  const getBadgeStyle = () => {
    switch (stat.badgeType) {
      case 'blue':
        return 'bg-brand-blue-50 text-brand-blue-700 dark:bg-brand-blue-950/70 dark:text-brand-blue-300 border border-brand-blue-200 dark:border-brand-blue-800/60';
      case 'teal':
        return 'bg-brand-teal-50 text-brand-teal-700 dark:bg-brand-teal-950/70 dark:text-brand-teal-300 border border-brand-teal-200 dark:border-brand-teal-800/60';
      case 'amber':
        return 'bg-amber-50 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60';
      case 'emerald':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60';
    }
  };

  // Translated title lookup
  const title = t[stat.titleKey] || stat.titleKey;

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl bg-white dark:bg-brand-dark-surface p-5 sm:p-6 border border-slate-200/80 dark:border-brand-dark-border shadow-xs hover:shadow-card dark:hover:shadow-card-dark transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-brand-dark-muted block mb-1">
            {title}
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-brand-dark-heading tracking-tight font-mono">
            {stat.value}
          </div>
        </div>

        <div className={`p-3 rounded-2xl border ${getAccentBg()} transition-transform group-hover:scale-110`}>
          {getIcon()}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-brand-dark-border/60 flex items-center justify-between">
        <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-lg ${getBadgeStyle()}`}>
          {stat.badgeText}
        </span>
      </div>
    </div>
  );
};
