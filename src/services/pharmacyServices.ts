/**
 * Pharmacy Portal Service Layer
 * SwasthyaSetu Maharashtra - Integrated Rural Healthcare Network
 * 
 * Provides decoupled service functions that can operate on centralized mock state
 * or easily connect to production backend REST APIs (e.g. GET /api/pharmacy/inventory).
 */

import {
  PharmacyPrescription,
  MedicineBatch,
  StockMovement,
  MedicineReservation,
  DispensingRecord,
  NotificationEvent,
  AuditEvent,
  PharmacyDashboardStats,
  DispensedMedicineItem
} from '../types/pharmacy';

// Check if we should use live backend or internal state management
export const USE_MOCK_PHARMACY = true;

/**
 * Audit Logging Service
 */
export const auditService = {
  createEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>): AuditEvent {
    const newEvent: AuditEvent = {
      ...event,
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    if (import.meta.env.DEV) {
      console.info('[SwasthyaSetu Pharmacy Audit]', newEvent);
    }
    return newEvent;
  }
};

/**
 * Patient Android App & Doctor Notification Service
 */
export const notificationService = {
  createNotification(notif: Omit<NotificationEvent, 'id' | 'timestamp'>): NotificationEvent {
    const newNotif: NotificationEvent = {
      ...notif,
      id: `NOTIF-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    if (import.meta.env.DEV) {
      console.info(`[Notification -> ${notif.recipientType}]`, newNotif);
    }
    return newNotif;
  }
};

/**
 * Inventory Management Service
 */
export const inventoryService = {
  calculateStockStatus(
    totalQty: number,
    reservedQty: number,
    minThreshold: number,
    expiryDateStr: string
  ): MedicineBatch['status'] {
    const available = Math.max(0, totalQty - reservedQty);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDateStr);

    if (expiry.getTime() < today.getTime()) {
      return 'expired';
    }

    // Days until expiry
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (available === 0) {
      return 'out_of_stock';
    }

    if (diffDays <= 90) {
      return 'near_expiry';
    }

    if (available <= minThreshold) {
      return 'low_stock';
    }

    return 'available';
  },

  createStockMovement(movement: Omit<StockMovement, 'id' | 'timestamp'>): StockMovement {
    return {
      ...movement,
      id: `SM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Prescription Service
 */
export const prescriptionService = {
  canDispense(prescription: PharmacyPrescription): { allowed: boolean; reason?: string } {
    if (prescription.status === 'cancelled') {
      return { allowed: false, reason: 'This prescription has been cancelled by the physician.' };
    }
    if (prescription.status === 'expired') {
      return { allowed: false, reason: 'This prescription validity has expired. Re-evaluation is required.' };
    }
    if (prescription.status === 'fully_dispensed') {
      return { allowed: false, reason: 'All prescribed medicines have already been fully dispensed.' };
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const validUntil = new Date(prescription.validUntil);
    if (validUntil.getTime() < today.getTime()) {
      return { allowed: false, reason: 'Prescription date has lapsed beyond its valid window.' };
    }
    return { allowed: true };
  }
};

/**
 * Dispensing Service
 */
export const dispensingService = {
  generateReceiptNumber(): string {
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `RCP-2026-${rand}`;
  },

  calculateTotals(items: DispensedMedicineItem[]): number {
    return items.reduce((sum, item) => sum + item.totalPrice, 0);
  }
};

/**
 * Pharmacy Aggregate Service (feeds Government Admin Portal indicators)
 */
export const pharmacyService = {
  calculateDashboardStats(
    prescriptions: PharmacyPrescription[],
    batches: MedicineBatch[],
    reservations: MedicineReservation[],
    dispensingHistory: DispensingRecord[]
  ): PharmacyDashboardStats {
    const todayStr = new Date().toISOString().split('T')[0];

    const newPrescriptions = prescriptions.filter((p) => p.status === 'finalized').length;
    const pendingReservations = reservations.filter(
      (r) => r.status === 'requested' || r.status === 'partially_available'
    ).length;
    const readyForCollection = reservations.filter((r) => r.status === 'ready_for_collection').length;

    const lowStockCount = batches.filter((b) => b.status === 'low_stock').length;
    const outOfStockCount = batches.filter((b) => b.status === 'out_of_stock').length;
    const nearExpiryCount = batches.filter((b) => b.status === 'near_expiry').length;

    const dispensedTodayCount = dispensingHistory.filter((d) => d.date === todayStr).length;

    const totalActiveInventory = batches.reduce((sum, b) => sum + b.availableQuantity, 0);

    return {
      newPrescriptions,
      pendingReservations,
      readyForCollection,
      lowStockCount,
      outOfStockCount,
      nearExpiryCount,
      dispensedTodayCount,
      totalActiveInventory
    };
  },

  getAdminPrivacySafeIndicators(
    batches: MedicineBatch[],
    prescriptions: PharmacyPrescription[],
    dispensingHistory: DispensingRecord[]
  ) {
    // Only aggregate data is exposed; no PII, diagnosis, or patient records
    const essentialShortages = batches.filter(
      (b) => b.status === 'out_of_stock' || b.status === 'low_stock'
    ).map((b) => ({
      genericName: b.genericName,
      dosageForm: b.dosageForm,
      strength: b.strength,
      status: b.status,
      availableQuantity: b.availableQuantity,
      threshold: b.minStockThreshold
    }));

    const totalDispensed = dispensingHistory.length;
    const fullDispensed = dispensingHistory.filter((d) => d.dispensingType === 'full').length;
    const partialDispensed = dispensingHistory.filter((d) => d.dispensingType === 'partial').length;

    const fulfilmentRate = totalDispensed > 0 ? Math.round((fullDispensed / totalDispensed) * 100) : 0;
    const partialRate = totalDispensed > 0 ? Math.round((partialDispensed / totalDispensed) * 100) : 0;

    return {
      facilityCode: 'MH-PHA-101',
      district: 'Nashik',
      totalActivePrescriptions: prescriptions.filter((p) => p.status === 'finalized').length,
      lowStockMedicinesCount: batches.filter((b) => b.status === 'low_stock').length,
      outOfStockCount: batches.filter((b) => b.status === 'out_of_stock').length,
      nearExpiryCount: batches.filter((b) => b.status === 'near_expiry').length,
      fulfilmentRate,
      partialRate,
      essentialShortages,
      generatedAt: new Date().toISOString()
    };
  }
};
