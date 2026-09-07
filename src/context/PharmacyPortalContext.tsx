/**
 * Pharmacy Portal Context & State Management
 * SwasthyaSetu Maharashtra - Integrated Rural Healthcare Network
 */

import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
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
import {
  inventoryService,
  dispensingService,
  pharmacyService,
  notificationService,
  auditService
} from '../services/pharmacyServices';

interface PharmacyPortalContextType {
  // Central Data Stores
  prescriptions: PharmacyPrescription[];
  batches: MedicineBatch[];
  reservations: MedicineReservation[];
  dispensingHistory: DispensingRecord[];
  stockMovements: StockMovement[];
  notifications: NotificationEvent[];
  auditEvents: AuditEvent[];
  toasts: ToastMessage[];

  // Computed Live Stats
  dashboardStats: PharmacyDashboardStats;

  // Toast Helpers
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;

  // Prescription Actions
  requestContactDoctor: (rxId: string, notes: string, by: string) => void;

  // Inventory Actions
  addBatch: (
    newBatch: Omit<MedicineBatch, 'id' | 'lastUpdated' | 'status' | 'availableQuantity'>,
    by: string
  ) => MedicineBatch;
  updateBatchStock: (batchId: string, newTotalQty: number, reason: string, by: string) => void;
  editBatchInfo: (batchId: string, updates: Partial<MedicineBatch>, reason: string, by: string) => void;
  recordDamagedOrExpiredStock: (batchId: string, damagedQty: number, reason: string, by: string) => void;

  // Reservation Actions
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

