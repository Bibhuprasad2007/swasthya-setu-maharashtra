/**
 * Lightweight SVG Bar Chart — No external dependencies
 * Used by Government Admin Portal for operational charts
 */

import React from 'react';
import { ChartDataPoint } from '../../types/admin';

interface MiniBarChartProps {
  data: ChartDataPoint[];
  title?: string;
  primaryColor?: string;
  secondaryColor?: string;
  height?: number;
  showLegend?: boolean;
  primaryLabel?: string;
  secondaryLabel?: string;
  unit?: string;
}

export const MiniBarChart: React.FC<MiniBarChartProps> = ({
  data,
  title,
  primaryColor = '#0ea5e9',
  secondaryColor = '#94a3b8',
  height = 160,
  showLegend = false,
  primaryLabel = 'Value',
  secondaryLabel = 'Secondary',
  unit = '',
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-xs text-slate-400 dark:text-brand-dark-muted">
        No chart data available
      </div>
    );
  }

  const maxVal = Math.max(...data.flatMap(d => [d.value, d.secondaryValue ?? 0]));
  const paddingLeft = 36;
  const paddingRight = 12;
  const paddingTop = 12;
  const paddingBottom = 36;
  const chartWidth = 100; // viewBox percentage-based
  const barGroup = (chartWidth - paddingLeft - paddingRight) / data.length;
  const hasSecondary = data.some(d => d.secondaryValue !== undefined);
  const barW = hasSecondary ? barGroup * 0.38 : barGroup * 0.55;

  return (
    <div className="w-full">
      {title && (
        <p className="text-xs font-semibold text-slate-700 dark:text-brand-dark-heading mb-2">{title}</p>
      )}
      <svg
        viewBox={`0 0 ${chartWidth + paddingLeft + paddingRight} ${height}`}
        width="100%"
        height={height}
        aria-label={title || 'Bar chart'}
        role="img"
        className="overflow-visible"
      >
        {/* Y-axis grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => {
          const y = paddingTop + (height - paddingTop - paddingBottom) * (1 - frac);
          const val = Math.round(maxVal * frac);
          return (
            <g key={i}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={chartWidth + paddingLeft}
                y2={y}
                stroke="currentColor"
                className="text-slate-200 dark:text-slate-700"
                strokeWidth="0.5"
              />
              <text
                x={paddingLeft - 3}
                y={y + 3}
                textAnchor="end"
                fontSize="5"
                className="fill-slate-400 dark:fill-slate-500"
              >
                {val}{unit}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const x = paddingLeft + i * barGroup;
          const chartH = height - paddingTop - paddingBottom;
          const primaryH = maxVal > 0 ? (d.value / maxVal) * chartH : 0;
          const secondaryH = hasSecondary && d.secondaryValue !== undefined && maxVal > 0
            ? (d.secondaryValue / maxVal) * chartH
            : 0;
          const barX = x + (barGroup - (hasSecondary ? barW * 2.1 : barW)) / 2;

          return (
            <g key={i}>
              {/* Primary bar */}
              <rect
                x={barX}
                y={paddingTop + chartH - primaryH}
                width={barW}
                height={primaryH}
                fill={primaryColor}
                rx="1.5"
                opacity="0.9"
              >
                <title>{d.label}: {d.value}{unit}</title>
              </rect>
              {/* Secondary bar */}
              {hasSecondary && d.secondaryValue !== undefined && (
                <rect
                  x={barX + barW + 1}
                  y={paddingTop + chartH - secondaryH}
                  width={barW}
                  height={secondaryH}
                  fill={secondaryColor}
                  rx="1.5"
                  opacity="0.7"
                >
                  <title>{d.label} ({secondaryLabel}): {d.secondaryValue}{unit}</title>
                </rect>
              )}
              {/* X label */}
              <text
                x={barX + (hasSecondary ? barW : barW / 2)}
                y={height - paddingBottom + 8}
                textAnchor="middle"
                fontSize="5"
                className="fill-slate-500 dark:fill-slate-400"
              >
                {d.label.length > 6 ? d.label.slice(0, 5) + '…' : d.label}
              </text>
            </g>
          );
        })}
      </svg>

      {showLegend && (
        <div className="flex items-center gap-4 mt-1 flex-wrap">
          <span className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-brand-dark-muted">
            <span className="w-3 h-2 rounded-sm inline-block" style={{ backgroundColor: primaryColor }} />
            {primaryLabel}
          </span>
          {hasSecondary && (
            <span className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-brand-dark-muted">
              <span className="w-3 h-2 rounded-sm inline-block" style={{ backgroundColor: secondaryColor }} />
              {secondaryLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
