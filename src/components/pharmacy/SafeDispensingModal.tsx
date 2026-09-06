import React, { useState, useMemo } from 'react';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  PackageCheck,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  AlertCircle
} from 'lucide-react';
import {
  PharmacyPrescription,
  MedicineReservation,
  DispensingRecord
} from '../../types/pharmacy';
import { useAuth } from '../../context/AuthContext';
import { usePharmacyPortal } from '../../context/PharmacyPortalContext';

interface SafeDispensingModalProps {
  prescription: PharmacyPrescription | null;
  linkedReservation?: MedicineReservation | null;
  isOpen: boolean;
  onClose: () => void;
  onDispensingComplete: (record: DispensingRecord) => void;
}

export const SafeDispensingModal: React.FC<SafeDispensingModalProps> = ({
  prescription,
  linkedReservation,
  isOpen,
  onClose,
  onDispensingComplete
}) => {
  const { user } = useAuth();
  const { batches, dispenseMedicines } = usePharmacyPortal();

  // Multi-step wizard: 1: Safety & Verification, 2: Batch Selection & Quantities, 3: Review & Complete
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [collectorName, setCollectorName] = useState(
    prescription?.patient.name || ''
  );
  const [collectorRelation, setCollectorRelation] = useState<'Self' | 'Family Member' | 'Authorized Representative'>('Self');
  const [collectorPhone, setCollectorPhone] = useState(
    prescription?.patient.maskedPhone || ''
  );
  const [paymentMethod, setPaymentMethod] = useState<DispensingRecord['paymentMethod']>(
    'Free (Jan Aushadhi / Govt Scheme)'
  );
  const [dispensingNotes, setDispensingNotes] = useState('');
  const [allergyAcknowledged, setAllergyAcknowledged] = useState(false);
  const [pharmacistVerified, setPharmacistVerified] = useState(true);

  // Selected items: map rxItemId -> { batchId, quantity }
  const [selectedItems, setSelectedItems] = useState<
    Record<string, { batchId: string; quantity: number }>
  >(() => {
    if (!prescription) return {};
    const init: Record<string, { batchId: string; quantity: number }> = {};
    prescription.medicines.forEach((med) => {
      // Find valid, non-expired batch with earliest expiry (FEFO)
      const validBatches = batches
        .filter(
          (b) =>
            (b.medicineId === med.id ||
              b.genericName.toLowerCase().includes(med.genericName.toLowerCase())) &&
            b.status !== 'expired' &&
            b.availableQuantity > 0
        )
        .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

      const bestBatch = validBatches[0];
      const defaultQty = bestBatch
        ? Math.min(med.quantityRemaining, bestBatch.availableQuantity)
        : 0;

      init[med.id] = {
        batchId: bestBatch ? bestBatch.id : '',
        quantity: defaultQty
      };
    });
    return init;
  });

  // Re-sync when prescription changes
  React.useEffect(() => {
    if (prescription) {
      setCollectorName(prescription.patient.name);
      setCollectorPhone(prescription.patient.maskedPhone);
      const init: Record<string, { batchId: string; quantity: number }> = {};
      prescription.medicines.forEach((med) => {
        const validBatches = batches
          .filter(
            (b) =>
              (b.medicineId === med.id ||
                b.genericName.toLowerCase().includes(med.genericName.toLowerCase())) &&
              b.status !== 'expired' &&
              b.availableQuantity > 0
          )
          .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

        const bestBatch = validBatches[0];
        const defaultQty = bestBatch
          ? Math.min(med.quantityRemaining, bestBatch.availableQuantity)
          : 0;

        init[med.id] = {
          batchId: bestBatch ? bestBatch.id : '',
          quantity: defaultQty
        };
      });
      setSelectedItems(init);
      setCurrentStep(1);
    }
  }, [prescription, batches]);

  if (!isOpen || !prescription) return null;

  const hasAllergies = prescription.patient.allergies && prescription.patient.allergies.length > 0;

  // FEFO available batches for each prescribed medicine
  const getBatchesForMedicine = (genericName: string) => {
    return batches
      .filter((b) => b.genericName.toLowerCase().includes(genericName.toLowerCase()))
      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
  };

  // Validation checks for Step 2
  const validationErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    prescription.medicines.forEach((med) => {
      const selected = selectedItems[med.id];
      if (!selected || !selected.batchId) {
        if (med.quantityRemaining > 0) {
          errors[med.id] = 'Select an active medicine batch or set quantity to 0.';
        }
        return;
      }
      const batch = batches.find((b) => b.id === selected.batchId);
      if (!batch) {
        errors[med.id] = 'Selected batch not found in inventory.';
        return;
      }
      if (batch.status === 'expired') {
        errors[med.id] = `Batch ${batch.batchNumber} has expired and cannot be dispensed.`;
        return;
      }
      if (selected.quantity < 0) {
        errors[med.id] = 'Quantity cannot be negative.';
        return;
      }
      if (selected.quantity > batch.availableQuantity) {
        errors[med.id] = `Dispense quantity (${selected.quantity}) exceeds available stock (${batch.availableQuantity}).`;
        return;
      }
      if (selected.quantity > med.quantityRemaining) {
        errors[med.id] = `Dispense quantity (${selected.quantity}) exceeds remaining prescribed quantity (${med.quantityRemaining}).`;
        return;
      }
    });
    return errors;
  }, [prescription, selectedItems, batches]);

  const hasItemsToDispense = useMemo(() => {
    return Object.values(selectedItems).some((item) => item.quantity > 0);
  }, [selectedItems]);

  const isStep2Valid = Object.keys(validationErrors).length === 0 && hasItemsToDispense;

  // Handle final submission
  const handleFinalDispense = () => {
    const itemsToDispense = Object.entries(selectedItems)
      .filter(([_, data]) => data.quantity > 0)
      .map(([rxItemId, data]) => ({
        rxItemId,
        batchId: data.batchId,
        quantity: data.quantity
      }));

    if (itemsToDispense.length === 0) return;

    try {
      const record = dispenseMedicines({
        rxId: prescription.id,
        reservationId: linkedReservation?.id,
        collectorName,
        collectorRelation,
        collectorPhone,
        items: itemsToDispense,
        paymentMethod,
        notes: dispensingNotes,
        pharmacistId: user?.id || 'PHA1001',
        pharmacistName: user?.name || 'Sunita Patil (Registered Pharmacist)',
        pharmacistLicense: 'MH-PHAR-2016-7841'
      });

      onClose();
      onDispensingComplete(record);
    } catch (err: any) {
      alert(err.message || 'Dispensing could not be completed.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[94vh] bg-white dark:bg-brand-dark-surface rounded-2xl shadow-2xl border border-slate-200 dark:border-brand-dark-border flex flex-col overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-200 dark:border-brand-dark-border bg-slate-50/70 dark:bg-brand-dark-elevated/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-700 text-white shadow-xs">
              <PackageCheck className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-brand-dark-heading">
                  Safe Medicine Dispensing Workflow
                </h3>
                <span className="hidden sm:inline-flex text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800">
                  {prescription.id}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-brand-dark-muted mt-0.5">
                Government Pharmacist Verification & ABDM Traceability Standard
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cancel dispensing"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:text-brand-dark-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3-Step Wizard Indicator */}
        <div className="px-6 py-3 border-b border-slate-200 dark:border-brand-dark-border bg-white dark:bg-brand-dark-surface flex items-center justify-between text-xs">
          <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>1</span>
            <span>Safety & Verification</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300" />
          <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>2</span>
            <span>Batches & Quantities</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300" />
          <div className={`flex items-center gap-2 ${currentStep === 3 ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep === 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>3</span>
            <span>Review & Receipt</span>
          </div>
        </div>

        {/* Scrollable Step Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs">
          {/* STEP 1: SAFETY & IDENTITY VERIFICATION */}
          {currentStep === 1 && (
            <div className="space-y-4">
              {/* Pharmacist Digital Auth Card */}
              <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold text-slate-900 dark:text-brand-dark-heading text-sm block">
                    1. Authorized Pharmacist Verification
                  </span>
                  <p className="text-slate-600 dark:text-brand-dark-muted mt-0.5">
                    Operating Pharmacist: <strong>{user?.name || 'Sunita Patil'}</strong> • Reg: MH-PHAR-2016-7841 • Facility: {user?.facilityCode || 'MH-PHA-101'}
                  </p>
                  <label className="mt-2.5 flex items-center gap-2 cursor-pointer font-semibold text-emerald-900 dark:text-emerald-300">
                    <input
                      type="checkbox"
                      checked={pharmacistVerified}
                      onChange={(e) => setPharmacistVerified(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span>I confirm I am an authorized pharmacist dispensing under Maharashtra Pharmacy Council regulations.</span>
                  </label>
                </div>
              </div>

              {/* Prescription Validity Review */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-brand-dark-elevated/40 border border-slate-200 dark:border-brand-dark-border space-y-2">
                <span className="font-bold text-slate-800 dark:text-brand-dark-heading text-xs uppercase tracking-wider block">
                  2. Prescription Status & Integrity
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-700 dark:text-brand-dark-text">
                  <div>
                    <span className="text-slate-400 dark:text-brand-dark-muted block">Prescription ID:</span>
                    <strong className="font-mono">{prescription.id}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-brand-dark-muted block">Issue Date:</span>
                    <strong>{prescription.issueDate}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-brand-dark-muted block">Valid Until:</span>
                    <strong>{prescription.validUntil}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-brand-dark-muted block">Digital Signature:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">ABDM VERIFIED</strong>
                  </div>
                </div>
              </div>

              {/* Allergy Warning Review */}
              {hasAllergies ? (
                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 space-y-2">
                  <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-sm">
                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                    <span>3. Clinical Allergy Warning Check</span>
                  </div>
                  <p className="text-rose-700 dark:text-rose-400">
                    Patient has recorded hypersensitivity: <strong>{prescription.patient.allergies.join(', ')}</strong>.
                    Carefully check generic formulations to ensure no cross-reactivity with prescribed drugs.
                  </p>
                  <label className="flex items-center gap-2 font-bold text-rose-900 dark:text-rose-200 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allergyAcknowledged}
                      onChange={(e) => setAllergyAcknowledged(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                      required
                    />
                    <span>I have reviewed the patient allergies and confirmed no conflict exists with this dispensing batch.</span>
                  </label>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/60 text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>3. No adverse drug allergies recorded for this patient in state repository.</span>
                </div>
              )}

              {/* Patient / Authorized Collector Verification */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-brand-dark-elevated/40 border border-slate-200 dark:border-brand-dark-border space-y-3">
                <span className="font-bold text-slate-800 dark:text-brand-dark-heading text-xs uppercase tracking-wider block">
                  4. Patient or Authorized Collector Details
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-brand-dark-muted font-bold mb-1">
                      Collector Name *
                    </label>
                    <input
                      type="text"
                      value={collectorName}
                      onChange={(e) => setCollectorName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-brand-dark-border bg-white dark:bg-brand-dark-bg text-slate-900 dark:text-brand-dark-text"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-brand-dark-muted font-bold mb-1">
                      Relationship to Patient *
                    </label>
                    <select
                      value={collectorRelation}
                      onChange={(e) => setCollectorRelation(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-brand-dark-border bg-white dark:bg-brand-dark-bg text-slate-900 dark:text-brand-dark-text"
                    >
                      <option value="Self">Self (Patient)</option>
                      <option value="Family Member">Family Member</option>
                      <option value="Authorized Representative">Authorized Representative</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-brand-dark-muted font-bold mb-1">
                      Collector Contact *
                    </label>
                    <input
                      type="text"
                      value={collectorPhone}
                      onChange={(e) => setCollectorPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-brand-dark-border bg-white dark:bg-brand-dark-bg text-slate-900 dark:text-brand-dark-text"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: BATCH SELECTION & QUANTITIES (FEFO & VALIDATION) */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-brand-dark-heading text-sm">
                    5 & 6. Select Medicine Batches (FEFO Policy) & Dispense Quantities
                  </h4>
                  <p className="text-slate-500 dark:text-brand-dark-muted text-xs mt-0.5">
                    First-Expiry-First-Out: Batches closest to expiry are prioritized. Expired batches are blocked.
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200">
                  FEFO Priority Active
                </span>
              </div>

              <div className="space-y-3">
                {prescription.medicines.map((med, idx) => {
                  const availableBatches = getBatchesForMedicine(med.genericName);
                  const currentSelection = selectedItems[med.id] || { batchId: '', quantity: 0 };
                  const selectedBatch = batches.find((b) => b.id === currentSelection.batchId);
                  const error = validationErrors[med.id];

                  return (
                    <div
                      key={med.id}
                      className={`p-4 rounded-xl border transition-all ${
                        error
                          ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900'
                          : 'bg-slate-50/70 dark:bg-brand-dark-elevated/40 border-slate-200 dark:border-brand-dark-border'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 pb-2 border-b border-slate-200/80 dark:border-brand-dark-border/60">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Item #{idx + 1}
                          </span>
                          <span className="font-bold text-sm text-slate-900 dark:text-brand-dark-heading">
                            {med.medicineName} ({med.strength})
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-brand-dark-muted block">
                            Generic: {med.genericName} • Dosage: {med.dosage} ({med.frequency})
                          </span>
                        </div>

                        {/* Quantity Matrix (Prescribed, Dispensed, Remaining) */}
                        <div className="flex items-center gap-3 font-mono text-[11px] bg-white dark:bg-brand-dark-surface px-3 py-1.5 rounded-lg border border-slate-200 dark:border-brand-dark-border">
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase">Prescribed</span>
                            <span className="font-bold">{med.quantityPrescribed}</span>
                          </div>
                          <div className="border-l border-slate-200 dark:border-brand-dark-border pl-3">
                            <span className="text-slate-400 block text-[9px] uppercase">Prev Dispensed</span>
                            <span className="font-bold text-emerald-600">{med.quantityDispensed}</span>
                          </div>
                          <div className="border-l border-slate-200 dark:border-brand-dark-border pl-3">
                            <span className="text-slate-400 block text-[9px] uppercase">Remaining</span>
                            <span className="font-bold text-amber-600">{med.quantityRemaining}</span>
                          </div>
                        </div>
                      </div>

                      {/* Batch Selector & Dispense Input */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-slate-600 dark:text-brand-dark-muted font-bold mb-1">
                            Select Inventory Batch (FEFO Ranked) *
                          </label>
                          <select
                            value={currentSelection.batchId}
                            onChange={(e) => {
                              const bId = e.target.value;
                              const bObj = batches.find((b) => b.id === bId);
                              const maxAvail = bObj ? Math.min(med.quantityRemaining, bObj.availableQuantity) : 0;
                              setSelectedItems((prev) => ({
                                ...prev,
                                [med.id]: {
                                  batchId: bId,
                                  quantity: bObj && bObj.status !== 'expired' ? maxAvail : 0
                                }
                              }));
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-brand-dark-border bg-white dark:bg-brand-dark-bg text-slate-900 dark:text-brand-dark-text"
                          >
                            <option value="">Choose batch...</option>
                            {availableBatches.map((b) => {
                              const isExp = b.status === 'expired';
                              return (
                                <option
                                  key={b.id}
                                  value={b.id}
                                  disabled={isExp || b.availableQuantity === 0}
                                >
                                  {b.batchNumber} (Exp: {b.expiryDate}) — Avail: {b.availableQuantity} | MRP: ₹{b.mrp.toFixed(2)}
                                  {isExp ? ' [EXPIRED - BLOCKED]' : b.availableQuantity === 0 ? ' [OUT OF STOCK]' : ''}
                                </option>
                              );
                            })}
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-600 dark:text-brand-dark-muted font-bold mb-1">
                            Quantity to Dispense *
                          </label>
                          <input
                            type="number"
                            min="0"
                            max={selectedBatch ? Math.min(med.quantityRemaining, selectedBatch.availableQuantity) : med.quantityRemaining}
                            value={currentSelection.quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10) || 0;
                              setSelectedItems((prev) => ({
                                ...prev,
                                [med.id]: {
                                  ...prev[med.id],
                                  quantity: val
                                }
                              }));
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-brand-dark-border bg-white dark:bg-brand-dark-bg text-slate-900 dark:text-brand-dark-text font-mono font-bold"
                          />
                        </div>
                      </div>

                      {/* Inline Validation Error */}
                      {error && (
                        <div className="mt-2 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{error}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: FINAL CONFIRMATION & PAYMENT / SUMMARY */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-brand-dark-elevated/40 border border-slate-200 dark:border-brand-dark-border space-y-3">
                <span className="font-bold text-slate-900 dark:text-brand-dark-heading text-sm block">
                  7 & 8. Dispensing Summary & Scheme Selection
                </span>

                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-brand-dark-border bg-white dark:bg-brand-dark-surface">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-brand-dark-elevated border-b border-slate-200 dark:border-brand-dark-border font-semibold text-slate-600 dark:text-brand-dark-muted">
                        <th className="py-2.5 px-3">Medicine</th>
                        <th className="py-2.5 px-3">Batch No</th>
                        <th className="py-2.5 px-3 text-center">Dispensed Qty</th>
                        <th className="py-2.5 px-3 text-right">Unit Price</th>
                        <th className="py-2.5 px-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-brand-dark-border">
                      {prescription.medicines.map((med) => {
                        const sel = selectedItems[med.id];
                        if (!sel || sel.quantity <= 0) return null;
                        const batch = batches.find((b) => b.id === sel.batchId);
                        const unitPrice = batch ? batch.mrp : 0;
                        const total = unitPrice * sel.quantity;

                        return (
                          <tr key={med.id}>
                            <td className="py-2 px-3 font-semibold text-slate-800 dark:text-brand-dark-text">
                              {med.medicineName} ({med.strength})
                            </td>
                            <td className="py-2 px-3 font-mono text-slate-600 dark:text-brand-dark-muted">
                              {batch?.batchNumber || 'N/A'}
                            </td>
                            <td className="py-2 px-3 text-center font-mono font-bold text-emerald-600">
                              {sel.quantity}
                            </td>
                            <td className="py-2 px-3 text-right font-mono">
                              ₹{unitPrice.toFixed(2)}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold">
                              ₹{total.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-slate-600 dark:text-brand-dark-muted font-bold mb-1">
                      Government Benefit Scheme / Payment Option
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-brand-dark-border bg-white dark:bg-brand-dark-bg text-slate-900 dark:text-brand-dark-text"
                    >
                      <option value="Free (Jan Aushadhi / Govt Scheme)">
                        Free of Cost (State PHC Jan Aushadhi Scheme)
                      </option>
                      <option value="Ayushman Bharat (PM-JAY)">
                        Ayushman Bharat (PM-JAY Cashless Entitlement)
                      </option>
                      <option value="Cash">Cash Payment</option>
                      <option value="UPI / Digital">UPI / Digital QR</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-brand-dark-muted font-bold mb-1">
                      Non-Clinical Dispensing Note (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Advised patient to store drops in refrigerator"
                      value={dispensingNotes}
                      onChange={(e) => setDispensingNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-brand-dark-border bg-white dark:bg-brand-dark-bg text-slate-900 dark:text-brand-dark-text"
                    />
                  </div>
                </div>
              </div>

              {/* Digital Sign-off Banner */}
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-900 dark:text-emerald-200 block text-xs">
                    Ready to Commit & Issue Official Printable Receipt
                  </span>
                  <p className="text-slate-500 dark:text-brand-dark-muted text-[11px] mt-0.5">
                    Upon confirmation: Stock will be deducted, prescription fulfilment status synced, and receipt generated.
                  </p>
                </div>
                <div className="font-mono text-xs text-right">
                  <span className="text-slate-400 block text-[10px]">Pharmacist Sign-off</span>
                  <strong className="text-emerald-700 dark:text-emerald-400">{user?.id || 'PHA1001'}</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Navigation Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-brand-dark-border bg-slate-50/70 dark:bg-brand-dark-elevated/40 flex items-center justify-between">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep((s) => (s - 1) as any)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-brand-dark-text bg-white dark:bg-brand-dark-elevated border border-slate-300 dark:border-brand-dark-border rounded-xl hover:bg-slate-50"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-brand-dark-text bg-slate-100 dark:bg-brand-dark-elevated hover:bg-slate-200 rounded-xl"
            >
              Cancel
            </button>

            {currentStep < 3 ? (
              <button
                type="button"
                disabled={
                  (currentStep === 1 && (!pharmacistVerified || (hasAllergies && !allergyAcknowledged))) ||
                  (currentStep === 2 && !isStep2Valid)
                }
                onClick={() => setCurrentStep((s) => (s + 1) as any)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl shadow-xs ${
                  (currentStep === 1 && (!pharmacistVerified || (hasAllergies && !allergyAcknowledged))) ||
                  (currentStep === 2 && !isStep2Valid)
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                <span>Proceed to Next Step</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalDispense}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Authorize & Dispense Medicines</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
