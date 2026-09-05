/**
 * Centralized Initial Mock Dataset for Hospital / Doctor Portal
 * SwasthyaSetu Maharashtra - Integrated Rural Healthcare Network
 *
 * NOTE FOR SIH EVALUATION:
 * All patient records, diagnoses, and IDs in this dataset are fictional demo instances
 * designed for clinical workflow simulation and prototype validation.
 */

import {
  PatientRecord,
  AppointmentItem,
  QueuePatientItem,
  ConsultationRecord,
  PrescriptionRecord,
  LabOrderItem,
  ReferralItem,
  TeleconsultSession,
  FollowUpItem,
  FacilityCapacity
} from '../types/doctor';

export const INITIAL_PATIENTS: PatientRecord[] = [
  {
    id: 'pt-001',
    patientId: 'MH-PUN-00101',
    name: 'Anita Patil',
    age: 42,
    gender: 'Female',
    dob: '1984-06-12',
    phone: '+91 98230 11234',
    address: 'Near Gram Panchayat, Khed',
    village: 'Khed Budruk',
    taluka: 'Khed',
    district: 'Pune',
    bloodGroup: 'B+',
    emergencyContact: 'Santosh Patil (+91 98230 11235 - Husband)',
    abhaId: '91-4829-1029-4821',
    allergies: ['Penicillin', 'Sulfa drugs'],
    conditions: ['Type 2 Diabetes', 'Hypertension'],
    currentMedicines: ['Metformin 500mg (1-0-1)', 'Amlodipine 5mg (1-0-0)'],
    isHighRisk: true,
    registeredDate: '2025-01-10',
    lastVisitDate: '2026-09-01',
    vitals: {
      temperature: '101.4',
      bpSys: '130',
      bpDia: '85',
      pulse: '84',
      spo2: '98',
      respiratoryRate: '18',
      height: '158',
      weight: '64',
      bloodSugar: '148'
    },
    notes: 'Requires close glycemic monitoring. Reported fever since 2 days.'
  },
  {
    id: 'pt-002',
    patientId: 'MH-PUN-00102',
    name: 'Ramesh Jadhav',
    age: 58,
    gender: 'Male',
    dob: '1968-03-24',
    phone: '+91 97654 22345',
    address: 'Plot 14, Vitthal Mandir Galli',
    village: 'Chakan Rural',
    taluka: 'Khed',
    district: 'Pune',
    bloodGroup: 'O+',
    emergencyContact: 'Sachin Jadhav (+91 97654 22346 - Son)',
    abhaId: '91-8841-3920-5819',
    allergies: ['None known'],
    conditions: ['Hypertension', 'Mild Osteoarthritis'],
    currentMedicines: ['Telmisartan 40mg (1-0-0)'],
    isHighRisk: false,
    registeredDate: '2024-11-15',
    lastVisitDate: '2026-08-20',
    vitals: {
      temperature: '98.4',
      bpSys: '148',
      bpDia: '92',
      pulse: '78',
      spo2: '97',
      respiratoryRate: '16',
      height: '170',
      weight: '76',
      bloodSugar: '112'
    },
    notes: 'Routine blood-pressure review. Complains of mild morning dizziness.'
  },
  {
    id: 'pt-003',
    patientId: 'MH-PUN-00103',
    name: 'Sneha More',
    age: 27,
    gender: 'Female',
    dob: '1999-09-18',
    phone: '+91 94211 33456',
    address: 'Wadgaon Road, House 8',
    village: 'Alandi Rural',
    taluka: 'Haveli',
    district: 'Pune',
    bloodGroup: 'A+',
    emergencyContact: 'Pooja More (+91 94211 33457 - Sister)',
    abhaId: '91-3829-5501-9284',
    allergies: ['Aspirin'],
    conditions: ['Iron Deficiency Anemia (Mild)'],
    currentMedicines: ['Ferrous Ascorbate + Folic Acid (0-1-0)'],
    isHighRisk: false,
    registeredDate: '2025-08-04',
    lastVisitDate: '2026-08-28',
    vitals: {
      temperature: '98.6',
      bpSys: '118',
      bpDia: '76',
      pulse: '74',
      spo2: '99',
      respiratoryRate: '16',
      height: '162',
      weight: '52',
      bloodSugar: '95'
    },
    notes: 'Follow-up on hemoglobin improvement post 1-month iron therapy.'
  },
  {
    id: 'pt-004',
    patientId: 'MH-PUN-00104',
    name: 'Prakash Shinde',
    age: 64,
    gender: 'Male',
    dob: '1962-11-05',
    phone: '+91 98901 44567',
    address: 'Bhimashankar Road, Khed',
    village: 'Chas',
    taluka: 'Khed',
    district: 'Pune',
    bloodGroup: 'AB+',
    emergencyContact: 'Sunil Shinde (+91 98901 44568 - Son)',
    abhaId: '91-5502-9182-3741',
    allergies: ['Ibuprofen'],
    conditions: ['COPD (Mild)', 'Chronic Gastritis'],
    currentMedicines: ['Salbutamol Inhaler (PRN)', 'Pantoprazole 40mg (1-0-0)'],
    isHighRisk: true,
    registeredDate: '2024-05-12',
    lastVisitDate: '2026-08-15',
    vitals: {
      temperature: '98.8',
      bpSys: '136',
      bpDia: '84',
      pulse: '82',
      spo2: '95',
      respiratoryRate: '20',
      height: '166',
      weight: '61',
      bloodSugar: '105'
    },
    notes: 'Complains of seasonal cough and breathlessness on exertion.'
  },
  {
    id: 'pt-005',
    patientId: 'MH-PUN-00105',
    name: 'Sunita Kadam',
    age: 31,
    gender: 'Female',
    dob: '1995-02-14',
    phone: '+91 93700 55678',
    address: 'Zilla Parishad School Lane',
    village: 'Rajgurunagar',
    taluka: 'Khed',
    district: 'Pune',
    bloodGroup: 'O+',
    emergencyContact: 'Vijay Kadam (+91 93700 55679 - Husband)',
    abhaId: '91-7719-2041-8833',
    allergies: ['None known'],
    conditions: ['Antenatal Care - 28 Weeks Gestation'],
    currentMedicines: ['Calcium + Vit D3', 'Iron Folic Acid'],
    isHighRisk: true,
    registeredDate: '2026-03-10',
    lastVisitDate: '2026-08-25',
    vitals: {
      temperature: '98.4',
      bpSys: '124',
      bpDia: '80',
      pulse: '86',
      spo2: '99',
      respiratoryRate: '18',
      height: '155',
      weight: '59',
      bloodSugar: '98'
    },
    notes: 'ANC 3rd Trimester high-risk follow-up for blood pressure and fetal growth.'
  },
  {
    id: 'pt-006',
    patientId: 'MH-PUN-00106',
    name: 'Ganesh Gaikwad',
    age: 50,
    gender: 'Male',
    dob: '1976-07-29',
    phone: '+91 91580 66789',
    address: 'Market Yard Chowk',
    village: 'Manchar Rural',
    taluka: 'Ambegaon',
    district: 'Pune',
    bloodGroup: 'B+',
    emergencyContact: 'Meena Gaikwad (+91 91580 66790 - Wife)',
    abhaId: '91-1029-4820-9912',
    allergies: ['Ciprofloxacin'],
    conditions: ['Post-Op Hernia Repair (Day 14)'],
    currentMedicines: ['Paracetamol 650mg SOS', 'Multivitamin'],
    isHighRisk: false,
    registeredDate: '2026-08-10',
    lastVisitDate: '2026-08-24',
    vitals: {
      temperature: '98.2',
      bpSys: '120',
      bpDia: '80',
      pulse: '72',
      spo2: '98',
      respiratoryRate: '16',
      height: '172',
      weight: '70',
      bloodSugar: '100'
    },
    notes: 'Wound inspection normal. Stitches removed.'
  }
];

