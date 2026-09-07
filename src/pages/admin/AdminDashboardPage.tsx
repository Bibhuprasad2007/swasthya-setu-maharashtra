import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Wifi, WifiOff, Users, Clock, FlaskConical,
  Pill, GitBranch, AlertTriangle, CheckCircle2, RefreshCw,
  TrendingUp, Activity,
} from 'lucide-react';
import { AdminPortalLayout } from '../../components/layouts/AdminPortalLayout';
import { useAdminPortal } from '../../context/AdminPortalContext';
import { AdminKpiCard } from '../../components/admin/AdminKpiCard';
import { AlertSeverityBadge, AlertStatusBadge } from '../../components/admin/AdminBadges';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { dashboardSummary: s, alerts, districtSummaries } = useAdminPortal();
  const [lastRefresh] = useState(new Date());

  const priorityAlerts = alerts
    .filter(a => a.status === 'new' || a.status === 'acknowledged')
    .sort((a, b) => {
      const sev = { critical: 0, high: 1, medium: 2, low: 3 };
      return sev[a.severity] - sev[b.severity];
    })
    .slice(0, 5);

  const formatRefresh = (d: Date) =>
    d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <AdminPortalLayout
      pageTitle="Command-Centre Dashboard"
      pageSubtitle="Statewide operational health network overview"
      headerAction={
        <span className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-brand-dark-muted">
          <RefreshCw className="w-3 h-3" />
          Last refreshed: {formatRefresh(lastRefresh)}
        </span>
      }
    >

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 mb-6">
        <AdminKpiCard icon={<Building2 className="w-5 h-5 text-sky-600 dark:text-sky-400" />}
          label="Total Facilities" value={s.totalFacilities}
          accentBg="bg-sky-50 dark:bg-sky-950/40" onClick={() => navigate('/admin/facilities')} />
        <AdminKpiCard icon={<Wifi className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          label="Facilities Online" value={s.facilitiesOnline}
          accentBg="bg-emerald-50 dark:bg-emerald-950/40" onClick={() => navigate('/admin/facilities')} />
        <AdminKpiCard icon={<WifiOff className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
          label="Connectivity Issues" value={s.facilitiesWithIssues}
          accentBg="bg-amber-50 dark:bg-amber-950/40" isAlert alertThreshold={0}
          onClick={() => navigate('/admin/facilities')} />
        <AdminKpiCard icon={<Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          label="Appointments Today" value={s.appointmentsToday}
          trend={s.appointmentsTrend} trendLabel="vs yesterday"
          accentBg="bg-blue-50 dark:bg-blue-950/40" />
        <AdminKpiCard icon={<Clock className="w-5 h-5 text-violet-600 dark:text-violet-400" />}
          label="Avg. Waiting Time" value={s.avgWaitingMinutes} suffix="min"
          trend={s.waitingTimeTrend} trendLabel="vs yesterday"
          accentBg="bg-violet-50 dark:bg-violet-950/40" isAlert alertThreshold={30} />
        <AdminKpiCard icon={<FlaskConical className="w-5 h-5 text-teal-600 dark:text-teal-400" />}
          label="Pending Lab Orders" value={s.pendingLabOrders}
          accentBg="bg-teal-50 dark:bg-teal-950/40" onClick={() => navigate('/admin/service-monitoring')} />
        <AdminKpiCard icon={<Activity className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />}
          label="Lab Turnaround" value={s.avgLabTurnaroundHours.toFixed(1)} suffix="hrs"
          trend={s.labTurnaroundTrend} trendLabel="vs yesterday"
          accentBg="bg-cyan-50 dark:bg-cyan-950/40" isAlert alertThreshold={4} />
        <AdminKpiCard icon={<GitBranch className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
          label="Pending Referrals" value={s.pendingReferrals}
          accentBg="bg-indigo-50 dark:bg-indigo-950/40" onClick={() => navigate('/admin/referrals')} />
        <AdminKpiCard icon={<AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
          label="Delayed Referrals" value={s.delayedReferrals}
          trend={s.referralDelayTrend} trendLabel="vs last week"
          accentBg="bg-rose-50 dark:bg-rose-950/40" isAlert alertThreshold={0}
          onClick={() => navigate('/admin/referrals')} />
        <AdminKpiCard icon={<Pill className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
          label="Low-Stock Medicines" value={s.lowStockMedicines}
          accentBg="bg-amber-50 dark:bg-amber-950/40" isAlert alertThreshold={0}
          onClick={() => navigate('/admin/alerts')} />
        <AdminKpiCard icon={<AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
          label="Out-of-Stock Essentials" value={s.outOfStockMedicines}
          accentBg="bg-rose-50 dark:bg-rose-950/40" isAlert alertThreshold={0}
          onClick={() => navigate('/admin/alerts')} />
        <AdminKpiCard icon={<CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          label="Prescription Fulfilment" value={`${s.prescriptionFulfilmentRate}%`}
          trend={s.fulfilmentTrend} trendLabel="vs last week"
          accentBg="bg-emerald-50 dark:bg-emerald-950/40" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Consultations Chart */}
        <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-brand-dark-heading">Consultations (7 Days)</h3>
              <p className="text-[11px] text-slate-500 dark:text-brand-dark-muted">Appointments vs. completed</p>
            </div>
          </div>
          <div className="flex items-center justify-center h-[150px] text-xs text-slate-400 dark:text-brand-dark-muted border border-dashed border-slate-200 dark:border-brand-dark-border rounded-xl">
            No consultation data available
          </div>
        </div>

        {/* Lab Orders Chart */}
        <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-brand-dark-heading">Lab Orders (7 Days)</h3>
              <p className="text-[11px] text-slate-500 dark:text-brand-dark-muted">Orders received vs. completed</p>
            </div>
          </div>
          <div className="flex items-center justify-center h-[150px] text-xs text-slate-400 dark:text-brand-dark-muted border border-dashed border-slate-200 dark:border-brand-dark-border rounded-xl">
            No lab order data available
          </div>
        </div>

        {/* Avg Waiting by District */}
        <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border p-4 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 dark:text-brand-dark-heading mb-1">Avg. Waiting Time by District</h3>
          <p className="text-[11px] text-slate-500 dark:text-brand-dark-muted mb-3">Minutes — Lower is better</p>
          <div className="flex items-center justify-center h-[150px] text-xs text-slate-400 dark:text-brand-dark-muted border border-dashed border-slate-200 dark:border-brand-dark-border rounded-xl">
            No waiting time data available
          </div>
        </div>

        {/* Referral Completion Rate */}
        <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border p-4 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 dark:text-brand-dark-heading mb-1">Referral Completion Rate by District</h3>
          <p className="text-[11px] text-slate-500 dark:text-brand-dark-muted mb-3">Percentage — Higher is better</p>
          <div className="flex items-center justify-center h-[150px] text-xs text-slate-400 dark:text-brand-dark-muted border border-dashed border-slate-200 dark:border-brand-dark-border rounded-xl">
            No referral completion data available
          </div>
        </div>
      </div>

      {/* Alerts + District Table Row */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Priority Alerts Panel */}
        <div className="xl:col-span-2 bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-brand-dark-heading flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                Priority Alerts
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-brand-dark-muted">Active alerts requiring attention</p>
            </div>
            <button type="button" onClick={() => navigate('/admin/alerts')}
              className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:underline">
              View all
            </button>
          </div>
          {priorityAlerts.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-xs text-slate-400 dark:text-brand-dark-muted border border-dashed border-slate-200 dark:border-brand-dark-border rounded-xl">
              No active priority alerts
            </div>
          ) : (
            <div className="space-y-2">
              {priorityAlerts.map(alert => (
                <div key={alert.id}
                  className="p-2.5 rounded-xl border border-slate-100 dark:border-brand-dark-border bg-slate-50/50 dark:bg-brand-dark-elevated hover:border-sky-200 dark:hover:border-sky-800/60 transition-colors cursor-pointer"
                  onClick={() => navigate('/admin/alerts')}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-[11px] font-semibold text-slate-800 dark:text-brand-dark-heading leading-tight flex-1">{alert.title}</p>
                    <AlertSeverityBadge severity={alert.severity} />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <AlertStatusBadge status={alert.status} />
                    <span className="text-[10px] text-slate-500 dark:text-brand-dark-muted">{alert.facilityName}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* District Performance Table */}
        <div className="xl:col-span-3 bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-brand-dark-border">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-brand-dark-heading flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-sky-500" />
                District Performance
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-brand-dark-muted">Key indicators by district</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs" role="table">
              <thead>
                <tr className="bg-slate-50 dark:bg-brand-dark-elevated">
                  <th className="text-left px-3 py-2 font-semibold text-slate-600 dark:text-brand-dark-muted whitespace-nowrap">District</th>
                  <th className="text-right px-3 py-2 font-semibold text-slate-600 dark:text-brand-dark-muted whitespace-nowrap">Wait (min)</th>
                  <th className="text-right px-3 py-2 font-semibold text-slate-600 dark:text-brand-dark-muted whitespace-nowrap">Lab TAT (h)</th>
                  <th className="text-right px-3 py-2 font-semibold text-slate-600 dark:text-brand-dark-muted whitespace-nowrap">Referral %</th>
                  <th className="text-right px-3 py-2 font-semibold text-slate-600 dark:text-brand-dark-muted whitespace-nowrap">Rx Fill %</th>
                  <th className="text-right px-3 py-2 font-semibold text-slate-600 dark:text-brand-dark-muted whitespace-nowrap">Alerts</th>
                </tr>
              </thead>
              <tbody>
                {districtSummaries.map((d, i) => (
                  <tr key={d.district}
                    className={`border-t border-slate-100 dark:border-brand-dark-border hover:bg-slate-50 dark:hover:bg-brand-dark-elevated transition-colors ${i % 2 === 0 ? '' : 'bg-slate-50/30 dark:bg-brand-dark-elevated/30'}`}>
                    <td className="px-3 py-2 font-semibold text-slate-800 dark:text-brand-dark-heading whitespace-nowrap">{d.district}</td>
                    <td className={`px-3 py-2 text-right font-mono tabular-nums ${d.avgWaitingMinutes > 40 ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-700 dark:text-brand-dark-text'}`}>
                      {d.avgWaitingMinutes}
                    </td>
                    <td className={`px-3 py-2 text-right font-mono tabular-nums ${d.labTurnaroundHours > 6 ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-700 dark:text-brand-dark-text'}`}>
                      {d.labTurnaroundHours.toFixed(1)}
                    </td>
                    <td className={`px-3 py-2 text-right font-mono tabular-nums ${d.referralCompletionRate < 75 ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-emerald-700 dark:text-emerald-400'}`}>
                      {d.referralCompletionRate}%
                    </td>
                    <td className={`px-3 py-2 text-right font-mono tabular-nums ${d.medicineFulfilmentRate < 80 ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-emerald-700 dark:text-emerald-400'}`}>
                      {d.medicineFulfilmentRate}%
                    </td>
                    <td className="px-3 py-2 text-right">
                      {d.activeAlerts > 0
                        ? <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold">{d.activeAlerts}</span>
                        : <span className="text-slate-300 dark:text-slate-600">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Medicine Fulfilment Chart */}
      <div className="mt-4 bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border p-4 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 dark:text-brand-dark-heading mb-1">Medicine Prescription Fulfilment by District</h3>
        <p className="text-[11px] text-slate-500 dark:text-brand-dark-muted mb-3">Percentage fulfilled — Higher is better</p>
          <div className="flex items-center justify-center h-[150px] text-xs text-slate-400 dark:text-brand-dark-muted border border-dashed border-slate-200 dark:border-brand-dark-border rounded-xl">
            No medicine fulfilment data available
          </div>
      </div>
    </AdminPortalLayout>
  );
};
