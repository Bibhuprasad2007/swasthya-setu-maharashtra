import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  CalendarCheck2,
  PackageCheck,
  AlertTriangle,
  AlertCircle,
  Clock,
  ChevronRight,
  CheckCircle2,
  History
} from 'lucide-react';
import { PharmacyPortalLayout } from '../../components/layouts/PharmacyPortalLayout';
import { usePharmacyPortal } from '../../context/PharmacyPortalContext';
import {
  ReservationStatusBadge,
  StockStatusBadge,
  DispensingTypeBadge
} from '../../components/pharmacy/PharmacyBadges';
import { BatchModal } from '../../components/pharmacy/BatchModal';
import { ReservationActionModal } from '../../components/pharmacy/ReservationActionModal';
import { DispensingReceiptModal } from '../../components/pharmacy/DispensingReceiptModal';
import { MedicineBatch, MedicineReservation, DispensingRecord } from '../../types/pharmacy';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  badgeText?: string;
  badgeColor?: string;
  accentBg: string;
  onClick?: () => void;
  isAlert?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  badgeText,
  badgeColor = 'bg-slate-100 text-slate-700',
  accentBg,
  onClick,
  isAlert
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full text-left bg-white dark:bg-brand-dark-surface rounded-2xl border shadow-xs p-4 sm:p-5 transition-all hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
      isAlert && value > 0
        ? 'border-amber-300 dark:border-amber-800/80 ring-1 ring-amber-400 dark:ring-amber-700'
        : 'border-slate-200 dark:border-brand-dark-border'
    }`}
  >
    <div className="flex items-start justify-between gap-2">
      <div className={`p-2.5 rounded-xl ${accentBg} flex-shrink-0`}>{icon}</div>
      {badgeText && (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${badgeColor}`}>
          {badgeText}
        </span>
      )}
    </div>
    <div className="mt-3">
      <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-brand-dark-heading font-mono">
        {value}
      </p>
      <p className="text-xs text-slate-500 dark:text-brand-dark-muted mt-1 font-semibold">{label}</p>
    </div>
  </button>
);

