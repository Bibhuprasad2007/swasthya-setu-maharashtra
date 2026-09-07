import {
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  runTransaction,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase';
import { eventsAndAuditService } from './eventsAndAuditService';

export interface PrescribedMedicine {
  medicineId: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  totalQuantity: number;
  instructions: string;
}

export interface PrescriptionData {
  id?: string;
  consultationId?: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  patientAbhaId?: string;
  doctorId: string;
  doctorName: string;
  facilityId: string;
  facilityName?: string;
  medicines: PrescribedMedicine[];
  instructions: string;
  status: 'ACTIVE' | 'PARTIALLY_DISPENSED' | 'DISPENSED' | 'EXPIRED' | 'CANCELLED';
  validUntil?: Timestamp | any;
  createdAt?: Timestamp | any;
  updatedAt?: Timestamp | any;
}

export interface MedicineInventoryData {
  id?: string;
  facilityId: string;
  medicineId: string;
  medicineName: string;
  genericName?: string;
  category: string;
  batchNumber: string;
  stockQuantity: number;
  reservedQuantity?: number;
  unitPrice?: number;
  reorderLevel?: number;
  expiryDate?: Timestamp | Date | any;
  createdAt?: Timestamp | any;
  updatedAt?: Timestamp | any;
}

export type ReservationStatus = 'REQUESTED' | 'CONFIRMED' | 'PARTIALLY_AVAILABLE' | 'READY' | 'DISPENSED' | 'CANCELLED';

export interface ReservedItem {
  medicineId: string;
  medicineName: string;
  quantityRequested: number;
  quantityAllocated: number;
}

export interface MedicineReservationData {
  id?: string;
  prescriptionId: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  facilityId: string;
  items: ReservedItem[];
  status: ReservationStatus;
  pickupDeadline?: Timestamp | any;
  notes?: string;
  createdAt?: Timestamp | any;
  updatedAt?: Timestamp | any;
}

export interface DispensedItem {
  medicineId: string;
  medicineName: string;
  batchNumber?: string;
  quantity: number;
}

export interface DispensingData {
  id?: string;
  prescriptionId: string;
  reservationId?: string;
  patientId: string;
  patientName: string;
  pharmacistId: string;
  pharmacistName: string;
  facilityId: string;
  facilityName?: string;
  items: DispensedItem[];
  dispensedAt?: Timestamp | any;
  createdAt?: Timestamp | any;
  updatedAt?: Timestamp | any;
}

export const pharmacyService = {
  /**
   * Real-time listener for Prescriptions matching facilityId
   */
  subscribePrescriptions(facilityId: string, callback: (prescriptions: PrescriptionData[]) => void) {
    if (!facilityId) {
      callback([]);
      return () => {};
    }

    const q = query(
      collection(db, 'prescriptions'),
      where('facilityId', '==', facilityId)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const list: PrescriptionData[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        })) as PrescriptionData[];

        list.sort((a, b) => {
          const tA = a.createdAt?.seconds || 0;
          const tB = b.createdAt?.seconds || 0;
          return tB - tA;
        });

        callback(list);
      },
      (error) => {
        console.error('Error subscribing to prescriptions:', error);
      }
    );
  },

  /**
   * Create Prescription (Doctor)
   */
  async createPrescription(data: Omit<PrescriptionData, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'prescriptions'), {
      ...data,
      status: data.status || 'ACTIVE',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    if (data.patientId) {
      await eventsAndAuditService.createNotification({
        userId: data.patientId,
        type: 'PRESCRIPTION',
        title: 'Prescription Issued',
        message: `A digital prescription with ${data.medicines.length} medication(s) has been issued by ${data.doctorName}.`,
        referenceId: docRef.id
      });
    }

    return docRef.id;
  },

  /**
   * Real-time listener for Pharmacy Inventory
   */
  subscribeInventory(facilityId: string, callback: (inventory: MedicineInventoryData[]) => void) {
    if (!facilityId) {
      callback([]);
      return () => {};
    }

    const q = query(
      collection(db, 'medicineInventory'),
      where('facilityId', '==', facilityId)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const items: MedicineInventoryData[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        })) as MedicineInventoryData[];

        items.sort((a, b) => a.medicineName.localeCompare(b.medicineName));
        callback(items);
      },
      (error) => {
        console.error('Error subscribing to inventory:', error);
      }
    );
  },

  /**
   * Add or update inventory stock
   */
  async addOrUpdateInventory(item: Omit<MedicineInventoryData, 'createdAt' | 'updatedAt'> & { id?: string }): Promise<string> {
    if (item.id) {
      const docRef = doc(db, 'medicineInventory', item.id);
      await updateDoc(docRef, {
        ...item,
        updatedAt: serverTimestamp()
      });
      return item.id;
    } else {
      const docRef = await addDoc(collection(db, 'medicineInventory'), {
        ...item,
        stockQuantity: Number(item.stockQuantity) || 0,
        reservedQuantity: Number(item.reservedQuantity) || 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    }
  },

  /**
   * Real-time listener for Medicine Reservations
   */
  subscribeReservations(facilityId: string, callback: (reservations: MedicineReservationData[]) => void) {
    if (!facilityId) {
      callback([]);
      return () => {};
    }

    const q = query(
      collection(db, 'medicineReservations'),
      where('facilityId', '==', facilityId)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const reservations: MedicineReservationData[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        })) as MedicineReservationData[];

        reservations.sort((a, b) => {
          const tA = a.createdAt?.seconds || 0;
          const tB = b.createdAt?.seconds || 0;
          return tB - tA;
        });

        callback(reservations);
      },
      (error) => {
        console.error('Error subscribing to reservations:', error);
      }
    );
  },

  /**
   * Update Reservation Status
   */
  async updateReservationStatus(
    reservationId: string,
    status: ReservationStatus,
    patientId?: string
  ): Promise<void> {
    const docRef = doc(db, 'medicineReservations', reservationId);
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp()
    });

    if (patientId) {
      await eventsAndAuditService.createNotification({
        userId: patientId,
        type: 'RESERVATION',
        title: `Medicine Reservation ${status}`,
        message: `Your medicine reservation is now marked as ${status}.`,
        referenceId: reservationId
      });
    }
  },

  /**
   * Real-time listener for Dispensings History
   */
  subscribeDispensings(facilityId: string, callback: (dispensings: DispensingData[]) => void) {
    if (!facilityId) {
      callback([]);
      return () => {};
    }

    const q = query(
      collection(db, 'dispensings'),
      where('facilityId', '==', facilityId)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const list: DispensingData[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        })) as DispensingData[];

        list.sort((a, b) => {
          const tA = a.dispensedAt?.seconds || a.createdAt?.seconds || 0;
          const tB = b.dispensedAt?.seconds || b.createdAt?.seconds || 0;
          return tB - tA;
        });

        callback(list);
      },
      (error) => {
        console.error('Error subscribing to dispensings:', error);
      }
    );
  },

  /**
   * ATOMIC TRANSACTION: Dispense medicines, deduct inventory stock (never allowing negative stock),
   * record immutable dispensing log, and update prescription/reservation status.
   */
  async dispensePrescriptionTransaction(
    dispenseData: Omit<DispensingData, 'id' | 'dispensedAt' | 'createdAt' | 'updatedAt'>,
    district?: string
  ): Promise<string> {
    return await runTransaction(db, async (transaction) => {
      // 1. Fetch matching inventory items for the facility
      const invQuery = query(
        collection(db, 'medicineInventory'),
        where('facilityId', '==', dispenseData.facilityId)
      );
      const invSnap = await getDocs(invQuery);
      const inventoryDocs = invSnap.docs;

      // 2. Validate sufficient stock for all dispensed items
      for (const item of dispenseData.items) {
        const matchedInv = inventoryDocs.find(
          d => (d.data().medicineId === item.medicineId || d.data().medicineName?.toLowerCase() === item.medicineName?.toLowerCase())
        );

        if (matchedInv) {
          const invRef = doc(db, 'medicineInventory', matchedInv.id);
          const currentSnap = await transaction.get(invRef);
          if (currentSnap.exists()) {
            const currentStock = currentSnap.data().stockQuantity || 0;
            if (currentStock < item.quantity) {
              throw new Error(`Insufficient stock for ${item.medicineName}. Available: ${currentStock}, Required: ${item.quantity}`);
            }
            // Deduct stock
            transaction.update(invRef, {
              stockQuantity: currentStock - item.quantity,
              updatedAt: serverTimestamp()
            });
          }
        }
      }

      // 3. Create immutable dispensing document
      const newDispensingRef = doc(collection(db, 'dispensings'));
      transaction.set(newDispensingRef, {
        ...dispenseData,
        dispensedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // 4. Update prescription status
      if (dispenseData.prescriptionId) {
        const rxRef = doc(db, 'prescriptions', dispenseData.prescriptionId);
        transaction.update(rxRef, {
          status: 'DISPENSED',
          updatedAt: serverTimestamp()
        });
      }

      // 5. Update reservation status if applicable
      if (dispenseData.reservationId) {
        const resRef = doc(db, 'medicineReservations', dispenseData.reservationId);
        transaction.update(resRef, {
          status: 'DISPENSED',
          updatedAt: serverTimestamp()
        });
      }

      return newDispensingRef.id;
    }).then(async (dispensingId) => {
      // Record sanitized operational event
      await eventsAndAuditService.recordOperationalEvent({
        eventType: 'MEDICINE_DISPENSED',
        facilityId: dispenseData.facilityId,
        district: district || 'Maharashtra',
        status: 'DISPENSED',
        actorRole: 'PHARMACIST'
      });

      // Send notification to patient
      if (dispenseData.patientId) {
        await eventsAndAuditService.createNotification({
          userId: dispenseData.patientId,
          type: 'PRESCRIPTION',
          title: 'Medicines Dispensed',
          message: `Your prescription has been dispensed by ${dispenseData.facilityName || 'Pharmacy'}.`,
          referenceId: dispensingId
        });
      }

      return dispensingId;
    });
  }
};
