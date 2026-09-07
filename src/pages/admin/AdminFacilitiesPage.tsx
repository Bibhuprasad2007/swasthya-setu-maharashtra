import React, { useState, useMemo } from 'react';
import { Search, Building2, Filter, X, ChevronDown } from 'lucide-react';
import { AdminPortalLayout } from '../../components/layouts/AdminPortalLayout';
import { useAdminPortal } from '../../context/AdminPortalContext';
import { FacilityDetailDrawer } from '../../components/admin/FacilityDetailDrawer';
import { OperationalStatusBadge, ConnectivityStatusBadge } from '../../components/admin/AdminBadges';
import { EmptyState } from '../../components/common/EmptyState';
import { Facility, FacilityType, OperationalStatus, ConnectivityStatus } from '../../types/admin';
const FACILITY_TYPE_OPTIONS: { value: FacilityType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Facility Types' },
  { value: 'sub_centre', label: 'Sub-Centre' },
  { value: 'phc', label: 'Primary Health Centre' },
  { value: 'chc', label: 'Community Health Centre' },
  { value: 'rural_hospital', label: 'Rural Hospital' },
  { value: 'district_hospital', label: 'District Hospital' },
  { value: 'diagnostic_lab', label: 'Diagnostic Laboratory' },
  { value: 'public_pharmacy', label: 'Public Pharmacy' },
];

const OP_STATUS_OPTIONS: { value: OperationalStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'operational', label: 'Operational' },
  { value: 'limited_services', label: 'Limited Services' },
  { value: 'temporarily_unavailable', label: 'Temp. Unavailable' },
  { value: 'inactive', label: 'Inactive' },
];

const CONN_STATUS_OPTIONS: { value: ConnectivityStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Connectivity' },
  { value: 'online', label: 'Online' },
  { value: 'intermittent', label: 'Intermittent' },
  { value: 'offline', label: 'Offline' },
  { value: 'never_synced', label: 'Never Synced' },
];

const FACILITY_TYPE_LABELS: Record<FacilityType, string> = {
  sub_centre: 'Sub-Centre',
  phc: 'PHC',
  chc: 'CHC',
  rural_hospital: 'Rural Hospital',
  district_hospital: 'District Hospital',
  diagnostic_lab: 'Diagnostic Lab',
  public_pharmacy: 'Pharmacy',
};

