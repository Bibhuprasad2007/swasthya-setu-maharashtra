# Cloud Firestore Contract & Data Architecture
**Project:** Swasthya Setu Maharashtra (Healthcare Platform)  
**Target Clients:** React 18 + TypeScript Web App (Portals) & Flutter Mobile App (Patient)  
**Specification Version:** 1.0.0  

---

## 1. System Roles & Access Matrix

### Exact Role Strings
| Role String | Description | Accessible Client | Scope |
| :--- | :--- | :--- | :--- |
| `PATIENT` | Citizen / Patient receiving care | Flutter Mobile App | Own Auth UID (`patientId == request.auth.uid`) |
| `DOCTOR` | Clinical Doctor / Medical Officer | Web Clinical Portal | Own Facility (`facilityId == user.facilityId`) |
| `LAB_TECH` | Diagnostic Laboratory Technician | Web Diagnostic Portal | Own Facility (`facilityId == user.facilityId`) |
| `PHARMACIST` | Pharmacy / Drug Dispenser | Web Pharmacy Portal | Own Facility (`facilityId == user.facilityId`) |
| `STATE_ADMIN` | Government / State Health Directorate | Web State Governance Portal | State-wide sanitized events only (0 PII) |

---

## 2. Common Architectural Standards

1. **Document Identifiers:** All operational documents use auto-generated Firestore IDs (20-char alphanumeric). User profiles use the Firebase Auth UID as the document ID (`users/{uid}`).
2. **Naming Convention:** All fields use strict `camelCase`.
3. **Timestamps:** All time fields use native Firestore `Timestamp` objects (`FieldValue.serverTimestamp()` on write). Date strings must never be stored as primary timestamps.
4. **Audit Fields:** Every operational document MUST include `createdAt` (server timestamp) and `updatedAt` (server timestamp).
5. **Real-time Listeners:** Clients must use `onSnapshot()` scoped to specific query constraints (e.g. `where('facilityId', '==', facilityId)` or `where('patientId', '==', uid)`). Never listen to an unfiltered root collection.
6. **Immutable Records:** Once a `labReport` is marked `VERIFIED` or a `dispensing` is written, the document becomes strictly read-only in Firestore Security Rules.
7. **Atomic Operations:** Dispensing medicines and deducting stock MUST execute inside a Firestore transaction to prevent race conditions and negative inventory.

---

## 3. Shared Collections & Data Schemas

### 3.1 `users`
**Path:** `/users/{uid}`  
**Description:** System user profile and authorization record.  

