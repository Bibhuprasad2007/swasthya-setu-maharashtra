/**
 * Mock Data for Pharmacy Portal
 * SwasthyaSetu Maharashtra - Integrated Rural Healthcare Network
 * 
 * All patient names, registration numbers, Aadhaar/ABHA references, and phone numbers are fictional.
 */

import {
  PharmacyPrescription,
  MedicineBatch,
  StockMovement,
  MedicineReservation,
  DispensingRecord,
  NotificationEvent,
  AuditEvent,
  PharmacistInfo,
  PharmacyFacility
} from '../types/pharmacy';

export const MOCK_PHARMACISTS: PharmacistInfo[] = [
  {
    id: 'PHA1001',
    name: 'Sunita Patil (Registered Pharmacist)',
    licenseNumber: 'MH-PHAR-2016-7841',
    role: 'Senior Dispensing Officer',
    facilityCode: 'MH-PHA-101',
    facilityName: 'Government Jan Aushadhi & PHC Dispensary Nashik',
    contactEmail: 'sunita.patil@swasthyasetu.gov.in',
    contactPhone: '+91 98221 *****'
  },
  {
    id: 'PHA1002',
    name: 'Mahesh Jadhav (Registered Pharmacist)',
    licenseNumber: 'MH-PHAR-2020-4102',
    role: 'Assistant Pharmacist & Inventory In-Charge',
    facilityCode: 'MH-PHA-101',
    facilityName: 'Government Jan Aushadhi & PHC Dispensary Nashik',
    contactEmail: 'mahesh.jadhav@swasthyasetu.gov.in',
    contactPhone: '+91 97632 *****'
  }
];

export const MOCK_PHARMACY_FACILITY: PharmacyFacility = {
  id: 'FAC-PHA-01',
  name: 'Government Jan Aushadhi & PHC Dispensary Nashik',
  licenseNumber: 'MH-NSK-DL-8834',
  type: 'jan_aushadhi',
  facilityCode: 'MH-PHA-101',
  district: 'Nashik',
  state: 'Maharashtra',
  address: 'Civil Hospital Premises, Trimbak Road, Nashik - 422002',
  contactPhone: '0253-2578910',
  inChargePharmacist: 'Sunita Patil (MH-PHAR-2016-7841)'
};

