import { PortalConfig } from '../types/auth';

export const PORTALS: Record<string, PortalConfig> = {
  hospital: {
    id: 'hospital',
    titleKey: 'portalHospitalTitle',
    descriptionKey: 'portalHospitalDesc',
    identifierLabelKey: 'hospitalIdLabel',
    identifierPlaceholder: 'e.g. DOC1001 or HOSP-5420',
    codeLabelKey: 'facilityCodeLabel',
    codePlaceholder: 'e.g. MH-PHC-101',
    dashboardRoute: '/hospital/dashboard',
    badge: 'Clinical Portal',
    themeColor: 'blue',
    capabilities: ['Appointments', 'Consultations', 'Referrals']
  },
  laboratory: {
    id: 'laboratory',
    titleKey: 'portalLabTitle',
    descriptionKey: 'portalLabDesc',
    identifierLabelKey: 'labIdLabel',
    identifierPlaceholder: 'e.g. LAB1001 or DL-9921',
    codeLabelKey: 'facilityCodeLabel',
    codePlaceholder: 'e.g. MH-LAB-101',
    dashboardRoute: '/laboratory/dashboard',
    badge: 'Diagnostic Network',
    themeColor: 'teal',
    capabilities: ['Test Orders', 'Specimen Samples', 'Verified Reports']
  },
  pharmacy: {
    id: 'pharmacy',
    titleKey: 'portalPharmacyTitle',
    descriptionKey: 'portalPharmacyDesc',
    identifierLabelKey: 'pharmacyIdLabel',
    identifierPlaceholder: 'e.g. PHA1001 or RX-8834',
    codeLabelKey: 'storeCodeLabel',
    codePlaceholder: 'e.g. MH-PHA-101',
    dashboardRoute: '/pharmacy/dashboard',
    badge: 'Supply & Dispensing',
    themeColor: 'emerald',
    capabilities: ['Prescriptions', 'Live Inventory', 'Drug Dispensing']
  },
  admin: {
    id: 'admin',
    titleKey: 'portalAdminTitle',
    descriptionKey: 'portalAdminDesc',
    identifierLabelKey: 'adminIdLabel',
    identifierPlaceholder: 'e.g. ADM1001 or DHS-0042',
    codeLabelKey: 'deptCodeLabel',
    codePlaceholder: 'e.g. MH-ADMIN-01',
    dashboardRoute: '/admin/dashboard',
    badge: 'State Governance',
    themeColor: 'cyan',
    capabilities: ['Facility Monitoring', 'Supply Shortages', 'State Analytics']
  }
};

export const PORTAL_LIST: PortalConfig[] = Object.values(PORTALS);
