import React, { useState } from 'react';
import { X, Send, Stethoscope, AlertTriangle } from 'lucide-react';
import { PharmacyPrescription } from '../../types/pharmacy';
import { useAuth } from '../../context/AuthContext';

interface ContactDoctorModalProps {
  prescription: PharmacyPrescription | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (notes: string) => void;
}

export const ContactDoctorModal: React.FC<ContactDoctorModalProps> = ({
  prescription,
  isOpen,
  onClose,
  onSubmit
}) => {
  const { user } = useAuth();
  const [reasonCategory, setReasonCategory] = useState<'substitution' | 'allergy_concern' | 'stock_unavailable' | 'dosage_query'>('substitution');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !prescription) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) return;

    setIsSubmitting(true);
    const formattedNote = `[${reasonCategory.toUpperCase()}] ${notes.trim()}`;
    setTimeout(() => {
      onSubmit(formattedNote);
      setIsSubmitting(false);
      setNotes('');
      onClose();
    }, 400);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-brand-dark-surface rounded-2xl shadow-2xl border border-slate-200 dark:border-brand-dark-border p-6 overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-brand-dark-border mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-brand-dark-heading">
                Contact Prescribing Doctor
              </h3>
              <p className="text-xs text-slate-500 dark:text-brand-dark-muted">
                {prescription.doctor.name} • {prescription.doctor.facilityName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:text-brand-dark-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Legal & Clinical Boundary Banner */}
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300 mb-4 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Clinical Safety Protocol:</strong> Pharmacists may not unilaterally alter prescribed molecules, dosages, or durations. Any alternative brand or therapeutic generic substitution requires explicit physician authorization.
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-brand-dark-heading mb-1">
              Prescription Ref:
            </label>
            <span className="font-mono text-xs px-2.5 py-1 rounded bg-slate-100 dark:bg-brand-dark-elevated text-slate-800 dark:text-brand-dark-text border border-slate-200 dark:border-brand-dark-border inline-block">
              {prescription.id} (Patient: {prescription.patient.name})
            </span>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-brand-dark-heading mb-1">
              Reason for Consultation Request *
            </label>
            <select
              value={reasonCategory}
              onChange={(e) => setReasonCategory(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-brand-dark-border bg-slate-50 dark:bg-brand-dark-bg text-slate-900 dark:text-brand-dark-text focus:ring-2 focus:ring-emerald-500"
            >
              <option value="substitution">Generic / Equivalent Brand Substitution Inquiry</option>
              <option value="stock_unavailable">Out of Stock at Local PHC / Jan Aushadhi Dispensary</option>
              <option value="allergy_concern">Potential Patient Allergy / Hypersensitivity Warning</option>
              <option value="dosage_query">Dosage / Frequency Clarification</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-brand-dark-heading mb-1">
              Pharmacist Notes & Specific Clinical Query *
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Brand X unavailable in district stock. Proposing Jan Aushadhi generic formulation (same active molecule & strength). Please authorize substitution."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-brand-dark-border bg-slate-50 dark:bg-brand-dark-bg text-slate-900 dark:text-brand-dark-text focus:ring-2 focus:ring-emerald-500 leading-relaxed"
              required
            />
          </div>

          <div className="pt-2 text-[11px] text-slate-400 dark:text-brand-dark-muted">
            Transmitted from: <strong>{user?.name || 'Authorized Pharmacist'}</strong> ({user?.facilityCode || 'MH-PHA-101'})
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-brand-dark-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-700 dark:text-brand-dark-text bg-slate-100 dark:bg-brand-dark-elevated rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !notes.trim()}
              className={`inline-flex items-center gap-1.5 px-4 py-2 font-bold text-white rounded-xl shadow-xs ${
                isSubmitting || !notes.trim()
                  ? 'bg-emerald-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Transmitting...' : 'Send to Doctor Portal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
