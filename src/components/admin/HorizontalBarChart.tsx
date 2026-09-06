/**
 * Lightweight SVG Horizontal Bar Chart for District Comparisons
 */

import React from 'react';
import { ChartDataPoint } from '../../types/admin';

interface HorizontalBarChartProps {
  data: ChartDataPoint[];
  title?: string;
  color?: string;
  maxValue?: number;
  unit?: string;
  goodThreshold?: number; // values below are bad (for waiting time etc)
  higherIsBetter?: boolean;
}

export const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({
  data,
  title,
  color = '#0ea5e9',
  maxValue,
  unit = '',
  higherIsBetter = true,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-20 text-xs text-slate-400 dark:text-brand-dark-muted">
        No data available
      </div>
    );
  }

  const max = maxValue ?? Math.max(...data.map(d => d.value)) * 1.1;

  return (
    <div className="w-full space-y-1.5">
      {title && (
        <p className="text-xs font-semibold text-slate-700 dark:text-brand-dark-heading mb-2">{title}</p>
      )}
      {data.map((d, i) => {
        const pct = Math.min(100, (d.value / max) * 100);
        const isWarn = higherIsBetter ? d.value < max * 0.5 : d.value > max * 0.7;
        const barColor = isWarn
          ? (higherIsBetter ? '#f59e0b' : '#ef4444')
          : color;

        return (
          <div key={i} className="flex items-center gap-2">
            <span className="text-[11px] text-slate-600 dark:text-brand-dark-muted w-24 flex-shrink-0 truncate" title={d.label}>
              {d.label}
            </span>
            <div className="flex-1 bg-slate-100 dark:bg-brand-dark-elevated rounded-full h-4 overflow-hidden relative">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, backgroundColor: barColor }}
              />
            </div>
            <span className="text-[11px] font-bold text-slate-700 dark:text-brand-dark-heading w-14 text-right flex-shrink-0 tabular-nums">
              {d.value}{unit}
            </span>
          </div>
        );
      })}
    </div>
  );
};
