import { PortalType, UserProfile } from '../types/auth';

export interface MockUserAccount {
  identifier: string;
  password: string; // Used only in mock simulation; never stored in localStorage
  facilityCode: string;
  portal: PortalType;
  profile: UserProfile;
}

export const MOCK_ACCOUNTS: MockUserAccount[] = [
  {
    identifier: 'DOC1001',
    password: 'Demo@123',
    facilityCode: 'MH-PHC-101',
    portal: 'hospital',
    profile: {
      id: 'DOC1001',
      name: 'Dr. Ananya Kulkarni (MBBS, MD)',
      email: 'dr.ananya.kulkarni@swasthyasetu.gov.in',
      role: 'hospital',
      roleTitle: 'Chief Medical Officer',
      facilityCode: 'MH-PHC-101',
      facilityName: 'Primary Health Centre (PHC) Khed',
      district: 'Pune Rural',
      state: 'Maharashtra',
      permissions: [
        'opd.view',
        'opd.prescribe',
        'teleconsult.initiate',
        'patient.refer',
        'diagnostic.order',
        'records.access'
      ],
      lastLoginAt: new Date().toISOString()
    }
  },
  {
    identifier: 'LAB1001',
    password: 'Demo@123',
    facilityCode: 'MH-LAB-101',
    portal: 'laboratory',
    profile: {
      id: 'LAB1001',
      name: 'Rajesh Shinde (Lead Lab Technologist)',
      email: 'rajesh.shinde@swasthyasetu.gov.in',
      role: 'laboratory',
      roleTitle: 'Diagnostic Laboratory Manager',
      facilityCode: 'MH-LAB-101',
      facilityName: 'Satara District Integrated Pathology & Diagnostic Unit',
      district: 'Satara',
      state: 'Maharashtra',
      permissions: [
        'samples.receive',
        'test.process',
        'reports.upload',
        'reports.verify',
        'inventory.reagents'
      ],
      lastLoginAt: new Date().toISOString()
    }
  },
  {
    identifier: 'PHA1001',
    password: 'Demo@123',
    facilityCode: 'MH-PHA-101',
    portal: 'pharmacy',
    profile: {
      id: 'PHA1001',
      name: 'Sunita Patil (Registered Pharmacist)',
      email: 'sunita.patil@swasthyasetu.gov.in',
      role: 'pharmacy',
      roleTitle: 'Senior Dispensing Officer',
      facilityCode: 'MH-PHA-101',
      facilityName: 'Government Jan Aushadhi & PHC Dispensary Nashik',
      district: 'Nashik',
      state: 'Maharashtra',
      permissions: [
        'prescription.dispense',
        'stock.update',
        'stock.indent',
        'expiry.track',
        'distribution.audit'
      ],
      lastLoginAt: new Date().toISOString()
    }
  },
  {
    identifier: 'PHA1002',
    password: 'Demo@123',
    facilityCode: 'MH-PHA-101',
    portal: 'pharmacy',
    profile: {
      id: 'PHA1002',
      name: 'Mahesh Jadhav (Registered Pharmacist)',
      email: 'mahesh.jadhav@swasthyasetu.gov.in',
      role: 'pharmacy',
      roleTitle: 'Assistant Pharmacist & Inventory In-Charge',
      facilityCode: 'MH-PHA-101',
      facilityName: 'Government Jan Aushadhi & PHC Dispensary Nashik',
      district: 'Nashik',
      state: 'Maharashtra',
      permissions: [
        'prescription.dispense',
        'stock.update',
        'stock.indent',
        'expiry.track',
        'distribution.audit'
      ],
      lastLoginAt: new Date().toISOString()
    }
  },
  {
    identifier: 'ADM1001',
    password: 'Demo@123',
    facilityCode: 'MH-ADMIN-01',
    portal: 'admin',
    profile: {
      id: 'ADM1001',
      name: 'Shri Sanjay Deshmukh (IAS)',
      email: 'sanjay.deshmukh@swasthyasetu.gov.in',
      role: 'admin',
      roleTitle: 'Joint Director (Public Health)',
      facilityCode: 'MH-ADMIN-01',
      facilityName: 'Directorate of Health Services (DHS), Mantralaya',
      district: 'Mumbai Headquarter',
      state: 'Maharashtra',
      permissions: [
        'governance.monitor',
        'facilities.audit',
        'shortages.alert',
        'analytics.statewide',
        'user.management',
        'policy.broadcast'
      ],
      lastLoginAt: new Date().toISOString()
    }
  }
];
