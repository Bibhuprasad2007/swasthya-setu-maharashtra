/**
 * Government Admin Portal — Service Layer
 * SwasthyaSetu Maharashtra — Integrated Rural Healthcare Network
 *
 * Provides decoupled service functions over the centralized mock state.
 * Each function mirrors a future REST API endpoint contract.
 */

import {
  AdminUser,
  Facility,
  OperationalAlert,
  ReferralOperationalSummary,
  AuditEvent,
  AuditActionType,
  AdminFilterState,
} from '../types/admin';

import {
  MOCK_ADMIN_USERS,
  MOCK_FACILITIES,
  MOCK_ALERTS,
  MOCK_REFERRALS,
  MOCK_AUDIT_EVENTS,
  MOCK_DISTRICT_SUMMARIES,
  MOCK_DASHBOARD_SUMMARY,
  MOCK_SERVICE_SNAPSHOT,
} from '../data/adminMockData';

// ─── Mutable Stores ───────────────────────────────────────────────────────────

let _alerts: OperationalAlert[] = [...MOCK_ALERTS];
let _users: AdminUser[] = [...MOCK_ADMIN_USERS];
let _referrals: ReferralOperationalSummary[] = [...MOCK_REFERRALS];
let _auditEvents: AuditEvent[] = [...MOCK_AUDIT_EVENTS];

// ─── Helper ───────────────────────────────────────────────────────────────────

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function nowISO(): string {
  return new Date().toISOString();
}

// ─── Dashboard Service ────────────────────────────────────────────────────────

export const adminDashboardService = {
  getSummary() {
    return { ...MOCK_DASHBOARD_SUMMARY };
  },
  getDistrictSummaries() {
    return [...MOCK_DISTRICT_SUMMARIES];
  },
};

// ─── Facility Service ─────────────────────────────────────────────────────────

export const facilityService = {
  getAll(): Facility[] {
    return [...MOCK_FACILITIES];
  },
  getById(id: string): Facility | undefined {
    return MOCK_FACILITIES.find(f => f.id === id);
  },
  getByCode(code: string): Facility | undefined {
    return MOCK_FACILITIES.find(f => f.code === code);
  },
  filter(filters: Partial<AdminFilterState>): Facility[] {
    return MOCK_FACILITIES.filter(f => {
      if (filters.district && filters.district !== 'all' && f.district !== filters.district) return false;
      if (filters.facilityType && filters.facilityType !== 'all' && f.type !== filters.facilityType) return false;
      if (filters.facilityCode && !f.code.toLowerCase().includes(filters.facilityCode.toLowerCase())) return false;
      return true;
    });
  },
};

// ─── Service Monitoring ───────────────────────────────────────────────────────

export const serviceMonitoringService = {
  getSnapshot() {
    return { ...MOCK_SERVICE_SNAPSHOT };
  },
};

// ─── Alert Service ────────────────────────────────────────────────────────────

export const adminAlertService = {
  getAll(): OperationalAlert[] {
    return [..._alerts];
  },

  getById(id: string): OperationalAlert | undefined {
    return _alerts.find(a => a.id === id);
  },

  acknowledge(alertId: string, by: string, note?: string): OperationalAlert {
    const alert = _alerts.find(a => a.id === alertId);
    if (!alert) throw new Error('Alert not found');
    alert.status = 'acknowledged';
    alert.lastUpdatedAt = nowISO();
    alert.statusHistory.push({
      id: generateId('SH'),
      status: 'acknowledged',
      changedBy: by,
      changedAt: nowISO(),
      note,
    });
    _auditLog(by, 'state_admin', 'alert_acknowledged', 'alert', alertId, `Alert ${alertId} acknowledged.`);
    return { ...alert };
  },

  assign(alertId: string, assignToId: string, assignToName: string, by: string): OperationalAlert {
    const alert = _alerts.find(a => a.id === alertId);
    if (!alert) throw new Error('Alert not found');
    alert.assignedTo = assignToId;
    alert.assignedToName = assignToName;
    alert.lastUpdatedAt = nowISO();
    alert.statusHistory.push({
      id: generateId('SH'),
      status: alert.status,
      changedBy: by,
      changedAt: nowISO(),
      note: `Assigned to ${assignToName}.`,
    });
    _auditLog(by, 'state_admin', 'alert_assigned', 'alert', alertId, `Alert ${alertId} assigned to ${assignToName}.`);
    return { ...alert };
  },

  moveToInProgress(alertId: string, by: string, note?: string): OperationalAlert {
    const alert = _alerts.find(a => a.id === alertId);
    if (!alert) throw new Error('Alert not found');
    alert.status = 'in_progress';
    alert.lastUpdatedAt = nowISO();
    alert.statusHistory.push({
      id: generateId('SH'),
      status: 'in_progress',
      changedBy: by,
      changedAt: nowISO(),
      note,
    });
    return { ...alert };
  },

  resolve(alertId: string, resolutionNote: string, by: string): OperationalAlert {
    const alert = _alerts.find(a => a.id === alertId);
    if (!alert) throw new Error('Alert not found');
    alert.status = 'resolved';
    alert.resolutionNote = resolutionNote;
    alert.lastUpdatedAt = nowISO();
    alert.statusHistory.push({
      id: generateId('SH'),
      status: 'resolved',
      changedBy: by,
      changedAt: nowISO(),
      note: resolutionNote,
    });
    _auditLog(by, 'state_admin', 'alert_resolved', 'alert', alertId, `Alert ${alertId} resolved. Note: ${resolutionNote}`);
    return { ...alert };
  },

  reopen(alertId: string, reason: string, by: string): OperationalAlert {
    const alert = _alerts.find(a => a.id === alertId);
    if (!alert) throw new Error('Alert not found');
    alert.status = 'new';
    alert.resolutionNote = undefined;
    alert.lastUpdatedAt = nowISO();
    alert.statusHistory.push({
      id: generateId('SH'),
      status: 'new',
      changedBy: by,
      changedAt: nowISO(),
      note: `Reopened: ${reason}`,
    });
    return { ...alert };
  },

  dismiss(alertId: string, by: string): OperationalAlert {
    const alert = _alerts.find(a => a.id === alertId);
    if (!alert) throw new Error('Alert not found');
    alert.status = 'dismissed';
    alert.lastUpdatedAt = nowISO();
    alert.statusHistory.push({
      id: generateId('SH'),
      status: 'dismissed',
      changedBy: by,
      changedAt: nowISO(),
    });
    return { ...alert };
  },

  setStore(alerts: OperationalAlert[]) {
    _alerts = alerts;
  },
};

