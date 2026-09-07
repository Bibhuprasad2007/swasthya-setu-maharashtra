import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { eventsAndAuditService } from './eventsAndAuditService';
import { appointmentsService } from './appointmentsService';

export interface ConsultationData {
  id?: string;
  appointmentId: string;
  patientId: string;
  patientName?: string;
  doctorId: string;
  doctorName: string;
  facilityId: string;
  facilityName?: string;
  chiefComplaints?: string[];
  diagnosis: string;
  clinicalNotes?: string;
  visitSummary: string;
  instructions: string;
  followUpDate?: Timestamp | Date | any;
  status: 'IN_PROGRESS' | 'COMPLETED';
  createdAt?: Timestamp | any;
  updatedAt?: Timestamp | any;
}

export const consultationsService = {
  /**
   * Real-time listener for consultations in a facility
   */
  subscribeFacilityConsultations(facilityId: string, callback: (consultations: ConsultationData[]) => void) {
    if (!facilityId) {
      callback([]);
      return () => {};
    }

    const q = query(
      collection(db, 'consultations'),
      where('facilityId', '==', facilityId)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const list: ConsultationData[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        })) as ConsultationData[];

        list.sort((a, b) => {
          const tA = a.createdAt?.seconds || 0;
          const tB = b.createdAt?.seconds || 0;
          return tB - tA;
        });

        callback(list);
      },
      (error) => {
        console.error('Error subscribing to consultations:', error);
      }
    );
  },

  /**
   * Create a new consultation record
   */
  async createConsultation(data: Omit<ConsultationData, 'id' | 'createdAt' | 'updatedAt'>, district?: string): Promise<string> {
    const followUpTime = data.followUpDate instanceof Date 
      ? Timestamp.fromDate(data.followUpDate) 
      : data.followUpDate || null;

    const docRef = await addDoc(collection(db, 'consultations'), {
      ...data,
      followUpDate: followUpTime,
      status: data.status || 'COMPLETED',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    if (data.appointmentId) {
      try {
        await appointmentsService.updateAppointmentStatus(data.appointmentId, 'COMPLETED');
      } catch (err) {
        console.warn('Could not update appointment status on consultation creation:', err);
      }
    }

    await eventsAndAuditService.recordOperationalEvent({
      eventType: 'CONSULTATION_HELD',
      facilityId: data.facilityId,
      district: district || 'Maharashtra',
      status: 'COMPLETED',
      actorRole: 'DOCTOR'
    });

    if (data.patientId) {
      await eventsAndAuditService.createNotification({
        userId: data.patientId,
        type: 'APPOINTMENT',
        title: 'Consultation Completed',
        message: `Your visit with ${data.doctorName} is complete. Visit summary: ${data.visitSummary}`,
        referenceId: docRef.id
      });
    }

    return docRef.id;
  }
};
