import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { eventsAndAuditService } from './eventsAndAuditService';

export interface PatientData {
  id?: string;
  patientId: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  phone: string;
  address: string;
  village: string;
  taluka: string;
  district: string;
  bloodGroup: string;
  emergencyContact: string;
  abhaId?: string;
  allergies: string[];
  conditions: string[];
  currentMedicines?: string[];
  isHighRisk: boolean;
  facilityId: string;
  facilityName?: string;
  registeredDate: string;
  lastVisitDate?: string;
  notes?: string;
  createdAt?: Timestamp | any;
  updatedAt?: Timestamp | any;
}

export const patientsService = {
  /**
   * Real-time listener for patients registered at a facility
   */
  subscribeFacilityPatients(facilityId: string, callback: (patients: PatientData[]) => void) {
    if (!facilityId) {
      callback([]);
      return () => {};
    }

    const q = query(
      collection(db, 'patients'),
      where('facilityId', '==', facilityId)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const list: PatientData[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        })) as PatientData[];

        list.sort((a, b) => {
          const tA = a.createdAt?.seconds || 0;
          const tB = b.createdAt?.seconds || 0;
          return tB - tA;
        });

        callback(list);
      },
      (error) => {
        console.error('Error subscribing to patients:', error);
      }
    );
  },

  /**
   * Create a new patient record in Firestore
   */
  async createPatient(data: Omit<PatientData, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'patients'), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Send notification for ABHA-linked patients
    if (data.abhaId) {
      await eventsAndAuditService.createNotification({
        userId: docRef.id,
        type: 'SYSTEM',
        title: 'Registration Complete',
        message: `Welcome ${data.name}! You have been registered at ${data.facilityName || 'the healthcare facility'}. Your Patient ID is ${data.patientId}.`,
        referenceId: docRef.id
      });
    }

    return docRef.id;
  },

  /**
   * Update an existing patient record
   */
  async updatePatient(patientDocId: string, updates: Partial<PatientData>): Promise<void> {
    const docRef = doc(db, 'patients', patientDocId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  }
};
