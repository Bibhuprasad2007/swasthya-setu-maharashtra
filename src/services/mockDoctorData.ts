/**
 * Mock Data for Hospital / Doctor Portal (Phase 1)
 *
 * NOTE FOR SIH EVALUATION:
 * This is isolated mock dataset for Phase 1 UI demonstration.
 * In future phases, these endpoints will be replaced by live REST/GraphQL APIs
 * connected to the state-level Hospital Information Management System (HIMS) & ABDM gateway.
 * All clinical data here is synthetic and does not represent real patient records.
 */

import {
  PatientQueueItem,
  UpcomingAppointmentItem,
  DashboardStatItem,
  ClinicalAlertItem,
  RecentActivityItem
} from '../types/doctor';

export const MOCK_SUMMARY_STATS: DashboardStatItem[] = [
  {
    id: 'today_appointments',
    titleKey: 'statTodayAppointments',
    value: 24,
    badgeText: '6 completed',
    badgeType: 'blue',
    iconName: 'calendar',
    accentColor: 'blue'
  },
  {
    id: 'waiting_patients',
    titleKey: 'statWaitingPatients',
    value: '08',
    badgeText: 'Avg. wait: 14 mins',
    badgeType: 'teal',
    iconName: 'users',
    accentColor: 'teal'
  },
  {
    id: 'priority_cases',
    titleKey: 'statPriorityCases',
    value: '03',
    badgeText: 'Require early attention',
    badgeType: 'amber',
    iconName: 'alert',
    accentColor: 'amber'
  },
  {
    id: 'completed_consultations',
    titleKey: 'statCompletedConsultations',
    value: '06',
    badgeText: 'Completed today',
    badgeType: 'emerald',
    iconName: 'activity',
    accentColor: 'emerald'
  }
];

export const MOCK_PATIENT_QUEUE: PatientQueueItem[] = [
  {
    id: 'pq-1',
    token: 'A-021',
    patientName: 'Anita Patil',
    age: 42,
    gender: 'Female',
    reason: 'Fever and weakness',
    waitingMinutes: 5,
    priority: 'high',
    abhaId: '91-4829-1029-4821',
    contactNumber: '+91 98230 *****',
    vitalSummary: 'BP: 130/85 mmHg | Temp: 101.4°F | SpO2: 98%'
  },
  {
    id: 'pq-2',
    token: 'A-022',
    patientName: 'Ramesh Jadhav',
    age: 58,
    gender: 'Male',
    reason: 'Blood-pressure review',
    waitingMinutes: 12,
    priority: 'normal',
    abhaId: '91-8841-3920-5819',
    contactNumber: '+91 97654 *****',
    vitalSummary: 'BP: 148/92 mmHg | Pulse: 78 bpm | SpO2: 97%'
  },
  {
    id: 'pq-3',
    token: 'A-023',
    patientName: 'Sneha More',
    age: 27,
    gender: 'Female',
    reason: 'Follow-up consultation',
    waitingMinutes: 18,
    priority: 'normal',
    abhaId: '91-3829-5501-9284',
    contactNumber: '+91 94211 *****',
    vitalSummary: 'BP: 118/76 mmHg | Temp: 98.4°F | SpO2: 99%'
  }
];

export const MOCK_UPCOMING_APPOINTMENTS: UpcomingAppointmentItem[] = [
  {
    id: 'apt-1',
    time: '10:30 AM',
    patientName: 'Priya Shinde',
    patientId: '#PT-9041',
    type: 'in_person',
    status: 'confirmed',
    department: 'General Medicine'
  },
  {
    id: 'apt-2',
    time: '11:15 AM',
    patientName: 'Mohan Pawar',
    patientId: '#PT-9042',
    type: 'teleconsultation',
    status: 'confirmed',
    department: 'Rural Health Tele-OPD'
  },
  {
    id: 'apt-3',
    time: '12:00 PM',
    patientName: 'Kavita Deshmukh',
    patientId: '#PT-9043',
    type: 'follow_up',
    status: 'pending',
    department: 'Post-Op Care'
  }
];

export const MOCK_CLINICAL_ALERTS: ClinicalAlertItem[] = [
  {
    id: 'alert-lab',
    titleKey: 'alertLabReports',
    descKey: 'alertLabReportsDesc',
    count: 4,
    type: 'lab',
    severity: 'warning',
    actionLabelKey: 'actionReview'
  },
  {
    id: 'alert-ref',
    titleKey: 'alertReferrals',
    descKey: 'alertReferralsDesc',
    count: 2,
    type: 'referral',
    severity: 'amber',
    actionLabelKey: 'actionReview'
  },
  {
    id: 'alert-follow',
    titleKey: 'alertFollowups',
    descKey: 'alertFollowupsDesc',
    count: 3,
    type: 'followup',
    severity: 'danger',
    actionLabelKey: 'actionReview'
  }
];

export const MOCK_RECENT_ACTIVITIES: RecentActivityItem[] = [
  {
    id: 'act-1',
    type: 'prescription',
    titleKey: 'activityPrescription',
    patientId: '#PT-8942',
    timestamp: '12 mins ago',
    details: 'Amoxicillin 500mg, Paracetamol 650mg prescribed'
  },
  {
    id: 'act-2',
    type: 'lab_received',
    titleKey: 'activityLabReceived',
    patientId: '#PT-7721',
    timestamp: '35 mins ago',
    details: 'Complete Blood Count (CBC) & HbA1c verified'
  },
  {
    id: 'act-3',
    type: 'referral_accepted',
    titleKey: 'activityReferralAccepted',
    patientId: '#PT-9034',
    timestamp: '1 hour ago',
    details: 'Referral accepted by Pune District Civil Hospital'
  },
  {
    id: 'act-4',
    type: 'consultation_completed',
    titleKey: 'activityConsultCompleted',
    patientId: '#PT-8419',
    timestamp: '2 hours ago',
    details: 'Primary consultation closed, follow-up scheduled in 7 days'
  }
];
