import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Pill,
  ChevronRight,
  Home,
  ShieldCheck,
  MapPin,
  LogOut,
  Menu,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePharmacyPortal } from '../../context/PharmacyPortalContext';
import { PharmacySidebar } from '../pharmacy/PharmacySidebar';
import { LanguageSelector } from '../common/LanguageSelector';
import { ThemeToggle } from '../common/ThemeToggle';
import { PrototypeBanner } from '../common/PrototypeBanner';
import { ToastContainer } from '../common/ToastContainer';

const PAGE_LABELS: Record<string, string> = {
  '/pharmacy/dashboard': 'Dashboard',
  '/pharmacy/prescriptions': 'Prescriptions (e-Rx)',
  '/pharmacy/inventory': 'Medicine Stock & Batches',
  '/pharmacy/reservations': 'Patient App Reservations',
  '/pharmacy/dispensing-history': 'Dispensing History & Receipts'
};

interface PharmacyPortalLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  pageSubtitle?: string;
  headerAction?: React.ReactNode;
}

export const PharmacyPortalLayout: React.FC<PharmacyPortalLayoutProps> = ({
  children,
  pageTitle,
  pageSubtitle,
  headerAction
}) => {
  const { user, logout, sessionTimeoutWarning, refreshSession } = useAuth();
  const { toasts, removeToast } = usePharmacyPortal();
  const navigate = useNavigate();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const currentLabel = pageTitle || PAGE_LABELS[location.pathname] || 'Pharmacy Portal';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-brand-dark-bg text-slate-900 dark:text-brand-dark-text transition-colors duration-200">
      <PrototypeBanner />

      {/* Session Timeout Warning */}
      {sessionTimeoutWarning && (
        <div className="bg-amber-500 text-white px-4 py-2 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-md z-50">
          <div className="flex items-center gap-2 w-full">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 animate-bounce" />
            <span>Warning: Your pharmacy session will expire in less than 2 minutes due to inactivity.</span>
            <button
              type="button"
              onClick={refreshSession}
              className="ml-auto inline-flex items-center gap-1 bg-white text-amber-900 px-2.5 py-1 rounded text-xs font-bold hover:bg-amber-50"
            >
              <RefreshCw className="w-3 h-3" />
              Extend Session
            </button>
          </div>
        </div>
      )}

      {/* Top Header */}
      <header className="bg-white/90 dark:bg-brand-dark-surface/90 backdrop-blur-md border-b border-slate-200/80 dark:border-brand-dark-border/80 sticky top-0 z-40 shadow-xs">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Left: Mobile Toggle & Brand */}
            <div className="flex items-center gap-2.5 sm:gap-4">
              <button
                type="button"
                onClick={() => setIsMobileOpen(true)}
                aria-label="Toggle pharmacy navigation menu"
                className="lg:hidden p-2 rounded-xl text-slate-700 dark:text-brand-dark-text hover:bg-slate-100 dark:hover:bg-brand-dark-elevated transition-colors border border-slate-200 dark:border-brand-dark-border"
              >
                <Menu className="w-5 h-5" />
              </button>

              <Link to="/pharmacy/dashboard" className="flex items-center gap-3">
                <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-800 dark:bg-brand-dark-elevated text-white border border-emerald-700 dark:border-brand-dark-border shadow-xs flex-shrink-0">
                  <Pill className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-brand-dark-heading leading-tight truncate">
                      Pharmacy & Dispensary Portal
                    </h1>
                    <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/60">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      Authorized Pharmacist
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-brand-dark-muted font-medium hidden sm:block">
                    Government Jan Aushadhi & PHC Medicine Supply Network
                  </p>
                </div>
              </Link>
            </div>

            {/* Right: Controls, Profile & Logout */}
            <div className="flex items-center gap-2 sm:gap-3">
              <LanguageSelector />
              <ThemeToggle />

              {/* User Profile Pill */}
              <div className="hidden md:flex flex-col text-right pr-1 pl-2 border-l border-slate-200 dark:border-brand-dark-border">
                <span className="text-xs font-bold text-slate-800 dark:text-brand-dark-heading truncate max-w-[200px]">
                  {user?.name}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-brand-dark-muted flex items-center justify-end gap-1">
                  <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  <span className="truncate max-w-[180px]">{user?.facilityName}</span>
                </span>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Logout from pharmacy portal"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800/60 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Secure Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body: Sidebar + Content */}
      <div className="flex-1 flex w-full">
        <PharmacySidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          isMobileOpen={isMobileOpen}
          onMobileClose={() => setIsMobileOpen(false)}
        />

        {/* Content Area - Full Width with no large margins */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-5 sm:py-7 overflow-y-auto">
          {/* Breadcrumb & Top Page Header */}
          <div className="mb-5">
            <nav
              className="flex items-center gap-1 text-xs text-slate-500 dark:text-brand-dark-muted mb-3 flex-wrap"
              aria-label="Breadcrumb"
            >
              <Link
                to="/pharmacy/dashboard"
                className="flex items-center gap-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                <span>SwasthyaSetu</span>
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="text-slate-500 dark:text-brand-dark-muted">Pharmacy</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="font-semibold text-slate-800 dark:text-brand-dark-heading">
                {currentLabel}
              </span>
            </nav>

            {(pageTitle || headerAction) && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-brand-dark-heading tracking-tight">
                    {pageTitle || currentLabel}
                  </h2>
                  {pageSubtitle && (
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-brand-dark-muted mt-0.5">
                      {pageSubtitle}
                    </p>
                  )}
                </div>
                {headerAction && <div className="flex items-center gap-2">{headerAction}</div>}
              </div>
            )}
          </div>

          {/* Page Content Body */}
          {children}
        </main>
      </div>

      {/* Centralized Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Footer */}
      <footer className="bg-white/80 dark:bg-brand-dark-surface/80 border-t border-slate-200 dark:border-brand-dark-border py-3.5 text-center text-xs text-slate-500 dark:text-brand-dark-muted mt-auto">
        <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            SwasthyaSetu Maharashtra — Government Medical Store & Jan Aushadhi Network (SIH Prototype)
          </span>
          <span>
            Pharmacist: <strong>{user?.name}</strong> | Store: <strong>{user?.facilityCode}</strong>
          </span>
        </div>
      </footer>
    </div>
  );
};
