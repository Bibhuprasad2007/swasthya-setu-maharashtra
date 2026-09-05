import React from 'react';
import { LabOrderStatus, LabPriority, SampleStatus, ResultFlag } from '../../types/lab';
import {
  Clock, CheckCircle2, AlertCircle, X, FileCheck2, UserCheck,
  TestTube, Loader2, AlertTriangle, BanIcon,
  Zap, Activity,
} from 'lucide-react';

// ─── Lab Order Status Badge ───────────────────────────────────────────────────

const ORDER_STATUS_CONFIG: Record<LabOrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  ordered: {
    label: 'Ordered',
    color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/60',
    icon: <Clock className="w-3 h-3" />,
  },
  accepted: {
    label: 'Accepted',
    color: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800/60',
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  sample_pending: {
    label: 'Sample Pending',
    color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60',
    icon: <Clock className="w-3 h-3" />,
  },
  sample_collected: {
    label: 'Sample Collected',
    color: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-300 dark:border-cyan-800/60',
    icon: <TestTube className="w-3 h-3" />,
  },
  processing: {
    label: 'Processing',
    color: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800/60',
    icon: <Loader2 className="w-3 h-3 animate-spin" />,
  },
  awaiting_verification: {
    label: 'Awaiting Verification',
    color: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800/60',
    icon: <AlertCircle className="w-3 h-3" />,
  },
  report_ready: {
    label: 'Report Ready',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60',
    icon: <FileCheck2 className="w-3 h-3" />,
  },
  doctor_reviewed: {
    label: 'Doctor Reviewed',
    color: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700/60',
    icon: <UserCheck className="w-3 h-3" />,
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60',
    icon: <BanIcon className="w-3 h-3" />,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800/30 dark:text-slate-500 dark:border-slate-700/40',
    icon: <X className="w-3 h-3" />,
  },
};

interface OrderStatusBadgeProps {
  status: LabOrderStatus;
  size?: 'sm' | 'md';
}

export const LabOrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, size = 'md' }) => {
  const config = ORDER_STATUS_CONFIG[status];
  const sizeClass = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5';
  return (
    <span className={`inline-flex items-center gap-1 font-semibold rounded-md border ${config.color} ${sizeClass}`}>
      {config.icon}
      {config.label}
    </span>
  );
};

// ─── Priority Badge ───────────────────────────────────────────────────────────

const PRIORITY_CONFIG: Record<LabPriority, { label: string; color: string; icon: React.ReactNode }> = {
  routine: {
    label: 'Routine',
    color: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700/60',
    icon: <Activity className="w-3 h-3" />,
  },
  urgent: {
    label: 'Urgent',
    color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60',
    icon: <AlertTriangle className="w-3 h-3" />,
  },
  emergency: {
    label: 'Emergency',
    color: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60',
    icon: <Zap className="w-3 h-3" />,
  },
};

interface PriorityBadgeProps {
  priority: LabPriority;
  size?: 'sm' | 'md';
}

export const LabPriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  const config = PRIORITY_CONFIG[priority];
  const sizeClass = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5';
  return (
    <span className={`inline-flex items-center gap-1 font-semibold rounded-md border ${config.color} ${sizeClass}`}>
      {config.icon}
      {config.label}
    </span>
  );
};

// ─── Sample Status Badge ──────────────────────────────────────────────────────

const SAMPLE_STATUS_CONFIG: Record<SampleStatus, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60' },
  collected: { label: 'Collected', color: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-300 dark:border-cyan-800/60' },
  received: { label: 'Received', color: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800/60' },
  processing: { label: 'Processing', color: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800/60' },
  rejected: { label: 'Rejected', color: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60' },
  recollection_required: { label: 'Recollection Required', color: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800/60' },
};

export const SampleStatusBadge: React.FC<{ status: SampleStatus; size?: 'sm' | 'md' }> = ({ status, size = 'md' }) => {
  const config = SAMPLE_STATUS_CONFIG[status];
  const sizeClass = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5';
  return (
    <span className={`inline-flex items-center gap-1 font-semibold rounded-md border ${config.color} ${sizeClass}`}>
      {config.label}
    </span>
  );
};

// ─── Result Flag Badge ────────────────────────────────────────────────────────

const FLAG_CONFIG: Record<ResultFlag, { label: string; color: string }> = {
  normal: { label: 'Normal', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60' },
  low: { label: 'Low ↓', color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/60' },
  high: { label: 'High ↑', color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60' },
  critical: { label: 'CRITICAL', color: 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700/80 font-bold' },
};

export const ResultFlagBadge: React.FC<{ flag: ResultFlag; size?: 'sm' | 'md' }> = ({ flag, size = 'md' }) => {
  const config = FLAG_CONFIG[flag];
  const sizeClass = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5';
  return (
    <span className={`inline-flex items-center font-semibold rounded-md border ${config.color} ${sizeClass}`}>
      {config.label}
    </span>
  );
};
