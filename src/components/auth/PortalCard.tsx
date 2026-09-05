import React from 'react';
import { 
  Stethoscope, 
  FlaskConical, 
  Pill, 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  CheckCircle2 
} from 'lucide-react';
import { PortalConfig, PortalType } from '../../types/auth';
import { useLanguage } from '../../context/LanguageContext';

export interface PortalCardProps {
  portal: PortalConfig;
  onClick?: () => void;
  isSelected?: boolean;
  onSelect?: (portal: PortalType) => void;
}

export const PortalCard: React.FC<PortalCardProps> = ({
  portal,
  onClick,
  isSelected,
  onSelect,
}) => {
  const { t } = useLanguage();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (onSelect) {
      onSelect(portal.id);
    }
  };

  const getIcon = () => {
    switch (portal.id) {
      case 'hospital':
        return <Stethoscope className="w-6 h-6 text-brand-blue-600 dark:text-brand-blue-400" aria-hidden="true" />;
      case 'laboratory':
        return <FlaskConical className="w-6 h-6 text-brand-teal-600 dark:text-brand-teal-400" aria-hidden="true" />;
      case 'pharmacy':
        return <Pill className="w-6 h-6 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />;
      case 'admin':
        return <ShieldCheck className="w-6 h-6 text-sky-600 dark:text-sky-400" aria-hidden="true" />;
    }
  };

  const getStyleTokens = () => {
    switch (portal.id) {
      case 'hospital':
        return {
          badge: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60',
          iconBg: 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-100 dark:border-blue-800/40 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50',
          topLine: 'bg-gradient-to-r from-blue-500 to-cyan-400',
          chip: 'bg-slate-100 dark:bg-brand-dark-bg text-slate-700 dark:text-slate-300 border-slate-200 dark:border-brand-dark-border',
          btnHover: 'group-hover:bg-brand-blue-600 group-hover:text-white dark:group-hover:bg-brand-blue-500 dark:group-hover:text-slate-950',
          glowHover: 'group-hover:border-blue-400 dark:group-hover:border-blue-400/80 group-hover:shadow-card-hover dark:group-hover:shadow-card-hover-dark',
        };
      case 'laboratory':
        return {
          badge: 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800/60',
          iconBg: 'bg-teal-50/80 dark:bg-teal-950/40 border-teal-100 dark:border-teal-800/40 group-hover:bg-teal-100 dark:group-hover:bg-teal-900/50',
          topLine: 'bg-gradient-to-r from-teal-500 to-emerald-400',
          chip: 'bg-slate-100 dark:bg-brand-dark-bg text-slate-700 dark:text-slate-300 border-slate-200 dark:border-brand-dark-border',
          btnHover: 'group-hover:bg-brand-teal-600 group-hover:text-white dark:group-hover:bg-brand-teal-400 dark:group-hover:text-slate-950',
          glowHover: 'group-hover:border-teal-400 dark:group-hover:border-teal-400/80 group-hover:shadow-card-hover dark:group-hover:shadow-card-hover-dark',
        };
      case 'pharmacy':
        return {
          badge: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
          iconBg: 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-800/40 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50',
          topLine: 'bg-gradient-to-r from-emerald-500 to-teal-400',
          chip: 'bg-slate-100 dark:bg-brand-dark-bg text-slate-700 dark:text-slate-300 border-slate-200 dark:border-brand-dark-border',
          btnHover: 'group-hover:bg-emerald-600 group-hover:text-white dark:group-hover:bg-emerald-400 dark:group-hover:text-slate-950',
          glowHover: 'group-hover:border-emerald-400 dark:group-hover:border-emerald-400/80 group-hover:shadow-card-hover dark:group-hover:shadow-card-hover-dark',
        };
      case 'admin':
        return {
          badge: 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/60',
          iconBg: 'bg-sky-50/80 dark:bg-sky-950/40 border-sky-100 dark:border-sky-800/40 group-hover:bg-sky-100 dark:group-hover:bg-sky-900/50',
          topLine: 'bg-gradient-to-r from-sky-500 to-indigo-500',
          chip: 'bg-slate-100 dark:bg-brand-dark-bg text-slate-700 dark:text-slate-300 border-slate-200 dark:border-brand-dark-border',
          btnHover: 'group-hover:bg-sky-600 group-hover:text-white dark:group-hover:bg-sky-400 dark:group-hover:text-slate-950',
          glowHover: 'group-hover:border-sky-400 dark:group-hover:border-sky-400/80 group-hover:shadow-card-hover dark:group-hover:shadow-card-hover-dark',
        };
    }
  };

  const styles = getStyleTokens();
  const title = (t as any)[portal.titleKey] || portal.id;
  const description = (t as any)[portal.descriptionKey] || '';

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      tabIndex={0}
      role="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={`Enter ${title} portal`}
      className={`group relative flex flex-col justify-between bg-white dark:bg-brand-dark-surface rounded-[22px] border transition-all duration-200 hover:-translate-y-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-blue-500 dark:focus:ring-brand-blue-400 focus:ring-offset-2 dark:focus:ring-offset-brand-dark-bg overflow-hidden ${
        isSelected
          ? 'border-brand-blue-600 dark:border-brand-blue-400 ring-2 ring-brand-blue-500/30'
          : 'border-slate-200/90 dark:border-brand-dark-border'
      } p-6 sm:p-7 shadow-card dark:shadow-card-dark ${styles.glowHover}`}
    >
      {/* Top Coloured Accent Line */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 ${styles.topLine}`} />

      {/* Card Content Top */}
      <div>
        {/* Category Header */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className={`p-3 rounded-2xl border transition-colors ${styles.iconBg}`}>
            {getIcon()}
          </div>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${styles.badge}`}>
            {portal.badge}
          </span>
        </div>

        {/* Title and Description */}
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-brand-dark-heading tracking-tight group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-brand-dark-muted mt-1.5 leading-relaxed">
          {description}
        </p>

        {/* Capabilities Chips */}
        <div className="flex flex-wrap gap-1.5 mt-4">
          {portal.capabilities.map((cap, idx) => (
            <span
              key={idx}
              className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-md border ${styles.chip}`}
            >
              <CheckCircle2 className="w-3 h-3 text-slate-400 dark:text-slate-500" />
              <span>{cap}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Card Footer: CTA and Security Note */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-brand-dark-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
          <Lock className="w-3 h-3" />
          <span>Authorized personnel only</span>
        </div>

        <button
          type="button"
          tabIndex={-1}
          className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 dark:bg-brand-dark-elevated text-slate-800 dark:text-brand-dark-heading border border-slate-200 dark:border-brand-dark-border shadow-xs transition-all ${styles.btnHover}`}
        >
          <span>Secure Login</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};
