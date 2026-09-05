/**
 * Type definitions for the Diagnostic Laboratory Portal
 * SwasthyaSetu Maharashtra - Integrated Rural Healthcare Network
 *
 * NOTE: All data types are designed for fictional demo workflows only.
 * No real patient data, Aadhaar numbers, or ABDM data is stored here.
 */

// ─── Priority ────────────────────────────────────────────────────────────────

export type LabPriority = 'routine' | 'urgent' | 'emergency';

// ─── Order Statuses ──────────────────────────────────────────────────────────

export type LabOrderStatus =
  | 'ordered'           // Doctor created order
  | 'accepted'          // Lab accepted the order
  | 'sample_pending'    // Waiting for sample collection
  | 'sample_collected'  // Sample collected from patient
  | 'processing'        // Sample being processed in lab
  | 'awaiting_verification' // Result entered, pending pathologist sign-off
  | 'report_ready'      // Report verified & released
  | 'doctor_reviewed'   // Doctor acknowledged the report
  | 'rejected'          // Lab rejected the order
  | 'cancelled';        // Order cancelled

// ─── Sample Statuses ─────────────────────────────────────────────────────────

export type SampleStatus =
  | 'pending'
  | 'collected'
  | 'received'
  | 'rejected'
  | 'recollection_required'
  | 'processing';

export type SampleType =
  | 'blood'
  | 'urine'
  | 'swab'
  | 'sputum'
  | 'stool'
  | 'other';

// ─── Result Flag ─────────────────────────────────────────────────────────────

export type ResultFlag = 'low' | 'normal' | 'high' | 'critical';

// ─── Individual test inside an order ─────────────────────────────────────────

export interface LabTestItem {
  id: string;
  testCode: string;
  testName: string;
  category: string;
  sampleType: SampleType;
  fastingRequired: boolean;
  preparationNote?: string;
  estimatedTAT: string; // e.g., "4 hours"
}

// ─── Timeline entry (audit log per order) ───────────────────────────────────

export interface LabOrderTimelineEntry {
  id: string;
  timestamp: string;
  action: string;
  performedBy: string;
  role: string;
  note?: string;
}

// ─── Rejection reason options ─────────────────────────────────────────────────

export type SampleRejectionReason =
  | 'wrong_container'
  | 'insufficient_quantity'
  | 'damaged_or_leaking'
  | 'incorrect_labelling'
  | 'delayed_transport'
  | 'other';

// ─── Sample Record ────────────────────────────────────────────────────────────

export interface SampleRecord {
  id: string;            // e.g., SMP-2026-001
  orderId: string;       // Linked LabOrder id
  patientName: string;
  patientId: string;
  tests: string[];       // test names
  sampleType: SampleType;
  container: string;     // e.g., "EDTA Tube (Purple Cap)"
  barcode: string;
  status: SampleStatus;
  priority: LabPriority;
  collectionDateTime?: string; // ISO
  collectedBy?: string;
  fastingConfirmed?: boolean;
  quantity?: string;     // e.g., "3 mL"
  notes?: string;
  rejectionReason?: SampleRejectionReason;
  rejectionNote?: string;
  recollectionRequested?: boolean;
  recollectionRequestedAt?: string;
  receivedAt?: string;
  processingStartedAt?: string;
}

// ─── Result Parameter (one row in the report table) ─────────────────────────

export interface ResultParameter {
  id: string;
  parameterName: string;
  value: string;
  unit: string;
  referenceMin?: string;
  referenceMax?: string;
  referenceText?: string;  // e.g., "Negative" for qualitative tests
  flag: ResultFlag;
  note?: string;
}

// ─── Test Result (one test's results within an order) ───────────────────────

export interface TestResult {
  id: string;
  testId: string;
  testName: string;
  orderId: string;
  parameters: ResultParameter[];
  technicianId: string;
  technicianName: string;
  enteredAt: string;
  status: 'draft' | 'submitted' | 'verified';
  isDraft?: boolean;
  draftSavedAt?: string;
  hasCritical: boolean;
}

// ─── Verified Report ──────────────────────────────────────────────────────────