export const INITIAL_PRESCRIPTIONS: PharmacyPrescription[] = [
  {
    id: 'Rx-2026-0089',
    patient: {
      id: 'pt-002',
      abhaId: '91-8841-3920-5819',
      name: 'Ramesh Jadhav',
      age: 58,
      gender: 'Male',
      maskedPhone: '+91 97654 *****',
      allergies: ['Dust / Pollen'],
      district: 'Nashik'
    },
    doctor: {
      id: 'DOC1001',
      name: 'Dr. Ananya Kulkarni (MBBS, MD)',
      registrationNumber: 'MMC-2014-08291',
      facilityName: 'Primary Health Centre (PHC) Khed',
      facilityCode: 'MH-PHC-101',
      department: 'General Medicine'
    },
    issueDate: '2026-09-04',
    validUntil: '2026-10-04',
    diagnosis: 'Primary Essential Hypertension (Stage 1)',
    status: 'finalized',
    isDigitallyVerified: true,
    digitalSignature: 'DSC-VERIFIED-MMC-2014-08291-MH-PHC-101',
    urgency: 'routine',
    specialInstructions: 'Monitor morning BP before taking medication. Avoid high sodium diet.',
    allergiesChecked: true,
    medicines: [
      {
        id: 'rx-m1',
        medicineName: 'Telmisartan Tablets IP',
        genericName: 'Telmisartan',
        strength: '40 mg',
        dosage: '1 tablet',
        frequency: 'Once daily (1-0-0)',
        route: 'Oral',
        duration: '30 days',
        quantityPrescribed: 30,
        quantityDispensed: 0,
        quantityRemaining: 30,
        timing: 'before_food',
        instructions: 'Take every morning at the same time.'
      },
      {
        id: 'rx-m2',
        medicineName: 'Amlodipine Besylate Tablets IP',
        genericName: 'Amlodipine',
        strength: '5 mg',
        dosage: '1 tablet',
        frequency: 'Once daily (0-0-1)',
        route: 'Oral',
        duration: '30 days',
        quantityPrescribed: 30,
        quantityDispensed: 0,
        quantityRemaining: 30,
        timing: 'after_food',
        instructions: 'Take at night if evening BP rises.'
      }
    ]
  },
  {
    id: 'Rx-2026-0090',
    patient: {
      id: 'pt-003',
      abhaId: '91-3829-5501-9284',
      name: 'Sneha More',
      age: 27,
      gender: 'Female',
      maskedPhone: '+91 94211 *****',
      allergies: [],
      district: 'Nashik'
    },
    doctor: {
      id: 'DOC1001',
      name: 'Dr. Ananya Kulkarni (MBBS, MD)',
      registrationNumber: 'MMC-2014-08291',
      facilityName: 'Primary Health Centre (PHC) Khed',
      facilityCode: 'MH-PHC-101',
      department: 'Obstetrics & Gynaecology'
    },
    issueDate: '2026-09-03',
    validUntil: '2026-10-03',
    diagnosis: 'Microcytic Hypochromic Anemia',
    status: 'finalized',
    isDigitallyVerified: true,
    digitalSignature: 'DSC-VERIFIED-MMC-2014-08291-MH-PHC-101',
    urgency: 'routine',
    specialInstructions: 'Include leafy greens, jaggery and citrus fruits in diet.',
    allergiesChecked: true,
    medicines: [
      {
        id: 'rx-m3',
        medicineName: 'Ferrous Ascorbate + Folic Acid Tablets',
        genericName: 'Iron (100mg) + Folic Acid (1.5mg)',
        strength: '100 mg / 1.5 mg',
        dosage: '1 tablet',
        frequency: 'Once daily (0-1-0)',
        route: 'Oral',
        duration: '30 days',
        quantityPrescribed: 30,
        quantityDispensed: 0,
        quantityRemaining: 30,
        timing: 'after_food',
        instructions: 'Do not take with tea or milk.'
      }
    ]
  },
  {
    id: 'Rx-2026-0091',
    patient: {
      id: 'pt-001',
      abhaId: '91-4829-1029-4821',
      name: 'Anita Patil',
      age: 42,
      gender: 'Female',
      maskedPhone: '+91 98230 *****',
      allergies: ['Penicillin', 'Amoxicillin'],
      district: 'Nashik'
    },
    doctor: {
      id: 'DOC1002',
      name: 'Dr. Milind Vaidya (MBBS, MS)',
      registrationNumber: 'MMC-2009-04192',
      facilityName: 'Sub-District Hospital (SDH) Igatpuri',
      facilityCode: 'MH-SDH-204',
      department: 'Internal Medicine'
    },
    issueDate: '2026-09-05',
    validUntil: '2026-09-20',
    diagnosis: 'Upper Respiratory Tract Infection with Fever',
    status: 'finalized',
    isDigitallyVerified: true,
    digitalSignature: 'DSC-VERIFIED-MMC-2009-04192-MH-SDH-204',
    urgency: 'urgent',
    specialInstructions: 'Patient has severe Penicillin allergy. Prescribed Paracetamol and Cetirizine only.',
    allergiesChecked: true,
    medicines: [
      {
        id: 'rx-m4',
        medicineName: 'Paracetamol Tablets IP',
        genericName: 'Paracetamol',
        strength: '650 mg',
        dosage: '1 tablet',
        frequency: 'Three times daily (1-1-1)',
        route: 'Oral',
        duration: '5 days',
        quantityPrescribed: 15,
        quantityDispensed: 0,
        quantityRemaining: 15,
        timing: 'after_food',
        instructions: 'For fever above 100°F.'
      },
      {
        id: 'rx-m5',
        medicineName: 'Cetirizine Hydrochloride Tablets IP',
        genericName: 'Cetirizine',
        strength: '10 mg',
        dosage: '1 tablet',
        frequency: 'Once daily at bedtime (0-0-1)',
        route: 'Oral',
        duration: '5 days',
        quantityPrescribed: 5,
        quantityDispensed: 0,
        quantityRemaining: 5,
        timing: 'after_food',
        instructions: 'May cause drowsiness.'
      }
    ]
  },
  {
    id: 'Rx-2026-0092',
    patient: {
      id: 'pt-004',
      abhaId: '91-7712-4091-6352',
      name: 'Vikram Shinde',
      age: 63,
      gender: 'Male',
      maskedPhone: '+91 91580 *****',
      allergies: ['Sulfa Drugs'],
      district: 'Nashik'
    },
    doctor: {
      id: 'DOC1003',
      name: 'Dr. Sunita Deshmukh (MBBS, DNB)',
      registrationNumber: 'MMC-2012-07119',
      facilityName: 'Nashik Civil Hospital',
      facilityCode: 'MH-DH-101',
      department: 'Diabetology'
    },
    issueDate: '2026-09-02',
    validUntil: '2026-10-02',
    diagnosis: 'Type 2 Diabetes Mellitus with Acid Reflux',
    status: 'partially_dispensed',
    isDigitallyVerified: true,
    digitalSignature: 'DSC-VERIFIED-MMC-2012-07119-MH-DH-101',
    urgency: 'routine',
    specialInstructions: 'Check fasting blood sugar weekly.',
    allergiesChecked: true,
    medicines: [
      {
        id: 'rx-m6',
        medicineName: 'Metformin Hydrochloride Tablets IP',
        genericName: 'Metformin',
        strength: '500 mg',
        dosage: '1 tablet',
        frequency: 'Twice daily (1-0-1)',
        route: 'Oral',
        duration: '30 days',
        quantityPrescribed: 60,
        quantityDispensed: 30,
        quantityRemaining: 30,
        timing: 'after_food',
        instructions: 'Take immediately after lunch and dinner.'
      },
      {
        id: 'rx-m7',
        medicineName: 'Pantoprazole Gastro-resistant Tablets IP',
        genericName: 'Pantoprazole',
        strength: '40 mg',
        dosage: '1 tablet',
        frequency: 'Once daily before breakfast (1-0-0)',
        route: 'Oral',
        duration: '15 days',
        quantityPrescribed: 15,
        quantityDispensed: 15,
        quantityRemaining: 0,
        timing: 'before_food',
        instructions: 'Take empty stomach 30 mins before food.'
      }
    ]
  },
  {
    id: 'Rx-2026-0093',
    patient: {
      id: 'pt-005',
      abhaId: '91-6201-9482-1130',
      name: 'Laxman Ghadge',
      age: 71,
      gender: 'Male',
      maskedPhone: '+91 99701 *****',
      allergies: [],
      district: 'Nashik'
    },
    doctor: {
      id: 'DOC1001',
      name: 'Dr. Ananya Kulkarni (MBBS, MD)',
      registrationNumber: 'MMC-2014-08291',
      facilityName: 'Primary Health Centre (PHC) Khed',
      facilityCode: 'MH-PHC-101',
      department: 'General Medicine'
    },
    issueDate: '2026-08-25',
    validUntil: '2026-09-25',
    diagnosis: 'Acute Gastroenteritis & Dehydration',
    status: 'fully_dispensed',
    isDigitallyVerified: true,
    digitalSignature: 'DSC-VERIFIED-MMC-2014-08291-MH-PHC-101',
    urgency: 'routine',
    specialInstructions: 'Consume 2 litres of ORS solution daily until loose stools stop.',
    allergiesChecked: true,
    medicines: [
      {
        id: 'rx-m8',
        medicineName: 'Oral Rehydration Salts (ORS) IP',
        genericName: 'ORS WHO Formula',
        strength: '20.5 g sachet',
        dosage: '1 sachet in 1 litre water',
        frequency: 'As needed (SOS)',
        route: 'Oral',
        duration: '3 days',
        quantityPrescribed: 6,
        quantityDispensed: 6,
        quantityRemaining: 0,
        timing: 'as_needed',
        instructions: 'Mix freshly every 24 hours.'
      }
    ]
  },
  {
    id: 'Rx-2026-0078',
    patient: {
      id: 'pt-006',
      abhaId: '91-5509-3312-8874',
      name: 'Meena Kadam',
      age: 34,
      gender: 'Female',
      maskedPhone: '+91 98902 *****',
      allergies: [],
      district: 'Nashik'
    },
    doctor: {
      id: 'DOC1002',
      name: 'Dr. Milind Vaidya (MBBS, MS)',
      registrationNumber: 'MMC-2009-04192',
      facilityName: 'Sub-District Hospital (SDH) Igatpuri',
      facilityCode: 'MH-SDH-204',
      department: 'Pulmonology'
    },
    issueDate: '2026-07-15',
    validUntil: '2026-08-15',
    diagnosis: 'Acute Bronchitis (Course Finished)',
    status: 'expired',
    isDigitallyVerified: true,
    digitalSignature: 'DSC-VERIFIED-MMC-2009-04192-MH-SDH-204',
    urgency: 'routine',
    specialInstructions: 'Expired prescription: Requires doctor re-evaluation.',
    allergiesChecked: true,
    medicines: [
      {
        id: 'rx-m9',
        medicineName: 'Azithromycin Tablets IP',
        genericName: 'Azithromycin',
        strength: '500 mg',
        dosage: '1 tablet',
        frequency: 'Once daily (1-0-0)',
        route: 'Oral',
        duration: '5 days',
        quantityPrescribed: 5,
        quantityDispensed: 0,
        quantityRemaining: 5,
        timing: 'after_food',
        instructions: 'Complete full 5-day course.'
      }
    ]
  },
  {
    id: 'Rx-2026-0081',
    patient: {
      id: 'pt-007',
      abhaId: '91-1189-9942-3301',
      name: 'Prakash Salunkhe',
      age: 49,
      gender: 'Male',
      maskedPhone: '+91 94225 *****',
      allergies: [],
      district: 'Nashik'
    },
    doctor: {
      id: 'DOC1001',
      name: 'Dr. Ananya Kulkarni (MBBS, MD)',
      registrationNumber: 'MMC-2014-08291',
      facilityName: 'Primary Health Centre (PHC) Khed',
      facilityCode: 'MH-PHC-101',
      department: 'General Medicine'
    },
    issueDate: '2026-08-20',
    validUntil: '2026-09-20',
    diagnosis: 'Suspected Drug Interaction - Medication Cancelled',
    status: 'cancelled',
    cancellationReason: 'Prescription cancelled by physician: patient re-admitted for specialist evaluation.',
    isDigitallyVerified: true,
    digitalSignature: 'DSC-VERIFIED-MMC-2014-08291-MH-PHC-101',
    urgency: 'routine',
    specialInstructions: 'Do not dispense. Cancelled by CMO.',
    allergiesChecked: true,
    medicines: [
      {
        id: 'rx-m10',
        medicineName: 'Ciprofloxacin Tablets IP',
        genericName: 'Ciprofloxacin',
        strength: '500 mg',
        dosage: '1 tablet',
        frequency: 'Twice daily (1-0-1)',
        route: 'Oral',
        duration: '7 days',
        quantityPrescribed: 14,
        quantityDispensed: 0,
        quantityRemaining: 14,
        timing: 'after_food'
      }
    ]
  }
];

