/**
 * Pharmacy Portal Type Definitions
 * SwasthyaSetu Maharashtra - Integrated Rural Healthcare Network
 */

export type StockStatus = 'available' | 'low_stock' | 'out_of_stock' | 'near_expiry' | 'expired';

export type DosageForm = 
  | 'Tablet' 
  | 'Capsule' 
  | 'Syrup' 
  | 'Injection' 
  | 'Ointment' 
  | 'Drops' 
  | 'Inhaler' 
  | 'Suspension'
  | 'Powder';

export type PrescriptionStatus = 
  | 'finalized' 
  | 'partially_dispensed' 
  | 'fully_dispensed' 
  | 'cancelled' 
  | 'expired';

export type ReservationStatus = 
  | 'requested' 
  | 'accepted' 
  | 'partially_available' 
  | 'ready_for_collection' 
  | 'collected' 
  | 'rejected' 
  | 'cancelled' 
  | 'expired';

export type DispensingType = 'full' | 'partial';

export interface PharmacyFacility {
  id: string;
  name: string;
  licenseNumber: string;
  type: 'phc_dispensary' | 'hospital_pharmacy' | 'jan_aushadhi' | 'community_health_counter';
  facilityCode: string;
  district: string;
  state: string;
  address: string;
  contactPhone: string;
  inChargePharmacist: string;
}

export interface PharmacistInfo {
  id: string;
  name: string;
  licenseNumber: string;
  role: string;
  facilityCode: string;
  facilityName: string;
  contactEmail: string;
  contactPhone: string;
}

export interface PatientSummary {
  id: string;
  abhaId: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  maskedPhone: string;
  allergies: string[];
  district?: string;
}

export interface DoctorSummary {
  id: string;
  name: string;
  registrationNumber: string;
  facilityName: string;
  facilityCode: string;
  department?: string;
}

export interface PrescriptionMedicineItem {
  id: string;
  medicineName: string;
  genericName: string;
  strength: string;
  dosage: string;
  frequency: string;
  route: string;
  duration: string;
  quantityPrescribed: number;
  quantityDispensed: number;
  quantityRemaining: number;
  timing: 'before_food' | 'after_food' | 'with_food' | 'as_needed';
  instructions?: string;
}

export interface PharmacyPrescription {
  id: string; // e.g. Rx-2026-0089
  patient: PatientSummary;
  doctor: DoctorSummary;
  issueDate: string; // YYYY-MM-DD
  validUntil: string; // YYYY-MM-DD
  diagnosis: string;
  medicines: PrescriptionMedicineItem[];
  status: PrescriptionStatus;
  isDigitallyVerified: boolean;
  digitalSignature: string;
  urgency: 'routine' | 'urgent' | 'emergency';
  specialInstructions?: string;
  allergiesChecked: boolean;
  contactDoctorRequested?: boolean;
  contactDoctorNotes?: string;
  cancellationReason?: string;
}

export interface MedicineBatch {
  id: string; // BTH-001
  medicineId: string; // MED-001
  genericName: string;
  brandName: string;
  strength: string;
  dosageForm: DosageForm;
  manufacturer: string;
  batchNumber: string;
  expiryDate: string; // YYYY-MM-DD
  purchasePrice: number;
  mrp: number;
  totalQuantity: number;
  reservedQuantity: number;
  availableQuantity: number; // totalQuantity - reservedQuantity
  minStockThreshold: number;
  storageInstructions: string;
  lastUpdated: string;
  status: StockStatus;
}

export type StockMovementType = 
  | 'initial_stock' 
  | 'batch_added' 
  | 'quantity_adjusted' 
  | 'reservation_held' 
  | 'reservation_released' 
  | 'dispensed' 
  | 'damaged_stock' 
  | 'expired_removal';

export interface StockMovement {
  id: string;
  batchId: string;
  medicineName: string;
  batchNumber: string;
  type: StockMovementType;
  quantityChange: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  performedBy: string;
  timestamp: string;
}

export interface ReservationItem {
  medicineId: string;
  medicineName: string;
  genericName: string;
  strength: string;
  requestedQuantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  isAvailable: boolean;
}

export interface MedicineReservation {
  id: string; // RSV-2026-101
  prescriptionId: string;
  patient: PatientSummary;
  requestedMedicines: ReservationItem[];
  reservationDateTime: string;
  collectionWindow: string; // e.g. "Today, 4:00 PM - 7:00 PM"
  estimatedCollectionTime?: string;
  status: ReservationStatus;
  rejectionReason?: string;
  cancellationReason?: string;
  notes?: string;
  readyAt?: string;
  collectedAt?: string;
  pharmacistAssigned?: string;
}

export interface DispensedMedicineItem {
  medicineId: string;
  genericName: string;
  brandName: string;
  batchId: string;
  batchNumber: string;
  strength: string;
  dosageForm: DosageForm;
  prescribedQuantity: number;
  dispensedQuantity: number;
  remainingQuantity: number;
  unitPrice: number;
  totalPrice: number;
  instructions: string;
}

export interface DispensingRecord {
  id: string; // DSP-2026-001
  receiptNumber: string; // RCP-2026-0842
  prescriptionId: string;
  reservationId?: string;
  patient: PatientSummary;
  collectorName: string;
  collectorRelation: 'Self' | 'Family Member' | 'Authorized Representative';
  collectorPhone: string;
  pharmacyName: string;
  facilityCode: string;
  pharmacistId: string;
  pharmacistName: string;
  pharmacistLicense: string;
  dispensedItems: DispensedMedicineItem[];
  dispensingType: DispensingType;
  date: string;
  time: string;
  totalAmount: number;
  paymentMethod: 'Free (Jan Aushadhi / Govt Scheme)' | 'Ayushman Bharat (PM-JAY)' | 'Cash' | 'UPI / Digital';
  dispensingNotes?: string;
  status: 'completed' | 'reversal_recorded';
  reversalReason?: string;
  reversalTimestamp?: string;
  reversalBy?: string;
}

export interface NotificationEvent {
  id: string;
  recipientType: 'patient_android_app' | 'doctor_portal' | 'admin_portal';
  targetId: string;
  eventType: 
    | 'reservation_received' 
    | 'reservation_accepted' 
    | 'medicines_partially_available' 
    | 'reservation_rejected' 
    | 'ready_for_collection' 
    | 'collection_reminder' 
    | 'medicines_dispensed' 
    | 'reservation_cancelled'
    | 'prescription_dispensed_sync'
    | 'stock_shortage_sync';
  title: string;
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  category: 'inventory' | 'reservation' | 'dispensing' | 'prescription' | 'security';
  action: string;
  performedBy: string;
  entityId: string;
  details: string;
  facilityCode: string;
}

export interface PharmacyDashboardStats {
  newPrescriptions: number;
  pendingReservations: number;
  readyForCollection: number;
  lowStockCount: number;
  outOfStockCount: number;
  nearExpiryCount: number;
  dispensedTodayCount: number;
  totalActiveInventory: number;
}