export const INITIAL_APPOINTMENTS: AppointmentItem[] = [
  {
    id: 'apt-101',
    patientId: 'pt-001',
    patientName: 'Anita Patil',
    date: '2026-09-06',
    time: '10:00 AM',
    type: 'in_person',
    department: 'General Medicine',
    doctorName: 'Dr. Ananya Kulkarni (MBBS, MD)',
    reason: 'Fever and general weakness for 2 days',
    status: 'checked_in',
    notes: 'Checked in at OPD desk. Added to Live Queue token A-021.',
    queueToken: 'A-021'
  },
  {
    id: 'apt-102',
    patientId: 'pt-002',
    patientName: 'Ramesh Jadhav',
    date: '2026-09-06',
    time: '10:30 AM',
    type: 'in_person',
    department: 'General Medicine',
    doctorName: 'Dr. Ananya Kulkarni (MBBS, MD)',
    reason: 'Blood pressure monthly review',
    status: 'checked_in',
    notes: 'Checked in. Assigned token A-022.',
    queueToken: 'A-022'
  },
  {
    id: 'apt-103',
    patientId: 'pt-003',
    patientName: 'Sneha More',
    date: '2026-09-06',
    time: '11:00 AM',
    type: 'follow_up',
    department: 'General Medicine',
    doctorName: 'Dr. Ananya Kulkarni (MBBS, MD)',
    reason: 'Anemia follow-up & lab report review',
    status: 'checked_in',
    notes: 'Checked in. Assigned token A-023.',
    queueToken: 'A-023'
  },
  {
    id: 'apt-104',
    patientId: 'pt-004',
    patientName: 'Prakash Shinde',
    date: '2026-09-06',
    time: '11:30 AM',
    type: 'teleconsultation',
    department: 'Rural Health Tele-OPD',
    doctorName: 'Dr. Ananya Kulkarni (MBBS, MD)',
    reason: 'COPD breathlessness check via Chas Sub-Centre link',
    status: 'confirmed',
    notes: 'Video session scheduled with Chas Sub-Centre ANM.'
  },
  {
    id: 'apt-105',
    patientId: 'pt-005',
    patientName: 'Sunita Kadam',
    date: '2026-09-06',
    time: '12:15 PM',
    type: 'follow_up',
    department: 'Obstetrics & Maternal Care',
    doctorName: 'Dr. Ananya Kulkarni (MBBS, MD)',
    reason: 'ANC 28-week high-risk follow-up',
    status: 'scheduled',
    notes: 'Patient arriving by 12 noon.'
  },
  {
    id: 'apt-106',
    patientId: 'pt-006',
    patientName: 'Ganesh Gaikwad',
    date: '2026-09-06',
    time: '01:00 PM',
    type: 'in_person',
    department: 'Post-Op Surgical Care',
    doctorName: 'Dr. Ananya Kulkarni (MBBS, MD)',
    reason: 'Surgical follow-up stitch line check',
    status: 'scheduled',
    notes: 'Post-hernia recovery review.'
  }
];

