/**
 * Government Admin Portal Context & State Management
 * SwasthyaSetu Maharashtra — Integrated Rural Healthcare Network
 */

import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import {
  AdminUser,
  Facility,
  OperationalAlert,
  ReferralOperationalSummary,
  AuditEvent,
  DashboardSummary,
  DistrictSummary,
  ServiceSnapshot,
  AdminFilterState,
} from '../types/admin';
import { useAuth } from './AuthContext';
import { adminDataService } from '../services/firestore/adminDataService';
import {
  adminAlertService,
  adminAccessService,
  referralMonitoringService,
} from '../services/adminServices';
import { ToastMessage } from '../types/doctor';

interface AdminPortalContextType {
  alerts: OperationalAlert[];
  users: AdminUser[];
  referrals: ReferralOperationalSummary[];
  auditEvents: AuditEvent[];
  facilities: Facility[];
  districtSummaries: DistrictSummary[];
  dashboardSummary: DashboardSummary;
  serviceSnapshot: ServiceSnapshot;
  toasts: ToastMessage[];

  filter: AdminFilterState;
  setFilter: (f: AdminFilterState) => void;
  resetFilter: () => void;

  addToast: (t: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;

  acknowledgeAlert: (alertId: string, note?: string) => void;
  assignAlert: (alertId: string, assignToId: string, assignToName: string) => void;
  moveAlertToInProgress: (alertId: string, note?: string) => void;
  resolveAlert: (alertId: string, resolutionNote: string) => void;
  reopenAlert: (alertId: string, reason: string) => void;
  dismissAlert: (alertId: string) => void;

  flagReferralCoordination: (refId: string, note: string) => void;
  escalateReferral: (refId: string) => void;

  suspendUser: (userId: string) => void;
  activateUser: (userId: string) => void;
  createUser: (newUser: Omit<AdminUser, 'id' | 'createdAt'>) => void;

  newAlertCount: number;
  delayedReferralCount: number;
}

const DEFAULT_FILTER: AdminFilterState = {
  scope: 'all',
  district: 'all',
  taluka: '',
  facilityType: 'all',
  facilityCode: '',
  dateFrom: '',
  dateTo: '',
  serviceType: '',
};

const AdminPortalContext = createContext<AdminPortalContextType | undefined>(undefined);

export const AdminPortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const currentAdminName = user?.displayName || user?.name || 'State Health Administrator';

  const [alerts, setAlerts] = useState<OperationalAlert[]>(adminAlertService.getAll());
  const [users, setUsers] = useState<AdminUser[]>(adminAccessService.getUsers());
  const [referrals, setReferrals] = useState<ReferralOperationalSummary[]>(
    referralMonitoringService.getAll()
  );
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [filter, setFilterState] = useState<AdminFilterState>(DEFAULT_FILTER);

  const [opEventsCount, setOpEventsCount] = useState({
    appointments: 0,
    consultations: 0,
    labs: 0,
    dispensed: 0,
    referrals: 0
  });

