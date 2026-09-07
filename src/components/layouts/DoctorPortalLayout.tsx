import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Stethoscope,
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
import { useLanguage } from '../../context/LanguageContext';
import { useDoctorPortal } from '../../context/DoctorPortalContext';
import { DoctorSidebar } from '../doctor/DoctorSidebar';
import { LanguageSelector } from '../common/LanguageSelector';
import { ThemeToggle } from '../common/ThemeToggle';
import { ToastContainer } from '../common/ToastContainer';

interface DoctorPortalLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  pageSubtitle?: string;
  headerAction?: React.ReactNode;
}

export const DoctorPortalLayout: React.FC<DoctorPortalLayoutProps> = ({
  children,
  pageTitle,
  pageSubtitle,
  headerAction
}) => {
  const { user, logout, sessionTimeoutWarning, refreshSession } = useAuth();
  const { t } = useLanguage();
  const { toasts, removeToast } = useDoctorPortal();
  const navigate = useNavigate();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  // Compute Breadcrumb items based on current pathname
  const getBreadcrumbs = () => {
    const path = location.pathname;
    const items: { label: string; to?: string }[] = [{ label: 'Portal', to: '/hospital/dashboard' }];

    if (path.includes('/hospital/dashboard')) {
      items.push({ label: t.docNavDashboard || 'Dashboard' });
    } else if (path.includes('/hospital/appointments')) {
      items.push({ label: t.docNavAppointments || 'Appointments' });
    } else if (path.includes('/hospital/patients')) {
      items.push({ label: t.docNavPatients || 'Patients' });
    } else if (path.includes('/hospital/consultations')) {
      items.push({ label: t.docNavConsultations || 'Consultations' });
    } else if (path.includes('/hospital/prescriptions')) {
      items.push({ label: t.docNavPrescriptions || 'Prescriptions' });
    } else if (path.includes('/hospital/lab-orders')) {
      items.push({ label: t.docNavLabOrders || 'Lab Orders' });
    } else if (path.includes('/hospital/referrals')) {
      items.push({ label: t.docNavReferrals || 'Referrals' });
    } else if (path.includes('/hospital/teleconsultation')) {
      items.push({ label: t.docNavTeleconsultation || 'Teleconsultation' });
    } else if (path.includes('/hospital/follow-ups')) {
      items.push({ label: t.docNavFollowups || 'Follow-ups' });
    } else if (path.includes('/hospital/facility-status')) {
      items.push({ label: t.docNavFacilityStatus || 'Facility Status' });
    } else if (path.includes('/hospital/reports')) {
      items.push({ label: t.docNavReports || 'Reports' });
    }

    return items;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-brand-dark-bg text-slate-900 dark:text-brand-dark-text transition-colors duration-200">

      {/* Session Timeout Alert if nearing expiry */}
      {sessionTimeoutWarning && (
        <div className="bg-amber-500 text-white px-4 py-2 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2 w-full">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 animate-bounce" />
            <span>Warning: Your secure session will expire in less than 2 minutes due to inactivity.</span>
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

      {/* Top Navigation Bar */}
      <header className="bg-white/85 dark:bg-brand-dark-surface/85 backdrop-blur-md border-b border-slate-200/80 dark:border-brand-dark-border/80 sticky top-0 z-40 shadow-xs">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Left: Mobile Menu Trigger + Portal Branding */}
            <div className="flex items-center gap-2.5 sm:gap-4">
              <button
                type="button"
                onClick={() => setIsMobileOpen(true)}
                aria-label={t.toggleSidebar || 'Toggle Menu'}
                className="lg:hidden p-2 rounded-xl text-slate-700 dark:text-brand-dark-text hover:bg-slate-100 dark:hover:bg-brand-dark-elevated transition-colors border border-slate-200 dark:border-brand-dark-border"
              >
                <Menu className="w-5 h-5" />
              </button>

              <Link to="/hospital/dashboard" className="flex items-center gap-3">
                <div className="p-2 sm:p-2.5 rounded-xl bg-brand-navy-900 dark:bg-brand-dark-elevated text-white border border-brand-navy-800 dark:border-brand-dark-border shadow-xs flex-shrink-0">
                  <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6 text-brand-blue-400" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-brand-dark-heading leading-tight truncate">
                      {t.portalHospitalTitle}
                    </h1>
                    <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/60">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      Authenticated
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-brand-dark-muted font-medium hidden sm:block">
                    {t.portalHospitalDesc}
                  </p>
                </div>
              </Link>
            </div>

            {/* Right: Controls, User Info & Logout */}
            <div className="flex items-center gap-2 sm:gap-3">
              <LanguageSelector />
              <ThemeToggle />

              {/* User Profile Pill */}
              <div className="hidden md:flex flex-col text-right pr-1 pl-2 border-l border-slate-200 dark:border-brand-dark-border">
                <span className="text-xs font-bold text-slate-800 dark:text-brand-dark-heading truncate max-w-[180px]">
                  {user?.name}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-brand-dark-muted flex items-center justify-end gap-1">
                  <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  <span className="truncate max-w-[160px]">{user?.facilityName}</span>
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

      {/* Main Body with Sidebar and Content */}
      <div className="flex-1 flex w-full">
        {/* Sidebar */}
        <DoctorSidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          isMobileOpen={isMobileOpen}
          onMobileClose={() => setIsMobileOpen(false)}
        />

        {/* Content Outlet */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 overflow-y-auto">
          {/* Breadcrumbs & Header bar if title provided */}
          {(pageTitle || breadcrumbs.length > 1) && (
            <div className="mb-6 pb-4 border-b border-slate-200/80 dark:border-brand-dark-border/80">
              {/* Breadcrumbs */}
              <nav className="flex items-center gap-1 text-xs text-slate-500 dark:text-brand-dark-muted mb-2 flex-wrap" aria-label="Breadcrumb">
                <Link to="/hospital/dashboard" className="flex items-center gap-1 hover:text-brand-blue-600 dark:hover:text-brand-blue-400 transition-colors">
                  <Home className="w-3.5 h-3.5" />
                  <span>SwasthyaSetu</span>
                </Link>
                {breadcrumbs.map((crumb, idx) => (
                  <React.Fragment key={idx}>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    {crumb.to ? (
                      <Link to={crumb.to} className="hover:text-brand-blue-600 dark:hover:text-brand-blue-400 transition-colors">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="font-semibold text-slate-800 dark:text-brand-dark-heading">{crumb.label}</span>
                    )}
                  </React.Fragment>
                ))}
              </nav>

              {/* Title & Action */}
              {pageTitle && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-brand-dark-heading">
                      {pageTitle}
                    </h2>
                    {pageSubtitle && (
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-brand-dark-muted mt-0.5">
                        {pageSubtitle}
                      </p>
                    )}
                  </div>
                  {headerAction && <div className="flex-shrink-0">{headerAction}</div>}
                </div>
              )}
            </div>
          )}

          {/* Page Child Content */}
          {children}
        </main>
      </div>

      {/* Floating Toasts */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Footer */}
      <footer className="bg-white/80 dark:bg-brand-dark-surface/80 border-t border-slate-200 dark:border-brand-dark-border py-4 text-center text-xs text-slate-500 dark:text-brand-dark-muted mt-auto">
        <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SwasthyaSetu Maharashtra — Integrated Rural Healthcare Network</span>
          <span>Logged in as: <strong>{user?.name}</strong> ({user?.facilityCode})</span>
        </div>
      </footer>
    </div>
  );
};
