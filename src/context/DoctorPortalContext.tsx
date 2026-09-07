import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import {
  PatientRecord,
  AppointmentItem,
  QueuePatientItem,
  ConsultationRecord,
  PrescriptionRecord,
  LabOrderItem,
  ReferralItem,
  TeleconsultSession,
  FollowUpItem,
  FacilityCapacity,
  ToastMessage,
  PriorityLevel,
  AppointmentStatus
} from '../types/doctor';
import { useAuth } from './AuthContext';
import {
  appointmentsService,
  consultationsService,
  labService,
  pharmacyService,
  referralsAndFollowupsService,
  eventsAndAuditService,
  patientsService
} from '../services/firestore';

interface ComputedStats {
  todayAppointmentsCount: number;
  completedAppointmentsCount: number;
  waitingPatientsCount: number;
  priorityCasesCount: number;
  completedConsultationsCount: number;
  pendingLabReportsCount: number;
  pendingReferralsCount: number;
  dueFollowUpsCount: number;
  avgWaitMinutes: number;
}

interface DoctorPortalContextType {
  patients: PatientRecord[];
  appointments: AppointmentItem[];
  queue: QueuePatientItem[];
  consultations: ConsultationRecord[];
  prescriptions: PrescriptionRecord[];
  labOrders: LabOrderItem[];
  referrals: ReferralItem[];
  teleconsultations: TeleconsultSession[];
  followUps: FollowUpItem[];
  facilityCapacity: FacilityCapacity;
  toasts: ToastMessage[];
  activeConsultationPatient: PatientRecord | null;
  activeQueueItem: QueuePatientItem | null;
  stats: ComputedStats;

  setActiveConsultationPatient: (patient: PatientRecord | null) => void;
  setActiveQueueItem: (item: QueuePatientItem | null) => void;

  registerPatient: (patient: Omit<PatientRecord, 'id' | 'patientId' | 'registeredDate'>) => PatientRecord;
  updatePatient: (patientId: string, updates: Partial<PatientRecord>) => void;
  getPatientById: (patientId: string) => PatientRecord | undefined;

  bookAppointment: (apt: Omit<AppointmentItem, 'id' | 'status'>) => AppointmentItem;
  checkInAppointment: (appointmentId: string) => { appointment: AppointmentItem; queueItem: QueuePatientItem };
  updateAppointmentStatus: (appointmentId: string, status: AppointmentStatus) => void;
  rescheduleAppointment: (appointmentId: string, newDate: string, newTime: string) => void;
  cancelAppointment: (appointmentId: string, reason?: string) => void;

  callPatient: (queueId: string) => void;
  recallPatient: (queueId: string) => void;
  startConsultationFromQueue: (queueId: string) => PatientRecord | undefined;
  skipPatient: (queueId: string) => void;
  markNoShow: (queueId: string) => void;
  changeQueuePriority: (queueId: string, priority: PriorityLevel) => void;
  completeQueueItem: (queueId: string) => void;

  saveConsultationDraft: (consultation: Omit<ConsultationRecord, 'id' | 'status'> & { id?: string }) => ConsultationRecord;
  finalizeConsultation: (
    consultation: Omit<ConsultationRecord, 'id' | 'status'> & { id?: string },
    linkedModules?: {
      prescription?: Omit<PrescriptionRecord, 'id' | 'status' | 'consultationId'>;
      labOrders?: Omit<LabOrderItem, 'id' | 'status' | 'orderDate' | 'consultationId'>[];
      referral?: Omit<ReferralItem, 'id' | 'status' | 'createdDate' | 'consultationId'>;
      followUp?: Omit<FollowUpItem, 'id' | 'createdDate' | 'completionStatus' | 'reminderStatus' | 'consultationId'>;
    }
  ) => ConsultationRecord;
  addConsultationAddendum: (consultationId: string, doctorName: string, note: string) => void;

  createPrescription: (prescription: Omit<PrescriptionRecord, 'id'>) => PrescriptionRecord;
  updatePrescriptionStatus: (rxId: string, status: PrescriptionRecord['status']) => void;
  cancelPrescription: (rxId: string, reason: string) => void;

  createLabOrder: (order: Omit<LabOrderItem, 'id' | 'orderDate' | 'status'>) => LabOrderItem;
  updateLabOrderStatus: (orderId: string, status: LabOrderItem['status']) => void;
  addDoctorLabInterpretation: (orderId: string, interpretation: string) => void;
  markLabOrderReviewed: (orderId: string) => void;

  createReferral: (referral: Omit<ReferralItem, 'id' | 'createdDate' | 'status'>) => ReferralItem;
  updateReferralStatus: (referralId: string, status: ReferralItem['status'], outcome?: string) => void;
  simulateReceivingResponse: (referralId: string) => void;
  cancelReferral: (referralId: string, reason: string) => void;

  createTeleconsult: (session: Omit<TeleconsultSession, 'id' | 'status'>) => TeleconsultSession;
  updateTeleconsultStatus: (teleId: string, status: TeleconsultSession['status']) => void;

  createFollowUp: (followUp: Omit<FollowUpItem, 'id' | 'createdDate' | 'completionStatus' | 'reminderStatus'>) => FollowUpItem;
  addFollowUp: (followUp: Omit<FollowUpItem, 'id' | 'createdDate' | 'completionStatus' | 'reminderStatus'>) => FollowUpItem;
  completeFollowUp: (followUpId: string, notes?: string) => void;
  rescheduleFollowUp: (followUpId: string, newDate: string) => void;
  updateFollowUpStatus: (followUpId: string, status: 'completed' | 'rescheduled' | 'pending' | 'overdue', newDate?: string) => void;
  sendReminder: (followUpId: string) => void;

  teleconsults: TeleconsultSession[];
  dashboardStats: ComputedStats;

  updateFacilityCapacity: (updates: Partial<FacilityCapacity>) => void;
  addToast: (
    toastOrType: Omit<ToastMessage, 'id'> | 'success' | 'error' | 'info' | 'warning',
    title?: string,
    message?: string
  ) => void;
  removeToast: (toastId: string) => void;
}

const DoctorPortalContext = createContext<DoctorPortalContextType | undefined>(undefined);

