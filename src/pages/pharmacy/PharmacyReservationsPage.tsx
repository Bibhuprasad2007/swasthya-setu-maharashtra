import React, { useState, useMemo } from 'react';
import {
  Search,
  RotateCcw,
  XCircle,
  PackageCheck,
  Eye,
  FileText
} from 'lucide-react';
import { PharmacyPortalLayout } from '../../components/layouts/PharmacyPortalLayout';
import { usePharmacyPortal } from '../../context/PharmacyPortalContext';
import { ReservationStatusBadge } from '../../components/pharmacy/PharmacyBadges';
import { EmptyState } from '../../components/common/EmptyState';
import { ReservationActionModal } from '../../components/pharmacy/ReservationActionModal';
import { PrescriptionDetailsModal } from '../../components/pharmacy/PrescriptionDetailsModal';
import { SafeDispensingModal } from '../../components/pharmacy/SafeDispensingModal';
import { DispensingReceiptModal } from '../../components/pharmacy/DispensingReceiptModal';
import { MedicineReservation, PharmacyPrescription, DispensingRecord } from '../../types/pharmacy';

export const PharmacyReservationsPage: React.FC = () => {
  const { reservations, prescriptions } = usePharmacyPortal();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [selectedResForAction, setSelectedResForAction] = useState<MedicineReservation | null>(null);
  const [actionType, setActionType] = useState<'accept' | 'partial' | 'reject' | 'ready' | 'cancel' | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);

  const [selectedRxForView, setSelectedRxForView] = useState<PharmacyPrescription | null>(null);
  const [dispenseTargetRes, setDispenseTargetRes] = useState<MedicineReservation | null>(null);
  const [generatedReceipt, setGeneratedReceipt] = useState<DispensingRecord | null>(null);

  // Filtered reservations
  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        r.id.toLowerCase().includes(query) ||
        r.patient.name.toLowerCase().includes(query) ||
        r.patient.abhaId.toLowerCase().includes(query) ||
        r.prescriptionId.toLowerCase().includes(query);

      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [reservations, searchQuery, statusFilter]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
  };

  const handleViewPrescription = (prescriptionId: string) => {
    const rx = prescriptions.find((p) => p.id === prescriptionId);
    if (rx) {
      setSelectedRxForView(rx);
    }
  };

  const handleStartDispenseForReservation = (res: MedicineReservation) => {
    const rx = prescriptions.find((p) => p.id === res.prescriptionId);
    if (rx) {
      setDispenseTargetRes(res);
    }
  };

  return (
    <PharmacyPortalLayout
      pageTitle="Medicine Reservations"
      pageSubtitle="Pre-order medicine reservations received from the SwasthyaSetu Patient Android App"
    >
      <div className="space-y-5">
        {/* Search & Filter Bar */}
        <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Reservation ID, Patient Name, ABHA ID, or Prescription..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-900 dark:text-brand-dark-text placeholder-slate-400 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-700 dark:text-brand-dark-text focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Reservation Statuses</option>
              <option value="requested">Requested (Pending Pharmacist)</option>
              <option value="accepted">Accepted (Stock Held)</option>
              <option value="partially_available">Partially Available</option>
              <option value="ready_for_collection">Ready for Collection</option>
              <option value="collected">Collected / Dispensed</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {(searchQuery || statusFilter !== 'all') && (
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

        {/* Reservations Table */}
        <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-brand-dark-elevated border-b border-slate-200 dark:border-brand-dark-border font-semibold text-slate-600 dark:text-brand-dark-muted text-[11px] uppercase">
                  <th className="px-4 py-3">Reservation ID</th>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Prescription</th>
                  <th className="px-4 py-3">Requested Items & Stock Status</th>
                  <th className="px-4 py-3">Collection Window</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-brand-dark-border">
                {filteredReservations.map((res) => {
                  return (
                    <tr
                      key={res.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-brand-dark-elevated/40 transition-colors"
                    >
                      <td className="px-4 py-3.5 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {res.id}
                        <span className="block text-[10px] text-slate-400 font-sans mt-0.5">
                          {new Date(res.reservationDateTime).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <strong className="text-slate-900 dark:text-brand-dark-heading block">
                          {res.patient.name}
                        </strong>
                        <span className="text-[11px] text-slate-500 dark:text-brand-dark-muted font-mono">
                          {res.patient.maskedPhone}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono">
                        <button
                          type="button"
                          onClick={() => handleViewPrescription(res.prescriptionId)}
                          className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{res.prescriptionId}</span>
                        </button>
                      </td>
                      <td className="px-4 py-3.5 max-w-[280px]">
                        <div className="space-y-1">
                          {res.requestedMedicines.map((m, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between gap-2 text-[11px]"
                            >
                              <span className="truncate text-slate-800 dark:text-brand-dark-text font-medium">
                                {m.requestedQuantity}x {m.medicineName}
                              </span>
                              {m.isAvailable ? (
                                <span className="text-[10px] text-emerald-600 font-semibold flex-shrink-0">
                                  Available ({m.availableQuantity})
                                </span>
                              ) : (
                                <span className="text-[10px] text-rose-600 font-semibold flex-shrink-0">
                                  Out of Stock
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700 dark:text-brand-dark-text">
                        <span>{res.estimatedCollectionTime || res.collectionWindow}</span>
                        {res.notes && (
                          <span className="text-[11px] text-slate-400 block mt-0.5 italic truncate max-w-[180px]">
                            {res.notes}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <ReservationStatusBadge status={res.status} />
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* REQUESTED: Accept / Partial / Reject */}
                          {res.status === 'requested' && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedResForAction(res);
                                  setActionType('accept');
                                  setIsActionModalOpen(true);
                                }}
                                className="px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                              >
                                Accept
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedResForAction(res);
                                  setActionType('partial');
                                  setIsActionModalOpen(true);
                                }}
                                className="px-2 py-1 text-[11px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/70 border border-purple-300 hover:bg-purple-100 rounded-lg"
                              >
                                Partial
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedResForAction(res);
                                  setActionType('reject');
                                  setIsActionModalOpen(true);
                                }}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                                title="Reject reservation"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {/* ACCEPTED or PARTIAL: Mark Ready or Cancel */}
                          {(res.status === 'accepted' || res.status === 'partially_available') && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedResForAction(res);
                                  setActionType('ready');
                                  setIsActionModalOpen(true);
                                }}
                                className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 hover:bg-emerald-100 rounded-lg"
                              >
                                Pack Ready
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedResForAction(res);
                                  setActionType('cancel');
                                  setIsActionModalOpen(true);
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                                title="Cancel reservation"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {/* READY: Dispense directly */}
                          {res.status === 'ready_for_collection' && (
                            <button
                              type="button"
                              onClick={() => handleStartDispenseForReservation(res)}
                              className="px-3 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center gap-1"
                            >
                              <PackageCheck className="w-3.5 h-3.5" />
                              <span>Dispense Now</span>
                            </button>
                          )}

                          {/* Completed, Cancelled, or Rejected: View prescription */}
                          {['collected', 'rejected', 'cancelled', 'expired'].includes(res.status) && (
                            <button
                              type="button"
                              onClick={() => handleViewPrescription(res.prescriptionId)}
                              className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-brand-dark-text hover:bg-slate-100 rounded-lg"
                              title="View Linked Prescription"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredReservations.length === 0 && (
            <div className="p-10">
              <EmptyState
                title="No Reservations Found"
                description="No patient reservations matched the current criteria."
                actionLabel="Clear Filters"
                onAction={handleClearFilters}
              />
            </div>
          )}
        </div>
      </div>

      {/* Reservation Action Modal */}
      {selectedResForAction && (
        <ReservationActionModal
          isOpen={isActionModalOpen}
          actionType={actionType}
          reservation={selectedResForAction}
          onClose={() => {
            setIsActionModalOpen(false);
            setSelectedResForAction(null);
          }}
        />
      )}

      {/* Linked Prescription Details Modal */}
      {selectedRxForView && (
        <PrescriptionDetailsModal
          isOpen={!!selectedRxForView}
          prescription={selectedRxForView}
          onClose={() => setSelectedRxForView(null)}
          onStartDispense={(rx) => {
            setSelectedRxForView(null);
            const res = reservations.find((r) => r.prescriptionId === rx.id);
            setDispenseTargetRes(res || null);
          }}
          onContactDoctor={() => {}}
        />
      )}

      {/* Safe Dispensing Modal launched from Reservation */}
      {dispenseTargetRes && (
        <SafeDispensingModal
          isOpen={!!dispenseTargetRes}
          prescription={prescriptions.find((p) => p.id === dispenseTargetRes.prescriptionId) || null}
          linkedReservation={dispenseTargetRes}
          onClose={() => setDispenseTargetRes(null)}
          onDispensingComplete={(receipt) => {
            setGeneratedReceipt(receipt);
          }}
        />
      )}

      {/* Receipt Modal */}
      {generatedReceipt && (
        <DispensingReceiptModal
          isOpen={!!generatedReceipt}
          record={generatedReceipt}
          onClose={() => setGeneratedReceipt(null)}
        />
      )}
    </PharmacyPortalLayout>
  );
};
