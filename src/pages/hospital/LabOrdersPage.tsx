import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  X,
  Play
} from 'lucide-react';
import { DoctorPortalLayout } from '../../components/layouts/DoctorPortalLayout';
import { EmptyState } from '../../components/common/EmptyState';
import { useDoctorPortal } from '../../context/DoctorPortalContext';
import { LabOrderItem } from '../../types/doctor';

export const LabOrdersPage: React.FC = () => {
  const {
    labOrders,
    patients,
    createLabOrder,
    updateLabOrderStatus,
    addDoctorLabInterpretation
  } = useDoctorPortal();

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOrderForView, setSelectedOrderForView] = useState<LabOrderItem | null>(null);
  const [doctorInterpretationText, setDoctorInterpretationText] = useState('');

  // New Lab Order Form State
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    diagnosticCentre: 'Satara District Integrated Diagnostic Unit',
    testCategory: 'Biochemistry & Hematology',
    tests: 'Complete Blood Count (CBC), Glycated Hemoglobin (HbA1c)',
    clinicalReason: 'Uncontrolled glycemic check and fever investigation',
    urgency: 'urgent' as 'routine' | 'urgent' | 'emergency',
    sampleType: 'Whole Blood (EDTA)',
    fastingRequired: false,
    instructions: 'Check TLC and HbA1c spike'
  });

  const filteredOrders = useMemo(() => {
    return labOrders.filter((order) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        order.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.tests.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        order.clinicalReason.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesUrgency = urgencyFilter === 'all' || order.urgency === urgencyFilter;

      return matchesSearch && matchesStatus && matchesUrgency;
    });
  }, [labOrders, searchQuery, statusFilter, urgencyFilter]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientName) return;

    createLabOrder({
      patientId: formData.patientId || 'pt-' + Date.now(),
      patientName: formData.patientName,
      doctorName: 'Dr. Ananya Kulkarni (MBBS, MD)',
      diagnosticCentre: formData.diagnosticCentre,
      testCategory: formData.testCategory,
      tests: formData.tests.split(',').map((t) => t.trim()),
      clinicalReason: formData.clinicalReason,
      urgency: formData.urgency,
      sampleType: formData.sampleType,
      fastingRequired: formData.fastingRequired,
      instructions: formData.instructions
    });

    setIsCreateModalOpen(false);
  };

  const handleDemoProgress = (orderId: string, currentStatus: LabOrderItem['status']) => {
    let nextStatus: LabOrderItem['status'] = 'processing';
    if (currentStatus === 'ordered') nextStatus = 'accepted';
    else if (currentStatus === 'accepted') nextStatus = 'sample_collected';
    else if (currentStatus === 'sample_collected') nextStatus = 'processing';
    else if (currentStatus === 'processing') nextStatus = 'report_ready';

    updateLabOrderStatus(orderId, nextStatus);
  };

  const getStatusBadge = (status: LabOrderItem['status']) => {
    switch (status) {
      case 'reviewed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700/60">
            <CheckCircle2 className="w-3 h-3" />
            Reviewed by Doctor
          </span>
        );
      case 'report_ready':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-700/60 animate-pulse">
            <FileText className="w-3 h-3" />
            Report Ready (Review Required)
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-blue-800 dark:text-brand-blue-300 bg-brand-blue-50 dark:bg-brand-blue-950/70 px-2.5 py-0.5 rounded-full border border-brand-blue-300 dark:border-brand-blue-700/60">
            <Clock className="w-3 h-3" />
            In Laboratory Analysis
          </span>
        );
      case 'sample_collected':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/70 px-2.5 py-0.5 rounded-full border border-teal-300 dark:border-teal-700/60">
            Sample Collected
          </span>
        );
      case 'ordered':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-brand-dark-muted bg-slate-100 dark:bg-brand-dark-elevated px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-brand-dark-border">
            Order Transmitted
          </span>
        );
    }
  };

  return (
    <DoctorPortalLayout
      pageTitle="Diagnostic Lab Orders & Verified Reports"
      pageSubtitle="Order pathology investigations, simulate lab processing lifecycle, and record clinical interpretations"
      headerAction={
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-brand-blue-600 to-brand-teal-600 hover:from-brand-blue-700 hover:to-brand-teal-700 shadow-md shadow-brand-blue-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Place Diagnostic Order</span>
        </button>
      }
    >
      <div className="space-y-6">
        {/* Search & Filters */}
        <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200/80 dark:border-brand-dark-border p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative min-w-[260px] flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search order ID, patient name, test names..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-900 dark:text-brand-dark-text placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-700 dark:text-brand-dark-text focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
            >
              <option value="all">All Lab Statuses</option>
              <option value="report_ready">Reports Ready to Review</option>
              <option value="processing">In Analysis</option>
              <option value="reviewed">Reviewed Reports</option>
              <option value="ordered">Pending Collection</option>
            </select>

            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-700 dark:text-brand-dark-text focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
            >
              <option value="all">All Urgencies</option>
              <option value="emergency">Emergency</option>
              <option value="urgent">Urgent</option>
              <option value="routine">Routine</option>
            </select>
          </div>
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredOrders.map((order) => {
            const hasCritical = order.criticalIndicator;
            return (
              <div
                key={order.id}
                className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                  hasCritical && order.status === 'report_ready'
                    ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/80 shadow-xs'
                    : 'bg-white dark:bg-brand-dark-surface border-slate-200/80 dark:border-brand-dark-border shadow-xs hover:shadow-card'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-xs font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-lg border border-teal-200 dark:border-teal-800/60">
                      {order.id}
                    </span>
                    {getStatusBadge(order.status)}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-brand-dark-heading">
                    {order.patientName}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-brand-dark-muted mt-0.5">
                    Order Date: {order.orderDate} • Centre: {order.diagnosticCentre}
                  </p>

                  <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-brand-dark-elevated/50 border border-slate-200/60 dark:border-brand-dark-border/60">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Investigations Requested:
                    </span>
                    <p className="text-xs font-semibold text-slate-800 dark:text-brand-dark-text">
                      {order.tests.join(', ')}
                    </p>
                  </div>

                  {order.criticalIndicator && (
                    <div className="mt-3 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-2 text-xs font-bold text-rose-800 dark:text-rose-300">
                      <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                      <span>Critical Test Flag: Elevated Values Detected</span>
                    </div>
                  )}

                  {order.doctorInterpretation && (
                    <p className="text-xs text-slate-600 dark:text-brand-dark-text mt-3 bg-brand-blue-50 dark:bg-brand-blue-950/40 p-2.5 rounded-lg">
                      <strong>Doctor Interpretation:</strong> {order.doctorInterpretation}
                    </p>
                  )}
                </div>

                {/* Card Actions */}
                <div className="flex items-center gap-2 pt-4 mt-4 border-t border-slate-200/60 dark:border-brand-dark-border/60">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOrderForView(order);
                      setDoctorInterpretationText(order.doctorInterpretation || '');
                    }}
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 border border-teal-200 dark:border-teal-800/60 transition-colors text-center"
                  >
                    View Report & Results
                  </button>

                  {/* Quick Prototype Status Progression Button */}
                  {order.status !== 'reviewed' && order.status !== 'cancelled' && (
                    <button
                      type="button"
                      onClick={() => handleDemoProgress(order.id, order.status)}
                      className="p-2 rounded-xl text-brand-blue-600 hover:bg-brand-blue-50 dark:hover:bg-brand-blue-950/40 transition-colors"
                      title="Advance Status (Prototype Simulation)"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredOrders.length === 0 && (
          <div className="p-8 bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border">
            <EmptyState
              title="No Diagnostic Orders"
              description="No lab orders match your criteria."
              actionText="Place Diagnostic Order"
              onAction={() => setIsCreateModalOpen(true)}
            />
          </div>
        )}
      </div>

      {/* Lab Order Details & Results Modal */}
      {selectedOrderForView && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-fade-in"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedOrderForView(null)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-brand-dark-surface rounded-2xl shadow-2xl border border-slate-200 dark:border-brand-dark-border p-6 overflow-y-auto text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-brand-dark-border mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-brand-dark-heading">
                    Diagnostic Pathology Report
                  </h3>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold border border-teal-200">
                    {selectedOrderForView.id}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-brand-dark-muted mt-0.5">
                  Patient: <strong>{selectedOrderForView.patientName}</strong> • Centre: {selectedOrderForView.diagnosticCentre}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderForView(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Test Results Table */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-700 dark:text-brand-dark-text uppercase tracking-wider">
                Laboratory Findings ({selectedOrderForView.tests.join(', ')})
              </h4>

              {selectedOrderForView.reportResults && selectedOrderForView.reportResults.length > 0 ? (
                <table className="w-full text-xs text-left border-collapse border border-slate-200 dark:border-brand-dark-border rounded-xl overflow-hidden">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-brand-dark-elevated font-bold uppercase text-[11px] text-slate-600 dark:text-brand-dark-muted border-b border-slate-200 dark:border-brand-dark-border">
                      <th className="py-2.5 px-3">Test Investigation</th>
                      <th className="py-2.5 px-3">Observed Value</th>
                      <th className="py-2.5 px-3">Reference Range</th>
                      <th className="py-2.5 px-3 text-right">Interpretation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-brand-dark-border">
                    {selectedOrderForView.reportResults.map((r, i) => (
                      <tr
                        key={i}
                        className={r.isCritical ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''}
                      >
                        <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-brand-dark-heading">{r.testName}</td>
                        <td className="py-2.5 px-3 font-mono font-bold">
                          {r.value} {r.unit}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 font-mono">{r.referenceRange} {r.unit}</td>
                        <td className="py-2.5 px-3 text-right">
                          {r.isCritical ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                              HIGH / CRITICAL
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                              Normal
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-brand-dark-elevated text-xs text-slate-500">
                  Specimen collected. Analysis results are processing at diagnostic centre.
                </div>
              )}

              {/* Doctor Interpretation Field */}
              <div className="pt-3 border-t border-slate-200 dark:border-brand-dark-border">
                <label className="block text-xs font-bold text-slate-700 dark:text-brand-dark-text mb-1">
                  Doctor Clinical Interpretation & Follow-up Action
                </label>
                <textarea
                  rows={3}
                  value={doctorInterpretationText}
                  onChange={(e) => setDoctorInterpretationText(e.target.value)}
                  placeholder="Record clinical interpretation of results and advice..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-900 dark:text-brand-dark-text"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex items-center justify-between border-t border-slate-200 dark:border-brand-dark-border pt-4">
              <button
                type="button"
                onClick={() => setSelectedOrderForView(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 dark:bg-brand-dark-elevated rounded-xl"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => {
                  addDoctorLabInterpretation(selectedOrderForView.id, doctorInterpretationText);
                  setSelectedOrderForView(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl shadow-xs"
              >
                Save Interpretation & Mark Reviewed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Place Lab Order Modal */}
      {isCreateModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-fade-in"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div
            className="relative w-full max-w-lg bg-white dark:bg-brand-dark-surface rounded-2xl shadow-2xl border border-slate-200 dark:border-brand-dark-border p-6 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-brand-dark-border mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-brand-dark-heading">
                New Diagnostic Investigation Order
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-brand-dark-text mb-1">
                  Select Patient *
                </label>
                <select
                  value={formData.patientId}
                  onChange={(e) => {
                    const pt = patients.find((p) => p.id === e.target.value);
                    if (pt) {
                      setFormData({
                        ...formData,
                        patientId: pt.id,
                        patientName: pt.name
                      });
                    }
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.patientId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-brand-dark-text mb-1">
                  Diagnostic Centre *
                </label>
                <select
                  value={formData.diagnosticCentre}
                  onChange={(e) => setFormData({ ...formData, diagnosticCentre: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border"
                >
                  <option value="Satara District Integrated Diagnostic Unit">Satara District Integrated Diagnostic Unit</option>
                  <option value="PHC Khed In-House Pathology Lab">PHC Khed In-House Pathology Lab</option>
                  <option value="Pune District Civil Pathology Centre">Pune District Civil Pathology Centre</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-brand-dark-text mb-1">
                  Test Investigations (comma separated) *
                </label>
                <input
                  type="text"
                  value={formData.tests}
                  onChange={(e) => setFormData({ ...formData, tests: e.target.value })}
                  placeholder="e.g. Complete Blood Count (CBC), HbA1c, Serum Electrolytes"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-brand-dark-text mb-1">
                    Urgency Priority
                  </label>
                  <select
                    value={formData.urgency}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value as 'routine' | 'urgent' | 'emergency' })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border"
                  >
                    <option value="routine">Routine</option>
                    <option value="urgent">Urgent</option>
                    <option value="emergency">Emergency STAT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-brand-dark-text mb-1">
                    Sample Type
                  </label>
                  <input
                    type="text"
                    value={formData.sampleType}
                    onChange={(e) => setFormData({ ...formData, sampleType: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-brand-dark-text mb-1">
                  Clinical Indication / Reason
                </label>
                <input
                  type="text"
                  value={formData.clinicalReason}
                  onChange={(e) => setFormData({ ...formData, clinicalReason: e.target.value })}
                  placeholder="Reason for ordering tests"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-brand-dark-border">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl shadow-xs"
                >
                  Transmit Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DoctorPortalLayout>
  );
};
