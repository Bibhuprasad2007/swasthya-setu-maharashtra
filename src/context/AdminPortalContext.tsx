/**
 * Government Admin Portal Context & State Management
 * SwasthyaSetu Maharashtra — Integrated Rural Healthcare Network
 */

import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
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
import {
  adminAlertService,
  adminAccessService,
  referralMonitoringService,
  adminAuditService,
} from '../services/adminServices';
import { ToastMessage } from '../types/doctor';

// ─── Context Shape ────────────────────────────────────────────────────────────

interface AdminPortalContextType {
  // Data Stores
  alerts: OperationalAlert[];
  users: AdminUser[];
  referrals: ReferralOperationalSummary[];
  auditEvents: AuditEvent[];
  facilities: Facility[];
  districtSummaries: DistrictSummary[];
  dashboardSummary: DashboardSummary;
  serviceSnapshot: ServiceSnapshot;
  toasts: ToastMessage[];

  // Global Filter
  filter: AdminFilterState;
  setFilter: (f: AdminFilterState) => void;
  resetFilter: () => void;

  // Toast helpers
  addToast: (t: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;

  // Alert Actions
  acknowledgeAlert: (alertId: string, note?: string) => void;
  assignAlert: (alertId: string, assignToId: string, assignToName: string) => void;
  moveAlertToInProgress: (alertId: string, note?: string) => void;
  resolveAlert: (alertId: string, resolutionNote: string) => void;
  reopenAlert: (alertId: string, reason: string) => void;
  dismissAlert: (alertId: string) => void;

  // Referral Actions
  flagReferralCoordination: (refId: string, note: string) => void;
  escalateReferral: (refId: string) => void;

  // User Management
  suspendUser: (userId: string) => void;
  activateUser: (userId: string) => void;
  createUser: (newUser: Omit<AdminUser, 'id' | 'createdAt'>) => void;

  // Computed counts for sidebar badges
  newAlertCount: number;
  delayedReferralCount: number;
}

const AdminPortalContext = createContext<AdminPortalContextType | undefined>(undefined);

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

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AdminPortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<OperationalAlert[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [referrals, setReferrals] = useState<ReferralOperationalSummary[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [filter, setFilterState] = useState<AdminFilterState>(DEFAULT_FILTER);

  // Keep services in sync with local state
  adminAlertService.setStore(alerts);
  adminAccessService.setStore(users);
  referralMonitoringService.setStore(referrals);

  const addToast = useCallback((t: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts(prev => [...prev, { ...t, id }]);
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const currentUser = users[0] || {
    id: 'ADM-UNKNOWN',
    name: 'System Admin',
    role: 'Super Admin',
    email: 'admin@swasthyasetu.gov.in',
    facilityCode: 'GOV-HQ',
    createdAt: new Date().toISOString()
  }; // Fallback placeholder until Firebase user is connected

  // ─── Alert Actions

  const acknowledgeAlert = useCallback((alertId: string, note?: string) => {
    const updated = adminAlertService.acknowledge(alertId, currentUser.name, note);
    setAlerts(adminAlertService.getAll());
    setAuditEvents(adminAuditService.getAll());
    addToast({ type: 'success', title: 'Alert Acknowledged', message: `Alert ${updated.id} has been acknowledged.` });
  }, [currentUser.name, addToast]);

  const assignAlert = useCallback((alertId: string, assignToId: string, assignToName: string) => {
    adminAlertService.assign(alertId, assignToId, assignToName, currentUser.name);
    setAlerts(adminAlertService.getAll());
    setAuditEvents(adminAuditService.getAll());
    addToast({ type: 'info', title: 'Alert Assigned', message: `Alert assigned to ${assignToName}.` });
  }, [currentUser.name, addToast]);

  const moveAlertToInProgress = useCallback((alertId: string, note?: string) => {
    adminAlertService.moveToInProgress(alertId, currentUser.name, note);
    setAlerts(adminAlertService.getAll());
    addToast({ type: 'info', title: 'Status Updated', message: 'Alert moved to In Progress.' });
  }, [currentUser.name, addToast]);

  const resolveAlert = useCallback((alertId: string, resolutionNote: string) => {
    adminAlertService.resolve(alertId, resolutionNote, currentUser.name);
    setAlerts(adminAlertService.getAll());
    setAuditEvents(adminAuditService.getAll());
    addToast({ type: 'success', title: 'Alert Resolved', message: 'Alert has been marked as resolved.' });
  }, [currentUser.name, addToast]);

  const reopenAlert = useCallback((alertId: string, reason: string) => {
    adminAlertService.reopen(alertId, reason, currentUser.name);
    setAlerts(adminAlertService.getAll());
    addToast({ type: 'warning', title: 'Alert Reopened', message: 'Alert has been reopened for follow-up.' });
  }, [currentUser.name, addToast]);

  const dismissAlert = useCallback((alertId: string) => {
    adminAlertService.dismiss(alertId, currentUser.name);
    setAlerts(adminAlertService.getAll());
    addToast({ type: 'info', title: 'Alert Dismissed', message: 'Alert has been dismissed.' });
  }, [currentUser.name, addToast]);

  // ─── Referral Actions

  const flagReferralCoordination = useCallback((refId: string, note: string) => {
    const updated = referralMonitoringService.flagCoordinationIssue(refId, note, currentUser.name);
    setReferrals(referralMonitoringService.getAll());
    setAuditEvents(adminAuditService.getAll());
    addToast({ type: 'warning', title: 'Coordination Issue Flagged', message: `Referral ${updated.maskedRef} has been flagged.` });
  }, [currentUser.name, addToast]);

  const escalateReferral = useCallback((refId: string) => {
    referralMonitoringService.escalate(refId, currentUser.name);
    setAuditEvents(adminAuditService.getAll());
    addToast({ type: 'info', title: 'Escalated', message: 'Referral has been escalated to the facility CMO.' });
  }, [currentUser.name, addToast]);

  // ─── User Management

  const suspendUser = useCallback((userId: string) => {
    adminAccessService.suspendUser(userId, currentUser.name);
    setUsers(adminAccessService.getUsers());
    setAuditEvents(adminAuditService.getAll());
    addToast({ type: 'warning', title: 'Account Suspended', message: 'The admin account has been suspended.' });
  }, [currentUser.name, addToast]);

  const activateUser = useCallback((userId: string) => {
    adminAccessService.activateUser(userId, currentUser.name);
    setUsers(adminAccessService.getUsers());
    setAuditEvents(adminAuditService.getAll());
    addToast({ type: 'success', title: 'Account Activated', message: 'The admin account has been reactivated.' });
  }, [currentUser.name, addToast]);

  const createUser = useCallback((newUser: Omit<AdminUser, 'id' | 'createdAt'>) => {
    adminAccessService.createUser(newUser, currentUser.name);
    setUsers(adminAccessService.getUsers());
    setAuditEvents(adminAuditService.getAll());
    addToast({ type: 'success', title: 'User Created', message: `New admin user "${newUser.name}" has been created.` });
  }, [currentUser.name, addToast]);

  // ─── Filter

  const setFilter = useCallback((f: AdminFilterState) => setFilterState(f), []);
  const resetFilter = useCallback(() => setFilterState(DEFAULT_FILTER), []);

  // ─── Computed Sidebar Badges

  const newAlertCount = useMemo(
    () => alerts.filter(a => a.status === 'new').length,
    [alerts]
  );

  const delayedReferralCount = useMemo(
    () => referrals.filter(r => r.isDelayed).length,
    [referrals]
  );

  const value = useMemo<AdminPortalContextType>(() => ({
    alerts,
    users,
    referrals,
    auditEvents,
    facilities: [],
    districtSummaries: [],
    dashboardSummary: {
      totalFacilities: 0,
      facilitiesOnline: 0,
      facilitiesWithIssues: 0,
      appointmentsToday: 0,
      avgWaitingMinutes: 0,
      pendingLabOrders: 0,
      avgLabTurnaroundHours: 0,
      pendingReferrals: 0,
      delayedReferrals: 0,
      lowStockMedicines: 0,
      outOfStockMedicines: 0,
      prescriptionFulfilmentRate: 0,
      appointmentsTrend: 0,
      waitingTimeTrend: 0,
      labTurnaroundTrend: 0,
      referralDelayTrend: 0,
      fulfilmentTrend: 0
    },
    serviceSnapshot: {
      appointmentsToday: 0,
      consultationsCompleted: 0,
      currentQueueTotal: 0,
      avgWaitingMinutes: 0,
      doctorsAvailable: 0,
      followupsDue: 0,
      pendingReferrals: 0,
      labOrdersPending: 0,
      labSamplesCollected: 0,
      labInProgress: 0,
      labAwaitingVerification: 0,
      labReportsReady: 0,
      labAvgTurnaroundHours: 0,
      unavailableLabTests: 0,
      labBacklogCount: 0,
      prescriptionsPending: 0,
      prescriptionsFullyDispensed: 0,
      prescriptionsPartiallyDispensed: 0,
      reservationsPending: 0,
      lowStockMedicines: 0,
      outOfStockEssentials: 0,
      nearExpiryBatches: 0,
      avgReservationProcessingHours: 0,
      facilitiesOnline: 0,
      facilitiesIntermittent: 0,
      facilitiesOffline: 0,
      pendingSyncRecords: 0,
      facilitiesNeedingSupport: 0,
    },
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
    alerts, users, referrals, auditEvents, toasts, filter,
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
