import React, { useState, useMemo } from 'react';
import {
  Search, Filter, Eye, CheckCircle2, X, ChevronDown,
  ClipboardList, Clock, User, Building2,
  Calendar, Beaker, FileText, ChevronRight,
} from 'lucide-react';
import { useLabPortal } from '../../context/LabPortalContext';
import { LabPortalLayout } from '../../components/layouts/LabPortalLayout';
import { LabOrderStatusBadge, LabPriorityBadge } from '../../components/lab/LabBadges';
import { LabOrder, LabOrderStatus, LabPriority } from '../../types/lab';
import { formatDateTime, formatDistanceToNow } from '../../utils/labUtils';
import { useAuth } from '../../context/AuthContext';
import { EmptyState } from '../../components/common/EmptyState';

// ─── Order Detail Drawer ──────────────────────────────────────────────────────

const OrderDetailDrawer: React.FC<{
  order: LabOrder | null;
  onClose: () => void;
  onAccept: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onBeginCollection: (id: string) => void;
}> = ({ order, onClose, onAccept, onReject, onBeginCollection }) => {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');

  if (!order) return null;

  const handleReject = () => {
    if (!rejectReason.trim()) { setRejectError('Please provide a rejection reason.'); return; }
    onReject(order.id, rejectReason);
    setShowRejectForm(false);
    setRejectReason('');
    setRejectError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Order details">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={onClose} />
      <aside className="relative z-10 w-full max-w-md sm:max-w-lg bg-white dark:bg-brand-dark-surface border-l border-slate-200 dark:border-brand-dark-border h-full overflow-y-auto shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-brand-dark-border sticky top-0 bg-white dark:bg-brand-dark-surface z-10">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-brand-dark-heading">Order Details</h3>
            <p className="text-xs text-teal-600 dark:text-teal-400 font-mono mt-0.5">{order.id}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close drawer" className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-brand-dark-elevated transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 px-5 py-4 space-y-5 text-xs">

          {/* Status + Priority */}
          <div className="flex gap-2 flex-wrap">
            <LabOrderStatusBadge status={order.status} />
            <LabPriorityBadge priority={order.priority} />
          </div>

          {/* Patient Info */}
          <section>
            <h4 className="font-bold text-slate-700 dark:text-brand-dark-heading text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-teal-500" /> Patient
            </h4>
            <div className="bg-slate-50 dark:bg-brand-dark-elevated rounded-xl p-3 space-y-1.5">
              <div className="flex justify-between"><span className="text-slate-500 dark:text-brand-dark-muted">Name</span><span className="font-semibold text-slate-800 dark:text-brand-dark-heading">{order.patientName}</span></div>
              <div className="flex justify-between"><span className="text-slate-500 dark:text-brand-dark-muted">Patient ID</span><span className="font-mono text-teal-700 dark:text-teal-400">{order.patientId}</span></div>
              <div className="flex justify-between"><span className="text-slate-500 dark:text-brand-dark-muted">Age / Gender</span><span className="font-semibold text-slate-800 dark:text-brand-dark-heading">{order.patientAge} yrs · {order.patientGender}</span></div>
            </div>
          </section>

          {/* Doctor + Facility */}
          <section>
            <h4 className="font-bold text-slate-700 dark:text-brand-dark-heading text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-teal-500" /> Doctor & Facility
            </h4>
            <div className="bg-slate-50 dark:bg-brand-dark-elevated rounded-xl p-3 space-y-1.5">
              <div className="flex justify-between"><span className="text-slate-500 dark:text-brand-dark-muted">Doctor</span><span className="font-semibold text-slate-800 dark:text-brand-dark-heading">{order.orderingDoctor}</span></div>
              <div className="flex justify-between"><span className="text-slate-500 dark:text-brand-dark-muted">Facility</span><span className="font-semibold text-slate-800 dark:text-brand-dark-heading text-right max-w-[180px]">{order.facility}</span></div>
              <div className="flex justify-between"><span className="text-slate-500 dark:text-brand-dark-muted">Code</span><span className="font-mono text-slate-700 dark:text-brand-dark-text">{order.facilityCode}</span></div>
            </div>
          </section>

          {/* Tests */}
          <section>
            <h4 className="font-bold text-slate-700 dark:text-brand-dark-heading text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Beaker className="w-3.5 h-3.5 text-teal-500" /> Ordered Tests
            </h4>
            <div className="space-y-2">
              {order.tests.map(test => (
                <div key={test.id} className="bg-slate-50 dark:bg-brand-dark-elevated rounded-xl p-3">
                  <p className="font-semibold text-slate-800 dark:text-brand-dark-heading">{test.testName}</p>
                  <div className="text-slate-500 dark:text-brand-dark-muted mt-1 space-y-0.5">
                    <p>Category: {test.category}</p>
                    <p>Sample: <span className="capitalize">{test.sampleType}</span></p>
                    <p>TAT: {test.estimatedTAT}</p>
                    {test.fastingRequired && <p className="text-amber-600 dark:text-amber-400 font-semibold">⚠ Fasting required</p>}
                    {test.preparationNote && <p className="text-slate-400 dark:text-brand-dark-muted italic mt-1">{test.preparationNote}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Clinical Reason */}
          <section>
            <h4 className="font-bold text-slate-700 dark:text-brand-dark-heading text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-teal-500" /> Clinical Reason
            </h4>
            <div className="bg-slate-50 dark:bg-brand-dark-elevated rounded-xl p-3">
              <p className="text-slate-700 dark:text-brand-dark-text leading-relaxed">{order.clinicalReason}</p>
            </div>
          </section>

          {/* Preparation */}
          {order.preparationInstructions && (
            <section>
              <h4 className="font-bold text-slate-700 dark:text-brand-dark-heading text-xs uppercase tracking-wider mb-2">Preparation</h4>
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl p-3">
                <p className="text-amber-800 dark:text-amber-300">{order.preparationInstructions}</p>
              </div>
            </section>
          )}

          {/* Order Date */}
          <div className="flex items-center gap-2 text-slate-500 dark:text-brand-dark-muted">
            <Calendar className="w-3.5 h-3.5" />
            <span>Ordered: {formatDateTime(order.orderDateTime)}</span>
          </div>

          {/* Timeline */}
          <section>
            <h4 className="font-bold text-slate-700 dark:text-brand-dark-heading text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-teal-500" /> Order Timeline
            </h4>
            <div className="space-y-2">
              {order.timeline.map((entry, idx) => (
                <div key={entry.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${idx === 0 ? 'bg-teal-500' : 'bg-slate-300 dark:bg-brand-dark-border'}`} />
                    {idx < order.timeline.length - 1 && <div className="w-px flex-1 bg-slate-200 dark:bg-brand-dark-border mt-1" />}
                  </div>
                  <div className="pb-3">
                    <p className="font-semibold text-slate-800 dark:text-brand-dark-heading">{entry.action}</p>
                    <p className="text-slate-500 dark:text-brand-dark-muted">{entry.performedBy} · {entry.role}</p>
                    {entry.note && <p className="text-slate-400 dark:text-brand-dark-muted italic mt-0.5">{entry.note}</p>}
                    <p className="text-slate-400 dark:text-brand-dark-muted mt-0.5">{formatDateTime(entry.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Rejection Reason Field */}
          {showRejectForm && (
            <section className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 rounded-xl p-4">
              <label htmlFor="reject-reason" className="block font-semibold text-rose-800 dark:text-rose-300 mb-2">
                Rejection Reason (Required)
              </label>
              <textarea
                id="reject-reason"
                value={rejectReason}
                onChange={e => { setRejectReason(e.target.value); setRejectError(''); }}
                className="w-full rounded-xl border border-rose-300 dark:border-rose-700/60 bg-white dark:bg-brand-dark-elevated text-slate-800 dark:text-brand-dark-heading px-3 py-2 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
                rows={3}
                placeholder="e.g., Insufficient clinical information provided..."
              />
              {rejectError && <p className="text-rose-600 dark:text-rose-400 mt-1">{rejectError}</p>}
              <div className="flex gap-2 mt-3">
                <button type="button" onClick={handleReject} className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl py-2 transition-colors">
                  Confirm Rejection
                </button>
                <button type="button" onClick={() => { setShowRejectForm(false); setRejectReason(''); setRejectError(''); }} className="flex-1 bg-slate-100 dark:bg-brand-dark-elevated text-slate-700 dark:text-brand-dark-text font-semibold rounded-xl py-2 transition-colors">
                  Cancel
                </button>
              </div>
            </section>
          )}
        </div>

        {/* Footer Actions */}
        {!showRejectForm && (
          <div className="sticky bottom-0 bg-white dark:bg-brand-dark-surface border-t border-slate-200 dark:border-brand-dark-border px-5 py-4 flex flex-col gap-2">
            {order.status === 'ordered' && (
              <>
                <button
                  type="button"
                  onClick={() => { onAccept(order.id); onClose(); }}
                  className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl py-2.5 transition-colors text-sm"
                >
                  <CheckCircle2 className="w-4 h-4" /> Accept Order
                </button>
                <button
                  type="button"
                  onClick={() => setShowRejectForm(true)}
                  className="w-full flex items-center justify-center gap-2 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 font-semibold rounded-xl py-2.5 transition-colors text-sm"
                >
                  <X className="w-4 h-4" /> Reject Order
                </button>
              </>
            )}
            {order.status === 'accepted' && (
              <button
                type="button"
                onClick={() => { onBeginCollection(order.id); onClose(); }}
                className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-xl py-2.5 transition-colors text-sm"
              >
                Begin Sample Collection
              </button>
            )}
          </div>
        )}
      </aside>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export const LabTestOrdersPage: React.FC = () => {
  const { orders, acceptOrder, rejectOrder, beginSampleCollection, addToast } = useLabPortal();
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<LabPriority | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<LabOrderStatus | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null);

  const by = user?.name ?? 'Lab Technician';

  const filtered = useMemo(() => {
    let result = [...orders];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(o =>
        o.patientName.toLowerCase().includes(q) ||
        o.patientId.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q)
      );
    }
    if (priorityFilter !== 'all') result = result.filter(o => o.priority === priorityFilter);
    if (statusFilter !== 'all') result = result.filter(o => o.status === statusFilter);
    return result.sort((a, b) => new Date(b.orderDateTime).getTime() - new Date(a.orderDateTime).getTime());
  }, [orders, search, priorityFilter, statusFilter]);

  const handleAccept = (id: string) => {
    acceptOrder(id, by);
  };

  const handleRejectWithReason = (id: string, reason: string) => {
    rejectOrder(id, reason, by);
  };

  const handleBeginCollection = (id: string) => {
    beginSampleCollection(id);
    addToast({ type: 'info', title: 'Sample Collection', message: 'Order moved to sample collection stage. Go to Sample Tracking.' });
  };

  return (
    <LabPortalLayout>
      {/* Page Header */}
      <div className="mb-5">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-brand-dark-heading tracking-tight">Test Orders</h2>
        <p className="text-xs text-slate-500 dark:text-brand-dark-muted mt-0.5">All lab orders received from the Doctor Portal</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-brand-dark-muted pointer-events-none" />
          <input
            type="search"
            placeholder="Search patient, ID or order number..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-brand-dark-border bg-white dark:bg-brand-dark-surface text-slate-800 dark:text-brand-dark-heading placeholder:text-slate-400 dark:placeholder:text-brand-dark-muted focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Priority Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value as any)}
            className="pl-8 pr-7 py-2 text-xs rounded-xl border border-slate-200 dark:border-brand-dark-border bg-white dark:bg-brand-dark-surface text-slate-800 dark:text-brand-dark-heading focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none cursor-pointer"
            aria-label="Filter by priority"
          >
            <option value="all">All Priorities</option>
            <option value="routine">Routine</option>
            <option value="urgent">Urgent</option>
            <option value="emergency">Emergency</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="pl-3 pr-7 py-2 text-xs rounded-xl border border-slate-200 dark:border-brand-dark-border bg-white dark:bg-brand-dark-surface text-slate-800 dark:text-brand-dark-heading focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none cursor-pointer"
            aria-label="Filter by status"
          >
            <option value="all">All Statuses</option>
            <option value="ordered">Ordered</option>
            <option value="accepted">Accepted</option>
            <option value="sample_pending">Sample Pending</option>
            <option value="sample_collected">Sample Collected</option>
            <option value="processing">Processing</option>
            <option value="awaiting_verification">Awaiting Verification</option>
            <option value="report_ready">Report Ready</option>
            <option value="doctor_reviewed">Doctor Reviewed</option>
            <option value="rejected">Rejected</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Results Count */}
      <p className="text-xs text-slate-500 dark:text-brand-dark-muted mb-3">
        Showing {filtered.length} of {orders.length} orders
      </p>

      {/* Table (Desktop) */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No orders found"
          description="No test orders match your current search or filter criteria."
          actionText="Clear Filters"
          onAction={() => { setSearch(''); setPriorityFilter('all'); setStatusFilter('all'); }}
        />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden sm:block bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-brand-dark-elevated border-b border-slate-200 dark:border-brand-dark-border">
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-brand-dark-muted whitespace-nowrap">Order ID</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-brand-dark-muted">Patient</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-brand-dark-muted">Doctor</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-brand-dark-muted">Tests</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-brand-dark-muted">Priority</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-brand-dark-muted">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-brand-dark-muted">Ordered</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-brand-dark-muted">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-brand-dark-border">
                  {filtered.map(order => (
                    <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-brand-dark-elevated transition-colors">
                      <td className="px-4 py-3.5 font-mono font-semibold text-teal-700 dark:text-teal-400 whitespace-nowrap">{order.id}</td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-slate-800 dark:text-brand-dark-heading">{order.patientName}</div>
                        <div className="text-slate-400 dark:text-brand-dark-muted text-[10px]">{order.patientId} · {order.patientAge}y {order.patientGender}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-slate-700 dark:text-brand-dark-text truncate max-w-[130px]">{order.orderingDoctor}</div>
                        <div className="text-slate-400 dark:text-brand-dark-muted text-[10px] truncate max-w-[130px]">{order.facility}</div>
                      </td>
                      <td className="px-4 py-3.5 max-w-[180px]">
                        <div className="text-slate-700 dark:text-brand-dark-text truncate">{order.tests.map(t => t.testName).join(', ')}</div>
                      </td>
                      <td className="px-4 py-3.5"><LabPriorityBadge priority={order.priority} size="sm" /></td>
                      <td className="px-4 py-3.5"><LabOrderStatusBadge status={order.status} size="sm" /></td>
                      <td className="px-4 py-3.5 text-slate-500 dark:text-brand-dark-muted whitespace-nowrap">{formatDistanceToNow(order.orderDateTime)}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-slate-700 dark:text-brand-dark-text bg-slate-100 dark:bg-brand-dark-elevated hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          >
                            <Eye className="w-3 h-3" /> View
                          </button>
                          {order.status === 'ordered' && (
                            <button
                              type="button"
                              onClick={() => handleAccept(order.id)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/30 hover:bg-teal-100 dark:hover:bg-teal-900/50 border border-teal-200 dark:border-teal-800/60 rounded-lg transition-colors"
                            >
                              <CheckCircle2 className="w-3 h-3" /> Accept
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="sm:hidden space-y-3">
            {filtered.map(order => (
              <div key={order.id} className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border shadow-xs p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <p className="font-mono text-sm font-bold text-teal-700 dark:text-teal-400">{order.id}</p>
                    <p className="font-semibold text-slate-800 dark:text-brand-dark-heading mt-0.5">{order.patientName}</p>
                    <p className="text-[11px] text-slate-500 dark:text-brand-dark-muted">{order.patientId} · {order.patientAge}y {order.patientGender}</p>
                  </div>
                  <LabPriorityBadge priority={order.priority} size="sm" />
                </div>
                <p className="text-xs text-slate-600 dark:text-brand-dark-text mb-1">{order.tests.map(t => t.testName).join(', ')}</p>
                <p className="text-[11px] text-slate-500 dark:text-brand-dark-muted mb-3">{order.orderingDoctor} · {formatDistanceToNow(order.orderDateTime)}</p>
                <div className="flex items-center justify-between">
                  <LabOrderStatusBadge status={order.status} size="sm" />
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(order)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline"
                  >
                    View Details <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Order Detail Drawer */}
      {selectedOrder && (
        <OrderDetailDrawer
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onAccept={handleAccept}
          onReject={handleRejectWithReason}
          onBeginCollection={handleBeginCollection}
        />
      )}
    </LabPortalLayout>
  );
};
