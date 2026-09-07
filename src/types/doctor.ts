/**
 * Types for the Hospital / Doctor Portal
 * SwasthyaSetu Maharashtra - Integrated Rural Healthcare Network
 */

export type PriorityLevel = 'normal' | 'high' | 'emergency';

export type AppointmentType = 'in_person' | 'teleconsultation' | 'follow_up';

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'checked_in'
  | 'in_queue'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type QueueStatus =
  | 'waiting'
  | 'called'
  | 'in_consultation'
  | 'completed'
  | 'skipped'
  | 'no_show';

export interface VitalsData {
  temperature?: string; // in °F e.g. "98.6"
  bpSys?: string; // Systolic mmHg e.g. "120"
  bpDia?: string; // Diastolic mmHg e.g. "80"
  pulse?: string; // bpm e.g. "72"
  spo2?: string; // % e.g. "98"
  respiratoryRate?: string; // breaths/min e.g. "16"
  height?: string; // cm e.g. "165"
  weight?: string; // kg e.g. "68"
  bloodSugar?: string; // mg/dL e.g. "110"
}

export interface PatientRecord {
  id: string;
  patientId: string; // e.g. MH-PUN-00102
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  phone: string;
  address: string;
  village: string;
  taluka: string;
  district: string;
  bloodGroup: string;
  emergencyContact: string;
  abhaId?: string;
  allergies: string[];
  conditions: string[];
  currentMedicines?: string[];
  isHighRisk: boolean;
  registeredDate: string;
  lastVisitDate?: string;
  vitals?: VitalsData;
  notes?: string;
}

export interface AppointmentItem {
  id: string;
  patientId: string;
  patientName: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "10:30 AM"
  type: AppointmentType;
  department: string;
  doctorName: string;
  reason: string;
  status: AppointmentStatus;
  notes?: string;
  queueToken?: string;
}

export interface QueuePatientItem {
  id: string;
  token: string; // e.g. A-021
  patientId: string;
  patientName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  reason: string;
  checkInTime: string; // e.g. "09:45 AM"
  waitingMinutes: number;
  priority: PriorityLevel;
  doctorName: string;
  status: QueueStatus;
  abhaId?: string;
  vitalSummary?: string;
  vitals?: VitalsData;
}

export interface PrescriptionMedicine {
  id: string;
  medicineName: string;
  genericName: string;
  strength: string; // e.g. "500 mg"
  dosage: string; // e.g. "1 tablet"
  frequency: string; // e.g. "Twice daily (1-0-1)"
  route: string; // e.g. "Oral"
  duration: string; // e.g. "5 days"
  quantity: number; // e.g. 10
  timing: 'before_food' | 'after_food' | 'with_food' | 'as_needed';
  instructions?: string;
}

export interface PrescriptionRecord {
  id: string; // Rx-2026-001
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  facilityName: string;
  consultationId?: string;
  date: string;
  diagnosis: string;
  medicines: PrescriptionMedicine[];
  status: 'draft' | 'finalized' | 'dispensed' | 'partially_dispensed' | 'cancelled';
  instructions?: string;
  cancellationReason?: string;
  allergiesChecked?: boolean;
}

export interface LabResultEntry {
  testName: string;
  value: string;
  unit: string;
  referenceRange: string;
  isCritical: boolean;
}

export interface LabOrderItem {
  id: string; // LAB-ORD-101
  patientId: string;
  patientName: string;
  consultationId?: string;
  doctorName: string;
  diagnosticCentre: string;
  testCategory: string;
  tests: string[];
  clinicalReason: string;
  urgency: 'routine' | 'urgent' | 'emergency';
  sampleType: string;
  fastingRequired: boolean;
  instructions?: string;
  orderDate: string;
  status:
    | 'ordered'
    | 'accepted'
    | 'sample_pending'
    | 'sample_collected'
    | 'processing'
    | 'report_ready'
    | 'reviewed'
    | 'cancelled';
  criticalIndicator?: boolean;
  doctorInterpretation?: string;
  reviewedDate?: string;
  reportResults?: LabResultEntry[];
}

export interface ReferralItem {
  id: string; // REF-2026-042
  patientId: string;
  patientName: string;
  consultationId?: string;
  referringDoctor: string;
  referringFacility: string;
  receivingFacility: string;
  department: string;
  specialist?: string;
  referralReason: string;
  clinicalSummary: string;
  provisionalDiagnosis: string;
  urgency: 'routine' | 'urgent' | 'emergency';
  preferredDate: string;
  transportRequired: boolean;
  status:
    | 'draft'
    | 'sent'
    | 'accepted'
    | 'rejected'
    | 'scheduled'
    | 'patient_arrived'
    | 'consultation_completed'
    | 'cancelled';
  doctorNotes?: string;
  receivingOutcome?: string;
  createdDate: string;
}

