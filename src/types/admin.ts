/**
 * Government Admin Portal — Type Definitions
 * SwasthyaSetu Maharashtra — Integrated Rural Healthcare Network
 *
 * PROTOTYPE NOTICE: All data is fictional and for demonstration only.
 * This portal does not connect to any real government system.
 */

// ─── Core Enumerations ────────────────────────────────────────────────────────

export type AdminRole =
  | 'state_admin'
  | 'district_admin'
  | 'facility_admin'
  | 'readonly_analyst';

export type AdministrativeScope = 'state' | 'district' | 'taluka' | 'facility';

export type FacilityType =
  | 'sub_centre'
  | 'phc'
  | 'chc'
  | 'rural_hospital'
  | 'district_hospital'
  | 'diagnostic_lab'
  | 'public_pharmacy';

export type OperationalStatus =
  | 'operational'
  | 'limited_services'
  | 'temporarily_unavailable'
  | 'inactive';

export type ConnectivityStatus =
  | 'online'
  | 'intermittent'
  | 'offline'
  | 'never_synced';

export type AlertCategory =
  | 'medicine_shortage'
  | 'diagnostic_unavailable'
  | 'equipment_unavailable'
  | 'facility_offline'
  | 'staff_capacity'
  | 'lab_backlog'
  | 'excessive_queue'
  | 'referral_delay'
  | 'data_sync_failure';

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';

export type AlertStatus =
  | 'new'
  | 'acknowledged'
  | 'in_progress'
  | 'resolved'
  | 'dismissed';

export type ReferralOperationalStatus =
  | 'created'
  | 'sent'
  | 'accepted'
  | 'appointment_scheduled'
  | 'patient_reached'
  | 'completed'
  | 'cancelled'
  | 'delayed';

export type ReferralUrgency = 'routine' | 'urgent' | 'emergency';

export type AdminAccountStatus = 'active' | 'suspended' | 'pending';

export type AuditActionType =
  | 'login'
  | 'logout'
  | 'facility_update'
  | 'alert_acknowledged'
  | 'alert_assigned'
  | 'alert_resolved'
  | 'alert_reopened'
  | 'user_created'
  | 'user_suspended'
  | 'user_activated'
  | 'role_changed'
  | 'report_exported'
  | 'referral_flagged'
  | 'referral_escalated';

export type ReportType =
  | 'facility_availability'
  | 'appointment_waiting'
  | 'diagnostic_capacity'
  | 'medicine_availability'
  | 'referral_completion'
  | 'followup_summary'
  | 'connectivity_sync'
  | 'alert_resolution';

// ─── Core Entities ────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;                       // e.g. ADMIN-001
  name: string;
  email: string;
  role: AdminRole;
  scope: AdministrativeScope;
  assignedDistrict?: string;
  assignedFacilityCode?: string;
  accountStatus: AdminAccountStatus;
  lastLoginAt?: string;             // ISO
  createdAt: string;                // ISO
  permissions: string[];
}

export interface Facility {
  id: string;                       // e.g. FAC-001
  code: string;                     // e.g. MH-PUN-PHC-101
  name: string;
  type: FacilityType;
  district: string;
  taluka: string;
  village: string;
  operationalStatus: OperationalStatus;
  connectivityStatus: ConnectivityStatus;
  lastSyncAt?: string;              // ISO
  activeAlertCount: number;
  // Services
  hasOPD: boolean;
  hasEmergency: boolean;
  hasTeleconsultation: boolean;
  hasLaboratory: boolean;
  hasPharmacy: boolean;
  // Contacts
  inChargeName: string;
  contactPhone: string;
  // Metrics (snapshot)
  doctorsOnDuty: number;
  totalBeds?: number;
  availableBeds?: number;
  currentQueueCount: number;
  avgWaitingMinutes: number;
}

export interface FacilityPerformanceSnapshot {
  facilityId: string;
  date: string;
  appointmentsScheduled: number;
  consultationsCompleted: number;
  avgWaitingMinutes: number;
  labOrdersPending: number;
  labTurnaroundHours: number;
  referralCompletionRate: number;    // 0–100
  prescriptionFulfilmentRate: number; // 0–100
  followupCompletionRate: number;    // 0–100
}

