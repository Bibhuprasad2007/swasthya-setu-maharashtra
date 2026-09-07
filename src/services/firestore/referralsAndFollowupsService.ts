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

export type ReferralStatus = 'CREATED' | 'SENT' | 'ACCEPTED' | 'APPOINTMENT_SCHEDULED' | 'COMPLETED' | 'REJECTED';

export interface ReferralData {
  id?: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  patientAbhaId?: string;
  patientAge?: number;
  patientGender?: string;
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
  status: ReferralStatus;
  createdAt?: Timestamp | any;
  updatedAt?: Timestamp | any;
}

export type FollowUpStatus = 'SCHEDULED' | 'COMPLETED' | 'MISSED' | 'RESCHEDULED';

export interface FollowUpData {
  id?: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  patientAbhaId?: string;
  doctorId: string;
  doctorName: string;
  facilityId: string;
  facilityName?: string;
  scheduledDate: Timestamp | Date | any;
  notes: string;
  status: FollowUpStatus;
  patientResponse?: string;
  createdAt?: Timestamp | any;
  updatedAt?: Timestamp | any;
}

export type TeleconsultStatus = 'REQUESTED' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface TeleconsultationData {
  id?: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  doctorId: string;
  doctorName: string;
  facilityId: string;
  facilityName?: string;
  appointmentId?: string;
  scheduledTime: Timestamp | Date | any;
  meetingLink: string;
  status: TeleconsultStatus;
  notes?: string;
  createdAt?: Timestamp | any;
  updatedAt?: Timestamp | any;
}

export const referralsAndFollowupsService = {
  /**
   * Real-time listener for facility referrals (both outgoing and incoming)
   */
  subscribeFacilityReferrals(facilityId: string, callback: (referrals: ReferralData[]) => void) {
    if (!facilityId) {
      callback([]);
      return () => {};
    }

    // Query outgoing
    const qFrom = query(collection(db, 'referrals'), where('fromFacilityId', '==', facilityId));
    // Query incoming
    const qTo = query(collection(db, 'referrals'), where('toFacilityId', '==', facilityId));

    let fromItems: ReferralData[] = [];
    let toItems: ReferralData[] = [];

    const mergeAndEmit = () => {
      const map = new Map<string, ReferralData>();
      [...fromItems, ...toItems].forEach(r => {
        if (r.id) map.set(r.id, r);
      });
      const merged = Array.from(map.values());
      merged.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      callback(merged);
    };

    const unsubFrom = onSnapshot(qFrom, (snap) => {
      fromItems = snap.docs.map(d => ({ id: d.id, ...d.data() } as ReferralData));
      mergeAndEmit();
    });

    const unsubTo = onSnapshot(qTo, (snap) => {
      toItems = snap.docs.map(d => ({ id: d.id, ...d.data() } as ReferralData));
      mergeAndEmit();
    });

    return () => {
      unsubFrom();
      unsubTo();
    };
  },

  /**
   * Create a new referral
   */
  async createReferral(data: Omit<ReferralData, 'id' | 'createdAt' | 'updatedAt'>, district?: string): Promise<string> {
    const docRef = await addDoc(collection(db, 'referrals'), {
      ...data,
      status: data.status || 'SENT',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Operational event for Admin
    await eventsAndAuditService.recordOperationalEvent({
      eventType: 'REFERRAL_TRANSFERRED',
      facilityId: data.fromFacilityId,
      district: district || 'Maharashtra',
      status: 'SENT',
      actorRole: 'DOCTOR'
    });

    // Notify patient
    if (data.patientId) {
      await eventsAndAuditService.createNotification({
        userId: data.patientId,
        type: 'REFERRAL',
        title: 'Referral Initiated',
        message: `You have been referred to ${data.toFacilityName} for ${data.specialtyRequired}.`,
        referenceId: docRef.id
      });
    }

    return docRef.id;
  },

  /**
   * Update referral status
   */
  async updateReferralStatus(referralId: string, status: ReferralStatus, patientId?: string): Promise<void> {
    const docRef = doc(db, 'referrals', referralId);
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp()
    });

    if (patientId) {
      await eventsAndAuditService.createNotification({
        userId: patientId,
        type: 'REFERRAL',
        title: `Referral Status: ${status}`,
        message: `Your referral status has been updated to ${status}.`,
        referenceId: referralId
      });
    }
  },

  /**
   * Real-time listener for Follow-ups
   */
  subscribeFacilityFollowUps(facilityId: string, callback: (followups: FollowUpData[]) => void) {
    if (!facilityId) {
      callback([]);
      return () => {};
    }

    const q = query(
      collection(db, 'followUps'),
      where('facilityId', '==', facilityId)
    );

    return onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as FollowUpData));
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      callback(list);
    });
  },

  /**
   * Create Follow-up
   */
  async createFollowUp(data: Omit<FollowUpData, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const schedDate = data.scheduledDate instanceof Date 
      ? Timestamp.fromDate(data.scheduledDate) 
      : data.scheduledDate || serverTimestamp();

    const docRef = await addDoc(collection(db, 'followUps'), {
      ...data,
      scheduledDate: schedDate,
      status: data.status || 'SCHEDULED',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    if (data.patientId) {
      await eventsAndAuditService.createNotification({
        userId: data.patientId,
        type: 'APPOINTMENT',
        title: 'Follow-Up Scheduled',
        message: `Your follow-up with Dr. ${data.doctorName} is scheduled.`,
        referenceId: docRef.id
      });
    }

    return docRef.id;
  },

  /**
   * Update Follow-up status
   */
  async updateFollowUpStatus(followUpId: string, status: FollowUpStatus): Promise<void> {
    const docRef = doc(db, 'followUps', followUpId);
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp()
    });
  },

  /**
   * Real-time listener for Teleconsultations
   */
  subscribeDoctorTeleconsultations(doctorId: string, callback: (sessions: TeleconsultationData[]) => void) {
    if (!doctorId) {
      callback([]);
      return () => {};
    }

    const q = query(
      collection(db, 'teleconsultations'),
      where('doctorId', '==', doctorId)
    );

    return onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as TeleconsultationData));
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      callback(list);
    });
  },

  /**
   * Create Teleconsultation session
   */
  async createTeleconsultation(data: Omit<TeleconsultationData, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const time = data.scheduledTime instanceof Date 
      ? Timestamp.fromDate(data.scheduledTime) 
      : data.scheduledTime || serverTimestamp();

    const docRef = await addDoc(collection(db, 'teleconsultations'), {
      ...data,
      scheduledTime: time,
      status: data.status || 'SCHEDULED',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    if (data.patientId) {
      await eventsAndAuditService.createNotification({
        userId: data.patientId,
        type: 'APPOINTMENT',
        title: 'Teleconsultation Session Ready',
        message: `Your video consultation with ${data.doctorName} is confirmed.`,
        referenceId: docRef.id
      });
    }

    return docRef.id;
  },

  /**
   * Update Teleconsultation status
   */
  async updateTeleconsultationStatus(teleId: string, status: TeleconsultStatus): Promise<void> {
    const docRef = doc(db, 'teleconsultations', teleId);
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp()
    });
  }
};
