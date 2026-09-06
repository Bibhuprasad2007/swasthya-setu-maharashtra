/**
 * Admin Portal — KPI Stat Card Component
 */

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface AdminKpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  unit?: string;
  trend?: number;       // % change vs previous period
  trendLabel?: string;  // e.g. "vs yesterday"
  accentBg: string;
  isAlert?: boolean;    // amber ring if value > threshold
  alertThreshold?: number;
  onClick?: () => void;
  suffix?: string;
}

export const AdminKpiCard: React.FC<AdminKpiCardProps> = ({
  icon,
  label,
  value,
  unit,
  trend,
  trendLabel = 'vs prev. period',
  accentBg,
  isAlert,
  alertThreshold = 0,
  onClick,
  suffix,
}) => {
  const numValue = typeof value === 'number' ? value : parseFloat(String(value));
  const showAlert = isAlert && numValue > alertThreshold;

  const trendDir = trend !== undefined ? (trend > 0 ? 'up' : trend < 0 ? 'down' : 'flat') : undefined;
  // For waiting time, lab TAT — up is bad; for completion rates — up is good
  const trendBad = trend !== undefined && trend > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`w-full text-left bg-white dark:bg-brand-dark-surface rounded-2xl border shadow-xs p-4 sm:p-5 transition-all ${
        onClick ? 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500' : 'cursor-default'
      } ${
        showAlert
          ? 'border-amber-300 dark:border-amber-800/80 ring-1 ring-amber-400 dark:ring-amber-700'
          : 'border-slate-200 dark:border-brand-dark-border'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className={`p-2.5 rounded-xl ${accentBg} flex-shrink-0`}>{icon}</div>
        {trend !== undefined && (
          <span
            className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
              trendDir === 'flat'
                ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                : trendBad
                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
            }`}
          >
            {trendDir === 'up' && <TrendingUp className="w-3 h-3" />}
            {trendDir === 'down' && <TrendingDown className="w-3 h-3" />}
            {trendDir === 'flat' && <Minus className="w-3 h-3" />}
            {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>
      <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-brand-dark-heading font-mono tabular-nums">
        {typeof value === 'number' ? value.toLocaleString() : value}
        {suffix && <span className="text-base font-bold text-slate-500 dark:text-brand-dark-muted ml-1">{suffix}</span>}
      </p>
      <p className="text-xs text-slate-500 dark:text-brand-dark-muted mt-1 font-semibold">{label}</p>
      {unit && <p className="text-[10px] text-slate-400 dark:text-brand-dark-muted mt-0.5">{unit}</p>}
      {trend !== undefined && (
        <p className="text-[10px] text-slate-400 dark:text-brand-dark-muted mt-1">{trendLabel}</p>
      )}
    </button>
  );
};
