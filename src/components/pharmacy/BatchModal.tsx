import React, { useState, useEffect } from 'react';
import { X, Boxes, AlertCircle } from 'lucide-react';
import { MedicineBatch, DosageForm } from '../../types/pharmacy';
import { useAuth } from '../../context/AuthContext';
import { usePharmacyPortal } from '../../context/PharmacyPortalContext';

type ModalMode = 'add' | 'edit' | 'stock_adjust' | 'damaged_stock';

interface BatchModalProps {
  isOpen: boolean;
  mode: ModalMode;
  batch: MedicineBatch | null;
  onClose: () => void;
}

export const BatchModal: React.FC<BatchModalProps> = ({
  isOpen,
  mode,
  batch,
  onClose
}) => {
  const { user } = useAuth();
  const { addBatch, updateBatchStock, editBatchInfo, recordDamagedOrExpiredStock } = usePharmacyPortal();

  // Form states for Add / Edit
  const [genericName, setGenericName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [strength, setStrength] = useState('');
  const [dosageForm, setDosageForm] = useState<DosageForm>('Tablet');
  const [manufacturer, setManufacturer] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [mrp, setMrp] = useState<number>(0);
  const [totalQuantity, setTotalQuantity] = useState<number>(0);
  const [minStockThreshold, setMinStockThreshold] = useState<number>(50);
  const [storageInstructions, setStorageInstructions] = useState('Store in a cool, dry place away from direct light.');

  // For adjustments
  const [adjustQuantity, setAdjustQuantity] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState('');

  // Inline errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (batch) {
      setGenericName(batch.genericName);
      setBrandName(batch.brandName);
      setStrength(batch.strength);
      setDosageForm(batch.dosageForm);
      setManufacturer(batch.manufacturer);
      setBatchNumber(batch.batchNumber);
      setExpiryDate(batch.expiryDate);
      setPurchasePrice(batch.purchasePrice);
      setMrp(batch.mrp);
      setTotalQuantity(batch.totalQuantity);
      setMinStockThreshold(batch.minStockThreshold);
      setStorageInstructions(batch.storageInstructions);
      setAdjustQuantity(batch.totalQuantity);
      setAdjustReason('');
    } else {
      setGenericName('');
      setBrandName('');
      setStrength('500 mg');
      setDosageForm('Tablet');
      setManufacturer('Maharashtra State Health Care Supplies (MSHCS) Ltd.');
      setBatchNumber(`BTH-${Date.now().toString().slice(-5)}`);
      setExpiryDate('2027-12-31');
      setPurchasePrice(1.0);
      setMrp(2.5);
      setTotalQuantity(100);
      setMinStockThreshold(50);
      setStorageInstructions('Store in a cool, dry place away from direct light.');
      setAdjustQuantity(0);
      setAdjustReason('');
    }
    setErrors({});
  }, [batch, mode, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (mode === 'add') {
      if (!genericName.trim()) errs.genericName = 'Generic name is required.';
      if (!brandName.trim()) errs.brandName = 'Brand name is required.';
      if (!strength.trim()) errs.strength = 'Strength is required (e.g. 500 mg).';
      if (!batchNumber.trim()) errs.batchNumber = 'Batch number is required.';
      if (!expiryDate) errs.expiryDate = 'Expiry date is required.';
      if (totalQuantity < 0) errs.totalQuantity = 'Quantity cannot be negative.';
      if (minStockThreshold < 0) errs.minStockThreshold = 'Threshold cannot be negative.';
      if (mrp < 0) errs.mrp = 'MRP cannot be negative.';
    }

    if (mode === 'stock_adjust') {
      if (adjustQuantity < (batch ? batch.reservedQuantity : 0)) {
        errs.adjustQuantity = `New total quantity cannot be less than reserved quantity (${batch?.reservedQuantity}).`;
      }
      if (!adjustReason.trim()) {
        errs.adjustReason = 'Please provide a reason for stock adjustment.';
      }
    }

    if (mode === 'damaged_stock') {
      if (adjustQuantity <= 0) {
        errs.adjustQuantity = 'Damaged quantity must be greater than 0.';
      }
      if (batch && adjustQuantity > batch.availableQuantity) {
        errs.adjustQuantity = `Cannot write off more than available stock (${batch.availableQuantity}).`;
      }
      if (!adjustReason.trim()) {
        errs.adjustReason = 'Please describe damage / expiry reason.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const pharmacist = user?.name || 'Sunita Patil (Registered Pharmacist)';

    if (mode === 'add') {
      addBatch(
        {
          medicineId: `MED-${Date.now().toString().slice(-4)}`,
          genericName: genericName.trim(),
          brandName: brandName.trim(),
          strength: strength.trim(),
          dosageForm,
          manufacturer: manufacturer.trim(),
          batchNumber: batchNumber.trim(),
          expiryDate,
          purchasePrice: Number(purchasePrice),
          mrp: Number(mrp),
          totalQuantity: Number(totalQuantity),
          reservedQuantity: 0,
          minStockThreshold: Number(minStockThreshold),
          storageInstructions
        },
        pharmacist
      );
    } else if (mode === 'edit' && batch) {
      editBatchInfo(
        batch.id,
        {
          brandName: brandName.trim(),
          manufacturer: manufacturer.trim(),
          mrp: Number(mrp),
          purchasePrice: Number(purchasePrice),
          minStockThreshold: Number(minStockThreshold),
          storageInstructions
        },
        'Batch information update',
        pharmacist
      );
    } else if (mode === 'stock_adjust' && batch) {
      updateBatchStock(batch.id, Number(adjustQuantity), adjustReason.trim(), pharmacist);
    } else if (mode === 'damaged_stock' && batch) {
      recordDamagedOrExpiredStock(batch.id, Number(adjustQuantity), adjustReason.trim(), pharmacist);
    }

    onClose();
  };

  const getTitle = () => {
    switch (mode) {
      case 'add':
        return 'Add New Medicine Batch';
      case 'edit':
        return `Edit Batch Details: ${batch?.batchNumber}`;
      case 'stock_adjust':
        return `Adjust Stock Quantity: ${batch?.genericName}`;
      case 'damaged_stock':
        return `Record Damaged / Expired Stock: ${batch?.batchNumber}`;
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
        className="relative w-full max-w-xl max-h-[90vh] bg-white dark:bg-brand-dark-surface rounded-2xl shadow-2xl border border-slate-200 dark:border-brand-dark-border flex flex-col overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-brand-dark-border bg-slate-50/60 dark:bg-brand-dark-elevated/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
              <Boxes className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-brand-dark-heading">
              {getTitle()}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:text-brand-dark-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
          {/* ADD / EDIT FORM */}
          {(mode === 'add' || mode === 'edit') && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-brand-dark-heading mb-1">
                    Generic Name *
                  </label>
                  <input
                    type="text"
                    disabled={mode === 'edit'}
                    placeholder="e.g. Paracetamol"
                    value={genericName}
                    onChange={(e) => setGenericName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-brand-dark-border bg-slate-50 dark:bg-brand-dark-bg text-slate-900 dark:text-brand-dark-text disabled:opacity-60"
                  />
                  {errors.genericName && (
                    <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">{errors.genericName}</span>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-brand-dark-heading mb-1">
                    Brand / Commercial Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Paracetamol Tablets IP (Jan Aushadhi)"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-brand-dark-border bg-slate-50 dark:bg-brand-dark-bg text-slate-900 dark:text-brand-dark-text"
                  />
                  {errors.brandName && (
                    <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">{errors.brandName}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-brand-dark-heading mb-1">
                    Strength *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 650 mg"
                    value={strength}
                    onChange={(e) => setStrength(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-brand-dark-border bg-slate-50 dark:bg-brand-dark-bg text-slate-900 dark:text-brand-dark-text"
                  />
                  {errors.strength && (
                    <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">{errors.strength}</span>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-brand-dark-heading mb-1">
                    Dosage Form *
                  </label>
                  <select
                    value={dosageForm}
                    onChange={(e) => setDosageForm(e.target.value as DosageForm)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-brand-dark-border bg-slate-50 dark:bg-brand-dark-bg text-slate-900 dark:text-brand-dark-text"
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Injection">Injection</option>
                    <option value="Ointment">Ointment</option>
                    <option value="Drops">Drops</option>
                    <option value="Inhaler">Inhaler</option>
                    <option value="Powder">Powder</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-brand-dark-heading mb-1">
                    Batch Number *
                  </label>
                  <input
                    type="text"
                    disabled={mode === 'edit'}
                    placeholder="e.g. PCM-2026-B1"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-brand-dark-border bg-slate-50 dark:bg-brand-dark-bg text-slate-900 dark:text-brand-dark-text font-mono uppercase disabled:opacity-60"
                  />
                  {errors.batchNumber && (
                    <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">{errors.batchNumber}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-brand-dark-heading mb-1">
                    Manufacturer *
                  </label>
                  <input
                    type="text"
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-brand-dark-border bg-slate-50 dark:bg-brand-dark-bg text-slate-900 dark:text-brand-dark-text"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-brand-dark-heading mb-1">
                    Expiry Date (YYYY-MM-DD) *
                  </label>
                  <input
                    type="date"
                    disabled={mode === 'edit'}
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-brand-dark-border bg-slate-50 dark:bg-brand-dark-bg text-slate-900 dark:text-brand-dark-text disabled:opacity-60"
                  />
                  {errors.expiryDate && (
                    <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">{errors.expiryDate}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {mode === 'add' && (
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-brand-dark-heading mb-1">
                      Received Qty *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={totalQuantity}
                      onChange={(e) => setTotalQuantity(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-brand-dark-border bg-slate-50 dark:bg-brand-dark-bg text-slate-900 dark:text-brand-dark-text font-mono font-bold"
                    />
                    {errors.totalQuantity && (
                      <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">{errors.totalQuantity}</span>
                    )}
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 dark:text-brand-dark-heading mb-1">
                    Min Threshold *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={minStockThreshold}
                    onChange={(e) => setMinStockThreshold(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-brand-dark-border bg-slate-50 dark:bg-brand-dark-bg text-slate-900 dark:text-brand-dark-text font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-brand-dark-heading mb-1">
                    Purchase Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-brand-dark-border bg-slate-50 dark:bg-brand-dark-bg text-slate-900 dark:text-brand-dark-text font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-brand-dark-heading mb-1">
                    MRP (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={mrp}
                    onChange={(e) => setMrp(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-brand-dark-border bg-slate-50 dark:bg-brand-dark-bg text-slate-900 dark:text-brand-dark-text font-mono font-bold"
                  />
                  {errors.mrp && (
                    <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">{errors.mrp}</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-brand-dark-heading mb-1">
                  Storage Instructions
                </label>
                <input
                  type="text"
                  value={storageInstructions}
                  onChange={(e) => setStorageInstructions(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-brand-dark-border bg-slate-50 dark:bg-brand-dark-bg text-slate-900 dark:text-brand-dark-text"
                />
              </div>
            </>
          )}

          {/* STOCK ADJUSTMENT FORM */}
          {mode === 'stock_adjust' && batch && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-50 dark:bg-brand-dark-elevated/50 rounded-xl border border-slate-200 dark:border-brand-dark-border grid grid-cols-3 gap-2">
                <div>
                  <span className="text-slate-400 block text-[10px]">Current Total</span>
                  <span className="font-bold text-sm font-mono text-slate-900 dark:text-brand-dark-heading">{batch.totalQuantity}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Reserved Stock</span>
                  <span className="font-bold text-sm font-mono text-amber-600">{batch.reservedQuantity}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Available</span>
                  <span className="font-bold text-sm font-mono text-emerald-600">{batch.availableQuantity}</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-brand-dark-heading mb-1">
                  New Verified Total Quantity *
                </label>
                <input
                  type="number"
                  min={batch.reservedQuantity}
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-brand-dark-border bg-slate-50 dark:bg-brand-dark-bg text-slate-900 dark:text-brand-dark-text font-mono font-bold text-sm"
                  required
                />
                {errors.adjustQuantity && (
                  <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold block mt-1">{errors.adjustQuantity}</span>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-brand-dark-heading mb-1">
                  Reason for Adjustment *
                </label>
                <textarea
                  rows={3}
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Monthly physical stock verification reconciliation / counting discrepancy"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-brand-dark-border bg-slate-50 dark:bg-brand-dark-bg text-slate-900 dark:text-brand-dark-text"
                  required
                />
                {errors.adjustReason && (
                  <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold block mt-1">{errors.adjustReason}</span>
                )}
              </div>
            </div>
          )}

          {/* DAMAGED / EXPIRED STOCK WRITE-OFF FORM */}
          {mode === 'damaged_stock' && batch && (
            <div className="space-y-4">
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-rose-800 dark:text-rose-300">
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-sm">Quarantine & Write-Off Protocol</span>
                  <p className="mt-0.5 text-xs">
                    This will permanently deduct units from active inventory and log a formal write-off event in the government medical store audit trail.
                  </p>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-brand-dark-heading mb-1">
                  Quantity to Write Off (Available: {batch.availableQuantity}) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={batch.availableQuantity}
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-brand-dark-border bg-slate-50 dark:bg-brand-dark-bg text-slate-900 dark:text-brand-dark-text font-mono font-bold text-sm"
                  required
                />
                {errors.adjustQuantity && (
                  <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold block mt-1">{errors.adjustQuantity}</span>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-brand-dark-heading mb-1">
                  Write-off Category & Justification *
                </label>
                <textarea
                  rows={3}
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Expired batch removal, moisture breach, broken ampoule during transit..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-brand-dark-border bg-slate-50 dark:bg-brand-dark-bg text-slate-900 dark:text-brand-dark-text"
                  required
                />
                {errors.adjustReason && (
                  <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold block mt-1">{errors.adjustReason}</span>
                )}
              </div>
            </div>
          )}

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
              className={`px-4 py-2 font-bold text-white rounded-xl shadow-xs ${
                mode === 'damaged_stock'
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {mode === 'add'
                ? 'Save Medicine Batch'
                : mode === 'edit'
                ? 'Save Changes'
                : mode === 'stock_adjust'
                ? 'Commit Quantity Adjustment'
                : 'Confirm Write-off'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
