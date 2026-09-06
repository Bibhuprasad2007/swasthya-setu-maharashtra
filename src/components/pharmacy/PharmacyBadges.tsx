import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  AlertCircle,
  Ban,
  PackageCheck,
  Split,
  ShieldCheck
} from 'lucide-react';
import {
  StockStatus,
  PrescriptionStatus,
  ReservationStatus,
  DispensingType
} from '../../types/pharmacy';

/**
 * Color-coded badges per prompt specification:
 * - Blue: New or Requested
 * - Orange: Pending or Low Stock
 * - Green: Ready, Available, or Completed
 * - Red: Rejected, Expired, or Out of Stock
 * - Purple: Partially Available or Partially Dispensed
 * - Grey: Cancelled
 */

export const StockStatusBadge: React.FC<{ status: StockStatus; quantity?: number }> = ({
  status,
  quantity
}) => {
  switch (status) {
    case 'available':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700/60">
          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          Available {quantity !== undefined ? `(${quantity})` : ''}
        </span>
      );
    case 'low_stock':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/70 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-700/60">
          <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          Low Stock {quantity !== undefined ? `(${quantity})` : ''}
        </span>
      );
    case 'near_expiry':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-800 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/70 px-2.5 py-0.5 rounded-full border border-orange-300 dark:border-orange-700/60">
          <Clock className="w-3 h-3 text-orange-600 dark:text-orange-400" />
          Near Expiry
        </span>
      );
    case 'out_of_stock':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/70 px-2.5 py-0.5 rounded-full border border-rose-300 dark:border-rose-700/60">
          <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
          Out of Stock
        </span>
      );
    case 'expired':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/70 px-2.5 py-0.5 rounded-full border border-rose-300 dark:border-rose-700/60">
          <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
          Expired (Blocked)
        </span>
      );
    default:
      return null;
  }
};

export const PrescriptionStatusBadge: React.FC<{ status: PrescriptionStatus }> = ({ status }) => {
  switch (status) {
    case 'finalized':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 px-2.5 py-0.5 rounded-full border border-blue-300 dark:border-blue-700/60">
          <ShieldCheck className="w-3 h-3 text-blue-600 dark:text-blue-400" />
          Finalized (Active)
        </span>
      );
    case 'partially_dispensed':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-800 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/70 px-2.5 py-0.5 rounded-full border border-purple-300 dark:border-purple-700/60">
          <Split className="w-3 h-3 text-purple-600 dark:text-purple-400" />
          Partially Dispensed
        </span>
      );
    case 'fully_dispensed':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700/60">
          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          Fully Dispensed
        </span>
      );
    case 'cancelled':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-300 dark:border-slate-700">
          <Ban className="w-3 h-3 text-slate-500" />
          Cancelled
        </span>
      );
    case 'expired':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/70 px-2.5 py-0.5 rounded-full border border-rose-300 dark:border-rose-700/60">
          <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
          Expired
        </span>
      );
    default:
      return null;
  }
};

export const ReservationStatusBadge: React.FC<{ status: ReservationStatus }> = ({ status }) => {
  switch (status) {
    case 'requested':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 px-2.5 py-0.5 rounded-full border border-blue-300 dark:border-blue-700/60">
          <Clock className="w-3 h-3 text-blue-600 dark:text-blue-400" />
          Requested
        </span>
      );
    case 'accepted':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700/60">
          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          Accepted (Reserved)
        </span>
      );
    case 'partially_available':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-800 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/70 px-2.5 py-0.5 rounded-full border border-purple-300 dark:border-purple-700/60">
          <Split className="w-3 h-3 text-purple-600 dark:text-purple-400" />
          Partially Available
        </span>
      );
    case 'ready_for_collection':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700/60 animate-pulse">
          <PackageCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          Ready for Collection
        </span>
      );
    case 'collected':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700/60">
          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          Collected / Dispensed
        </span>
      );
    case 'rejected':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/70 px-2.5 py-0.5 rounded-full border border-rose-300 dark:border-rose-700/60">
          <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
          Rejected
        </span>
      );
    case 'cancelled':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-300 dark:border-slate-700">
          <Ban className="w-3 h-3 text-slate-500" />
          Cancelled
        </span>
      );
    case 'expired':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/70 px-2.5 py-0.5 rounded-full border border-rose-300 dark:border-rose-700/60">
          <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
          Expired Uncollected
        </span>
      );
    default:
      return null;
  }
};

export const DispensingTypeBadge: React.FC<{ type: DispensingType }> = ({ type }) => {
  if (type === 'full') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700/60">
        <CheckCircle2 className="w-3 h-3" />
        Full Dispensing
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-800 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/70 px-2.5 py-0.5 rounded-full border border-purple-300 dark:border-purple-700/60">
      <Split className="w-3 h-3" />
      Partial Dispensing
    </span>
  );
};
