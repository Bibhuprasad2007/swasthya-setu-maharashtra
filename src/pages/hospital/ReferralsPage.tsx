import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  CheckCircle2,
  Clock,
  Printer,
  Building,
  X,
  Truck,
  Ban
} from 'lucide-react';
import { DoctorPortalLayout } from '../../components/layouts/DoctorPortalLayout';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { useDoctorPortal } from '../../context/DoctorPortalContext';
import { ReferralItem } from '../../types/doctor';

export const ReferralsPage: React.FC = () => {
  const {
    referrals,
    patients,
    createReferral,
    simulateReceivingResponse,
    cancelReferral
  } = useDoctorPortal();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedReferralForView, setSelectedReferralForView] = useState<ReferralItem | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [selectedRefForCancel, setSelectedRefForCancel] = useState<ReferralItem | null>(null);

  // New Referral Form
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    receivingFacility: 'Pune District Civil Hospital / Aundh Chest Hospital',
    department: 'Pulmonary Medicine & Respiratory Care',
    specialist: 'Dr. V. M. Joshi (Chest Physician)',
    referralReason: 'Spirometry and tertiary evaluation for persistent COPD exacerbation',
    clinicalSummary: '64-year-old male with persistent wheezing and SpO2 95% on room air.',
    provisionalDiagnosis: 'Chronic Obstructive Pulmonary Disease Grade II',
    urgency: 'urgent' as 'routine' | 'urgent' | 'emergency',
    preferredDate: '2026-09-12',
    transportRequired: true,
    doctorNotes: 'Transport required via 108 Ambulance referral desk.'
  });

  const filteredReferrals = useMemo(() => {
    return referrals.filter((ref) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        ref.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ref.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ref.receivingFacility.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ref.department.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || ref.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [referrals, searchQuery, statusFilter]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientName) return;

    createReferral({
      patientId: formData.patientId || 'pt-' + Date.now(),
      patientName: formData.patientName,
      referringDoctor: 'Dr. Ananya Kulkarni (MBBS, MD)',
      referringFacility: 'Primary Health Centre (PHC) Khed',
      receivingFacility: formData.receivingFacility,
      department: formData.department,
      specialist: formData.specialist,
      referralReason: formData.referralReason,
      clinicalSummary: formData.clinicalSummary,
      provisionalDiagnosis: formData.provisionalDiagnosis,
      urgency: formData.urgency,
      preferredDate: formData.preferredDate,
      transportRequired: formData.transportRequired,
      doctorNotes: formData.doctorNotes
    });

    setIsCreateModalOpen(false);
  };

  const getStatusBadge = (status: ReferralItem['status']) => {
    switch (status) {
      case 'accepted':
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700/60">
            <CheckCircle2 className="w-3 h-3" />
            Accepted by Tertiary Centre
          </span>
        );
      case 'consultation_completed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-brand-dark-elevated px-2.5 py-0.5 rounded-full">
            Completed & Returned
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/70 px-2.5 py-0.5 rounded-full border border-rose-300 dark:border-rose-700/60">
            <Ban className="w-3 h-3" />
            Cancelled
          </span>
        );
      case 'sent':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-blue-800 dark:text-brand-blue-300 bg-brand-blue-50 dark:bg-brand-blue-950/70 px-2.5 py-0.5 rounded-full border border-brand-blue-300 dark:border-brand-blue-700/60">
            <Clock className="w-3 h-3" />
            Transmitted (Pending Confirmation)
          </span>
        );
    }
  };

  return (
    <DoctorPortalLayout
      pageTitle="Inter-Facility Patient Referrals"
      pageSubtitle="Transfer cases to District Civil Hospitals and Tertiary Medical Colleges with transport coordination"
      headerAction={
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-brand-blue-600 to-brand-teal-600 hover:from-brand-blue-700 hover:to-brand-teal-700 shadow-md shadow-brand-blue-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Referral</span>
        </button>
      }
    >
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200/80 dark:border-brand-dark-border p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative min-w-[260px] flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patient, hospital, department, referral ID..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-900 dark:text-brand-dark-text placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-700 dark:text-brand-dark-text focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
          >
            <option value="all">All Referral Statuses</option>
            <option value="sent">Transmitted Pending</option>
            <option value="accepted">Accepted / Scheduled</option>
            <option value="consultation_completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Referrals Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredReferrals.map((ref) => (
            <div
              key={ref.id}
              className="p-5 rounded-2xl bg-white dark:bg-brand-dark-surface border border-slate-200/80 dark:border-brand-dark-border shadow-xs hover:shadow-card dark:hover:shadow-card-dark transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="font-mono text-xs font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-800/60">
                    {ref.id}
                  </span>
                  {getStatusBadge(ref.status)}
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-brand-dark-heading">
                  {ref.patientName}
                </h3>
                <p className="text-xs text-slate-500 dark:text-brand-dark-muted mt-0.5">
                  Created: {ref.createdDate} • Target: {ref.preferredDate}
                </p>

                <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-brand-dark-elevated/50 border border-slate-200/60 dark:border-brand-dark-border/60 space-y-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-brand-dark-heading flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-brand-blue-600" />
                    <span>{ref.receivingFacility}</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Dept: <strong>{ref.department}</strong>
                  </p>
                </div>

                <div className="mt-3 text-xs text-slate-600 dark:text-brand-dark-text">
                  <span className="font-bold block text-slate-700 dark:text-brand-dark-heading mb-0.5">Reason for Referral:</span>
                  <p className="truncate">{ref.referralReason}</p>
                </div>

                {ref.transportRequired && (
                  <div className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/60">
                    <Truck className="w-3.5 h-3.5 text-amber-600" />
                    <span>108 Ambulance Transport Linked</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-4 mt-4 border-t border-slate-200/60 dark:border-brand-dark-border/60">
                <button
                  type="button"
                  onClick={() => setSelectedReferralForView(ref)}
                  className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800/60 transition-colors text-center"
                >
                  View Details & Slip
                </button>

                {ref.status === 'sent' && (
                  <>
                    <button
                      type="button"
                      onClick={() => simulateReceivingResponse(ref.id)}
                      className="py-2 px-3 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                      title="Simulate Tertiary Centre Acceptance"
                    >
                      Simulate Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRefForCancel(ref);
                        setIsCancelDialogOpen(true);
                      }}
                      className="py-2 px-2.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                      title="Cancel Referral"
                    >
                      <Ban className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredReferrals.length === 0 && (
          <div className="p-8 bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border">
            <EmptyState
              title="No Patient Referrals"
              description="No active referrals found for the selected filter."
              actionText="Create New Referral"
              onAction={() => setIsCreateModalOpen(true)}
            />
          </div>
        )}
      </div>

      {/* View Referral Summary Slip Modal */}
      {selectedReferralForView && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-fade-in"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedReferralForView(null)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] bg-white text-slate-900 rounded-2xl shadow-2xl p-6 sm:p-8 overflow-y-auto text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4 mb-4">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                  OFFICIAL INTER-HOSPITAL CLINICAL REFERRAL MEMO
                </h2>
                <p className="text-xs text-slate-500">
                  SwasthyaSetu Maharashtra • Unified Emergency Health Transport Gateway
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReferralForView(null)}
                className="p-1 text-slate-400 hover:text-slate-600 print:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-xl">
                <div>
                  <p>Referring Facility: <strong>{selectedReferralForView.referringFacility}</strong></p>
                  <p>Referring Doctor: <strong>{selectedReferralForView.referringDoctor}</strong></p>
                  <p>Referral Memo No: <strong className="font-mono">{selectedReferralForView.id}</strong></p>
                </div>
                <div>
                  <p>Target Facility: <strong>{selectedReferralForView.receivingFacility}</strong></p>
                  <p>Target Department: <strong>{selectedReferralForView.department}</strong></p>
                  <p>Target Specialist: <strong>{selectedReferralForView.specialist || 'On-Duty Specialist'}</strong></p>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3">
                <p>Patient Name: <strong className="text-sm">{selectedReferralForView.patientName}</strong> (<span className="font-mono">{selectedReferralForView.patientId}</span>)</p>
                <p className="mt-1">Provisional Diagnosis: <strong>{selectedReferralForView.provisionalDiagnosis}</strong></p>
                <p className="mt-1">Referral Indication: {selectedReferralForView.referralReason}</p>
                <p className="mt-1">Clinical Summary: {selectedReferralForView.clinicalSummary}</p>
              </div>

              {selectedReferralForView.receivingOutcome && (
                <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl font-medium border border-emerald-200">
                  <strong>Receiving Centre Response:</strong> {selectedReferralForView.receivingOutcome}
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 print:hidden">
              <button
                type="button"
                onClick={() => setSelectedReferralForView(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-xl"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-bold text-white bg-brand-blue-600 rounded-xl flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Referral Memo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Referral Modal */}
      {isCreateModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-fade-in"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div
            className="relative w-full max-w-lg max-h-[90vh] bg-white dark:bg-brand-dark-surface rounded-2xl shadow-2xl border border-slate-200 dark:border-brand-dark-border p-6 overflow-y-auto text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-brand-dark-border mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-brand-dark-heading">
                New Specialist Referral Transfer
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
                  Receiving Tertiary Facility *
                </label>
                <select
                  value={formData.receivingFacility}
                  onChange={(e) => setFormData({ ...formData, receivingFacility: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border"
                >
                  <option value="Pune District Civil Hospital / Aundh Chest Hospital">Pune District Civil Hospital / Aundh Chest Hospital</option>
                  <option value="Sassoon General Hospital & BJ Government Medical College, Pune">Sassoon General Hospital & BJ Medical College</option>
                  <option value="Satara District Civil Hospital">Satara District Civil Hospital</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-brand-dark-text mb-1">
                    Speciality Department *
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-brand-dark-text mb-1">
                    Urgency
                  </label>
                  <select
                    value={formData.urgency}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value as 'routine' | 'urgent' | 'emergency' })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border"
                  >
                    <option value="routine">Routine Elective</option>
                    <option value="urgent">Urgent Priority</option>
                    <option value="emergency">Emergency STAT</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-brand-dark-text mb-1">
                  Reason for Referral *
                </label>
                <input
                  type="text"
                  value={formData.referralReason}
                  onChange={(e) => setFormData({ ...formData, referralReason: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-brand-dark-text mb-1">
                  Clinical Case Summary
                </label>
                <textarea
                  rows={2}
                  value={formData.clinicalSummary}
                  onChange={(e) => setFormData({ ...formData, clinicalSummary: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                  <input
                    type="checkbox"
                    checked={formData.transportRequired}
                    onChange={(e) => setFormData({ ...formData, transportRequired: e.target.checked })}
                    className="rounded text-amber-600"
                  />
                  <span>Link Government 108 Emergency Ambulance for Transfer</span>
                </label>
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
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-xs"
                >
                  Transmit Referral Memo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Cancel Referral Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isCancelDialogOpen}
        title="Cancel Referral Request?"
        message={`Are you sure you want to cancel the referral for ${selectedRefForCancel?.patientName} to ${selectedRefForCancel?.receivingFacility}?`}
        confirmLabel="Yes, Cancel Referral"
        cancelLabel="Keep Referral"
        type="danger"
        onConfirm={() => {
          if (selectedRefForCancel) {
            cancelReferral(selectedRefForCancel.id, 'Cancelled by referring physician');
            setIsCancelDialogOpen(false);
            setSelectedRefForCancel(null);
          }
        }}
        onCancel={() => setIsCancelDialogOpen(false)}
      />
    </DoctorPortalLayout>
  );
};