export const INITIAL_QUEUE: QueuePatientItem[] = [
  {
    id: 'q-001',
    token: 'A-021',
    patientId: 'pt-001',
    patientName: 'Anita Patil',
    age: 42,
    gender: 'Female',
    reason: 'Fever and weakness (T: 101.4°F)',
    checkInTime: '09:45 AM',
    waitingMinutes: 5,
    priority: 'high',
    doctorName: 'Dr. Ananya Kulkarni (MBBS, MD)',
    status: 'waiting',
    abhaId: '91-4829-1029-4821',
    vitalSummary: 'BP: 130/85 mmHg | Temp: 101.4°F | SpO2: 98%',
    vitals: {
      temperature: '101.4',
      bpSys: '130',
      bpDia: '85',
      pulse: '84',
      spo2: '98',
      bloodSugar: '148'
    }
  },
  {
    id: 'q-002',
    token: 'A-022',
    patientId: 'pt-002',
    patientName: 'Ramesh Jadhav',
    age: 58,
    gender: 'Male',
    reason: 'Blood-pressure review',
    checkInTime: '09:50 AM',
    waitingMinutes: 12,
    priority: 'normal',
    doctorName: 'Dr. Ananya Kulkarni (MBBS, MD)',
    status: 'waiting',
    abhaId: '91-8841-3920-5819',
    vitalSummary: 'BP: 148/92 mmHg | Pulse: 78 bpm | SpO2: 97%',
    vitals: {
      temperature: '98.4',
      bpSys: '148',
      bpDia: '92',
      pulse: '78',
      spo2: '97'
    }
  },
  {
    id: 'q-003',
    token: 'A-023',
    patientId: 'pt-003',
    patientName: 'Sneha More',
    age: 27,
    gender: 'Female',
    reason: 'Follow-up consultation',
    checkInTime: '09:55 AM',
    waitingMinutes: 18,
    priority: 'normal',
    doctorName: 'Dr. Ananya Kulkarni (MBBS, MD)',
    status: 'waiting',
    abhaId: '91-3829-5501-9284',
    vitalSummary: 'BP: 118/76 mmHg | Temp: 98.6°F | SpO2: 99%',
    vitals: {
      temperature: '98.6',
      bpSys: '118',
      bpDia: '76',
      pulse: '74',
      spo2: '99'
    }
  }
];

