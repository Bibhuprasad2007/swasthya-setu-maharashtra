export type Language = 'en' | 'mr' | 'hi';

export interface LanguageOption {
  code: Language;
  label: string;
  nativeName: string;
}

export interface TranslationDictionary {
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

  // Quick Demo / Prototype
  demoAccountsTitle: string;
  demoClickToFill: string;
  demoPrototypeNotice: string;
  
  // Dashboards
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
}
