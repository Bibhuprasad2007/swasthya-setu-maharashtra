import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
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
import {
  INITIAL_PATIENTS,
  INITIAL_APPOINTMENTS,
  INITIAL_QUEUE,
  INITIAL_CONSULTATIONS,
  INITIAL_PRESCRIPTIONS,
  INITIAL_LAB_ORDERS,
  INITIAL_REFERRALS,
  INITIAL_TELECONSULTATIONS,
  INITIAL_FOLLOW_UPS,
  INITIAL_FACILITY_CAPACITY
} from '../data/doctorMockData';

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
  // State
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

  // Active consultation selection
  setActiveConsultationPatient: (patient: PatientRecord | null) => void;
  setActiveQueueItem: (item: QueuePatientItem | null) => void;

  // Patient Actions
  registerPatient: (patient: Omit<PatientRecord, 'id' | 'patientId' | 'registeredDate'>) => PatientRecord;
  updatePatient: (patientId: string, updates: Partial<PatientRecord>) => void;
  getPatientById: (patientId: string) => PatientRecord | undefined;

  // Appointment Actions
  bookAppointment: (apt: Omit<AppointmentItem, 'id' | 'status'>) => AppointmentItem;
  checkInAppointment: (appointmentId: string) => { appointment: AppointmentItem; queueItem: QueuePatientItem };
  updateAppointmentStatus: (appointmentId: string, status: AppointmentStatus) => void;
  rescheduleAppointment: (appointmentId: string, newDate: string, newTime: string) => void;
  cancelAppointment: (appointmentId: string, reason?: string) => void;

  // Queue Actions
  callPatient: (queueId: string) => void;
  recallPatient: (queueId: string) => void;
  startConsultationFromQueue: (queueId: string) => PatientRecord | undefined;
  skipPatient: (queueId: string) => void;
  markNoShow: (queueId: string) => void;
  changeQueuePriority: (queueId: string, priority: PriorityLevel) => void;
  completeQueueItem: (queueId: string) => void;

  // Consultation Actions
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

  // Prescription Actions
  createPrescription: (prescription: Omit<PrescriptionRecord, 'id'>) => PrescriptionRecord;
  updatePrescriptionStatus: (rxId: string, status: PrescriptionRecord['status']) => void;
  cancelPrescription: (rxId: string, reason: string) => void;

  // Lab Order Actions
  createLabOrder: (order: Omit<LabOrderItem, 'id' | 'orderDate' | 'status'>) => LabOrderItem;
  updateLabOrderStatus: (orderId: string, status: LabOrderItem['status']) => void;
  addDoctorLabInterpretation: (orderId: string, interpretation: string) => void;
  markLabOrderReviewed: (orderId: string) => void;

  // Referral Actions
  createReferral: (referral: Omit<ReferralItem, 'id' | 'createdDate' | 'status'>) => ReferralItem;
  updateReferralStatus: (referralId: string, status: ReferralItem['status'], outcome?: string) => void;
  simulateReceivingResponse: (referralId: string) => void;
  cancelReferral: (referralId: string, reason: string) => void;

  // Teleconsultation Actions
  createTeleconsult: (session: Omit<TeleconsultSession, 'id' | 'status'>) => TeleconsultSession;
  updateTeleconsultStatus: (teleId: string, status: TeleconsultSession['status']) => void;

  // Follow-up Actions
  createFollowUp: (followUp: Omit<FollowUpItem, 'id' | 'createdDate' | 'completionStatus' | 'reminderStatus'>) => FollowUpItem;
  addFollowUp: (followUp: Omit<FollowUpItem, 'id' | 'createdDate' | 'completionStatus' | 'reminderStatus'>) => FollowUpItem;
  completeFollowUp: (followUpId: string, notes?: string) => void;
  rescheduleFollowUp: (followUpId: string, newDate: string) => void;
  updateFollowUpStatus: (followUpId: string, status: 'completed' | 'rescheduled' | 'pending' | 'overdue', newDate?: string) => void;
  sendDemoReminder: (followUpId: string) => void;
  sendReminder: (followUpId: string) => void;

  // Aliases for convenience
  teleconsults: TeleconsultSession[];
  dashboardStats: ComputedStats;

  // Facility Actions
  updateFacilityCapacity: (updates: Partial<FacilityCapacity>) => void;

  // Toast Actions
  addToast: (
    toastOrType: Omit<ToastMessage, 'id'> | 'success' | 'error' | 'info' | 'warning',
    title?: string,
    message?: string
  ) => void;
  removeToast: (toastId: string) => void;
}

