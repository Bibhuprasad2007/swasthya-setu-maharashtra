import React, { useState } from 'react';
import {
  X,
  Printer,
  QrCode,
  FileCheck2,
  RotateCcw
} from 'lucide-react';
import { DispensingRecord } from '../../types/pharmacy';
import { DispensingTypeBadge } from './PharmacyBadges';
import { usePharmacyPortal } from '../../context/PharmacyPortalContext';
import { useAuth } from '../../context/AuthContext';

interface DispensingReceiptModalProps {
  record: DispensingRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DispensingReceiptModal: React.FC<DispensingReceiptModalProps> = ({
  record,
  isOpen,
  onClose
}) => {
  const { user } = useAuth();
  const { recordDispensingCorrection } = usePharmacyPortal();

  const [isReversalOpen, setIsReversalOpen] = useState(false);
  const [reversalReason, setReversalReason] = useState('');

  if (!isOpen || !record) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleConfirmReversal = () => {
    if (!reversalReason.trim()) return;
    recordDispensingCorrection(
      record.id,
      reversalReason.trim(),
      user?.name || 'Authorized Pharmacist'
    );
    setIsReversalOpen(false);
    setReversalReason('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[92vh] bg-white text-slate-900 rounded-2xl shadow-2xl p-6 sm:p-8 overflow-y-auto text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header / Banner */}
        <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-800 text-white flex-shrink-0 print:hidden">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-tight text-slate-900 uppercase">
                Government of Maharashtra • Public Health Department
              </h2>
              <h3 className="text-xs sm:text-sm font-bold text-emerald-800">
                {record.pharmacyName} ({record.facilityCode})
              </h3>
              <p className="text-[11px] text-slate-500">
                Official Jan Aushadhi & PHC Medicine Dispensing Voucher • ABDM Integrated
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 print:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Identifiers Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200 mb-5">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Receipt No:</span>
            <strong className="font-mono text-emerald-800">{record.receiptNumber}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Prescription ID:</span>
            <strong className="font-mono text-slate-800">{record.prescriptionId}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Date & Time:</span>
            <strong>{record.date} • {record.time}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Type:</span>
            <DispensingTypeBadge type={record.dispensingType} />
          </div>
        </div>

        {/* Patient & Collector Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pb-4 mb-5 border-b border-slate-200">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Patient Information
            </span>
            <p className="font-bold text-slate-900 text-sm">{record.patient.name}</p>
            <p className="text-slate-600">Age & Gender: {record.patient.age} yrs • {record.patient.gender}</p>
            <p className="text-slate-600 font-mono text-[11px]">ABHA: {record.patient.abhaId}</p>
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Collector Details
            </span>
            <p className="font-bold text-slate-900 text-sm">{record.collectorName}</p>
            <p className="text-slate-600">Relation: <strong>{record.collectorRelation}</strong></p>
            <p className="text-slate-600 font-mono text-[11px]">Contact: {record.collectorPhone}</p>
          </div>
        </div>

        {/* Dispensed Items Table */}
        <div className="mb-5">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-300 font-bold uppercase text-[10px] text-slate-600">
                <th className="py-2">#</th>
                <th className="py-2">Medicine Description</th>
                <th className="py-2">Batch No</th>
                <th className="py-2 text-center">Qty</th>
                <th className="py-2 text-right">Unit Rate</th>
                <th className="py-2 text-right">Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {record.dispensedItems.map((item, idx) => (
                <tr key={idx} className="py-2">
                  <td className="py-2.5 font-mono text-slate-400">{idx + 1}</td>
                  <td className="py-2.5">
                    <strong className="text-slate-900 block">{item.brandName}</strong>
                    <span className="text-slate-500 text-[11px]">{item.genericName} • {item.strength}</span>
                  </td>
                  <td className="py-2.5 font-mono text-[11px]">{item.batchNumber}</td>
                  <td className="py-2.5 text-center font-mono font-bold text-emerald-800">
                    {item.dispensedQuantity}
                  </td>
                  <td className="py-2.5 text-right font-mono">₹{item.unitPrice.toFixed(2)}</td>
                  <td className="py-2.5 text-right font-mono font-bold">₹{item.totalPrice.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-900 font-bold">
                <td colSpan={4} className="py-3 text-right text-slate-700">
                  Total Assessment:
                </td>
                <td colSpan={2} className="py-3 text-right font-mono text-sm text-slate-900">
                  ₹{record.totalAmount.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td colSpan={6} className="py-1 text-right text-[11px] text-slate-500 italic">
                  Payment Mode: <strong>{record.paymentMethod}</strong> (Zero Out-of-Pocket for Jan Aushadhi)
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Dispensing Notes if any */}
        {record.dispensingNotes && (
          <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 mb-5 border border-slate-200">
            <strong>Pharmacist Instructions:</strong> {record.dispensingNotes}
          </div>
        )}

        {/* Reversal Audit Notice if present */}
        {record.status === 'reversal_recorded' && (
          <div className="p-3 bg-amber-50 rounded-xl text-xs text-amber-800 mb-5 border border-amber-300">
            <strong>Correction Audit Event Recorded:</strong> {record.reversalReason}
            <span className="block text-[10px] text-slate-500 mt-0.5">
              Logged by {record.reversalBy} on {record.reversalTimestamp}
            </span>
          </div>
        )}

        {/* Verification & Signature Block */}
        <div className="pt-4 border-t border-slate-300 flex items-end justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-slate-100 border border-slate-300 rounded-lg flex items-center justify-center text-slate-500">
              <QrCode className="w-10 h-10" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-600 uppercase">ABDM Digital Gateway</p>
              <p className="text-[10px] text-slate-400">Scan QR to verify authentic dispensing record</p>
              <span className="text-[9px] font-mono text-emerald-700">HASH: SHA256-MH-GOV-PHARMACY</span>
            </div>
          </div>

          <div className="text-right">
            <p className="font-bold text-slate-900">{record.pharmacistName}</p>
            <p className="text-slate-500 text-[11px]">Registered Pharmacist</p>
            <p className="font-mono text-[10px] text-slate-400">License: {record.pharmacistLicense}</p>
          </div>
        </div>

        {/* Interactive Action Buttons (Hidden on Print) */}
        <div className="mt-6 flex items-center justify-between gap-3 pt-4 border-t border-slate-200 print:hidden">
          <div>
            {record.status !== 'reversal_recorded' ? (
              <button
                type="button"
                onClick={() => setIsReversalOpen(!isReversalOpen)}
                className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Log Correction Note</span>
              </button>
            ) : (
              <span className="text-xs text-amber-700 font-medium">Correction audit event recorded</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official Receipt</span>
            </button>
          </div>
        </div>

        {/* Correction Audit Form (Embedded) */}
        {isReversalOpen && (
          <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs print:hidden">
            <h4 className="font-bold text-amber-900 mb-1">Record Dispensing Correction Audit</h4>
            <p className="text-slate-600 mb-2 text-[11px]">
              Note: Historical dispensing records cannot be deleted. This will record an immutable traceability event.
            </p>
            <textarea
              rows={2}
              value={reversalReason}
              onChange={(e) => setReversalReason(e.target.value)}
              placeholder="e.g. Quantity correction note, discrepancy explanation..."
              className="w-full px-3 py-2 rounded-lg border border-amber-300 bg-white text-slate-900 text-xs mb-2"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsReversalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 bg-white border border-slate-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReversal}
                className="px-3 py-1.5 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-lg"
              >
                Save Correction
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