export const INITIAL_BATCHES: MedicineBatch[] = [
  {
    id: 'BTH-101',
    medicineId: 'MED-001',
    genericName: 'Paracetamol',
    brandName: 'Paracetamol Tablets IP (Jan Aushadhi)',
    strength: '650 mg',
    dosageForm: 'Tablet',
    manufacturer: 'Maharashtra State Health Care Supplies (MSHCS) Ltd.',
    batchNumber: 'PCM-2026-B1',
    expiryDate: '2027-04-30',
    purchasePrice: 0.65,
    mrp: 1.20,
    totalQuantity: 450,
    reservedQuantity: 30,
    availableQuantity: 420,
    minStockThreshold: 100,
    storageInstructions: 'Store below 25°C, protect from moisture',
    lastUpdated: '2026-09-05T10:15:00Z',
    status: 'available'
  },
  {
    id: 'BTH-102',
    medicineId: 'MED-001',
    genericName: 'Paracetamol',
    brandName: 'Paracetamol Tablets IP (Batch 2)',
    strength: '650 mg',
    dosageForm: 'Tablet',
    manufacturer: 'Haffkine Bio-Pharmaceutical Corporation Ltd.',
    batchNumber: 'HAF-PCM-089',
    expiryDate: '2026-10-15', // Near expiry (approx 40 days)
    purchasePrice: 0.60,
    mrp: 1.20,
    totalQuantity: 80,
    reservedQuantity: 0,
    availableQuantity: 80,
    minStockThreshold: 50,
    storageInstructions: 'Store in cool dry place',
    lastUpdated: '2026-09-04T14:30:00Z',
    status: 'near_expiry'
  },
  {
    id: 'BTH-103',
    medicineId: 'MED-002',
    genericName: 'Telmisartan',
    brandName: 'Telmisartan Tablets IP',
    strength: '40 mg',
    dosageForm: 'Tablet',
    manufacturer: 'Sun Pharmaceutical Industries Ltd. (Govt Supply)',
    batchNumber: 'TEL-8839-A',
    expiryDate: '2027-08-31',
    purchasePrice: 1.80,
    mrp: 3.50,
    totalQuantity: 280,
    reservedQuantity: 30,
    availableQuantity: 250,
    minStockThreshold: 80,
    storageInstructions: 'Store protected from light and moisture',
    lastUpdated: '2026-09-05T09:00:00Z',
    status: 'available'
  },
  {
    id: 'BTH-104',
    medicineId: 'MED-003',
    genericName: 'Amlodipine',
    brandName: 'Amlodipine Besylate Tablets IP',
    strength: '5 mg',
    dosageForm: 'Tablet',
    manufacturer: 'Cipla Ltd. (Generic Line)',
    batchNumber: 'AML-5512-C',
    expiryDate: '2027-02-28',
    purchasePrice: 0.75,
    mrp: 1.50,
    totalQuantity: 45,
    reservedQuantity: 30,
    availableQuantity: 15, // Below threshold 50 -> Low Stock
    minStockThreshold: 50,
    storageInstructions: 'Store below 30°C',
    lastUpdated: '2026-09-05T11:45:00Z',
    status: 'low_stock'
  },
  {
    id: 'BTH-105',
    medicineId: 'MED-004',
    genericName: 'Metformin',
    brandName: 'Metformin Hydrochloride Tablets IP',
    strength: '500 mg',
    dosageForm: 'Tablet',
    manufacturer: 'Torrent Pharmaceuticals Ltd.',
    batchNumber: 'MET-9021-G',
    expiryDate: '2027-11-30',
    purchasePrice: 0.90,
    mrp: 2.00,
    totalQuantity: 360,
    reservedQuantity: 0,
    availableQuantity: 360,
    minStockThreshold: 100,
    storageInstructions: 'Store in airtight container',
    lastUpdated: '2026-09-03T16:20:00Z',
    status: 'available'
  },
  {
    id: 'BTH-106',
    medicineId: 'MED-005',
    genericName: 'Iron (100mg) + Folic Acid (1.5mg)',
    brandName: 'Ferrous Ascorbate + Folic Acid Tablets',
    strength: '100 mg / 1.5 mg',
    dosageForm: 'Tablet',
    manufacturer: 'Alkem Laboratories Ltd.',
    batchNumber: 'FEF-3301-M',
    expiryDate: '2027-05-31',
    purchasePrice: 1.20,
    mrp: 2.80,
    totalQuantity: 38,
    reservedQuantity: 0,
    availableQuantity: 38,
    minStockThreshold: 60,
    storageInstructions: 'Protect from direct sunlight and heat',
    lastUpdated: '2026-09-04T12:10:00Z',
    status: 'low_stock'
  },
  {
    id: 'BTH-107',
    medicineId: 'MED-006',
    genericName: 'Azithromycin',
    brandName: 'Azithromycin Tablets IP',
    strength: '500 mg',
    dosageForm: 'Tablet',
    manufacturer: 'Lupin Ltd. (Govt Jan Aushadhi)',
    batchNumber: 'AZI-7714-X',
    expiryDate: '2026-12-31',
    purchasePrice: 6.50,
    mrp: 14.00,
    totalQuantity: 0,
    reservedQuantity: 0,
    availableQuantity: 0,
    minStockThreshold: 40,
    storageInstructions: 'Store below 25°C',
    lastUpdated: '2026-09-05T08:30:00Z',
    status: 'out_of_stock'
  },
  {
    id: 'BTH-108',
    medicineId: 'MED-007',
    genericName: 'Cetirizine',
    brandName: 'Cetirizine Hydrochloride Tablets IP',
    strength: '10 mg',
    dosageForm: 'Tablet',
    manufacturer: 'Dr. Reddy’s Laboratories',
    batchNumber: 'CET-4019-P',
    expiryDate: '2027-09-30',
    purchasePrice: 0.40,
    mrp: 1.00,
    totalQuantity: 220,
    reservedQuantity: 0,
    availableQuantity: 220,
    minStockThreshold: 50,
    storageInstructions: 'Store in dry place',
    lastUpdated: '2026-09-02T09:40:00Z',
    status: 'available'
  },
  {
    id: 'BTH-109',
    medicineId: 'MED-008',
    genericName: 'Pantoprazole',
    brandName: 'Pantoprazole Gastro-resistant Tablets IP',
    strength: '40 mg',
    dosageForm: 'Tablet',
    manufacturer: 'Mankind Pharma Ltd.',
    batchNumber: 'PAN-1099-K',
    expiryDate: '2027-06-30',
    purchasePrice: 1.50,
    mrp: 3.20,
    totalQuantity: 190,
    reservedQuantity: 0,
    availableQuantity: 190,
    minStockThreshold: 60,
    storageInstructions: 'Store in original strip, protect from light',
    lastUpdated: '2026-09-01T15:00:00Z',
    status: 'available'
  },
  {
    id: 'BTH-110',
    medicineId: 'MED-009',
    genericName: 'ORS WHO Formula',
    brandName: 'Oral Rehydration Salts (ORS) IP',
    strength: '20.5 g sachet',
    dosageForm: 'Powder',
    manufacturer: 'Haffkine Bio-Pharmaceutical Corporation Ltd.',
    batchNumber: 'ORS-8812-H',
    expiryDate: '2027-10-31',
    purchasePrice: 3.00,
    mrp: 6.00,
    totalQuantity: 310,
    reservedQuantity: 0,
    availableQuantity: 310,
    minStockThreshold: 80,
    storageInstructions: 'Keep in dry airtight packaging',
    lastUpdated: '2026-09-04T17:15:00Z',
    status: 'available'
  },
  {
    id: 'BTH-111',
    medicineId: 'MED-010',
    genericName: 'Ciprofloxacin Eye Drops',
    brandName: 'Ciprofloxacin Ophthalmic Solution IP',
    strength: '0.3% w/v (5 ml)',
    dosageForm: 'Drops',
    manufacturer: 'FDC Ltd. (Healthcare Division)',
    batchNumber: 'CIP-EYE-62',
    expiryDate: '2026-10-05', // Near expiry (less than 30 days)
    purchasePrice: 8.50,
    mrp: 18.00,
    totalQuantity: 18,
    reservedQuantity: 0,
    availableQuantity: 18,
    minStockThreshold: 20,
    storageInstructions: 'Store below 25°C. Discard 1 month after opening.',
    lastUpdated: '2026-09-05T12:00:00Z',
    status: 'near_expiry'
  },
  {
    id: 'BTH-112',
    medicineId: 'MED-011',
    genericName: 'Insulin Glargine',
    brandName: 'Insulin Glargine Injection IP (Cartridge)',
    strength: '100 IU/ml (3 ml)',
    dosageForm: 'Injection',
    manufacturer: 'Biocon Biologics India',
    batchNumber: 'INS-GL-401',
    expiryDate: '2027-03-31',
    purchasePrice: 165.00,
    mrp: 320.00,
    totalQuantity: 24,
    reservedQuantity: 0,
    availableQuantity: 24,
    minStockThreshold: 10,
    storageInstructions: 'Refrigerate at 2°C to 8°C. Do not freeze.',
    lastUpdated: '2026-09-05T09:30:00Z',
    status: 'available'
  },
  {
    id: 'BTH-113',
    medicineId: 'MED-012',
    genericName: 'Doxycycline',
    brandName: 'Doxycycline Capsules IP',
    strength: '100 mg',
    dosageForm: 'Capsule',
    manufacturer: 'Zydus Lifesciences Ltd.',
    batchNumber: 'DOX-OLD-99',
    expiryDate: '2026-08-15', // EXPIRED!
    purchasePrice: 1.10,
    mrp: 2.50,
    totalQuantity: 40,
    reservedQuantity: 0,
    availableQuantity: 40,
    minStockThreshold: 30,
    storageInstructions: 'Store in dry place away from light',
    lastUpdated: '2026-08-16T00:00:00Z',
    status: 'expired'
  }
];

