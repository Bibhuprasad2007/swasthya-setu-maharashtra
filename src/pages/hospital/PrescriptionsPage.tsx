import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Printer,
  CheckCircle2,
  X,
  Ban
} from 'lucide-react';
import { DoctorPortalLayout } from '../../components/layouts/DoctorPortalLayout';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { useDoctorPortal } from '../../context/DoctorPortalContext';
import { PrescriptionRecord } from '../../types/doctor';

export const PrescriptionsPage: React.FC = () => {
  const {
    prescriptions,
    patients,
    createPrescription,
    cancelPrescription
  } = useDoctorPortal();

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRxForView, setSelectedRxForView] = useState<PrescriptionRecord | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [selectedRxForCancel, setSelectedRxForCancel] = useState<PrescriptionRecord | null>(null);

  // New Rx Form State
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    diagnosis: '',
    instructions: 'Take medicines as prescribed. Complete full course.',
    medicines: [
      {
        id: 'm-1',
        medicineName: 'Paracetamol Tablets IP',
        genericName: 'Paracetamol',
        strength: '650 mg',
        dosage: '1 tablet',
        frequency: 'Three times daily (1-1-1)',
        route: 'Oral',
        duration: '5 days',
        quantity: 15,
        timing: 'after_food' as const,
        instructions: 'Take after food'
      }
    ]
  });

  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter((rx) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        rx.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rx.diagnosis.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || rx.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [prescriptions, searchQuery, statusFilter]);

  const handleAddMedicine = () => {
    setFormData({
      ...formData,
      medicines: [
        ...formData.medicines,
        {
          id: 'm-' + Date.now(),
          medicineName: '',
          genericName: '',
          strength: '500 mg',
          dosage: '1 tablet',
          frequency: 'Twice daily (1-0-1)',
          route: 'Oral',
          duration: '5 days',
          quantity: 10,
          timing: 'after_food',
          instructions: ''
        }
      ]
    });
  };

  const handleRemoveMedicine = (id: string) => {
    setFormData({
      ...formData,
      medicines: formData.medicines.filter((m) => m.id !== id)
    });
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientName || formData.medicines.length === 0) return;

    createPrescription({
      patientId: formData.patientId || 'pt-' + Date.now(),
      patientName: formData.patientName,
      doctorId: 'DOC1001',
      doctorName: 'Dr. Ananya Kulkarni (MBBS, MD)',
      facilityName: 'Primary Health Centre (PHC) Khed',
      date: new Date().toISOString().split('T')[0],
      diagnosis: formData.diagnosis,
      medicines: formData.medicines,
      status: 'finalized',
      instructions: formData.instructions
    });

    setIsCreateModalOpen(false);
  };

  const getStatusBadge = (status: PrescriptionRecord['status']) => {
    switch (status) {
      case 'dispensed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700/60">
            <CheckCircle2 className="w-3 h-3" />
            Dispensed by Pharmacy
          </span>
        );
      case 'partially_dispensed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/70 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-700/60">
            Partially Dispensed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/70 px-2.5 py-0.5 rounded-full border border-rose-300 dark:border-rose-700/60">
            <Ban className="w-3 h-3" />
            Cancelled
          </span>
        );
      case 'finalized':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-blue-800 dark:text-brand-blue-300 bg-brand-blue-50 dark:bg-brand-blue-950/70 px-2.5 py-0.5 rounded-full border border-brand-blue-300 dark:border-brand-blue-700/60">
            <CheckCircle2 className="w-3 h-3" />
            Active Rx
          </span>
        );
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <DoctorPortalLayout
      pageTitle="Prescription Management (e-Rx)"
      pageSubtitle="Digital generic drug prescribing, dosage tracking, and pharmacy dispensing synchronization"
      headerAction={
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-brand-blue-600 to-brand-teal-600 hover:from-brand-blue-700 hover:to-brand-teal-700 shadow-md shadow-brand-blue-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create Digital Prescription</span>
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
              placeholder="Search prescription ID, patient name, diagnosis..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-900 dark:text-brand-dark-text placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-700 dark:text-brand-dark-text focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
          >
            <option value="all">All Rx Statuses</option>
            <option value="finalized">Active Prescriptions</option>
            <option value="dispensed">Dispensed by Pharmacy</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Prescription List Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredPrescriptions.map((rx) => (
            <div
              key={rx.id}
              className="p-5 rounded-2xl bg-white dark:bg-brand-dark-surface border border-slate-200/80 dark:border-brand-dark-border shadow-xs hover:shadow-card dark:hover:shadow-card-dark transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="font-mono text-xs font-bold text-brand-blue-700 dark:text-brand-blue-400 bg-brand-blue-50 dark:bg-brand-blue-950/60 px-2.5 py-1 rounded-lg border border-brand-blue-200 dark:border-brand-blue-800/60">
                    {rx.id}
                  </span>
                  {getStatusBadge(rx.status)}
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-brand-dark-heading">
                  {rx.patientName}
                </h3>
                <p className="text-xs text-slate-500 dark:text-brand-dark-muted mt-0.5">
                  Date: {rx.date} • Prescribed by {rx.doctorName}
                </p>

                <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-brand-dark-elevated/50 border border-slate-200/60 dark:border-brand-dark-border/60">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Diagnosis
                  </span>
                  <p className="text-xs font-semibold text-slate-800 dark:text-brand-dark-text">
                    {rx.diagnosis}
                  </p>
                </div>

                <div className="mt-3">
                  <span className="text-xs font-bold text-slate-700 dark:text-brand-dark-text block mb-1">
                    Prescribed Medicines ({rx.medicines.length}):
                  </span>
                  <div className="space-y-1">
                    {rx.medicines.slice(0, 2).map((m, i) => (
                      <div key={i} className="text-xs text-slate-600 dark:text-brand-dark-muted flex items-center justify-between">
                        <span className="truncate">{m.medicineName} ({m.strength})</span>
                        <span className="font-mono text-[11px]">{m.frequency}</span>
                      </div>
                    ))}
                    {rx.medicines.length > 2 && (
                      <span className="text-[11px] text-brand-blue-600 font-semibold block">
                        +{rx.medicines.length - 2} more medicines...
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 mt-4 border-t border-slate-200/60 dark:border-brand-dark-border/60">
                <button
                  type="button"
                  onClick={() => setSelectedRxForView(rx)}
                  className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-brand-blue-700 dark:text-brand-blue-300 bg-brand-blue-50 dark:bg-brand-blue-950/60 hover:bg-brand-blue-100 dark:hover:bg-brand-blue-900/60 border border-brand-blue-200 dark:border-brand-blue-800/60 transition-colors text-center"
                >
                  View & Print
                </button>

                {rx.status !== 'cancelled' && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRxForCancel(rx);
                      setIsCancelDialogOpen(true);
                    }}
                    className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Cancel Prescription"
                  >
                    <Ban className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredPrescriptions.length === 0 && (
          <div className="p-8 bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border">
            <EmptyState
              title="No Prescriptions Found"
              description="No prescription records match your criteria."
              actionText="Create Digital Prescription"
              onAction={() => setIsCreateModalOpen(true)}
            />
          </div>
        )}
      </div>

      {/* View & Print Printable Prescription Modal */}
      {selectedRxForView && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-fade-in"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedRxForView(null)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] bg-white text-slate-900 rounded-2xl shadow-2xl p-6 sm:p-8 overflow-y-auto text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Hospital Banner */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4 mb-4">
              <div>
                <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
                  GOVERNMENT OF MAHARASHTRA • PUBLIC HEALTH DEPARTMENT
                </h2>
                <h3 className="text-sm font-bold text-brand-blue-700">
                  {selectedRxForView.facilityName}
                </h3>
                <p className="text-xs text-slate-500">
                  Ayushman Bharat Digital Health Mission (ABDM Integrated)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRxForView(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 print:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Doctor & Patient Information */}
            <div className="grid grid-cols-2 gap-4 text-xs pb-4 mb-4 border-b border-slate-200">
              <div>
                <p>Doctor: <strong>{selectedRxForView.doctorName}</strong></p>
                <p>Date: <strong>{selectedRxForView.date}</strong></p>
                <p>Prescription No: <strong className="font-mono">{selectedRxForView.id}</strong></p>
              </div>
              <div>
                <p>Patient Name: <strong>{selectedRxForView.patientName}</strong></p>
                <p>Patient ID: <strong className="font-mono">{selectedRxForView.patientId}</strong></p>
                <p>Diagnosis: <strong>{selectedRxForView.diagnosis}</strong></p>
              </div>
            </div>

            {/* Prescription Symbol & Items Table */}
            <div className="space-y-4 mb-6">
              <div className="text-xl font-serif font-black text-slate-800">℞</div>
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 font-bold uppercase text-[11px] text-slate-600">
                    <th className="py-2">#</th>
                    <th className="py-2">Medicine & Generic Strength</th>
                    <th className="py-2">Dosage & Frequency</th>
                    <th className="py-2">Duration</th>
                    <th className="py-2 text-right">Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {selectedRxForView.medicines.map((m, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 font-bold text-slate-500">{idx + 1}</td>
                      <td className="py-2.5">
                        <strong className="text-slate-900 block">{m.medicineName}</strong>
                        <span className="text-slate-500 text-[11px]">{m.genericName} • {m.strength}</span>
                      </td>
                      <td className="py-2.5">
                        <span className="font-semibold block">{m.frequency}</span>
                        <span className="text-[11px] text-slate-500 capitalize">{m.timing?.replace('_', ' ')}</span>
                      </td>
                      <td className="py-2.5 font-medium">{m.duration}</td>
                      <td className="py-2.5 text-right font-mono font-bold">{m.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {selectedRxForView.instructions && (
                <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-700 mt-4">
                  <strong>Special Instructions:</strong> {selectedRxForView.instructions}
                </div>
              )}
            </div>

            {/* Doctor Signature Block */}
            <div className="pt-8 flex items-end justify-between border-t border-slate-300 text-xs">
              <div>
                <p className="text-[10px] text-slate-400">
                  This electronic prescription is authenticated on SwasthyaSetu Maharashtra.
                </p>
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-900">{selectedRxForView.doctorName}</div>
                <div className="text-slate-500">Chief Medical Officer</div>
                <div className="font-mono text-[10px] text-slate-400">Reg No: MMC-2014-08291</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex items-center justify-end gap-3 print:hidden">
              <button
                type="button"
                onClick={() => setSelectedRxForView(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-xl"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 text-xs font-bold text-white bg-brand-blue-600 rounded-xl flex items-center gap-2 shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Print Prescription</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Prescription Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border max-w-2xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-brand-dark-border">
              <h3 className="text-lg font-bold text-slate-900 dark:text-brand-dark-heading flex items-center gap-2">
                <Plus className="w-5 h-5 text-brand-blue-600" />
                Create Digital Prescription (e-Rx)
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-brand-dark-text mb-1">
                    Select Patient *
                  </label>
                  <select
                    value={formData.patientId}
                    onChange={(e) => {
                      const pt = patients.find((p) => p.patientId === e.target.value);
                      if (pt) {
                        setFormData({
                          ...formData,
                          patientId: pt.patientId,
                          patientName: pt.name
                        });
                      }
                    }}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-brand-dark-border bg-slate-50 dark:bg-brand-dark-bg text-slate-900 dark:text-brand-dark-text"
                    required
                  >
                    <option value="">Choose patient...</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.patientId}>
                        {p.name} ({p.patientId})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-brand-dark-text mb-1">
                    Provisional / Final Diagnosis *
                  </label>
                  <input
                    type="text"
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                    placeholder="e.g. Acute Pharyngitis, Type 2 DM"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-brand-dark-border bg-slate-50 dark:bg-brand-dark-bg text-slate-900 dark:text-brand-dark-text"
                    required
                  />
                </div>
              </div>

              {/* Medicines Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-brand-dark-heading uppercase tracking-wider">
                    Medicines & Dosage Schedule
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddMedicine}
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-blue-600 dark:text-brand-blue-400 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Drug
                  </button>
                </div>

                {formData.medicines.map((med, idx) => (
                  <div
                    key={med.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-brand-dark-elevated/40 border border-slate-200 dark:border-brand-dark-border space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-brand-dark-text">
                        Medicine #{idx + 1}
                      </span>
                      {formData.medicines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMedicine(med.id)}
                          className="text-xs text-rose-600 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Drug Name (e.g. Tab. Paracetamol 650mg)"
                        value={med.medicineName}
                        onChange={(e) => {
                          const updated = [...formData.medicines];
                          updated[idx].medicineName = e.target.value;
                          updated[idx].genericName = e.target.value.split(' ')[0];
                          setFormData({ ...formData, medicines: updated });
                        }}
                        className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-brand-dark-border bg-white dark:bg-brand-dark-bg"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Frequency (e.g. 1-0-1 Twice Daily)"
                        value={med.frequency}
                        onChange={(e) => {
                          const updated = [...formData.medicines];
                          updated[idx].frequency = e.target.value;
                          setFormData({ ...formData, medicines: updated });
                        }}
                        className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-brand-dark-border bg-white dark:bg-brand-dark-bg"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <input
                        type="text"
                        placeholder="Duration (e.g. 5 days)"
                        value={med.duration}
                        onChange={(e) => {
                          const updated = [...formData.medicines];
                          updated[idx].duration = e.target.value;
                          setFormData({ ...formData, medicines: updated });
                        }}
                        className="px-2 py-1 rounded-lg border border-slate-300 dark:border-brand-dark-border bg-white dark:bg-brand-dark-bg"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Quantity"
                        value={med.quantity}
                        onChange={(e) => {
                          const updated = [...formData.medicines];
                          updated[idx].quantity = Number(e.target.value);
                          setFormData({ ...formData, medicines: updated });
                        }}
                        className="px-2 py-1 rounded-lg border border-slate-300 dark:border-brand-dark-border bg-white dark:bg-brand-dark-bg"
                        required
                      />
                      <select
                        value={med.timing}
                        onChange={(e) => {
                          const updated = [...formData.medicines];
                          updated[idx].timing = e.target.value as typeof med.timing;
                          setFormData({ ...formData, medicines: updated });
                        }}
                        className="px-2 py-1 rounded-lg border border-slate-300 dark:border-brand-dark-border bg-white dark:bg-brand-dark-bg"
                      >
                        <option value="after_food">After Food</option>
                        <option value="before_food">Before Food</option>
                        <option value="with_food">With Food</option>
                        <option value="as_needed">SOS / As Needed</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-brand-dark-text mb-1">
                  Physician Special Instructions
                </label>
                <textarea
                  rows={2}
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-brand-dark-border bg-slate-50 dark:bg-brand-dark-bg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-brand-dark-border">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-brand-blue-600 hover:bg-brand-blue-700 rounded-xl shadow-xs"
                >
                  Save & Issue Prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isCancelDialogOpen}
        title="Cancel Prescription?"
        message={`Are you sure you want to cancel Prescription ${selectedRxForCancel?.id} for ${selectedRxForCancel?.patientName}? This will notify the pharmacy dispensing counter.`}
        confirmLabel="Yes, Cancel Rx"
        cancelLabel="Keep Active"
        type="danger"
        onConfirm={() => {
          if (selectedRxForCancel) {
            cancelPrescription(selectedRxForCancel.id, 'Cancelled by prescribing physician');
            setIsCancelDialogOpen(false);
            setSelectedRxForCancel(null);
          }
        }}
        onCancel={() => setIsCancelDialogOpen(false)}
      />
    </DoctorPortalLayout>
  );
};