export interface TeleconsultSession {
  id: string; // TELE-2026-012
  patientId: string;
  patientName: string;
  scheduledTime: string;
  durationMinutes: number;
  department: string;
  doctorName: string;
  status: 'scheduled' | 'waiting' | 'in_progress' | 'completed' | 'cancelled';
  meetingLink?: string;
  channelName?: string;
  notes?: string;
  symptoms?: string;
}

export interface FollowUpItem {
  id: string; // FUP-2026-089
  patientId: string;
  patientName: string;
  consultationId?: string;
  reason: string;
  dueDate: string;
  riskLevel: 'low' | 'moderate' | 'high';
  category: 'maternal_child' | 'chronic_care' | 'post_op' | 'general';
  assignedWorker: string;
  reminderStatus: 'pending' | 'sent' | 'delivered' | 'failed';
  completionStatus: 'pending' | 'completed' | 'rescheduled' | 'overdue';
  createdDate: string;
  lastContactedDate?: string;
  notes?: string;
}

export interface ConsultationRecord {
  id: string; // CONS-2026-101
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  chiefComplaint: string;
  symptoms: string[];
  duration: string;
  severity: 'mild' | 'moderate' | 'severe';
  patientNotes?: string;
  vitals: VitalsData;
  examinationNotes: string;
  provisionalDiagnosis: string;
  finalDiagnosis: string;
  clinicalAdvice: string;
  privateNotes?: string;
  status: 'draft' | 'finalized';
  prescriptionId?: string;
  labOrderIds?: string[];
  referralId?: string;
  followUpId?: string;
  addendums?: { date: string; doctorName: string; note: string }[];
}

export interface FacilityStaffStatus {
  doctorsOnDuty: number;
  nursesAvailable: number;
  specialistsAvailable: number;
  currentWorkload: 'Low' | 'Moderate' | 'High' | 'Overload';
  shiftStatus: string;
}

export interface FacilityServicesStatus {
  opd: 'Operational' | 'Limited' | 'Closed';
  emergency: 'Operational' | 'Overloaded' | 'Diverted';
  teleconsultation: 'Online' | 'Offline';
  laboratory: 'Processing' | 'Maintenance';
  pharmacy: 'Dispensing' | 'Stock Verification';
}

export interface FacilityInfrastructure {
  totalBeds: number;
  availableBeds: number;
  ambulancesAvailable: number;
  oxygenCylinders: number;
  powerBackup: 'Active (Main Grid)' | 'Generator Standby' | 'Solar Primary';
  internetConnectivity: 'High Speed Fiber (ABDM Connected)' | '4G Backup' | 'Degraded';
}

export interface FacilityEquipmentItem {
  id: string;
  name: string;
  category: string;
  status: 'Available' | 'In Use' | 'Maintenance' | 'Out of Service';
  location: string;
  lastInspection: string;
}

export interface FacilityCapacity {
  facilityName: string;
  facilityCode: string;
  district: string;
  staff: FacilityStaffStatus;
  services: FacilityServicesStatus;
  infrastructure: FacilityInfrastructure;
  equipment: FacilityEquipmentItem[];
  lastUpdated: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

export interface DashboardStatItem {
  id: string;
  titleKey: string;
  value: string | number;
  badgeText: string;
  badgeType: 'blue' | 'teal' | 'amber' | 'emerald';
  iconName: 'calendar' | 'users' | 'alert' | 'activity';
  accentColor: 'blue' | 'teal' | 'amber' | 'emerald';
}

export interface ClinicalAlertItem {
  id: string;
  titleKey: string;
  descKey: string;
  count: number;
  type: 'lab' | 'referral' | 'followup';
  severity: 'warning' | 'amber' | 'danger';
  actionLabelKey: string;
}

export interface RecentActivityItem {
  id: string;
  type: 'prescription' | 'lab_received' | 'referral_accepted' | 'consultation_completed';
  titleKey: string;
  patientId: string;
  timestamp: string;
  details?: string;
}

export interface PatientQueueItem {
  id: string;
  token: string;
  patientName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  reason: string;
  waitingMinutes: number;
  priority: 'normal' | 'high' | 'emergency';
  contactNumber?: string;
  abhaId?: string;
  vitalSummary?: string;
}

export interface UpcomingAppointmentItem {
  id: string;
  patientName: string;
  patientId: string;
  time: string;
  type: 'in_person' | 'teleconsultation' | 'follow_up';
  department?: string;
  reason?: string;
  status: string;
}
