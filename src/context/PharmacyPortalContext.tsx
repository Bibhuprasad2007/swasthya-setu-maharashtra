/**
 * Pharmacy Portal Context & State Management
 * SwasthyaSetu Maharashtra - Integrated Rural Healthcare Network
 */

import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import {
  PharmacyPrescription,
  MedicineBatch,
  StockMovement,
  MedicineReservation,
  DispensingRecord,
  NotificationEvent,
  AuditEvent,
  PharmacyDashboardStats,
  DispensedMedicineItem,
  PrescriptionStatus
} from '../types/pharmacy';
import { ToastMessage } from '../types/doctor';
import { useAuth } from './AuthContext';
import { pharmacyService as firestorePharmacyService } from '../services/firestore/pharmacyService';
import {
  inventoryService,
  dispensingService,
  pharmacyService,
  auditService
} from '../services/pharmacyServices';

interface PharmacyPortalContextType {
  prescriptions: PharmacyPrescription[];
  batches: MedicineBatch[];
  reservations: MedicineReservation[];
  dispensingHistory: DispensingRecord[];
  stockMovements: StockMovement[];
  notifications: NotificationEvent[];
  auditEvents: AuditEvent[];
  toasts: ToastMessage[];

  dashboardStats: PharmacyDashboardStats;

  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;

  requestContactDoctor: (rxId: string, notes: string, by: string) => void;

  addBatch: (
    newBatch: Omit<MedicineBatch, 'id' | 'lastUpdated' | 'status' | 'availableQuantity'>,
    by: string
  ) => MedicineBatch;
  updateBatchStock: (batchId: string, newTotalQty: number, reason: string, by: string) => void;
  editBatchInfo: (batchId: string, updates: Partial<MedicineBatch>, reason: string, by: string) => void;
  recordDamagedOrExpiredStock: (batchId: string, damagedQty: number, reason: string, by: string) => void;

  acceptReservation: (resId: string, estimatedTime: string, by: string) => void;
  partiallyAcceptReservation: (
    resId: string,
    unavailableMedicineIds: string[],
    estimatedTime: string,
    by: string
  ) => void;
  rejectReservation: (resId: string, reason: string, by: string) => void;
  markReservationReady: (resId: string, by: string) => void;
  cancelReservation: (resId: string, reason: string, by: string) => void;

  dispenseMedicines: (params: {
    rxId: string;
    reservationId?: string;
    collectorName: string;
    collectorRelation: 'Self' | 'Family Member' | 'Authorized Representative';
    collectorPhone: string;
    items: {
      batchId: string;
      rxItemId: string;
      quantity: number;
    }[];
    paymentMethod: DispensingRecord['paymentMethod'];
    notes?: string;
    pharmacistId: string;
    pharmacistName: string;
    pharmacistLicense: string;
  }) => DispensingRecord;

  recordDispensingCorrection: (dispensingId: string, reversalReason: string, by: string) => void;
}

const PharmacyPortalContext = createContext<PharmacyPortalContextType | undefined>(undefined);

let toastIdCounter = 1000;

