import React, { useState } from 'react';
import {
  BarChart3, Building2, Clock, FlaskConical, Pill,
  GitBranch, UserCheck, Download, ChevronDown, Info,
} from 'lucide-react';
import { AdminPortalLayout } from '../../components/layouts/AdminPortalLayout';
import { useAdminPortal } from '../../context/AdminPortalContext';

type ReportCard = {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  accentBg: string;
};

const REPORT_CARDS: ReportCard[] = [
  {
    id: 'facility_availability',
    label: 'Facility Service Availability',
    description: 'Availability and operational status by facility type and district.',
    icon: <Building2 className="w-5 h-5 text-sky-600 dark:text-sky-400" />,
    accentBg: 'bg-sky-50 dark:bg-sky-950/40',
  },
  {
    id: 'appointment_waiting',
    label: 'Appointment Waiting Times',
    description: 'OPD queue depth and average waiting times across facilities.',
    icon: <Clock className="w-5 h-5 text-violet-600 dark:text-violet-400" />,
    accentBg: 'bg-violet-50 dark:bg-violet-950/40',
  },
  {
    id: 'diagnostic_capacity',
    label: 'Diagnostic Lab Capacity',
    description: 'Lab order volumes, turnaround times, and backlog by facility.',
    icon: <FlaskConical className="w-5 h-5 text-teal-600 dark:text-teal-400" />,
    accentBg: 'bg-teal-50 dark:bg-teal-950/40',
  },
  {
    id: 'medicine_availability',
    label: 'Medicine Stock Availability',
    description: 'Prescription fulfilment, low-stock, and stock-out events.',
    icon: <Pill className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
    accentBg: 'bg-amber-50 dark:bg-amber-950/40',
  },
  {
    id: 'referral_completion',
    label: 'Referral Completion Analysis',
    description: 'Referral flow, completion rates, and delay analysis by district.',
    icon: <GitBranch className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
    accentBg: 'bg-indigo-50 dark:bg-indigo-950/40',
  },
  {
    id: 'followup_summary',
    label: 'Follow-up Completion Summary',
    description: 'High-risk patient follow-up completion rates by facility and time period.',
    icon: <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
    accentBg: 'bg-emerald-50 dark:bg-emerald-950/40',
  },
  {
    id: 'alert_resolution',
    label: 'Alert Resolution Analysis',
    description: 'Operational alert volumes, resolution times, and category breakdown.',
    icon: <BarChart3 className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
    accentBg: 'bg-rose-50 dark:bg-rose-950/40',
  },
];

