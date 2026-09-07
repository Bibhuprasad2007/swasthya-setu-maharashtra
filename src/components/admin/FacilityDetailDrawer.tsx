/**
 * Facility Detail Drawer — Tabbed details panel
 */

import React, { useState } from 'react';
import { X, Building2, Phone, User, Clock, Wifi, CheckCircle2, XCircle } from 'lucide-react';
import { Facility } from '../../types/admin';
import { OperationalStatusBadge, ConnectivityStatusBadge } from './AdminBadges';

type Tab = 'overview' | 'capacity' | 'performance' | 'alerts';

interface FacilityDetailDrawerProps {
  facility: Facility | null;
  alertCount: number;
  onClose: () => void;
}

const FACILITY_TYPE_LABELS: Record<string, string> = {
  sub_centre: 'Sub-Centre',
  phc: 'Primary Health Centre',
  chc: 'Community Health Centre',
  rural_hospital: 'Rural Hospital',
  district_hospital: 'District Hospital',
  diagnostic_lab: 'Diagnostic Laboratory',
  public_pharmacy: 'Public Pharmacy / Medicine Counter',
};

export const FacilityDetailDrawer: React.FC<FacilityDetailDrawerProps> = ({
  facility,
  alertCount,
  onClose,
}) => {
  const [tab, setTab] = useState<Tab>('overview');

  if (!facility) return null;

  const perf: any = null;

  const ServiceRow = ({ label, available }: { label: string; available: boolean }) => (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-brand-dark-border last:border-0">
      <span className="text-xs text-slate-600 dark:text-brand-dark-text">{label}</span>
      {available
        ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        : <XCircle className="w-4 h-4 text-slate-300 dark:text-slate-600" />}
    </div>
  );

  const MetricRow = ({ label, value, unit = '' }: { label: string; value: string | number; unit?: string }) => (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-brand-dark-border last:border-0">
      <span className="text-xs text-slate-600 dark:text-brand-dark-text">{label}</span>
      <span className="text-xs font-bold text-slate-800 dark:text-brand-dark-heading tabular-nums">{value}{unit}</span>
    </div>
  );

  const formatSync = (iso?: string) => {
    if (!iso) return 'Never';
    const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.round(mins / 60)}h ago`;
    return `${Math.round(mins / 1440)}d ago`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-brand-dark-surface shadow-2xl flex flex-col h-full overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-slate-200 dark:border-brand-dark-border bg-slate-50 dark:bg-brand-dark-elevated">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <OperationalStatusBadge status={facility.operationalStatus} />
              <ConnectivityStatusBadge status={facility.connectivityStatus} />
            </div>
            <h2 id="drawer-title" className="text-sm font-bold text-slate-900 dark:text-brand-dark-heading leading-tight">{facility.name}</h2>
            <p className="text-[11px] text-slate-500 dark:text-brand-dark-muted mt-0.5">{FACILITY_TYPE_LABELS[facility.type]} · {facility.district}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close facility drawer"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:text-brand-dark-muted dark:hover:text-brand-dark-heading hover:bg-slate-100 dark:hover:bg-brand-dark-bg transition-colors flex-shrink-0 ml-3">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-brand-dark-border px-4 bg-white dark:bg-brand-dark-surface">
          {(['overview', 'capacity', 'performance', 'alerts'] as Tab[]).map(t => (
            <button key={t} type="button" onClick={() => setTab(t)}
              className={`px-3 py-2.5 text-xs font-semibold capitalize transition-colors border-b-2 -mb-px ${
                tab === t
                  ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                  : 'border-transparent text-slate-500 dark:text-brand-dark-muted hover:text-slate-700 dark:hover:text-brand-dark-text'
              }`}>
              {t === 'alerts' ? `Alerts (${alertCount})` : t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {tab === 'overview' && (
            <div className="space-y-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-brand-dark-muted mb-2">Facility Identity</p>
                <MetricRow label="Facility Code" value={facility.code} />
                <MetricRow label="Type" value={FACILITY_TYPE_LABELS[facility.type]} />
                <MetricRow label="District" value={facility.district} />
                <MetricRow label="Taluka / Block" value={facility.taluka} />
                <MetricRow label="Village / Town" value={facility.village} />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-brand-dark-muted mb-2">Contact & In-Charge</p>
                <div className="flex items-center gap-2 py-1.5 border-b border-slate-100 dark:border-brand-dark-border">
                  <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="text-xs text-slate-600 dark:text-brand-dark-text flex-1">In-Charge</span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-brand-dark-heading">{facility.inChargeName}</span>
                </div>
                <div className="flex items-center gap-2 py-1.5 border-b border-slate-100 dark:border-brand-dark-border">
                  <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="text-xs text-slate-600 dark:text-brand-dark-text flex-1">Contact</span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-brand-dark-heading">{facility.contactPhone}</span>
                </div>
                <div className="flex items-center gap-2 py-1.5">
                  <Wifi className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="text-xs text-slate-600 dark:text-brand-dark-text flex-1">Last Sync</span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-brand-dark-heading flex items-center gap-1">
                    <Clock className="w-3 h-3" />{formatSync(facility.lastSyncAt)}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-brand-dark-muted mb-2">Available Services</p>
                <ServiceRow label="OPD / Outpatient" available={facility.hasOPD} />
                <ServiceRow label="Emergency" available={facility.hasEmergency} />
                <ServiceRow label="Teleconsultation" available={facility.hasTeleconsultation} />
                <ServiceRow label="Diagnostic Laboratory" available={facility.hasLaboratory} />
                <ServiceRow label="Pharmacy / Medicine Counter" available={facility.hasPharmacy} />
              </div>
            </div>
          )}

          {tab === 'capacity' && (
            <div className="space-y-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-brand-dark-muted mb-2">Current Staffing</p>
                <MetricRow label="Doctors on Duty" value={facility.doctorsOnDuty} />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-brand-dark-muted mb-2">OPD & Queue</p>
                <MetricRow label="Current Queue Count" value={facility.currentQueueCount} />
                <MetricRow label="Avg. Waiting Time" value={facility.avgWaitingMinutes} unit=" min" />
              </div>
              {facility.totalBeds !== undefined && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-brand-dark-muted mb-2">Bed Capacity</p>
                  <MetricRow label="Total Beds" value={facility.totalBeds ?? 'N/A'} />
                  <MetricRow label="Available Beds" value={facility.availableBeds ?? 'N/A'} />
                  <MetricRow label="Bed Occupancy" value={
                    facility.totalBeds && facility.availableBeds !== undefined
                      ? `${Math.round(((facility.totalBeds - facility.availableBeds) / facility.totalBeds) * 100)}%`
                      : 'N/A'
                  } />
                </div>
              )}
            </div>
          )}

          {tab === 'performance' && (
            <div className="space-y-4">
              {perf ? (
                <>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-brand-dark-muted mb-2">Today's Appointments & Consultations</p>
                    <MetricRow label="Scheduled Appointments" value={perf.appointmentsScheduled} />
                    <MetricRow label="Completed Consultations" value={perf.consultationsCompleted} />
                    <MetricRow label="Avg. Waiting Time" value={perf.avgWaitingMinutes} unit=" min" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-brand-dark-muted mb-2">Lab & Referrals</p>
                    <MetricRow label="Lab Orders Pending" value={perf.labOrdersPending} />
                    <MetricRow label="Lab Turnaround (avg)" value={perf.labTurnaroundHours} unit=" hrs" />
                    <MetricRow label="Referral Completion" value={`${perf.referralCompletionRate}%`} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-brand-dark-muted mb-2">Medicine & Follow-ups</p>
                    <MetricRow label="Prescription Fulfilment" value={`${perf.prescriptionFulfilmentRate}%`} />
                    <MetricRow label="Follow-up Completion" value={`${perf.followupCompletionRate}%`} />
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-32 text-xs text-slate-400 dark:text-brand-dark-muted border border-dashed border-slate-200 dark:border-brand-dark-border rounded-xl">
                  Performance data not yet available for this facility.
                </div>
              )}
            </div>
          )}

          {tab === 'alerts' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 dark:text-brand-dark-muted">
                {alertCount > 0
                  ? `${alertCount} active alert(s) associated with this facility. View and manage them on the Alerts & Shortages page.`
                  : 'No active alerts for this facility.'}
              </p>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60">
                <Building2 className="w-4 h-4 text-sky-500 flex-shrink-0" />
                <p className="text-xs text-sky-700 dark:text-sky-300">
                  For a full alert audit trail, navigate to <strong>Alerts & Shortages</strong> and filter by this facility.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
