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

export type AppointmentStatus = 'REQUESTED' | 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface AppointmentData {
  id?: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  patientAbhaId?: string;
  patientGender?: string;
  patientAge?: number;
  facilityId: string;
  facilityName?: string;
  doctorId?: string;
  doctorName?: string;
  department: string;
  appointmentAt: Timestamp | Date | any;
  reason: string;
  status: AppointmentStatus;
  queueNumber?: number;
  cancellationReason?: string;
  createdAt?: Timestamp | any;
  updatedAt?: Timestamp | any;
}

export const appointmentsService = {
  /**
   * Real-time listener for facility appointments (Hospital / Doctor portal)
   */
  subscribeFacilityAppointments(facilityId: string, callback: (appointments: AppointmentData[]) => void) {
    if (!facilityId) {
      callback([]);
      return () => {};
    }

    const q = query(
      collection(db, 'appointments'),
      where('facilityId', '==', facilityId)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const appointments: AppointmentData[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...data
          } as AppointmentData;
        });

        appointments.sort((a, b) => {
          const tA = a.appointmentAt?.seconds ? a.appointmentAt.seconds * 1000 : new Date(a.appointmentAt || 0).getTime();
          const tB = b.appointmentAt?.seconds ? b.appointmentAt.seconds * 1000 : new Date(b.appointmentAt || 0).getTime();
          return tA - tB;
        });

        callback(appointments);
      },
      (error) => {
        console.error('Error subscribing to facility appointments:', error);
      }
    );
  },

  /**
   * Create a new appointment
   */
  async createAppointment(data: Omit<AppointmentData, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const appointmentTime = data.appointmentAt instanceof Date 
      ? Timestamp.fromDate(data.appointmentAt) 
      : data.appointmentAt || serverTimestamp();

    const docRef = await addDoc(collection(db, 'appointments'), {
      ...data,
      appointmentAt: appointmentTime,
      status: data.status || 'REQUESTED',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    if (data.patientId) {
      await eventsAndAuditService.createNotification({
        userId: data.patientId,
        type: 'APPOINTMENT',
        title: 'Appointment Booked',
        message: `Your appointment at ${data.facilityName || data.facilityId} has been scheduled.`,
        referenceId: docRef.id
      });
    }

    return docRef.id;
  },

  /**
   * Update appointment status (CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED)
   */
  async updateAppointmentStatus(
    appointmentId: string,
    status: AppointmentStatus,
    extraData?: { cancellationReason?: string; queueNumber?: number; patientId?: string; facilityId?: string; district?: string }
  ): Promise<void> {
    const docRef = doc(db, 'appointments', appointmentId);
    await updateDoc(docRef, {
      status,
      ...(extraData?.cancellationReason ? { cancellationReason: extraData.cancellationReason } : {}),
      ...(extraData?.queueNumber !== undefined ? { queueNumber: extraData.queueNumber } : {}),
      updatedAt: serverTimestamp()
    });

    if (status === 'COMPLETED' && extraData?.facilityId) {
      await eventsAndAuditService.recordOperationalEvent({
        eventType: 'APPOINTMENT_COMPLETED',
        facilityId: extraData.facilityId,
        district: extraData.district || 'Maharashtra',
        status: 'COMPLETED',
        actorRole: 'DOCTOR'
      });
    }

    if (extraData?.patientId) {
      await eventsAndAuditService.createNotification({
        userId: extraData.patientId,
        type: 'APPOINTMENT',
        title: `Appointment ${status}`,
        message: `Your appointment status has been updated to ${status}.`,
        referenceId: appointmentId
      });
    }
  }
};