export const INITIAL_RESERVATIONS: MedicineReservation[] = [
  {
    id: 'RSV-2026-101',
    prescriptionId: 'Rx-2026-0089',
    patient: {
      id: 'pt-002',
      abhaId: '91-8841-3920-5819',
      name: 'Ramesh Jadhav',
      age: 58,
      gender: 'Male',
      maskedPhone: '+91 97654 *****',
      allergies: ['Dust / Pollen'],
      district: 'Nashik'
    },
    requestedMedicines: [
      {
        medicineId: 'MED-002',
        medicineName: 'Telmisartan Tablets IP 40mg',
        genericName: 'Telmisartan',
        strength: '40 mg',
        requestedQuantity: 30,
        availableQuantity: 250,
        reservedQuantity: 30,
        isAvailable: true
      },
      {
        medicineId: 'MED-003',
        medicineName: 'Amlodipine Besylate Tablets IP 5mg',
        genericName: 'Amlodipine',
        strength: '5 mg',
        requestedQuantity: 30,
        availableQuantity: 15,
        reservedQuantity: 30,
        isAvailable: true
      }
    ],
    reservationDateTime: '2026-09-06T09:30:00Z',
    collectionWindow: 'Today, 4:00 PM - 7:00 PM',
    estimatedCollectionTime: '2026-09-06T16:30:00Z',
    status: 'accepted',
    notes: 'Patient confirmed collection this evening.',
    pharmacistAssigned: 'Sunita Patil (PHA1001)'
  },
  {
    id: 'RSV-2026-102',
    prescriptionId: 'Rx-2026-0090',
    patient: {
      id: 'pt-003',
      abhaId: '91-3829-5501-9284',
      name: 'Sneha More',
      age: 27,
      gender: 'Female',
      maskedPhone: '+91 94211 *****',
      allergies: [],
      district: 'Nashik'
    },
    requestedMedicines: [
      {
        medicineId: 'MED-005',
        medicineName: 'Ferrous Ascorbate + Folic Acid Tablets',
        genericName: 'Iron (100mg) + Folic Acid (1.5mg)',
        strength: '100 mg / 1.5 mg',
        requestedQuantity: 30,
        availableQuantity: 38,
        reservedQuantity: 0,
        isAvailable: true
      }
    ],
    reservationDateTime: '2026-09-06T10:45:00Z',
    collectionWindow: 'Today, 2:00 PM - 6:00 PM',
    status: 'requested',
    notes: 'Submitted via Patient Android App.'
  },
  {
    id: 'RSV-2026-103',
    prescriptionId: 'Rx-2026-0091',
    patient: {
      id: 'pt-001',
      abhaId: '91-4829-1029-4821',
      name: 'Anita Patil',
      age: 42,
      gender: 'Female',
      maskedPhone: '+91 98230 *****',
      allergies: ['Penicillin', 'Amoxicillin'],
      district: 'Nashik'
    },
    requestedMedicines: [
      {
        medicineId: 'MED-001',
        medicineName: 'Paracetamol Tablets IP 650mg',
        genericName: 'Paracetamol',
        strength: '650 mg',
        requestedQuantity: 15,
        availableQuantity: 420,
        reservedQuantity: 15,
        isAvailable: true
      },
      {
        medicineId: 'MED-007',
        medicineName: 'Cetirizine Hydrochloride Tablets IP 10mg',
        genericName: 'Cetirizine',
        strength: '10 mg',
        requestedQuantity: 5,
        availableQuantity: 220,
        reservedQuantity: 5,
        isAvailable: true
      }
    ],
    reservationDateTime: '2026-09-06T08:15:00Z',
    collectionWindow: 'Today, 11:00 AM - 1:00 PM',
    estimatedCollectionTime: '2026-09-06T12:00:00Z',
    status: 'ready_for_collection',
    readyAt: '2026-09-06T09:10:00Z',
    notes: 'Packaged and kept at Counter 2 for collection.',
    pharmacistAssigned: 'Mahesh Jadhav (PHA1002)'
  },
  {
    id: 'RSV-2026-104',
    prescriptionId: 'Rx-2026-0092',
    patient: {
      id: 'pt-004',
      abhaId: '91-7712-4091-6352',
      name: 'Vikram Shinde',
      age: 63,
      gender: 'Male',
      maskedPhone: '+91 91580 *****',
      allergies: ['Sulfa Drugs'],
      district: 'Nashik'
    },
    requestedMedicines: [
      {
        medicineId: 'MED-004',
        medicineName: 'Metformin Hydrochloride Tablets IP 500mg',
        genericName: 'Metformin',
        strength: '500 mg',
        requestedQuantity: 30,
        availableQuantity: 360,
        reservedQuantity: 30,
        isAvailable: true
      }
    ],
    reservationDateTime: '2026-09-05T14:20:00Z',
    collectionWindow: 'Yesterday, 3:00 PM - 5:00 PM',
    status: 'collected',
    readyAt: '2026-09-05T14:40:00Z',
    collectedAt: '2026-09-05T16:15:00Z',
    notes: 'Collected by patient son (Santosh Shinde).',
    pharmacistAssigned: 'Sunita Patil (PHA1001)'
  },
  {
    id: 'RSV-2026-105',
    prescriptionId: 'Rx-2026-0078',
    patient: {
      id: 'pt-006',
      abhaId: '91-5509-3312-8874',
      name: 'Meena Kadam',
      age: 34,
      gender: 'Female',
      maskedPhone: '+91 98902 *****',
      allergies: [],
      district: 'Nashik'
    },
    requestedMedicines: [
      {
        medicineId: 'MED-006',
        medicineName: 'Azithromycin Tablets IP 500mg',
        genericName: 'Azithromycin',
        strength: '500 mg',
        requestedQuantity: 5,
        availableQuantity: 0,
        reservedQuantity: 0,
        isAvailable: false
      }
    ],
    reservationDateTime: '2026-09-04T11:00:00Z',
    collectionWindow: 'N/A',
    status: 'rejected',
    rejectionReason: 'Azithromycin 500mg currently out of stock. Indent placed with District Medical Store Depot.',
    notes: 'Patient advised to check Sub-District Hospital Igatpuri dispensary.',
    pharmacistAssigned: 'Sunita Patil (PHA1001)'
  }
];

