import React, { useState } from 'react';
import { X } from 'lucide-react';
import { MedicineReservation } from '../../types/pharmacy';
import { useAuth } from '../../context/AuthContext';
import { usePharmacyPortal } from '../../context/PharmacyPortalContext';

type ResActionType = 'accept' | 'partial' | 'reject' | 'ready' | 'cancel';

interface ReservationActionModalProps {
  reservation: MedicineReservation | null;
  actionType: ResActionType | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReservationActionModal: React.FC<ReservationActionModalProps> = ({
  reservation,
  actionType,
  isOpen,
  onClose
}) => {
  const { user } = useAuth();
  const {
    acceptReservation,
    partiallyAcceptReservation,
    rejectReservation,
    markReservationReady,
    cancelReservation
  } = usePharmacyPortal();

  const [estimatedTime, setEstimatedTime] = useState('Today, 4:00 PM - 7:00 PM');
  const [rejectionReason, setRejectionReason] = useState('');
  const [unavailableIds, setUnavailableIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (reservation) {
      setEstimatedTime(reservation.collectionWindow || 'Today, 4:00 PM - 7:00 PM');
      setRejectionReason('');
      setUnavailableIds(
        reservation.requestedMedicines
          .filter((m) => !m.isAvailable || m.availableQuantity < m.requestedQuantity)
          .map((m) => m.medicineId)
      );
      setError(null);
    }
  }, [reservation, actionType, isOpen]);

  if (!isOpen || !reservation || !actionType) return null;