export const INITIAL_PRESCRIPTIONS: PrescriptionRecord[] = [
  {
    id: 'Rx-2026-0089',
    patientId: 'pt-002',
    patientName: 'Ramesh Jadhav',
    doctorId: 'DOC1001',
    doctorName: 'Dr. Ananya Kulkarni (MBBS, MD)',
    facilityName: 'Primary Health Centre (PHC) Khed',
    date: '2026-09-01',
    diagnosis: 'Primary Essential Hypertension (Stage 1)',
    status: 'finalized',
    instructions: 'Monitor morning BP before taking medication. Avoid high sodium diet.',
    allergiesChecked: true,
    medicines: [
      {
        id: 'med-1',
        medicineName: 'Telmisartan Tablets IP',
        genericName: 'Telmisartan',
        strength: '40 mg',
        dosage: '1 tablet',
        frequency: 'Once daily (1-0-0)',
        route: 'Oral',
        duration: '30 days',
        quantity: 30,
        timing: 'before_food',
        instructions: 'Take every morning at the same time.'
      },
      {
        id: 'med-2',
        medicineName: 'Amlodipine Besylate Tablets IP',
        genericName: 'Amlodipine',
        strength: '5 mg',
        dosage: '1 tablet',
        frequency: 'Once daily (0-0-1)',
        route: 'Oral',
        duration: '30 days',
        quantity: 30,
        timing: 'after_food',
        instructions: 'Take at night if evening BP rises.'
      }
    ]
  },
  {
    id: 'Rx-2026-0090',
    patientId: 'pt-003',
    patientName: 'Sneha More',
    doctorId: 'DOC1001',
    doctorName: 'Dr. Ananya Kulkarni (MBBS, MD)',
    facilityName: 'Primary Health Centre (PHC) Khed',
    date: '2026-08-28',
    diagnosis: 'Microcytic Hypochromic Anemia',
    status: 'finalized',
    instructions: 'Include leafy greens, jaggery and citrus fruits in diet.',
    allergiesChecked: true,
    medicines: [
      {
        id: 'med-3',
        medicineName: 'Ferrous Ascorbate + Folic Acid Tablets',
        genericName: 'Iron (100mg) + Folic Acid (1.5mg)',
        strength: '100 mg / 1.5 mg',
        dosage: '1 tablet',
        frequency: 'Once daily (0-1-0)',
        route: 'Oral',
        duration: '30 days',
        quantity: 30,
        timing: 'after_food',
        instructions: 'Do not take with milk or tea.'
      }
    ]
  }
];