export const PharmacyDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { dashboardStats, reservations, batches, dispensingHistory } = usePharmacyPortal();

  // Modals
  const [selectedBatchForAdjust, setSelectedBatchForAdjust] = useState<MedicineBatch | null>(null);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

  const [selectedResForAction, setSelectedResForAction] = useState<MedicineReservation | null>(null);
  const [resActionType, setResActionType] = useState<'accept' | 'partial' | 'reject' | 'ready' | 'cancel' | null>(null);
  const [isResModalOpen, setIsResModalOpen] = useState(false);

  const [selectedReceipt, setSelectedReceipt] = useState<DispensingRecord | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Filtered lists for dashboard
  const recentReservations = reservations.slice(0, 5);
  const stockAlertBatches = batches
    .filter((b) => b.status === 'low_stock' || b.status === 'out_of_stock' || b.status === 'near_expiry')
    .slice(0, 5);
  const recentDispensing = dispensingHistory.slice(0, 5);

  return (
    <PharmacyPortalLayout
      pageTitle="Dispensary Dashboard"
      pageSubtitle="Real-time medicine inventory, digital prescriptions, and patient reservations overview"
      headerAction={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/pharmacy/prescriptions')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Process Prescriptions</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* 7 Summary Cards per prompt requirements */}
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4">
          <StatCard
            icon={<FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
            label="New Prescriptions"
            value={dashboardStats.newPrescriptions}
            badgeText="Active e-Rx"
            badgeColor="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300"
            accentBg="bg-blue-50 dark:bg-blue-950/60"
            onClick={() => navigate('/pharmacy/prescriptions')}
          />
          <StatCard
            icon={<CalendarCheck2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
            label="Pending Reservations"
            value={dashboardStats.pendingReservations}
            badgeText="Patient App"
            badgeColor="bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
            accentBg="bg-amber-50 dark:bg-amber-950/60"
            onClick={() => navigate('/pharmacy/reservations')}
            isAlert={dashboardStats.pendingReservations > 0}
          />
          <StatCard
            icon={<PackageCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
            label="Ready for Collection"
            value={dashboardStats.readyForCollection}
            badgeText="At Counter"
            badgeColor="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
            accentBg="bg-emerald-50 dark:bg-emerald-950/60"
            onClick={() => navigate('/pharmacy/reservations')}
          />
          <StatCard
            icon={<AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />}
            label="Low-Stock Medicines"
            value={dashboardStats.lowStockCount}
            badgeText="Reorder"
            badgeColor="bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300"
            accentBg="bg-orange-50 dark:bg-orange-950/60"
            onClick={() => navigate('/pharmacy/inventory')}
            isAlert={dashboardStats.lowStockCount > 0}
          />
          <StatCard
            icon={<AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
            label="Out-of-Stock"
            value={dashboardStats.outOfStockCount}
            badgeText="Shortage"
            badgeColor="bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300"
            accentBg="bg-rose-50 dark:bg-rose-950/60"
            onClick={() => navigate('/pharmacy/inventory')}
            isAlert={dashboardStats.outOfStockCount > 0}
          />
          <StatCard
            icon={<Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />}
            label="Near Expiry (<90d)"
            value={dashboardStats.nearExpiryCount}
            badgeText="FEFO Alert"
            badgeColor="bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300"
            accentBg="bg-orange-50 dark:bg-orange-950/60"
            onClick={() => navigate('/pharmacy/inventory')}
          />
          <StatCard
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
            label="Dispensed Today"
            value={dashboardStats.dispensedTodayCount}
            badgeText="Completed"
            badgeColor="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
            accentBg="bg-emerald-50 dark:bg-emerald-950/60"
            onClick={() => navigate('/pharmacy/dispensing-history')}
          />
        </div>

        {/* Main Grid: 2 Columns for Sections */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* SECTION 1: RECENT RESERVATIONS (2 Columns) */}
          <div className="xl:col-span-2 bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border shadow-xs overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-brand-dark-border">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-brand-dark-heading flex items-center gap-2">
                  <CalendarCheck2 className="w-4 h-4 text-emerald-600" />
                  Recent Patient Reservations (Android App)
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-brand-dark-muted mt-0.5">
                  Pre-ordered medicine reservations from registered patients
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/pharmacy/reservations')}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1"
              >
                <span>View All ({reservations.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50 dark:bg-brand-dark-elevated border-b border-slate-100 dark:border-brand-dark-border font-semibold text-slate-600 dark:text-brand-dark-muted">
                    <th className="px-4 py-3">Reservation ID</th>
                    <th className="px-4 py-3">Patient Name</th>
                    <th className="px-4 py-3">Prescription ID</th>
                    <th className="px-4 py-3">Requested Medicines</th>
                    <th className="px-4 py-3">Request Time</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-brand-dark-border">
                  {recentReservations.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-50/70 dark:hover:bg-brand-dark-elevated/40 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {res.id}
                      </td>
                      <td className="px-4 py-3">
                        <strong className="text-slate-900 dark:text-brand-dark-text block">
                          {res.patient.name}
                        </strong>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {res.patient.maskedPhone}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600 dark:text-brand-dark-muted">
                        {res.prescriptionId}
                      </td>
                      <td className="px-4 py-3 max-w-[200px]">
                        <span className="truncate block font-medium text-slate-700 dark:text-brand-dark-text">
                          {res.requestedMedicines.map((m) => `${m.requestedQuantity}x ${m.genericName}`).join(', ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-brand-dark-muted whitespace-nowrap">
                        {new Date(res.reservationDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3">
                        <ReservationStatusBadge status={res.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        {res.status === 'requested' && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedResForAction(res);
                              setResActionType('accept');
                              setIsResModalOpen(true);
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                          >
                            Accept
                          </button>
                        )}
                        {res.status === 'accepted' && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedResForAction(res);
                              setResActionType('ready');
                              setIsResModalOpen(true);
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 hover:bg-emerald-100 rounded-lg"
                          >
                            Pack Ready
                          </button>
                        )}
                        {res.status === 'ready_for_collection' && (
                          <button
                            type="button"
                            onClick={() => navigate('/pharmacy/prescriptions')}
                            className="px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                          >
                            Dispense
                          </button>
                        )}
                        {['collected', 'rejected', 'cancelled'].includes(res.status) && (
                          <button
                            type="button"
                            onClick={() => navigate('/pharmacy/reservations')}
                            className="px-2.5 py-1 text-[11px] font-semibold text-slate-500 hover:underline"
                          >
                            Details
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 2: MEDICINE STOCK ALERTS (1 Column) */}
          <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border shadow-xs overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-brand-dark-border">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-brand-dark-heading flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Medicine Stock Alerts
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-brand-dark-muted mt-0.5">
                    Items requiring immediate restocking or expiry review
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/pharmacy/inventory')}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                >
                  Inventory →
                </button>
              </div>

              <div className="p-3 space-y-2.5">
                {stockAlertBatches.length === 0 ? (
                  <div className="p-6 text-center text-slate-400">All stock levels are optimal.</div>
                ) : (
                  stockAlertBatches.map((b) => (
                    <div
                      key={b.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-brand-dark-elevated/40 border border-slate-200 dark:border-brand-dark-border flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <strong className="text-slate-900 dark:text-brand-dark-heading">
                            {b.genericName}
                          </strong>
                          <span className="font-mono text-[10px] text-slate-400">
                            ({b.batchNumber})
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-brand-dark-muted mt-0.5">
                          Avail: <strong className="text-slate-800 dark:text-brand-dark-text font-mono">{b.availableQuantity}</strong> (Min: {b.minStockThreshold}) • Exp: {b.expiryDate}
                        </div>
                        <div className="mt-1">
                          <StockStatusBadge status={b.status} />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBatchForAdjust(b);
                          setIsBatchModalOpen(true);
                        }}
                        className="flex-shrink-0 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 dark:text-brand-dark-text bg-white dark:bg-brand-dark-elevated hover:bg-slate-100 border border-slate-300 dark:border-brand-dark-border rounded-lg"
                      >
                        Update Stock
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-brand-dark-elevated/30 border-t border-slate-100 dark:border-brand-dark-border text-center">
              <span className="text-[11px] text-slate-500 dark:text-brand-dark-muted">
                Aggregated inventory shortages are safely synced to the Government Admin Portal.
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 3: RECENT DISPENSING ACTIVITY (Full width) */}
        <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-brand-dark-border">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-brand-dark-heading flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-600" />
                Recent Dispensing Activity
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-brand-dark-muted mt-0.5">
                Audit records of completed medicine issuances
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/pharmacy/dispensing-history')}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1"
            >
              <span>View Full History ({dispensingHistory.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-brand-dark-elevated border-b border-slate-100 dark:border-brand-dark-border font-semibold text-slate-600 dark:text-brand-dark-muted">
                  <th className="px-4 py-3">Receipt No</th>
                  <th className="px-4 py-3">Patient Name</th>
                  <th className="px-4 py-3">Prescription ID</th>
                  <th className="px-4 py-3">Medicines Dispensed</th>
                  <th className="px-4 py-3">Operating Pharmacist</th>
                  <th className="px-4 py-3">Date & Time</th>
                  <th className="px-4 py-3">Fulfilment Status</th>
                  <th className="px-4 py-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-brand-dark-border">
                {recentDispensing.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/70 dark:hover:bg-brand-dark-elevated/40 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {rec.receiptNumber}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-brand-dark-text">
                      {rec.patient.name}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600 dark:text-brand-dark-muted">
                      {rec.prescriptionId}
                    </td>
                    <td className="px-4 py-3 max-w-[240px]">
                      <span className="truncate block font-medium text-slate-700 dark:text-brand-dark-text">
                        {rec.dispensedItems.map((i) => `${i.dispensedQuantity}x ${i.genericName}`).join(', ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-brand-dark-muted">
                      {rec.pharmacistName.split(' ')[0]} ({rec.pharmacistId})
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-brand-dark-muted whitespace-nowrap">
                      {rec.date} {rec.time}
                    </td>
                    <td className="px-4 py-3">
                      <DispensingTypeBadge type={rec.dispensingType} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedReceipt(rec);
                          setIsReceiptModalOpen(true);
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 hover:bg-emerald-100 rounded-lg"
                      >
                        Print
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Batch Adjust Modal */}
      {selectedBatchForAdjust && (
        <BatchModal
          isOpen={isBatchModalOpen}
          mode="stock_adjust"
          batch={selectedBatchForAdjust}
          onClose={() => {
            setIsBatchModalOpen(false);
            setSelectedBatchForAdjust(null);
          }}
        />
      )}

      {/* Reservation Action Modal */}
      {selectedResForAction && (
        <ReservationActionModal
          isOpen={isResModalOpen}
          actionType={resActionType}
          reservation={selectedResForAction}
          onClose={() => {
            setIsResModalOpen(false);
            setSelectedResForAction(null);
          }}
        />
      )}

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
