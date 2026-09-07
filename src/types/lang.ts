export type Language = 'en' | 'mr' | 'hi';

export interface LanguageOption {
  code: Language;
  label: string;
  nativeName: string;
}

export interface TranslationDictionary {
  [key: string]: string;

  appName: string;
  appSubtitle: string;
  sihDisclaimer: string;
  brandTagline: string;
  brandDescription: string;
  benefit1: string;
  benefit2: string;
  benefit3: string;
  benefit4: string;
  
  // Portal Titles & Descriptions
  portalHospitalTitle: string;
  portalHospitalDesc: string;
  portalLabTitle: string;
  portalLabDesc: string;
  portalPharmacyTitle: string;
  portalPharmacyDesc: string;
  portalAdminTitle: string;
  portalAdminDesc: string;

  // Form Fields & Placeholders
  hospitalIdLabel: string;
  labIdLabel: string;
  pharmacyIdLabel: string;
  adminIdLabel: string;
  facilityCodeLabel: string;
  storeCodeLabel: string;
  deptCodeLabel: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  rememberMe: string;
  forgotPassword: string;
  secureLoginBtn: string;
  loggingInBtn: string;
  loginSuccess: string;
  capsLockWarning: string;
  contactSupport: string;
  needHelp: string;

  // Validation & Error Messages
  requiredField: string;
  invalidCredentials: string;
  portalMismatchError: string;
  sessionExpired: string;
  networkError: string;

  // Account Management
  prototypeNotice: string;

  // Dashboards Generic
  dashboardPlaceholderNotice: string;
  welcomeBack: string;
  facility: string;
  roleBadge: string;
  logoutBtn: string;
  activeSession: string;
  permissionsTitle: string;
  backToLogin: string;
  pageNotFound: string;
  pageNotFoundDesc: string;

  // Doctor Portal Sidebar
  docNavDashboard: string;
  docNavAppointments: string;
  docNavLiveQueue: string;
  docNavPatients: string;
  docNavConsultations: string;
  docNavPrescriptions: string;
  docNavLabOrders: string;
  docNavReferrals: string;
  docNavTeleconsultation: string;
  docNavFollowups: string;
  docNavFacilityStatus: string;
  docNavReports: string;
  collapseSidebar: string;
  expandSidebar: string;
  toggleSidebar: string;
  navigationMenu: string;

  // Pharmacy Portal Sidebar
  pharmacyNavDashboard: string;
  pharmacyNavPrescriptions: string;
  pharmacyNavInventory: string;
  pharmacyNavReservations: string;
  pharmacyNavHistory: string;

  // Doctor Portal Welcome Section
  greetingMorning: string;
  greetingAfternoon: string;
  greetingEvening: string;
  doctorWelcomeSummary: string;
  startConsultation: string;
  viewLiveQueue: string;
  todayOverview: string;
  todaySchedule: string;
  priorityAlertsSummary: string;

  // Doctor Portal Summary Cards
  statTodayAppointments: string;
  statWaitingPatients: string;
  statPriorityCases: string;
  statCompletedConsultations: string;
  statCompletedBadge: string;
  statAvgWait: string;
  statEarlyAttention: string;
  statCompletedToday: string;

  // Doctor Portal Live Patient Queue
  queueTitle: string;
  queueSubtitle: string;
  searchPatientPlaceholder: string;
  filterAll: string;
  filterHigh: string;
  filterNormal: string;
  filterPriority: string;
  colToken: string;
  colPatient: string;
  colAge: string;
  colGender: string;
  colReason: string;
  colWaiting: string;
  colPriority: string;
  colAction: string;
  callPatientBtn: string;
  viewPatientBtn: string;
  badgeHighPriority: string;
  badgeNormalPriority: string;
  noPatientsFound: string;
  noPatientsDesc: string;
  callingPatientNotice: string;
  minutesAgo: string;

  // Doctor Portal Upcoming Appointments
  upcomingTitle: string;
  upcomingSubtitle: string;
  typeInPerson: string;
  typeTeleconsultation: string;
  typeFollowup: string;
  statusConfirmed: string;
  statusPending: string;
  statusCompleted: string;
  statusCancelled: string;
  startAppointmentBtn: string;
  viewAppointmentBtn: string;
  noUpcomingAppointments: string;

  // Doctor Portal Quick Actions
  quickActionsTitle: string;
  quickActionsSubtitle: string;
  actionFindPatient: string;
  actionFindPatientDesc: string;
  actionNewConsultation: string;
  actionNewConsultationDesc: string;
  actionCreatePrescription: string;
  actionCreatePrescriptionDesc: string;
  actionStartTeleconsult: string;
  actionStartTeleconsultDesc: string;

  // Doctor Portal Clinical Attention Alerts
  clinicalAttentionTitle: string;
  clinicalAttentionSubtitle: string;
  alertLabReports: string;
  alertLabReportsDesc: string;
  alertReferrals: string;
  alertReferralsDesc: string;
  alertFollowups: string;
  alertFollowupsDesc: string;
  actionReview: string;

  // Doctor Portal Recent Activity
  recentActivityTitle: string;
  recentActivitySubtitle: string;
  activityPrescription: string;
  activityLabReceived: string;
  activityReferralAccepted: string;
  activityConsultCompleted: string;
  patientIdLabel: string;

  // Dialogs & Modals
  comingSoonTitle: string;
  comingSoonDesc: string;
  closeBtn: string;
  gotItBtn: string;
  patientDetailsTitle: string;
  patientAbhaId: string;
  patientContact: string;
  patientVitals: string;
  patientCallScreenTitle: string;
  patientCallScreenDesc: string;
}