  // ─── Real-time Firestore Subscriptions ──────────────────────────────────────
  useEffect(() => {
    // 1. Operational Events (Anonymized telemetry)
    const unsubEvents = adminDataService.subscribeOperationalEvents((events) => {
      let appts = 0, cons = 0, labs = 0, disp = 0, refs = 0;
      events.forEach(ev => {
        if (ev.eventType === 'APPOINTMENT_SCHEDULED') appts++;
        else if (ev.eventType === 'CONSULTATION_COMPLETED') cons++;
        else if (ev.eventType === 'LAB_ORDER_CREATED' || ev.eventType === 'LAB_REPORT_VERIFIED') labs++;
        else if (ev.eventType === 'MEDICINE_DISPENSED') disp++;
        else if (ev.eventType === 'REFERRAL_TRANSFERRED') refs++;
      });

      setOpEventsCount({
        appointments: appts,
        consultations: cons,
        labs,
        dispensed: disp,
        referrals: refs
      });
    });

    // 2. Facilities
    const unsubFacilities = adminDataService.subscribeFacilities((data) => {
      if (data && data.length > 0) {
        const mapped: Facility[] = data.map((f) => ({
          id: f.id,
          code: f.id,
          name: f.name,
          type: (f.type?.toLowerCase() as any) || 'phc',
          district: f.district || 'Pune',
          taluka: f.taluka || 'Haveli',
          village: 'Central',
          operationalStatus: f.isActive ? 'operational' : 'inactive',
          connectivityStatus: f.isActive ? 'online' : 'offline',
          lastSyncAt: f.updatedAt?.seconds ? new Date(f.updatedAt.seconds * 1000).toISOString() : new Date().toISOString(),
          activeAlertCount: 0,
          hasOPD: true,
          hasEmergency: true,
          hasTeleconsultation: true,
          hasLaboratory: true,
          hasPharmacy: true,
          inChargeName: 'Medical Superintendent',
          contactPhone: f.contactNumber || '020-25500000',
          doctorsOnDuty: 4,
          totalBeds: 50,
          availableBeds: 18,
          currentQueueCount: 3,
          avgWaitingMinutes: 15
        }));
        setFacilities(mapped);
      }
    });

    // 3. Alerts
    const unsubAlerts = adminDataService.subscribeAlerts((data) => {
      if (data && data.length > 0) {
        const mapped: OperationalAlert[] = data.map((a) => ({
          id: a.id,
          title: a.title,
          category: 'staff_capacity',
          severity: (a.severity?.toLowerCase() as any) || 'medium',
          status: a.resolved ? 'resolved' : 'new',
          facilityCode: a.facilityId,
          facilityName: a.facilityName,
          district: a.district,
          description: a.description,
          sourcePortal: 'hospital',
          createdAt: a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000).toISOString() : new Date().toISOString(),
          lastUpdatedAt: a.updatedAt?.seconds ? new Date(a.updatedAt.seconds * 1000).toISOString() : new Date().toISOString(),
          statusHistory: []
        }));
        setAlerts(mapped);
      }
    });

    // 4. Audit Logs
    const unsubLogs = adminDataService.subscribeAuditLogs((logs) => {
      if (logs && logs.length > 0) {
        const mapped: AuditEvent[] = logs.map((l) => ({
          id: l.id,
          timestamp: l.createdAt?.seconds ? new Date(l.createdAt.seconds * 1000).toISOString() : new Date().toISOString(),
          userId: l.userId,
          userName: l.userRole || 'System',
          userRole: 'state_admin',
          action: 'login',
          targetType: 'session',
          targetRef: l.resource,
          result: l.status === 'SUCCESS' ? 'success' : 'failed',
          description: `${l.action} on ${l.resource}`
        }));
        setAuditEvents(mapped);
      }
    });

    return () => {
      unsubEvents();
      unsubFacilities();
      unsubAlerts();
      unsubLogs();
    };
  }, []);

  const addToast = useCallback((t: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts(prev => [...prev, { ...t, id }]);
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const acknowledgeAlert = useCallback((alertId: string, note?: string) => {
    adminAlertService.acknowledge(alertId, currentAdminName, note);
    adminDataService.createAlert({
      facilityId: 'MH-ADMIN-01',
      facilityName: 'State Health Command',
      district: 'Maharashtra',
      severity: 'INFO',
      title: 'Alert Acknowledged',
      description: `Alert ${alertId} acknowledged by ${currentAdminName}`
    }).catch(err => console.error('Alert ack sync error:', err));

    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'acknowledged' } : a));
    addToast({ type: 'success', title: 'Alert Acknowledged', message: `Alert ${alertId} has been acknowledged.` });
  }, [currentAdminName, addToast]);

  const assignAlert = useCallback((alertId: string, assignToId: string, assignToName: string) => {
    adminAlertService.assign(alertId, assignToId, assignToName, currentAdminName);
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, assignedToName: assignToName } : a));
    addToast({ type: 'info', title: 'Alert Assigned', message: `Alert assigned to ${assignToName}.` });
  }, [currentAdminName, addToast]);

  const moveAlertToInProgress = useCallback((alertId: string, note?: string) => {
    adminAlertService.moveToInProgress(alertId, currentAdminName, note);
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'in_progress' } : a));
    addToast({ type: 'info', title: 'Status Updated', message: 'Alert moved to In Progress.' });
  }, [currentAdminName, addToast]);

  const resolveAlert = useCallback((alertId: string, resolutionNote: string) => {
    adminDataService.resolveAlert(alertId).catch(err => console.error('Alert resolve error:', err));
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'resolved', resolutionNote } : a));
    addToast({ type: 'success', title: 'Alert Resolved', message: 'Alert has been marked as resolved.' });
  }, [addToast]);

  const reopenAlert = useCallback((alertId: string, reason: string) => {
    adminAlertService.reopen(alertId, reason, currentAdminName);
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'new' } : a));
    addToast({ type: 'warning', title: 'Alert Reopened', message: 'Alert has been reopened for follow-up.' });
  }, [currentAdminName, addToast]);

  const dismissAlert = useCallback((alertId: string) => {
    adminDataService.resolveAlert(alertId).catch(err => console.error('Alert dismiss error:', err));
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    addToast({ type: 'info', title: 'Alert Dismissed', message: 'Alert has been dismissed.' });
  }, [addToast]);

  const flagReferralCoordination = useCallback((refId: string, note: string) => {
    const updated = referralMonitoringService.flagCoordinationIssue(refId, note, currentAdminName);
    setReferrals(referralMonitoringService.getAll());
    addToast({ type: 'warning', title: 'Coordination Issue Flagged', message: `Referral ${updated.maskedRef} has been flagged.` });
  }, [currentAdminName, addToast]);

  const escalateReferral = useCallback((refId: string) => {
    referralMonitoringService.escalate(refId, currentAdminName);
    addToast({ type: 'info', title: 'Escalated', message: 'Referral has been escalated to the facility CMO.' });
  }, [currentAdminName, addToast]);

  const suspendUser = useCallback((userId: string) => {
    adminAccessService.suspendUser(userId, currentAdminName);
    setUsers(adminAccessService.getUsers());
    addToast({ type: 'warning', title: 'Account Suspended', message: 'The admin account has been suspended.' });
  }, [currentAdminName, addToast]);

  const activateUser = useCallback((userId: string) => {
    adminAccessService.activateUser(userId, currentAdminName);
    setUsers(adminAccessService.getUsers());
    addToast({ type: 'success', title: 'Account Activated', message: 'The admin account has been reactivated.' });
  }, [currentAdminName, addToast]);

  const createUser = useCallback((newUser: Omit<AdminUser, 'id' | 'createdAt'>) => {
    adminAccessService.createUser(newUser, currentAdminName);
    setUsers(adminAccessService.getUsers());
    addToast({ type: 'success', title: 'User Created', message: `New admin user "${newUser.name}" has been created.` });
  }, [currentAdminName, addToast]);

  const setFilter = useCallback((f: AdminFilterState) => setFilterState(f), []);
  const resetFilter = useCallback(() => setFilterState(DEFAULT_FILTER), []);

  const newAlertCount = useMemo(
    () => alerts.filter(a => a.status === 'new').length,
    [alerts]
  );

  const delayedReferralCount = useMemo(
    () => referrals.filter(r => r.isDelayed).length,
    [referrals]
  );

  const dashboardSummary: DashboardSummary = useMemo(() => ({
    totalFacilities: facilities.length || 24,
    facilitiesOnline: facilities.filter(f => f.connectivityStatus === 'online').length || 22,
    facilitiesWithIssues: alerts.filter(a => a.severity === 'critical' && a.status !== 'resolved').length,
    appointmentsToday: opEventsCount.appointments || 148,
    avgWaitingMinutes: 14,
    pendingLabOrders: opEventsCount.labs || 18,
    avgLabTurnaroundHours: 3.2,
    pendingReferrals: opEventsCount.referrals || 9,
    delayedReferrals: delayedReferralCount,
    lowStockMedicines: 4,
    outOfStockMedicines: 1,
    prescriptionFulfilmentRate: 96.4,
    appointmentsTrend: 5.2,
    waitingTimeTrend: -2.1,
    labTurnaroundTrend: -0.4,
    referralDelayTrend: 0.1,
    fulfilmentTrend: 1.5
  }), [facilities, alerts, opEventsCount, delayedReferralCount]);

  const serviceSnapshot: ServiceSnapshot = useMemo(() => ({
    appointmentsToday: opEventsCount.appointments || 148,
    consultationsCompleted: opEventsCount.consultations || 132,
    currentQueueTotal: 16,
    avgWaitingMinutes: 14,
    doctorsAvailable: 18,
    followupsDue: 12,
    pendingReferrals: opEventsCount.referrals || 9,
    labOrdersPending: opEventsCount.labs || 18,
    labSamplesCollected: 14,
    labInProgress: 8,
    labAwaitingVerification: 4,
    labReportsReady: 22,
    labAvgTurnaroundHours: 3.2,
    unavailableLabTests: 0,
    labBacklogCount: 2,
    prescriptionsPending: 5,
    prescriptionsFullyDispensed: opEventsCount.dispensed || 118,
    prescriptionsPartiallyDispensed: 4,
    reservationsPending: 3,
    lowStockMedicines: 4,
    outOfStockEssentials: 1,
    nearExpiryBatches: 2,
    avgReservationProcessingHours: 1.1,
    facilitiesOnline: facilities.filter(f => f.connectivityStatus === 'online').length || 22,
    facilitiesIntermittent: 2,
    facilitiesOffline: facilities.filter(f => f.connectivityStatus === 'offline').length || 0,
    pendingSyncRecords: 0,
    facilitiesNeedingSupport: 0
  }), [opEventsCount, facilities]);

  const value = useMemo<AdminPortalContextType>(() => ({
    alerts,
    users,
    referrals,
    auditEvents,
    facilities,
    districtSummaries: [],
    dashboardSummary,
    serviceSnapshot,
    toasts,
    filter,
    setFilter,
    resetFilter,
    addToast,
    removeToast,
    acknowledgeAlert,
    assignAlert,
    moveAlertToInProgress,
    resolveAlert,
    reopenAlert,
    dismissAlert,
    flagReferralCoordination,
    escalateReferral,
    suspendUser,
    activateUser,
    createUser,
    newAlertCount,
    delayedReferralCount,
  }), [
    alerts, users, referrals, auditEvents, facilities, dashboardSummary, serviceSnapshot, toasts, filter,
    setFilter, resetFilter, addToast, removeToast,
    acknowledgeAlert, assignAlert, moveAlertToInProgress, resolveAlert, reopenAlert, dismissAlert,
    flagReferralCoordination, escalateReferral,
    suspendUser, activateUser, createUser,
    newAlertCount, delayedReferralCount,
  ]);

  return (
    <AdminPortalContext.Provider value={value}>
      {children}
    </AdminPortalContext.Provider>
  );
};

export const useAdminPortal = (): AdminPortalContextType => {
  const ctx = useContext(AdminPortalContext);
  if (!ctx) throw new Error('useAdminPortal must be used inside <AdminPortalProvider>');
  return ctx;
};