export const INITIAL_DISPENSING_HISTORY: DispensingRecord[] = [
  {
    id: 'DSP-2026-001',
    receiptNumber: 'RCP-2026-0842',
    prescriptionId: 'Rx-2026-0092',
    reservationId: 'RSV-2026-104',
    patient: {
      id: 'pt-004',
      abhaId: '91-7712-4091-6352',
      name: 'Vikram Shinde',
      age: 63,
      gender: 'Male',
      maskedPhone: '+91 91580 *****',
      allergies: ['Sulfa Drugs'],
      district: 'Nashik'
    },
    collectorName: 'Santosh Shinde',
    collectorRelation: 'Family Member',
    collectorPhone: '+91 91580 *****',
    pharmacyName: 'Government Jan Aushadhi & PHC Dispensary Nashik',
    facilityCode: 'MH-PHA-101',
    pharmacistId: 'PHA1001',
    pharmacistName: 'Sunita Patil',
    pharmacistLicense: 'MH-PHAR-2016-7841',
    dispensedItems: [
      {
        medicineId: 'MED-004',
        genericName: 'Metformin',
        brandName: 'Metformin Hydrochloride Tablets IP',
        batchId: 'BTH-105',
        batchNumber: 'MET-9021-G',
        strength: '500 mg',
        dosageForm: 'Tablet',
        prescribedQuantity: 60,
        dispensedQuantity: 30,
        remainingQuantity: 30,
        unitPrice: 0.90,
        totalPrice: 27.00,
        instructions: '1 tablet twice daily after lunch and dinner.'
      },
      {
        medicineId: 'MED-008',
        genericName: 'Pantoprazole',
        brandName: 'Pantoprazole Gastro-resistant Tablets IP',
        batchId: 'BTH-109',
        batchNumber: 'PAN-1099-K',
        strength: '40 mg',
        dosageForm: 'Tablet',
        prescribedQuantity: 15,
        dispensedQuantity: 15,
        remainingQuantity: 0,
        unitPrice: 1.50,
        totalPrice: 22.50,
        instructions: '1 tablet daily before breakfast.'
      }
    ],
    dispensingType: 'partial',
    date: '2026-09-05',
    time: '16:15',
    totalAmount: 49.50,
    paymentMethod: 'Free (Jan Aushadhi / Govt Scheme)',
    dispensingNotes: 'Partial dispensing: 30 Metformin remaining against prescription. Advised return in 15 days.',
    status: 'completed'
  },
  {
    id: 'DSP-2026-002',
    receiptNumber: 'RCP-2026-0839',
    prescriptionId: 'Rx-2026-0093',
    patient: {
      id: 'pt-005',
      abhaId: '91-6201-9482-1130',
      name: 'Laxman Ghadge',
      age: 71,
      gender: 'Male',
      maskedPhone: '+91 99701 *****',
      allergies: [],
      district: 'Nashik'
    },
    collectorName: 'Laxman Ghadge',
    collectorRelation: 'Self',
    collectorPhone: '+91 99701 *****',
    pharmacyName: 'Government Jan Aushadhi & PHC Dispensary Nashik',
    facilityCode: 'MH-PHA-101',
    pharmacistId: 'PHA1002',
    pharmacistName: 'Mahesh Jadhav',
    pharmacistLicense: 'MH-PHAR-2020-4102',
    dispensedItems: [
      {
        medicineId: 'MED-009',
        genericName: 'ORS WHO Formula',
        brandName: 'Oral Rehydration Salts (ORS) IP',
        batchId: 'BTH-110',
        batchNumber: 'ORS-8812-H',
        strength: '20.5 g sachet',
        dosageForm: 'Powder',
        prescribedQuantity: 6,
        dispensedQuantity: 6,
        remainingQuantity: 0,
        unitPrice: 3.00,
        totalPrice: 18.00,
        instructions: 'Mix 1 sachet in 1 litre boiled and cooled drinking water.'
      }
    ],
    dispensingType: 'full',
    date: '2026-08-26',
    time: '11:40',
    totalAmount: 18.00,
    paymentMethod: 'Free (Jan Aushadhi / Govt Scheme)',
    dispensingNotes: 'Full dispensing completed. Demonstrated correct reconstitution technique to patient.',
    status: 'completed'
  }
];