// ─── Referral Monitoring Service ──────────────────────────────────────────────

export const referralMonitoringService = {
  getAll(): ReferralOperationalSummary[] {
    return [..._referrals];
  },

  flagCoordinationIssue(refId: string, note: string, by: string): ReferralOperationalSummary {
    const ref = _referrals.find(r => r.id === refId);
    if (!ref) throw new Error('Referral not found');
    ref.coordinationFlaggedBy = by;
    ref.coordinationFlagNote = note;
    ref.coordinationFlaggedAt = nowISO();
    _auditLog(by, 'district_admin', 'referral_flagged', 'referral', refId, `Referral ${ref.maskedRef} flagged for coordination issue.`);
    return { ...ref };
  },

  escalate(refId: string, by: string): ReferralOperationalSummary {
    const ref = _referrals.find(r => r.id === refId);
    if (!ref) throw new Error('Referral not found');
    _auditLog(by, 'district_admin', 'referral_escalated', 'referral', refId, `Referral ${ref.maskedRef} escalated to facility CMO.`);
    return { ...ref };
  },

  setStore(referrals: ReferralOperationalSummary[]) {
    _referrals = referrals;
  },
};

// ─── Access / User Service ────────────────────────────────────────────────────

export const adminAccessService = {
  getUsers(): AdminUser[] {
    return [..._users];
  },

  getUserById(id: string): AdminUser | undefined {
    return _users.find(u => u.id === id);
  },

  suspendUser(userId: string, by: string): AdminUser {
    const user = _users.find(u => u.id === userId);
    if (!user) throw new Error('User not found');
    user.accountStatus = 'suspended';
    _auditLog(by, 'state_admin', 'user_suspended', 'admin_user', userId, `Admin user ${user.name} account suspended.`);
    return { ...user };
  },

  activateUser(userId: string, by: string): AdminUser {
    const user = _users.find(u => u.id === userId);
    if (!user) throw new Error('User not found');
    user.accountStatus = 'active';
    _auditLog(by, 'state_admin', 'user_activated', 'admin_user', userId, `Admin user ${user.name} account activated.`);
    return { ...user };
  },

  createUser(newUser: Omit<AdminUser, 'id' | 'createdAt'>, by: string): AdminUser {
    const user: AdminUser = {
      ...newUser,
      id: generateId('ADMIN'),
      createdAt: nowISO(),
    };
    _users.push(user);
    _auditLog(by, 'state_admin', 'user_created', 'admin_user', user.id, `New admin user created: ${user.name} (${user.role}).`);
    return { ...user };
  },

  setStore(users: AdminUser[]) {
    _users = users;
  },
};

// ─── Audit Service ────────────────────────────────────────────────────────────

export const adminAuditService = {
  getAll(): AuditEvent[] {
    return [..._auditEvents].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  },
};

function _auditLog(
  userId: string,
  userRole: AdminUser['role'],
  action: AuditActionType,
  targetType: string,
  targetRef: string,
  description: string,
) {
  const user = _users.find(u => u.id === userId);
  const event: AuditEvent = {
    id: generateId('AUD'),
    timestamp: nowISO(),
    userId,
    userName: user?.name || userId,
    userRole,
    action,
    targetType,
    targetRef,
    result: 'success',
    description,
  };
  _auditEvents.unshift(event);
}
