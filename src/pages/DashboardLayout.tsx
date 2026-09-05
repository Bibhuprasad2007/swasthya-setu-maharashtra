import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  ShieldCheck, 
  MapPin, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSelector } from '../components/common/LanguageSelector';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { PrototypeBanner } from '../components/common/PrototypeBanner';

interface DashboardLayoutProps {
  portalTitle: string;
  portalSubtitle: string;
  portalIcon: React.ReactNode;
  themeColor: 'blue' | 'teal' | 'navy' | 'indigo' | 'emerald' | 'cyan';
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  portalTitle,
  portalSubtitle,
  portalIcon,
  children,
}) => {
  const { user, logout, sessionTimeoutWarning, refreshSession } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-brand-dark-bg text-slate-900 dark:text-brand-dark-text transition-colors duration-200">
      <PrototypeBanner />

      {/* Session Timeout Alert if nearing expiry */}
      {sessionTimeoutWarning && (
        <div className="bg-amber-500 text-white px-4 py-2 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 animate-bounce" />
            <span>Warning: Your secure session will expire in less than 2 minutes due to inactivity.</span>
            <button
              onClick={refreshSession}
              className="ml-auto inline-flex items-center gap-1 bg-white text-amber-900 px-2.5 py-1 rounded text-xs font-bold hover:bg-amber-50"
            >
              <RefreshCw className="w-3 h-3" />
              Extend Session
            </button>
          </div>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="bg-white/85 dark:bg-brand-dark-surface/85 backdrop-blur-md border-b border-slate-200/80 dark:border-brand-dark-border/80 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Left: App Logo and Portal Identifier */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2.5 rounded-xl bg-brand-navy-900 dark:bg-brand-dark-elevated text-white border border-brand-navy-800 dark:border-brand-dark-border shadow-xs">
                {portalIcon}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-brand-dark-heading leading-tight">
                    {portalTitle}
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/60">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Authenticated
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-brand-dark-muted font-medium">{portalSubtitle}</p>
              </div>
            </div>

            {/* Right: Controls & User Info */}
            <div className="flex items-center gap-2 sm:gap-3">
              <LanguageSelector />
              <ThemeToggle />

              {/* User Profile Pill */}
              <div className="hidden md:flex flex-col text-right pr-1 pl-2 border-l border-slate-200 dark:border-brand-dark-border">
                <span className="text-xs font-bold text-slate-800 dark:text-brand-dark-heading">{user?.name}</span>
                <span className="text-[11px] text-slate-500 dark:text-brand-dark-muted flex items-center justify-end gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {user?.facilityName} ({user?.district})
                </span>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Logout from portal"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800/60 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{t.logoutBtn}</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Main Dashboard Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>

      {/* Dashboard Footer */}
      <footer className="bg-white/80 dark:bg-brand-dark-surface/80 border-t border-slate-200 dark:border-brand-dark-border py-4 text-center text-xs text-slate-500 dark:text-brand-dark-muted mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SwasthyaSetu Maharashtra — Secure Healthcare Network</span>
          <span>Logged in as: <strong>{user?.name}</strong> ({user?.facilityCode})</span>
        </div>
      </footer>
    </div>
  );
};
