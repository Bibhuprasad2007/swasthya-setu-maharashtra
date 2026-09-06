import React, { useState } from 'react';
import {
  Stethoscope, FlaskConical, Pill, Wifi,
  Users, Clock, GitBranch, Activity,
  TrendingUp, PackageCheck, AlertCircle,
} from 'lucide-react';
import { AdminPortalLayout } from '../../components/layouts/AdminPortalLayout';
import { useAdminPortal } from '../../context/AdminPortalContext';

type ServiceTab = 'doctor' | 'lab' | 'pharmacy' | 'connectivity';

const MetricCard = ({ label, value, unit = '', icon, accent }: {
  label: string; value: string | number; unit?: string;
  icon: React.ReactNode; accent: string;
}) => (
  <div className={`bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border p-4 shadow-xs`}>
    <div className={`inline-flex p-2 rounded-xl mb-2 ${accent}`}>{icon}</div>
    <p className="text-xl font-extrabold text-slate-900 dark:text-brand-dark-heading font-mono tabular-nums">
      {typeof value === 'number' ? value.toLocaleString() : value}{unit}
    </p>
    <p className="text-xs text-slate-500 dark:text-brand-dark-muted mt-0.5 font-medium">{label}</p>
  </div>
);

export const AdminServiceMonitoringPage: React.FC = () => {
  const { serviceSnapshot: s } = useAdminPortal();
  const [tab, setTab] = useState<ServiceTab>('doctor');

  const tabs: { key: ServiceTab; label: string; icon: React.ReactNode }[] = [
    { key: 'doctor', label: 'Doctor Services', icon: <Stethoscope className="w-4 h-4" /> },
    { key: 'lab', label: 'Diagnostic Services', icon: <FlaskConical className="w-4 h-4" /> },
    { key: 'pharmacy', label: 'Pharmacy Services', icon: <Pill className="w-4 h-4" /> },
    { key: 'connectivity', label: 'Digital Connectivity', icon: <Wifi className="w-4 h-4" /> },
  ];

  return (
    <AdminPortalLayout
      pageTitle="Service Monitoring"
      pageSubtitle="Unified operational snapshot from all portals — Prototype Data"
    >
      <div className="flex items-center gap-1 flex-wrap mb-4 bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border p-1.5 shadow-xs">
        {tabs.map(t => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl transition-colors ${
              tab === t.key
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-brand-dark-muted hover:bg-slate-100 dark:hover:bg-brand-dark-elevated'
            }`}>
            {t.icon}
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {tab === 'doctor' && (
        <div>
          <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl px-3 py-2 mb-4">
            <strong>Privacy Notice:</strong> Only aggregated operational data is shown. No individual patient records, consultation notes, or personal identifiers are accessible here.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <MetricCard label="Appointments Today" value={s.appointmentsToday} icon={<Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />} accent="bg-blue-50 dark:bg-blue-950/40" />
            <MetricCard label="Consultations Completed" value={s.consultationsCompleted} icon={<TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />} accent="bg-emerald-50 dark:bg-emerald-950/40" />
            <MetricCard label="Current Queue (All Facilities)" value={s.currentQueueTotal} icon={<Activity className="w-5 h-5 text-violet-600 dark:text-violet-400" />} accent="bg-violet-50 dark:bg-violet-950/40" />
            <MetricCard label="Avg. Waiting Time" value={s.avgWaitingMinutes} unit=" min" icon={<Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />} accent="bg-amber-50 dark:bg-amber-950/40" />
            <MetricCard label="Doctors Available" value={s.doctorsAvailable} icon={<Stethoscope className="w-5 h-5 text-sky-600 dark:text-sky-400" />} accent="bg-sky-50 dark:bg-sky-950/40" />
            <MetricCard label="Follow-ups Due Today" value={s.followupsDue} icon={<Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />} accent="bg-orange-50 dark:bg-orange-950/40" />
            <MetricCard label="Pending Referrals" value={s.pendingReferrals} icon={<GitBranch className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />} accent="bg-indigo-50 dark:bg-indigo-950/40" />
          </div>
        </div>
      )}

      {tab === 'lab' && (
        <div>
          <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl px-3 py-2 mb-4">
            <strong>Privacy Notice:</strong> Individual diagnostic test results are not accessible here. Only aggregated operational metrics are shown.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <MetricCard label="Lab Orders Pending" value={s.labOrdersPending} icon={<FlaskConical className="w-5 h-5 text-teal-600 dark:text-teal-400" />} accent="bg-teal-50 dark:bg-teal-950/40" />
            <MetricCard label="Samples Collected" value={s.labSamplesCollected} icon={<PackageCheck className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />} accent="bg-cyan-50 dark:bg-cyan-950/40" />
            <MetricCard label="Tests in Progress" value={s.labInProgress} icon={<Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />} accent="bg-blue-50 dark:bg-blue-950/40" />
            <MetricCard label="Awaiting Verification" value={s.labAwaitingVerification} icon={<AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />} accent="bg-amber-50 dark:bg-amber-950/40" />
            <MetricCard label="Reports Ready" value={s.labReportsReady} icon={<TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />} accent="bg-emerald-50 dark:bg-emerald-950/40" />
            <MetricCard label="Avg. Turnaround Time" value={s.labAvgTurnaroundHours.toFixed(1)} unit=" hrs" icon={<Clock className="w-5 h-5 text-violet-600 dark:text-violet-400" />} accent="bg-violet-50 dark:bg-violet-950/40" />
            <MetricCard label="Unavailable Test Types" value={s.unavailableLabTests} icon={<AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />} accent="bg-rose-50 dark:bg-rose-950/40" />
            <MetricCard label="Total Lab Backlog" value={s.labBacklogCount} icon={<Activity className="w-5 h-5 text-orange-600 dark:text-orange-400" />} accent="bg-orange-50 dark:bg-orange-950/40" />
          </div>
        </div>
      )}

      {tab === 'pharmacy' && (
        <div>
          <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl px-3 py-2 mb-4">
            <strong>Privacy Notice:</strong> Individual patient prescriptions, names, and contact details are not accessible here. Only aggregated pharmacy operational metrics are shown.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <MetricCard label="Prescriptions Pending" value={s.prescriptionsPending} icon={<Pill className="w-5 h-5 text-sky-600 dark:text-sky-400" />} accent="bg-sky-50 dark:bg-sky-950/40" />
            <MetricCard label="Fully Dispensed" value={s.prescriptionsFullyDispensed} icon={<PackageCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />} accent="bg-emerald-50 dark:bg-emerald-950/40" />
            <MetricCard label="Partially Dispensed" value={s.prescriptionsPartiallyDispensed} icon={<Activity className="w-5 h-5 text-amber-600 dark:text-amber-400" />} accent="bg-amber-50 dark:bg-amber-950/40" />
            <MetricCard label="Pending Reservations" value={s.reservationsPending} icon={<Clock className="w-5 h-5 text-violet-600 dark:text-violet-400" />} accent="bg-violet-50 dark:bg-violet-950/40" />
            <MetricCard label="Low-Stock Medicines" value={s.lowStockMedicines} icon={<AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />} accent="bg-amber-50 dark:bg-amber-950/40" />
            <MetricCard label="Out-of-Stock Essentials" value={s.outOfStockEssentials} icon={<AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />} accent="bg-rose-50 dark:bg-rose-950/40" />
            <MetricCard label="Near-Expiry Batches" value={s.nearExpiryBatches} icon={<AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />} accent="bg-orange-50 dark:bg-orange-950/40" />
            <MetricCard label="Avg. Reservation Processing" value={s.avgReservationProcessingHours.toFixed(1)} unit=" hrs" icon={<Clock className="w-5 h-5 text-teal-600 dark:text-teal-400" />} accent="bg-teal-50 dark:bg-teal-950/40" />
          </div>
        </div>
      )}

      {tab === 'connectivity' && (
        <div>
          <p className="text-xs text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-xl px-3 py-2 mb-4">
            This data structure is ready for future low-connectivity and offline-sync monitoring as the network expands to more facilities.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <MetricCard label="Facilities Online" value={s.facilitiesOnline} icon={<Wifi className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />} accent="bg-emerald-50 dark:bg-emerald-950/40" />
            <MetricCard label="Facilities Intermittent" value={s.facilitiesIntermittent} icon={<Wifi className="w-5 h-5 text-amber-600 dark:text-amber-400" />} accent="bg-amber-50 dark:bg-amber-950/40" />
            <MetricCard label="Facilities Offline" value={s.facilitiesOffline} icon={<Wifi className="w-5 h-5 text-rose-600 dark:text-rose-400" />} accent="bg-rose-50 dark:bg-rose-950/40" />
            <MetricCard label="Pending Sync Records" value={s.pendingSyncRecords} icon={<Activity className="w-5 h-5 text-violet-600 dark:text-violet-400" />} accent="bg-violet-50 dark:bg-violet-950/40" />
            <MetricCard label="Facilities Needing Support" value={s.facilitiesNeedingSupport} icon={<AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />} accent="bg-rose-50 dark:bg-rose-950/40" />
          </div>
        </div>
      )}
    </AdminPortalLayout>
  );
};