```typescript
interface UserDocument {
  id: string; // Auth UID
  email: string;
  displayName: string;
  phone?: string;
  role: 'PATIENT' | 'DOCTOR' | 'LAB_TECH' | 'PHARMACIST' | 'STATE_ADMIN';
  facilityId?: string; // Required for DOCTOR, LAB_TECH, PHARMACIST (e.g. "MH-PHC-101")
  facilityName?: string;
  district?: string; // e.g. "Pune", "Nagpur", "Mumbai Suburban"
  department?: string; // e.g. "General Medicine", "Pathology"
  abhaId?: string; // For PATIENT role only (e.g. "91-1234-5678-9012")
  active: boolean; // Must be true to access the platform
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### 3.2 `patients`
**Path:** `/patients/{patientDocId}`  
**Description:** Registered patient records created by Doctors during OPD registration.  
**Written by:** Doctor Portal  
**Read by:** Doctor Portal (facility-scoped), Patient Flutter App (own record), State Admin (read-only)

```typescript
interface PatientDocument {
  id: string; // Firestore auto-generated
  patientId: string; // Human-readable ID (e.g. "MH-PUN-00001")
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  dob: string; // "YYYY-MM-DD"
  phone: string; // "+91 9876543210"
  address: string;
  village: string;
  taluka: string;
  district: string; // e.g. "Pune"
  bloodGroup: string; // e.g. "B+"
  emergencyContact: string;
  abhaId?: string; // ABHA Health ID (e.g. "91-1234-5678-9012")
  allergies: string[]; // e.g. ["Penicillin", "Sulfa"]
  conditions: string[]; // e.g. ["Diabetes Type 2", "Hypertension"]
  currentMedicines?: string[];
  isHighRisk: boolean;
  facilityId: string; // Registering facility (e.g. "MH-PHC-101")
  facilityName?: string;
  registeredDate: string; // "YYYY-MM-DD"
  lastVisitDate?: string;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### 3.3 `facilities`
**Path:** `/facilities/{facilityId}`  
**Description:** Registered hospitals, PHCs, diagnostic labs, and central pharmacies.

```typescript
interface FacilityDocument {
  id: string; // e.g. "MH-PHC-101"
  name: string; // "Aundh District Hospital"
  type: 'HOSPITAL' | 'LABORATORY' | 'PHARMACY' | 'ADMIN';
  district: string;
  taluka?: string;
  address: string;
  contactNumber: string;
  isActive: boolean;
  totalBeds?: number;
  availableBeds?: number;
  icuAvailable?: number;
  oxygenAvailableLiters?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### 3.3 `appointments`
**Path:** `/appointments/{appointmentId}`  
**Description:** OPD and clinical doctor appointments booked by patients or hospital reception.

```typescript
interface AppointmentDocument {
  id: string;
  patientId: string; // Auth UID
  patientName: string;
  patientPhone?: string;
  patientAbhaId?: string;
  facilityId: string; // e.g. "MH-PHC-101"
  facilityName: string;
  doctorId?: string; // Auth UID of assigned doctor
  doctorName?: string;
  department: string; // "General Medicine", "Cardiology", etc.
  appointmentAt: Timestamp; // Scheduled time
  reason: string;
  status: 'REQUESTED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  queueNumber?: number;
  cancellationReason?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### 3.4 `consultations`
**Path:** `/consultations/{consultationId}`  
**Description:** Clinical encounter summary created by the Doctor during an appointment.

```typescript
interface ConsultationDocument {
  id: string;
  appointmentId: string;
  patientId: string; // Auth UID
  doctorId: string; // Auth UID
  doctorName: string;
  facilityId: string;
  chiefComplaints: string[];
  diagnosis: string;
  clinicalNotes: string; // Private clinical note (Patient reads summary only, Admin never receives)
  visitSummary: string; // Patient-facing friendly summary
  instructions: string;
  followUpDate?: Timestamp;
  status: 'IN_PROGRESS' | 'COMPLETED';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### 3.5 `labOrders`
**Path:** `/labOrders/{labOrderId}`  
**Description:** Diagnostic lab test orders created by Doctors.

```typescript
interface LabOrderDocument {
  id: string;
  consultationId?: string;
  patientId: string;
  patientName: string;
  patientAbhaId?: string;
  doctorId: string;
  doctorName: string;
  facilityId: string; // Originating facility or processing lab facility
  testNames: string[]; // e.g. ["Complete Blood Count (CBC)", "Lipid Profile"]
  priority: 'NORMAL' | 'URGENT' | 'EMERGENCY';
  clinicalNotes?: string;
  status: 'ORDERED' | 'SAMPLE_COLLECTED' | 'PROCESSING' | 'VERIFIED' | 'CANCELLED';
  sampleId?: string;
  collectedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### 3.6 `labReports`
**Path:** `/labReports/{labReportId}`  
**Description:** Verified lab diagnostic reports. Immutable once verified.

```typescript
interface LabTestParameterResult {
  parameter: string; // e.g. "Hemoglobin"
  value: string | number; // "14.2"
  unit: string; // "g/dL"
  referenceRange: string; // "13.0 - 17.0"
  status: 'NORMAL' | 'LOW' | 'HIGH' | 'CRITICAL';
}

interface LabReportDocument {
  id: string;
  labOrderId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  labTechId: string; // Auth UID
  labTechName: string;
  facilityId: string;
  testName: string;
  results: LabTestParameterResult[];
  interpretation: string;
  isCritical: boolean;
  status: 'VERIFIED';
  verifiedAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### 3.7 `prescriptions`
**Path:** `/prescriptions/{prescriptionId}`  
**Description:** Digital prescriptions generated during consultation.

```typescript
interface PrescribedMedicine {
  medicineId: string;
  medicineName: string; // "Paracetamol 500mg"
  dosage: string; // "1 tablet"
  frequency: string; // "TID (3 times a day)"
  durationDays: number; // 5
  totalQuantity: number; // 15
  instructions: string; // "After meals"
}

interface PrescriptionDocument {
  id: string;
  consultationId: string;
  patientId: string;
  patientName: string;
  patientAbhaId?: string;
  doctorId: string;
  doctorName: string;
  facilityId: string;
  medicines: PrescribedMedicine[];
  instructions: string;
  status: 'ACTIVE' | 'PARTIALLY_DISPENSED' | 'DISPENSED' | 'EXPIRED' | 'CANCELLED';
  validUntil: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### 3.8 `medicineInventory`
**Path:** `/medicineInventory/{inventoryId}`  
**Description:** Pharmacy stock levels per facility.

```typescript
interface MedicineInventoryDocument {
  id: string;
  facilityId: string;
  medicineId: string;
  medicineName: string;
  genericName: string;
  category: 'ANALGESIC' | 'ANTIBIOTIC' | 'ANTIVIRAL' | 'ANTIDIABETIC' | 'CARDIOVASCULAR' | 'OTHER';
  batchNumber: string;
  stockQuantity: number; // Must never be negative
  reservedQuantity: number;
  unitPrice: number;
  reorderLevel: number;
  expiryDate: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### 3.9 `medicineReservations`
**Path:** `/medicineReservations/{reservationId}`  
**Description:** Reserved medicines requested by Patients from a specific Pharmacy.

```typescript
interface ReservedItem {
  medicineId: string;
  medicineName: string;
  quantityRequested: number;
  quantityAllocated: number;
}

interface MedicineReservationDocument {
  id: string;
  prescriptionId: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  facilityId: string; // Pharmacy facility
  items: ReservedItem[];
  status: 'REQUESTED' | 'CONFIRMED' | 'PARTIALLY_AVAILABLE' | 'READY' | 'DISPENSED' | 'CANCELLED';
  pickupDeadline?: Timestamp;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### 3.10 `dispensings`
**Path:** `/dispensings/{dispensingId}`  
**Description:** Immutable record of medicines handed over to the patient.

```typescript
interface DispensedItem {
  medicineId: string;
  medicineName: string;
  batchNumber: string;
  quantity: number;
}

interface DispensingDocument {
  id: string;
  prescriptionId: string;
  reservationId?: string;
  patientId: string;
  patientName: string;
  pharmacistId: string; // Auth UID
  pharmacistName: string;
  facilityId: string;
  items: DispensedItem[];
  dispensedAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### 3.11 `referrals`
**Path:** `/referrals/{referralId}`  
**Description:** Patient inter-facility referral management.

```typescript
interface ReferralDocument {
  id: string;
  patientId: string;
  patientName: string;
  patientAbhaId?: string;
  fromFacilityId: string;
  fromFacilityName: string;
  toFacilityId: string;
  toFacilityName: string;
  referringDoctorId: string;
  referringDoctorName: string;
  receivingDoctorId?: string;
  priority: 'ROUTINE' | 'URGENT' | 'CRITICAL';
  specialtyRequired: string;
  reasonForReferral: string;
  clinicalSummary: string;
  status: 'CREATED' | 'SENT' | 'ACCEPTED' | 'APPOINTMENT_SCHEDULED' | 'COMPLETED' | 'REJECTED';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### 3.12 `followUps`
**Path:** `/followUps/{followUpId}`  
**Description:** Doctor-scheduled post-treatment follow-up checks.

```typescript
interface FollowUpDocument {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  facilityId: string;
  scheduledDate: Timestamp;
  notes: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'MISSED' | 'RESCHEDULED';
  patientResponse?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### 3.13 `teleconsultations`
**Path:** `/teleconsultations/{teleId}`  
**Description:** Video consultation sessions between Doctor and Patient.

```typescript
interface TeleconsultationDocument {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  facilityId: string;
  appointmentId?: string;
  scheduledTime: Timestamp;
  meetingLink: string; // Accessible ONLY by assigned Doctor and Patient
  status: 'REQUESTED' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### 3.14 `notifications`
**Path:** `/notifications/{notificationId}`  
**Description:** Real-time push/inbox alerts for users.

```typescript
interface NotificationDocument {
  id: string;
  userId: string; // Auth UID of recipient
  type: 'APPOINTMENT' | 'LAB_REPORT' | 'PRESCRIPTION' | 'RESERVATION' | 'REFERRAL' | 'SYSTEM';
  title: string;
  message: string;
  referenceId?: string; // ID of the referenced document
  read: boolean;
  createdAt: Timestamp;
}
```

---

### 3.15 `operationalEvents` (Admin Privacy Compliant)
**Path:** `/operationalEvents/{eventId}`  
**Description:** Sanitized operational telemetry for State Governance. STRICTLY ZERO PII.

```typescript
interface OperationalEventDocument {
  id: string;
  eventType: 'APPOINTMENT_COMPLETED' | 'CONSULTATION_HELD' | 'LAB_REPORT_VERIFIED' | 'MEDICINE_DISPENSED' | 'REFERRAL_TRANSFERRED' | 'CRITICAL_ALERT';
  facilityId: string;
  district: string;
  status: string;
  actorRole: 'DOCTOR' | 'LAB_TECH' | 'PHARMACIST';
  createdAt: Timestamp;
}
```

---

### 3.16 `alerts` & `adminSummaries`
**Path:** `/alerts/{alertId}`  
**Description:** Facility stockout, epidemic, or load warnings for Admin.

```typescript
interface AlertDocument {
  id: string;
  facilityId: string;
  facilityName: string;
  district: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  title: string;
  description: string;
  resolved: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### 3.17 `auditLogs`
**Path:** `/auditLogs/{auditId}`  
**Description:** Security and compliance access logs.

```typescript
interface AuditLogDocument {
  id: string;
  userId: string;
  userRole: string;
  facilityId?: string;
  action: string;
  resource: string;
  status: 'SUCCESS' | 'FAILED';
  createdAt: Timestamp;
}
```
