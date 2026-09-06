import React from 'react';
import { X, History, TrendingDown, TrendingUp } from 'lucide-react';
import { MedicineBatch, StockMovement } from '../../types/pharmacy';

interface StockMovementModalProps {
  batch: MedicineBatch | null;
  movements: StockMovement[];
  isOpen: boolean;
  onClose: () => void;
}

export const StockMovementModal: React.FC<StockMovementModalProps> = ({
  batch,
  movements,
  isOpen,
  onClose
}) => {
  if (!isOpen || !batch) return null;

  const batchMovements = movements.filter(
    (m) =>
      m.batchId === batch.id ||
      m.batchNumber === batch.batchNumber ||
      m.medicineName.toLowerCase().includes(batch.genericName.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-brand-dark-surface rounded-2xl shadow-2xl border border-slate-200 dark:border-brand-dark-border flex flex-col overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-5 border-b border-slate-200 dark:border-brand-dark-border bg-slate-50/60 dark:bg-brand-dark-elevated/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-brand-dark-heading">
                Stock Movement Audit Trail
              </h3>
              <p className="text-xs text-slate-500 dark:text-brand-dark-muted">
                {batch.genericName} • Batch: <strong className="font-mono">{batch.batchNumber}</strong>
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

        <div className="p-4 bg-slate-50 dark:bg-brand-dark-elevated/30 border-b border-slate-200 dark:border-brand-dark-border grid grid-cols-3 gap-2 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Current Total</span>
            <strong className="font-mono text-sm">{batch.totalQuantity} units</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Reserved</span>
            <strong className="font-mono text-sm text-amber-600">{batch.reservedQuantity} units</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Available</span>
            <strong className="font-mono text-sm text-emerald-600">{batch.availableQuantity} units</strong>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3 text-xs">
          {batchMovements.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No stock movement events recorded yet.</div>
          ) : (
            batchMovements.map((m) => {
              const isPositive = m.quantityChange > 0;
              return (
                <div
                  key={m.id}
                  className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-brand-dark-elevated/40 border border-slate-200 dark:border-brand-dark-border flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`p-1.5 rounded-lg mt-0.5 ${
                        isPositive
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-brand-dark-heading block">
                        {m.reason}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-brand-dark-muted">
                        Performed by: <strong>{m.performedBy}</strong> • {new Date(m.timestamp).toLocaleString()}
                      </span>
                      <div className="text-[11px] text-slate-600 dark:text-brand-dark-text mt-1 font-mono">
                        Previous: {m.previousQuantity} → New: {m.newQuantity}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`font-mono font-bold text-sm flex-shrink-0 ${
                      isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {isPositive ? `+${m.quantityChange}` : m.quantityChange}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-brand-dark-border flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-brand-dark-text bg-slate-100 dark:bg-brand-dark-elevated rounded-xl hover:bg-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