export const INITIAL_STOCK_MOVEMENTS: StockMovement[] = [
  {
    id: 'SM-2026-001',
    batchId: 'BTH-101',
    medicineName: 'Paracetamol Tablets IP 650mg',
    batchNumber: 'PCM-2026-B1',
    type: 'initial_stock',
    quantityChange: 500,
    previousQuantity: 0,
    newQuantity: 500,
    reason: 'New stock received from District Medical Store Depot Nashik (Invoice #DMSD-891)',
    performedBy: 'Mahesh Jadhav (PHA1002)',
    timestamp: '2026-09-01T10:00:00Z'
  },
  {
    id: 'SM-2026-002',
    batchId: 'BTH-105',
    medicineName: 'Metformin Hydrochloride Tablets IP 500mg',
    batchNumber: 'MET-9021-G',
    type: 'dispensed',
    quantityChange: -30,
    previousQuantity: 390,
    newQuantity: 360,
    reason: 'Dispensed for Prescription Rx-2026-0092 (Patient: Vikram Shinde)',
    performedBy: 'Sunita Patil (PHA1001)',
    timestamp: '2026-09-05T16:15:00Z'
  },
  {
    id: 'SM-2026-003',
    batchId: 'BTH-109',
    medicineName: 'Pantoprazole Gastro-resistant Tablets IP 40mg',
    batchNumber: 'PAN-1099-K',
    type: 'dispensed',
    quantityChange: -15,
    previousQuantity: 205,
    newQuantity: 190,
    reason: 'Dispensed for Prescription Rx-2026-0092 (Patient: Vikram Shinde)',
    performedBy: 'Sunita Patil (PHA1001)',
    timestamp: '2026-09-05T16:15:00Z'
  },
  {
    id: 'SM-2026-004',
    batchId: 'BTH-113',
    medicineName: 'Doxycycline Capsules IP 100mg',
    batchNumber: 'DOX-OLD-99',
    type: 'expired_removal',
    quantityChange: 0,
    previousQuantity: 40,
    newQuantity: 40,
    reason: 'Batch expired on 15-Aug-2026. Flagged and quarantine locked for disposal audit.',
    performedBy: 'Sunita Patil (PHA1001)',
    timestamp: '2026-08-16T09:00:00Z'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationEvent[] = [
  {
    id: 'NOTIF-2026-01',
    recipientType: 'patient_android_app',
    targetId: 'pt-001',
    eventType: 'ready_for_collection',
    title: 'Medicines Ready for Collection',
    message: 'Your prescribed medicines for Reservation RSV-2026-103 are packed and ready at Government Jan Aushadhi Nashik.',
    timestamp: '2026-09-06T09:10:00Z',
    metadata: { reservationId: 'RSV-2026-103', pickupCounter: 'Counter 2' }
  },
  {
    id: 'NOTIF-2026-02',
    recipientType: 'patient_android_app',
    targetId: 'pt-002',
    eventType: 'reservation_accepted',
    title: 'Reservation Accepted',
    message: 'Jan Aushadhi Dispensary Nashik has reserved your medicines. Estimated collection window: Today 4:00 PM - 7:00 PM.',
    timestamp: '2026-09-06T09:35:00Z',
    metadata: { reservationId: 'RSV-2026-101' }
  },
  {
    id: 'NOTIF-2026-03',
    recipientType: 'doctor_portal',
    targetId: 'DOC1003',
    eventType: 'prescription_dispensed_sync',
    title: 'Prescription Partially Dispensed',
    message: 'Prescription Rx-2026-0092 (Vikram Shinde): 30 Metformin 500mg & 15 Pantoprazole 40mg dispensed.',
    timestamp: '2026-09-05T16:16:00Z',
    metadata: { prescriptionId: 'Rx-2026-0092', dispensingId: 'DSP-2026-001' }
  },
  {
    id: 'NOTIF-2026-04',
    recipientType: 'admin_portal',
    targetId: 'MH-ADMIN-01',
    eventType: 'stock_shortage_sync',
    title: 'Essential Medicine Shortage Alert',
    message: 'Aggregated Alert: Azithromycin 500mg is currently OUT OF STOCK at MH-PHA-101.',
    timestamp: '2026-09-05T08:35:00Z',
    metadata: { facilityCode: 'MH-PHA-101', genericName: 'Azithromycin' }
  }
];

export const INITIAL_AUDIT_EVENTS: AuditEvent[] = [
  {
    id: 'AUD-2026-01',
    timestamp: '2026-09-06T09:10:00Z',
    category: 'reservation',
    action: 'RESERVATION_MARKED_READY',
    performedBy: 'Mahesh Jadhav (PHA1002)',
    entityId: 'RSV-2026-103',
    details: 'Reservation RSV-2026-103 marked ready for collection for Anita Patil',
    facilityCode: 'MH-PHA-101'
  },
  {
    id: 'AUD-2026-02',
    timestamp: '2026-09-06T09:35:00Z',
    category: 'reservation',
    action: 'RESERVATION_ACCEPTED',
    performedBy: 'Sunita Patil (PHA1001)',
    entityId: 'RSV-2026-101',
    details: 'Reserved 30 Telmisartan 40mg and 30 Amlodipine 5mg for Ramesh Jadhav',
    facilityCode: 'MH-PHA-101'
  },
  {
    id: 'AUD-2026-03',
    timestamp: '2026-09-05T16:15:00Z',
    category: 'dispensing',
    action: 'SAFE_DISPENSING_COMPLETED',
    performedBy: 'Sunita Patil (PHA1001)',
    entityId: 'DSP-2026-001',
    details: 'Dispensed 30 Metformin 500mg and 15 Pantoprazole 40mg against Rx-2026-0092. Receipt #RCP-2026-0842 generated.',
    facilityCode: 'MH-PHA-101'
  },
  {
    id: 'AUD-2026-04',
    timestamp: '2026-09-04T11:05:00Z',
    category: 'reservation',
    action: 'RESERVATION_REJECTED',
    performedBy: 'Sunita Patil (PHA1001)',
    entityId: 'RSV-2026-105',
    details: 'Reservation rejected due to Azithromycin out-of-stock. Audit log and notification transmitted.',
    facilityCode: 'MH-PHA-101'
  }
];
