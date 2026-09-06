import React, { useState, useMemo } from 'react';
import {
  Search,
  FileSpreadsheet,
  Printer,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { PharmacyPortalLayout } from '../../components/layouts/PharmacyPortalLayout';
import { usePharmacyPortal } from '../../context/PharmacyPortalContext';
import { DispensingTypeBadge } from '../../components/pharmacy/PharmacyBadges';
import { EmptyState } from '../../components/common/EmptyState';
import { DispensingReceiptModal } from '../../components/pharmacy/DispensingReceiptModal';
import { DispensingRecord } from '../../types/pharmacy';

export const PharmacyDispensingHistoryPage: React.FC = () => {
  const { dispensingHistory } = usePharmacyPortal();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [pharmacistFilter, setPharmacistFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Selected receipt modal
  const [selectedReceipt, setSelectedReceipt] = useState<DispensingRecord | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Available pharmacists list
  const pharmacists = useMemo(() => {
    const set = new Set<string>();
    dispensingHistory.forEach((d) => set.add(d.pharmacistName));
    return Array.from(set);
  }, [dispensingHistory]);

  // Filtered dispensing records
  const filteredHistory = useMemo(() => {
    return dispensingHistory.filter((rec) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        rec.id.toLowerCase().includes(query) ||
        rec.receiptNumber.toLowerCase().includes(query) ||
        rec.prescriptionId.toLowerCase().includes(query) ||
        rec.patient.name.toLowerCase().includes(query) ||
        rec.collectorName.toLowerCase().includes(query) ||
        rec.dispensedItems.some((i) => i.genericName.toLowerCase().includes(query));

      const matchesType = typeFilter === 'all' || rec.dispensingType === typeFilter;
      const matchesPharmacist = pharmacistFilter === 'all' || rec.pharmacistName === pharmacistFilter;
      const matchesDate = !dateFilter || rec.date === dateFilter;

      return matchesSearch && matchesType && matchesPharmacist && matchesDate;
    });
  }, [dispensingHistory, searchQuery, typeFilter, pharmacistFilter, dateFilter]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setPharmacistFilter('all');
    setDateFilter('');
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Dispensing ID',
      'Receipt Number',
      'Prescription ID',
      'Patient Name',
      'Collector Name',
      'Collector Relation',
      'Dispensing Type',
      'Operating Pharmacist',
      'Date',
      'Time',
      'Total Amount (INR)',
      'Payment Scheme',
      'Status'
    ];
    const rows = filteredHistory.map((d) => [
      d.id,
      d.receiptNumber,
      d.prescriptionId,
      `"${d.patient.name}"`,
      `"${d.collectorName}"`,
      d.collectorRelation,
      d.dispensingType,
      `"${d.pharmacistName}"`,
      d.date,
      d.time,
      d.totalAmount.toFixed(2),
      `"${d.paymentMethod}"`,
      d.status
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `swasthyasetu_dispensing_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <PharmacyPortalLayout
      pageTitle="Dispensing History & Traceability"
      pageSubtitle="Immutable audit records of all dispensed prescriptions, receipts, and government health scheme vouchers"
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
        </div>
      }
    >
      <div className="space-y-5">
        {/* Search & Filter Bar */}
        <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Dispensing ID, Receipt No, Rx ID, Patient, or Medicine..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-900 dark:text-brand-dark-text placeholder-slate-400 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-700 dark:text-brand-dark-text focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Dispensing Types</option>
              <option value="full">Full Dispensing</option>
              <option value="partial">Partial Dispensing</option>
            </select>

            <select
              value={pharmacistFilter}
              onChange={(e) => setPharmacistFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-700 dark:text-brand-dark-text focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Pharmacists</option>
              {pharmacists.map((ph) => (
                <option key={ph} value={ph}>
                  {ph}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-700 dark:text-brand-dark-text focus:ring-2 focus:ring-emerald-500"
            />

            {(searchQuery || typeFilter !== 'all' || pharmacistFilter !== 'all' || dateFilter) && (
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

        {/* History Table */}
        <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-brand-dark-elevated border-b border-slate-200 dark:border-brand-dark-border font-semibold text-slate-600 dark:text-brand-dark-muted text-[11px] uppercase">
                  <th className="px-4 py-3">Receipt / ID</th>
                  <th className="px-4 py-3">Prescription ID</th>
                  <th className="px-4 py-3">Patient & Collector</th>
                  <th className="px-4 py-3">Dispensed Items & Batches</th>
                  <th className="px-4 py-3">Pharmacist</th>
                  <th className="px-4 py-3">Date & Time</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Audit Status</th>
                  <th className="px-4 py-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-brand-dark-border">
                {filteredHistory.map((rec) => (
                  <tr
                    key={rec.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-brand-dark-elevated/40 transition-colors"
                  >
                    <td className="px-4 py-3.5 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {rec.receiptNumber}
                      <span className="block text-[10px] text-slate-400 font-normal mt-0.5">
                        {rec.id}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono font-semibold text-slate-700 dark:text-brand-dark-text">
                      {rec.prescriptionId}
                    </td>
                    <td className="px-4 py-3.5">
                      <strong className="text-slate-900 dark:text-brand-dark-heading block">
                        {rec.patient.name}
                      </strong>
                      <span className="text-[11px] text-slate-500 dark:text-brand-dark-muted block">
                        Collector: {rec.collectorName} ({rec.collectorRelation})
                      </span>
                    </td>
                    <td className="px-4 py-3.5 max-w-[280px]">
                      <div className="space-y-1">
                        {rec.dispensedItems.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between gap-2 text-[11px]"
                          >
                            <span className="font-semibold text-slate-800 dark:text-brand-dark-text truncate">
                              {item.dispensedQuantity}x {item.genericName}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400 flex-shrink-0">
                              Batch: {item.batchNumber}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 dark:text-brand-dark-text">
                      <strong className="block">{rec.pharmacistName.split(' ')[0]}</strong>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {rec.pharmacistLicense}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-brand-dark-muted whitespace-nowrap">
                      {rec.date} • {rec.time}
                    </td>
                    <td className="px-4 py-3.5">
                      <DispensingTypeBadge type={rec.dispensingType} />
                    </td>
                    <td className="px-4 py-3.5">
                      {rec.status === 'completed' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300">
                          Correction Event
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedReceipt(rec);
                          setIsReceiptModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 hover:bg-emerald-100 rounded-lg"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredHistory.length === 0 && (
            <div className="p-10">
              <EmptyState
                title="No Dispensing Records Found"
                description="No historical dispensing transactions matched the selected filter criteria."
                actionLabel="Reset Filters"
                onAction={handleClearFilters}
              />
            </div>
          )}
        </div>
      </div>

      {/* Dispensing Receipt Modal */}
      {selectedReceipt && (
        <DispensingReceiptModal
          isOpen={isReceiptModalOpen}
          record={selectedReceipt}
          onClose={() => {
            setIsReceiptModalOpen(false);
            setSelectedReceipt(null);
          }}
        />
      )}
    </PharmacyPortalLayout>
  );
};