export const AdminReportsPage: React.FC = () => {
  const { districtSummaries } = useAdminPortal();
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  });
  const [dateTo] = useState(new Date().toISOString().slice(0, 10));
  const [downloading, setDownloading] = useState<string | null>(null);
  const [exportMessage, setExportMessage] = useState('');

  const handleExport = (reportId: string, format: 'csv' | 'pdf') => {
    setDownloading(reportId);
    setTimeout(() => {
      setDownloading(null);
      setExportMessage(`"${REPORT_CARDS.find(r => r.id === reportId)?.label}" export (${format.toUpperCase()}) requested.`);
      setTimeout(() => setExportMessage(''), 5000);
    }, 1200);
  };

  return (
    <AdminPortalLayout
      pageTitle="Reports & Analytics"
      pageSubtitle="Aggregate operational reports"
    >
      {/* Privacy Notice */}
      <div className="flex items-center gap-2 p-3 mb-5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-amber-800 dark:text-amber-300">
        <Info className="w-4 h-4 flex-shrink-0" />
        <span>
          <strong>Data Policy:</strong> Reports contain only aggregated, de-identified operational metrics.
          No patient names, ABHA numbers, clinical details, prescriptions, or individual lab results are included in any report.
          Bulk patient data downloads are not available from this portal.
        </span>
      </div>

      {/* Scope Filters */}
      <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border p-4 mb-5 shadow-xs">
        <p className="text-xs font-semibold text-slate-600 dark:text-brand-dark-muted mb-3">Report Scope</p>
        <div className="flex items-center gap-3 flex-wrap">
          <div>
            <label className="text-[11px] text-slate-500 dark:text-brand-dark-muted block mb-1">Date From</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="text-xs rounded-xl border border-slate-200 dark:border-brand-dark-border bg-white dark:bg-brand-dark-elevated px-3 py-2 text-slate-700 dark:text-brand-dark-text focus:outline-none focus:ring-2 focus:ring-sky-500" />
          </div>
          <div>
            <label className="text-[11px] text-slate-500 dark:text-brand-dark-muted block mb-1">Date To</label>
            <input type="date" value={dateTo} readOnly
              className="text-xs rounded-xl border border-slate-200 dark:border-brand-dark-border bg-slate-50 dark:bg-brand-dark-elevated px-3 py-2 text-slate-500 dark:text-brand-dark-muted" />
          </div>
          <div>
            <label className="text-[11px] text-slate-500 dark:text-brand-dark-muted block mb-1">District</label>
            <div className="relative">
              <select value={selectedDistrict} onChange={e => setSelectedDistrict(e.target.value)}
                className="text-xs rounded-xl border border-slate-200 dark:border-brand-dark-border bg-white dark:bg-brand-dark-elevated px-3 py-2 pr-7 text-slate-700 dark:text-brand-dark-text focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none">
                <option value="all">State-wide</option>
                {districtSummaries.map(d => <option key={d.district} value={d.district}>{d.district}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {exportMessage && (
        <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs text-emerald-700 dark:text-emerald-300">
          ✓ {exportMessage}
        </div>
      )}

      {/* Report Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {REPORT_CARDS.map(card => (
          <div key={card.id} className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border p-4 shadow-xs">
            <div className={`inline-flex p-2.5 rounded-xl mb-3 ${card.accentBg}`}>{card.icon}</div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-brand-dark-heading mb-1">{card.label}</h3>
            <p className="text-xs text-slate-500 dark:text-brand-dark-muted mb-4 leading-relaxed">{card.description}</p>
            <div className="flex items-center gap-2">
              <button type="button"
                disabled={downloading === card.id}
                onClick={() => handleExport(card.id, 'csv')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/60 rounded-lg transition-colors disabled:opacity-60">
                {downloading === card.id ? (
                  <span className="animate-pulse">Exporting...</span>
                ) : (
                  <><Download className="w-3 h-3" /> CSV</>
                )}
              </button>
              <button type="button"
                disabled={downloading === card.id}
                onClick={() => handleExport(card.id, 'pdf')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/60 border border-sky-200 dark:border-sky-800/60 rounded-lg transition-colors disabled:opacity-60">
                {downloading === card.id ? (
                  <span className="animate-pulse">Exporting...</span>
                ) : (
                  <><Download className="w-3 h-3" /> PDF</>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Inline Charts */}
      <h3 className="text-base font-bold text-slate-800 dark:text-brand-dark-heading mb-3">Quick Analytics Preview</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border p-4 shadow-xs">
          <h4 className="text-sm font-bold text-slate-700 dark:text-brand-dark-heading mb-3">Consultations (7 Days)</h4>
          <div className="flex items-center justify-center h-[140px] text-xs text-slate-400 dark:text-brand-dark-muted border border-dashed border-slate-200 dark:border-brand-dark-border rounded-xl">
            No consultation data available
          </div>
        </div>
        <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border p-4 shadow-xs">
          <h4 className="text-sm font-bold text-slate-700 dark:text-brand-dark-heading mb-3">Lab Orders (7 Days)</h4>
          <div className="flex items-center justify-center h-[140px] text-xs text-slate-400 dark:text-brand-dark-muted border border-dashed border-slate-200 dark:border-brand-dark-border rounded-xl">
            No lab order data available
          </div>
        </div>
        <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border p-4 shadow-xs">
          <h4 className="text-sm font-bold text-slate-700 dark:text-brand-dark-heading mb-1">Referral Completion by District</h4>
          <p className="text-[11px] text-slate-500 dark:text-brand-dark-muted mb-3">% completed — Higher is better</p>
          <div className="flex items-center justify-center h-[140px] text-xs text-slate-400 dark:text-brand-dark-muted border border-dashed border-slate-200 dark:border-brand-dark-border rounded-xl">
            No referral completion data available
          </div>
        </div>
        <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border p-4 shadow-xs">
          <h4 className="text-sm font-bold text-slate-700 dark:text-brand-dark-heading mb-1">Prescription Fulfilment by District</h4>
          <p className="text-[11px] text-slate-500 dark:text-brand-dark-muted mb-3">% fulfilled — Higher is better</p>
          <div className="flex items-center justify-center h-[140px] text-xs text-slate-400 dark:text-brand-dark-muted border border-dashed border-slate-200 dark:border-brand-dark-border rounded-xl">
            No medicine fulfilment data available
          </div>
        </div>
        <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border p-4 shadow-xs lg:col-span-2">
          <h4 className="text-sm font-bold text-slate-700 dark:text-brand-dark-heading mb-1">District Performance Summary</h4>
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-brand-dark-elevated">
                  {['District', 'Facilities', 'Consultations', 'Wait (min)', 'Lab TAT', 'Referral %', 'Rx Fill %', 'Alerts'].map(h => (
                    <th key={h} className="text-left px-3 py-2 font-semibold text-slate-600 dark:text-brand-dark-muted whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {districtSummaries.map((d, i) => (
                  <tr key={d.district}
                    className={`border-t border-slate-100 dark:border-brand-dark-border hover:bg-slate-50 dark:hover:bg-brand-dark-elevated ${i % 2 === 0 ? '' : 'bg-slate-50/30'}`}>
                    <td className="px-3 py-2 font-semibold text-slate-800 dark:text-brand-dark-heading whitespace-nowrap">{d.district}</td>
                    <td className="px-3 py-2 text-center text-slate-700 dark:text-brand-dark-text">{d.activeFacilities}</td>
                    <td className="px-3 py-2 text-center font-mono text-slate-700 dark:text-brand-dark-text">{d.consultationsToday}</td>
                    <td className={`px-3 py-2 text-center font-mono font-bold ${d.avgWaitingMinutes > 40 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-brand-dark-text'}`}>{d.avgWaitingMinutes}</td>
                    <td className={`px-3 py-2 text-center font-mono font-bold ${d.labTurnaroundHours > 6 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-brand-dark-text'}`}>{d.labTurnaroundHours.toFixed(1)}h</td>
                    <td className={`px-3 py-2 text-center font-mono font-bold ${d.referralCompletionRate < 75 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>{d.referralCompletionRate}%</td>
                    <td className={`px-3 py-2 text-center font-mono font-bold ${d.medicineFulfilmentRate < 80 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'}`}>{d.medicineFulfilmentRate}%</td>
                    <td className="px-3 py-2 text-center">{d.activeAlerts > 0 ? <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold">{d.activeAlerts}</span> : <span className="text-slate-300 dark:text-slate-600">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminPortalLayout>
  );
};