export const AdminFacilitiesPage: React.FC = () => {
  const { facilities, alerts } = useAdminPortal();
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState<FacilityType | 'all'>('all');
  const [opFilter, setOpFilter] = useState<OperationalStatus | 'all'>('all');
  const [connFilter, setConnFilter] = useState<ConnectivityStatus | 'all'>('all');
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

  const filtered = useMemo(() => {
    return facilities.filter(f => {
      if (districtFilter !== 'all' && f.district !== districtFilter) return false;
      if (typeFilter !== 'all' && f.type !== typeFilter) return false;
      if (opFilter !== 'all' && f.operationalStatus !== opFilter) return false;
      if (connFilter !== 'all' && f.connectivityStatus !== connFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return f.name.toLowerCase().includes(q) || f.code.toLowerCase().includes(q) ||
          f.district.toLowerCase().includes(q) || f.taluka.toLowerCase().includes(q);
      }
      return true;
    });
  }, [facilities, districtFilter, typeFilter, opFilter, connFilter, search]);

  const hasFilters = districtFilter !== 'all' || typeFilter !== 'all' || opFilter !== 'all' || connFilter !== 'all' || search;

  const getAlertCount = (facilityCode: string) =>
    alerts.filter(a => a.facilityCode === facilityCode && a.status !== 'resolved' && a.status !== 'dismissed').length;

  const SelectFilter = ({ value, onChange, options, label }: {
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
    label: string;
  }) => (
    <div className="relative">
      <select value={value} onChange={e => onChange(e.target.value)}
        aria-label={label}
        className="text-xs rounded-xl border border-slate-200 dark:border-brand-dark-border bg-white dark:bg-brand-dark-surface px-3 py-2 pr-7 text-slate-700 dark:text-brand-dark-text focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  );

  return (
    <AdminPortalLayout
      pageTitle="Facility Network"
      pageSubtitle="Directory of all registered healthcare facilities"
      headerAction={
        <span className="text-xs font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 px-3 py-1.5 rounded-xl border border-sky-200 dark:border-sky-800/60">
          {filtered.length} of {facilities.length} facilities
        </span>
      }
    >
      {/* Filter Bar */}
      <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border p-4 mb-4 shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, code, district, taluka..."
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-brand-dark-border bg-white dark:bg-brand-dark-surface pl-8 pr-3 py-2 text-slate-900 dark:text-brand-dark-text focus:outline-none focus:ring-2 focus:ring-sky-500" />
            {search && (
              <button type="button" onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2">
                <X className="w-3.5 h-3.5 text-slate-400" />
              </button>
            )}
          </div>
          <SelectFilter value={districtFilter} onChange={setDistrictFilter} label="District filter"
            options={[{ value: 'all', label: 'All Districts' }, ...[].map(d => ({ value: d, label: d }))]} />
          <SelectFilter value={typeFilter} onChange={v => setTypeFilter(v as FacilityType | 'all')} label="Type filter" options={FACILITY_TYPE_OPTIONS} />
          <SelectFilter value={opFilter} onChange={v => setOpFilter(v as OperationalStatus | 'all')} label="Status filter" options={OP_STATUS_OPTIONS} />
          <SelectFilter value={connFilter} onChange={v => setConnFilter(v as ConnectivityStatus | 'all')} label="Connectivity filter" options={CONN_STATUS_OPTIONS} />
          {hasFilters && (
            <button type="button" onClick={() => { setSearch(''); setDistrictFilter('all'); setTypeFilter('all'); setOpFilter('all'); setConnFilter('all'); }}
              className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 hover:underline">
              <X className="w-3 h-3" /> Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState icon={Building2} title="No facilities found"
          description="No facilities match your current search or filter criteria. Try adjusting the filters." />
      ) : (
        <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs" role="table">
              <thead>
                <tr className="bg-slate-50 dark:bg-brand-dark-elevated border-b border-slate-200 dark:border-brand-dark-border">
                  {['Facility', 'Type', 'District / Taluka', 'Operational Status', 'Connectivity', 'Doctors', 'Queue', 'Alerts', 'Action'].map(h => (
                    <th key={h} className="text-left px-3 py-2.5 font-semibold text-slate-600 dark:text-brand-dark-muted whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((f, i) => {
                  const alertCount = getAlertCount(f.code);
                  return (
                    <tr key={f.id}
                      className={`border-t border-slate-100 dark:border-brand-dark-border hover:bg-slate-50 dark:hover:bg-brand-dark-elevated transition-colors ${i % 2 === 0 ? '' : 'bg-slate-50/30 dark:bg-brand-dark-elevated/20'}`}>
                      <td className="px-3 py-2.5">
                        <p className="font-semibold text-slate-800 dark:text-brand-dark-heading whitespace-nowrap">{f.name}</p>
                        <p className="text-[10px] text-slate-500 dark:text-brand-dark-muted font-mono">{f.code}</p>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-slate-600 dark:text-brand-dark-text">{FACILITY_TYPE_LABELS[f.type]}</td>
                      <td className="px-3 py-2.5">
                        <p className="font-medium text-slate-700 dark:text-brand-dark-text whitespace-nowrap">{f.district}</p>
                        <p className="text-[10px] text-slate-400 dark:text-brand-dark-muted">{f.taluka}</p>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap"><OperationalStatusBadge status={f.operationalStatus} /></td>
                      <td className="px-3 py-2.5 whitespace-nowrap"><ConnectivityStatusBadge status={f.connectivityStatus} /></td>
                      <td className="px-3 py-2.5 text-center font-mono tabular-nums text-slate-700 dark:text-brand-dark-text">{f.doctorsOnDuty}</td>
                      <td className="px-3 py-2.5 text-center font-mono tabular-nums">
                        <span className={f.currentQueueCount > 20 ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-700 dark:text-brand-dark-text'}>
                          {f.currentQueueCount}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {alertCount > 0
                          ? <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold">{alertCount}</span>
                          : <span className="text-slate-300 dark:text-slate-600">—</span>}
                      </td>
                      <td className="px-3 py-2.5">
                        <button type="button" onClick={() => setSelectedFacility(f)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/60 border border-sky-200 dark:border-sky-800/60 rounded-lg transition-colors whitespace-nowrap">
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Facility Detail Drawer */}
      <FacilityDetailDrawer
        facility={selectedFacility}
        alertCount={selectedFacility ? getAlertCount(selectedFacility.code) : 0}
        onClose={() => setSelectedFacility(null)}
      />
    </AdminPortalLayout>
  );
};
