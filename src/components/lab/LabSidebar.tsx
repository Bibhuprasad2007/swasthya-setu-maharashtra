import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  TestTube,
  FlaskConical,
  FileCheck2,
  ChevronLeft,
  ChevronRight,
  X,
  Microscope,
} from 'lucide-react';
import { useLabPortal } from '../../context/LabPortalContext';

interface LabSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

const NAV_ITEMS = [
  { to: '/laboratory/dashboard', label: 'Dashboard', icon: LayoutDashboard, key: 'labNavDashboard' },
  { to: '/laboratory/test-orders', label: 'Test Orders', icon: ClipboardList, key: 'labNavTestOrders' },
  { to: '/laboratory/samples', label: 'Sample Tracking', icon: TestTube, key: 'labNavSamples' },
  { to: '/laboratory/result-entry', label: 'Result Entry', icon: FlaskConical, key: 'labNavResultEntry' },
  { to: '/laboratory/reports', label: 'Verified Reports', icon: FileCheck2, key: 'labNavReports' },
];

export const LabSidebar: React.FC<LabSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onMobileClose,
}) => {
  const location = useLocation();
  const { dashboardStats } = useLabPortal();

  const isActive = (to: string) => location.pathname === to || location.pathname.startsWith(to + '/');

  const badges: Record<string, number | undefined> = {
    '/laboratory/test-orders': dashboardStats.newOrders || undefined,
    '/laboratory/result-entry': dashboardStats.awaitingVerification || undefined,
    '/laboratory/reports': dashboardStats.criticalResults || undefined,
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className={`flex items-center gap-3 px-4 py-4 border-b border-teal-700/30 dark:border-brand-dark-border/60 flex-shrink-0 ${isCollapsed ? 'justify-center px-2' : ''}`}>
        <div className="p-2 rounded-xl bg-teal-700 text-white flex-shrink-0">
          <Microscope className="w-5 h-5" />
        </div>
        {!isCollapsed && (
          <div className="min-w-0">
            <p className="text-sm font-bold text-white leading-tight truncate">Diagnostic Lab</p>
            <p className="text-[10px] text-teal-200/80 truncate">SwasthyaSetu Network</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1" aria-label="Laboratory Navigation">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
          const active = isActive(to);
          const badge = badges[to];
          return (
            <Link
              key={to}
              to={to}
              onClick={() => isMobileOpen && onMobileClose()}
              title={isCollapsed ? label : undefined}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 group relative
                ${active
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-teal-100 dark:text-brand-dark-text hover:bg-teal-700/60 dark:hover:bg-brand-dark-elevated'
                }
                ${isCollapsed ? 'justify-center px-2' : ''}
              `}
            >
              <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${active ? 'text-white' : 'text-teal-300 dark:text-teal-400 group-hover:text-white'}`} />
              {!isCollapsed && (
                <>
                  <span className="flex-1 truncate">{label}</span>
                  {badge !== undefined && badge > 0 && (
                    <span className={`inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full flex-shrink-0
                      ${active ? 'bg-white/25 text-white' : 'bg-rose-500 text-white'}`}
                    >
                      {badge > 9 ? '9+' : badge}
                    </span>
                  )}
                </>
              )}
              {isCollapsed && badge !== undefined && badge > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle (desktop) */}
      <div className="flex-shrink-0 border-t border-teal-700/30 dark:border-brand-dark-border/60 p-2">
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-teal-300 dark:text-brand-dark-muted hover:bg-teal-700/60 dark:hover:bg-brand-dark-elevated transition-colors text-xs font-medium"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span>Collapse</span></>}
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
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-gradient-to-b from-teal-900 to-teal-800 dark:from-brand-dark-surface dark:to-brand-dark-surface shadow-2xl transition-transform duration-300 ease-in-out lg:hidden
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        aria-label="Laboratory portal navigation"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-teal-700/30 dark:border-brand-dark-border">
          <span className="text-sm font-bold text-white">Lab Navigation</span>
          <button
            type="button"
            onClick={onMobileClose}
            aria-label="Close navigation menu"
            className="p-1.5 rounded-lg text-teal-300 hover:bg-teal-700/60 transition-colors"
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
        className={`hidden lg:flex flex-col flex-shrink-0 bg-gradient-to-b from-teal-900 to-teal-800 dark:from-brand-dark-surface dark:to-brand-dark-surface border-r border-teal-700/30 dark:border-brand-dark-border transition-all duration-200 ease-in-out sticky top-0 h-screen overflow-hidden
          ${isCollapsed ? 'w-[60px]' : 'w-56'}
        `}
        aria-label="Laboratory portal navigation"
      >
        <SidebarContent />
      </aside>
    </>
  );
};