export const INITIAL_LAB_ORDERS: LabOrderItem[] = [
  {
    id: 'LAB-ORD-101',
    patientId: 'pt-001',
    patientName: 'Anita Patil',
    doctorName: 'Dr. Ananya Kulkarni (MBBS, MD)',
    diagnosticCentre: 'Satara District Integrated Diagnostic Unit',
    testCategory: 'Biochemistry & Hematology',
    tests: ['Complete Blood Count (CBC)', 'Glycated Hemoglobin (HbA1c)', 'Widal Test (Slide Agglutination)'],
    clinicalReason: 'Acute fever with chills and uncontrolled type 2 diabetes check',
    urgency: 'urgent',
    sampleType: 'Whole Blood (EDTA) & Serum',
    fastingRequired: false,
    orderDate: '2026-09-05',
    status: 'report_ready',
    criticalIndicator: true,
    demoPdfFileName: 'LabReport_AnitaPatil_CBC_HbA1c.pdf',
    reportResults: [
      { testName: 'Hemoglobin', value: '11.2', unit: 'g/dL', referenceRange: '12.0 - 15.0', isCritical: false },
      { testName: 'Total Leukocyte Count (TLC)', value: '13,800', unit: '/cu mm', referenceRange: '4,000 - 11,000', isCritical: true },
      { testName: 'HbA1c', value: '8.6', unit: '%', referenceRange: '< 5.7', isCritical: true },
      { testName: 'Widal S. Typhi O', value: '1:160', unit: 'titer', referenceRange: '< 1:80', isCritical: true }
    ],
    instructions: 'Review elevated TLC and glycemic spikes. Consider empirical antibiotic cover.'
  },
  {
    id: 'LAB-ORD-102',
    patientId: 'pt-002',
    patientName: 'Ramesh Jadhav',
    doctorName: 'Dr. Ananya Kulkarni (MBBS, MD)',
    diagnosticCentre: 'PHC Khed In-House Pathology Lab',
    testCategory: 'Renal & Lipid Profile',
    tests: ['Serum Creatinine', 'Serum Electrolytes (Na+, K+)', 'Lipid Profile'],
    clinicalReason: 'Hypertension annual organ-damage assessment',
    urgency: 'routine',
    sampleType: 'Serum (Fasting)',
    fastingRequired: true,
    orderDate: '2026-09-04',
    status: 'processing',
    instructions: '12 hours overnight fasting confirmed.'
  },
  {
    id: 'LAB-ORD-103',
    patientId: 'pt-003',
    patientName: 'Sneha More',
    doctorName: 'Dr. Ananya Kulkarni (MBBS, MD)',
    diagnosticCentre: 'PHC Khed In-House Pathology Lab',
    testCategory: 'Hematology',
    tests: ['Hemoglobin (Hb)', 'Peripheral Blood Smear'],
    clinicalReason: 'Post iron-supplementation 30-day response review',
    urgency: 'routine',
    sampleType: 'Capillary / EDTA Blood',
    fastingRequired: false,
    orderDate: '2026-09-02',
    status: 'report_ready',
    criticalIndicator: false,
    demoPdfFileName: 'LabReport_SnehaMore_Hb.pdf',
    reportResults: [
      { testName: 'Hemoglobin', value: '11.8', unit: 'g/dL', referenceRange: '12.0 - 15.0', isCritical: false },
      { testName: 'RBC Count', value: '4.2', unit: 'mil/cu mm', referenceRange: '3.8 - 4.8', isCritical: false }
    ],
    instructions: 'Hb improved from 9.4 to 11.8 g/dL. Continue maintenance therapy.'
  },
  {
    id: 'LAB-ORD-104',
    patientId: 'pt-005',
    patientName: 'Sunita Kadam',
    doctorName: 'Dr. Ananya Kulkarni (MBBS, MD)',
    diagnosticCentre: 'Satara District Integrated Diagnostic Unit',
    testCategory: 'Obstetric Diagnostics',
    tests: ['Oral Glucose Challenge Test (OGTT)', 'Urine Routine & Microscopic (Protein)'],
    clinicalReason: 'ANC 28-week Gestational Diabetes and Preeclampsia screening',
    urgency: 'urgent',
    sampleType: 'Plasma (Fluoride) & Fresh Mid-Stream Urine',
    fastingRequired: true,
    orderDate: '2026-09-05',
    status: 'accepted',
    instructions: 'Sample collection scheduled at 10 AM.'
  }
];

