import React, { useState, useMemo } from 'react';
import {
  FlaskConical, CheckCircle2, Save, Send,
  AlertTriangle, Plus, Trash2, Clock,
  ArrowLeft, FileCheck2, RotateCcw,
} from 'lucide-react';
import { useLabPortal } from '../../context/LabPortalContext';
import { LabPortalLayout } from '../../components/layouts/LabPortalLayout';
import { LabOrderStatusBadge, LabPriorityBadge, ResultFlagBadge } from '../../components/lab/LabBadges';
import { LabOrder, ResultParameter, ResultFlag } from '../../types/lab';
import { formatDateTime } from '../../utils/labUtils';
import { useAuth } from '../../context/AuthContext';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

// ─── Result Parameter Row ─────────────────────────────────────────────────────

const ParameterRow: React.FC<{
  param: ResultParameter;
  onChange: (updated: ResultParameter) => void;
  onRemove: () => void;
  locked: boolean;
}> = ({ param, onChange, onRemove, locked }) => {
  const update = (field: Partial<ResultParameter>) => onChange({ ...param, ...field });

  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-brand-dark-elevated transition-colors">
      <td className="px-3 py-2">
        <input
          type="text"
          value={param.parameterName}
          onChange={e => update({ parameterName: e.target.value })}
          disabled={locked}
          placeholder="Parameter name"
          className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-brand-dark-border bg-white dark:bg-brand-dark-surface text-slate-800 dark:text-brand-dark-heading placeholder:text-slate-400 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-teal-500"
          aria-label="Parameter name"
        />
      </td>
      <td className="px-3 py-2">
        <input
          type="text"
          value={param.value}
          onChange={e => update({ value: e.target.value })}
          disabled={locked}
          placeholder="Result"
          className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-brand-dark-border bg-white dark:bg-brand-dark-surface text-slate-800 dark:text-brand-dark-heading placeholder:text-slate-400 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-teal-500"
          aria-label="Result value"
        />
      </td>
      <td className="px-3 py-2">
        <input
          type="text"
          value={param.unit}
          onChange={e => update({ unit: e.target.value })}
          disabled={locked}
          placeholder="Unit"
          className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-brand-dark-border bg-white dark:bg-brand-dark-surface text-slate-800 dark:text-brand-dark-heading placeholder:text-slate-400 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-teal-500"
          aria-label="Unit"
        />
      </td>
      <td className="px-3 py-2">
        <div className="flex gap-1">
          <input
            type="text"
            value={param.referenceMin ?? ''}
            onChange={e => update({ referenceMin: e.target.value })}
            disabled={locked}
            placeholder="Min"
            className="w-16 px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-brand-dark-border bg-white dark:bg-brand-dark-surface text-slate-800 dark:text-brand-dark-heading placeholder:text-slate-400 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-teal-500"
            aria-label="Reference min"
          />
          <span className="text-slate-400 self-center text-xs">–</span>
          <input
            type="text"
            value={param.referenceMax ?? ''}
            onChange={e => update({ referenceMax: e.target.value })}
            disabled={locked}
            placeholder="Max"
            className="w-16 px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-brand-dark-border bg-white dark:bg-brand-dark-surface text-slate-800 dark:text-brand-dark-heading placeholder:text-slate-400 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-teal-500"
            aria-label="Reference max"
          />
        </div>
      </td>
      <td className="px-3 py-2">
        <select
          value={param.flag}
          onChange={e => update({ flag: e.target.value as ResultFlag })}
          disabled={locked}
          className="px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-brand-dark-border bg-white dark:bg-brand-dark-surface text-slate-800 dark:text-brand-dark-heading disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-teal-500"
          aria-label="Result flag"
        >
          <option value="normal">Normal</option>
          <option value="low">Low</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </td>
      <td className="px-3 py-2 text-center">
        {!locked && (
          <button type="button" onClick={onRemove} aria-label="Remove parameter" className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </td>
    </tr>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export const LabResultEntryPage: React.FC = () => {
  const {
    orders, testResults,
    saveResultDraft, submitResultForVerification, updateTestResult,
    verifyAndReleaseReport, returnForCorrection, addToast,
  } = useLabPortal();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'entry' | 'verification'>('entry');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [editingParams, setEditingParams] = useState<ResultParameter[]>([]);
  const [editingResultId, setEditingResultId] = useState<string | null>(null);
  const [submitConfirm, setSubmitConfirm] = useState(false);
  const [criticalConfirm, setCriticalConfirm] = useState(false);
  const [verifyConfirm, setVerifyConfirm] = useState<string | null>(null);
  const [verifyNote, setVerifyNote] = useState('');
  const [returnNote, setReturnNote] = useState('');
  const [returnDialog, setReturnDialog] = useState<{ resultId: string; orderId: string } | null>(null);
  const [returnError, setReturnError] = useState('');

  const by = user?.name ?? 'Lab Technician';

  // Orders that can have results entered (processing) or are awaiting verification
  const entryOrders = useMemo(() => orders.filter(o => o.status === 'processing'), [orders]);
  const verificationOrders = useMemo(() => orders.filter(o => o.status === 'awaiting_verification'), [orders]);

  const selectedOrder = selectedOrderId ? orders.find(o => o.id === selectedOrderId) : null;

  const startEditing = (order: LabOrder) => {
    setSelectedOrderId(order.id);
    const existing = testResults.find(r => r.orderId === order.id && r.status === 'draft');
    if (existing) {
      setEditingParams([...existing.parameters]);
      setEditingResultId(existing.id);
    } else {
      // Pre-populate with empty parameter rows based on test
      setEditingParams([
        { id: `p-${Date.now()}`, parameterName: '', value: '', unit: '', flag: 'normal' },
      ]);
      setEditingResultId(null);
    }
  };

  const addParameter = () => {
    setEditingParams(prev => [
      ...prev,
      { id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`, parameterName: '', value: '', unit: '', flag: 'normal' },
    ]);
  };

  const removeParameter = (id: string) => {
    setEditingParams(prev => prev.filter(p => p.id !== id));
  };

  const updateParameter = (id: string, updated: ResultParameter) => {
    setEditingParams(prev => prev.map(p => p.id === id ? updated : p));
  };

  const validateParams = (): string[] => {
    const errors: string[] = [];
    if (editingParams.length === 0) errors.push('At least one parameter is required.');
    editingParams.forEach((p, i) => {
      if (!p.parameterName.trim()) errors.push(`Row ${i + 1}: Parameter name is required.`);
      if (!p.value.trim()) errors.push(`Row ${i + 1}: Result value is required.`);
    });
    return errors;
  };

  const hasCriticalValues = editingParams.some(p => p.flag === 'critical');

  const handleSaveDraft = () => {
    if (!selectedOrder) return;
    const errors = validateParams();
    if (errors.length > 0) {
      addToast({ type: 'error', title: 'Validation Error', message: errors[0] });
      return;
    }
    if (editingResultId) {
      updateTestResult(editingResultId, editingParams);
      addToast({ type: 'info', title: 'Draft Updated', message: 'Changes saved.' });
    } else {
      const id = saveResultDraft({
        testId: selectedOrder.tests[0]?.id ?? '',
        testName: selectedOrder.tests.map(t => t.testName).join(', '),
        orderId: selectedOrder.id,
        parameters: editingParams,
        technicianId: user?.id ?? 'TECH-001',
        technicianName: by,
        enteredAt: new Date().toISOString(),
        hasCritical: hasCriticalValues,
      });
      setEditingResultId(id);
    }
  };

  const handleSubmitForVerification = () => {
    if (!selectedOrder) return;
    const errors = validateParams();
    if (errors.length > 0) {
      addToast({ type: 'error', title: 'Validation Error', message: errors[0] });
      return;
    }
    if (hasCriticalValues && !criticalConfirm) {
      setCriticalConfirm(true);
      return;
    }
    // Save first if needed
    let resultId = editingResultId;
    if (!resultId) {
      resultId = saveResultDraft({
        testId: selectedOrder.tests[0]?.id ?? '',
        testName: selectedOrder.tests.map(t => t.testName).join(', '),
        orderId: selectedOrder.id,
        parameters: editingParams,
        technicianId: user?.id ?? 'TECH-001',
        technicianName: by,
        enteredAt: new Date().toISOString(),
        hasCritical: hasCriticalValues,
      });
    } else {
      updateTestResult(resultId, editingParams);
    }
    submitResultForVerification(resultId, selectedOrder.id, by);
    setSelectedOrderId(null);
    setEditingParams([]);
    setEditingResultId(null);
    setCriticalConfirm(false);
  };

  const handleVerifyRelease = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const resultIds = order.testResultIds ?? [];
    verifyAndReleaseReport(orderId, resultIds, 'Dr. Meera Joshi (Pathologist)', 'PATH-001', verifyNote);
    setVerifyConfirm(null);
    setVerifyNote('');
  };

  const handleReturnForCorrection = () => {
    if (!returnDialog) return;
    if (!returnNote.trim()) { setReturnError('A correction note is required.'); return; }
    returnForCorrection(returnDialog.resultId, returnDialog.orderId, returnNote, 'Dr. Meera Joshi (Pathologist)');
    setReturnDialog(null);
    setReturnNote('');
    setReturnError('');
  };

  return (
    <LabPortalLayout>
      {/* Page Header */}
      <div className="mb-5">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-brand-dark-heading tracking-tight">Result Entry & Verification</h2>
        <p className="text-xs text-slate-500 dark:text-brand-dark-muted mt-0.5">Enter test results and verify reports for release</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-brand-dark-border mb-5 overflow-x-auto">
        <button
          type="button"
          onClick={() => { setActiveTab('entry'); setSelectedOrderId(null); }}
          className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'entry'
              ? 'border-teal-600 text-teal-700 dark:text-teal-400 dark:border-teal-400'
              : 'border-transparent text-slate-500 dark:text-brand-dark-muted hover:text-slate-700 dark:hover:text-brand-dark-heading'
          }`}
        >
          <FlaskConical className="w-4 h-4 inline mr-1.5" />
          Result Entry
          {entryOrders.length > 0 && (
            <span className="ml-2 text-[10px] bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 px-1.5 py-0.5 rounded font-bold">{entryOrders.length}</span>
          )}
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('verification'); setSelectedOrderId(null); }}
          className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'verification'
              ? 'border-orange-600 text-orange-700 dark:text-orange-400 dark:border-orange-400'
              : 'border-transparent text-slate-500 dark:text-brand-dark-muted hover:text-slate-700 dark:hover:text-brand-dark-heading'
          }`}
        >
          <FileCheck2 className="w-4 h-4 inline mr-1.5" />
          Awaiting Verification
          {verificationOrders.length > 0 && (
            <span className="ml-2 text-[10px] bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 px-1.5 py-0.5 rounded font-bold">{verificationOrders.length}</span>
          )}
        </button>
      </div>

      {/* ──── RESULT ENTRY TAB ──── */}
      {activeTab === 'entry' && (
        <>
          {selectedOrder && selectedOrder.status === 'processing' ? (
            /* Result Entry Form */
            <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border shadow-xs overflow-hidden">
              {/* Order Info Header */}
              <div className="px-5 py-4 border-b border-slate-200 dark:border-brand-dark-border bg-slate-50 dark:bg-brand-dark-elevated">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <button type="button" onClick={() => setSelectedOrderId(null)} className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-semibold flex items-center gap-1 mb-2">
                      <ArrowLeft className="w-3 h-3" /> Back to list
                    </button>
                    <h3 className="text-base font-bold text-slate-900 dark:text-brand-dark-heading">
                      {selectedOrder.patientName} — <span className="font-mono text-teal-600 dark:text-teal-400">{selectedOrder.id}</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-brand-dark-muted mt-0.5">
                      {selectedOrder.patientId} · {selectedOrder.patientAge}y {selectedOrder.patientGender} · {selectedOrder.tests.map(t => t.testName).join(', ')}
                    </p>
                  </div>
                  <LabPriorityBadge priority={selectedOrder.priority} />
                </div>
              </div>

              {/* Parameters Table */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-brand-dark-heading">Test Parameters</h4>
                  <button type="button" onClick={addParameter} className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/30 hover:bg-teal-100 dark:hover:bg-teal-900/50 border border-teal-200 dark:border-teal-800/60 px-2.5 py-1.5 rounded-lg transition-colors">
                    <Plus className="w-3 h-3" /> Add Parameter
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-brand-dark-border">
                        <th className="text-left px-3 py-2 font-semibold text-slate-600 dark:text-brand-dark-muted min-w-[140px]">Parameter</th>
                        <th className="text-left px-3 py-2 font-semibold text-slate-600 dark:text-brand-dark-muted min-w-[100px]">Value</th>
                        <th className="text-left px-3 py-2 font-semibold text-slate-600 dark:text-brand-dark-muted min-w-[70px]">Unit</th>
                        <th className="text-left px-3 py-2 font-semibold text-slate-600 dark:text-brand-dark-muted min-w-[160px]">Reference Range</th>
                        <th className="text-left px-3 py-2 font-semibold text-slate-600 dark:text-brand-dark-muted min-w-[90px]">Flag</th>
                        <th className="text-center px-3 py-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-brand-dark-border">
                      {editingParams.map(param => (
                        <ParameterRow
                          key={param.id}
                          param={param}
                          onChange={(updated) => updateParameter(param.id, updated)}
                          onRemove={() => removeParameter(param.id)}
                          locked={false}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>

                {editingParams.length === 0 && (
                  <div className="py-6 text-center text-slate-400 dark:text-brand-dark-muted text-xs">
                    No parameters added. Click "Add Parameter" to begin.
                  </div>
                )}

                {/* Critical Warning */}
                {hasCriticalValues && (
                  <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 rounded-xl flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-rose-800 dark:text-rose-300">Critical Values Detected</p>
                      <p className="text-[11px] text-rose-700 dark:text-rose-400 mt-0.5">
                        One or more parameters are flagged as CRITICAL. Submitting for verification will trigger an urgent doctor notification.
                      </p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 mt-5 pt-4 border-t border-slate-200 dark:border-brand-dark-border">
                  <button type="button" onClick={handleSaveDraft} className="inline-flex items-center justify-center gap-2 bg-slate-100 dark:bg-brand-dark-elevated hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-brand-dark-heading font-semibold rounded-xl px-5 py-2.5 text-sm transition-colors">
                    <Save className="w-4 h-4" /> Save Draft
                  </button>
                  <button type="button" onClick={() => setSubmitConfirm(true)} className="inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl px-5 py-2.5 text-sm transition-colors">
                    <Send className="w-4 h-4" /> Submit for Verification
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Orders List */
            <>
              {entryOrders.length === 0 ? (
                <EmptyState
                  icon={FlaskConical}
                  title="No orders ready for result entry"
                  description="Orders appear here when their samples have been collected and processing has started."
                />
              ) : (
                <div className="space-y-3">
                  {entryOrders.map(order => {
                    const existing = testResults.find(r => r.orderId === order.id && r.status === 'draft');
                    return (
                      <div key={order.id} className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border shadow-xs p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-sm font-bold text-teal-700 dark:text-teal-400">{order.id}</span>
                              <LabPriorityBadge priority={order.priority} size="sm" />
                              <LabOrderStatusBadge status={order.status} size="sm" />
                              {existing && (
                                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 px-1.5 py-0.5 rounded">
                                  DRAFT SAVED
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-brand-dark-heading mt-1">{order.patientName}</p>
                            <p className="text-xs text-slate-500 dark:text-brand-dark-muted">{order.patientId} · {order.tests.map(t => t.testName).join(', ')}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => startEditing(order)}
                            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl px-4 py-2.5 text-xs transition-colors flex-shrink-0"
                          >
                            <FlaskConical className="w-3.5 h-3.5" />
                            {existing ? 'Continue Editing' : 'Enter Results'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ──── VERIFICATION TAB ──── */}
      {activeTab === 'verification' && (
        <>
          {verificationOrders.length === 0 ? (
            <EmptyState
              icon={FileCheck2}
              title="No results awaiting verification"
              description="Results submitted by technicians will appear here for pathologist review."
            />
          ) : (
            <div className="space-y-4">
              {verificationOrders.map(order => {
                const results = testResults.filter(r => (order.testResultIds ?? []).includes(r.id));
                return (
                  <div key={order.id} className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border shadow-xs overflow-hidden">
                    {/* Header */}
                    <div className="px-5 py-4 bg-orange-50 dark:bg-orange-950/20 border-b border-orange-200 dark:border-orange-800/60">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-sm font-bold text-teal-700 dark:text-teal-400">{order.id}</span>
                            <LabPriorityBadge priority={order.priority} size="sm" />
                            {results.some(r => r.hasCritical) && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 px-2 py-0.5 rounded">
                                <AlertTriangle className="w-3 h-3" /> CRITICAL VALUES
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-brand-dark-heading mt-1">{order.patientName}</p>
                          <p className="text-xs text-slate-500 dark:text-brand-dark-muted">
                            {order.patientId} · {order.patientAge}y {order.patientGender} · {order.orderingDoctor}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Results */}
                    {results.map(result => (
                      <div key={result.id} className="px-5 py-4 border-b border-slate-100 dark:border-brand-dark-border last:border-b-0">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-bold text-slate-800 dark:text-brand-dark-heading">
                            {result.testName}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-brand-dark-muted">
                            <Clock className="w-3 h-3 inline mr-1" />
                            Entered: {formatDateTime(result.enteredAt)} by {result.technicianName}
                          </p>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-xs mb-3">
                            <thead>
                              <tr className="border-b border-slate-200 dark:border-brand-dark-border">
                                <th className="text-left px-3 py-2 font-semibold text-slate-600 dark:text-brand-dark-muted">Parameter</th>
                                <th className="text-left px-3 py-2 font-semibold text-slate-600 dark:text-brand-dark-muted">Value</th>
                                <th className="text-left px-3 py-2 font-semibold text-slate-600 dark:text-brand-dark-muted">Unit</th>
                                <th className="text-left px-3 py-2 font-semibold text-slate-600 dark:text-brand-dark-muted">Reference</th>
                                <th className="text-left px-3 py-2 font-semibold text-slate-600 dark:text-brand-dark-muted">Flag</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-brand-dark-border">
                              {result.parameters.map(p => (
                                <tr key={p.id} className={p.flag === 'critical' ? 'bg-rose-50/50 dark:bg-rose-950/10' : ''}>
                                  <td className="px-3 py-2 font-medium text-slate-800 dark:text-brand-dark-heading">{p.parameterName}</td>
                                  <td className="px-3 py-2 font-semibold text-slate-900 dark:text-brand-dark-heading">{p.value}</td>
                                  <td className="px-3 py-2 text-slate-600 dark:text-brand-dark-text">{p.unit}</td>
                                  <td className="px-3 py-2 text-slate-500 dark:text-brand-dark-muted">
                                    {p.referenceText ?? (p.referenceMin && p.referenceMax ? `${p.referenceMin}–${p.referenceMax}` : '—')}
                                  </td>
                                  <td className="px-3 py-2"><ResultFlagBadge flag={p.flag} size="sm" /></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}

                    {/* Verification Actions */}
                    <div className="px-5 py-4 bg-slate-50 dark:bg-brand-dark-elevated flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        onClick={() => setVerifyConfirm(order.id)}
                        className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl px-4 py-2.5 text-xs transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verify & Release
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const rIds = order.testResultIds ?? [];
                          if (rIds.length > 0) setReturnDialog({ resultId: rIds[0], orderId: order.id });
                        }}
                        className="inline-flex items-center justify-center gap-2 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 font-semibold rounded-xl px-4 py-2.5 text-xs transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Return for Correction
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Submit Confirmation */}
      <ConfirmDialog
        isOpen={submitConfirm}
        title="Submit for Verification"
        message="This will lock the result fields and send results to the pathologist for verification. You won't be able to edit after submission."
        confirmLabel="Submit"
        type="info"
        onConfirm={() => { setSubmitConfirm(false); handleSubmitForVerification(); }}
        onCancel={() => setSubmitConfirm(false)}
      />

      {/* Critical Confirmation */}
      <ConfirmDialog
        isOpen={criticalConfirm}
        title="Critical Values Confirmation"
        message="This result contains CRITICAL values. Submitting will trigger an urgent notification to the ordering doctor. Please confirm the critical values are accurate."
        confirmLabel="Confirm Critical & Submit"
        type="danger"
        onConfirm={() => handleSubmitForVerification()}
        onCancel={() => setCriticalConfirm(false)}
      />

      {/* Verify & Release Confirmation */}
      {verifyConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border shadow-2xl w-full max-w-md p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-brand-dark-heading mb-2">Verify & Release Report</h3>
            <p className="text-xs text-slate-600 dark:text-brand-dark-text mb-4">
              The report will be released to the ordering doctor. This action cannot be undone. Any future correction will create an amended version.
            </p>
            <label htmlFor="verify-note" className="block text-xs font-semibold text-slate-700 dark:text-brand-dark-heading mb-1">
              Verification Note (Optional)
            </label>
            <textarea
              id="verify-note"
              value={verifyNote}
              onChange={e => setVerifyNote(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-brand-dark-border bg-white dark:bg-brand-dark-surface text-slate-800 dark:text-brand-dark-heading focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              rows={2}
              placeholder="Add note if needed..."
            />
            <div className="flex gap-3 mt-4">
              <button type="button" onClick={() => handleVerifyRelease(verifyConfirm)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl py-2.5 text-sm transition-colors">
                Verify & Release
              </button>
              <button type="button" onClick={() => { setVerifyConfirm(null); setVerifyNote(''); }} className="flex-1 bg-slate-100 dark:bg-brand-dark-elevated text-slate-700 dark:text-brand-dark-text font-semibold rounded-xl py-2.5 text-sm transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return for Correction */}
      {returnDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border shadow-2xl w-full max-w-md p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-brand-dark-heading mb-2">Return for Correction</h3>
            <p className="text-xs text-slate-600 dark:text-brand-dark-text mb-4">
              The results will be returned to the technician for correction. A note is required.
            </p>
            <label htmlFor="return-note" className="block text-xs font-semibold text-slate-700 dark:text-brand-dark-heading mb-1">Correction Note *</label>
            <textarea
              id="return-note"
              value={returnNote}
              onChange={e => { setReturnNote(e.target.value); setReturnError(''); }}
              className={`w-full px-3 py-2 text-xs rounded-xl border bg-white dark:bg-brand-dark-surface text-slate-800 dark:text-brand-dark-heading focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none ${returnError ? 'border-rose-400' : 'border-slate-200 dark:border-brand-dark-border'}`}
              rows={3}
              placeholder="What needs to be corrected..."
            />
            {returnError && <p className="text-rose-500 text-[11px] mt-1">{returnError}</p>}
            <div className="flex gap-3 mt-4">
              <button type="button" onClick={handleReturnForCorrection} className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl py-2.5 text-sm transition-colors">
                Return for Correction
              </button>
              <button type="button" onClick={() => { setReturnDialog(null); setReturnNote(''); setReturnError(''); }} className="flex-1 bg-slate-100 dark:bg-brand-dark-elevated text-slate-700 dark:text-brand-dark-text font-semibold rounded-xl py-2.5 text-sm transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </LabPortalLayout>
  );
};
