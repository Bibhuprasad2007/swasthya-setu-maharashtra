/**
 * Laboratory Portal Context & State Management
 * SwasthyaSetu Maharashtra - Integrated Rural Healthcare Network
 */

import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import {
  LabOrder,
  SampleRecord,
  TestResult,
  VerifiedReport,
  LabActivityItem,
  LabToastMessage,
  LabDoctorNotification,
  ResultParameter,
  canTransition,
  LabOrderTimelineEntry,
} from '../types/lab';

// ─── State ────────────────────────────────────────────────────────────────────

interface LabPortalState {
  orders: LabOrder[];
  samples: SampleRecord[];
  testResults: TestResult[];
  verifiedReports: VerifiedReport[];
  activity: LabActivityItem[];
  notifications: LabDoctorNotification[];
  toasts: LabToastMessage[];
}

const initialState: LabPortalState = {
  orders: [],
  samples: [],
  testResults: [],
  verifiedReports: [],
  activity: [],
  notifications: [],
  toasts: [],
};

// ─── Actions ──────────────────────────────────────────────────────────────────

type LabAction =
  | { type: 'ADD_TOAST'; payload: LabToastMessage }
  | { type: 'REMOVE_TOAST'; payload: string }
  | { type: 'UPDATE_ORDER'; payload: Partial<LabOrder> & { id: string } }
  | { type: 'ADD_ORDER_TIMELINE'; payload: { orderId: string; entry: LabOrderTimelineEntry } }
  | { type: 'UPDATE_SAMPLE'; payload: Partial<SampleRecord> & { id: string } }
  | { type: 'ADD_SAMPLE'; payload: SampleRecord }
  | { type: 'ADD_TEST_RESULT'; payload: TestResult }
  | { type: 'UPDATE_TEST_RESULT'; payload: Partial<TestResult> & { id: string } }
  | { type: 'ADD_VERIFIED_REPORT'; payload: VerifiedReport }
  | { type: 'UPDATE_VERIFIED_REPORT'; payload: Partial<VerifiedReport> & { id: string } }
  | { type: 'ADD_ACTIVITY'; payload: LabActivityItem }
  | { type: 'ADD_NOTIFICATION'; payload: LabDoctorNotification }
  | { type: 'ACK_NOTIFICATION'; payload: { id: string; by: string } };

