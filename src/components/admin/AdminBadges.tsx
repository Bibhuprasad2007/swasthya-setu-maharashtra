/**
 * Admin Portal — Reusable Badge Components
 */

import React from 'react';
import {
  AlertCategory,
  AlertSeverity,
  AlertStatus,
  OperationalStatus,
  ConnectivityStatus,
  ReferralOperationalStatus,
  ReferralUrgency,
  AdminRole,
  AdminAccountStatus,
} from '../../types/admin';

// ─── Alert Severity ───────────────────────────────────────────────────────────

export const AlertSeverityBadge: React.FC<{ severity: AlertSeverity }> = ({ severity }) => {
  const map: Record<AlertSeverity, { label: string; cls: string }> = {
    critical: { label: 'Critical', cls: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60' },
    high:     { label: 'High',     cls: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-200 dark:border-orange-800/60' },
    medium:   { label: 'Medium',   cls: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60' },
    low:      { label: 'Low',      cls: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700' },
  };
  const { label, cls } = map[severity];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-md ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${severity === 'critical' ? 'bg-rose-500' : severity === 'high' ? 'bg-orange-500' : severity === 'medium' ? 'bg-amber-500' : 'bg-slate-400'}`} />
      {label}
    </span>
  );
};

// ─── Alert Status ─────────────────────────────────────────────────────────────

export const AlertStatusBadge: React.FC<{ status: AlertStatus }> = ({ status }) => {
  const map: Record<AlertStatus, { label: string; cls: string }> = {
    new:          { label: 'New',         cls: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60' },
    acknowledged: { label: 'Acknowledged', cls: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60' },
    in_progress:  { label: 'In Progress',  cls: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60' },
    resolved:     { label: 'Resolved',     cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60' },
    dismissed:    { label: 'Dismissed',    cls: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700' },
  };
  const { label, cls } = map[status];
  return <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-md ${cls}`}>{label}</span>;
};

// ─── Alert Category ───────────────────────────────────────────────────────────

export const AlertCategoryBadge: React.FC<{ category: AlertCategory }> = ({ category }) => {
  const labels: Record<AlertCategory, string> = {
    medicine_shortage:      'Medicine Shortage',
    diagnostic_unavailable: 'Diagnostic Unavailable',
    equipment_unavailable:  'Equipment Unavailable',
    facility_offline:       'Facility Offline',
    staff_capacity:         'Staff/Capacity',
    lab_backlog:            'Lab Backlog',
    excessive_queue:        'Excessive Queue',
    referral_delay:         'Referral Delay',
    data_sync_failure:      'Sync Failure',
  };
  return (
    <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
      {labels[category]}
    </span>
  );
};

// ─── Operational Status ───────────────────────────────────────────────────────

export const OperationalStatusBadge: React.FC<{ status: OperationalStatus }> = ({ status }) => {
  const map: Record<OperationalStatus, { label: string; cls: string }> = {
    operational:             { label: 'Operational',      cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60' },
    limited_services:        { label: 'Limited Services', cls: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60' },
    temporarily_unavailable: { label: 'Temp. Unavailable', cls: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-200 dark:border-orange-800/60' },
    inactive:                { label: 'Inactive',          cls: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700' },
  };
  const { label, cls } = map[status];
  return <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-md ${cls}`}>{label}</span>;
};

// ─── Connectivity Status ──────────────────────────────────────────────────────

export const ConnectivityStatusBadge: React.FC<{ status: ConnectivityStatus }> = ({ status }) => {
  const map: Record<ConnectivityStatus, { label: string; cls: string; dot: string }> = {
    online:        { label: 'Online',         dot: 'bg-emerald-500', cls: 'text-emerald-700 dark:text-emerald-300' },
    intermittent:  { label: 'Intermittent',   dot: 'bg-amber-500',   cls: 'text-amber-700 dark:text-amber-300' },
    offline:       { label: 'Offline',        dot: 'bg-rose-500',    cls: 'text-rose-700 dark:text-rose-300' },
    never_synced:  { label: 'Never Synced',   dot: 'bg-slate-400',   cls: 'text-slate-600 dark:text-slate-400' },
  };
  const { label, cls, dot } = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot} ${status === 'online' ? 'animate-pulse' : ''}`} />
      {label}
    </span>
  );
};

// ─── Referral Status ──────────────────────────────────────────────────────────

export const ReferralStatusBadge: React.FC<{ status: ReferralOperationalStatus; isDelayed?: boolean }> = ({ status, isDelayed }) => {
  const map: Record<ReferralOperationalStatus, { label: string; cls: string }> = {
    created:               { label: 'Created',              cls: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
    sent:                  { label: 'Sent',                 cls: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300' },
    accepted:              { label: 'Accepted',             cls: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300' },
    appointment_scheduled: { label: 'Appt. Scheduled',      cls: 'bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-300' },
    patient_reached:       { label: 'Patient Reached',      cls: 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300' },
    completed:             { label: 'Completed',            cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' },
    cancelled:             { label: 'Cancelled',            cls: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
    delayed:               { label: 'Delayed',              cls: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300' },
  };
  const { label, cls } = map[status] || { label: status, cls: 'bg-slate-100 text-slate-600' };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-md border border-transparent ${cls}`}>
      {isDelayed && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" />}
      {label}
    </span>
  );
};

// ─── Referral Urgency ─────────────────────────────────────────────────────────

export const ReferralUrgencyBadge: React.FC<{ urgency: ReferralUrgency }> = ({ urgency }) => {
  const map: Record<ReferralUrgency, { label: string; cls: string }> = {
    routine:   { label: 'Routine',   cls: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
    urgent:    { label: 'Urgent',    cls: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' },
    emergency: { label: 'Emergency', cls: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300' },
  };
  const { label, cls } = map[urgency];
  return <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-md ${cls}`}>{label}</span>;
};

// ─── Admin Role ───────────────────────────────────────────────────────────────

export const AdminRoleBadge: React.FC<{ role: AdminRole }> = ({ role }) => {
  const map: Record<AdminRole, { label: string; cls: string }> = {
    state_admin:      { label: 'State Admin',        cls: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60' },
    district_admin:   { label: 'District Admin',     cls: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60' },
    facility_admin:   { label: 'Facility Admin',     cls: 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60' },
    readonly_analyst: { label: 'Read-Only Analyst',  cls: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700' },
  };
  const { label, cls } = map[role];
  return <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-md ${cls}`}>{label}</span>;
};

// ─── Account Status ───────────────────────────────────────────────────────────

export const AccountStatusBadge: React.FC<{ status: AdminAccountStatus }> = ({ status }) => {
  const map: Record<AdminAccountStatus, { label: string; cls: string }> = {
    active:    { label: 'Active',    cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60' },
    suspended: { label: 'Suspended', cls: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60' },
    pending:   { label: 'Pending',   cls: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60' },
  };
  const { label, cls } = map[status];
  return <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-md ${cls}`}>{label}</span>;
};
