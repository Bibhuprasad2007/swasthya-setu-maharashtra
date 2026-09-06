/**
 * Alert Action Modal — Acknowledge, Assign, In-Progress, Resolve, Reopen, Dismiss
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  CheckCircle2,
  UserCheck,
  PlayCircle,
  ShieldCheck,
  RotateCcw,
  XCircle,
  Clock,
  Building2,
  ChevronDown,
} from 'lucide-react';
import { OperationalAlert } from '../../types/admin';
import { AlertSeverityBadge, AlertStatusBadge, AlertCategoryBadge } from './AdminBadges';
import { AdminUser } from '../../types/admin';

type ActionType = 'acknowledge' | 'assign' | 'in_progress' | 'resolve' | 'reopen' | 'dismiss' | 'history';

interface AlertActionModalProps {
  alert: OperationalAlert | null;
  admins: AdminUser[];
  currentUserName: string;
  onClose: () => void;
  onAcknowledge: (alertId: string, note?: string) => void;
  onAssign: (alertId: string, adminId: string, adminName: string) => void;
  onMoveToInProgress: (alertId: string, note?: string) => void;
  onResolve: (alertId: string, resolutionNote: string) => void;
  onReopen: (alertId: string, reason: string) => void;
  onDismiss: (alertId: string) => void;
}

export const AlertActionModal: React.FC<AlertActionModalProps> = ({
  alert,
  admins,
  currentUserName,
  onClose,
  onAcknowledge,
  onAssign,
  onMoveToInProgress,
  onResolve,
  onReopen,
  onDismiss,
}) => {
  const [activeAction, setActiveAction] = useState<ActionType>('history');
  const [note, setNote] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState('');
  const [confirmDismiss, setConfirmDismiss] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (alert) {
      setActiveAction('history');
      setNote('');
      setResolutionNote('');
      setSelectedAdmin('');
      setConfirmDismiss(false);
      setTimeout(() => closeRef.current?.focus(), 50);
    }
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [alert, onClose]);

  if (!alert) return null;

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const canAcknowledge = alert.status === 'new';
  const canInProgress = alert.status === 'acknowledged' || alert.status === 'new';
  const canResolve = alert.status !== 'resolved' && alert.status !== 'dismissed';
  const canReopen = alert.status === 'resolved';
  const canDismiss = alert.status !== 'dismissed';

  const handleResolve = () => {
    if (!resolutionNote.trim()) return;
    onResolve(alert.id, resolutionNote.trim());
    onClose();
  };

  const handleReopen = () => {
    if (!note.trim()) return;
    onReopen(alert.id, note.trim());
    onClose();
  };

  const handleAssign = () => {
    const admin = admins.find(a => a.id === selectedAdmin);
    if (!admin) return;
    onAssign(alert.id, admin.id, admin.name);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="alert-modal-title"
    >
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-brand-dark-surface rounded-2xl shadow-2xl border border-slate-200 dark:border-brand-dark-border overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-slate-200 dark:border-brand-dark-border bg-slate-50 dark:bg-brand-dark-elevated">
          <div className="flex-1 min-w-0 pr-3">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-mono text-slate-500 dark:text-brand-dark-muted">{alert.id}</span>
              <AlertSeverityBadge severity={alert.severity} />
              <AlertStatusBadge status={alert.status} />
              <AlertCategoryBadge category={alert.category} />
            </div>
            <h2 id="alert-modal-title" className="text-sm sm:text-base font-bold text-slate-900 dark:text-brand-dark-heading leading-tight">
              {alert.title}
            </h2>
            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-brand-dark-muted flex-wrap">
              <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{alert.facilityName}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatTime(alert.createdAt)}</span>
              {currentUserName && (
                <span className="text-slate-400 dark:text-brand-dark-muted">| Acting as: <strong className="text-slate-600 dark:text-brand-dark-text">{currentUserName}</strong></span>
              )}
            </div>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close alert modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:text-brand-dark-muted dark:hover:text-brand-dark-heading hover:bg-slate-100 dark:hover:bg-brand-dark-bg transition-colors flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description */}
        <div className="px-5 py-3 border-b border-slate-100 dark:border-brand-dark-border bg-white dark:bg-brand-dark-surface">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-brand-dark-text leading-relaxed">{alert.description}</p>
          {alert.assignedToName && (
            <p className="text-xs text-sky-600 dark:text-sky-400 mt-1.5 font-medium flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5" /> Assigned to: {alert.assignedToName}
            </p>
          )}
          {alert.resolutionNote && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
              Resolution: {alert.resolutionNote}
            </p>
          )}
        </div>

        {/* Action Tabs */}
        <div className="flex gap-1 px-4 pt-3 flex-wrap">
          {[
            { key: 'history' as ActionType, label: 'Status History', icon: Clock },
            canAcknowledge && { key: 'acknowledge' as ActionType, label: 'Acknowledge', icon: CheckCircle2 },
            { key: 'assign' as ActionType, label: 'Assign', icon: UserCheck },
            canInProgress && { key: 'in_progress' as ActionType, label: 'In Progress', icon: PlayCircle },
            canResolve && { key: 'resolve' as ActionType, label: 'Resolve', icon: ShieldCheck },
            canReopen && { key: 'reopen' as ActionType, label: 'Reopen', icon: RotateCcw },
          ].filter(Boolean).map((item) => {
            if (!item) return null;
            const { key, label, icon: Icon } = item as { key: ActionType; label: string; icon: React.ComponentType<{ className?: string }> };
            return (
              <button key={key} type="button" onClick={() => setActiveAction(key)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg transition-colors ${
                  activeAction === key
                    ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300'
                    : 'text-slate-600 dark:text-brand-dark-muted hover:bg-slate-100 dark:hover:bg-brand-dark-elevated'
                }`}>
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            );
          })}
        </div>

        {/* Action Panel */}
        <div className="px-5 py-4 max-h-64 overflow-y-auto">
          {activeAction === 'history' && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-600 dark:text-brand-dark-muted mb-2">Status Change History</p>
              {[...alert.statusHistory].reverse().map((entry) => (
                <div key={entry.id} className="flex gap-3 text-xs">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-sky-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <AlertStatusBadge status={entry.status} />
                      <span className="text-slate-500 dark:text-brand-dark-muted">{entry.changedBy}</span>
                      <span className="text-slate-400 dark:text-brand-dark-muted">{formatTime(entry.changedAt)}</span>
                    </div>
                    {entry.note && <p className="text-slate-600 dark:text-brand-dark-text mt-0.5 italic">{entry.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeAction === 'acknowledge' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600 dark:text-brand-dark-muted">Add an optional note about this acknowledgement:</p>
              <textarea
                value={note} onChange={e => setNote(e.target.value)}
                placeholder="e.g. Field team notified, awaiting confirmation..."
                rows={3}
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-brand-dark-border bg-white dark:bg-brand-dark-elevated px-3 py-2 text-slate-900 dark:text-brand-dark-text focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
              />
              <button type="button" onClick={() => { onAcknowledge(alert.id, note); onClose(); }}
                className="px-4 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-xl transition-colors">
                Acknowledge Alert
              </button>
            </div>
          )}

          {activeAction === 'assign' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600 dark:text-brand-dark-muted">Select an administrator to assign this alert to:</p>
              <div className="relative">
                <select value={selectedAdmin} onChange={e => setSelectedAdmin(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-brand-dark-border bg-white dark:bg-brand-dark-elevated px-3 py-2.5 text-slate-900 dark:text-brand-dark-text focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none">
                  <option value="">— Select Administrator —</option>
                  {admins.filter(a => a.accountStatus === 'active').map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.role.replace(/_/g, ' ')})</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              <button type="button" onClick={handleAssign} disabled={!selectedAdmin}
                className="px-4 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded-xl transition-colors">
                Assign Alert
              </button>
            </div>
          )}

          {activeAction === 'in_progress' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600 dark:text-brand-dark-muted">Describe the action being taken:</p>
              <textarea value={note} onChange={e => setNote(e.target.value)}
                placeholder="e.g. Contacting facility in-charge, arranging emergency supply..."
                rows={3}
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-brand-dark-border bg-white dark:bg-brand-dark-elevated px-3 py-2 text-slate-900 dark:text-brand-dark-text focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
              />
              <button type="button" onClick={() => { onMoveToInProgress(alert.id, note); onClose(); }}
                className="px-4 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-colors">
                Mark In Progress
              </button>
            </div>
          )}

          {activeAction === 'resolve' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600 dark:text-brand-dark-muted">
                <strong>Required:</strong> Provide a resolution note before marking this alert as resolved.
              </p>
              <textarea value={resolutionNote} onChange={e => setResolutionNote(e.target.value)}
                placeholder="Describe what was done to resolve this alert..."
                rows={4}
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-brand-dark-border bg-white dark:bg-brand-dark-elevated px-3 py-2 text-slate-900 dark:text-brand-dark-text focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
              />
              {!resolutionNote.trim() && (
                <p className="text-[11px] text-rose-600 dark:text-rose-400">Resolution note is required to resolve an alert.</p>
              )}
              <button type="button" onClick={handleResolve} disabled={!resolutionNote.trim()}
                className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl transition-colors">
                Resolve Alert
              </button>
            </div>
          )}

          {activeAction === 'reopen' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600 dark:text-brand-dark-muted">
                <strong>Required:</strong> Provide a reason for reopening this resolved alert.
              </p>
              <textarea value={note} onChange={e => setNote(e.target.value)}
                placeholder="e.g. Issue recurred after initial resolution..."
                rows={3}
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-brand-dark-border bg-white dark:bg-brand-dark-elevated px-3 py-2 text-slate-900 dark:text-brand-dark-text focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
              />
              <button type="button" onClick={handleReopen} disabled={!note.trim()}
                className="px-4 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl transition-colors">
                Reopen Alert
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {canDismiss && (
          <div className="px-5 py-3 border-t border-slate-100 dark:border-brand-dark-border flex items-center justify-between">
            {!confirmDismiss ? (
              <button type="button" onClick={() => setConfirmDismiss(true)}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-600 dark:text-brand-dark-muted dark:hover:text-rose-400 transition-colors">
                <XCircle className="w-4 h-4" /> Dismiss alert
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-rose-600 dark:text-rose-400 font-semibold">Confirm dismiss?</span>
                <button type="button" onClick={() => { onDismiss(alert.id); onClose(); }}
                  className="px-2.5 py-1 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700">Yes, dismiss</button>
                <button type="button" onClick={() => setConfirmDismiss(false)}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-brand-dark-elevated text-slate-700 dark:text-brand-dark-text rounded-lg hover:bg-slate-200">Cancel</button>
              </div>
            )}
            <button type="button" onClick={onClose}
              className="text-xs text-slate-500 dark:text-brand-dark-muted hover:text-slate-700 dark:hover:text-brand-dark-text">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