function labReducer(state: LabPortalState, action: LabAction): LabPortalState {
  switch (action.type) {
    case 'ADD_TOAST':
      return { ...state, toasts: [action.payload, ...state.toasts].slice(0, 5) };
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) };

    case 'UPDATE_ORDER':
      return {
        ...state,
        orders: state.orders.map(o =>
          o.id === action.payload.id ? { ...o, ...action.payload } : o
        ),
      };
    case 'ADD_ORDER_TIMELINE':
      return {
        ...state,
        orders: state.orders.map(o =>
          o.id === action.payload.orderId
            ? { ...o, timeline: [...o.timeline, action.payload.entry] }
            : o
        ),
      };

    case 'ADD_SAMPLE':
      return { ...state, samples: [...state.samples, action.payload] };
    case 'UPDATE_SAMPLE':
      return {
        ...state,
        samples: state.samples.map(s =>
          s.id === action.payload.id ? { ...s, ...action.payload } : s
        ),
      };

    case 'ADD_TEST_RESULT':
      return { ...state, testResults: [...state.testResults, action.payload] };
    case 'UPDATE_TEST_RESULT':
      return {
        ...state,
        testResults: state.testResults.map(r =>
          r.id === action.payload.id ? { ...r, ...action.payload } : r
        ),
      };

    case 'ADD_VERIFIED_REPORT':
      return { ...state, verifiedReports: [...state.verifiedReports, action.payload] };
    case 'UPDATE_VERIFIED_REPORT':
      return {
        ...state,
        verifiedReports: state.verifiedReports.map(r =>
          r.id === action.payload.id ? { ...r, ...action.payload } : r
        ),
      };

    case 'ADD_ACTIVITY':
      return { ...state, activity: [action.payload, ...state.activity].slice(0, 50) };

    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications] };
    case 'ACK_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload.id
            ? { ...n, acknowledged: true, acknowledgedAt: new Date().toISOString(), criticalAcknowledgedBy: action.payload.by }
            : n
        ),
      };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface LabPortalContextType {
  // State
  orders: LabOrder[];
  samples: SampleRecord[];
  testResults: TestResult[];
  verifiedReports: VerifiedReport[];
  activity: LabActivityItem[];
  notifications: LabDoctorNotification[];
  toasts: LabToastMessage[];

  // Dashboard stats (derived)
  dashboardStats: {
    newOrders: number;
    pendingSamples: number;
    processing: number;
    awaitingVerification: number;
    reportsReady: number;
    criticalResults: number;
  };

  // Toasts
  addToast: (toast: Omit<LabToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;

  // Order actions
  acceptOrder: (orderId: string, by: string) => void;
  rejectOrder: (orderId: string, reason: string, by: string) => void;
  beginSampleCollection: (orderId: string) => void;

  // Sample actions
  recordSampleCollection: (
    orderId: string,
    sampleData: Omit<SampleRecord, 'id' | 'orderId' | 'patientName' | 'patientId' | 'tests' | 'priority'>,
    by: string
  ) => void;
  markSampleReceived: (sampleId: string, by: string) => void;
  startProcessing: (sampleId: string, orderId: string, by: string) => void;
  rejectSample: (sampleId: string, orderId: string, reason: string, note: string, by: string) => void;
  requestRecollection: (sampleId: string, orderId: string, by: string) => void;

  // Result entry actions
  saveResultDraft: (result: Omit<TestResult, 'id' | 'status'>) => string;
  submitResultForVerification: (resultId: string, orderId: string, by: string) => void;
  updateTestResult: (resultId: string, params: ResultParameter[]) => void;

  // Verification actions
  verifyAndReleaseReport: (
    orderId: string,
    resultIds: string[],
    verifiedBy: string,
    verifiedById: string,
    note: string
  ) => string;
  returnForCorrection: (resultId: string, orderId: string, note: string, by: string) => void;

  // Report actions
  markDoctorReviewed: (reportId: string, by: string) => void;
  acknowledgeCritical: (reportId: string, notificationId: string, by: string) => void;
}

const LabPortalContext = createContext<LabPortalContextType | undefined>(undefined);

// ─── Helpers ──────────────────────────────────────────────────────────────────

let toastCounter = 100;
let sampleCounter = 10;
let resultCounter = 10;
let reportCounter = 10;
let activityCounter = 10;
let notifCounter = 10;
let tlCounter = 100;

function makeId(prefix: string, counter: number) {
  return `${prefix}-${counter}`;
}

function now() {
  return new Date().toISOString();
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export const LabPortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(labReducer, initialState);

  const addToast = useCallback((toast: Omit<LabToastMessage, 'id'>) => {
    const id = `toast-${++toastCounter}`;
    dispatch({ type: 'ADD_TOAST', payload: { ...toast, id } });
    setTimeout(() => dispatch({ type: 'REMOVE_TOAST', payload: id }), 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_TOAST', payload: id });
  }, []);

  const addActivity = useCallback((item: Omit<LabActivityItem, 'id'>) => {
    dispatch({
      type: 'ADD_ACTIVITY',
      payload: { ...item, id: makeId('act', ++activityCounter) },
    });
  }, []);

  const addTimeline = useCallback((orderId: string, action: string, by: string, role: string, note?: string) => {
    dispatch({
      type: 'ADD_ORDER_TIMELINE',
      payload: {
        orderId,
        entry: { id: makeId('tl', ++tlCounter), timestamp: now(), action, performedBy: by, role, note },
      },
    });
  }, []);

  // ── Order Actions ──

  const acceptOrder = useCallback((orderId: string, by: string) => {
    const order = state.orders.find(o => o.id === orderId);
    if (!order || !canTransition(order.status, 'accepted')) return;
    dispatch({ type: 'UPDATE_ORDER', payload: { id: orderId, status: 'accepted', acceptedAt: now() } });
    addTimeline(orderId, 'Order Accepted', by, 'Lab Technician', 'Order verified and accepted. Sample collection pending.');
    addActivity({ type: 'order_accepted', orderId, patientName: order.patientName, performedBy: by, timestamp: now() });
    addToast({ type: 'success', title: 'Order Accepted', message: `${order.patientName}'s order has been accepted.` });
  }, [state.orders, addTimeline, addActivity, addToast]);

  const rejectOrder = useCallback((orderId: string, reason: string, by: string) => {
    const order = state.orders.find(o => o.id === orderId);
    if (!order || !canTransition(order.status, 'rejected')) return;
    dispatch({ type: 'UPDATE_ORDER', payload: { id: orderId, status: 'rejected', rejectedAt: now(), rejectionReason: reason } });
    addTimeline(orderId, 'Order Rejected', by, 'Lab Technician', reason);
    addActivity({ type: 'order_rejected', orderId, patientName: order.patientName, performedBy: by, timestamp: now(), note: reason });
    addToast({ type: 'warning', title: 'Order Rejected', message: `${order.patientName}'s order has been rejected. Reason recorded.` });
  }, [state.orders, addTimeline, addActivity, addToast]);

  const beginSampleCollection = useCallback((orderId: string) => {
    const order = state.orders.find(o => o.id === orderId);
    if (!order || !canTransition(order.status, 'sample_pending')) return;
    dispatch({ type: 'UPDATE_ORDER', payload: { id: orderId, status: 'sample_pending' } });
  }, [state.orders]);

  // ── Sample Actions ──

  const recordSampleCollection = useCallback(
    (orderId: string, sampleData: Omit<SampleRecord, 'id' | 'orderId' | 'patientName' | 'patientId' | 'tests' | 'priority'>, by: string) => {
      const order = state.orders.find(o => o.id === orderId);
      if (!order) return;
      const sampleId = makeId('SMP-2026', ++sampleCounter);
      const newSample: SampleRecord = {
        ...sampleData,
        id: sampleId,
        orderId,
        patientName: order.patientName,
        patientId: order.patientId,
        tests: order.tests.map(t => t.testName),
        priority: order.priority,
        status: 'collected',
        collectedBy: by,
        collectionDateTime: now(),
      };
      dispatch({ type: 'ADD_SAMPLE', payload: newSample });
      dispatch({ type: 'UPDATE_ORDER', payload: { id: orderId, status: 'sample_collected', sampleId } });
      addTimeline(orderId, 'Sample Collected', by, 'Lab Technician', `Sample ID: ${sampleId}`);
      addActivity({ type: 'sample_collected', orderId, patientName: order.patientName, performedBy: by, timestamp: now() });
      addToast({ type: 'success', title: 'Sample Collected', message: `Sample ${sampleId} recorded for ${order.patientName}.` });
    },
    [state.orders, addTimeline, addActivity, addToast]
  );

  const markSampleReceived = useCallback((sampleId: string, by: string) => {
    dispatch({ type: 'UPDATE_SAMPLE', payload: { id: sampleId, status: 'received', receivedAt: now() } });
    addToast({ type: 'info', title: 'Sample Received', message: `Sample ${sampleId} marked as received by ${by}.` });
  }, [addToast]);

  const startProcessing = useCallback((sampleId: string, orderId: string, by: string) => {
    const order = state.orders.find(o => o.id === orderId);
    if (!order || !canTransition(order.status, 'processing')) return;
    dispatch({ type: 'UPDATE_SAMPLE', payload: { id: sampleId, status: 'processing', processingStartedAt: now() } });
    dispatch({ type: 'UPDATE_ORDER', payload: { id: orderId, status: 'processing' } });
    addTimeline(orderId, 'Processing Started', by, 'Lab Technician');
    addActivity({ type: 'processing_started', orderId, patientName: order.patientName, performedBy: by, timestamp: now() });
    addToast({ type: 'info', title: 'Processing Started', message: `${order.patientName}'s sample is now being processed.` });
  }, [state.orders, addTimeline, addActivity, addToast]);

  const rejectSample = useCallback((sampleId: string, orderId: string, reason: string, note: string, by: string) => {
    const order = state.orders.find(o => o.id === orderId);
    if (!order) return;
    dispatch({ type: 'UPDATE_SAMPLE', payload: { id: sampleId, status: 'rejected', rejectionReason: reason as any, rejectionNote: note } });
    addTimeline(orderId, 'Sample Rejected', by, 'Lab Technician', `Reason: ${reason}. ${note}`);
    addActivity({ type: 'sample_rejected', orderId, patientName: order.patientName, performedBy: by, timestamp: now(), note: reason });
    addToast({ type: 'error', title: 'Sample Rejected', message: 'Sample rejected. Reason has been recorded in order timeline.' });
  }, [state.orders, addTimeline, addActivity, addToast]);

  const requestRecollection = useCallback((sampleId: string, orderId: string, by: string) => {
    const order = state.orders.find(o => o.id === orderId);
    if (!order) return;
    dispatch({ type: 'UPDATE_SAMPLE', payload: { id: sampleId, status: 'recollection_required', recollectionRequested: true, recollectionRequestedAt: now() } });
    dispatch({ type: 'UPDATE_ORDER', payload: { id: orderId, status: 'sample_pending' } });
    addTimeline(orderId, 'Recollection Requested', by, 'Lab Technician', 'Doctor and patient notified.');
    // Create a doctor notification
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: makeId('notif', ++notifCounter),
        orderId,
        patientName: order.patientName,
        type: 'recollection_required',
        message: `Sample recollection required for ${order.patientName} (Order ${orderId}). New sample must be collected.`,
        timestamp: now(),
        acknowledged: false,
      },
    });
    addActivity({ type: 'sample_rejected', orderId, patientName: order.patientName, performedBy: by, timestamp: now(), note: 'Recollection requested' });
    addToast({ type: 'warning', title: 'Recollection Requested', message: 'Doctor and patient have been notified for new sample collection.' });
  }, [state.orders, addTimeline, addActivity, addToast]);

  // ── Result Entry ──

  const saveResultDraft = useCallback((result: Omit<TestResult, 'id' | 'status'>) => {
    const id = makeId('TRS', ++resultCounter);
    dispatch({ type: 'ADD_TEST_RESULT', payload: { ...result, id, status: 'draft', isDraft: true, draftSavedAt: now() } });
    addToast({ type: 'info', title: 'Draft Saved', message: 'Result draft has been saved.' });
    return id;
  }, [addToast]);

  const updateTestResult = useCallback((resultId: string, params: ResultParameter[]) => {
    dispatch({ type: 'UPDATE_TEST_RESULT', payload: { id: resultId, parameters: params, draftSavedAt: now() } });
  }, []);

  const submitResultForVerification = useCallback((resultId: string, orderId: string, by: string) => {
    const order = state.orders.find(o => o.id === orderId);
    if (!order || !canTransition(order.status, 'awaiting_verification')) return;
    const result = state.testResults.find(r => r.id === resultId);
    if (!result) return;
    dispatch({ type: 'UPDATE_TEST_RESULT', payload: { id: resultId, status: 'submitted', isDraft: false } });
    const existingIds = order.testResultIds ?? [];
    dispatch({ type: 'UPDATE_ORDER', payload: { id: orderId, status: 'awaiting_verification', testResultIds: [...existingIds, resultId] } });
    addTimeline(orderId, 'Results Entered — Submitted for Verification', by, 'Lab Technician');
    addActivity({ type: 'result_submitted', orderId, patientName: order.patientName, performedBy: by, timestamp: now() });
    if (result.hasCritical) {
      addActivity({ type: 'critical_flagged', orderId, patientName: order.patientName, performedBy: by, timestamp: now(), note: 'Critical value flagged' });
    }
    addToast({ type: 'success', title: 'Submitted for Verification', message: 'Results have been locked and sent to pathologist for verification.' });
  }, [state.orders, state.testResults, addTimeline, addActivity, addToast]);

  // ── Verification ──

  const verifyAndReleaseReport = useCallback(
    (orderId: string, resultIds: string[], verifiedBy: string, verifiedById: string, note: string) => {
      const order = state.orders.find(o => o.id === orderId);
      if (!order || !canTransition(order.status, 'report_ready')) return '';
      const results = state.testResults.filter(r => resultIds.includes(r.id));
      const hasCritical = results.some(r => r.hasCritical);
      const reportId = makeId('RPT-2026', ++reportCounter);

      // Mark results as verified
      resultIds.forEach(rid => dispatch({ type: 'UPDATE_TEST_RESULT', payload: { id: rid, status: 'verified' } }));

      const report: VerifiedReport = {
        id: reportId,
        orderId,
        version: 1,
        isAmendment: false,
        patientName: order.patientName,
        patientId: order.patientId,
        patientAge: order.patientAge,
        patientGender: order.patientGender,
        orderingDoctor: order.orderingDoctor,
        orderingFacility: `${order.facility} (${order.facilityCode})`,
        labName: 'SwasthyaSetu Diagnostic Centre, Khed',
        labCode: 'LAB-KHD-01',
        tests: order.tests.map(t => t.testName),
        testResults: results,
        sampleCollectedAt: order.acceptedAt ?? order.orderDateTime,
        sampleType: order.tests[0]?.sampleType ?? 'blood',
        priority: order.priority,
        hasCritical,
        criticalAcknowledged: false,
        verifiedBy,
        verifiedById,
        verifiedAt: now(),
        verificationNote: note,
        releasedAt: now(),
        doctorReviewStatus: 'pending',
        printCopies: 0,
      };

      dispatch({ type: 'ADD_VERIFIED_REPORT', payload: report });
      dispatch({ type: 'UPDATE_ORDER', payload: { id: orderId, status: 'report_ready', reportId } });
      addTimeline(orderId, 'Report Verified and Released', verifiedBy, 'Pathologist', note);
      addActivity({ type: 'report_verified', orderId, patientName: order.patientName, performedBy: verifiedBy, timestamp: now() });

      // Notify doctor
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: makeId('notif', ++notifCounter),
          orderId,
          patientName: order.patientName,
          type: hasCritical ? 'critical_result' : 'report_ready',
          message: hasCritical
            ? `CRITICAL: Report for ${order.patientName} (${orderId}) contains critical values. Immediate review required.`
            : `Report ready: ${order.patientName}'s ${order.tests.map(t => t.testName).join(', ')} report has been verified and released.`,
          timestamp: now(),
          acknowledged: false,
        },
      });

      addToast({ type: 'success', title: 'Report Released', message: `Report ${reportId} has been verified and released to the doctor.` });
      return reportId;
    },
    [state.orders, state.testResults, addTimeline, addActivity, addToast]
  );

  const returnForCorrection = useCallback((resultId: string, orderId: string, note: string, by: string) => {
    const order = state.orders.find(o => o.id === orderId);
    if (!order) return;
    dispatch({ type: 'UPDATE_TEST_RESULT', payload: { id: resultId, status: 'draft', isDraft: true } });
    dispatch({ type: 'UPDATE_ORDER', payload: { id: orderId, status: 'processing' } });
    addTimeline(orderId, 'Returned for Correction', by, 'Pathologist', note);
    addToast({ type: 'warning', title: 'Returned for Correction', message: 'Results returned to technician with correction note.' });
  }, [state.orders, addTimeline, addToast]);

  // ── Reports ──

  const markDoctorReviewed = useCallback((reportId: string, by: string) => {
    const report = state.verifiedReports.find(r => r.id === reportId);
    if (!report) return;
    dispatch({ type: 'UPDATE_VERIFIED_REPORT', payload: { id: reportId, doctorReviewStatus: 'reviewed', doctorReviewedAt: now() } });
    dispatch({ type: 'UPDATE_ORDER', payload: { id: report.orderId, status: 'doctor_reviewed' } });
    addTimeline(report.orderId, 'Doctor Reviewed Report', by, 'Doctor');
    addActivity({ type: 'doctor_reviewed', orderId: report.orderId, patientName: report.patientName, performedBy: by, timestamp: now() });
    addToast({ type: 'success', title: 'Marked as Reviewed', message: 'Report has been marked as reviewed by the doctor.' });
  }, [state.verifiedReports, state.orders, addTimeline, addActivity, addToast]);

  const acknowledgeCritical = useCallback((reportId: string, notificationId: string, by: string) => {
    dispatch({ type: 'UPDATE_VERIFIED_REPORT', payload: { id: reportId, criticalAcknowledged: true, criticalAcknowledgedAt: now(), criticalAcknowledgedBy: by } });
    dispatch({ type: 'ACK_NOTIFICATION', payload: { id: notificationId, by } });
    addToast({ type: 'info', title: 'Critical Result Acknowledged', message: 'Communication with doctor has been recorded.' });
  }, [addToast]);

  // ── Derived Stats ──

  const dashboardStats = useMemo(() => ({
    newOrders: state.orders.filter(o => o.status === 'ordered').length,
    pendingSamples: state.orders.filter(o => ['accepted', 'sample_pending'].includes(o.status)).length,
    processing: state.orders.filter(o => o.status === 'processing').length,
    awaitingVerification: state.orders.filter(o => o.status === 'awaiting_verification').length,
    reportsReady: state.orders.filter(o => o.status === 'report_ready').length,
    criticalResults: state.verifiedReports.filter(r => r.hasCritical && !r.criticalAcknowledged).length,
  }), [state.orders, state.verifiedReports]);

  const value: LabPortalContextType = {
    orders: state.orders,
    samples: state.samples,
    testResults: state.testResults,
    verifiedReports: state.verifiedReports,
    activity: state.activity,
    notifications: state.notifications,
    toasts: state.toasts,
    dashboardStats,
    addToast,
    removeToast,
    acceptOrder,
    rejectOrder,
    beginSampleCollection,
    recordSampleCollection,
    markSampleReceived,
    startProcessing,
    rejectSample,
    requestRecollection,
    saveResultDraft,
    submitResultForVerification,
    updateTestResult,
    verifyAndReleaseReport,
    returnForCorrection,
    markDoctorReviewed,
    acknowledgeCritical,
  };

  return <LabPortalContext.Provider value={value}>{children}</LabPortalContext.Provider>;
};

export const useLabPortal = (): LabPortalContextType => {
  const ctx = useContext(LabPortalContext);
  if (!ctx) throw new Error('useLabPortal must be used within LabPortalProvider');
  return ctx;
};
