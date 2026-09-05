import React, { useState, useMemo, useRef } from 'react';
import {
  Search, FileCheck2, Eye, Printer, ChevronDown,
  AlertTriangle, UserCheck, X, Clock, CheckCircle2,
  Download, Bell, Shield,
} from 'lucide-react';
import { useLabPortal } from '../../context/LabPortalContext';
import { LabPortalLayout } from '../../components/layouts/LabPortalLayout';
import { LabPriorityBadge, ResultFlagBadge } from '../../components/lab/LabBadges';
import { VerifiedReport } from '../../types/lab';
import { formatDateTime, formatDate } from '../../utils/labUtils';
import { EmptyState } from '../../components/common/EmptyState';

// ─── Report Detail View ───────────────────────────────────────────────────────

const ReportDetailView: React.FC<{
  report: VerifiedReport;
  onClose: () => void;
  onMarkReviewed: (id: string) => void;
  onAckCritical: (reportId: string) => void;
}> = ({ report, onClose, onMarkReviewed, onAckCritical }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Lab Report ${report.id}</title><style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 24px; font-size: 12px; color: #1e293b; }
      h1 { font-size: 16px; margin-bottom: 4px; } h2 { font-size: 14px; margin-bottom: 8px; }
      .header { text-align: center; border-bottom: 2px solid #0d9488; padding-bottom: 12px; margin-bottom: 16px; }
      .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px; }
      .label { color: #64748b; font-size: 10px; } .value { font-weight: 600; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
      th, td { border: 1px solid #e2e8f0; padding: 6px 8px; text-align: left; font-size: 11px; }
      th { background: #f8fafc; font-weight: 600; color: #475569; }
      .critical { color: #dc2626; font-weight: 700; } .high { color: #d97706; font-weight: 600; } .low { color: #2563eb; }
      .footer { border-top: 1px solid #e2e8f0; padding-top: 12px; margin-top: 16px; font-size: 10px; color: #94a3b8; text-align: center; }
      .disclaimer { margin-top: 12px; padding: 8px; background: #fefce8; border: 1px solid #fef08a; font-size: 10px; color: #854d0e; }
      @media print { body { padding: 16px; } }
    </style></head><body>`);
    w.document.write(`
      <div class="header">
        <h1>${report.labName}</h1>
        <p style="font-size:10px;color:#64748b;">${report.labCode} · SwasthyaSetu Maharashtra Diagnostic Network</p>
        <h2 style="margin-top:8px;">PATHOLOGY REPORT</h2>
        <p>Report ID: ${report.id} · Version: ${report.version}${report.isAmendment ? ' (AMENDED)' : ''}</p>
      </div>
      <div class="info-grid">
        <div><span class="label">Patient Name</span><div class="value">${report.patientName}</div></div>
        <div><span class="label">Patient ID</span><div class="value">${report.patientId}</div></div>
        <div><span class="label">Age / Gender</span><div class="value">${report.patientAge} years · ${report.patientGender}</div></div>
        <div><span class="label">Priority</span><div class="value">${report.priority.toUpperCase()}</div></div>
        <div><span class="label">Ordering Doctor</span><div class="value">${report.orderingDoctor}</div></div>
        <div><span class="label">Facility</span><div class="value">${report.orderingFacility}</div></div>
        <div><span class="label">Sample Type</span><div class="value" style="text-transform:capitalize">${report.sampleType}</div></div>
        <div><span class="label">Sample Collected</span><div class="value">${formatDateTime(report.sampleCollectedAt)}</div></div>
      </div>
      <h2>Test Results: ${report.tests.join(', ')}</h2>
    `);

    report.testResults.forEach(result => {
      w.document.write(`<table><thead><tr><th>Parameter</th><th>Value</th><th>Unit</th><th>Reference Range</th><th>Flag</th></tr></thead><tbody>`);
      result.parameters.forEach(p => {
        const flagClass = p.flag === 'critical' ? 'critical' : p.flag === 'high' ? 'high' : p.flag === 'low' ? 'low' : '';
        const ref = p.referenceText ?? (p.referenceMin && p.referenceMax ? `${p.referenceMin}–${p.referenceMax}` : '—');
        w.document.write(`<tr class="${flagClass}"><td>${p.parameterName}</td><td class="${flagClass}">${p.value}</td><td>${p.unit}</td><td>${ref}</td><td class="${flagClass}">${p.flag.toUpperCase()}</td></tr>`);
      });
      w.document.write(`</tbody></table>`);
      w.document.write(`<p style="font-size:10px;color:#64748b;">Technician: ${result.technicianName} · Entered: ${formatDateTime(result.enteredAt)}</p>`);
    });

    w.document.write(`
      <div style="margin-top:16px;">
        <p><strong>Verified By:</strong> ${report.verifiedBy}</p>
        <p><strong>Verified At:</strong> ${formatDateTime(report.verifiedAt)}</p>
        ${report.verificationNote ? `<p><strong>Note:</strong> ${report.verificationNote}</p>` : ''}
      </div>
      <div class="disclaimer">
        ⚠ SIH PROTOTYPE DISCLAIMER: This is a demonstration report generated by SwasthyaSetu Maharashtra prototype system. It does NOT constitute an actual medical laboratory report.
        All data is fictional and for evaluation purposes only. No digital signature claimed.
      </div>
      <div class="footer">
        SwasthyaSetu Maharashtra — Integrated Rural Healthcare Network · Report generated at ${new Date().toLocaleString('en-IN')}
      </div>
    </body></html>`);
    w.document.close();
    w.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Report details">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={onClose} />
      <aside className="relative z-10 w-full max-w-lg bg-white dark:bg-brand-dark-surface border-l border-slate-200 dark:border-brand-dark-border h-full overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-brand-dark-border sticky top-0 bg-white dark:bg-brand-dark-surface z-10">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-brand-dark-heading flex items-center gap-2">
              Report {report.id}
              {report.isAmendment && (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">AMENDED v{report.version}</span>
              )}
            </h3>
            <p className="text-xs text-teal-600 dark:text-teal-400 font-mono mt-0.5">Order: {report.orderId}</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={handlePrint} aria-label="Print report" className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-brand-dark-elevated transition-colors">
              <Printer className="w-4 h-4" />
            </button>
            <button type="button" onClick={onClose} aria-label="Close" className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-brand-dark-elevated transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div ref={printRef} className="flex-1 px-5 py-4 space-y-5 text-xs">
          {/* Critical Alert */}
          {report.hasCritical && (
            <div className={`p-3 rounded-xl border flex items-start gap-2 ${
              report.criticalAcknowledged
                ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60'
            }`}>
              {report.criticalAcknowledged ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-emerald-800 dark:text-emerald-300">Critical Result Communication Acknowledged</p>
                    <p className="text-emerald-700 dark:text-emerald-400 mt-0.5">
                      Acknowledged by {report.criticalAcknowledgedBy} at {report.criticalAcknowledgedAt ? formatDateTime(report.criticalAcknowledgedAt) : '—'}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5 animate-pulse" />
                  <div className="flex-1">
                    <p className="font-bold text-rose-800 dark:text-rose-300">CRITICAL RESULT — Doctor Communication Required</p>
                    <p className="text-rose-700 dark:text-rose-400 mt-0.5">
                      This report contains critical values. Doctor must be notified and acknowledgement recorded.
                    </p>
                    <button
                      type="button"
                      onClick={() => onAckCritical(report.id)}
                      className="mt-2 inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg px-3 py-1.5 text-[11px] transition-colors"
                    >
                      <Bell className="w-3 h-3" /> Acknowledge Communication
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Patient / Doctor Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 dark:bg-brand-dark-elevated rounded-xl p-3">
              <p className="text-[10px] text-slate-500 dark:text-brand-dark-muted uppercase tracking-wider font-semibold mb-1">Patient</p>
              <p className="font-semibold text-slate-800 dark:text-brand-dark-heading">{report.patientName}</p>
              <p className="text-slate-500 dark:text-brand-dark-muted">{report.patientId} · {report.patientAge}y {report.patientGender}</p>
            </div>
            <div className="bg-slate-50 dark:bg-brand-dark-elevated rounded-xl p-3">
              <p className="text-[10px] text-slate-500 dark:text-brand-dark-muted uppercase tracking-wider font-semibold mb-1">Ordering Doctor</p>
              <p className="font-semibold text-slate-800 dark:text-brand-dark-heading">{report.orderingDoctor}</p>
              <p className="text-slate-500 dark:text-brand-dark-muted truncate">{report.orderingFacility}</p>
            </div>
          </div>

          {/* Sample Info */}
          <div className="bg-slate-50 dark:bg-brand-dark-elevated rounded-xl p-3">
            <p className="text-[10px] text-slate-500 dark:text-brand-dark-muted uppercase tracking-wider font-semibold mb-1">Sample Information</p>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-slate-700 dark:text-brand-dark-text">
              <span>Type: <strong className="capitalize">{report.sampleType}</strong></span>
              <span>Collected: <strong>{formatDateTime(report.sampleCollectedAt)}</strong></span>
              <span>Priority: <LabPriorityBadge priority={report.priority} size="sm" /></span>
            </div>
          </div>

          {/* Test Results */}
          <div>
            <h4 className="font-bold text-slate-800 dark:text-brand-dark-heading mb-3 text-sm">
              Test Results — {report.tests.join(', ')}
            </h4>
            {report.testResults.map(result => (
              <div key={result.id} className="mb-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border border-slate-200 dark:border-brand-dark-border rounded-xl overflow-hidden">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-brand-dark-elevated">
                        <th className="text-left px-3 py-2 font-semibold text-slate-600 dark:text-brand-dark-muted">Parameter</th>
                        <th className="text-left px-3 py-2 font-semibold text-slate-600 dark:text-brand-dark-muted">Value</th>
                        <th className="text-left px-3 py-2 font-semibold text-slate-600 dark:text-brand-dark-muted">Unit</th>
                        <th className="text-left px-3 py-2 font-semibold text-slate-600 dark:text-brand-dark-muted">Reference</th>
                        <th className="text-left px-3 py-2 font-semibold text-slate-600 dark:text-brand-dark-muted">Flag</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-brand-dark-border">
                      {result.parameters.map(p => (
                        <tr key={p.id} className={p.flag === 'critical' ? 'bg-rose-50/50 dark:bg-rose-950/10' : ''}>
                          <td className="px-3 py-2 font-medium text-slate-800 dark:text-brand-dark-heading">{p.parameterName}</td>
                          <td className={`px-3 py-2 font-semibold ${p.flag === 'critical' ? 'text-rose-700 dark:text-rose-300' : p.flag === 'high' ? 'text-amber-700 dark:text-amber-300' : p.flag === 'low' ? 'text-blue-700 dark:text-blue-300' : 'text-slate-900 dark:text-brand-dark-heading'}`}>
                            {p.value}
                          </td>
                          <td className="px-3 py-2 text-slate-600 dark:text-brand-dark-text">{p.unit}</td>
                          <td className="px-3 py-2 text-slate-500 dark:text-brand-dark-muted">
                            {p.referenceText ?? (p.referenceMin && p.referenceMax ? `${p.referenceMin}–${p.referenceMax}` : '—')}
                          </td>
                          <td className="px-3 py-2"><ResultFlagBadge flag={p.flag} size="sm" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-brand-dark-muted mt-1.5">
                  Technician: {result.technicianName} · Entered: {formatDateTime(result.enteredAt)}
                </p>
              </div>
            ))}
          </div>

          {/* Verification Info */}
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-bold">Verification</p>
            </div>
            <div className="space-y-1 text-emerald-800 dark:text-emerald-300">
              <p>Verified By: <strong>{report.verifiedBy}</strong></p>
              <p>Verified At: <strong>{formatDateTime(report.verifiedAt)}</strong></p>
              {report.verificationNote && <p>Note: {report.verificationNote}</p>}
            </div>
          </div>

          {/* Doctor Review Status */}
          <div className={`rounded-xl p-3 border ${
            report.doctorReviewStatus === 'reviewed'
              ? 'bg-slate-50 dark:bg-brand-dark-elevated border-slate-200 dark:border-brand-dark-border'
              : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-600 dark:text-brand-dark-muted mb-1">Doctor Review</p>
                {report.doctorReviewStatus === 'reviewed' ? (
                  <p className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" />
                    Reviewed{report.doctorReviewedAt ? ` — ${formatDateTime(report.doctorReviewedAt)}` : ''}
                  </p>
                ) : (
                  <p className="text-amber-700 dark:text-amber-300 font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Pending Review
                  </p>
                )}
              </div>
              {report.doctorReviewStatus !== 'reviewed' && (
                <button
                  type="button"
                  onClick={() => onMarkReviewed(report.id)}
                  className="text-[11px] font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60 px-3 py-1.5 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors"
                >
                  Mark as Reviewed (Demo)
                </button>
              )}
            </div>
          </div>

          {/* Prototype Disclaimer */}
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 rounded-xl p-3 text-amber-800 dark:text-amber-300">
            <p className="font-bold text-[11px]">⚠ SIH Prototype Disclaimer</p>
            <p className="text-[10px] mt-0.5 leading-relaxed">
              This is a demonstration report from SwasthyaSetu Maharashtra prototype. It does NOT constitute an actual lab report.
              All data is fictional. No legally valid digital signature is claimed.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white dark:bg-brand-dark-surface border-t border-slate-200 dark:border-brand-dark-border px-5 py-3 flex gap-2">
          <button type="button" onClick={handlePrint} className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-100 dark:bg-brand-dark-elevated hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-brand-dark-heading font-semibold rounded-xl py-2.5 text-xs transition-colors">
            <Printer className="w-3.5 h-3.5" /> Print
          </button>
          <button type="button" onClick={handlePrint} className="flex-1 inline-flex items-center justify-center gap-2 bg-teal-50 dark:bg-teal-950/30 hover:bg-teal-100 dark:hover:bg-teal-900/50 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 font-semibold rounded-xl py-2.5 text-xs transition-colors">
            <Download className="w-3.5 h-3.5" /> Download
          </button>
        </div>
      </aside>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export const LabReportsPage: React.FC = () => {
  const { verifiedReports, markDoctorReviewed, acknowledgeCritical, notifications } = useLabPortal();

  const [search, setSearch] = useState('');
  const [reviewFilter, setReviewFilter] = useState<'all' | 'reviewed' | 'pending'>('all');
  const [criticalFilter, setCriticalFilter] = useState(false);
  const [selectedReport, setSelectedReport] = useState<VerifiedReport | null>(null);

  const filtered = useMemo(() => {
    let result = [...verifiedReports];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(r =>
        r.patientName.toLowerCase().includes(q) ||
        r.patientId.toLowerCase().includes(q) ||
        r.orderId.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.tests.some(t => t.toLowerCase().includes(q))
      );
    }
    if (reviewFilter === 'reviewed') result = result.filter(r => r.doctorReviewStatus === 'reviewed');
    if (reviewFilter === 'pending') result = result.filter(r => r.doctorReviewStatus === 'pending');
    if (criticalFilter) result = result.filter(r => r.hasCritical);
    return result.sort((a, b) => new Date(b.releasedAt).getTime() - new Date(a.releasedAt).getTime());
  }, [verifiedReports, search, reviewFilter, criticalFilter]);

  const handleAckCritical = (reportId: string) => {
    const notif = notifications.find(n => n.orderId === verifiedReports.find(r => r.id === reportId)?.orderId && n.type === 'critical_result' && !n.acknowledged);
    acknowledgeCritical(reportId, notif?.id ?? '', 'Lab Staff');
    // Update the selectedReport view
    const updatedReport = verifiedReports.find(r => r.id === reportId);
    if (updatedReport && selectedReport?.id === reportId) {
      setSelectedReport({ ...updatedReport, criticalAcknowledged: true, criticalAcknowledgedAt: new Date().toISOString(), criticalAcknowledgedBy: 'Lab Staff' });
    }
  };

  return (
    <LabPortalLayout>
      {/* Page Header */}
      <div className="mb-5">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-brand-dark-heading tracking-tight">Verified Reports</h2>
        <p className="text-xs text-slate-500 dark:text-brand-dark-muted mt-0.5">Released lab reports — searchable report library</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="search"
            placeholder="Search by patient, order ID, report ID or test..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-brand-dark-border bg-white dark:bg-brand-dark-surface text-slate-800 dark:text-brand-dark-heading placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div className="relative">
          <select
            value={reviewFilter}
            onChange={e => setReviewFilter(e.target.value as any)}
            className="pl-3 pr-7 py-2 text-xs rounded-xl border border-slate-200 dark:border-brand-dark-border bg-white dark:bg-brand-dark-surface text-slate-800 dark:text-brand-dark-heading focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none cursor-pointer"
            aria-label="Filter by review status"
          >
            <option value="all">All Reviews</option>
            <option value="pending">Pending Review</option>
            <option value="reviewed">Doctor Reviewed</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>
        <button
          type="button"
          onClick={() => setCriticalFilter(!criticalFilter)}
          className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-colors ${
            criticalFilter
              ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60'
              : 'bg-white dark:bg-brand-dark-surface text-slate-600 dark:text-brand-dark-text border-slate-200 dark:border-brand-dark-border hover:bg-slate-50 dark:hover:bg-brand-dark-elevated'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Critical Only
        </button>
      </div>

      <p className="text-xs text-slate-500 dark:text-brand-dark-muted mb-3">
        Showing {filtered.length} of {verifiedReports.length} reports
      </p>

      {/* Reports */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={FileCheck2}
          title="No reports found"
          description="No verified reports match your search or filter criteria."
        />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden sm:block bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-brand-dark-elevated border-b border-slate-200 dark:border-brand-dark-border">
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-brand-dark-muted">Report ID</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-brand-dark-muted">Order</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-brand-dark-muted">Patient</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-brand-dark-muted">Tests</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-brand-dark-muted">Doctor</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-brand-dark-muted">Priority</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-brand-dark-muted">Released</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-brand-dark-muted">Review</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-brand-dark-muted">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-brand-dark-border">
                  {filtered.map(report => (
                    <tr key={report.id} className={`hover:bg-slate-50 dark:hover:bg-brand-dark-elevated transition-colors ${report.hasCritical && !report.criticalAcknowledged ? 'bg-rose-50/30 dark:bg-rose-950/5' : ''}`}>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">{report.id}</span>
                          {report.hasCritical && (
                            <AlertTriangle className="w-3 h-3 text-rose-500 flex-shrink-0" aria-label="Contains critical values" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-teal-600 dark:text-teal-400">{report.orderId}</td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-slate-800 dark:text-brand-dark-heading">{report.patientName}</div>
                        <div className="text-slate-400 dark:text-brand-dark-muted text-[10px]">{report.patientId}</div>
                      </td>
                      <td className="px-4 py-3.5 max-w-[160px]">
                        <div className="text-slate-700 dark:text-brand-dark-text truncate">{report.tests.join(', ')}</div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700 dark:text-brand-dark-text truncate max-w-[120px]">{report.orderingDoctor}</td>
                      <td className="px-4 py-3.5"><LabPriorityBadge priority={report.priority} size="sm" /></td>
                      <td className="px-4 py-3.5 text-slate-500 dark:text-brand-dark-muted whitespace-nowrap">{formatDate(report.releasedAt)}</td>
                      <td className="px-4 py-3.5">
                        {report.doctorReviewStatus === 'reviewed' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                            <UserCheck className="w-3 h-3" /> Reviewed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          type="button"
                          onClick={() => setSelectedReport(report)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/30 hover:bg-teal-100 dark:hover:bg-teal-900/50 border border-teal-200 dark:border-teal-800/60 rounded-lg transition-colors"
                        >
                          <Eye className="w-3 h-3" /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="sm:hidden space-y-3">
            {filtered.map(report => (
              <div key={report.id} className={`bg-white dark:bg-brand-dark-surface rounded-2xl border shadow-xs p-4 ${
                report.hasCritical && !report.criticalAcknowledged
                  ? 'border-rose-200 dark:border-rose-800/60'
                  : 'border-slate-200 dark:border-brand-dark-border'
              }`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-sm font-bold text-emerald-700 dark:text-emerald-400">{report.id}</span>
                      {report.hasCritical && <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
                    </div>
                    <p className="font-semibold text-slate-800 dark:text-brand-dark-heading mt-0.5">{report.patientName}</p>
                  </div>
                  <LabPriorityBadge priority={report.priority} size="sm" />
                </div>
                <p className="text-xs text-slate-600 dark:text-brand-dark-text">{report.tests.join(', ')}</p>
                <p className="text-[11px] text-slate-500 dark:text-brand-dark-muted mt-1">{report.orderingDoctor} · {formatDate(report.releasedAt)}</p>
                <div className="flex items-center justify-between mt-3">
                  {report.doctorReviewStatus === 'reviewed' ? (
                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1"><UserCheck className="w-3 h-3" /> Reviewed</span>
                  ) : (
                    <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>
                  )}
                  <button type="button" onClick={() => setSelectedReport(report)}
                    className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline">
                    View Report →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Report Detail Drawer */}
      {selectedReport && (
        <ReportDetailView
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onMarkReviewed={(id) => { markDoctorReviewed(id, 'Doctor (Demo)'); setSelectedReport(null); }}
          onAckCritical={handleAckCritical}
        />
      )}
    </LabPortalLayout>
  );
};