export const INITIAL_REFERRALS: ReferralItem[] = [
  {
    id: 'REF-2026-0041',
    patientId: 'pt-004',
    patientName: 'Prakash Shinde',
    referringDoctor: 'Dr. Ananya Kulkarni (MBBS, MD)',
    referringFacility: 'Primary Health Centre (PHC) Khed',
    receivingFacility: 'Pune District Civil Hospital / Aundh Chest Hospital',
    department: 'Pulmonary Medicine & Respiratory Care',
    specialist: 'Dr. V. M. Joshi (Chest Physician)',
    referralReason: 'Spirometry and advanced evaluation for suspected progressive COPD',
    clinicalSummary: '64-year-old male with persistent dyspnea, wheezing on exertion and SpO2 95% on room air. Bronchodilators provide partial relief.',
    provisionalDiagnosis: 'Chronic Obstructive Pulmonary Disease (COPD) Grade II with Bronchospasm',
    urgency: 'urgent',
    preferredDate: '2026-09-10',
    transportRequired: true,
    status: 'sent',
    doctorNotes: 'Transport support requested via 108 ambulance referral desk.',
    createdDate: '2026-09-04'
  },
  {
    id: 'REF-2026-0042',
    patientId: 'pt-005',
    patientName: 'Sunita Kadam',
    referringDoctor: 'Dr. Ananya Kulkarni (MBBS, MD)',
    referringFacility: 'Primary Health Centre (PHC) Khed',
    receivingFacility: 'Sassoon General Hospital & BJ Government Medical College, Pune',
    department: 'High-Risk Obstetrics & Fetal Medicine',
    specialist: 'OBGYN Unit III',
    referralReason: 'High-risk primigravida 28 weeks with borderline elevated BP and mild proteinuria risk',
    clinicalSummary: 'ANC follow-up identified blood pressure trending 130/85 mmHg. Requires detailed anomaly ultrasound and Doppler study.',
    provisionalDiagnosis: 'High-Risk Pregnancy (Gestational Hypertension Monitoring)',
    urgency: 'routine',
    preferredDate: '2026-09-12',
    transportRequired: false,
    status: 'accepted',
    doctorNotes: 'Accepted by Unit III. Scheduled for Doppler USG on Sept 12.',
    receivingOutcome: 'Slot confirmed at Sassoon OBGYN OPD Chamber 4.',
    createdDate: '2026-09-03'
  }
];

export const INITIAL_TELECONSULTATIONS: TeleconsultSession[] = [
  {
    id: 'TELE-2026-012',
    patientId: 'pt-004',
    patientName: 'Prakash Shinde',
    scheduledTime: '11:30 AM',
    durationMinutes: 15,
    department: 'Rural Health Tele-OPD',
    doctorName: 'Dr. Ananya Kulkarni (MBBS, MD)',
    status: 'scheduled',
    channelName: 'MH-CHAS-SUB-TELE-01',
    meetingLink: 'https://telemed.swasthyasetu.gov.in/room/chas-sub-centre-01',
    notes: 'Connecting with ANM Sunita at Chas Sub-Centre for chest auscultation verification.',
    symptoms: 'Seasonal cough with exertion breathlessness'
  },
  {
    id: 'TELE-2026-013',
    patientId: 'pt-002',
    patientName: 'Ramesh Jadhav',
    scheduledTime: '02:30 PM',
    durationMinutes: 15,
    department: 'Chronic Disease Tele-Review',
    doctorName: 'Dr. Ananya Kulkarni (MBBS, MD)',
    status: 'scheduled',
    channelName: 'MH-CHAKAN-SUB-02',
    meetingLink: 'https://telemed.swasthyasetu.gov.in/room/chakan-sub-02',
    notes: 'Home BP log review via CHO smartphone connect.',
    symptoms: 'Morning dizziness review'
  }
];

export const INITIAL_FOLLOW_UPS: FollowUpItem[] = [
  {
    id: 'FUP-2026-081',
    patientId: 'pt-001',
    patientName: 'Anita Patil',
    reason: 'Fever defervescence and glycemic stabilization review',
    dueDate: '2026-09-08',
    riskLevel: 'high',
    category: 'chronic_care',
    assignedWorker: 'ASHA Tai (Khed Ward 2)',
    reminderStatus: 'sent',
    completionStatus: 'pending',
    createdDate: '2026-09-05',
    lastContactedDate: '2026-09-05',
    notes: 'ASHA notified to verify morning temperature and fasting blood sugar.'
  },
  {
    id: 'FUP-2026-082',
    patientId: 'pt-005',
    patientName: 'Sunita Kadam',
    reason: 'ANC 28-week maternal vitals and fetal movement count',
    dueDate: '2026-09-06',
    riskLevel: 'high',
    category: 'maternal_child',
    assignedWorker: 'ANM Rekha Gaikwad',
    reminderStatus: 'sent',
    completionStatus: 'pending',
    createdDate: '2026-09-01',
    lastContactedDate: '2026-09-05',
    notes: 'High-risk alert active. BP measurement due today.'
  },
  {
    id: 'FUP-2026-083',
    patientId: 'pt-006',
    patientName: 'Ganesh Gaikwad',
    reason: 'Post-op 21-day wound scar and heavy-lifting clearance',
    dueDate: '2026-09-14',
    riskLevel: 'low',
    category: 'post_op',
    assignedWorker: 'PHC Staff Nurse Varsha',
    reminderStatus: 'pending',
    completionStatus: 'pending',
    createdDate: '2026-08-24',
    notes: 'Final surgical clearance check.'
  }
];

