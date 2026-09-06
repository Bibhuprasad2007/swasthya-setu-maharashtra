import React from 'react';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  FileText,
  User,
  Building,
  Pill,
  MessageSquare,
  PackageCheck
} from 'lucide-react';
import { PharmacyPrescription } from '../../types/pharmacy';
import { PrescriptionStatusBadge } from './PharmacyBadges';
import { prescriptionService } from '../../services/pharmacyServices';

interface PrescriptionDetailsModalProps {
  prescription: PharmacyPrescription | null;
  isOpen: boolean;
  onClose: () => void;
  onStartDispense: (prescription: PharmacyPrescription) => void;
  onContactDoctor: (prescription: PharmacyPrescription) => void;
}

export const PrescriptionDetailsModal: React.FC<PrescriptionDetailsModalProps> = ({
  prescription,
  isOpen,
  onClose,
  onStartDispense,
  onContactDoctor
}) => {
  if (!isOpen || !prescription) return null;

  const { allowed: canDispense, reason: blockReason } = prescriptionService.canDispense(prescription);
  const hasAllergies = prescription.patient.allergies && prescription.patient.allergies.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[92vh] bg-white dark:bg-brand-dark-surface rounded-2xl shadow-2xl border border-slate-200 dark:border-brand-dark-border flex flex-col overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-200 dark:border-brand-dark-border bg-slate-50/50 dark:bg-brand-dark-elevated/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-brand-dark-heading font-mono">
                  {prescription.id}
                </h3>
                <PrescriptionStatusBadge status={prescription.status} />
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/60">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Doctor Verified
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-brand-dark-muted mt-0.5">
                Issued on {prescription.issueDate} • Valid until {prescription.validUntil}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close prescription details"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:text-brand-dark-muted dark:hover:text-brand-dark-heading hover:bg-slate-100 dark:hover:bg-brand-dark-elevated transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Allergy Warning Banner if recorded */}
          {hasAllergies && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3 text-xs text-rose-800 dark:text-rose-300">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-sm">Patient Recorded Allergies Alert</span>
                <p className="mt-0.5 text-rose-700 dark:text-rose-400">
                  Patient has known allergies to: <strong>{prescription.patient.allergies.join(', ')}</strong>. Verify all prescribed formulations before dispensing.
                </p>
              </div>
            </div>
          )}

          {/* Patient & Doctor Minimum Required Info (Privacy Compliant) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Patient Minimum Identity Info */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-brand-dark-elevated/40 border border-slate-200 dark:border-brand-dark-border text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-brand-dark-heading text-xs uppercase tracking-wider">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>Patient Identification (Minimum Required)</span>
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 pt-1">
                <div>
                  <span className="text-slate-400 dark:text-brand-dark-muted block">Full Name:</span>
                  <span className="font-semibold text-slate-900 dark:text-brand-dark-text">{prescription.patient.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-brand-dark-muted block">Age & Gender:</span>
                  <span className="font-semibold text-slate-900 dark:text-brand-dark-text">
                    {prescription.patient.age} yrs • {prescription.patient.gender}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-brand-dark-muted block">ABHA ID:</span>
                  <span className="font-mono text-slate-700 dark:text-brand-dark-text">{prescription.patient.abhaId}</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-brand-dark-muted block">Contact (Masked):</span>
                  <span className="font-mono text-slate-700 dark:text-brand-dark-text">{prescription.patient.maskedPhone}</span>
                </div>
              </div>
            </div>

            {/* Prescribing Doctor & Facility */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-brand-dark-elevated/40 border border-slate-200 dark:border-brand-dark-border text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-brand-dark-heading text-xs uppercase tracking-wider">
                <Building className="w-3.5 h-3.5 text-emerald-600" />
                <span>Prescribing Healthcare Provider</span>
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 pt-1">
                <div>
                  <span className="text-slate-400 dark:text-brand-dark-muted block">Doctor Name:</span>
                  <span className="font-semibold text-slate-900 dark:text-brand-dark-text">{prescription.doctor.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-brand-dark-muted block">Medical Reg. No:</span>
                  <span className="font-mono text-slate-700 dark:text-brand-dark-text">{prescription.doctor.registrationNumber}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 dark:text-brand-dark-muted block">Facility:</span>
                  <span className="font-semibold text-slate-900 dark:text-brand-dark-text">
                    {prescription.doctor.facilityName} ({prescription.doctor.facilityCode})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Context Note */}
          <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-xs">
            <span className="font-bold text-emerald-900 dark:text-emerald-300 block mb-0.5">
              Provisional Diagnosis: {prescription.diagnosis}
            </span>
            {prescription.specialInstructions && (
              <p className="text-slate-600 dark:text-brand-dark-muted mt-1">
                <strong>Doctor's Notes:</strong> {prescription.specialInstructions}
              </p>
            )}
          </div>

          {/* Prescribed Medicines Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-800 dark:text-brand-dark-heading uppercase tracking-wider flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-emerald-600" />
                Prescribed Medicines ({prescription.medicines.length})
              </h4>
              <span className="text-[11px] text-slate-400 dark:text-brand-dark-muted">
                Rule: Pharmacy cannot alter dosage or brand without physician authorization.
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200 dark:border-brand-dark-border rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-brand-dark-elevated border-b border-slate-200 dark:border-brand-dark-border font-semibold text-slate-600 dark:text-brand-dark-muted text-[11px] uppercase">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Medicine & Strength</th>
                    <th className="py-2.5 px-3">Dosage & Frequency</th>
                    <th className="py-2.5 px-3">Route / Duration</th>
                    <th className="py-2.5 px-3 text-center">Prescribed</th>
                    <th className="py-2.5 px-3 text-center">Dispensed</th>
                    <th className="py-2.5 px-3 text-center">Remaining</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-brand-dark-border">
                  {prescription.medicines.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-brand-dark-elevated/30">
                      <td className="py-3 px-3 font-mono font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-3">
                        <strong className="text-slate-900 dark:text-brand-dark-text block">
                          {item.medicineName}
                        </strong>
                        <span className="text-slate-500 dark:text-brand-dark-muted text-[11px]">
                          Generic: {item.genericName} • {item.strength}
                        </span>
                        {item.instructions && (
                          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 block mt-0.5 italic">
                            ↳ {item.instructions}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-800 dark:text-brand-dark-heading block">
                          {item.frequency}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-brand-dark-muted capitalize">
                          {item.timing.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-700 dark:text-brand-dark-text">
                        <span>{item.route}</span>
                        <span className="text-slate-400 dark:text-brand-dark-muted text-[11px] block">
                          {item.duration}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-900 dark:text-brand-dark-text">
                        {item.quantityPrescribed}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {item.quantityDispensed}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-amber-600 dark:text-amber-400">
                        {item.quantityRemaining}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Contact Doctor request active notice */}
          {prescription.contactDoctorRequested && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300">
              <span className="font-bold block">Contact Doctor Request Pending:</span>
              <p className="mt-0.5">{prescription.contactDoctorNotes}</p>
            </div>
          )}

          {/* Block Reason Warning if not dispensable */}
          {!canDispense && (
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-xs text-slate-600 dark:text-brand-dark-muted">
              <strong>Dispensing Blocked:</strong> {blockReason}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-brand-dark-border bg-slate-50/50 dark:bg-brand-dark-elevated/30 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onContactDoctor(prescription)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-brand-dark-text bg-white dark:bg-brand-dark-elevated hover:bg-slate-100 dark:hover:bg-brand-dark-border/60 border border-slate-300 dark:border-brand-dark-border rounded-xl transition-colors"
          >
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>Contact Prescribing Doctor</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-brand-dark-text bg-slate-100 dark:bg-brand-dark-elevated hover:bg-slate-200 dark:hover:bg-brand-dark-border rounded-xl transition-colors"
            >
              Close
            </button>

            <button
              type="button"
              disabled={!canDispense}
              onClick={() => {
                onClose();
                onStartDispense(prescription);
              }}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl shadow-sm transition-all ${
                canDispense
                  ? 'text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500'
                  : 'text-slate-400 bg-slate-200 dark:bg-brand-dark-elevated cursor-not-allowed'
              }`}
            >
              <PackageCheck className="w-4 h-4" />
              <span>Proceed to Safe Dispensing</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
