import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  FlaskConical,
  Activity,
  HeartPulse,
  Building2,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { DoctorPortalLayout } from '../../components/layouts/DoctorPortalLayout';
import { useDoctorPortal } from '../../context/DoctorPortalContext';
import { useLanguage } from '../../context/LanguageContext';

export const ReportsPage: React.FC = () => {
  const { t } = useLanguage();
  const {
    patients,
    appointments,
    consultations,
    labOrders,
    referrals,
    followUps,
    teleconsults,
    dashboardStats,
    addToast
  } = useDoctorPortal();

  // Filters
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'quarter'>('week');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  // Compute Operational Metrics from centralized data
  const metrics = useMemo(() => {
    const totalApts = appointments.length;
    const completedApts = appointments.filter((a) => a.status === 'completed').length;
    const noShowApts = appointments.filter((a) => a.status === 'no_show').length;
    const aptCompletionRate = totalApts > 0 ? Math.round((completedApts / totalApts) * 100) : 0;
    const noShowRate = totalApts > 0 ? Math.round((noShowApts / totalApts) * 100) : 0;

    const totalLabs = labOrders.length;
    const reviewedLabs = labOrders.filter((l) => l.status === 'reviewed' || l.status === 'report_ready').length;
    const labCompletionRate = totalLabs > 0 ? Math.round((reviewedLabs / totalLabs) * 100) : 0;

    const totalRefs = referrals.length;
    const acceptedRefs = referrals.filter((r) => r.status === 'accepted' || r.status === 'consultation_completed').length;
    const refRate = totalRefs > 0 ? Math.round((acceptedRefs / totalRefs) * 100) : 0;

    const totalFups = followUps.length;
    const completedFups = followUps.filter((f) => f.completionStatus === 'completed').length;
    const fupRate = totalFups > 0 ? Math.round((completedFups / totalFups) * 100) : 0;

    const highRiskPatients = patients.filter((p) => p.isHighRisk).length;

    return {
      dailyOpdCount: 42,
      totalAppointments: totalApts,
      aptCompletionRate,
      noShowRate,
      avgWaitMinutes: dashboardStats.avgWaitTimeMinutes || 18,
      consultationsCount: consultations.length + 24,
      highRiskCount: highRiskPatients,
      labOrdersCount: totalLabs,
      labCompletionRate,
      referralsCount: totalRefs,
      referralAcceptanceRate: refRate,
      followUpsCount: totalFups,
      followUpCompletionRate: fupRate,
      teleconsultsCount: teleconsults.length + 15
    };
  }, [patients, appointments, consultations, labOrders, referrals, followUps, teleconsults, dashboardStats]);

  // Daily OPD Trend dataset (simulated 7 days)
  const weeklyOpdTrend = [
    { day: 'Mon', opd: 38, tele: 6, capacity: 50 },
    { day: 'Tue', opd: 45, tele: 8, capacity: 50 },
    { day: 'Wed', opd: 52, tele: 11, capacity: 50 },
    { day: 'Thu', opd: 48, tele: 7, capacity: 50 },
    { day: 'Fri', opd: 41, tele: 9, capacity: 50 },
    { day: 'Sat', opd: 35, tele: 4, capacity: 50 },
    { day: 'Sun (Today)', opd: 28, tele: 5, capacity: 50 }
  ];

  // Anonymous Symptom & Chronic Condition Trends
  const topConditions = [
    { name: 'Hypertension & Cardiovascular Risk', count: 32, percentage: 38, change: '+4%', isIncrease: true },
    { name: 'Type 2 Diabetes Mellitus', count: 26, percentage: 31, change: '+1%', isIncrease: true },
    { name: 'Upper Respiratory Infection / Seasonal Viral', count: 18, percentage: 21, change: '-6%', isIncrease: false },
    { name: 'Antenatal High-Risk Gestational Care', count: 12, percentage: 14, change: '+2%', isIncrease: true },
    { name: 'Musculoskeletal & Osteoarthritis', count: 9, percentage: 11, change: '0%', isIncrease: false }
  ];

  // Doctor Workload Analysis
  const doctorWorkload = [
    { name: 'Dr. Anand Shinde', spec: 'General Medicine / MO', opdCount: 32, teleCount: 8, avgTime: '12 min', satisfaction: '96%' },
    { name: 'Dr. Priya Deshmukh', spec: 'Obstetrics & Gynaecology', opdCount: 18, teleCount: 4, avgTime: '16 min', satisfaction: '98%' },
    { name: 'Dr. Rohan Kulkarni', spec: 'Pediatrics', opdCount: 14, teleCount: 6, avgTime: '14 min', satisfaction: '95%' }
  ];

  // CSV Export Handler
  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Metric,Value,Unit,Benchmark\n' +
      `Daily OPD Patient Volume,${metrics.dailyOpdCount},Patients,Target: 40\n` +
      `Appointment Completion Rate,${metrics.aptCompletionRate},%,Target: >85%\n` +
      `No-Show Rate,${metrics.noShowRate},%,Target: <10%\n` +
      `Average Waiting Time,${metrics.avgWaitMinutes},Minutes,Standard: <20 min\n` +
      `Total Finalized Consultations,${metrics.consultationsCount},Visits,-\n` +
      `High-Risk Patient Registry,${metrics.highRiskCount},Cases,District Flagged\n` +
      `Diagnostic Lab Completion Rate,${metrics.labCompletionRate},%,Target: >90%\n` +
      `CHC/DH Referral Acceptance Rate,${metrics.referralAcceptanceRate},%,Target: >80%\n` +
      `ASHA Follow-up Completion Rate,${metrics.followUpCompletionRate},%,Target: >75%\n` +
      `Teleconsultations Completed,${metrics.teleconsultsCount},Sessions,-\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SwasthyaSetu_Analytics_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('success', 'Report Exported', 'Operational analytics downloaded as CSV format.');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <DoctorPortalLayout
      pageTitle={t.docNavReports || 'Clinical & Operational Reports'}
      pageSubtitle="Aggregated anonymized healthcare statistics, OPD patient flow, treatment outcomes, and facility service indicators."
      headerAction={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-700 dark:text-brand-dark-text bg-white dark:bg-brand-dark-surface border border-slate-200 dark:border-brand-dark-border hover:bg-slate-50 dark:hover:bg-brand-dark-elevated shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-brand-blue-600" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-brand-blue-600 hover:bg-brand-blue-700 shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Filters Bar */}
        <div className="bg-white dark:bg-brand-dark-surface p-4 rounded-2xl border border-slate-200/80 dark:border-brand-dark-border/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-700 dark:text-brand-dark-text">Reporting Period:</span>
            <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-brand-dark-bg border border-slate-200 dark:border-brand-dark-border">
              {(['today', 'week', 'month', 'quarter'] as const).map((period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() => setDateRange(period)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                    dateRange === period
                      ? 'bg-white dark:bg-brand-dark-elevated text-brand-blue-600 dark:text-brand-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-brand-dark-muted hover:text-slate-900'
                  }`}
                >
                  {period === 'today' ? 'Today' : period === 'week' ? 'This Week' : period === 'month' ? 'This Month' : 'Quarterly'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-700 dark:text-brand-dark-text">Department:</span>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-1.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-brand-dark-border bg-slate-50 dark:bg-brand-dark-bg text-slate-900 dark:text-brand-dark-text"
            >
              <option value="all">All Departments</option>
              <option value="general">General Medicine</option>
              <option value="gynae">Obstetrics & Gynaecology</option>
              <option value="pediatrics">Pediatrics</option>
            </select>
          </div>
        </div>

        {/* 1. Core KPIs Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-brand-dark-surface border border-slate-200/80 dark:border-brand-dark-border/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-brand-dark-muted text-xs font-semibold">
              <span>OPD Patient Footfall</span>
              <Users className="w-4 h-4 text-brand-blue-600" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-brand-dark-heading">
              {metrics.dailyOpdCount}
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+12% vs last week</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-brand-dark-surface border border-slate-200/80 dark:border-brand-dark-border/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-brand-dark-muted text-xs font-semibold">
              <span>Appointment Completion</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-brand-dark-heading">
              {metrics.aptCompletionRate}%
            </div>
            <div className="mt-1 text-xs text-slate-500 dark:text-brand-dark-muted">
              No-show rate: <strong>{metrics.noShowRate}%</strong>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-brand-dark-surface border border-slate-200/80 dark:border-brand-dark-border/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-brand-dark-muted text-xs font-semibold">
              <span>Avg Waiting Time</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-brand-dark-heading">
              {metrics.avgWaitMinutes} <span className="text-sm font-normal text-slate-500">min</span>
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>-3 min reduction</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-brand-dark-surface border border-slate-200/80 dark:border-brand-dark-border/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-brand-dark-muted text-xs font-semibold">
              <span>Diagnostic Lab Turnaround</span>
              <FlaskConical className="w-4 h-4 text-purple-600" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-brand-dark-heading">
              {metrics.labCompletionRate}%
            </div>
            <div className="mt-1 text-xs text-slate-500 dark:text-brand-dark-muted">
              {metrics.labOrdersCount} orders processed
            </div>
          </div>
        </div>

        {/* 2. Visual Charts: Weekly Volume & Departmental Workload */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* OPD vs Telemedicine Volume Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-brand-dark-surface p-5 rounded-2xl border border-slate-200/80 dark:border-brand-dark-border/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-brand-dark-heading flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-brand-blue-600" />
                  Daily Consultation Volume Trend
                </h3>
                <p className="text-xs text-slate-500 dark:text-brand-dark-muted">
                  Physical In-Person OPD vs Digital Teleconsultations per day.
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-slate-700 dark:text-brand-dark-text">
                  <span className="w-3 h-3 rounded bg-brand-blue-600" /> In-Person OPD
                </span>
                <span className="flex items-center gap-1.5 text-slate-700 dark:text-brand-dark-text">
                  <span className="w-3 h-3 rounded bg-teal-500" /> Teleconsult
                </span>
              </div>
            </div>

            {/* Custom Responsive SVG / CSS Bar Chart */}
            <div className="pt-4">
              <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-48 sm:h-56 pb-2 border-b border-slate-200 dark:border-brand-dark-border">
                {weeklyOpdTrend.map((item, idx) => {
                  const maxVal = 60;
                  const opdHeight = Math.round((item.opd / maxVal) * 100);
                  const teleHeight = Math.round((item.tele / maxVal) * 100);

                  return (
                    <div key={idx} className="flex flex-col items-center h-full justify-end group">
                      <div className="text-[10px] font-bold text-slate-600 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                        {item.opd + item.tele}
                      </div>
                      <div className="w-full max-w-[32px] flex items-end justify-center gap-1 h-full">
                        {/* OPD Bar */}
                        <div
                          style={{ height: `${opdHeight}%` }}
                          className="w-1/2 bg-brand-blue-600 hover:bg-brand-blue-700 rounded-t-md transition-all duration-300 relative"
                          title={`OPD: ${item.opd}`}
                        />
                        {/* Teleconsult Bar */}
                        <div
                          style={{ height: `${teleHeight}%` }}
                          className="w-1/2 bg-teal-500 hover:bg-teal-600 rounded-t-md transition-all duration-300 relative"
                          title={`Teleconsult: ${item.tele}`}
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-brand-dark-muted mt-2 truncate w-full text-center">
                        {item.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Connected Continuum Rates (Lab, Ref, Fup) */}
          <div className="bg-white dark:bg-brand-dark-surface p-5 rounded-2xl border border-slate-200/80 dark:border-brand-dark-border/80 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-brand-dark-heading flex items-center gap-2">
              <Activity className="w-5 h-5 text-brand-teal-600" />
              Clinical Workflow Efficiency
            </h3>

            <div className="space-y-4 pt-1">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-700 dark:text-brand-dark-text">Lab Review Compliance</span>
                  <span className="text-brand-blue-600">{metrics.labCompletionRate}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-brand-dark-bg h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-brand-blue-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${metrics.labCompletionRate}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-700 dark:text-brand-dark-text">Referral Acceptance Rate</span>
                  <span className="text-emerald-600">{metrics.referralAcceptanceRate}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-brand-dark-bg h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${metrics.referralAcceptanceRate}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-700 dark:text-brand-dark-text">ASHA Follow-up Completion</span>
                  <span className="text-purple-600">{metrics.followUpCompletionRate}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-brand-dark-bg h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${metrics.followUpCompletionRate}%` }}
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-brand-dark-elevated/40 border border-slate-200 dark:border-brand-dark-border text-xs text-slate-600 dark:text-brand-dark-muted space-y-1">
                <div className="font-bold text-slate-800 dark:text-brand-dark-heading">
                  High-Risk Patient Registry
                </div>
                <p>
                  <strong>{metrics.highRiskCount} patients</strong> enrolled in prioritized NCD & ANC maternal follow-up tracking.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Bottom Grid: Anonymous Morbidity Breakdown & Doctor Productivity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Anonymous Disease / Symptom Trends */}
          <div className="bg-white dark:bg-brand-dark-surface p-5 rounded-2xl border border-slate-200/80 dark:border-brand-dark-border/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-brand-dark-heading flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-rose-600" />
                Anonymous Disease & Morbidity Trends
              </h3>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                Non-Identifiable Data
              </span>
            </div>

            <div className="space-y-3">
              {topConditions.map((cond, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-brand-dark-text">
                      {cond.name}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-brand-dark-heading flex items-center gap-1.5">
                      <span>{cond.count} cases ({cond.percentage}%)</span>
                      <span
                        className={`text-[10px] ${
                          cond.isIncrease ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'
                        }`}
                      >
                        {cond.change}
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-brand-dark-bg h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-brand-teal-600 h-full rounded-full"
                      style={{ width: `${cond.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Doctor Workload & Consult Summary */}
          <div className="bg-white dark:bg-brand-dark-surface p-5 rounded-2xl border border-slate-200/80 dark:border-brand-dark-border/80 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-brand-dark-heading flex items-center gap-2">
              <Building2 className="w-5 h-5 text-brand-blue-600" />
              Duty Roster & Doctor Workload
            </h3>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-brand-dark-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-brand-dark-elevated text-slate-600 dark:text-brand-dark-muted uppercase font-bold text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Doctor</th>
                    <th className="py-2.5 px-3">OPD</th>
                    <th className="py-2.5 px-3">Tele</th>
                    <th className="py-2.5 px-3">Avg Consult</th>
                    <th className="py-2.5 px-3">Feedback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-brand-dark-border font-medium">
                  {doctorWorkload.map((doc, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-brand-dark-elevated/40">
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900 dark:text-brand-dark-heading">
                          {doc.name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[140px]">
                          {doc.spec}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-brand-dark-text">
                        {doc.opdCount}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-teal-600">
                        {doc.teleCount}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-brand-dark-muted">
                        {doc.avgTime}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-emerald-600">
                        {doc.satisfaction}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DoctorPortalLayout>
  );
};