export const INITIAL_FACILITY_CAPACITY: FacilityCapacity = {
  facilityName: 'Primary Health Centre (PHC) Khed',
  facilityCode: 'MH-PHC-101',
  district: 'Pune Rural',
  staff: {
    doctorsOnDuty: 4,
    nursesAvailable: 8,
    specialistsAvailable: 2,
    currentWorkload: 'Moderate',
    shiftStatus: 'Morning General Shift (08:00 - 16:00)'
  },
  services: {
    opd: 'Operational',
    emergency: 'Operational',
    teleconsultation: 'Online',
    laboratory: 'Processing',
    pharmacy: 'Dispensing'
  },
  infrastructure: {
    totalBeds: 24,
    availableBeds: 11,
    ambulancesAvailable: 2,
    oxygenCylinders: 18,
    powerBackup: 'Active (Main Grid)',
    internetConnectivity: 'High Speed Fiber (ABDM Connected)'
  },
  equipment: [
    { id: 'eq-1', name: 'Digital ECG Machine (12-Lead)', category: 'Cardiology', status: 'Available', location: 'Emergency Room 1', lastInspection: '2026-09-01' },
    { id: 'eq-2', name: 'Automatic Hematology Analyzer (3-Part)', category: 'Laboratory', status: 'In Use', location: 'Pathology Lab', lastInspection: '2026-08-28' },
    { id: 'eq-3', name: 'Pulse Oximeter & Multipara Monitor', category: 'Emergency', status: 'Available', location: 'Observation Ward', lastInspection: '2026-09-04' },
    { id: 'eq-4', name: 'Dental Chair & Ultrasonic Scaler', category: 'Dental OPD', status: 'Maintenance', location: 'Dental Clinic', lastInspection: '2026-09-02' },
    { id: 'eq-5', name: 'Telemedicine High-Definition Camera & Hub', category: 'Tele-Health', status: 'Available', location: 'Tele-Consult Chamber', lastInspection: '2026-09-05' }
  ],
  lastUpdated: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ', Today'
};

export const INITIAL_CONSULTATIONS: ConsultationRecord[] = [
  {
    id: 'CONS-2026-0089',
    patientId: 'pt-002',
    patientName: 'Ramesh Jadhav',
    doctorId: 'DOC1001',
    doctorName: 'Dr. Ananya Kulkarni (MBBS, MD)',
    date: '2026-09-01',
    chiefComplaint: 'Morning dizziness and headache',
    symptoms: ['Mild headache', 'Occasional lightheadedness', 'No chest pain'],
    duration: '1 week',
    severity: 'moderate',
    patientNotes: 'Missed evening dose two days last week due to travel.',
    vitals: {
      temperature: '98.4',
      bpSys: '150',
      bpDia: '94',
      pulse: '80',
      spo2: '97',
      respiratoryRate: '16',
      height: '170',
      weight: '76',
      bloodSugar: '112'
    },
    examinationNotes: 'Chest clear bilaterally, S1 S2 heard normal. No pedal edema.',
    provisionalDiagnosis: 'Uncontrolled Primary Essential Hypertension',
    finalDiagnosis: 'Essential Hypertension (Stage 1 with poor adherence)',
    clinicalAdvice: 'Counselled on strict medication adherence. Reduced dietary salt. Daily 30-min brisk walk.',
    privateNotes: 'Check renal profile on next visit.',
    status: 'finalized',
    prescriptionId: 'Rx-2026-0089',
    followUpId: 'FUP-2026-084'
  }
];
