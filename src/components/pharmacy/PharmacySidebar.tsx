import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Boxes,
  CalendarCheck2,
  History,
  ChevronLeft,
  ChevronRight,
  X,
  Pill
} from 'lucide-react';
import { usePharmacyPortal } from '../../context/PharmacyPortalContext';
import { useLanguage } from '../../context/LanguageContext';

interface PharmacySidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

interface NavItem {
  to: string;
  labelKey: string;
  fallbackLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeKey?: 'prescriptions' | 'inventory' | 'reservations';
}

const NAV_ITEMS: NavItem[] = [
  {
    to: '/pharmacy/dashboard',
    labelKey: 'pharmacyNavDashboard',
    fallbackLabel: 'Dashboard',
    icon: LayoutDashboard
  },
  {
    to: '/pharmacy/prescriptions',
    labelKey: 'pharmacyNavPrescriptions',
    fallbackLabel: 'Prescriptions',
    icon: FileText,
    badgeKey: 'prescriptions'
  },
  {
    to: '/pharmacy/inventory',
    labelKey: 'pharmacyNavInventory',
    fallbackLabel: 'Medicine Stock',
    icon: Boxes,
    badgeKey: 'inventory'
  },
  {
    to: '/pharmacy/reservations',
    labelKey: 'pharmacyNavReservations',
    fallbackLabel: 'Reservations',
    icon: CalendarCheck2,
    badgeKey: 'reservations'
  },
  {
    to: '/pharmacy/dispensing-history',
    labelKey: 'pharmacyNavHistory',
    fallbackLabel: 'Dispensing History',
    icon: History
  }
];

export const PharmacySidebar: React.FC<PharmacySidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onMobileClose
}) => {
  const location = useLocation();
  const { dashboardStats } = usePharmacyPortal();
  const { t } = useLanguage();

  const isActive = (to: string) =>
    location.pathname === to || location.pathname.startsWith(to + '/');

  const getBadgeValue = (badgeKey?: 'prescriptions' | 'inventory' | 'reservations') => {
    switch (badgeKey) {
      case 'prescriptions':
        return dashboardStats.newPrescriptions;
      case 'inventory':
        return dashboardStats.lowStockCount;
      case 'reservations':
        return dashboardStats.pendingReservations;
      default:
        return undefined;
    }
  };

  const getBadgeColor = (badgeKey?: 'prescriptions' | 'inventory' | 'reservations') => {
    switch (badgeKey) {
      case 'prescriptions':
        return 'bg-blue-500 text-white';
      case 'inventory':
        return 'bg-amber-500 text-white';
      case 'reservations':
        return 'bg-emerald-500 text-white';
      default:
        return 'bg-slate-600 text-white';
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div
        className={`flex items-center gap-3 px-4 py-4 border-b border-emerald-700/30 dark:border-brand-dark-border/60 flex-shrink-0 ${
          isCollapsed ? 'justify-center px-2' : ''
        }`}
      >
        <div className="p-2 rounded-xl bg-emerald-700 dark:bg-emerald-800 text-white flex-shrink-0 shadow-xs">
          <Pill className="w-5 h-5 text-emerald-200" />
        </div>
        {!isCollapsed && (
          <div className="min-w-0">
            <p className="text-sm font-bold text-white leading-tight truncate">
              Pharmacy & Jan Aushadhi
            </p>
            <p className="text-[10px] text-emerald-200/80 truncate">
              SwasthyaSetu Dispensary
            </p>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1" aria-label="Pharmacy Navigation">
        {NAV_ITEMS.map(({ to, labelKey, fallbackLabel, icon: Icon, badgeKey }) => {
          const active = isActive(to);
          const badgeValue = getBadgeValue(badgeKey);
          const label = (t as any)[labelKey] || fallbackLabel;

          return (
            <Link
              key={to}
              to={to}
              onClick={() => isMobileOpen && onMobileClose()}
              title={isCollapsed ? label : undefined}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 group relative ${
                active
                  ? 'bg-emerald-600 dark:bg-emerald-700 text-white shadow-sm font-semibold'
                  : 'text-emerald-100 dark:text-brand-dark-text hover:bg-emerald-700/60 dark:hover:bg-brand-dark-elevated'
              } ${isCollapsed ? 'justify-center px-2' : ''}`}
            >
              <Icon
                className={`w-4.5 h-4.5 flex-shrink-0 ${
                  active ? 'text-white' : 'text-emerald-300 dark:text-emerald-400 group-hover:text-white'
                }`}
              />
              {!isCollapsed && (
                <>
                  <span className="flex-1 truncate">{label}</span>
                  {badgeValue !== undefined && badgeValue > 0 && (
                    <span
                      className={`inline-flex items-center justify-center px-1.5 py-0.5 min-w-[20px] text-[10px] font-bold rounded-full flex-shrink-0 ${
                        active ? 'bg-white/25 text-white' : getBadgeColor(badgeKey)
                      }`}
                    >
                      {badgeValue > 99 ? '99+' : badgeValue}
                    </span>
                  )}
                </>
              )}
              {isCollapsed && badgeValue !== undefined && badgeValue > 0 && (
                <span
                  className={`absolute top-1 right-1 w-2.5 h-2.5 rounded-full ring-2 ring-emerald-900 ${getBadgeColor(
                    badgeKey
                  )}`}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle (desktop only) */}
      <div className="flex-shrink-0 border-t border-emerald-700/30 dark:border-brand-dark-border/60 p-2">
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-emerald-300 dark:text-brand-dark-muted hover:bg-emerald-700/60 dark:hover:bg-brand-dark-elevated transition-colors text-xs font-medium"
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
      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile Slide-out Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-gradient-to-b from-emerald-950 to-emerald-900 dark:from-brand-dark-surface dark:to-brand-dark-surface shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Pharmacy mobile navigation"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-emerald-700/30 dark:border-brand-dark-border">
          <span className="text-sm font-bold text-white">Pharmacy Navigation</span>
          <button
            type="button"
            onClick={onMobileClose}
            aria-label="Close navigation menu"
            className="p-1.5 rounded-lg text-emerald-300 hover:bg-emerald-700/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <SidebarContent />
        </div>
      </aside>

      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden lg:flex flex-col flex-shrink-0 bg-gradient-to-b from-emerald-950 to-emerald-900 dark:from-brand-dark-surface dark:to-brand-dark-surface border-r border-emerald-700/30 dark:border-brand-dark-border transition-all duration-200 ease-in-out sticky top-0 h-screen overflow-hidden ${
          isCollapsed ? 'w-[64px]' : 'w-60'
        }`}
        aria-label="Pharmacy portal navigation"
      >
        <SidebarContent />
      </aside>
    </>
  );
};
