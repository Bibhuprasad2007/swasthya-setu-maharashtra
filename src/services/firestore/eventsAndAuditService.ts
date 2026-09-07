import {
  collection,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';

export interface OperationalEventInput {
  eventType: 'APPOINTMENT_COMPLETED' | 'CONSULTATION_HELD' | 'LAB_REPORT_VERIFIED' | 'MEDICINE_DISPENSED' | 'REFERRAL_TRANSFERRED' | 'CRITICAL_ALERT';
  facilityId: string;
  district?: string;
  status: string;
  actorRole: 'DOCTOR' | 'LAB_TECH' | 'PHARMACIST';
}

export interface NotificationInput {
  userId: string;
  type: 'APPOINTMENT' | 'LAB_REPORT' | 'PRESCRIPTION' | 'RESERVATION' | 'REFERRAL' | 'SYSTEM';
  title: string;
  message: string;
  referenceId?: string;
}

export interface AuditLogInput {
  userId: string;
  userRole: string;
  facilityId?: string;
  action: string;
  resource: string;
  status: 'SUCCESS' | 'FAILED';
}

export const eventsAndAuditService = {
  /**
   * Log an operational event for Admin dashboard (Zero PII)
   */
  async recordOperationalEvent(event: OperationalEventInput): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'operationalEvents'), {
        ...event,
        district: event.district || 'Maharashtra',
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (err) {
      console.error('Failed to record operational event:', err);
      return '';
    }
  },

  /**
   * Send a targeted real-time notification to a user
   */
  async createNotification(notification: NotificationInput): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'notifications'), {
        ...notification,
        read: false,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (err) {
      console.error('Failed to create notification:', err);
      return '';
    }
  },

  /**
   * Log an audit log entry
   */
  async createAuditLog(log: AuditLogInput): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'auditLogs'), {
        ...log,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (err) {
      console.error('Failed to create audit log:', err);
      return '';
    }
  }
};
