import React from 'react';
import { Activity, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageSelector } from './LanguageSelector';
import { ThemeToggle } from './ThemeToggle';
import { NetworkStatus } from './NetworkStatus';

export const Header: React.FC = () => {
  const { t } = useLanguage();

  return (
    <header className="w-full sticky top-0 z-40" role="banner">
      {/* Main navigation header */}
      <div className="bg-white/85 dark:bg-brand-dark-bg/85 backdrop-blur-md border-b border-slate-200/80 dark:border-brand-dark-border/80 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Logo and Brand Name */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-brand-blue-600 to-brand-teal-500 text-white shadow-md shadow-brand-blue-600/20 border border-brand-blue-400/30">
                <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-heartbeat" aria-hidden="true" />
                <span className="absolute -bottom-1 -right-1 bg-emerald-500 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-brand-dark-bg flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                </span>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-xl font-bold text-slate-900 dark:text-brand-dark-heading tracking-tight leading-tight">
                    {t.appName}
                  </h1>
                  <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold text-brand-teal-800 dark:text-brand-teal-300 bg-brand-teal-50 dark:bg-brand-teal-950/60 px-2 py-0.5 rounded-md border border-brand-teal-200 dark:border-brand-teal-800/60">
                    <ShieldCheck className="w-3.5 h-3.5 text-brand-teal-600 dark:text-brand-teal-400" />
                    Verified Unified Network
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-brand-dark-muted font-medium">
                  {t.appSubtitle}
                </p>
              </div>
            </div>

            {/* Right controls: Network Status, Language & Theme toggle */}
            <div className="flex items-center gap-2 sm:gap-3">
              <NetworkStatus />
              <LanguageSelector />
              <ThemeToggle />
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};