export const PharmacyPortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const facilityId = user?.facilityId || user?.facilityCode || 'MH-PHA-101';

  const [prescriptions, setPrescriptions] = useState<PharmacyPrescription[]>([]);
  const [batches, setBatches] = useState<MedicineBatch[]>([]);
  const [reservations, setReservations] = useState<MedicineReservation[]>([]);
  const [dispensingHistory, setDispensingHistory] = useState<DispensingRecord[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [notifications] = useState<NotificationEvent[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // ─── Real-time Firestore Listeners ──────────────────────────────────────────
  useEffect(() => {
    if (!facilityId) return;

    // 1. Prescriptions
    const unsubRx = firestorePharmacyService.subscribePrescriptions(facilityId, (data) => {
      if (data && data.length > 0) {
        const mapped: PharmacyPrescription[] = data.map((rx) => {
          const datePrescribed = rx.createdAt?.seconds
            ? new Date(rx.createdAt.seconds * 1000).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0];

          return {
            id: rx.id || '',
            patient: {
              id: rx.patientId,
              name: rx.patientName,
              age: 35,
              gender: 'Female',
              maskedPhone: rx.patientPhone || '9876543210',
              abhaId: rx.patientAbhaId || '91-1234-5678-9012',
              allergies: []
            },
            doctor: {
              id: rx.doctorId,
              name: rx.doctorName,
              registrationNumber: 'MCI-99824',
              facilityName: rx.facilityName || 'District Facility',
              facilityCode: rx.facilityId
            },
            issueDate: datePrescribed,
            validUntil: rx.validUntil?.seconds
              ? new Date(rx.validUntil.seconds * 1000).toISOString().split('T')[0]
              : '2026-12-31',
            diagnosis: 'Clinical Consultation',
            status: rx.status === 'DISPENSED' ? 'fully_dispensed' : rx.status === 'PARTIALLY_DISPENSED' ? 'partially_dispensed' : rx.status === 'CANCELLED' ? 'cancelled' : 'finalized',
            isDigitallyVerified: true,
            digitalSignature: 'SIG-MCI-2026',
            urgency: 'routine',
            allergiesChecked: true,
            medicines: rx.medicines.map((m, idx) => ({
              id: `rx-item-${idx}`,
              medicineName: m.medicineName,
              genericName: m.medicineName,
              dosageForm: 'Tablet',
              strength: m.dosage || '500mg',
              dosage: m.dosage || '1 Tablet',
              frequency: m.frequency || 'TID',
              route: 'Oral',
              duration: `${m.durationDays || 5} days`,
              quantityPrescribed: m.totalQuantity || 15,
              quantityDispensed: rx.status === 'DISPENSED' ? m.totalQuantity : 0,
              quantityRemaining: rx.status === 'DISPENSED' ? 0 : m.totalQuantity,
              timing: 'after_food',
              instructions: m.instructions || 'After meals'
            })),
            specialInstructions: rx.instructions
          };
        });
        setPrescriptions(mapped);
      }
    });

    // 2. Inventory / Batches
    const unsubInv = firestorePharmacyService.subscribeInventory(facilityId, (data) => {
      if (data && data.length > 0) {
        const mapped: MedicineBatch[] = data.map((item) => {
          const avail = Math.max(0, item.stockQuantity - (item.reservedQuantity || 0));
          return {
            id: item.id || '',
            medicineId: item.medicineId,
            genericName: item.genericName || item.medicineName,
            brandName: item.medicineName,
            dosageForm: 'Tablet',
            strength: '500mg',
            manufacturer: 'Maharashtra Jan Aushadhi Corp',
            batchNumber: item.batchNumber,
            expiryDate: item.expiryDate?.seconds
              ? new Date(item.expiryDate.seconds * 1000).toISOString().split('T')[0]
              : '2027-12-31',
            purchasePrice: 15,
            mrp: item.unitPrice || 25,
            totalQuantity: item.stockQuantity,
            reservedQuantity: item.reservedQuantity || 0,
            availableQuantity: avail,
            minStockThreshold: item.reorderLevel || 100,
            storageInstructions: 'Store below 25°C in a dry place',
            status: avail <= (item.reorderLevel || 100) ? 'low_stock' : 'available',
            lastUpdated: item.updatedAt?.seconds
              ? new Date(item.updatedAt.seconds * 1000).toISOString()
              : new Date().toISOString()
          };
        });
        setBatches(mapped);
      }
    });

    // 3. Reservations
    const unsubRes = firestorePharmacyService.subscribeReservations(facilityId, (data) => {
      if (data && data.length > 0) {
        const mapped: MedicineReservation[] = data.map((res) => {
          let mappedStatus: any = 'requested';
          if (res.status === 'CONFIRMED') mappedStatus = 'accepted';
          else if (res.status === 'PARTIALLY_AVAILABLE') mappedStatus = 'partially_available';
          else if (res.status === 'READY') mappedStatus = 'ready_for_collection';
          else if (res.status === 'DISPENSED') mappedStatus = 'collected';
          else if (res.status === 'CANCELLED') mappedStatus = 'cancelled';

          return {
            id: res.id || '',
            prescriptionId: res.prescriptionId,
            patient: {
              id: res.patientId,
              name: res.patientName,
              age: 35,
              gender: 'Female',
              maskedPhone: res.patientPhone || '9876543210',
              abhaId: '91-1234-5678-9012',
              allergies: []
            },
            reservationDateTime: res.createdAt?.seconds
              ? new Date(res.createdAt.seconds * 1000).toISOString()
              : new Date().toISOString(),
            collectionWindow: 'Today 10:00 AM - 05:00 PM',
            status: mappedStatus,
            requestedMedicines: res.items.map((it) => ({
              medicineId: it.medicineId,
              medicineName: it.medicineName,
              genericName: it.medicineName,
              strength: '500mg',
              requestedQuantity: it.quantityRequested,
              allocatedQuantity: it.quantityAllocated,
              availableQuantity: it.quantityAllocated,
              reservedQuantity: it.quantityAllocated,
              isAvailable: it.quantityAllocated > 0
            }))
          };
        });
        setReservations(mapped);
      }
    });

    // 4. Dispensings
    const unsubDisp = firestorePharmacyService.subscribeDispensings(facilityId, (data) => {
      if (data && data.length > 0) {
        const mapped: DispensingRecord[] = data.map((d) => ({
          id: d.id || '',
          receiptNumber: `RCP-${d.id?.slice(-5) || '1001'}`,
          prescriptionId: d.prescriptionId,
          reservationId: d.reservationId,
          patient: {
            id: d.patientId,
            name: d.patientName,
            age: 35,
            gender: 'Female',
            maskedPhone: '9876543210',
            abhaId: '91-1234-5678-9012',
            allergies: []
          },
          collectorName: d.patientName,
          collectorRelation: 'Self',
          collectorPhone: '9876543210',
          pharmacyName: d.facilityName || 'Central Pharmacy',
          facilityCode: d.facilityId,
          pharmacistId: d.pharmacistId,
          pharmacistName: d.pharmacistName,
          pharmacistLicense: 'PHAR-MAH-2024-8834',
          dispensedItems: d.items.map((it) => ({
            medicineId: it.medicineId,
            genericName: it.medicineName,
            brandName: it.medicineName,
            batchId: it.medicineId,
            batchNumber: it.batchNumber || 'BTH-01',
            strength: '500mg',
            dosageForm: 'Tablet',
            prescribedQuantity: it.quantity,
            dispensedQuantity: it.quantity,
            remainingQuantity: 0,
            unitPrice: 20,
            totalPrice: it.quantity * 20,
            instructions: 'As advised'
          })),
          dispensingType: 'full',
          date: d.dispensedAt?.seconds
            ? new Date(d.dispensedAt.seconds * 1000).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          time: d.dispensedAt?.seconds
            ? new Date(d.dispensedAt.seconds * 1000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
            : '10:00',
          totalAmount: d.items.reduce((acc, it) => acc + it.quantity * 20, 0),
          paymentMethod: 'Free (Jan Aushadhi / Govt Scheme)',
          status: 'completed'
        }));
        setDispensingHistory(mapped);
      }
    });

    return () => {
      unsubRx();
      unsubInv();
      unsubRes();
      unsubDisp();
    };
  }, [facilityId]);

  // ─── Toasts ─────────────────────────────────────────────────────────────
  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-pha-${++toastIdCounter}`;
    setToasts((prev) => [{ ...toast, id }, ...prev].slice(0, 5));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ─── Prescription Actions ───────────────────────────────────────────────
  const requestContactDoctor = useCallback((rxId: string, notes: string, by: string) => {
    setPrescriptions((prev) =>
      prev.map((rx) =>
        rx.id === rxId
          ? {
              ...rx,
              contactDoctorRequested: true,
              contactDoctorNotes: notes
            }
          : rx
      )
    );

    const audit = auditService.createEvent({
      category: 'prescription',
      action: 'CONTACT_DOCTOR_REQUESTED',
      performedBy: by,
      entityId: rxId,
      details: `Pharmacist requested physician contact: ${notes}`,
      facilityCode: facilityId
    });
    setAuditEvents((prev) => [audit, ...prev]);

    addToast({
      type: 'info',
      title: 'Request Sent to Doctor',
      message: `Physician consultation request logged for Prescription ${rxId}.`
    });
  }, [facilityId, addToast]);

  // ─── Inventory Actions ───────────────────────────────────────────────────
  const addBatch = useCallback(
    (
      newBatchData: Omit<MedicineBatch, 'id' | 'lastUpdated' | 'status' | 'availableQuantity'>,
      by: string
    ): MedicineBatch => {
      const id = `BTH-${Date.now().toString().slice(-4)}`;
      const availableQuantity = Math.max(0, newBatchData.totalQuantity - (newBatchData.reservedQuantity || 0));
      const status = inventoryService.calculateStockStatus(
        newBatchData.totalQuantity,
        newBatchData.reservedQuantity || 0,
        newBatchData.minStockThreshold,
        newBatchData.expiryDate
      );

      const batch: MedicineBatch = {
        ...newBatchData,
        id,
        availableQuantity,
        status,
        lastUpdated: new Date().toISOString()
      };

      setBatches((prev) => [batch, ...prev]);

      firestorePharmacyService.addOrUpdateInventory({
        facilityId,
        medicineId: batch.medicineId,
        medicineName: batch.genericName,
        genericName: batch.genericName,
        category: 'ESSENTIAL',
        batchNumber: batch.batchNumber,
        stockQuantity: batch.totalQuantity,
        reservedQuantity: batch.reservedQuantity,
        unitPrice: batch.mrp,
        reorderLevel: batch.minStockThreshold,
        expiryDate: new Date(batch.expiryDate)
      }).catch(err => console.error('Firestore inventory sync error:', err));

      const movement = inventoryService.createStockMovement({
        batchId: id,
        medicineName: `${batch.genericName} (${batch.brandName})`,
        batchNumber: batch.batchNumber,
        type: 'batch_added',
        quantityChange: batch.totalQuantity,
        previousQuantity: 0,
        newQuantity: batch.totalQuantity,
        reason: `New batch ${batch.batchNumber} entered into dispensary stock.`,
        performedBy: by
      });
      setStockMovements((prev) => [movement, ...prev]);

      addToast({
        type: 'success',
        title: 'Batch Added Successfully',
        message: `Batch ${batch.batchNumber} of ${batch.genericName} is now synced with Firestore.`
      });

      return batch;
    },
    [facilityId, addToast]
  );

  const updateBatchStock = useCallback(
    (batchId: string, newTotalQty: number, _reason: string, _by: string) => {
      setBatches((prev) =>
        prev.map((b) => {
          if (b.id !== batchId) return b;

          const newAvail = Math.max(0, newTotalQty - b.reservedQuantity);
          const newStatus = inventoryService.calculateStockStatus(
            newTotalQty,
            b.reservedQuantity,
            b.minStockThreshold,
            b.expiryDate
          );

          firestorePharmacyService.addOrUpdateInventory({
            id: batchId,
            facilityId,
            medicineId: b.medicineId,
            medicineName: b.genericName,
            category: 'ESSENTIAL',
            batchNumber: b.batchNumber,
            stockQuantity: newTotalQty,
            reservedQuantity: b.reservedQuantity
          }).catch(err => console.error('Firestore stock update error:', err));

          return {
            ...b,
            totalQuantity: newTotalQty,
            availableQuantity: newAvail,
            status: newStatus,
            lastUpdated: new Date().toISOString()
          };
        })
      );

      addToast({
        type: 'success',
        title: 'Stock Updated',
        message: 'Medicine inventory quantity has been adjusted and synced.'
      });
    },
    [facilityId, addToast]
  );

  const editBatchInfo = useCallback(
    (batchId: string, updates: Partial<MedicineBatch>, _reason: string, _by: string) => {
      setBatches((prev) =>
        prev.map((b) => {
          if (b.id !== batchId) return b;
          const merged = { ...b, ...updates };
          const availableQuantity = Math.max(0, merged.totalQuantity - merged.reservedQuantity);
          const status = inventoryService.calculateStockStatus(
            merged.totalQuantity,
            merged.reservedQuantity,
            merged.minStockThreshold,
            merged.expiryDate
          );
          return {
            ...merged,
            availableQuantity,
            status,
            lastUpdated: new Date().toISOString()
          };
        })
      );

      addToast({
        type: 'info',
        title: 'Batch Details Updated',
        message: 'Batch records updated.'
      });
    },
    [addToast]
  );

  const recordDamagedOrExpiredStock = useCallback(
    (batchId: string, damagedQty: number, _reason: string, _by: string) => {
      setBatches((prev) =>
        prev.map((b) => {
          if (b.id !== batchId) return b;
          const newTotal = Math.max(0, b.totalQuantity - damagedQty);
          const newAvail = Math.max(0, newTotal - b.reservedQuantity);
          return {
            ...b,
            totalQuantity: newTotal,
            availableQuantity: newAvail,
            lastUpdated: new Date().toISOString()
          };
        })
      );
      addToast({
        type: 'warning',
        title: 'Stock Write-off Logged',
        message: `${damagedQty} damaged units written off.`
      });
    },
    [addToast]
  );

  // ─── Reservation Actions ─────────────────────────────────────────────────
  const acceptReservation = useCallback(
    (resId: string, estimatedTime: string, by: string) => {
      setReservations((prev) =>
        prev.map((r) =>
          r.id === resId
            ? { ...r, status: 'accepted', estimatedCollectionTime: estimatedTime, pharmacistAssigned: by }
            : r
        )
      );
      firestorePharmacyService.updateReservationStatus(resId, 'CONFIRMED')
        .catch(err => console.error('Firestore reservation accept error:', err));

      addToast({
        type: 'success',
        title: 'Reservation Accepted',
        message: 'Reservation accepted and synced with Firestore.'
      });
    },
    [addToast]
  );

  const partiallyAcceptReservation = useCallback(
    (resId: string, _unavailableMedicineIds: string[], estimatedTime: string, by: string) => {
      setReservations((prev) =>
        prev.map((r) =>
          r.id === resId
            ? { ...r, status: 'partially_available', estimatedCollectionTime: estimatedTime, pharmacistAssigned: by }
            : r
        )
      );
      firestorePharmacyService.updateReservationStatus(resId, 'PARTIALLY_AVAILABLE')
        .catch(err => console.error('Firestore reservation partial error:', err));

      addToast({
        type: 'info',
        title: 'Partially Accepted',
        message: 'Partial availability recorded.'
      });
    },
    [addToast]
  );

  const rejectReservation = useCallback(
    (resId: string, reason: string, by: string) => {
      setReservations((prev) =>
        prev.map((r) =>
          r.id === resId ? { ...r, status: 'rejected', rejectionReason: reason, pharmacistAssigned: by } : r
        )
      );
      firestorePharmacyService.updateReservationStatus(resId, 'CANCELLED')
        .catch(err => console.error('Firestore reservation reject error:', err));

      addToast({
        type: 'warning',
        title: 'Reservation Rejected',
        message: 'Reservation rejected.'
      });
    },
    [addToast]
  );

  const markReservationReady = useCallback(
    (resId: string, by: string) => {
      setReservations((prev) =>
        prev.map((r) =>
          r.id === resId ? { ...r, status: 'ready_for_collection', readyAt: new Date().toISOString(), pharmacistAssigned: by } : r
        )
      );
      firestorePharmacyService.updateReservationStatus(resId, 'READY')
        .catch(err => console.error('Firestore reservation ready error:', err));

      addToast({
        type: 'success',
        title: 'Marked as Ready',
        message: 'Medicines packed and ready for collection.'
      });
    },
    [addToast]
  );

  const cancelReservation = useCallback(
    (resId: string, reason: string, _by: string) => {
      setReservations((prev) =>
        prev.map((r) =>
          r.id === resId ? { ...r, status: 'cancelled', cancellationReason: reason } : r
        )
      );
      firestorePharmacyService.updateReservationStatus(resId, 'CANCELLED')
        .catch(err => console.error('Firestore reservation cancel error:', err));

      addToast({
        type: 'info',
        title: 'Reservation Cancelled',
        message: 'Reservation cancelled.'
      });
    },
    [addToast]
  );

  // ─── Safe Dispensing Actions (Atomic Transaction) ────────────────────────
  const dispenseMedicines = useCallback(
    ({
      rxId,
      reservationId,
      collectorName,
      collectorRelation,
      collectorPhone,
      items,
      paymentMethod,
      notes,
      pharmacistId,
      pharmacistName,
      pharmacistLicense
    }: {
      rxId: string;
      reservationId?: string;
      collectorName: string;
      collectorRelation: 'Self' | 'Family Member' | 'Authorized Representative';
      collectorPhone: string;
      items: {
        batchId: string;
        rxItemId: string;
        quantity: number;
      }[];
      paymentMethod: DispensingRecord['paymentMethod'];
      notes?: string;
      pharmacistId: string;
      pharmacistName: string;
      pharmacistLicense: string;
    }): DispensingRecord => {
      const rx = prescriptions.find((p) => p.id === rxId);
      if (!rx) {
        throw new Error(`Prescription ${rxId} not found.`);
      }

      const dispensedItemsList: DispensedMedicineItem[] = [];
      const dateStr = new Date().toISOString().split('T')[0];
      const timeStr = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      const receiptNumber = dispensingService.generateReceiptNumber();
      const dispensingId = `DSP-${Date.now().toString().slice(-4)}`;

      // Deduct stock locally
      setBatches((prevBatches) => {
        const updatedBatches = [...prevBatches];
        items.forEach((item) => {
          const bIdx = updatedBatches.findIndex((b) => b.id === item.batchId);
          if (bIdx !== -1) {
            const b = updatedBatches[bIdx];
            const rxItem = rx.medicines.find((m) => m.id === item.rxItemId);
            const newTotal = Math.max(0, b.totalQuantity - item.quantity);
            const newReserved = reservationId ? Math.max(0, b.reservedQuantity - item.quantity) : b.reservedQuantity;
            const newAvail = Math.max(0, newTotal - newReserved);

            updatedBatches[bIdx] = {
              ...b,
              totalQuantity: newTotal,
              reservedQuantity: newReserved,
              availableQuantity: newAvail,
              lastUpdated: new Date().toISOString()
            };

            const unitPrice = b.mrp;
            const totalPrice = Number((unitPrice * item.quantity).toFixed(2));
            dispensedItemsList.push({
              medicineId: b.medicineId,
              genericName: b.genericName,
              brandName: b.brandName,
              batchId: b.id,
              batchNumber: b.batchNumber,
              strength: b.strength,
              dosageForm: 'Tablet',
              prescribedQuantity: rxItem ? rxItem.quantityPrescribed : item.quantity,
              dispensedQuantity: item.quantity,
              remainingQuantity: rxItem ? Math.max(0, rxItem.quantityRemaining - item.quantity) : 0,
              unitPrice,
              totalPrice,
              instructions: rxItem?.instructions || 'Take as directed by doctor.'
            });
          }
        });
        return updatedBatches;
      });

      // Update prescription state
      let allFulfilled = true;
      setPrescriptions((prevRxList) =>
        prevRxList.map((p) => {
          if (p.id !== rxId) return p;
          const updatedMeds = p.medicines.map((m) => {
            const dispensedItem = items.find((i) => i.rxItemId === m.id);
            if (!dispensedItem) {
              if (m.quantityRemaining > 0) allFulfilled = false;
              return m;
            }
            const newDispensed = m.quantityDispensed + dispensedItem.quantity;
            const newRemaining = Math.max(0, m.quantityPrescribed - newDispensed);
            if (newRemaining > 0) allFulfilled = false;
            return {
              ...m,
              quantityDispensed: newDispensed,
              quantityRemaining: newRemaining
            };
          });
          const newStatus: PrescriptionStatus = allFulfilled ? 'fully_dispensed' : 'partially_dispensed';
          return {
            ...p,
            medicines: updatedMeds,
            status: newStatus
          };
        })
      );

      const totalAmount = dispensingService.calculateTotals(dispensedItemsList);
      const dispensingRecord: DispensingRecord = {
        id: dispensingId,
        receiptNumber,
        prescriptionId: rxId,
        reservationId,
        patient: rx.patient,
        collectorName: collectorName || rx.patient.name,
        collectorRelation: collectorRelation || 'Self',
        collectorPhone: collectorPhone || rx.patient.maskedPhone,
        pharmacyName: user?.facilityName || 'Central Dispensary',
        facilityCode: facilityId,
        pharmacistId,
        pharmacistName,
        pharmacistLicense,
        dispensedItems: dispensedItemsList,
        dispensingType: allFulfilled ? 'full' : 'partial',
        date: dateStr,
        time: timeStr,
        totalAmount,
        paymentMethod: paymentMethod || 'Free (Jan Aushadhi / Govt Scheme)',
        dispensingNotes: notes,
        status: 'completed'
      };

      setDispensingHistory((prev) => [dispensingRecord, ...prev]);

      // Execute atomic Firestore transaction for dispensing and stock reduction
      firestorePharmacyService.dispensePrescriptionTransaction({
        prescriptionId: rxId,
        reservationId,
        patientId: rx.patient.id,
        patientName: rx.patient.name,
        pharmacistId,
        pharmacistName,
        facilityId,
        facilityName: user?.facilityName,
        items: dispensedItemsList.map(it => ({
          medicineId: it.medicineId,
          medicineName: it.genericName,
          batchNumber: it.batchNumber,
          quantity: it.dispensedQuantity
        }))
      }, user?.district).catch(err => console.error('Firestore dispensing transaction error:', err));

      addToast({
        type: 'success',
        title: 'Dispensing Synchronized',
        message: `Receipt #${receiptNumber} written to Cloud Firestore via atomic transaction.`
      });

      return dispensingRecord;
    },
    [prescriptions, facilityId, user?.facilityName, user?.district, addToast]
  );

  const recordDispensingCorrection = useCallback(
    (dispensingId: string, reversalReason: string, by: string) => {
      setDispensingHistory((prev) =>
        prev.map((rec) =>
          rec.id === dispensingId
            ? { ...rec, status: 'reversal_recorded', reversalReason, reversalTimestamp: new Date().toISOString(), reversalBy: by }
            : rec
        )
      );
      addToast({
        type: 'warning',
        title: 'Correction Recorded',
        message: 'Immutable audit entry recorded.'
      });
    },
    [addToast]
  );

  const dashboardStats = useMemo(
    () => pharmacyService.calculateDashboardStats(prescriptions, batches, reservations, dispensingHistory),
    [prescriptions, batches, reservations, dispensingHistory]
  );

  const value: PharmacyPortalContextType = {
    prescriptions,
    batches,
    reservations,
    dispensingHistory,
    stockMovements,
    notifications,
    auditEvents,
    toasts,
    dashboardStats,
    addToast,
    removeToast,
    requestContactDoctor,
    addBatch,
    updateBatchStock,
    editBatchInfo,
    recordDamagedOrExpiredStock,
    acceptReservation,
    partiallyAcceptReservation,
    rejectReservation,
    markReservationReady,
    cancelReservation,
    dispenseMedicines,
    recordDispensingCorrection
  };

  return <PharmacyPortalContext.Provider value={value}>{children}</PharmacyPortalContext.Provider>;
};

export const usePharmacyPortal = (): PharmacyPortalContextType => {
  const context = useContext(PharmacyPortalContext);
  if (!context) {
    throw new Error('usePharmacyPortal must be used within a PharmacyPortalProvider');
  }
  return context;
};
