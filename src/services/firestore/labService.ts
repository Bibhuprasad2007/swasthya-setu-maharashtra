import {
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { eventsAndAuditService } from './eventsAndAuditService';

export type LabOrderStatus = 'ORDERED' | 'SAMPLE_COLLECTED' | 'PROCESSING' | 'VERIFIED' | 'CANCELLED';

export interface LabOrderData {
  id?: string;
  consultationId?: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  patientAbhaId?: string;
  patientGender?: string;
  patientAge?: number;
  doctorId: string;
  doctorName: string;
  facilityId: string;
  facilityName?: string;
  testNames: string[];
  testCategory?: string;
  priority: 'NORMAL' | 'URGENT' | 'EMERGENCY';
  clinicalNotes?: string;
  status: LabOrderStatus;
  sampleId?: string;
  collectedAt?: Timestamp | any;
  createdAt?: Timestamp | any;
  updatedAt?: Timestamp | any;
}

export interface LabTestParameterResult {
  parameter: string;
  value: string | number;
  unit: string;
  referenceRange: string;
  status: 'NORMAL' | 'LOW' | 'HIGH' | 'CRITICAL';
}

export interface LabReportData {
  id?: string;
  labOrderId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  labTechId: string;
  labTechName: string;
  facilityId: string;
  facilityName?: string;
  testName: string;
  results: LabTestParameterResult[];
  interpretation: string;
  isCritical: boolean;
  status: 'VERIFIED';
  verifiedAt: Timestamp | any;
  createdAt?: Timestamp | any;
  updatedAt?: Timestamp | any;
}

export const labService = {
  /**
   * Real-time listener for Lab Orders matching facilityId
   */
  subscribeFacilityLabOrders(facilityId: string, callback: (orders: LabOrderData[]) => void) {
    if (!facilityId) {
      callback([]);
      return () => {};
    }

    const q = query(
      collection(db, 'labOrders'),
      where('facilityId', '==', facilityId)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const orders: LabOrderData[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        })) as LabOrderData[];

        orders.sort((a, b) => {
          const tA = a.createdAt?.seconds || 0;
          const tB = b.createdAt?.seconds || 0;
          return tB - tA;
        });

        callback(orders);
      },
      (error) => {
        console.error('Error subscribing to lab orders:', error);
      }
    );
  },

  /**
   * Real-time listener for Lab Reports in a facility
   */
  subscribeFacilityLabReports(facilityId: string, callback: (reports: LabReportData[]) => void) {
    if (!facilityId) {
      callback([]);
      return () => {};
    }

    const q = query(
      collection(db, 'labReports'),
      where('facilityId', '==', facilityId)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const reports: LabReportData[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        })) as LabReportData[];

        reports.sort((a, b) => {
          const tA = a.verifiedAt?.seconds || a.createdAt?.seconds || 0;
          const tB = b.verifiedAt?.seconds || b.createdAt?.seconds || 0;
          return tB - tA;
        });

        callback(reports);
      },
      (error) => {
        console.error('Error subscribing to lab reports:', error);
      }
    );
  },

  /**
   * Create a new Lab Order (Doctor)
   */
  async createLabOrder(data: Omit<LabOrderData, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'labOrders'), {
      ...data,
      status: data.status || 'ORDERED',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    if (data.patientId) {
      await eventsAndAuditService.createNotification({
        userId: data.patientId,
        type: 'LAB_REPORT',
        title: 'Diagnostic Test Prescribed',
        message: `Diagnostic tests (${data.testNames.join(', ')}) have been ordered for you.`,
        referenceId: docRef.id
      });
    }

    return docRef.id;
  },

  /**
   * Update Lab Order status (e.g. SAMPLE_COLLECTED, PROCESSING, CANCELLED)
   */
  async updateLabOrderStatus(
    orderId: string,
    status: LabOrderStatus,
    extra?: { sampleId?: string; patientId?: string }
  ): Promise<void> {
    const docRef = doc(db, 'labOrders', orderId);
    await updateDoc(docRef, {
      status,
      ...(extra?.sampleId ? { sampleId: extra.sampleId, collectedAt: serverTimestamp() } : {}),
      updatedAt: serverTimestamp()
    });

    if (extra?.patientId) {
      await eventsAndAuditService.createNotification({
        userId: extra.patientId,
        type: 'LAB_REPORT',
        title: `Lab Order Status: ${status}`,
        message: `Your test order status is now ${status}.`,
        referenceId: orderId
      });
    }
  },

  /**
   * Create a Verified Lab Report (IMMUTABLE) and mark Lab Order as VERIFIED
   */
  async createVerifiedLabReport(
    reportData: Omit<LabReportData, 'id' | 'status' | 'verifiedAt' | 'createdAt' | 'updatedAt'>,
    district?: string
  ): Promise<string> {
    const reportRef = await addDoc(collection(db, 'labReports'), {
      ...reportData,
      status: 'VERIFIED',
      verifiedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    if (reportData.labOrderId) {
      const orderRef = doc(db, 'labOrders', reportData.labOrderId);
      await updateDoc(orderRef, {
        status: 'VERIFIED',
        updatedAt: serverTimestamp()
      });
    }

    await eventsAndAuditService.recordOperationalEvent({
      eventType: 'LAB_REPORT_VERIFIED',
      facilityId: reportData.facilityId,
      district: district || 'Maharashtra',
      status: reportData.isCritical ? 'CRITICAL_REPORT' : 'VERIFIED',
      actorRole: 'LAB_TECH'
    });

    if (reportData.patientId) {
      await eventsAndAuditService.createNotification({
        userId: reportData.patientId,
        type: 'LAB_REPORT',
        title: 'Diagnostic Report Ready',
        message: `Your report for ${reportData.testName} is now verified and available.`,
        referenceId: reportRef.id
      });
    }

    return reportRef.id;
  }
};
