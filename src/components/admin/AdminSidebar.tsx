import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Activity,
  AlertTriangle,
  GitBranch,
  BarChart3,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  X,
  ShieldAlert,
} from 'lucide-react';
import { useAdminPortal } from '../../context/AdminPortalContext';

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeType?: 'alerts' | 'referrals';
}

const NAV_ITEMS: NavItem[] = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/facilities', label: 'Facility Network', icon: Building2 },
  { to: '/admin/service-monitoring', label: 'Service Monitoring', icon: Activity },
  { to: '/admin/alerts', label: 'Alerts & Shortages', icon: AlertTriangle, badgeType: 'alerts' },
  { to: '/admin/referrals', label: 'Referral Monitoring', icon: GitBranch, badgeType: 'referrals' },
  { to: '/admin/reports', label: 'Reports & Analytics', icon: BarChart3 },
  { to: '/admin/access-audit', label: 'Access & Audit', icon: ShieldCheck },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onMobileClose,
}) => {
  const location = useLocation();
  const { newAlertCount, delayedReferralCount } = useAdminPortal();

  const isActive = (to: string) =>
    location.pathname === to || location.pathname.startsWith(to + '/');

  const getBadgeValue = (type?: 'alerts' | 'referrals') => {
    if (type === 'alerts') return newAlertCount;
    if (type === 'referrals') return delayedReferralCount;
    return undefined;
  };

  const getBadgeColor = (type?: 'alerts' | 'referrals') => {
    if (type === 'alerts') return 'bg-rose-500 text-white';
    if (type === 'referrals') return 'bg-amber-500 text-white';
    return '';
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div
        className={`flex items-center gap-3 px-4 py-4 border-b border-sky-700/30 dark:border-brand-dark-border/60 flex-shrink-0 ${
          isCollapsed ? 'justify-center px-2' : ''
        }`}
      >
        <div className="p-2 rounded-xl bg-sky-700 dark:bg-sky-800 text-white flex-shrink-0 shadow-xs">
          <ShieldAlert className="w-5 h-5 text-sky-200" />
        </div>
        {!isCollapsed && (
          <div className="min-w-0">
            <p className="text-sm font-bold text-white leading-tight truncate">
              Govt Admin Portal
            </p>
            <p className="text-[10px] text-sky-200/80 truncate">
              SwasthyaSetu Maharashtra
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1" aria-label="Admin Navigation">
        {NAV_ITEMS.map(({ to, label, icon: Icon, badgeType }) => {
          const active = isActive(to);
          const badgeValue = getBadgeValue(badgeType);

          return (
            <Link
              key={to}
              to={to}
              onClick={() => isMobileOpen && onMobileClose()}
              title={isCollapsed ? label : undefined}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 group relative ${
                active
                  ? 'bg-sky-600 dark:bg-sky-700 text-white shadow-sm font-semibold'
                  : 'text-sky-100 dark:text-brand-dark-text hover:bg-sky-700/60 dark:hover:bg-brand-dark-elevated'
              } ${isCollapsed ? 'justify-center px-2' : ''}`}
            >
              <Icon
                className={`w-4.5 h-4.5 flex-shrink-0 ${
                  active ? 'text-white' : 'text-sky-300 dark:text-sky-400 group-hover:text-white'
                }`}
              />
              {!isCollapsed && (
                <>
                  <span className="flex-1 truncate">{label}</span>
                  {badgeValue !== undefined && badgeValue > 0 && (
                    <span
                      className={`inline-flex items-center justify-center px-1.5 py-0.5 min-w-[20px] text-[10px] font-bold rounded-full flex-shrink-0 ${
                        active ? 'bg-white/25 text-white' : getBadgeColor(badgeType)
                      }`}
                    >
                      {badgeValue > 99 ? '99+' : badgeValue}
                    </span>
                  )}
                </>
              )}
              {isCollapsed && badgeValue !== undefined && badgeValue > 0 && (
                <span
                  className={`absolute top-1 right-1 w-2.5 h-2.5 rounded-full ring-2 ring-sky-900 ${getBadgeColor(badgeType)}`}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="flex-shrink-0 border-t border-sky-700/30 dark:border-brand-dark-border/60 p-2">
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sky-300 dark:text-brand-dark-muted hover:bg-sky-700/60 dark:hover:bg-brand-dark-elevated transition-colors text-xs font-medium"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse Sidebar</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-gradient-to-b from-sky-950 to-sky-900 dark:from-brand-dark-surface dark:to-brand-dark-surface shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Admin mobile navigation"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-sky-700/30 dark:border-brand-dark-border">
          <span className="text-sm font-bold text-white">Admin Navigation</span>
          <button
            type="button"
            onClick={onMobileClose}
            aria-label="Close navigation menu"
            className="p-1.5 rounded-lg text-sky-300 hover:bg-sky-700/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <SidebarContent />
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col flex-shrink-0 bg-gradient-to-b from-sky-950 to-sky-900 dark:from-brand-dark-surface dark:to-brand-dark-surface border-r border-sky-700/30 dark:border-brand-dark-border transition-all duration-200 ease-in-out sticky top-0 h-screen overflow-hidden ${
          isCollapsed ? 'w-[64px]' : 'w-60'
        }`}
        aria-label="Admin portal navigation"
      >
        <SidebarContent />
      </aside>
    </>
  );
};
