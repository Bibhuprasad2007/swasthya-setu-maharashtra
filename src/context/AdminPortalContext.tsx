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
  MOCK_ALERTS,
  MOCK_ADMIN_USERS,
  MOCK_REFERRALS,
  MOCK_AUDIT_EVENTS,
  MOCK_FACILITIES,
  MOCK_DISTRICT_SUMMARIES,
  MOCK_DASHBOARD_SUMMARY,
  MOCK_SERVICE_SNAPSHOT,
} from '../data/adminMockData';
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
  const [alerts, setAlerts] = useState<OperationalAlert[]>([...MOCK_ALERTS]);
  const [users, setUsers] = useState<AdminUser[]>([...MOCK_ADMIN_USERS]);
  const [referrals, setReferrals] = useState<ReferralOperationalSummary[]>([...MOCK_REFERRALS]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([...MOCK_AUDIT_EVENTS]);
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

  const currentUser = users[0]; // ADM1001 is current logged-in admin

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
    facilities: MOCK_FACILITIES,
    districtSummaries: MOCK_DISTRICT_SUMMARIES,
    dashboardSummary: MOCK_DASHBOARD_SUMMARY,
    serviceSnapshot: MOCK_SERVICE_SNAPSHOT,
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