const DoctorPortalContext = createContext<DoctorPortalContextType | undefined>(undefined);

export const DoctorPortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Central State Initialized with rich synthetic Maharashtra data
  const [patients, setPatients] = useState<PatientRecord[]>(() => INITIAL_PATIENTS);
  const [appointments, setAppointments] = useState<AppointmentItem[]>(() => INITIAL_APPOINTMENTS);
  const [queue, setQueue] = useState<QueuePatientItem[]>(() => INITIAL_QUEUE);
  const [consultations, setConsultations] = useState<ConsultationRecord[]>(() => INITIAL_CONSULTATIONS);
  const [prescriptions, setPrescriptions] = useState<PrescriptionRecord[]>(() => INITIAL_PRESCRIPTIONS);
  const [labOrders, setLabOrders] = useState<LabOrderItem[]>(() => INITIAL_LAB_ORDERS);
  const [referrals, setReferrals] = useState<ReferralItem[]>(() => INITIAL_REFERRALS);
  const [teleconsultations, setTeleconsultations] = useState<TeleconsultSession[]>(() => INITIAL_TELECONSULTATIONS);
  const [followUps, setFollowUps] = useState<FollowUpItem[]>(() => INITIAL_FOLLOW_UPS);
  const [facilityCapacity, setFacilityCapacity] = useState<FacilityCapacity>(() => INITIAL_FACILITY_CAPACITY);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

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
          ? {
              id,
              type: toastOrType,
              title: title || '',
              message
            }
          : { ...toastOrType, id };

      setToasts((prev) => [...prev, newToast]);

      // Auto-dismiss after 4.5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4500);
    },
    []
  );

  const removeToast = useCallback((toastId: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  }, []);

  // Computed Dynamic Dashboard & Reports Metrics
  const stats: ComputedStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayAppts = appointments.filter((a) => a.date === today || a.date === '2026-09-06');
    const completedAppts = todayAppts.filter((a) => a.status === 'completed');

    const waitingInQueue = queue.filter((q) => q.status === 'waiting' || q.status === 'called');
    const priorityInQueue = waitingInQueue.filter((q) => q.priority === 'high' || q.priority === 'emergency');
    const completedCons = consultations.filter((c) => c.status === 'finalized');

    const pendingLabs = labOrders.filter((l) => l.status === 'report_ready' || l.status === 'processing');
    const pendingRefs = referrals.filter((r) => r.status === 'sent' || r.status === 'accepted' || r.status === 'scheduled');
    const dueFups = followUps.filter((f) => f.completionStatus === 'pending');

    const totalWaitingMins = waitingInQueue.reduce((acc, curr) => acc + curr.waitingMinutes, 0);
    const avgWait = waitingInQueue.length > 0 ? Math.round(totalWaitingMins / waitingInQueue.length) : 14;

    return {
      todayAppointmentsCount: todayAppts.length > 0 ? todayAppts.length : 24,
      completedAppointmentsCount: completedAppts.length > 0 ? completedAppts.length : 6,
      waitingPatientsCount: waitingInQueue.length,
      priorityCasesCount: priorityInQueue.length,
      completedConsultationsCount: completedCons.length > 0 ? completedCons.length : 6,
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
    addToast({
      type: 'success',
      title: 'Patient Registered',
      message: `${newPatient.name} assigned Patient ID: ${patientId}`
    });
    return newPatient;
  }, [patients.length, addToast]);

  const updatePatient = useCallback((patientId: string, updates: Partial<PatientRecord>) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === patientId || p.patientId === patientId ? { ...p, ...updates } : p))
    );
    addToast({
      type: 'info',
      title: 'Patient Updated',
      message: 'Patient clinical details updated successfully.'
    });
  }, [addToast]);

  const getPatientById = useCallback((patientId: string) => {
    return patients.find((p) => p.id === patientId || p.patientId === patientId);
  }, [patients]);

  // Appointment Actions
  const bookAppointment = useCallback((aptData: Omit<AppointmentItem, 'id' | 'status'>): AppointmentItem => {
    const id = 'apt-' + Date.now();
    const newApt: AppointmentItem = {
      ...aptData,
      id,
      status: 'confirmed'
    };

    setAppointments((prev) => [newApt, ...prev]);
    addToast({
      type: 'success',
      title: 'Appointment Booked',
      message: `Slot confirmed for ${newApt.patientName} at ${newApt.time} (${newApt.date})`
    });
    return newApt;
  }, [addToast]);

  const checkInAppointment = useCallback((appointmentId: string) => {
    const apt = appointments.find((a) => a.id === appointmentId);
    if (!apt) throw new Error('Appointment not found');

    const patient = patients.find((p) => p.id === apt.patientId || p.patientId === apt.patientId);
    const nextTokenNum = (queue.length + 21).toString().padStart(3, '0');
    const token = `A-${nextTokenNum}`;

    // Update appointment
    const updatedApt: AppointmentItem = {
      ...apt,
      status: 'in_queue',
      queueToken: token
    };
    setAppointments((prev) => prev.map((a) => (a.id === appointmentId ? updatedApt : a)));

    // Create queue item
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

    addToast({
      type: 'success',
      title: 'Patient Checked In',
      message: `${apt.patientName} checked in. Assigned Token ${token} in Live OPD Queue.`
    });

    return { appointment: updatedApt, queueItem: newQueueItem };
  }, [appointments, patients, queue.length, addToast]);

  const updateAppointmentStatus = useCallback((appointmentId: string, status: AppointmentStatus) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === appointmentId ? { ...a, status } : a))
    );
    addToast({
      type: 'info',
      title: 'Appointment Updated',
      message: `Status updated to ${status}.`
    });
  }, [addToast]);

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
    addToast({
      type: 'warning',
      title: 'Appointment Cancelled',
      message: 'Appointment has been cancelled.'
    });
  }, [addToast]);

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
      message: `Token ${item.token} (${item.patientName}) called to Consultation Chamber 1.`
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

    // 1. Create Prescription if provided
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
    }

    // 2. Create Lab Orders if provided
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
      });
    }

    // 3. Create Referral if provided
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
    }

    // 4. Create Follow-up if provided
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

    // 6. Complete active queue item if matching
    if (activeQueueItem) {
      setQueue((prev) =>
        prev.map((q) => (q.id === activeQueueItem.id ? { ...q, status: 'completed' } : q))
      );
      setActiveQueueItem(null);
    }

    // 7. Update patient last visit & vitals
    setPatients((prev) =>
      prev.map((p) =>
        p.id === consultationData.patientId || p.patientId === consultationData.patientId
          ? {
              ...p,
              lastVisitDate: new Date().toISOString().split('T')[0],
              vitals: consultationData.vitals
            }
          : p
      )
    );

    // 8. Update matching appointment if any
    setAppointments((prev) =>
      prev.map((a) =>
        (a.patientId === consultationData.patientId || a.patientName === consultationData.patientName) &&
        (a.status === 'in_queue' || a.status === 'checked_in')
          ? { ...a, status: 'completed' }
          : a
      )
    );

    addToast({
      type: 'success',
      title: 'Consultation Finalized',
      message: `Records finalized for ${consultationData.patientName}. Prescriptions & orders updated.`
    });

    return finalized;
  }, [activeQueueItem, addToast]);

  const addConsultationAddendum = useCallback((consultationId: string, doctorName: string, note: string) => {
    const addendum = {
      date: new Date().toLocaleString('en-IN'),
      doctorName,
      note
    };

    setConsultations((prev) =>
      prev.map((c) =>
        c.id === consultationId
          ? {
              ...c,
              addendums: [...(c.addendums || []), addendum]
            }
          : c
      )
    );

    addToast({
      type: 'info',
      title: 'Addendum Added',
      message: 'Clinical addendum recorded with audit timestamp.'
    });
  }, [addToast]);

  // Prescription Actions
  const createPrescription = useCallback((prescriptionData: Omit<PrescriptionRecord, 'id'>): PrescriptionRecord => {
    const id = 'Rx-' + Date.now().toString().slice(-6);
    const newRx: PrescriptionRecord = {
      ...prescriptionData,
      id,
      allergiesChecked: true
    };

    setPrescriptions((prev) => [newRx, ...prev]);
    addToast({
      type: 'success',
      title: 'Prescription Created',
      message: `Rx ${id} issued for ${newRx.patientName}.`
    });
    return newRx;
  }, [addToast]);

  const updatePrescriptionStatus = useCallback((rxId: string, status: PrescriptionRecord['status']) => {
    setPrescriptions((prev) =>
      prev.map((p) => (p.id === rxId ? { ...p, status } : p))
    );
    addToast({
      type: 'info',
      title: 'Prescription Updated',
      message: `Status set to ${status}.`
    });
  }, [addToast]);

  const cancelPrescription = useCallback((rxId: string, reason: string) => {
    setPrescriptions((prev) =>
      prev.map((p) => (p.id === rxId ? { ...p, status: 'cancelled', cancellationReason: reason } : p))
    );
    addToast({
      type: 'warning',
      title: 'Prescription Cancelled',
      message: `Rx ${rxId} cancelled.`
    });
  }, [addToast]);

  // Lab Order Actions
  const createLabOrder = useCallback((orderData: Omit<LabOrderItem, 'id' | 'orderDate' | 'status'>): LabOrderItem => {
    const id = 'LAB-ORD-' + Math.floor(100 + Math.random() * 900);
    const newOrder: LabOrderItem = {
      ...orderData,
      id,
      orderDate: new Date().toISOString().split('T')[0],
      status: 'ordered'
    };

    setLabOrders((prev) => [newOrder, ...prev]);
    addToast({
      type: 'success',
      title: 'Lab Order Placed',
      message: `Order ${id} sent to ${newOrder.diagnosticCentre}.`
    });
    return newOrder;
  }, [addToast]);

  const updateLabOrderStatus = useCallback((orderId: string, status: LabOrderItem['status']) => {
    setLabOrders((prev) =>
      prev.map((l) => (l.id === orderId ? { ...l, status } : l))
    );
    addToast({
      type: 'info',
      title: 'Lab Order Updated',
      message: `Lab status progressed to ${status}.`
    });
  }, [addToast]);

  const addDoctorLabInterpretation = useCallback((orderId: string, interpretation: string) => {
    setLabOrders((prev) =>
      prev.map((l) =>
        l.id === orderId
          ? {
              ...l,
              doctorInterpretation: interpretation,
              status: 'reviewed',
              reviewedDate: new Date().toISOString().split('T')[0]
            }
          : l
      )
    );
    addToast({
      type: 'success',
      title: 'Interpretation Saved',
      message: 'Doctor clinical note added and report marked reviewed.'
    });
  }, [addToast]);

  const markLabOrderReviewed = useCallback((orderId: string) => {
    setLabOrders((prev) =>
      prev.map((l) =>
        l.id === orderId
          ? {
              ...l,
              status: 'reviewed',
              reviewedDate: new Date().toISOString().split('T')[0]
            }
          : l
      )
    );
    addToast({
      type: 'success',
      title: 'Report Marked Reviewed',
      message: 'Report reviewed.'
    });
  }, [addToast]);

  // Referral Actions
  const createReferral = useCallback((referralData: Omit<ReferralItem, 'id' | 'createdDate' | 'status'>): ReferralItem => {
    const id = 'REF-' + Date.now().toString().slice(-6);
    const newRef: ReferralItem = {
      ...referralData,
      id,
      createdDate: new Date().toISOString().split('T')[0],
      status: 'sent'
    };

    setReferrals((prev) => [newRef, ...prev]);
    addToast({
      type: 'success',
      title: 'Referral Transmitted',
      message: `Referral sent to ${newRef.receivingFacility}.`
    });
    return newRef;
  }, [addToast]);

  const updateReferralStatus = useCallback((referralId: string, status: ReferralItem['status'], outcome?: string) => {
    setReferrals((prev) =>
      prev.map((r) =>
        r.id === referralId
          ? {
              ...r,
              status,
              receivingOutcome: outcome || r.receivingOutcome
            }
          : r
      )
    );
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
    addToast({
      type: 'success',
      title: 'Teleconsultation Scheduled',
      message: `Session booked for ${newSession.patientName} at ${newSession.scheduledTime}.`
    });
    return newSession;
  }, [addToast]);

  const updateTeleconsultStatus = useCallback((teleId: string, status: TeleconsultSession['status']) => {
    setTeleconsultations((prev) =>
      prev.map((t) => (t.id === teleId ? { ...t, status } : t))
    );
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
    addToast({
      type: 'success',
      title: 'Follow-up Scheduled',
      message: `Follow-up set for ${newFup.patientName} due on ${newFup.dueDate}.`
    });
    return newFup;
  }, [addToast]);

  const completeFollowUp = useCallback((followUpId: string, notes?: string) => {
    setFollowUps((prev) =>
      prev.map((f) => (f.id === followUpId ? { ...f, completionStatus: 'completed', notes: notes || f.notes } : f))
    );
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
    addToast({
      type: 'info',
      title: 'Follow-up Rescheduled',
      message: `New due date set to ${newDate}.`
    });
  }, [addToast]);

  const sendDemoReminder = useCallback((followUpId: string) => {
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

    addToast({
      type: 'success',
      title: 'Reminder Dispatched',
      message: `SMS & WhatsApp alert dispatched to ${fup.patientName} via ABDM Gateway.`
    });
  }, [followUps, addToast]);

  // Facility Actions
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
    sendDemoReminder,
    sendReminder: sendDemoReminder,
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
