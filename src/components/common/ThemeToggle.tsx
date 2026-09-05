import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        toggleTheme();
      }}
      aria-label={`Current theme is ${theme}. Click to switch to ${isDark ? 'light' : 'dark'} mode.`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className="relative p-2 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 bg-white dark:bg-brand-dark-surface border-slate-200 dark:border-brand-dark-border text-slate-700 dark:text-brand-blue-300 hover:bg-slate-100 dark:hover:bg-brand-dark-elevated shadow-xs cursor-pointer select-none"
    >
      <div className="w-5 h-5 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
        ) : (
          <Moon className="w-4 h-4 text-slate-700 transition-transform duration-300 -rotate-12 hover:rotate-0" />
        )}
      </div>
      <span className="sr-only">Toggle theme</span>
    </button>
  );
};
