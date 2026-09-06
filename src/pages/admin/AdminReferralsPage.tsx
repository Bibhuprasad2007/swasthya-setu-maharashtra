import React, { useState, useMemo } from 'react';
import {
  GitBranch, AlertTriangle, Search, Filter, X, ChevronDown,
  Flag, ArrowUpCircle,
} from 'lucide-react';
import { AdminPortalLayout } from '../../components/layouts/AdminPortalLayout';
import { useAdminPortal } from '../../context/AdminPortalContext';
import {
  ReferralStatusBadge,
  ReferralUrgencyBadge,
} from '../../components/admin/AdminBadges';
import { EmptyState } from '../../components/common/EmptyState';
import { ReferralOperationalSummary, ReferralOperationalStatus, ReferralUrgency } from '../../types/admin';
import { MAHARASHTRA_DISTRICTS } from '../../data/adminMockData';

const STATUS_OPTIONS: { value: ReferralOperationalStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'created', label: 'Created' },
  { value: 'sent', label: 'Sent' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'appointment_scheduled', label: 'Appt. Scheduled' },
  { value: 'patient_reached', label: 'Patient Reached' },
  { value: 'completed', label: 'Completed' },
  { value: 'delayed', label: 'Delayed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const URGENCY_OPTIONS: { value: ReferralUrgency | 'all'; label: string }[] = [
  { value: 'all', label: 'All Urgencies' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'routine', label: 'Routine' },
];