  // Safe Dispensing Actions
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
  const [prescriptions, setPrescriptions] = useState<PharmacyPrescription[]>([]);
  const [batches, setBatches] = useState<MedicineBatch[]>([]);
  const [reservations, setReservations] = useState<MedicineReservation[]>([]);
  const [dispensingHistory, setDispensingHistory] = useState<DispensingRecord[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

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
      details: `Pharmacist requested physician contact/substitution clarification: ${notes}`,
      facilityCode: 'MH-PHA-101'
    });
    setAuditEvents((prev) => [audit, ...prev]);

    const notif = notificationService.createNotification({
      recipientType: 'doctor_portal',
      targetId: 'DOC-PORTAL',
      eventType: 'prescription_dispensed_sync',
      title: 'Clarification Request from Pharmacy',
      message: `Prescription ${rxId}: Pharmacist requested guidance. Notes: ${notes}`,
      metadata: { rxId, notes }
    });
    setNotifications((prev) => [notif, ...prev]);

    addToast({
      type: 'info',
      title: 'Request Sent to Doctor',
      message: `Physician consultation request logged for Prescription ${rxId}.`
    });
  }, [addToast]);

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

      const audit = auditService.createEvent({
        category: 'inventory',
        action: 'BATCH_ADDED',
        performedBy: by,
        entityId: id,
        details: `Batch ${batch.batchNumber} added for ${batch.genericName} with ${batch.totalQuantity} units.`,
        facilityCode: 'MH-PHA-101'
      });
      setAuditEvents((prev) => [audit, ...prev]);

      addToast({
        type: 'success',
        title: 'Batch Added Successfully',
        message: `Batch ${batch.batchNumber} of ${batch.genericName} is now in stock.`
      });

      return batch;
    },
    [addToast]
  );

  const updateBatchStock = useCallback(
    (batchId: string, newTotalQty: number, reason: string, by: string) => {
      setBatches((prev) =>
        prev.map((b) => {
          if (b.id !== batchId) return b;

          const change = newTotalQty - b.totalQuantity;
          const newAvail = Math.max(0, newTotalQty - b.reservedQuantity);
          const newStatus = inventoryService.calculateStockStatus(
            newTotalQty,
            b.reservedQuantity,
            b.minStockThreshold,
            b.expiryDate
          );

          // Record stock movement
          const movement = inventoryService.createStockMovement({
            batchId,
            medicineName: `${b.genericName} (${b.brandName})`,
            batchNumber: b.batchNumber,
            type: 'quantity_adjusted',
            quantityChange: change,
            previousQuantity: b.totalQuantity,
            newQuantity: newTotalQty,
            reason: reason || 'Physical inventory reconciliation',
            performedBy: by
          });
          setStockMovements((sm) => [movement, ...sm]);

          const audit = auditService.createEvent({
            category: 'inventory',
            action: 'STOCK_QUANTITY_UPDATED',
            performedBy: by,
            entityId: batchId,
            details: `Adjusted total quantity from ${b.totalQuantity} to ${newTotalQty}. Reason: ${reason}`,
            facilityCode: 'MH-PHA-101'
          });
          setAuditEvents((ae) => [audit, ...ae]);

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
        message: 'Medicine inventory quantity has been adjusted and recorded in audit log.'
      });
    },
    [addToast]
  );

  const editBatchInfo = useCallback(
    (batchId: string, updates: Partial<MedicineBatch>, reason: string, by: string) => {
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

          const audit = auditService.createEvent({
            category: 'inventory',
            action: 'BATCH_INFO_EDITED',
            performedBy: by,
            entityId: batchId,
            details: `Batch details edited for ${b.batchNumber}. Reason: ${reason}`,
            facilityCode: 'MH-PHA-101'
          });
          setAuditEvents((ae) => [audit, ...ae]);

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
        message: 'Batch records have been updated successfully.'
      });
    },
    [addToast]
  );

  const recordDamagedOrExpiredStock = useCallback(
    (batchId: string, damagedQty: number, reason: string, by: string) => {
      setBatches((prev) =>
        prev.map((b) => {
          if (b.id !== batchId) return b;

          const newTotal = Math.max(0, b.totalQuantity - damagedQty);
          const newAvail = Math.max(0, newTotal - b.reservedQuantity);
          const newStatus = inventoryService.calculateStockStatus(
            newTotal,
            b.reservedQuantity,
            b.minStockThreshold,
            b.expiryDate
          );

          const movement = inventoryService.createStockMovement({
            batchId,
            medicineName: `${b.genericName} (${b.brandName})`,
            batchNumber: b.batchNumber,
            type: 'damaged_stock',
            quantityChange: -damagedQty,
            previousQuantity: b.totalQuantity,
            newQuantity: newTotal,
            reason: `Damaged/spoiled stock write-off: ${reason}`,
            performedBy: by
          });
          setStockMovements((sm) => [movement, ...sm]);

          const audit = auditService.createEvent({
            category: 'inventory',
            action: 'DAMAGED_STOCK_WRITTEN_OFF',
            performedBy: by,
            entityId: batchId,
            details: `Wrote off ${damagedQty} damaged units from batch ${b.batchNumber}. Reason: ${reason}`,
            facilityCode: 'MH-PHA-101'
          });
          setAuditEvents((ae) => [audit, ...ae]);

          return {
            ...b,
            totalQuantity: newTotal,
            availableQuantity: newAvail,
            status: newStatus,
            lastUpdated: new Date().toISOString()
          };
        })
      );

      addToast({
        type: 'warning',
        title: 'Stock Write-off Logged',
        message: `${damagedQty} damaged units written off and archived in stock movement audit.`
      });
    },
    [addToast]
  );

  // ─── Reservation Actions ─────────────────────────────────────────────────
  const acceptReservation = useCallback(
    (resId: string, estimatedTime: string, by: string) => {
      const targetRes = reservations.find((r) => r.id === resId);
      if (!targetRes) return;

      // Reserve required stock in corresponding batches
      setBatches((prevBatches) => {
        const updated = [...prevBatches];
        targetRes.requestedMedicines.forEach((item) => {
          // Find matching available non-expired batch for this generic medicine
          const bIndex = updated.findIndex(
            (b) =>
              (b.medicineId === item.medicineId || b.genericName.toLowerCase().includes(item.genericName.toLowerCase())) &&
              b.status !== 'expired' &&
              b.availableQuantity >= item.requestedQuantity
          );
          if (bIndex !== -1) {
            const b = updated[bIndex];
            const newReserved = b.reservedQuantity + item.requestedQuantity;
            const newAvail = Math.max(0, b.totalQuantity - newReserved);
            const newStatus = inventoryService.calculateStockStatus(
              b.totalQuantity,
              newReserved,
              b.minStockThreshold,
              b.expiryDate
            );
            updated[bIndex] = {
              ...b,
              reservedQuantity: newReserved,
              availableQuantity: newAvail,
              status: newStatus,
              lastUpdated: new Date().toISOString()
            };
          }
        });
        return updated;
      });

      setReservations((prev) =>
        prev.map((r) =>
          r.id === resId
            ? {
                ...r,
                status: 'accepted',
                estimatedCollectionTime: estimatedTime,
                pharmacistAssigned: by
              }
            : r
        )
      );

      const audit = auditService.createEvent({
        category: 'reservation',
        action: 'RESERVATION_ACCEPTED',
        performedBy: by,
        entityId: resId,
        details: `Accepted reservation ${resId} for patient ${targetRes.patient.name}. Reserved items held.`,
        facilityCode: 'MH-PHA-101'
      });
      setAuditEvents((ae) => [audit, ...ae]);

      const notif = notificationService.createNotification({
        recipientType: 'patient_android_app',
        targetId: targetRes.patient.id,
        eventType: 'reservation_accepted',
        title: 'Reservation Accepted',
        message: `Your medicine reservation ${resId} has been accepted. Collection window: ${estimatedTime || targetRes.collectionWindow}.`,
        metadata: { reservationId: resId }
      });
      setNotifications((ne) => [notif, ...ne]);

      addToast({
        type: 'success',
        title: 'Reservation Accepted',
        message: `Stock reserved for ${targetRes.patient.name}. Patient Android notification dispatched.`
      });
    },
    [reservations, addToast]
  );

  const partiallyAcceptReservation = useCallback(
    (resId: string, unavailableMedicineIds: string[], estimatedTime: string, by: string) => {
      const targetRes = reservations.find((r) => r.id === resId);
      if (!targetRes) return;

      // Reserve available items only
      setBatches((prevBatches) => {
        const updated = [...prevBatches];
        targetRes.requestedMedicines.forEach((item) => {
          if (!unavailableMedicineIds.includes(item.medicineId)) {
            const bIndex = updated.findIndex(
              (b) =>
                (b.medicineId === item.medicineId || b.genericName.toLowerCase().includes(item.genericName.toLowerCase())) &&
                b.status !== 'expired' &&
                b.availableQuantity >= item.requestedQuantity
            );
            if (bIndex !== -1) {
              const b = updated[bIndex];
              const newReserved = b.reservedQuantity + item.requestedQuantity;
              const newAvail = Math.max(0, b.totalQuantity - newReserved);
              const newStatus = inventoryService.calculateStockStatus(
                b.totalQuantity,
                newReserved,
                b.minStockThreshold,
                b.expiryDate
              );
              updated[bIndex] = {
                ...b,
                reservedQuantity: newReserved,
                availableQuantity: newAvail,
                status: newStatus,
                lastUpdated: new Date().toISOString()
              };
            }
          }
        });
        return updated;
      });

      setReservations((prev) =>
        prev.map((r) =>
          r.id === resId
            ? {
                ...r,
                status: 'partially_available',
                estimatedCollectionTime: estimatedTime,
                pharmacistAssigned: by,
                requestedMedicines: r.requestedMedicines.map((m) =>
                  unavailableMedicineIds.includes(m.medicineId)
                    ? { ...m, isAvailable: false }
                    : { ...m, isAvailable: true }
                )
              }
            : r
        )
      );

      const audit = auditService.createEvent({
        category: 'reservation',
        action: 'RESERVATION_PARTIALLY_ACCEPTED',
        performedBy: by,
        entityId: resId,
        details: `Partially accepted reservation ${resId}. ${unavailableMedicineIds.length} item(s) flagged unavailable.`,
        facilityCode: 'MH-PHA-101'
      });
      setAuditEvents((ae) => [audit, ...ae]);

      const notif = notificationService.createNotification({
        recipientType: 'patient_android_app',
        targetId: targetRes.patient.id,
        eventType: 'medicines_partially_available',
        title: 'Medicines Partially Available',
        message: `Some items in reservation ${resId} are currently out of stock. Available items have been reserved.`,
        metadata: { reservationId: resId, unavailableIds: unavailableMedicineIds }
      });
      setNotifications((ne) => [notif, ...ne]);

      addToast({
        type: 'info',
        title: 'Partially Accepted',
        message: 'Partial availability recorded and transmitted to patient app.'
      });
    },
    [reservations, addToast]
  );

  const rejectReservation = useCallback(
    (resId: string, reason: string, by: string) => {
      const targetRes = reservations.find((r) => r.id === resId);
      if (!targetRes) return;

      // If stock was reserved earlier, release it
      if (targetRes.status === 'accepted' || targetRes.status === 'partially_available') {
        setBatches((prevBatches) =>
          prevBatches.map((b) => {
            const req = targetRes.requestedMedicines.find(
              (m) => m.medicineId === b.medicineId || b.genericName.toLowerCase().includes(m.genericName.toLowerCase())
            );
            if (req && req.isAvailable) {
              const newReserved = Math.max(0, b.reservedQuantity - req.requestedQuantity);
              const newAvail = Math.max(0, b.totalQuantity - newReserved);
              const newStatus = inventoryService.calculateStockStatus(
                b.totalQuantity,
                newReserved,
                b.minStockThreshold,
                b.expiryDate
              );
              return {
                ...b,
                reservedQuantity: newReserved,
                availableQuantity: newAvail,
                status: newStatus,
                lastUpdated: new Date().toISOString()
              };
            }
            return b;
          })
        );
      }

      setReservations((prev) =>
        prev.map((r) =>
          r.id === resId
            ? {
                ...r,
                status: 'rejected',
                rejectionReason: reason,
                pharmacistAssigned: by
              }
            : r
        )
      );

      const audit = auditService.createEvent({
        category: 'reservation',
        action: 'RESERVATION_REJECTED',
        performedBy: by,
        entityId: resId,
        details: `Rejected reservation ${resId}. Reason: ${reason}`,
        facilityCode: 'MH-PHA-101'
      });
      setAuditEvents((ae) => [audit, ...ae]);

      const notif = notificationService.createNotification({
        recipientType: 'patient_android_app',
        targetId: targetRes.patient.id,
        eventType: 'reservation_rejected',
        title: 'Reservation Rejected',
        message: `Your reservation ${resId} could not be accepted. Reason: ${reason}`,
        metadata: { reservationId: resId, reason }
      });
      setNotifications((ne) => [notif, ...ne]);

      addToast({
        type: 'warning',
        title: 'Reservation Rejected',
        message: 'Reservation rejected with reason. Reserved stock released.'
      });
    },
    [reservations, addToast]
  );

  const markReservationReady = useCallback(
    (resId: string, by: string) => {
      const targetRes = reservations.find((r) => r.id === resId);
      if (!targetRes) return;

      setReservations((prev) =>
        prev.map((r) =>
          r.id === resId
            ? {
                ...r,
                status: 'ready_for_collection',
                readyAt: new Date().toISOString(),
                pharmacistAssigned: by
              }
            : r
        )
      );

      const audit = auditService.createEvent({
        category: 'reservation',
        action: 'RESERVATION_READY_FOR_COLLECTION',
        performedBy: by,
        entityId: resId,
        details: `Reservation ${resId} marked ready for pickup by ${by}.`,
        facilityCode: 'MH-PHA-101'
      });
      setAuditEvents((ae) => [audit, ...ae]);

      const notif = notificationService.createNotification({
        recipientType: 'patient_android_app',
        targetId: targetRes.patient.id,
        eventType: 'ready_for_collection',
        title: 'Ready for Collection',
        message: `Your medicines for reservation ${resId} are packed and ready for pickup at Jan Aushadhi Dispensary.`,
        metadata: { reservationId: resId }
      });
      setNotifications((ne) => [notif, ...ne]);

      addToast({
        type: 'success',
        title: 'Marked as Ready',
        message: `Medicines packed and ready for ${targetRes.patient.name}. Alert sent to patient.`
      });
    },
    [reservations, addToast]
  );

  const cancelReservation = useCallback(
    (resId: string, reason: string, by: string) => {
      const targetRes = reservations.find((r) => r.id === resId);
      if (!targetRes) return;

      // Release reserved stock
      setBatches((prevBatches) =>
        prevBatches.map((b) => {
          const req = targetRes.requestedMedicines.find(
            (m) => m.medicineId === b.medicineId || b.genericName.toLowerCase().includes(m.genericName.toLowerCase())
          );
          if (req && req.isAvailable) {
            const newReserved = Math.max(0, b.reservedQuantity - req.requestedQuantity);
            const newAvail = Math.max(0, b.totalQuantity - newReserved);
            const newStatus = inventoryService.calculateStockStatus(
              b.totalQuantity,
              newReserved,
              b.minStockThreshold,
              b.expiryDate
            );
            return {
              ...b,
              reservedQuantity: newReserved,
              availableQuantity: newAvail,
              status: newStatus,
              lastUpdated: new Date().toISOString()
            };
          }
          return b;
        })
      );

      setReservations((prev) =>
        prev.map((r) =>
          r.id === resId
            ? {
                ...r,
                status: 'cancelled',
                cancellationReason: reason
              }
            : r
        )
      );

      const audit = auditService.createEvent({
        category: 'reservation',
        action: 'RESERVATION_CANCELLED',
        performedBy: by,
        entityId: resId,
        details: `Cancelled reservation ${resId}. Reason: ${reason}`,
        facilityCode: 'MH-PHA-101'
      });
      setAuditEvents((ae) => [audit, ...ae]);

      addToast({
        type: 'info',
        title: 'Reservation Cancelled',
        message: 'Reservation cancelled. Held stock returned to available inventory.'
      });
    },
    [reservations, addToast]
  );

  // ─── Safe Dispensing Actions ─────────────────────────────────────────────
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

      // 1. Deduct stock from batches and release reservations
      setBatches((prevBatches) => {
        const updatedBatches = [...prevBatches];

        items.forEach((item) => {
          const bIdx = updatedBatches.findIndex((b) => b.id === item.batchId);
          if (bIdx !== -1) {
            const b = updatedBatches[bIdx];
            const rxItem = rx.medicines.find((m) => m.id === item.rxItemId);

            const newTotal = Math.max(0, b.totalQuantity - item.quantity);
            // If linked to a reservation, release reserved quantity by dispensed amount
            const newReserved = reservationId
              ? Math.max(0, b.reservedQuantity - item.quantity)
              : b.reservedQuantity;
            const newAvail = Math.max(0, newTotal - newReserved);
            const newStatus = inventoryService.calculateStockStatus(
              newTotal,
              newReserved,
              b.minStockThreshold,
              b.expiryDate
            );

            updatedBatches[bIdx] = {
              ...b,
              totalQuantity: newTotal,
              reservedQuantity: newReserved,
              availableQuantity: newAvail,
              status: newStatus,
              lastUpdated: new Date().toISOString()
            };

            // Record movement
            const movement = inventoryService.createStockMovement({
              batchId: b.id,
              medicineName: `${b.genericName} (${b.brandName})`,
              batchNumber: b.batchNumber,
              type: 'dispensed',
              quantityChange: -item.quantity,
              previousQuantity: b.totalQuantity,
              newQuantity: newTotal,
              reason: `Dispensed against Rx ${rxId} to ${rx.patient.name} (${dispensingId})`,
              performedBy: `${pharmacistName} (${pharmacistId})`
            });
            setStockMovements((sm) => [movement, ...sm]);

            // Add to dispensed items breakdown
            const unitPrice = b.mrp;
            const totalPrice = Number((unitPrice * item.quantity).toFixed(2));
            dispensedItemsList.push({
              medicineId: b.medicineId,
              genericName: b.genericName,
              brandName: b.brandName,
              batchId: b.id,
              batchNumber: b.batchNumber,
              strength: b.strength,
              dosageForm: b.dosageForm,
              prescribedQuantity: rxItem ? rxItem.quantityPrescribed : item.quantity,
              dispensedQuantity: item.quantity,
              remainingQuantity: rxItem
                ? Math.max(0, rxItem.quantityRemaining - item.quantity)
                : 0,
              unitPrice,
              totalPrice,
              instructions: rxItem?.instructions || 'Take as directed by doctor.'
            });
          }
        });

        return updatedBatches;
      });

      // 2. Update Prescription items and fulfilment status
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

      // 3. Update Reservation status if linked
      if (reservationId) {
        setReservations((prevRes) =>
          prevRes.map((r) =>
            r.id === reservationId
              ? {
                  ...r,
                  status: 'collected',
                  collectedAt: new Date().toISOString()
                }
            : r
          )
        );
      }

      // 4. Create Immutable Dispensing Record
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
        pharmacyName: 'Government Jan Aushadhi & PHC Dispensary Nashik',
        facilityCode: 'MH-PHA-101',
        pharmacistId,
        pharmacistName,
        pharmacistLicense,
        dispensedItems: dispensedItemsList,
        dispensingType: allFulfilled ? 'full' : 'partial',
        date: dateStr,
        time: timeStr,
        totalAmount,
        paymentMethod,
        dispensingNotes: notes,
        status: 'completed'
      };

      setDispensingHistory((prev) => [dispensingRecord, ...prev]);

      // 5. Audit Event
      const audit = auditService.createEvent({
        category: 'dispensing',
        action: 'SAFE_DISPENSING_COMPLETED',
        performedBy: `${pharmacistName} (${pharmacistId})`,
        entityId: dispensingId,
        details: `Dispensed ${dispensedItemsList.length} items for Rx ${rxId} to ${collectorName} (${collectorRelation}). Receipt #${receiptNumber}`,
        facilityCode: 'MH-PHA-101'
      });
      setAuditEvents((ae) => [audit, ...ae]);

      // 6. Patient App & Doctor Portal Sync Notifications
      const patientNotif = notificationService.createNotification({
        recipientType: 'patient_android_app',
        targetId: rx.patient.id,
        eventType: 'medicines_dispensed',
        title: 'Medicines Dispensed',
        message: `Your prescribed medicines for ${rxId} have been dispensed at Jan Aushadhi Dispensary. Receipt: ${receiptNumber}.`,
        metadata: { dispensingId, receiptNumber }
      });
      setNotifications((ne) => [patientNotif, ...ne]);

      const docNotif = notificationService.createNotification({
        recipientType: 'doctor_portal',
        targetId: rx.doctor.id,
        eventType: 'prescription_dispensed_sync',
        title: `Prescription ${allFulfilled ? 'Fully' : 'Partially'} Dispensed`,
        message: `Rx ${rxId} (${rx.patient.name}): ${dispensedItemsList.map((i) => `${i.dispensedQuantity}x ${i.genericName}`).join(', ')} dispensed.`,
        metadata: { rxId, dispensingId }
      });
      setNotifications((ne) => [docNotif, ...ne]);

      addToast({
        type: 'success',
        title: 'Dispensing Completed',
        message: `Receipt #${receiptNumber} generated for ${rx.patient.name}. Inventory & Rx updated.`
      });

      return dispensingRecord;
    },
    [prescriptions, addToast]
  );

  const recordDispensingCorrection = useCallback(
    (dispensingId: string, reversalReason: string, by: string) => {
      setDispensingHistory((prev) =>
        prev.map((rec) =>
          rec.id === dispensingId
            ? {
                ...rec,
                status: 'reversal_recorded',
                reversalReason,
                reversalTimestamp: new Date().toISOString(),
                reversalBy: by
              }
            : rec
        )
      );

      const audit = auditService.createEvent({
        category: 'dispensing',
        action: 'DISPENSING_CORRECTION_RECORDED',
        performedBy: by,
        entityId: dispensingId,
        details: `Dispensing record ${dispensingId} marked with correction audit event. Reason: ${reversalReason}`,
        facilityCode: 'MH-PHA-101'
      });
      setAuditEvents((ae) => [audit, ...ae]);

      addToast({
        type: 'warning',
        title: 'Correction Recorded',
        message: 'Immutable audit entry recorded for dispensing record.'
      });
    },
    [addToast]
  );

  // ─── Live Computed Dashboard Stats ─────────────────────────────────────────
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