export interface VerifiedReport {
  id: string;           // e.g., RPT-2026-001
  orderId: string;
  version: number;      // 1 for original, 2+ for amendments
  isAmendment: boolean;
  amendmentNote?: string;
  patientName: string;
  patientId: string;
  patientAge: number;
  patientGender: string;
  orderingDoctor: string;
  orderingFacility: string;
  labName: string;
  labCode: string;
  tests: string[];
  testResults: TestResult[];
  sampleCollectedAt: string;
  sampleType: SampleType;
  priority: LabPriority;
  hasCritical: boolean;
  criticalAcknowledged: boolean;
  criticalAcknowledgedAt?: string;
  criticalAcknowledgedBy?: string;
  verifiedBy: string;
  verifiedById: string;
  verifiedAt: string;
  verificationNote?: string;
  releasedAt: string;
  doctorReviewStatus: 'pending' | 'reviewed';
  doctorReviewedAt?: string;
  printCopies: number;
}

// ─── Full Lab Order ───────────────────────────────────────────────────────────

export interface LabOrder {
  id: string;           // e.g., LAB-1001
  patientName: string;
  patientId: string;    // e.g., MH-PAT-1001
  patientAge: number;
  patientGender: string;
  orderingDoctor: string;
  orderingDoctorId: string;
  facility: string;
  facilityCode: string;
  tests: LabTestItem[];
  clinicalReason: string;
  priority: LabPriority;
  status: LabOrderStatus;
  orderDateTime: string;   // ISO
  acceptedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  sampleId?: string;       // linked SampleRecord id
  testResultIds?: string[];// linked TestResult ids
  reportId?: string;       // linked VerifiedReport id
  timeline: LabOrderTimelineEntry[];
  attachments?: string[];  // filenames/labels only
  preparationInstructions?: string;
  // Doctor portal linkage field - mirrors LabOrderItem.status in doctor types
  doctorPortalStatus?: string;
}

// ─── Activity feed item ───────────────────────────────────────────────────────

export interface LabActivityItem {
  id: string;
  type:
    | 'order_received'
    | 'order_accepted'
    | 'order_rejected'
    | 'sample_collected'
    | 'sample_rejected'
    | 'processing_started'
    | 'result_entered'
    | 'result_submitted'
    | 'report_verified'
    | 'critical_flagged'
    | 'doctor_reviewed';
  orderId: string;
  patientName: string;
  performedBy: string;
  timestamp: string;
  note?: string;
}

// ─── Dashboard stats ──────────────────────────────────────────────────────────

export interface LabDashboardStats {
  newOrders: number;
  pendingSamples: number;
  processing: number;
  awaitingVerification: number;
  reportsReady: number;
  criticalResults: number;
}

// ─── Toast (reuse same shape as Doctor Portal) ───────────────────────────────

export interface LabToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

// ─── Notification for Doctor Portal ──────────────────────────────────────────

export interface LabDoctorNotification {
  id: string;
  orderId: string;
  patientName: string;
  type: 'report_ready' | 'critical_result' | 'recollection_required' | 'order_rejected';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  acknowledgedAt?: string;
}

// ─── Status transition helpers ────────────────────────────────────────────────

export function getAllowedTransitions(status: LabOrderStatus): LabOrderStatus[] {
  const transitions: Record<LabOrderStatus, LabOrderStatus[]> = {
    ordered:                ['accepted', 'rejected'],
    accepted:               ['sample_pending'],
    sample_pending:         ['sample_collected', 'cancelled'],
    sample_collected:       ['processing'],
    processing:             ['awaiting_verification'],
    awaiting_verification:  ['report_ready'],
    report_ready:           ['doctor_reviewed'],
    doctor_reviewed:        [],
    rejected:               [],
    cancelled:              [],
  };
  return transitions[status] ?? [];
}

export function canTransition(from: LabOrderStatus, to: LabOrderStatus): boolean {
  return getAllowedTransitions(from).includes(to);
}

// ─── Serialisable patient-facing model (Android-ready) ────────────────────────

export interface PatientLabStatusUpdate {
  orderId: string;
  patientId: string;
  status: LabOrderStatus;
  updatedAt: string;
  message: string;
  // NOTE: technician notes are intentionally excluded from this model
}