export const AdminReferralsPage: React.FC = () => {
  const { referrals, flagReferralCoordination, escalateReferral } = useAdminPortal();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReferralOperationalStatus | 'all'>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<ReferralUrgency | 'all'>('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [showDelayedOnly, setShowDelayedOnly] = useState(false);
  const [flagModal, setFlagModal] = useState<ReferralOperationalSummary | null>(null);
  const [flagNote, setFlagNote] = useState('');

  const filtered = useMemo(() => {
    let result = [...referrals];
    if (statusFilter !== 'all') result = result.filter(r => r.status === statusFilter);
    if (urgencyFilter !== 'all') result = result.filter(r => r.urgency === urgencyFilter);
    if (districtFilter !== 'all') result = result.filter(r => r.district === districtFilter);
    if (showDelayedOnly) result = result.filter(r => r.isDelayed);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(r =>
        r.maskedRef.toLowerCase().includes(q) ||
        r.sourceFacilityName.toLowerCase().includes(q) ||
        r.destinationFacilityName.toLowerCase().includes(q) ||
        r.referralCategory.toLowerCase().includes(q)
      );
    }
    return result;
  }, [referrals, statusFilter, urgencyFilter, districtFilter, showDelayedOnly, search]);

  const delayed = referrals.filter(r => r.isDelayed).length;
  const hasFilters = statusFilter !== 'all' || urgencyFilter !== 'all' || districtFilter !== 'all' || showDelayedOnly || search;

  const formatTime = (iso: string) => new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

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

  return (
    <AdminPortalLayout
      pageTitle="Referral Monitoring"
      pageSubtitle="Operational coordination monitoring — Prototype Data. No patient identifiers are shown."
      headerAction={
        delayed > 0 ? (
          <span className="flex items-center gap-1.5 text-xs font-bold text-white bg-rose-500 px-2.5 py-1 rounded-xl">
            <AlertTriangle className="w-3.5 h-3.5" />
            {delayed} Delayed
          </span>
        ) : undefined
      }
    >
      {/* Privacy Banner */}
      <div className="flex items-center gap-2 p-3 mb-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-amber-800 dark:text-amber-300">
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        <span><strong>Privacy:</strong> Individual patient names, ABHA IDs, clinical notes, and contact details are not shown. Only anonymized case references and operational logistics are visible.</span>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border p-3 mb-4 shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <div className="relative flex-1 min-w-44">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search referral ref., facility, category..."
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-brand-dark-border bg-white dark:bg-brand-dark-surface pl-8 pr-3 py-2 text-slate-900 dark:text-brand-dark-text focus:outline-none focus:ring-2 focus:ring-sky-500" />
          </div>
          <SelectFilter value={statusFilter} onChange={v => setStatusFilter(v as ReferralOperationalStatus | 'all')} label="Status" options={STATUS_OPTIONS} />
          <SelectFilter value={urgencyFilter} onChange={v => setUrgencyFilter(v as ReferralUrgency | 'all')} label="Urgency" options={URGENCY_OPTIONS} />
          <SelectFilter value={districtFilter} onChange={setDistrictFilter} label="District"
            options={[{ value: 'all', label: 'All Districts' }, ...MAHARASHTRA_DISTRICTS.map(d => ({ value: d, label: d }))]} />
          <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-brand-dark-muted cursor-pointer">
            <input type="checkbox" checked={showDelayedOnly} onChange={e => setShowDelayedOnly(e.target.checked)}
              className="w-3.5 h-3.5 rounded accent-rose-500" />
            Delayed only
          </label>
          {hasFilters && (
            <button type="button" onClick={() => { setSearch(''); setStatusFilter('all'); setUrgencyFilter('all'); setDistrictFilter('all'); setShowDelayedOnly(false); }}
              className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 hover:underline">
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Referral List */}
      {filtered.length === 0 ? (
        <EmptyState icon={GitBranch} title="No referrals found"
          description="No referrals match the current filters. Try adjusting the search criteria." />
      ) : (
        <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs" role="table">
              <thead>
                <tr className="bg-slate-50 dark:bg-brand-dark-elevated border-b border-slate-200 dark:border-brand-dark-border">
                  {['Case Ref.', 'Category', 'Urgency', 'From', 'To', 'Status', 'Pending (hrs)', 'Created', 'Actions'].map(h => (
                    <th key={h} className="text-left px-3 py-2.5 font-semibold text-slate-600 dark:text-brand-dark-muted whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={r.id}
                    className={`border-t border-slate-100 dark:border-brand-dark-border hover:bg-slate-50 dark:hover:bg-brand-dark-elevated transition-colors ${
                      r.isDelayed ? 'bg-rose-50/30 dark:bg-rose-950/10' : i % 2 === 0 ? '' : 'bg-slate-50/30 dark:bg-brand-dark-elevated/20'
                    }`}>
                    <td className="px-3 py-2.5">
                      <span className="font-mono text-[11px] text-slate-700 dark:text-brand-dark-text">{r.maskedRef}</span>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-slate-700 dark:text-brand-dark-text">{r.referralCategory}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap"><ReferralUrgencyBadge urgency={r.urgency} /></td>
                    <td className="px-3 py-2.5">
                      <p className="font-medium text-slate-800 dark:text-brand-dark-heading whitespace-nowrap">{r.sourceFacilityName}</p>
                      <p className="text-[10px] text-slate-400 dark:text-brand-dark-muted">{r.district}</p>
                    </td>
                    <td className="px-3 py-2.5 font-medium text-slate-700 dark:text-brand-dark-text whitespace-nowrap">
                      {r.destinationFacilityName}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <ReferralStatusBadge status={r.status} isDelayed={r.isDelayed} />
                    </td>
                    <td className={`px-3 py-2.5 text-center font-mono tabular-nums font-bold ${
                      r.timePendingHours > 24 ? 'text-rose-600 dark:text-rose-400' :
                      r.timePendingHours > 8 ? 'text-amber-600 dark:text-amber-400' :
                      'text-slate-600 dark:text-brand-dark-text'
                    }`}>
                      {r.timePendingHours}h
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-slate-500 dark:text-brand-dark-muted">
                      {formatTime(r.createdAt)}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1">
                        <button type="button"
                          title="Flag coordination issue"
                          onClick={() => { setFlagModal(r); setFlagNote(r.coordinationFlagNote || ''); }}
                          className={`p-1.5 rounded-lg transition-colors ${
                            r.coordinationFlaggedBy
                              ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400'
                              : 'text-slate-400 hover:text-amber-600 dark:text-brand-dark-muted dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                          }`}>
                          <Flag className="w-3.5 h-3.5" />
                        </button>
                        <button type="button"
                          title="Escalate to facility CMO"
                          onClick={() => escalateReferral(r.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 dark:text-brand-dark-muted dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-colors">
                          <ArrowUpCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Flag Coordination Modal */}
      {flagModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => setFlagModal(null)}>
          <div className="w-full max-w-md bg-white dark:bg-brand-dark-surface rounded-2xl shadow-2xl border border-slate-200 dark:border-brand-dark-border p-5"
            onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-slate-800 dark:text-brand-dark-heading mb-1">
              Flag Coordination Issue
            </h3>
            <p className="text-xs text-slate-500 dark:text-brand-dark-muted mb-3">
              Case ref: <strong>{flagModal.maskedRef}</strong> — {flagModal.referralCategory}
            </p>
            <textarea value={flagNote} onChange={e => setFlagNote(e.target.value)}
              placeholder="Describe the coordination issue (e.g. destination hospital not responding)..."
              rows={4}
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-brand-dark-border bg-white dark:bg-brand-dark-elevated px-3 py-2 text-slate-900 dark:text-brand-dark-text focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none mb-3" />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setFlagModal(null)}
                className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-brand-dark-text bg-slate-100 dark:bg-brand-dark-elevated rounded-xl hover:bg-slate-200 transition-colors">
                Cancel
              </button>
              <button type="button" disabled={!flagNote.trim()} onClick={() => {
                if (flagNote.trim()) {
                  flagReferralCoordination(flagModal.id, flagNote.trim());
                  setFlagModal(null);
                }
              }}
                className="px-3 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-xl transition-colors">
                Submit Flag
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminPortalLayout>
  );
};