  const pharmacist = user?.name || 'Sunita Patil (Registered Pharmacist)';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (actionType === 'accept') {
      acceptReservation(reservation.id, estimatedTime, pharmacist);
      onClose();
    } else if (actionType === 'partial') {
      if (unavailableIds.length === 0) {
        setError('For partial availability, please select at least one unavailable medicine.');
        return;
      }
      if (unavailableIds.length === reservation.requestedMedicines.length) {
        setError('All items cannot be marked unavailable in a partial acceptance. Please reject instead.');
        return;
      }
      partiallyAcceptReservation(reservation.id, unavailableIds, estimatedTime, pharmacist);
      onClose();
    } else if (actionType === 'reject') {
      if (!rejectionReason.trim()) {
        setError('Please provide a mandatory reason for rejection.');
        return;
      }
      rejectReservation(reservation.id, rejectionReason.trim(), pharmacist);
      onClose();
    } else if (actionType === 'ready') {
      markReservationReady(reservation.id, pharmacist);
      onClose();
    } else if (actionType === 'cancel') {
      if (!rejectionReason.trim()) {
        setError('Please provide a cancellation reason.');
        return;
      }
      cancelReservation(reservation.id, rejectionReason.trim(), pharmacist);
      onClose();
    }
  };

  const getTitle = () => {
    switch (actionType) {
      case 'accept':
        return 'Accept Medicine Reservation';
      case 'partial':
        return 'Record Partial Availability';
      case 'reject':
        return 'Reject Reservation Request';
      case 'ready':
        return 'Mark Medicines Ready for Collection';
      case 'cancel':
        return 'Cancel Reservation';
    }
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
        <div className="flex items-start justify-between pb-3.5 border-b border-slate-200 dark:border-brand-dark-border mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-brand-dark-heading">
              {getTitle()}
            </h3>
            <p className="text-xs text-slate-500 dark:text-brand-dark-muted mt-0.5">
              Reservation Ref: <strong className="font-mono">{reservation.id}</strong> • Patient: {reservation.patient.name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:text-brand-dark-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* ACCEPT WORKFLOW */}
          {actionType === 'accept' && (
            <div className="space-y-3">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
                <span className="font-bold block text-sm">Stock Commitment Notice</span>
                <p className="mt-0.5 text-xs">
                  Accepting this reservation will allocate and hold stock in inventory so other walk-in patients cannot take it before collection.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-brand-dark-heading mb-1">
                  Estimated Collection Window *
                </label>
                <input
                  type="text"
                  value={estimatedTime}
                  onChange={(e) => setEstimatedTime(e.target.value)}
                  placeholder="e.g. Today, 4:00 PM - 7:00 PM"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-brand-dark-border bg-slate-50 dark:bg-brand-dark-bg text-slate-900 dark:text-brand-dark-text"
                  required
                />
              </div>
            </div>
          )}

          {/* PARTIAL WORKFLOW */}
          {actionType === 'partial' && (
            <div className="space-y-3">
              <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300">
                <span className="font-bold block text-sm">Select Unavailable Medicines</span>
                <p className="mt-0.5 text-xs">
                  Mark which medicines cannot be fulfilled due to local shortages. The patient will receive a partial availability alert on their Android app.
                </p>
              </div>

              <div className="space-y-2">
                {reservation.requestedMedicines.map((m) => {
                  const isChecked = unavailableIds.includes(m.medicineId);
                  return (
                    <label
                      key={m.medicineId}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-900'
                          : 'bg-slate-50 dark:bg-brand-dark-elevated/40 border-slate-200 dark:border-brand-dark-border'
                      }`}
                    >
                      <div>
                        <strong className="block text-slate-900 dark:text-brand-dark-heading">
                          {m.medicineName}
                        </strong>
                        <span className="text-[11px] text-slate-500 dark:text-brand-dark-muted">
                          Requested: {m.requestedQuantity} • Available in Stock: {m.availableQuantity}
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setUnavailableIds([...unavailableIds, m.medicineId]);
                          } else {
                            setUnavailableIds(unavailableIds.filter((id) => id !== m.medicineId));
                          }
                        }}
                        className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                      />
                    </label>
                  );
                })}
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-brand-dark-heading mb-1">
                  Collection Window for Available Items *
                </label>
                <input
                  type="text"
                  value={estimatedTime}
                  onChange={(e) => setEstimatedTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-brand-dark-border bg-slate-50 dark:bg-brand-dark-bg text-slate-900 dark:text-brand-dark-text"
                  required
                />
              </div>
            </div>
          )}

          {/* REJECT WORKFLOW */}
          {actionType === 'reject' && (
            <div className="space-y-3">
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300">
                <span className="font-bold block text-sm">Rejection Reason Mandatory</span>
                <p className="mt-0.5 text-xs">
                  Any reserved stock will be immediately released back to available inventory.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-brand-dark-heading mb-1">
                  Reason for Rejection *
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Medicine out of stock; Indent delayed from District Medical Depot; Prescription requires doctor re-verification."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-brand-dark-border bg-slate-50 dark:bg-brand-dark-bg text-slate-900 dark:text-brand-dark-text"
                  required
                />
              </div>
            </div>
          )}

          {/* READY FOR PICKUP WORKFLOW */}
          {actionType === 'ready' && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 space-y-2">
              <span className="font-bold block text-sm">Confirm Ready for Collection</span>
              <p className="text-xs">
                Confirm that all reserved medicines have been verified, packaged, and labeled at the counter for patient <strong>{reservation.patient.name}</strong>.
              </p>
              <p className="text-[11px] text-slate-500 dark:text-brand-dark-muted italic">
                A push notification with pickup instructions will be dispatched to the Patient Android App.
              </p>
            </div>
          )}

          {/* CANCEL WORKFLOW */}
          {actionType === 'cancel' && (
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 text-amber-800 text-xs">
                Cancelling this reservation will release any held stock back to available dispensary inventory.
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-brand-dark-heading mb-1">
                  Cancellation Reason *
                </label>
                <input
                  type="text"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Patient did not collect within 48 hours / Patient cancelled request"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-brand-dark-border bg-slate-50 dark:bg-brand-dark-bg text-slate-900 dark:text-brand-dark-text"
                  required
                />
              </div>
            </div>
          )}

          {error && (
            <div className="text-rose-600 dark:text-rose-400 font-semibold text-xs">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-brand-dark-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-700 dark:text-brand-dark-text bg-slate-100 dark:bg-brand-dark-elevated rounded-xl"
            >
              Back
            </button>
            <button
              type="submit"
              className={`px-4 py-2 font-bold text-white rounded-xl shadow-xs ${
                actionType === 'reject' || actionType === 'cancel'
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : actionType === 'partial'
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {actionType === 'accept'
                ? 'Confirm & Reserve Stock'
                : actionType === 'partial'
                ? 'Save Partial Availability'
                : actionType === 'reject'
                ? 'Confirm Rejection'
                : actionType === 'ready'
                ? 'Mark Ready for Collection'
                : 'Confirm Cancellation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