export interface OperationalAlert {
  id: string;                       // ALT-001
  title: string;
  category: AlertCategory;
  severity: AlertSeverity;
  status: AlertStatus;
  facilityCode: string;
  facilityName: string;
  district: string;
  description: string;
  sourcePortal: 'hospital' | 'laboratory' | 'pharmacy' | 'admin' | 'system';
  sourceReferenceId?: string;
  createdAt: string;                // ISO
  assignedTo?: string;              // admin user id
  assignedToName?: string;
  resolutionNote?: string;
  lastUpdatedAt: string;            // ISO
  statusHistory: AlertStatusHistoryEntry[];
}

export interface AlertStatusHistoryEntry {
  id: string;
  status: AlertStatus;
  changedBy: string;
  changedAt: string;                // ISO
  note?: string;
}

export interface ReferralOperationalSummary {
  id: string;                       // REF-ADM-001
  maskedRef: string;                // e.g. CASE-****-089
  sourceFacilityCode: string;
  sourceFacilityName: string;
  destinationFacilityCode: string;
  destinationFacilityName: string;
  district: string;
  referralCategory: string;
  urgency: ReferralUrgency;
  createdAt: string;                // ISO
  sentAt?: string;
  acceptedAt?: string;
  status: ReferralOperationalStatus;
  timePendingHours: number;
  isDelayed: boolean;
  coordinationFlaggedBy?: string;
  coordinationFlagNote?: string;
  coordinationFlaggedAt?: string;
}

export interface ServiceSnapshot {
  // Doctor / OPD
  appointmentsToday: number;
  consultationsCompleted: number;
  currentQueueTotal: number;
  avgWaitingMinutes: number;
  doctorsAvailable: number;
  followupsDue: number;
  pendingReferrals: number;

  // Lab
  labOrdersPending: number;
  labSamplesCollected: number;
  labInProgress: number;
  labAwaitingVerification: number;
  labReportsReady: number;
  labAvgTurnaroundHours: number;
  unavailableLabTests: number;
  labBacklogCount: number;

  // Pharmacy
  prescriptionsPending: number;
  prescriptionsFullyDispensed: number;
  prescriptionsPartiallyDispensed: number;
  reservationsPending: number;
  lowStockMedicines: number;
  outOfStockEssentials: number;
  nearExpiryBatches: number;
  avgReservationProcessingHours: number;

  // Connectivity
  facilitiesOnline: number;
  facilitiesIntermittent: number;
  facilitiesOffline: number;
  pendingSyncRecords: number;
  lastSuccessfulSync?: string;
  facilitiesNeedingSupport: number;
}

export interface DistrictSummary {
  district: string;
  activeFacilities: number;
  consultationsToday: number;
  avgWaitingMinutes: number;
  labTurnaroundHours: number;
  referralCompletionRate: number;  // 0–100
  medicineFulfilmentRate: number;  // 0–100
  activeAlerts: number;
}

export interface DashboardSummary {
  totalFacilities: number;
  facilitiesOnline: number;
  facilitiesWithIssues: number;
  appointmentsToday: number;
  avgWaitingMinutes: number;
  pendingLabOrders: number;
  avgLabTurnaroundHours: number;
  pendingReferrals: number;
  delayedReferrals: number;
  lowStockMedicines: number;
  outOfStockMedicines: number;
  prescriptionFulfilmentRate: number;  // 0–100
  // Trends (vs previous period)
  appointmentsTrend: number;           // % change
  waitingTimeTrend: number;
  labTurnaroundTrend: number;
  referralDelayTrend: number;
  fulfilmentTrend: number;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: AdminRole;
  action: AuditActionType;
  targetType: string;
  targetRef: string;
  result: 'success' | 'failed';
  description: string;
}

export interface ReportDefinition {
  id: ReportType;
  label: string;
  description: string;
  iconName: string;
  availableFilters: string[];
}

export interface ReportFilter {
  dateFrom: string;
  dateTo: string;
  district: string;
  taluka: string;
  facilityType: string;
  facilityCode: string;
  serviceType: string;
  scope: AdministrativeScope;
}

// ─── Chart Data Shapes ────────────────────────────────────────────────────────

export interface ChartDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}

export interface AdminFilterState {
  scope: AdministrativeScope | 'all';
  district: string;
  taluka: string;
  facilityType: FacilityType | 'all';
  facilityCode: string;
  dateFrom: string;
  dateTo: string;
  serviceType: string;
}
