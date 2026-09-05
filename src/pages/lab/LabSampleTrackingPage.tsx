import React, { useState, useMemo } from 'react';
import {
  Search, TestTube, CheckCircle2, X, AlertTriangle,
  PlayCircle, ChevronDown, RefreshCw, Beaker,
} from 'lucide-react';
import { useLabPortal } from '../../context/LabPortalContext';
import { LabPortalLayout } from '../../components/layouts/LabPortalLayout';
import { SampleStatusBadge, LabPriorityBadge } from '../../components/lab/LabBadges';
import { SampleRecord, SampleStatus, SampleType, SampleRejectionReason } from '../../types/lab';
import { formatDistanceToNow } from '../../utils/labUtils';
import { useAuth } from '../../context/AuthContext';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

// ─── Sample Collection Form ───────────────────────────────────────────────────

interface CollectionFormData {
  sampleType: SampleType;
  container: string;
  barcode: string;
  fastingConfirmed: boolean;
  quantity: string;
  notes: string;
}

const CollectionForm: React.FC<{
  orderId: string;
  patientName: string;
  defaultSampleType: SampleType;
  onSubmit: (data: Omit<SampleRecord, 'id' | 'orderId' | 'patientName' | 'patientId' | 'tests' | 'priority'>) => void;
  onCancel: () => void;
}> = ({ orderId, patientName, defaultSampleType, onSubmit, onCancel }) => {
  const [form, setForm] = useState<CollectionFormData>({
    sampleType: defaultSampleType,
    container: '',
    barcode: `BAR-${Date.now()}`,
    fastingConfirmed: false,
    quantity: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Partial<CollectionFormData>>({});

  const CONTAINERS: Record<SampleType, string[]> = {
    blood: ['EDTA Tube (Purple Cap)', 'SST Tube (Gold Cap)', 'Heparin Tube (Green Cap)', 'Plain Tube (Red Cap)', 'Citrate Tube (Blue Cap)'],
    urine: ['Urine Container (Sterile)', 'Urine Cup (20mL)'],
    swab: ['Sterile Swab Tube', 'Transport Medium Tube'],
    sputum: ['Sterile Wide-Mouth Container'],
    stool: ['Stool Container (Screw Cap)'],
    other: ['Sterile Container'],
  };

  const validate = (): boolean => {
    const errs: Partial<CollectionFormData> = {};
    if (!form.container) errs.container = 'Select container type';
    if (!form.barcode.trim()) errs.barcode = 'Barcode is required';
    if (!form.quantity.trim()) errs.quantity = 'Quantity is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      sampleType: form.sampleType,
      container: form.container,
      barcode: form.barcode,
      status: 'collected',
      fastingConfirmed: form.fastingConfirmed,
      quantity: form.quantity,
      notes: form.notes || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-5">
      <div className="bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60 rounded-xl px-4 py-3 mb-4">
        <p className="text-xs font-semibold text-teal-800 dark:text-teal-300">Recording collection for: <strong>{patientName}</strong> · Order {orderId}</p>
      </div>

      {/* Sample Type */}
      <div>
        <label htmlFor="sample-type" className="block text-xs font-semibold text-slate-700 dark:text-brand-dark-heading mb-1">Sample Type</label>
        <select
          id="sample-type"
          value={form.sampleType}
          onChange={e => setForm(f => ({ ...f, sampleType: e.target.value as SampleType, container: '' }))}
          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-brand-dark-border bg-white dark:bg-brand-dark-surface text-slate-800 dark:text-brand-dark-heading focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="blood">Blood</option>
          <option value="urine">Urine</option>
          <option value="swab">Swab</option>
          <option value="sputum">Sputum</option>
          <option value="stool">Stool</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Container */}
      <div>
        <label htmlFor="container" className="block text-xs font-semibold text-slate-700 dark:text-brand-dark-heading mb-1">Sample Container *</label>
        <select
          id="container"
          value={form.container}
          onChange={e => setForm(f => ({ ...f, container: e.target.value }))}
          className={`w-full px-3 py-2 text-xs rounded-xl border bg-white dark:bg-brand-dark-surface text-slate-800 dark:text-brand-dark-heading focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.container ? 'border-rose-400' : 'border-slate-200 dark:border-brand-dark-border'}`}
        >
          <option value="">Select container...</option>
          {CONTAINERS[form.sampleType].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {errors.container && <p className="text-rose-500 text-[11px] mt-1">{errors.container}</p>}
      </div>

      {/* Barcode */}
      <div>
        <label htmlFor="barcode" className="block text-xs font-semibold text-slate-700 dark:text-brand-dark-heading mb-1">Sample Barcode / ID *</label>
        <input
          id="barcode"
          type="text"
          value={form.barcode}
          onChange={e => setForm(f => ({ ...f, barcode: e.target.value }))}
          className={`w-full px-3 py-2 text-xs font-mono rounded-xl border bg-white dark:bg-brand-dark-surface text-slate-800 dark:text-brand-dark-heading focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.barcode ? 'border-rose-400' : 'border-slate-200 dark:border-brand-dark-border'}`}
        />
        {errors.barcode && <p className="text-rose-500 text-[11px] mt-1">{errors.barcode}</p>}
      </div>

      {/* Quantity */}
      <div>
        <label htmlFor="quantity" className="block text-xs font-semibold text-slate-700 dark:text-brand-dark-heading mb-1">Sample Quantity *</label>
        <input
          id="quantity"
          type="text"
          placeholder="e.g., 3 mL, 10 mL"
          value={form.quantity}
          onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
          className={`w-full px-3 py-2 text-xs rounded-xl border bg-white dark:bg-brand-dark-surface text-slate-800 dark:text-brand-dark-heading placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.quantity ? 'border-rose-400' : 'border-slate-200 dark:border-brand-dark-border'}`}
        />
        {errors.quantity && <p className="text-rose-500 text-[11px] mt-1">{errors.quantity}</p>}
      </div>

      {/* Fasting */}
      <div className="flex items-center gap-2.5">
        <input
          id="fasting"
          type="checkbox"
          checked={form.fastingConfirmed}
          onChange={e => setForm(f => ({ ...f, fastingConfirmed: e.target.checked }))}
          className="w-4 h-4 rounded accent-teal-600"
        />
        <label htmlFor="fasting" className="text-xs font-medium text-slate-700 dark:text-brand-dark-heading">Fasting confirmed (if applicable)</label>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="col-notes" className="block text-xs font-semibold text-slate-700 dark:text-brand-dark-heading mb-1">Collection Notes (Optional)</label>
        <textarea
          id="col-notes"
          value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-brand-dark-border bg-white dark:bg-brand-dark-surface text-slate-800 dark:text-brand-dark-heading placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          rows={2}
          placeholder="Any notes about sample condition or patient..."
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl py-2.5 text-xs transition-colors">
          Record Collection
        </button>
        <button type="button" onClick={onCancel} className="flex-1 bg-slate-100 dark:bg-brand-dark-elevated text-slate-700 dark:text-brand-dark-text font-semibold rounded-xl py-2.5 text-xs transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
};

// ─── Reject Sample Form ───────────────────────────────────────────────────────

const REJECTION_REASONS: { value: SampleRejectionReason; label: string }[] = [
  { value: 'wrong_container', label: 'Wrong container used' },
  { value: 'insufficient_quantity', label: 'Insufficient quantity' },
  { value: 'damaged_or_leaking', label: 'Damaged or leaking' },
  { value: 'incorrect_labelling', label: 'Incorrect labelling' },
  { value: 'delayed_transport', label: 'Delayed transport' },
  { value: 'other', label: 'Other (specify below)' },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export const LabSampleTrackingPage: React.FC = () => {
  const {
    orders, samples, recordSampleCollection, markSampleReceived,
    startProcessing, rejectSample, requestRecollection,
  } = useLabPortal();
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<SampleStatus | 'all'>('all');
  const [collectingOrderId, setCollectingOrderId] = useState<string | null>(null);
  const [rejectingSampleId, setRejectingSampleId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<SampleRejectionReason>('wrong_container');
  const [rejectNote, setRejectNote] = useState('');
  const [rejectError, setRejectError] = useState('');
  const [processingConfirm, setProcessingConfirm] = useState<{ sampleId: string; orderId: string } | null>(null);

  const by = user?.name ?? 'Lab Technician';

  // Orders ready for sample collection (accepted or sample_pending)
  const pendingCollectionOrders = orders.filter(o => ['accepted', 'sample_pending'].includes(o.status));
  const collectingOrder = collectingOrderId ? orders.find(o => o.id === collectingOrderId) : null;

  const filteredSamples = useMemo(() => {
    let result = [...samples];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(s =>
        s.patientName.toLowerCase().includes(q) ||
        s.patientId.toLowerCase().includes(q) ||
        s.orderId.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') result = result.filter(s => s.status === statusFilter);
    return result;
  }, [samples, search, statusFilter]);

  const handleRejectSample = () => {
    if (!rejectingSampleId) return;
    if (rejectReason === 'other' && !rejectNote.trim()) { setRejectError('Please provide details.'); return; }
    const sample = samples.find(s => s.id === rejectingSampleId);
    if (!sample) return;
    rejectSample(sample.id, sample.orderId, rejectReason, rejectNote, by);
    setRejectingSampleId(null);
    setRejectReason('wrong_container');
    setRejectNote('');
    setRejectError('');
  };

  return (
    <LabPortalLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-brand-dark-heading tracking-tight">Sample Tracking</h2>
          <p className="text-xs text-slate-500 dark:text-brand-dark-muted mt-0.5">Collect, track and manage lab samples</p>
        </div>
      </div>

      {/* Pending Collections Alert */}
      {pendingCollectionOrders.length > 0 && !collectingOrderId && (
        <div className="mb-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300">
              {pendingCollectionOrders.length} Order{pendingCollectionOrders.length > 1 ? 's' : ''} Pending Sample Collection
            </h3>
          </div>
          <div className="space-y-2">
            {pendingCollectionOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between bg-white dark:bg-brand-dark-surface rounded-xl px-4 py-2.5 border border-amber-100 dark:border-amber-900/40">
                <div>
                  <span className="font-mono text-xs font-semibold text-amber-700 dark:text-amber-400">{order.id}</span>
                  <span className="mx-2 text-slate-400">·</span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-brand-dark-heading">{order.patientName}</span>
                  <span className="mx-2 text-slate-400">·</span>
                  <span className="text-xs text-slate-500 dark:text-brand-dark-muted">{order.tests.map(t => t.testName).join(', ')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <LabPriorityBadge priority={order.priority} size="sm" />
                  <button
                    type="button"
                    onClick={() => setCollectingOrderId(order.id)}
                    className="text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/30 hover:bg-teal-100 dark:hover:bg-teal-900/50 border border-teal-200 dark:border-teal-800/60 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Collect Sample
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Collection Form */}
      {collectingOrderId && collectingOrder && (
        <div className="mb-5 bg-white dark:bg-brand-dark-surface rounded-2xl border border-teal-200 dark:border-teal-800/60 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 bg-teal-50 dark:bg-teal-950/30 border-b border-teal-200 dark:border-teal-800/60 flex items-center gap-2">
            <Beaker className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <h3 className="text-sm font-bold text-teal-800 dark:text-teal-300">Record Sample Collection</h3>
          </div>
          <CollectionForm
            orderId={collectingOrderId}
            patientName={collectingOrder.patientName}
            defaultSampleType={collectingOrder.tests[0]?.sampleType ?? 'blood'}
            onSubmit={(data) => {
              recordSampleCollection(collectingOrderId, data, by);
              setCollectingOrderId(null);
            }}
            onCancel={() => setCollectingOrderId(null)}
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="search"
            placeholder="Search patient, order or sample ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-brand-dark-border bg-white dark:bg-brand-dark-surface text-slate-800 dark:text-brand-dark-heading placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="pl-3 pr-7 py-2 text-xs rounded-xl border border-slate-200 dark:border-brand-dark-border bg-white dark:bg-brand-dark-surface text-slate-800 dark:text-brand-dark-heading focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none cursor-pointer"
            aria-label="Filter by sample status"
          >
            <option value="all">All Sample Statuses</option>
            <option value="pending">Pending</option>
            <option value="collected">Collected</option>
            <option value="received">Received</option>
            <option value="processing">Processing</option>
            <option value="rejected">Rejected</option>
            <option value="recollection_required">Recollection Required</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Samples Table */}
      {filteredSamples.length === 0 ? (
        <EmptyState
          icon={TestTube}
          title="No samples found"
          description="No samples match your search or filter. New samples appear here after orders are accepted."
        />
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden sm:block bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-brand-dark-elevated border-b border-slate-200 dark:border-brand-dark-border">
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-brand-dark-muted">Sample ID</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-brand-dark-muted">Order ID</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-brand-dark-muted">Patient</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-brand-dark-muted">Tests</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-brand-dark-muted">Type</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-brand-dark-muted">Priority</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-brand-dark-muted">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-brand-dark-muted">Collected</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-brand-dark-muted">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-brand-dark-border">
                  {filteredSamples.map(sample => (
                    <tr key={sample.id} className="hover:bg-slate-50 dark:hover:bg-brand-dark-elevated transition-colors">
                      <td className="px-4 py-3.5 font-mono font-semibold text-cyan-700 dark:text-cyan-400 whitespace-nowrap">{sample.id}</td>
                      <td className="px-4 py-3.5 font-mono text-teal-600 dark:text-teal-400">{sample.orderId}</td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-slate-800 dark:text-brand-dark-heading">{sample.patientName}</div>
                        <div className="text-slate-400 dark:text-brand-dark-muted text-[10px]">{sample.patientId}</div>
                      </td>
                      <td className="px-4 py-3.5 max-w-[150px]">
                        <div className="text-slate-600 dark:text-brand-dark-text truncate">{sample.tests.join(', ')}</div>
                      </td>
                      <td className="px-4 py-3.5 capitalize text-slate-700 dark:text-brand-dark-text">{sample.sampleType}</td>
                      <td className="px-4 py-3.5"><LabPriorityBadge priority={sample.priority} size="sm" /></td>
                      <td className="px-4 py-3.5"><SampleStatusBadge status={sample.status} size="sm" /></td>
                      <td className="px-4 py-3.5 text-slate-500 dark:text-brand-dark-muted whitespace-nowrap">
                        {sample.collectionDateTime ? formatDistanceToNow(sample.collectionDateTime) : '—'}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1.5">
                          {sample.status === 'collected' && (
                            <button type="button" onClick={() => markSampleReceived(sample.id, by)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors">
                              <CheckCircle2 className="w-3 h-3" /> Received
                            </button>
                          )}
                          {sample.status === 'received' && (
                            <button type="button" onClick={() => setProcessingConfirm({ sampleId: sample.id, orderId: sample.orderId })}
                              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800/60 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-colors">
                              <PlayCircle className="w-3 h-3" /> Process
                            </button>
                          )}
                          {['collected', 'received'].includes(sample.status) && (
                            <>
                              <button type="button" onClick={() => setRejectingSampleId(sample.id)}
                                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors">
                                <X className="w-3 h-3" /> Reject
                              </button>
                              <button type="button" onClick={() => requestRecollection(sample.id, sample.orderId, by)}
                                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/60 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors">
                                <RefreshCw className="w-3 h-3" /> Recollect
                              </button>
                            </>
                          )}
                        </div>
                        {sample.rejectionReason && (
                          <div className="mt-1 text-[10px] text-rose-600 dark:text-rose-400 italic">
                            Rejected: {sample.rejectionNote ?? sample.rejectionReason}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="sm:hidden space-y-3">
            {filteredSamples.map(sample => (
              <div key={sample.id} className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border shadow-xs p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-mono text-xs font-bold text-cyan-700 dark:text-cyan-400">{sample.id}</p>
                    <p className="font-semibold text-sm text-slate-800 dark:text-brand-dark-heading mt-0.5">{sample.patientName}</p>
                    <p className="text-[11px] text-slate-500 dark:text-brand-dark-muted">{sample.patientId} · {sample.orderId}</p>
                  </div>
                  <SampleStatusBadge status={sample.status} size="sm" />
                </div>
                <p className="text-xs text-slate-600 dark:text-brand-dark-text mb-1">{sample.tests.join(', ')}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <LabPriorityBadge priority={sample.priority} size="sm" />
                  <span className="text-xs text-slate-500 dark:text-brand-dark-muted capitalize">{sample.sampleType}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {sample.status === 'collected' && (
                    <button type="button" onClick={() => markSampleReceived(sample.id, by)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60 rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Mark Received
                    </button>
                  )}
                  {sample.status === 'received' && (
                    <button type="button" onClick={() => setProcessingConfirm({ sampleId: sample.id, orderId: sample.orderId })}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800/60 rounded-lg">
                      <PlayCircle className="w-3.5 h-3.5" /> Start Processing
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Reject Sample Modal */}
      {rejectingSampleId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border shadow-2xl w-full max-w-md p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-brand-dark-heading mb-4">Reject Sample</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-brand-dark-heading mb-1">Rejection Reason *</label>
                <select
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value as SampleRejectionReason)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-brand-dark-border bg-white dark:bg-brand-dark-surface text-slate-800 dark:text-brand-dark-heading focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  {REJECTION_REASONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-brand-dark-heading mb-1">
                  Additional Notes {rejectReason === 'other' && '*'}
                </label>
                <textarea
                  value={rejectNote}
                  onChange={e => { setRejectNote(e.target.value); setRejectError(''); }}
                  className={`w-full px-3 py-2 text-xs rounded-xl border bg-white dark:bg-brand-dark-surface text-slate-800 dark:text-brand-dark-heading focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none ${rejectError ? 'border-rose-400' : 'border-slate-200 dark:border-brand-dark-border'}`}
                  rows={2}
                  placeholder="Details about the rejection..."
                />
                {rejectError && <p className="text-rose-500 text-[11px] mt-1">{rejectError}</p>}
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button type="button" onClick={handleRejectSample} className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl py-2.5 text-sm transition-colors">
                Confirm Rejection
              </button>
              <button type="button" onClick={() => { setRejectingSampleId(null); setRejectNote(''); setRejectError(''); }}
                className="flex-1 bg-slate-100 dark:bg-brand-dark-elevated text-slate-700 dark:text-brand-dark-text font-semibold rounded-xl py-2.5 text-sm transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Processing Confirm */}
      <ConfirmDialog
        isOpen={!!processingConfirm}
        title="Start Processing"
        message={`Start processing the sample? This will update the order status to 'Processing' and allow result entry.`}
        confirmLabel="Start Processing"
        type="info"
        onConfirm={() => {
          if (processingConfirm) {
            startProcessing(processingConfirm.sampleId, processingConfirm.orderId, by);
            setProcessingConfirm(null);
          }
        }}
        onCancel={() => setProcessingConfirm(null)}
      />
    </LabPortalLayout>
  );
};
