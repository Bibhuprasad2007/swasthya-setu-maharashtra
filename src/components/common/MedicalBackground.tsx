import React from 'react';

export const MedicalBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Soft radial glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-blue-400/10 dark:bg-brand-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-teal-400/10 dark:bg-brand-teal-500/10 rounded-full blur-3xl" />
      <div className="absolute top-1/3 right-10 w-72 h-72 bg-sky-400/5 dark:bg-sky-500/10 rounded-full blur-3xl" />

      {/* Subtle ECG line SVG at bottom */}
      <svg
        className="absolute bottom-0 left-0 w-full h-24 text-slate-200/50 dark:text-slate-800/30 opacity-60"
        viewBox="0 0 1200 120"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          d="M0 60 L300 60 L320 60 L330 20 L340 100 L350 40 L360 70 L370 60 L700 60 L720 60 L730 15 L740 105 L750 35 L760 75 L770 60 L1200 60"
          stroke="currentColor"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
};
