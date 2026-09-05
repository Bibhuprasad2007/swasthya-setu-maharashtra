import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList, TestTube, FlaskConical, FileCheck2,
  AlertTriangle, Activity, Clock, TrendingUp, ChevronRight, Zap,
  Bell,
} from 'lucide-react';
import { useLabPortal } from '../../context/LabPortalContext';
import { LabPortalLayout } from '../../components/layouts/LabPortalLayout';
import { LabOrderStatusBadge, LabPriorityBadge } from '../../components/lab/LabBadges';
import { formatDistanceToNow } from '../../utils/labUtils';

// ─── Summary Card ─────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent: string;
  onClick?: () => void;
  alert?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, accent, onClick, alert }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full text-left bg-white dark:bg-brand-dark-surface rounded-2xl border shadow-xs p-5 transition-all hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-teal-500
      ${alert && value > 0
        ? 'border-rose-200 dark:border-rose-800/60 ring-1 ring-rose-300 dark:ring-rose-700/60'
        : 'border-slate-200 dark:border-brand-dark-border'
      }`}
  >
    <div className="flex items-start justify-between gap-3">
      <div className={`p-2.5 rounded-xl ${accent} flex-shrink-0`}>
        {icon}
      </div>
      {alert && value > 0 && (
        <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 rounded px-1.5 py-0.5 animate-pulse">
          ACTION
        </span>
      )}
    </div>
    <div className="mt-3">
      <p className="text-2xl font-bold text-slate-900 dark:text-brand-dark-heading">{value}</p>
      <p className="text-xs text-slate-500 dark:text-brand-dark-muted mt-0.5 font-medium">{label}</p>
    </div>
  </button>
);

// ─── Activity Icon ────────────────────────────────────────────────────────────

const ActivityIcon: React.FC<{ type: string }> = ({ type }) => {
  const map: Record<string, React.ReactNode> = {
    order_received: <ClipboardList className="w-3.5 h-3.5 text-blue-500" />,
    order_accepted: <ClipboardList className="w-3.5 h-3.5 text-teal-500" />,
    order_rejected: <ClipboardList className="w-3.5 h-3.5 text-rose-500" />,
    sample_collected: <TestTube className="w-3.5 h-3.5 text-cyan-500" />,
    sample_rejected: <TestTube className="w-3.5 h-3.5 text-rose-500" />,
    processing_started: <FlaskConical className="w-3.5 h-3.5 text-violet-500" />,
    result_entered: <Activity className="w-3.5 h-3.5 text-orange-500" />,
    result_submitted: <Activity className="w-3.5 h-3.5 text-orange-600" />,
    report_verified: <FileCheck2 className="w-3.5 h-3.5 text-emerald-500" />,
    critical_flagged: <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />,
    doctor_reviewed: <FileCheck2 className="w-3.5 h-3.5 text-slate-500" />,
  };
  return <>{map[type] ?? <Activity className="w-3.5 h-3.5 text-slate-400" />}</>;
};

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export const LabDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { orders, dashboardStats, activity, notifications, verifiedReports } = useLabPortal();

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.orderDateTime).getTime() - new Date(a.orderDateTime).getTime())
    .slice(0, 5);

  const pendingSampleOrders = orders.filter(o => ['accepted', 'sample_pending'].includes(o.status)).slice(0, 4);

  const awaitingVerification = orders.filter(o => o.status === 'awaiting_verification').slice(0, 3);

  const criticalReports = verifiedReports.filter(r => r.hasCritical && !r.criticalAcknowledged);

  const unacknowledgedNotifs = notifications.filter(n => !n.acknowledged);

  return (
    <LabPortalLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-brand-dark-heading tracking-tight">
            Lab Dashboard
          </h2>
          <p className="text-xs text-slate-500 dark:text-brand-dark-muted mt-0.5">
            SwasthyaSetu Diagnostic Centre — Real-time workflow overview
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/laboratory/test-orders')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800/60 rounded-xl transition-colors"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            View Orders
          </button>
          <button
            type="button"
            onClick={() => navigate('/laboratory/samples')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/50 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 border border-cyan-200 dark:border-cyan-800/60 rounded-xl transition-colors"
          >
            <TestTube className="w-3.5 h-3.5" />
            Collect Sample
          </button>
          <button
            type="button"
            onClick={() => navigate('/laboratory/result-entry')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/50 hover:bg-violet-100 dark:hover:bg-violet-900/60 border border-violet-200 dark:border-violet-800/60 rounded-xl transition-colors"
          >
            <FlaskConical className="w-3.5 h-3.5" />
            Enter Results
          </button>
          <button
            type="button"
            onClick={() => navigate('/laboratory/reports')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/60 rounded-xl transition-colors"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            Reports
          </button>
        </div>
      </div>

      {/* Critical Alert Banner */}
      {criticalReports.length > 0 && (
        <div className="mb-5 p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-2xl flex items-start gap-3">
          <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/50 flex-shrink-0">
            <Zap className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-rose-800 dark:text-rose-300">
              {criticalReports.length} Critical Result{criticalReports.length > 1 ? 's' : ''} Require Doctor Communication
            </h3>
            <p className="text-xs text-rose-700 dark:text-rose-400 mt-0.5">
              {criticalReports.map(r => r.patientName).join(', ')} — Verify communication and acknowledge.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/laboratory/reports')}
            className="flex-shrink-0 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:underline"
          >
            View Reports →
          </button>
        </div>
      )}

      {/* Notification Banner */}
      {unacknowledgedNotifs.length > 0 && (
        <div className="mb-5 p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl flex items-start gap-3">
          <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
              {unacknowledgedNotifs.length} doctor notification{unacknowledgedNotifs.length > 1 ? 's' : ''} pending acknowledgement.
            </p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 mb-6">
        <StatCard
          icon={<ClipboardList className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          label="New Test Orders"
          value={dashboardStats.newOrders}
          accent="bg-blue-50 dark:bg-blue-950/50"
          onClick={() => navigate('/laboratory/test-orders')}
          alert
        />
        <StatCard
          icon={<TestTube className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
          label="Pending Samples"
          value={dashboardStats.pendingSamples}
          accent="bg-amber-50 dark:bg-amber-950/50"
          onClick={() => navigate('/laboratory/samples')}
          alert
        />
        <StatCard
          icon={<FlaskConical className="w-5 h-5 text-violet-600 dark:text-violet-400" />}
          label="Processing"
          value={dashboardStats.processing}
          accent="bg-violet-50 dark:bg-violet-950/50"
          onClick={() => navigate('/laboratory/result-entry')}
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />}
          label="Awaiting Verification"
          value={dashboardStats.awaitingVerification}
          accent="bg-orange-50 dark:bg-orange-950/50"
          onClick={() => navigate('/laboratory/result-entry')}
          alert
        />
        <StatCard
          icon={<FileCheck2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          label="Reports Ready"
          value={dashboardStats.reportsReady}
          accent="bg-emerald-50 dark:bg-emerald-950/50"
          onClick={() => navigate('/laboratory/reports')}
        />
        <StatCard
          icon={<AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
          label="Critical Results"
          value={dashboardStats.criticalResults}
          accent="bg-rose-50 dark:bg-rose-950/50"
          onClick={() => navigate('/laboratory/reports')}
          alert
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5">

        {/* Recent Orders */}
        <div className="xl:col-span-2 bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-brand-dark-border">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-brand-dark-heading">Recent Test Orders</h3>
              <p className="text-[11px] text-slate-500 dark:text-brand-dark-muted mt-0.5">Latest orders received from doctors</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/laboratory/test-orders')}
              className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-semibold flex items-center gap-1"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="overflow-x-auto">
            {recentOrders.length === 0 ? (
              <div className="p-10 text-center text-slate-400 dark:text-brand-dark-muted text-sm">No orders yet.</div>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-brand-dark-elevated border-b border-slate-100 dark:border-brand-dark-border">
                    <th className="text-left px-4 py-2.5 font-semibold text-slate-600 dark:text-brand-dark-muted whitespace-nowrap">Order ID</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-slate-600 dark:text-brand-dark-muted">Patient</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-slate-600 dark:text-brand-dark-muted hidden sm:table-cell">Tests</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-slate-600 dark:text-brand-dark-muted">Priority</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-slate-600 dark:text-brand-dark-muted">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-brand-dark-border">
                  {recentOrders.map(order => (
                    <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-brand-dark-elevated transition-colors">
                      <td className="px-4 py-3 font-mono font-semibold text-teal-700 dark:text-teal-400 whitespace-nowrap">{order.id}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800 dark:text-brand-dark-heading truncate max-w-[120px]">{order.patientName}</div>
                        <div className="text-slate-400 dark:text-brand-dark-muted text-[10px]">{order.patientId}</div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <div className="text-slate-600 dark:text-brand-dark-text truncate max-w-[160px]">
                          {order.tests.map(t => t.testName).join(', ')}
                        </div>
                      </td>
                      <td className="px-4 py-3"><LabPriorityBadge priority={order.priority} size="sm" /></td>
                      <td className="px-4 py-3"><LabOrderStatusBadge status={order.status} size="sm" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-4">

          {/* Pending Sample Collections */}
          <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border shadow-xs overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-brand-dark-border">
              <h3 className="text-sm font-bold text-slate-900 dark:text-brand-dark-heading">Pending Sample Collection</h3>
              <button type="button" onClick={() => navigate('/laboratory/samples')} className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-semibold">
                View All
              </button>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-brand-dark-border">
              {pendingSampleOrders.length === 0 ? (
                <div className="p-6 text-center text-slate-400 dark:text-brand-dark-muted text-xs">No pending collections.</div>
              ) : (
                pendingSampleOrders.map(order => (
                  <div key={order.id} className="px-4 py-3 flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 flex-shrink-0">
                      <TestTube className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 dark:text-brand-dark-heading truncate">{order.patientName}</p>
                      <p className="text-[10px] text-slate-500 dark:text-brand-dark-muted">{order.id} · {order.tests[0]?.testName}</p>
                    </div>
                    <LabPriorityBadge priority={order.priority} size="sm" />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Awaiting Verification */}
          <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border shadow-xs overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-brand-dark-border">
              <h3 className="text-sm font-bold text-slate-900 dark:text-brand-dark-heading">Awaiting Verification</h3>
              <button type="button" onClick={() => navigate('/laboratory/result-entry')} className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-semibold">
                View All
              </button>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-brand-dark-border">
              {awaitingVerification.length === 0 ? (
                <div className="p-6 text-center text-slate-400 dark:text-brand-dark-muted text-xs">All results verified.</div>
              ) : (
                awaitingVerification.map(order => (
                  <div key={order.id} className="px-4 py-3 flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/30 flex-shrink-0">
                      <Clock className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 dark:text-brand-dark-heading truncate">{order.patientName}</p>
                      <p className="text-[10px] text-slate-500 dark:text-brand-dark-muted">{order.id}</p>
                    </div>
                    <LabPriorityBadge priority={order.priority} size="sm" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-4 bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-brand-dark-border">
          <h3 className="text-sm font-bold text-slate-900 dark:text-brand-dark-heading">Recent Laboratory Activity</h3>
          <p className="text-[11px] text-slate-500 dark:text-brand-dark-muted mt-0.5">Audit trail of recent workflow actions</p>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-brand-dark-border">
          {activity.slice(0, 8).map(item => (
            <div key={item.id} className="flex items-start gap-3 px-5 py-3">
              <div className="mt-0.5 p-1.5 rounded-lg bg-slate-50 dark:bg-brand-dark-elevated flex-shrink-0">
                <ActivityIcon type={item.type} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 dark:text-brand-dark-heading">
                  {item.patientName} — <span className="font-mono text-teal-600 dark:text-teal-400">{item.orderId}</span>
                </p>
                {item.note && <p className="text-[11px] text-slate-500 dark:text-brand-dark-muted mt-0.5 truncate">{item.note}</p>}
                <p className="text-[10px] text-slate-400 dark:text-brand-dark-muted mt-0.5">
                  {formatDistanceToNow(item.timestamp)} · {item.performedBy}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Footer */}
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-400 dark:text-brand-dark-muted">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Total orders: {orders.length} · Active this session</span>
        </div>
      </div>
    </LabPortalLayout>
  );
};