export const DoctorPortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const facilityId = user?.facilityId || user?.facilityCode || 'MH-PHC-101';
  const doctorId = user?.id || user?.uid || 'DOC-DEFAULT';
  const doctorName = user?.name || user?.displayName || 'Dr. Medical Officer';

  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [queue, setQueue] = useState<QueuePatientItem[]>([]);
  const [consultations, setConsultations] = useState<ConsultationRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<PrescriptionRecord[]>([]);
  const [labOrders, setLabOrders] = useState<LabOrderItem[]>([]);
  const [referrals, setReferrals] = useState<ReferralItem[]>([]);
  const [teleconsultations, setTeleconsultations] = useState<TeleconsultSession[]>([]);
  const [followUps, setFollowUps] = useState<FollowUpItem[]>([]);
  const [facilityCapacity, setFacilityCapacity] = useState<FacilityCapacity>({
    facilityName: user?.facilityName || 'District Healthcare Facility',
    facilityCode: facilityId,
    district: user?.district || 'Maharashtra',
    staff: {
      doctorsOnDuty: 4,
      nursesAvailable: 12,
      specialistsAvailable: 2,
      currentWorkload: 'Moderate',
      shiftStatus: 'Morning Shift'
    },
    services: {
      opd: 'Operational',
      emergency: 'Operational',
      teleconsultation: 'Online',
      laboratory: 'Processing',
      pharmacy: 'Dispensing'
    },
    infrastructure: {
      totalBeds: 50,
      availableBeds: 18,
      ambulancesAvailable: 2,
      oxygenCylinders: 45,
      powerBackup: 'Active (Main Grid)',
      internetConnectivity: 'High Speed Fiber (ABDM Connected)'
    },
    equipment: [],
    lastUpdated: 'Live from Network'
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // ─── Real-time Firestore Listeners ──────────────────────────────────────────
  useEffect(() => {
    if (!facilityId) return;

    // 1. Appointments
    const unsubAppts = appointmentsService.subscribeFacilityAppointments(facilityId, (data) => {
      if (data && data.length > 0) {
        const mapped: AppointmentItem[] = data.map((d) => {
          let dateStr = new Date().toISOString().split('T')[0];
          let timeStr = '10:00 AM';
          if (d.appointmentAt) {
            const dateObj = d.appointmentAt.seconds ? new Date(d.appointmentAt.seconds * 1000) : new Date(d.appointmentAt);
            if (!isNaN(dateObj.getTime())) {
              dateStr = dateObj.toISOString().split('T')[0];
              timeStr = dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
            }
          }
          let mappedStatus: AppointmentStatus = 'scheduled';
          if (d.status === 'CONFIRMED') mappedStatus = 'confirmed';
          else if (d.status === 'SCHEDULED' || d.status === 'REQUESTED') mappedStatus = 'scheduled';
          else if (d.status === 'IN_PROGRESS' || d.status === 'CHECKED_IN') mappedStatus = 'in_queue';
          else if (d.status === 'COMPLETED') mappedStatus = 'completed';
          else if (d.status === 'CANCELLED') mappedStatus = 'cancelled';
          else if (d.status === 'NO_SHOW') mappedStatus = 'no_show';

          return {
            id: d.id || '',
            patientId: d.patientId,
            patientName: d.patientName,
            date: dateStr,
            time: timeStr,
            type: 'in_person',
            department: d.department || 'General Medicine',
            doctorName: d.doctorName || doctorName,
            reason: d.reason || 'General Consultation',
            status: mappedStatus,
            queueToken: d.queueNumber ? `A-${d.queueNumber.toString().padStart(3, '0')}` : undefined
          };
        });
        setAppointments(mapped);
      }
    });

    // 2. Consultations
    const unsubCons = consultationsService.subscribeFacilityConsultations(facilityId, (data) => {
      if (data && data.length > 0) {
        const mapped: ConsultationRecord[] = data.map((c) => ({
          id: c.id || '',
          patientId: c.patientId,
          patientName: c.patientName || 'Patient',
          doctorId: c.doctorId,
          doctorName: c.doctorName,
          date: c.createdAt?.seconds ? new Date(c.createdAt.seconds * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          chiefComplaint: c.chiefComplaints?.[0] || 'Consultation',
          symptoms: c.chiefComplaints || [],
          duration: '3 days',
          severity: 'moderate',
          vitals: {},
          examinationNotes: c.clinicalNotes || '',
          provisionalDiagnosis: c.diagnosis,
          finalDiagnosis: c.diagnosis,
          clinicalAdvice: c.instructions,
          status: c.status === 'COMPLETED' ? 'finalized' : 'draft'
        }));
        setConsultations(mapped);
      }
    });

    // 3. Lab Orders
    const unsubLab = labService.subscribeFacilityLabOrders(facilityId, (data) => {
      if (data && data.length > 0) {
        const mapped: LabOrderItem[] = data.map((l) => ({
          id: l.id || '',
          patientId: l.patientId,
          patientName: l.patientName,
          doctorName: l.doctorName,
          diagnosticCentre: 'Central District Lab',
          testCategory: l.testCategory || 'General Pathology',
          tests: l.testNames,
          clinicalReason: l.clinicalNotes || 'Diagnostic Evaluation',
          urgency: l.priority === 'EMERGENCY' ? 'emergency' : l.priority === 'URGENT' ? 'urgent' : 'routine',
          sampleType: 'Blood',
          fastingRequired: false,
          orderDate: l.createdAt?.seconds ? new Date(l.createdAt.seconds * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          status: l.status === 'VERIFIED' ? 'report_ready' : l.status === 'PROCESSING' ? 'processing' : l.status === 'SAMPLE_COLLECTED' ? 'sample_collected' : 'ordered'
        }));
        setLabOrders(mapped);
      }
    });

    // 4. Prescriptions
    const unsubRx = pharmacyService.subscribePrescriptions(facilityId, (data) => {
      if (data && data.length > 0) {
        const mapped: PrescriptionRecord[] = data.map((rx) => ({
          id: rx.id || '',
          patientId: rx.patientId,
          patientName: rx.patientName,
          doctorId: rx.doctorId,
          doctorName: rx.doctorName,
          facilityName: rx.facilityName || 'District Facility',
          date: rx.createdAt?.seconds ? new Date(rx.createdAt.seconds * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          diagnosis: 'General Prescription',
          status: rx.status === 'DISPENSED' ? 'dispensed' : rx.status === 'PARTIALLY_DISPENSED' ? 'partially_dispensed' : rx.status === 'CANCELLED' ? 'cancelled' : 'finalized',
          medicines: rx.medicines.map((m, idx) => ({
            id: `med-${idx}`,
            medicineName: m.medicineName,
            genericName: m.medicineName,
            strength: m.dosage || '500 mg',
            dosage: m.dosage || '1 tablet',
            frequency: m.frequency || 'Twice daily (1-0-1)',
            route: 'Oral',
            duration: `${m.durationDays || 5} days`,
            quantity: m.totalQuantity || 10,
            timing: 'after_food',
            instructions: m.instructions
          })),
          instructions: rx.instructions,
          allergiesChecked: true
        }));
        setPrescriptions(mapped);
      }
    });

    // 5. Referrals
    const unsubRef = referralsAndFollowupsService.subscribeFacilityReferrals(facilityId, (data) => {
      if (data && data.length > 0) {
        const mapped: ReferralItem[] = data.map((r) => ({
          id: r.id || '',
          patientId: r.patientId,
          patientName: r.patientName,
          referringDoctor: r.referringDoctorName,
          referringFacility: r.fromFacilityName,
          receivingFacility: r.toFacilityName,
          department: r.specialtyRequired,
          referralReason: r.reasonForReferral,
          clinicalSummary: r.clinicalSummary,
          provisionalDiagnosis: r.reasonForReferral,
          urgency: r.priority === 'CRITICAL' ? 'emergency' : r.priority === 'URGENT' ? 'urgent' : 'routine',
          preferredDate: new Date().toISOString().split('T')[0],
          transportRequired: false,
          createdDate: r.createdAt?.seconds ? new Date(r.createdAt.seconds * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          status: (r.status.toLowerCase() as any) || 'sent'
        }));
        setReferrals(mapped);
      }
    });

    // 6. Follow-ups
    const unsubFup = referralsAndFollowupsService.subscribeFacilityFollowUps(facilityId, (data) => {
      if (data && data.length > 0) {
        const mapped: FollowUpItem[] = data.map((f) => ({
          id: f.id || '',
          patientId: f.patientId,
          patientName: f.patientName,
          reason: f.notes,
          dueDate: f.scheduledDate?.seconds ? new Date(f.scheduledDate.seconds * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          riskLevel: 'moderate',
          category: 'general',
          assignedWorker: f.doctorName,
          reminderStatus: 'sent',
          completionStatus: f.status === 'COMPLETED' ? 'completed' : f.status === 'MISSED' ? 'overdue' : 'pending',
          createdDate: f.createdAt?.seconds ? new Date(f.createdAt.seconds * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          notes: f.notes
        }));
        setFollowUps(mapped);
      }
    });

    // 7. Teleconsultations
    const unsubTele = referralsAndFollowupsService.subscribeDoctorTeleconsultations(doctorId, (data) => {
      if (data && data.length > 0) {
        const mapped: TeleconsultSession[] = data.map((t) => ({
          id: t.id || '',
          patientId: t.patientId,
          patientName: t.patientName,
          scheduledTime: t.scheduledTime?.seconds ? new Date(t.scheduledTime.seconds * 1000).toISOString() : new Date().toISOString(),
          durationMinutes: 15,
          department: 'General Medicine',
          doctorName: t.doctorName,
          status: t.status === 'IN_PROGRESS' ? 'in_progress' : t.status === 'COMPLETED' ? 'completed' : 'scheduled',
          notes: t.notes || t.meetingLink || 'https://meet.google.com/tfx-psfd-xjd',
          meetingLink: t.meetingLink || 'https://meet.google.com/tfx-psfd-xjd'
        }));
        setTeleconsultations(mapped);
      }
    });

    // 8. Patients collection (facility-scoped)
    const unsubPatients = patientsService.subscribeFacilityPatients(facilityId, (data) => {
      if (data && data.length > 0) {
        const mapped: PatientRecord[] = data.map((p) => ({
          id: p.id || '',
          patientId: p.patientId,
          name: p.name,
          age: p.age,
          gender: p.gender,
          dob: p.dob,
          phone: p.phone,
          address: p.address,
          village: p.village,
          taluka: p.taluka,
          district: p.district,
          bloodGroup: p.bloodGroup,
          emergencyContact: p.emergencyContact,
          abhaId: p.abhaId,
          allergies: p.allergies || [],
          conditions: p.conditions || [],
          currentMedicines: p.currentMedicines,
          isHighRisk: p.isHighRisk || false,
          registeredDate: p.registeredDate || (p.createdAt?.seconds ? new Date(p.createdAt.seconds * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
          lastVisitDate: p.lastVisitDate,
          notes: p.notes
        }));
        setPatients(mapped);
      }
    });

    return () => {
      unsubAppts();
      unsubCons();
      unsubLab();
      unsubRx();
      unsubRef();
      unsubFup();
      unsubTele();
      unsubPatients();
    };
  }, [facilityId, doctorId, doctorName]);

  // Active workspace selections
  const [activeConsultationPatient, setActiveConsultationPatient] = useState<PatientRecord | null>(null);
  const [activeQueueItem, setActiveQueueItem] = useState<QueuePatientItem | null>(null);

  // Toast Management
  const addToast = useCallback(
    (
      toastOrType: Omit<ToastMessage, 'id'> | 'success' | 'error' | 'info' | 'warning',
      title?: string,
      message?: string
    ) => {
      const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
      const newToast: ToastMessage =
        typeof toastOrType === 'string'
          ? { id, type: toastOrType, title: title || '', message }
          : { ...toastOrType, id };

      setToasts((prev) => [...prev, newToast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4500);
    },
    []
  );

  const removeToast = useCallback((toastId: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  }, []);

  // Computed Dynamic Metrics
  const stats: ComputedStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayAppts = appointments.filter((a) => a.date === today);
    const completedAppts = appointments.filter((a) => a.status === 'completed');
    const waitingInQueue = queue.filter((q) => q.status === 'waiting' || q.status === 'called');
    const priorityInQueue = waitingInQueue.filter((q) => q.priority === 'high' || q.priority === 'emergency');
    const completedCons = consultations.filter((c) => c.status === 'finalized');
    const pendingLabs = labOrders.filter((l) => l.status === 'ordered' || l.status === 'processing');
    const pendingRefs = referrals.filter((r) => r.status === 'sent' || r.status === 'accepted');
    const dueFups = followUps.filter((f) => f.completionStatus === 'pending');
    const totalWaitingMins = waitingInQueue.reduce((acc, curr) => acc + curr.waitingMinutes, 0);
    const avgWait = waitingInQueue.length > 0 ? Math.round(totalWaitingMins / waitingInQueue.length) : 10;

    return {
      todayAppointmentsCount: todayAppts.length || appointments.length,
      completedAppointmentsCount: completedAppts.length,
      waitingPatientsCount: waitingInQueue.length,
      priorityCasesCount: priorityInQueue.length,
      completedConsultationsCount: completedCons.length,
      pendingLabReportsCount: pendingLabs.length,
      pendingReferralsCount: pendingRefs.length,
      dueFollowUpsCount: dueFups.length,
      avgWaitMinutes: avgWait
    };
  }, [appointments, queue, consultations, labOrders, referrals, followUps]);

  // Patient Actions
  const registerPatient = useCallback((patientData: Omit<PatientRecord, 'id' | 'patientId' | 'registeredDate'>): PatientRecord => {
    const nextNum = (patients.length + 1).toString().padStart(5, '0');
    const newId = 'pt-' + Date.now();
    const patientId = `MH-PUN-${nextNum}`;
    const newPatient: PatientRecord = {
      ...patientData,
      id: newId,
      patientId,
      registeredDate: new Date().toISOString().split('T')[0]
    };

    setPatients((prev) => [newPatient, ...prev]);

    patientsService.createPatient({
      patientId,
      name: patientData.name,
      age: patientData.age,
      gender: patientData.gender,
      dob: patientData.dob,
      phone: patientData.phone,
      address: patientData.address,
      village: patientData.village,
      taluka: patientData.taluka,
      district: patientData.district,
      bloodGroup: patientData.bloodGroup,
      emergencyContact: patientData.emergencyContact,
      abhaId: patientData.abhaId,
      allergies: patientData.allergies || [],
      conditions: patientData.conditions || [],
      currentMedicines: patientData.currentMedicines,
      isHighRisk: patientData.isHighRisk || false,
      facilityId,
      facilityName: user?.facilityName || 'District Healthcare Facility',
      registeredDate: new Date().toISOString().split('T')[0]
    }).catch((err) => {
      console.warn('Could not sync new patient with Firestore:', err);
    });

    addToast({
      type: 'success',
      title: 'Patient Registered',
      message: `${newPatient.name} assigned Patient ID: ${patientId}`
    });

    return newPatient;
  }, [patients.length, facilityId, user?.facilityName, addToast]);

  const updatePatient = useCallback(async (patientId: string, updates: Partial<PatientRecord>) => {
    try {
      const patient = patients.find((p) => p.id === patientId || p.patientId === patientId);
      const docId = patient?.id || patientId;
      await patientsService.updatePatient(docId, updates);
      addToast({
        type: 'info',
        title: 'Patient Updated',
        message: 'Patient clinical details updated successfully.'
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Could not update patient details.'
      });
    }
  }, [patients, addToast]);

  const getPatientById = useCallback((patientId: string) => {
    return patients.find((p) => p.id === patientId || p.patientId === patientId);
  }, [patients]);

  // Appointment Actions
  const bookAppointment = useCallback((aptData: Omit<AppointmentItem, 'id' | 'status'>): AppointmentItem => {
    const id = 'apt-' + Date.now();
    const newApt: AppointmentItem = {
      ...aptData,
      id,
      status: 'scheduled'
    };

    setAppointments((prev) => [newApt, ...prev]);

    appointmentsService.createAppointment({
      patientId: aptData.patientId,
      patientName: aptData.patientName,
      facilityId,
      facilityName: user?.facilityName || 'District Facility',
      doctorId,
      doctorName: aptData.doctorName || doctorName,
      department: aptData.department || 'General Medicine',
      appointmentAt: new Date(`${aptData.date} ${aptData.time}`),
      reason: aptData.reason || 'General Checkup',
      status: 'SCHEDULED' as any
    }).catch((err) => console.error('Firestore appointment create error:', err));

    addToast({
      type: 'success',
      title: 'Appointment Booked',
      message: `Slot scheduled for ${newApt.patientName} at ${newApt.time} (${newApt.date})`
    });
    return newApt;
  }, [facilityId, user?.facilityName, doctorId, doctorName, addToast]);

  const checkInAppointment = useCallback((appointmentId: string) => {
    const apt = appointments.find((a) => a.id === appointmentId);
    if (!apt) throw new Error('Appointment not found');

    const patient = patients.find((p) => p.id === apt.patientId || p.patientId === apt.patientId);
    const nextTokenNum = (queue.length + 1).toString().padStart(3, '0');
    const token = `A-${nextTokenNum}`;

    const updatedApt: AppointmentItem = {
      ...apt,
      status: 'in_queue',
      queueToken: token
    };
    setAppointments((prev) => prev.map((a) => (a.id === appointmentId ? updatedApt : a)));

    const newQueueItem: QueuePatientItem = {
      id: 'q-' + Date.now(),
      token,
      patientId: apt.patientId,
      patientName: apt.patientName,
      age: patient?.age || 35,
      gender: patient?.gender || 'Female',
      reason: apt.reason,
      checkInTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      waitingMinutes: 0,
      priority: patient?.isHighRisk ? 'high' : 'normal',
      doctorName: apt.doctorName,
      status: 'waiting',
      abhaId: patient?.abhaId,
      vitalSummary: patient?.vitals ? `BP: ${patient.vitals.bpSys}/${patient.vitals.bpDia} | Pulse: ${patient.vitals.pulse} bpm` : undefined,
      vitals: patient?.vitals
    };
    setQueue((prev) => [newQueueItem, ...prev]);

    appointmentsService.updateAppointmentStatus(appointmentId, 'IN_PROGRESS', {
      queueNumber: parseInt(nextTokenNum, 10),
      patientId: apt.patientId,
      facilityId,
      district: user?.district
    }).catch((err) => console.error('Firestore appointment check-in error:', err));

    addToast({
      type: 'success',
      title: 'Patient Checked In',
      message: `${apt.patientName} checked in. Assigned Token ${token} in Live OPD Queue.`
    });

    return { appointment: updatedApt, queueItem: newQueueItem };
  }, [appointments, patients, queue.length, facilityId, user?.district, addToast]);

  const updateAppointmentStatus = useCallback((appointmentId: string, status: AppointmentStatus) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === appointmentId ? { ...a, status } : a))
    );

    let firestoreStatus: any = 'CONFIRMED';
    if (status === 'completed') firestoreStatus = 'COMPLETED';
    else if (status === 'cancelled') firestoreStatus = 'CANCELLED';
    else if (status === 'in_queue') firestoreStatus = 'IN_PROGRESS';

    appointmentsService.updateAppointmentStatus(appointmentId, firestoreStatus, {
      facilityId,
      district: user?.district
    }).catch(err => console.error('Appointment status sync error:', err));

    addToast({
      type: 'info',
      title: 'Appointment Updated',
      message: `Status updated to ${status}.`
    });
  }, [facilityId, user?.district, addToast]);

  const rescheduleAppointment = useCallback((appointmentId: string, newDate: string, newTime: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === appointmentId ? { ...a, date: newDate, time: newTime, status: 'confirmed' } : a))
    );
    addToast({
      type: 'success',
      title: 'Appointment Rescheduled',
      message: `Rescheduled to ${newDate} at ${newTime}.`
    });
  }, [addToast]);

  const cancelAppointment = useCallback((appointmentId: string, reason?: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === appointmentId ? { ...a, status: 'cancelled', notes: reason ? `Cancelled: ${reason}` : a.notes } : a))
    );
    appointmentsService.updateAppointmentStatus(appointmentId, 'CANCELLED', {
      cancellationReason: reason,
      facilityId,
      district: user?.district
    }).catch(err => console.error('Appointment cancel sync error:', err));

    addToast({
      type: 'warning',
      title: 'Appointment Cancelled',
      message: 'Appointment has been cancelled.'
    });
  }, [facilityId, user?.district, addToast]);

  // Queue Actions
  const callPatient = useCallback((queueId: string) => {
    const item = queue.find((q) => q.id === queueId);
    if (!item) return;

    setQueue((prev) =>
      prev.map((q) => (q.id === queueId ? { ...q, status: 'called' } : q))
    );
    addToast({
      type: 'info',
      title: 'Patient Called',
      message: `Token ${item.token} (${item.patientName}) called to Consultation Chamber.`
    });
  }, [queue, addToast]);

  const recallPatient = useCallback((queueId: string) => {
    const item = queue.find((q) => q.id === queueId);
    if (!item) return;

    addToast({
      type: 'info',
      title: 'Repeat Call Dispatched',
      message: `Re-announcing Token ${item.token} on OPD Display and SMS alert.`
    });
  }, [queue, addToast]);

  const startConsultationFromQueue = useCallback((queueId: string): PatientRecord | undefined => {
    const item = queue.find((q) => q.id === queueId);
    if (!item) return undefined;

    setQueue((prev) =>
      prev.map((q) => (q.id === queueId ? { ...q, status: 'in_consultation' } : q))
    );

    const patient = patients.find((p) => p.id === item.patientId || p.patientId === item.patientId);
    if (patient) {
      setActiveConsultationPatient(patient);
      setActiveQueueItem(item);
      addToast({
        type: 'success',
        title: 'Consultation Started',
        message: `Active clinical workspace loaded for ${patient.name} (${item.token}).`
      });
      return patient;
    }
    return undefined;
  }, [queue, patients, addToast]);

  const skipPatient = useCallback((queueId: string) => {
    setQueue((prev) =>
      prev.map((q) => (q.id === queueId ? { ...q, status: 'skipped' } : q))
    );
    addToast({
      type: 'warning',
      title: 'Queue Item Skipped',
      message: 'Patient moved to skipped queue. Can be recalled later.'
    });
  }, [addToast]);

  const markNoShow = useCallback((queueId: string) => {
    setQueue((prev) =>
      prev.map((q) => (q.id === queueId ? { ...q, status: 'no_show' } : q))
    );
    addToast({
      type: 'warning',
      title: 'Marked No-Show',
      message: 'Patient marked as No-Show.'
    });
  }, [addToast]);

  const changeQueuePriority = useCallback((queueId: string, priority: PriorityLevel) => {
    setQueue((prev) =>
      prev.map((q) => (q.id === queueId ? { ...q, priority } : q))
    );
    addToast({
      type: 'info',
      title: 'Priority Updated',
      message: `Queue priority set to ${priority.toUpperCase()}.`
    });
  }, [addToast]);

  const completeQueueItem = useCallback((queueId: string) => {
    setQueue((prev) =>
      prev.map((q) => (q.id === queueId ? { ...q, status: 'completed' } : q))
    );
  }, []);

  // Consultation Actions
  const saveConsultationDraft = useCallback((consultationData: Omit<ConsultationRecord, 'id' | 'status'> & { id?: string }): ConsultationRecord => {
    const id = consultationData.id || 'CONS-' + Date.now();
    const draft: ConsultationRecord = {
      ...consultationData,
      id,
      status: 'draft'
    };

    setConsultations((prev) => {
      const exists = prev.some((c) => c.id === id);
      return exists ? prev.map((c) => (c.id === id ? draft : c)) : [draft, ...prev];
    });

    addToast({
      type: 'info',
      title: 'Draft Saved',
      message: 'Consultation draft saved successfully.'
    });
    return draft;
  }, [addToast]);

  const finalizeConsultation = useCallback((
    consultationData: Omit<ConsultationRecord, 'id' | 'status'> & { id?: string },
    linkedModules?: {
      prescription?: Omit<PrescriptionRecord, 'id' | 'status' | 'consultationId'>;
      labOrders?: Omit<LabOrderItem, 'id' | 'status' | 'orderDate' | 'consultationId'>[];
      referral?: Omit<ReferralItem, 'id' | 'status' | 'createdDate' | 'consultationId'>;
      followUp?: Omit<FollowUpItem, 'id' | 'createdDate' | 'completionStatus' | 'reminderStatus' | 'consultationId'>;
    }
  ): ConsultationRecord => {
    const id = consultationData.id || 'CONS-' + Date.now();
    let rxId: string | undefined;
    const labIds: string[] = [];
    let refId: string | undefined;
    let fupId: string | undefined;

    // 1. Prescription
    if (linkedModules?.prescription && linkedModules.prescription.medicines.length > 0) {
      rxId = 'Rx-' + Date.now().toString().slice(-6);
      const newRx: PrescriptionRecord = {
        ...linkedModules.prescription,
        id: rxId,
        consultationId: id,
        status: 'finalized',
        allergiesChecked: true
      };
      setPrescriptions((prev) => [newRx, ...prev]);

      pharmacyService.createPrescription({
        consultationId: id,
        patientId: consultationData.patientId,
        patientName: consultationData.patientName || 'Patient',
        doctorId,
        doctorName: consultationData.doctorName || doctorName,
        facilityId,
        facilityName: user?.facilityName || 'District Facility',
        medicines: linkedModules.prescription.medicines.map((m) => ({
          medicineId: m.id || m.medicineName,
          medicineName: m.medicineName,
          dosage: m.dosage,
          frequency: m.frequency,
          durationDays: parseInt(m.duration) || 5,
          totalQuantity: m.quantity,
          instructions: m.instructions || m.timing
        })),
        instructions: linkedModules.prescription.instructions || '',
        status: 'ACTIVE'
      }).catch(err => console.error('Firestore createPrescription error:', err));
    }

    // 2. Lab Orders
    if (linkedModules?.labOrders && linkedModules.labOrders.length > 0) {
      linkedModules.labOrders.forEach((lOrder) => {
        const orderId = 'LAB-ORD-' + Math.floor(100 + Math.random() * 900);
        labIds.push(orderId);
        const newLab: LabOrderItem = {
          ...lOrder,
          id: orderId,
          consultationId: id,
          orderDate: new Date().toISOString().split('T')[0],
          status: 'ordered'
        };
        setLabOrders((prev) => [newLab, ...prev]);

        labService.createLabOrder({
          consultationId: id,
          patientId: consultationData.patientId,
          patientName: consultationData.patientName || 'Patient',
          doctorId,
          doctorName: consultationData.doctorName || doctorName,
          facilityId,
          facilityName: user?.facilityName,
          testNames: lOrder.tests || [lOrder.testCategory],
          testCategory: lOrder.testCategory,
          priority: lOrder.urgency === 'emergency' ? 'EMERGENCY' : lOrder.urgency === 'urgent' ? 'URGENT' : 'NORMAL',
          clinicalNotes: lOrder.clinicalReason,
          status: 'ORDERED'
        }).catch(err => console.error('Firestore createLabOrder error:', err));
      });
    }

    // 3. Referral
    if (linkedModules?.referral && linkedModules.referral.receivingFacility) {
      refId = 'REF-' + Date.now().toString().slice(-6);
      const newRef: ReferralItem = {
        ...linkedModules.referral,
        id: refId,
        consultationId: id,
        createdDate: new Date().toISOString().split('T')[0],
        status: 'sent'
      };
      setReferrals((prev) => [newRef, ...prev]);

      referralsAndFollowupsService.createReferral({
        patientId: consultationData.patientId,
        patientName: consultationData.patientName || 'Patient',
        fromFacilityId: facilityId,
        fromFacilityName: linkedModules.referral.referringFacility || user?.facilityName || 'Origin Facility',
        toFacilityId: linkedModules.referral.receivingFacility,
        toFacilityName: linkedModules.referral.receivingFacility,
        referringDoctorId: doctorId,
        referringDoctorName: doctorName,
        priority: linkedModules.referral.urgency === 'emergency' ? 'CRITICAL' : linkedModules.referral.urgency === 'urgent' ? 'URGENT' : 'ROUTINE',
        specialtyRequired: linkedModules.referral.department || linkedModules.referral.specialist || 'Specialist Care',
        reasonForReferral: linkedModules.referral.referralReason,
        clinicalSummary: linkedModules.referral.clinicalSummary,
        status: 'SENT'
      }, user?.district).catch(err => console.error('Firestore createReferral error:', err));
    }

    // 4. Follow-up
    if (linkedModules?.followUp && linkedModules.followUp.dueDate) {
      fupId = 'FUP-' + Date.now().toString().slice(-6);
      const newFup: FollowUpItem = {
        ...linkedModules.followUp,
        id: fupId,
        consultationId: id,
        createdDate: new Date().toISOString().split('T')[0],
        completionStatus: 'pending',
        reminderStatus: 'sent'
      };
      setFollowUps((prev) => [newFup, ...prev]);

      referralsAndFollowupsService.createFollowUp({
        patientId: consultationData.patientId,
        patientName: consultationData.patientName || 'Patient',
        doctorId,
        doctorName,
        facilityId,
        facilityName: user?.facilityName,
        scheduledDate: new Date(linkedModules.followUp.dueDate),
        notes: linkedModules.followUp.notes || linkedModules.followUp.reason || 'Follow-up consultation',
        status: 'SCHEDULED'
      }).catch(err => console.error('Firestore createFollowUp error:', err));
    }

    // 5. Finalize Consultation
    const finalized: ConsultationRecord = {
      ...consultationData,
      id,
      status: 'finalized',
      prescriptionId: rxId,
      labOrderIds: labIds.length > 0 ? labIds : undefined,
      referralId: refId,
      followUpId: fupId
    };

    setConsultations((prev) => {
      const exists = prev.some((c) => c.id === id);
      return exists ? prev.map((c) => (c.id === id ? finalized : c)) : [finalized, ...prev];
    });

    const diagnosisText = consultationData.finalDiagnosis || consultationData.provisionalDiagnosis || 'General Consultation';
    const adviceText = consultationData.clinicalAdvice || '';

    consultationsService.createConsultation({
      appointmentId: activeQueueItem?.id || '',
      patientId: consultationData.patientId,
      patientName: consultationData.patientName,
      doctorId,
      doctorName: consultationData.doctorName || doctorName,
      facilityId,
      facilityName: user?.facilityName,
      chiefComplaints: [consultationData.chiefComplaint, ...(consultationData.symptoms || [])],
      diagnosis: diagnosisText,
      clinicalNotes: consultationData.examinationNotes,
      visitSummary: `${diagnosisText}. ${adviceText}`,
      instructions: adviceText,
      status: 'COMPLETED'
    }, user?.district).catch(err => console.error('Firestore createConsultation error:', err));

    if (activeQueueItem) {
      setQueue((prev) => prev.map((q) => (q.id === activeQueueItem.id ? { ...q, status: 'completed' } : q)));
      setActiveQueueItem(null);
    }
    setActiveConsultationPatient(null);

    addToast({
      type: 'success',
      title: 'Consultation Finalized & Synchronized',
      message: `Encounter for ${consultationData.patientName} saved to Firestore.`
    });

    return finalized;
  }, [doctorId, doctorName, facilityId, user?.facilityName, user?.district, activeQueueItem, addToast]);

  const addConsultationAddendum = useCallback((consultationId: string, docName: string, note: string) => {
    setConsultations((prev) =>
      prev.map((c) =>
        c.id === consultationId
          ? {
              ...c,
              addendums: [
                ...(c.addendums || []),
                {
                  date: new Date().toISOString().split('T')[0],
                  doctorName: docName,
                  note
                }
              ]
            }
          : c
      )
    );
    addToast({
      type: 'info',
      title: 'Clinical Addendum Added',
      message: 'Addendum recorded.'
    });
  }, [addToast]);

  // Prescription Actions
  const createPrescription = useCallback((prescription: Omit<PrescriptionRecord, 'id'>): PrescriptionRecord => {
    const id = 'Rx-' + Date.now().toString().slice(-6);
    const newRx: PrescriptionRecord = {
      ...prescription,
      id,
      status: 'finalized',
      allergiesChecked: true
    };
    setPrescriptions((prev) => [newRx, ...prev]);

    pharmacyService.createPrescription({
      consultationId: prescription.consultationId || '',
      patientId: prescription.patientId,
      patientName: prescription.patientName,
      doctorId,
      doctorName: prescription.doctorName || doctorName,
      facilityId,
      facilityName: user?.facilityName,
      medicines: prescription.medicines.map((m) => ({
        medicineId: m.id || m.medicineName,
        medicineName: m.medicineName,
        dosage: m.dosage,
        frequency: m.frequency,
        durationDays: parseInt(m.duration) || 5,
        totalQuantity: m.quantity,
        instructions: m.instructions || m.timing
      })),
      instructions: prescription.instructions || '',
      status: 'ACTIVE'
    }).catch(err => console.error('Firestore createPrescription error:', err));

    addToast({
      type: 'success',
      title: 'Prescription Issued',
      message: `Prescription issued for ${newRx.patientName}.`
    });
    return newRx;
  }, [doctorId, doctorName, facilityId, user?.facilityName, addToast]);

  const updatePrescriptionStatus = useCallback((rxId: string, status: PrescriptionRecord['status']) => {
    setPrescriptions((prev) =>
      prev.map((p) => (p.id === rxId ? { ...p, status } : p))
    );
  }, []);

  const cancelPrescription = useCallback((rxId: string, reason: string) => {
    setPrescriptions((prev) =>
      prev.map((p) => (p.id === rxId ? { ...p, status: 'cancelled', cancellationReason: reason } : p))
    );
    addToast({
      type: 'warning',
      title: 'Prescription Cancelled',
      message: `Cancelled: ${reason}`
    });
  }, [addToast]);

  // Lab Order Actions
  const createLabOrder = useCallback((order: Omit<LabOrderItem, 'id' | 'orderDate' | 'status'>): LabOrderItem => {
    const id = 'LAB-ORD-' + Math.floor(100 + Math.random() * 900);
    const newOrder: LabOrderItem = {
      ...order,
      id,
      orderDate: new Date().toISOString().split('T')[0],
      status: 'ordered'
    };
    setLabOrders((prev) => [newOrder, ...prev]);

    labService.createLabOrder({
      consultationId: order.consultationId,
      patientId: order.patientId,
      patientName: order.patientName,
      doctorId,
      doctorName: order.doctorName || doctorName,
      facilityId,
      facilityName: user?.facilityName,
      testNames: order.tests,
      testCategory: order.testCategory,
      priority: order.urgency === 'emergency' ? 'EMERGENCY' : order.urgency === 'urgent' ? 'URGENT' : 'NORMAL',
      clinicalNotes: order.clinicalReason,
      status: 'ORDERED'
    }).catch(err => console.error('Firestore createLabOrder error:', err));

    addToast({
      type: 'success',
      title: 'Lab Order Dispatched',
      message: `${order.tests.join(', ')} ordered for ${order.patientName}.`
    });
    return newOrder;
  }, [doctorId, doctorName, facilityId, user?.facilityName, addToast]);

  const updateLabOrderStatus = useCallback((orderId: string, status: LabOrderItem['status']) => {
    setLabOrders((prev) =>
      prev.map((l) => (l.id === orderId ? { ...l, status } : l))
    );
  }, []);

  const addDoctorLabInterpretation = useCallback((orderId: string, interpretation: string) => {
    setLabOrders((prev) =>
      prev.map((l) => (l.id === orderId ? { ...l, doctorInterpretation: interpretation, criticalIndicator: false } : l))
    );
    addToast({
      type: 'info',
      title: 'Clinical Interpretation Saved',
      message: 'Interpretation recorded.'
    });
  }, [addToast]);

  const markLabOrderReviewed = useCallback((orderId: string) => {
    setLabOrders((prev) =>
      prev.map((l) => (l.id === orderId ? { ...l, status: 'reviewed', reviewedDate: new Date().toISOString() } : l))
    );
    addToast({
      type: 'success',
      title: 'Lab Report Reviewed',
      message: 'Report acknowledged.'
    });
  }, [addToast]);

  // Referral Actions
  const createReferral = useCallback((referral: Omit<ReferralItem, 'id' | 'createdDate' | 'status'>): ReferralItem => {
    const id = 'REF-' + Date.now().toString().slice(-6);
    const newRef: ReferralItem = {
      ...referral,
      id,
      createdDate: new Date().toISOString().split('T')[0],
      status: 'sent'
    };
    setReferrals((prev) => [newRef, ...prev]);

    referralsAndFollowupsService.createReferral({
      patientId: referral.patientId,
      patientName: referral.patientName,
      fromFacilityId: facilityId,
      fromFacilityName: referral.referringFacility || user?.facilityName || 'Origin Facility',
      toFacilityId: referral.receivingFacility,
      toFacilityName: referral.receivingFacility,
      referringDoctorId: doctorId,
      referringDoctorName: doctorName,
      priority: referral.urgency === 'emergency' ? 'CRITICAL' : referral.urgency === 'urgent' ? 'URGENT' : 'ROUTINE',
      specialtyRequired: referral.department || referral.specialist || 'Specialty Care',
      reasonForReferral: referral.referralReason,
      clinicalSummary: referral.clinicalSummary,
      status: 'SENT'
    }, user?.district).catch(err => console.error('Firestore createReferral error:', err));

    addToast({
      type: 'success',
      title: 'Referral Initiated',
      message: `Referral sent to ${referral.receivingFacility}.`
    });
    return newRef;
  }, [facilityId, user?.facilityName, doctorId, doctorName, user?.district, addToast]);

  const updateReferralStatus = useCallback((referralId: string, status: ReferralItem['status']) => {
    setReferrals((prev) =>
      prev.map((r) => (r.id === referralId ? { ...r, status } : r))
    );
    referralsAndFollowupsService.updateReferralStatus(referralId, status.toUpperCase() as any)
      .catch(err => console.error('Referral status sync error:', err));

    addToast({
      type: 'info',
      title: 'Referral Status Updated',
      message: `Referral status is now ${status}.`
    });
  }, [addToast]);

  const simulateReceivingResponse = useCallback((referralId: string) => {
    setReferrals((prev) =>
      prev.map((r) =>
        r.id === referralId
          ? {
              ...r,
              status: 'accepted',
              receivingOutcome: 'Specialist appointment slot confirmed for upcoming clinical shift at receiving centre.'
            }
          : r
      )
    );
    referralsAndFollowupsService.updateReferralStatus(referralId, 'ACCEPTED')
      .catch(err => console.error('Referral accept sync error:', err));

    addToast({
      type: 'success',
      title: 'Referral Accepted by Receiving Facility',
      message: 'Confirmation received from tertiary referral desk.'
    });
  }, [addToast]);

  const cancelReferral = useCallback((referralId: string, reason: string) => {
    setReferrals((prev) =>
      prev.map((r) => (r.id === referralId ? { ...r, status: 'cancelled', doctorNotes: `Cancelled: ${reason}` } : r))
    );
    referralsAndFollowupsService.updateReferralStatus(referralId, 'REJECTED')
      .catch(err => console.error('Referral cancel sync error:', err));

    addToast({
      type: 'warning',
      title: 'Referral Cancelled',
      message: 'Referral cancelled.'
    });
  }, [addToast]);

  // Teleconsultation Actions
  const createTeleconsult = useCallback((sessionData: Omit<TeleconsultSession, 'id' | 'status'>): TeleconsultSession => {
    const id = 'TELE-' + Date.now().toString().slice(-6);
    const newSession: TeleconsultSession = {
      ...sessionData,
      id,
      status: 'scheduled',
      meetingLink: `https://telemed.swasthyasetu.gov.in/room/session-${id.toLowerCase()}`
    };

    setTeleconsultations((prev) => [newSession, ...prev]);

    referralsAndFollowupsService.createTeleconsultation({
      patientId: sessionData.patientId,
      patientName: sessionData.patientName,
      doctorId,
      doctorName: sessionData.doctorName || doctorName,
      facilityId,
      facilityName: user?.facilityName,
      scheduledTime: new Date(sessionData.scheduledTime),
      meetingLink: newSession.meetingLink || '',
      status: 'SCHEDULED'
    }).catch(err => console.error('Firestore teleconsult create error:', err));

    addToast({
      type: 'success',
      title: 'Teleconsultation Scheduled',
      message: `Session booked for ${newSession.patientName} at ${newSession.scheduledTime}.`
    });
    return newSession;
  }, [doctorId, doctorName, facilityId, user?.facilityName, addToast]);

  const updateTeleconsultStatus = useCallback((teleId: string, status: TeleconsultSession['status']) => {
    setTeleconsultations((prev) =>
      prev.map((t) => (t.id === teleId ? { ...t, status } : t))
    );
    let fireStatus: any = 'SCHEDULED';
    if (status === 'in_progress') fireStatus = 'IN_PROGRESS';
    else if (status === 'completed') fireStatus = 'COMPLETED';
    else if (status === 'cancelled') fireStatus = 'CANCELLED';

    referralsAndFollowupsService.updateTeleconsultationStatus(teleId, fireStatus)
      .catch(err => console.error('Teleconsult status sync error:', err));

    addToast({
      type: 'info',
      title: 'Session Status Updated',
      message: `Teleconsultation session is now ${status}.`
    });
  }, [addToast]);

  // Follow-up Actions
  const createFollowUp = useCallback((followUpData: Omit<FollowUpItem, 'id' | 'createdDate' | 'completionStatus' | 'reminderStatus'>): FollowUpItem => {
    const id = 'FUP-' + Date.now().toString().slice(-6);
    const newFup: FollowUpItem = {
      ...followUpData,
      id,
      createdDate: new Date().toISOString().split('T')[0],
      completionStatus: 'pending',
      reminderStatus: 'sent',
      lastContactedDate: new Date().toISOString().split('T')[0]
    };

    setFollowUps((prev) => [newFup, ...prev]);

    referralsAndFollowupsService.createFollowUp({
      patientId: followUpData.patientId,
      patientName: followUpData.patientName,
      doctorId,
      doctorName,
      facilityId,
      facilityName: user?.facilityName,
      scheduledDate: new Date(followUpData.dueDate),
      notes: followUpData.notes || followUpData.reason || 'Follow-up consultation',
      status: 'SCHEDULED'
    }).catch(err => console.error('Firestore follow-up create error:', err));

    addToast({
      type: 'success',
      title: 'Follow-up Scheduled',
      message: `Follow-up set for ${newFup.patientName} due on ${newFup.dueDate}.`
    });
    return newFup;
  }, [doctorId, doctorName, facilityId, user?.facilityName, addToast]);

  const completeFollowUp = useCallback((followUpId: string, notes?: string) => {
    setFollowUps((prev) =>
      prev.map((f) => (f.id === followUpId ? { ...f, completionStatus: 'completed', notes: notes || f.notes } : f))
    );
    referralsAndFollowupsService.updateFollowUpStatus(followUpId, 'COMPLETED')
      .catch(err => console.error('Follow-up complete sync error:', err));

    addToast({
      type: 'success',
      title: 'Follow-up Completed',
      message: 'Follow-up marked completed.'
    });
  }, [addToast]);

  const rescheduleFollowUp = useCallback((followUpId: string, newDate: string) => {
    setFollowUps((prev) =>
      prev.map((f) => (f.id === followUpId ? { ...f, dueDate: newDate, completionStatus: 'rescheduled' } : f))
    );
    referralsAndFollowupsService.updateFollowUpStatus(followUpId, 'RESCHEDULED')
      .catch(err => console.error('Follow-up reschedule sync error:', err));

    addToast({
      type: 'info',
      title: 'Follow-up Rescheduled',
      message: `New due date set to ${newDate}.`
    });
  }, [addToast]);

  const sendReminder = useCallback((followUpId: string) => {
    const fup = followUps.find((f) => f.id === followUpId);
    if (!fup) return;

    setFollowUps((prev) =>
      prev.map((f) =>
        f.id === followUpId
          ? {
              ...f,
              reminderStatus: 'delivered',
              lastContactedDate: new Date().toISOString().split('T')[0]
            }
          : f
      )
    );

    eventsAndAuditService.createNotification({
      userId: fup.patientId,
      type: 'APPOINTMENT',
      title: 'Follow-Up Reminder',
      message: `Reminder: Your follow-up is scheduled for ${fup.dueDate}.`,
      referenceId: followUpId
    }).catch(err => console.error('Reminder notification sync error:', err));

    addToast({
      type: 'success',
      title: 'Reminder Dispatched',
      message: `SMS & Notification alert dispatched to ${fup.patientName}.`
    });
  }, [followUps, addToast]);

  const updateFacilityCapacity = useCallback((updates: Partial<FacilityCapacity>) => {
    setFacilityCapacity((prev) => ({
      ...prev,
      ...updates,
      lastUpdated: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ', Today'
    }));
    addToast({
      type: 'success',
      title: 'Facility Status Updated',
      message: 'Facility capacity metrics updated.'
    });
  }, [addToast]);

  const updateFollowUpStatus = useCallback(
    (
      followUpId: string,
      status: 'completed' | 'rescheduled' | 'pending' | 'overdue',
      newDate?: string
    ) => {
      setFollowUps((prev) =>
        prev.map((f) =>
          f.id === followUpId
            ? {
                ...f,
                completionStatus: status,
                dueDate: newDate || f.dueDate
              }
            : f
        )
      );
      addToast({
        type: 'info',
        title: 'Follow-up Updated',
        message: `Status updated to ${status}.`
      });
    },
    [addToast]
  );

  const value = {
    patients,
    appointments,
    queue,
    consultations,
    prescriptions,
    labOrders,
    referrals,
    teleconsultations,
    teleconsults: teleconsultations,
    followUps,
    facilityCapacity,
    toasts,
    activeConsultationPatient,
    activeQueueItem,
    stats,
    dashboardStats: stats,
    setActiveConsultationPatient,
    setActiveQueueItem,
    registerPatient,
    updatePatient,
    getPatientById,
    bookAppointment,
    checkInAppointment,
    updateAppointmentStatus,
    rescheduleAppointment,
    cancelAppointment,
    callPatient,
    recallPatient,
    startConsultationFromQueue,
    skipPatient,
    markNoShow,
    changeQueuePriority,
    completeQueueItem,
    saveConsultationDraft,
    finalizeConsultation,
    addConsultationAddendum,
    createPrescription,
    updatePrescriptionStatus,
    cancelPrescription,
    createLabOrder,
    updateLabOrderStatus,
    addDoctorLabInterpretation,
    markLabOrderReviewed,
    createReferral,
    updateReferralStatus,
    simulateReceivingResponse,
    cancelReferral,
    createTeleconsult,
    updateTeleconsultStatus,
    createFollowUp,
    addFollowUp: createFollowUp,
    completeFollowUp,
    rescheduleFollowUp,
    updateFollowUpStatus,
    sendReminder,
    updateFacilityCapacity,
    addToast,
    removeToast
  };

  return <DoctorPortalContext.Provider value={value}>{children}</DoctorPortalContext.Provider>;
};

export const useDoctorPortal = (): DoctorPortalContextType => {
  const context = useContext(DoctorPortalContext);
  if (!context) {
    throw new Error('useDoctorPortal must be used within a DoctorPortalProvider');
  }
  return context;
};
