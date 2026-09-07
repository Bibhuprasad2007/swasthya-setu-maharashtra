import React, { useState, useMemo } from 'react';
import { Search, AlertTriangle, Filter, X, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { AdminPortalLayout } from '../../components/layouts/AdminPortalLayout';
import { useAdminPortal } from '../../context/AdminPortalContext';
import { AlertActionModal } from '../../components/admin/AlertActionModal';
import {
  AlertSeverityBadge, AlertStatusBadge, AlertCategoryBadge,
} from '../../components/admin/AdminBadges';
import { EmptyState } from '../../components/common/EmptyState';
import { OperationalAlert, AlertCategory, AlertSeverity, AlertStatus } from '../../types/admin';

const CATEGORY_OPTIONS: { value: AlertCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'medicine_shortage', label: 'Medicine Shortage' },
  { value: 'diagnostic_unavailable', label: 'Diagnostic Unavailable' },
  { value: 'equipment_unavailable', label: 'Equipment Unavailable' },
  { value: 'facility_offline', label: 'Facility Offline' },
  { value: 'staff_capacity', label: 'Staff/Capacity' },
  { value: 'lab_backlog', label: 'Lab Backlog' },
  { value: 'excessive_queue', label: 'Excessive Queue' },
  { value: 'referral_delay', label: 'Referral Delay' },
  { value: 'data_sync_failure', label: 'Sync Failure' },
];

