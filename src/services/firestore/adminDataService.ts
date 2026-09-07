import {
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  limit,
  setDoc
} from 'firebase/firestore';
import { db } from '../firebase';

export interface OperationalEvent {
  id: string;
  eventType: string;
  facilityId: string;
  district: string;
  status: string;
  actorRole: string;
  createdAt?: Timestamp | any;
}

export interface FacilityData {
  id: string;
  name: string;
  type: 'HOSPITAL' | 'LABORATORY' | 'PHARMACY' | 'ADMIN';
  district: string;
  taluka?: string;
  address?: string;
  contactNumber?: string;
  isActive: boolean;
  totalBeds?: number;
  availableBeds?: number;
  icuAvailable?: number;
  oxygenAvailableLiters?: number;
  opdLoadStatus?: 'NORMAL' | 'HIGH' | 'CRITICAL';
  createdAt?: Timestamp | any;
  updatedAt?: Timestamp | any;
}

export interface SystemAlert {
  id: string;
  facilityId: string;
  facilityName: string;
  district: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  title: string;
  description: string;
  resolved: boolean;
  createdAt?: Timestamp | any;
  updatedAt?: Timestamp | any;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userRole: string;
  facilityId?: string;
  action: string;
  resource: string;
  status: 'SUCCESS' | 'FAILED';
  createdAt?: Timestamp | any;
}

export const adminDataService = {
  /**
   * Real-time listener for sanitized operational events (Zero PII)
   */
  subscribeOperationalEvents(callback: (events: OperationalEvent[]) => void, maxCount: number = 100) {
    const q = query(
      collection(db, 'operationalEvents'),
      limit(maxCount)
    );

    return onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as OperationalEvent));
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      callback(list);
    });
  },

  /**
   * Real-time listener for all registered facilities
   */
  subscribeFacilities(callback: (facilities: FacilityData[]) => void) {
    const q = collection(db, 'facilities');

    return onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as FacilityData));
      list.sort((a, b) => a.name.localeCompare(b.name));
      callback(list);
    });
  },

  /**
   * Add or update facility in registry
   */
  async saveFacility(facility: Partial<FacilityData> & { id: string }): Promise<void> {
    const docRef = doc(db, 'facilities', facility.id);
    await setDoc(docRef, {
      ...facility,
      isActive: facility.isActive !== false,
      updatedAt: serverTimestamp()
    }, { merge: true });
  },

  /**
   * Real-time listener for system alerts
   */
  subscribeAlerts(callback: (alerts: SystemAlert[]) => void) {
    const q = collection(db, 'alerts');

    return onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as SystemAlert));
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      callback(list);
    });
  },

  /**
   * Create a new alert
   */
  async createAlert(data: Omit<SystemAlert, 'id' | 'resolved' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'alerts'), {
      ...data,
      resolved: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  /**
   * Resolve an alert
   */
  async resolveAlert(alertId: string): Promise<void> {
    const docRef = doc(db, 'alerts', alertId);
    await updateDoc(docRef, {
      resolved: true,
      updatedAt: serverTimestamp()
    });
  },

  /**
   * Real-time listener for audit logs
   */
  subscribeAuditLogs(callback: (logs: AuditLogEntry[]) => void, maxCount: number = 100) {
    const q = query(collection(db, 'auditLogs'), limit(maxCount));

    return onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AuditLogEntry));
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      callback(list);
    });
  }
};
