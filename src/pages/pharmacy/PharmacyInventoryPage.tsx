import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  RotateCcw,
  History,
  Edit3,
  Trash2,
  FileSpreadsheet
} from 'lucide-react';
import { PharmacyPortalLayout } from '../../components/layouts/PharmacyPortalLayout';
import { usePharmacyPortal } from '../../context/PharmacyPortalContext';
import { StockStatusBadge } from '../../components/pharmacy/PharmacyBadges';
import { EmptyState } from '../../components/common/EmptyState';
import { BatchModal } from '../../components/pharmacy/BatchModal';
import { StockMovementModal } from '../../components/pharmacy/StockMovementModal';
import { MedicineBatch, DosageForm } from '../../types/pharmacy';

export const PharmacyInventoryPage: React.FC = () => {
  const { batches, stockMovements } = usePharmacyPortal();

  // Filters and Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dosageFilter, setDosageFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'quantity' | 'expiry'>('expiry');

  // Modals
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'stock_adjust' | 'damaged_stock'>('add');
  const [selectedBatch, setSelectedBatch] = useState<MedicineBatch | null>(null);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

  const [selectedBatchForMovement, setSelectedBatchForMovement] = useState<MedicineBatch | null>(null);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);

  // Available dosage forms
  const dosageForms = useMemo(() => {
    const set = new Set<DosageForm>();
    batches.forEach((b) => set.add(b.dosageForm));
    return Array.from(set);
  }, [batches]);

  // Filtered & Sorted batches
  const filteredBatches = useMemo(() => {
    return batches
      .filter((b) => {
        const query = searchQuery.trim().toLowerCase();
        const matchesSearch =
          !query ||
          b.genericName.toLowerCase().includes(query) ||
          b.brandName.toLowerCase().includes(query) ||
          b.batchNumber.toLowerCase().includes(query) ||
          b.manufacturer.toLowerCase().includes(query);

        const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
        const matchesDosage = dosageFilter === 'all' || b.dosageForm === dosageFilter;

        return matchesSearch && matchesStatus && matchesDosage;
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return a.genericName.localeCompare(b.genericName);
        }
        if (sortBy === 'quantity') {
          return a.availableQuantity - b.availableQuantity;
        }
        // Expiry date (Earliest first)
        return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
      });
  }, [batches, searchQuery, statusFilter, dosageFilter, sortBy]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setDosageFilter('all');
    setSortBy('expiry');
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Medicine ID',
      'Generic Name',
      'Brand Name',
      'Strength',
      'Dosage Form',
      'Batch Number',
      'Expiry Date',
      'Total Qty',
      'Reserved Qty',
      'Available Qty',
      'Min Threshold',
      'MRP (INR)',
      'Status'
    ];
    const rows = filteredBatches.map((b) => [
      b.medicineId,
      `"${b.genericName}"`,
      `"${b.brandName}"`,
      b.strength,
      b.dosageForm,
      b.batchNumber,
      b.expiryDate,
      b.totalQuantity,
      b.reservedQuantity,
      b.availableQuantity,
      b.minStockThreshold,
      b.mrp.toFixed(2),
      b.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `swasthyasetu_inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <PharmacyPortalLayout
      pageTitle="Medicine Stock & Batch Inventory"
      pageSubtitle="Batch-level FEFO stock tracking, expiry safeguards, and reservation holding"
      headerAction={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-brand-dark-text bg-white dark:bg-brand-dark-elevated hover:bg-slate-100 dark:hover:bg-brand-dark-border border border-slate-300 dark:border-brand-dark-border rounded-xl shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedBatch(null);
              setModalMode('add');
              setIsBatchModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medicine Batch</span>
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Search, Filter & Sort Controls */}
        <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search generic name, brand, batch number, or manufacturer..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-900 dark:text-brand-dark-text placeholder-slate-400 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-700 dark:text-brand-dark-text focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Stock Statuses</option>
              <option value="available">Available</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="near_expiry">Near Expiry (&lt;90 Days)</option>
              <option value="expired">Expired (Blocked)</option>
            </select>

            <select
              value={dosageFilter}
              onChange={(e) => setDosageFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-700 dark:text-brand-dark-text focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Dosage Forms</option>
              {dosageForms.map((df) => (
                <option key={df} value={df}>
                  {df}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-700 dark:text-brand-dark-text focus:ring-2 focus:ring-emerald-500"
            >
              <option value="expiry">Sort: Earliest Expiry (FEFO)</option>
              <option value="quantity">Sort: Available Qty (Low to High)</option>
              <option value="name">Sort: Generic Name (A-Z)</option>
            </select>

            {(searchQuery || statusFilter !== 'all' || dosageFilter !== 'all' || sortBy !== 'expiry') && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-3 py-2 rounded-xl text-slate-600 dark:text-brand-dark-text bg-slate-100 dark:bg-brand-dark-elevated hover:bg-slate-200 flex items-center gap-1 font-semibold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Inventory Batches Table */}
        <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-brand-dark-elevated border-b border-slate-200 dark:border-brand-dark-border font-semibold text-slate-600 dark:text-brand-dark-muted text-[11px] uppercase">
                  <th className="px-4 py-3">Medicine & Strength</th>
                  <th className="px-4 py-3">Form</th>
                  <th className="px-4 py-3">Batch No</th>
                  <th className="px-4 py-3">Expiry Date</th>
                  <th className="px-4 py-3 text-center">Total</th>
                  <th className="px-4 py-3 text-center">Reserved</th>
                  <th className="px-4 py-3 text-center">Available</th>
                  <th className="px-4 py-3 text-right">MRP (₹)</th>
                  <th className="px-4 py-3">Stock Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-brand-dark-border">
                {filteredBatches.map((b) => {
                  const isBlocked = b.status === 'expired';

                  return (
                    <tr
                      key={b.id}
                      className={`hover:bg-slate-50/70 dark:hover:bg-brand-dark-elevated/40 transition-colors ${
                        isBlocked ? 'bg-rose-50/30 dark:bg-rose-950/10' : ''
                      }`}
                    >
                      <td className="px-4 py-3.5">
                        <strong className="text-slate-900 dark:text-brand-dark-heading block">
                          {b.genericName}
                        </strong>
                        <span className="text-[11px] text-slate-500 dark:text-brand-dark-muted">
                          {b.brandName} • <strong>{b.strength}</strong>
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5 truncate max-w-[200px]">
                          {b.manufacturer}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700 dark:text-brand-dark-text">
                        {b.dosageForm}
                      </td>
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-800 dark:text-brand-dark-text">
                        {b.batchNumber}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`font-semibold ${
                            b.status === 'expired'
                              ? 'text-rose-600 dark:text-rose-400'
                              : b.status === 'near_expiry'
                              ? 'text-orange-600 dark:text-orange-400'
                              : 'text-slate-700 dark:text-brand-dark-text'
                          }`}
                        >
                          {b.expiryDate}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono font-bold text-slate-800 dark:text-brand-dark-heading">
                        {b.totalQuantity}
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono font-bold text-amber-600">
                        {b.reservedQuantity}
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {b.availableQuantity}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-semibold text-slate-800 dark:text-brand-dark-text">
                        ₹{b.mrp.toFixed(2)}
                      </td>
                      <td className="px-4 py-3.5">
                        <StockStatusBadge status={b.status} />
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Movement History */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedBatchForMovement(b);
                              setIsMovementModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-brand-dark-text hover:bg-slate-100 dark:hover:bg-brand-dark-elevated rounded-lg transition-colors"
                            title="View Stock Movement Audit Trail"
                          >
                            <History className="w-4 h-4" />
                          </button>

                          {/* Adjust Quantity */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedBatch(b);
                              setModalMode('stock_adjust');
                              setIsBatchModalOpen(true);
                            }}
                            className="px-2 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 hover:bg-emerald-100 rounded-lg"
                          >
                            Adjust Qty
                          </button>

                          {/* Write-off damaged / expired */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedBatch(b);
                              setModalMode('damaged_stock');
                              setIsBatchModalOpen(true);
                            }}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                            title="Record Damaged or Expired Stock Write-off"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          {/* Edit Allowed Batch Info */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedBatch(b);
                              setModalMode('edit');
                              setIsBatchModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-brand-dark-text hover:bg-slate-100 dark:hover:bg-brand-dark-elevated rounded-lg transition-colors"
                            title="Edit Batch Info"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredBatches.length === 0 && (
            <div className="p-10">
              <EmptyState
                title="No Medicine Batches Found"
                description="No stock records match the current filter or search criteria."
                actionLabel="Reset Filters"
                onAction={handleClearFilters}
              />
            </div>
          )}
        </div>
      </div>

      {/* Batch Add / Edit / Adjust Modal */}
      {isBatchModalOpen && (
        <BatchModal
          isOpen={isBatchModalOpen}
          mode={modalMode}
          batch={selectedBatch}
          onClose={() => {
            setIsBatchModalOpen(false);
            setSelectedBatch(null);
          }}
        />
      )}

      {/* Stock Movement Modal */}
      {selectedBatchForMovement && (
        <StockMovementModal
          isOpen={isMovementModalOpen}
          batch={selectedBatchForMovement}
          movements={stockMovements}
          onClose={() => {
            setIsMovementModalOpen(false);
            setSelectedBatchForMovement(null);
          }}
        />
      )}
    </PharmacyPortalLayout>
  );
};