const SEV_OPTIONS: { value: AlertSeverity | 'all'; label: string }[] = [
  { value: 'all', label: 'All Severities' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const STATUS_OPTIONS: { value: AlertStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'new', label: 'New' },
  { value: 'acknowledged', label: 'Acknowledged' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'dismissed', label: 'Dismissed' },
];

type SortType = 'severity' | 'newest' | 'oldest';

export const AdminAlertsPage: React.FC = () => {
  const {
    alerts, users,
    acknowledgeAlert, assignAlert, moveAlertToInProgress,
    resolveAlert, reopenAlert, dismissAlert,
  } = useAdminPortal();

  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<AlertCategory | 'all'>('all');
  const [sevFilter, setSevFilter] = useState<AlertSeverity | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<AlertStatus | 'all'>('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [sortBy, setSortBy] = useState<SortType>('severity');
  const [selectedAlert, setSelectedAlert] = useState<OperationalAlert | null>(null);

  const filtered = useMemo(() => {
    let result = [...alerts];
    if (catFilter !== 'all') result = result.filter(a => a.category === catFilter);
    if (sevFilter !== 'all') result = result.filter(a => a.severity === sevFilter);
    if (statusFilter !== 'all') result = result.filter(a => a.status === statusFilter);
    if (districtFilter !== 'all') result = result.filter(a => a.district === districtFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.facilityName.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q)
      );
    }
    if (sortBy === 'severity') {
      const sev = { critical: 0, high: 1, medium: 2, low: 3 };
      result.sort((a, b) => sev[a.severity] - sev[b.severity]);
    } else if (sortBy === 'newest') {
      result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } else {
      result.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    }
    return result;
  }, [alerts, catFilter, sevFilter, statusFilter, districtFilter, search, sortBy]);

  const hasFilters = catFilter !== 'all' || sevFilter !== 'all' || statusFilter !== 'all' || districtFilter !== 'all' || search;

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const mins = Math.round((Date.now() - d.getTime()) / 60000);
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.round(mins / 60)}h ago`;
    return `${Math.round(mins / 1440)}d ago`;
  };

  const SelectFilter = ({ value, onChange, options, label }: {
    value: string; onChange: (v: string) => void;
    options: { value: string; label: string }[]; label: string;
  }) => (
    <div className="relative">
      <select value={value} onChange={e => onChange(e.target.value)} aria-label={label}
        className="text-xs rounded-xl border border-slate-200 dark:border-brand-dark-border bg-white dark:bg-brand-dark-surface px-3 py-2 pr-7 text-slate-700 dark:text-brand-dark-text focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  );

  const statusCounts = useMemo(() => ({
    new: alerts.filter(a => a.status === 'new').length,
    acknowledged: alerts.filter(a => a.status === 'acknowledged').length,
    in_progress: alerts.filter(a => a.status === 'in_progress').length,
    resolved: alerts.filter(a => a.status === 'resolved').length,
  }), [alerts]);

  return (
    <AdminPortalLayout
      pageTitle="Alerts & Shortages"
      pageSubtitle="Operational alert management"
      headerAction={
        <div className="flex items-center gap-2">
          {statusCounts.new > 0 && (
            <span className="flex items-center gap-1 text-xs font-bold text-white bg-rose-500 px-2.5 py-1 rounded-xl">
              <AlertTriangle className="w-3.5 h-3.5" />
              {statusCounts.new} New
            </span>
          )}
        </div>
      }
    >
      {/* Status Summary Chips */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {[
          { label: 'New', count: statusCounts.new, cls: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60' },
          { label: 'Acknowledged', count: statusCounts.acknowledged, cls: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60' },
          { label: 'In Progress', count: statusCounts.in_progress, cls: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60' },
          { label: 'Resolved', count: statusCounts.resolved, cls: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60' },
        ].map(item => (
          <div key={item.label} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${item.cls}`}>
            <span>{item.label}:</span>
            <span className="font-extrabold tabular-nums">{item.count}</span>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border p-3 mb-4 shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <div className="relative flex-1 min-w-44">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search alerts..."
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-brand-dark-border bg-white dark:bg-brand-dark-surface pl-8 pr-3 py-2 text-slate-900 dark:text-brand-dark-text focus:outline-none focus:ring-2 focus:ring-sky-500" />
          </div>
          <SelectFilter value={catFilter} onChange={v => setCatFilter(v as AlertCategory | 'all')} label="Category" options={CATEGORY_OPTIONS} />
          <SelectFilter value={sevFilter} onChange={v => setSevFilter(v as AlertSeverity | 'all')} label="Severity" options={SEV_OPTIONS} />
          <SelectFilter value={statusFilter} onChange={v => setStatusFilter(v as AlertStatus | 'all')} label="Status" options={STATUS_OPTIONS} />
          <SelectFilter value={districtFilter} onChange={setDistrictFilter} label="District"
            options={[{ value: 'all', label: 'All Districts' }, ...[].map(d => ({ value: d, label: d }))]} />
          <div className="relative flex items-center gap-1.5 text-xs text-slate-500 dark:text-brand-dark-muted">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <select value={sortBy} onChange={e => setSortBy(e.target.value as SortType)}
              className="text-xs rounded-xl border border-slate-200 dark:border-brand-dark-border bg-white dark:bg-brand-dark-surface px-2 py-2 pr-5 text-slate-700 dark:text-brand-dark-text focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none">
              <option value="severity">Sort: Severity</option>
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
            </select>
            <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>
          {hasFilters && (
            <button type="button" onClick={() => { setSearch(''); setCatFilter('all'); setSevFilter('all'); setStatusFilter('all'); setDistrictFilter('all'); }}
              className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 hover:underline">
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Alert List */}
      {filtered.length === 0 ? (
        <EmptyState icon={AlertTriangle} title="No alerts found"
          description="No operational alerts match your current filters. Try adjusting the search or filter criteria." />
      ) : (
        <div className="space-y-2">
          {filtered.map(alert => (
            <div key={alert.id}
              className={`bg-white dark:bg-brand-dark-surface rounded-2xl border shadow-xs p-4 hover:shadow-md transition-all cursor-pointer ${
                alert.severity === 'critical' && alert.status === 'new'
                  ? 'border-rose-300 dark:border-rose-800/80 ring-1 ring-rose-400 dark:ring-rose-700'
                  : 'border-slate-200 dark:border-brand-dark-border'
              }`}
              onClick={() => setSelectedAlert(alert)}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[10px] font-mono text-slate-400 dark:text-brand-dark-muted">{alert.id}</span>
                    <AlertSeverityBadge severity={alert.severity} />
                    <AlertStatusBadge status={alert.status} />
                    <AlertCategoryBadge category={alert.category} />
                  </div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-brand-dark-heading leading-snug">{alert.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-brand-dark-muted flex-wrap">
                    <span>{alert.facilityName}</span>
                    <span className="text-slate-300 dark:text-slate-600">·</span>
                    <span>{alert.district}</span>
                    <span className="text-slate-300 dark:text-slate-600">·</span>
                    <span>{formatTime(alert.createdAt)}</span>
                    {alert.assignedToName && (
                      <>
                        <span className="text-slate-300 dark:text-slate-600">·</span>
                        <span className="text-sky-600 dark:text-sky-400">Assigned: {alert.assignedToName}</span>
                      </>
                    )}
                  </div>
                </div>
                <button type="button" onClick={e => { e.stopPropagation(); setSelectedAlert(alert); }}
                  className="px-3 py-1.5 text-[11px] font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/60 border border-sky-200 dark:border-sky-800/60 rounded-lg transition-colors flex-shrink-0 whitespace-nowrap">
                  Manage
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Alert Action Modal */}
      <AlertActionModal
        alert={selectedAlert}
        admins={users}
        currentUserName="Sanjay Deshmukh (IAS)"
        onClose={() => setSelectedAlert(null)}
        onAcknowledge={acknowledgeAlert}
        onAssign={assignAlert}
        onMoveToInProgress={moveAlertToInProgress}
        onResolve={resolveAlert}
        onReopen={reopenAlert}
        onDismiss={dismissAlert}
      />
    </AdminPortalLayout>
  );
};
