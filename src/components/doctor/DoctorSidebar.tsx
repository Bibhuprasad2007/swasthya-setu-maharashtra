import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Stethoscope,
  FileText,
  FlaskConical,
  Share2,
  Video,
  Clock3,
  Building2,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useDoctorPortal } from '../../context/DoctorPortalContext';

export interface DoctorSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

interface NavItemDef {
  id: string;
  path: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  getBadge?: (stats: ReturnType<typeof useDoctorPortal>['stats']) => string | number | undefined;
}

export const DoctorSidebar: React.FC<DoctorSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onMobileClose
}) => {
  const { t } = useLanguage();
  const { stats } = useDoctorPortal();

  const NAV_ITEMS: NavItemDef[] = [
    {
      id: 'dashboard',
      path: '/hospital/dashboard',
      labelKey: 'docNavDashboard',
      icon: LayoutDashboard
    },
    {
      id: 'appointments',
      path: '/hospital/appointments',
      labelKey: 'docNavAppointments',
      icon: Calendar,
      getBadge: (s) => (s.todayAppointmentsCount || 0) + (s.waitingPatientsCount || 0) > 0 ? (s.todayAppointmentsCount || 0) + (s.waitingPatientsCount || 0) : undefined
    },
    {
      id: 'patients',
      path: '/hospital/patients',
      labelKey: 'docNavPatients',
      icon: Users
    },
    {
      id: 'consultations',
      path: '/hospital/consultations',
      labelKey: 'docNavConsultations',
      icon: Stethoscope
    },
    {
      id: 'prescriptions',
      path: '/hospital/prescriptions',
      labelKey: 'docNavPrescriptions',
      icon: FileText
    },
    {
      id: 'lab_orders',
      path: '/hospital/lab-orders',
      labelKey: 'docNavLabOrders',
      icon: FlaskConical,
      getBadge: (s) => (s.pendingLabReportsCount > 0 ? s.pendingLabReportsCount : undefined)
    },
    {
      id: 'referrals',
      path: '/hospital/referrals',
      labelKey: 'docNavReferrals',
      icon: Share2,
      getBadge: (s) => (s.pendingReferralsCount > 0 ? s.pendingReferralsCount : undefined)
    },
    {
      id: 'teleconsultation',
      path: '/hospital/teleconsultation',
      labelKey: 'docNavTeleconsultation',
      icon: Video
    },
    {
      id: 'followups',
      path: '/hospital/follow-ups',
      labelKey: 'docNavFollowups',
      icon: Clock3,
      getBadge: (s) => (s.dueFollowUpsCount > 0 ? s.dueFollowUpsCount : undefined)
    },
    {
      id: 'facility_status',
      path: '/hospital/facility-status',
      labelKey: 'docNavFacilityStatus',
      icon: Building2
    },
    {
      id: 'reports',
      path: '/hospital/reports',
      labelKey: 'docNavReports',
      icon: BarChart3
    }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-brand-dark-surface border-r border-slate-200 dark:border-brand-dark-border select-none">
      {/* Sidebar Header on Mobile */}
      <div className="flex lg:hidden items-center justify-between p-4 border-b border-slate-200 dark:border-brand-dark-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-blue-600 text-white flex items-center justify-center">
            <Stethoscope className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm text-slate-800 dark:text-brand-dark-heading">
            {t.portalHospitalTitle}
          </span>
        </div>
        <button
          type="button"
          onClick={onMobileClose}
          aria-label={t.closeBtn || 'Close'}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-brand-dark-muted dark:hover:bg-brand-dark-elevated transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Title on Desktop if expanded */}
      {!isCollapsed && (
        <div className="hidden lg:flex items-center justify-between px-4 pt-4 pb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-brand-dark-muted">
            {t.navigationMenu || 'Clinical Modules'}
          </span>
          <span className="text-[10px] font-semibold text-brand-teal-700 dark:text-brand-teal-400 bg-brand-teal-50 dark:bg-brand-teal-950/60 px-1.5 py-0.5 rounded border border-brand-teal-200 dark:border-brand-teal-800/60">
            OPD Chamber
          </span>
        </div>
      )}

      {/* Nav items list */}
      <nav className="flex-1 px-2.5 py-3 space-y-1 overflow-y-auto" aria-label={t.navigationMenu}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const label = t[item.labelKey] || item.labelKey;
          const badgeValue = item.getBadge?.(stats);

          return (
            <div key={item.id} className="relative group">
              <NavLink
                to={item.path}
                onClick={() => {
                  if (isMobileOpen) onMobileClose();
                }}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-brand-blue-500 ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-blue-600 to-brand-blue-700 text-white shadow-md shadow-brand-blue-600/25 dark:shadow-brand-blue-900/40'
                      : 'text-slate-600 dark:text-brand-dark-text hover:bg-slate-100 dark:hover:bg-brand-dark-elevated hover:text-slate-900 dark:hover:text-brand-dark-heading'
                  } ${isCollapsed ? 'justify-center px-2' : ''}`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 transition-transform group-hover:scale-105 ${
                        isActive ? 'text-white' : 'text-slate-500 dark:text-brand-dark-muted'
                      }`}
                    />

                    {!isCollapsed && (
                      <span className="flex-1 text-left truncate">{label}</span>
                    )}

                    {!isCollapsed && badgeValue !== undefined && (
                      <span
                        className={`ml-auto text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : item.id === 'lab_orders' || item.id === 'followups' || item.id === 'queue'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-brand-dark-elevated dark:text-brand-dark-muted'
                        }`}
                      >
                        {badgeValue}
                      </span>
                    )}
                  </>
                )}
              </NavLink>

              {/* Collapsed desktop hover tooltip */}
              {isCollapsed && (
                <div className="hidden lg:group-hover:flex absolute left-full top-1/2 -translate-y-1/2 ml-2.5 z-50 items-center whitespace-nowrap bg-slate-900 dark:bg-brand-dark-elevated text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-xl border border-slate-700/50 pointer-events-none animate-fade-in">
                  <span>{label}</span>
                  {badgeValue !== undefined && (
                    <span className="ml-1.5 bg-brand-blue-500 text-white text-[10px] px-1.5 py-0.2 rounded-full">
                      {badgeValue}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Collapse/Expand Toggle on Desktop */}
      <div className="hidden lg:block p-3 border-t border-slate-200 dark:border-brand-dark-border">
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? t.expandSidebar : t.collapseSidebar}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-brand-dark-muted hover:text-slate-800 dark:hover:text-brand-dark-heading hover:bg-slate-100 dark:hover:bg-brand-dark-elevated transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>{t.collapseSidebar}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden lg:block h-[calc(100vh-5rem)] sticky top-20 flex-shrink-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-18' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-fade-in"
          onClick={onMobileClose}
          role="presentation"
        >
          <div
            className="fixed inset-y-0 left-0 w-72 max-w-[80vw] z-50 shadow-2xl animate-slide-right"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={t.navigationMenu}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
