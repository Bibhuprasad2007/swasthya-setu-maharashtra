import React, { useState, useMemo } from 'react';
import {
  ShieldCheck, UserPlus, Search, Filter, ChevronDown, X,
  Power, PowerOff, Clock, Info,
} from 'lucide-react';
import { AdminPortalLayout } from '../../components/layouts/AdminPortalLayout';
import { useAdminPortal } from '../../context/AdminPortalContext';
import { AdminRoleBadge, AccountStatusBadge } from '../../components/admin/AdminBadges';
import { EmptyState } from '../../components/common/EmptyState';
import { AdminUser, AdminRole, AdminAccountStatus, AuditActionType } from '../../types/admin';

const ROLE_OPTIONS: { value: AdminRole | 'all'; label: string }[] = [
  { value: 'all', label: 'All Roles' },
  { value: 'state_admin', label: 'State Admin' },
  { value: 'district_admin', label: 'District Admin' },
  { value: 'facility_admin', label: 'Facility Admin' },
  { value: 'readonly_analyst', label: 'Read-Only Analyst' },
];

const STATUS_OPTIONS: { value: AdminAccountStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'pending', label: 'Pending' },
];

const ACTION_LABELS: Record<AuditActionType, string> = {
  login: 'Login',
  logout: 'Logout',
  facility_update: 'Facility Update',
  alert_acknowledged: 'Alert Acknowledged',
  alert_assigned: 'Alert Assigned',
  alert_resolved: 'Alert Resolved',
  alert_reopened: 'Alert Reopened',
  user_created: 'User Created',
  user_suspended: 'Account Suspended',
  user_activated: 'Account Activated',
  role_changed: 'Role Changed',
  report_exported: 'Report Exported',
  referral_flagged: 'Referral Flagged',
  referral_escalated: 'Referral Escalated',
};

export const AdminAccessAuditPage: React.FC = () => {
  const { users, auditEvents, suspendUser, activateUser } = useAdminPortal();
  const [tab, setTab] = useState<'users' | 'audit'>('users');
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<AdminRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<AdminAccountStatus | 'all'>('all');
  const [auditSearch, setAuditSearch] = useState('');
  const [confirmAction, setConfirmAction] = useState<{ user: AdminUser; type: 'suspend' | 'activate' } | null>(null);
  const [showNewUserHint, setShowNewUserHint] = useState(false);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (statusFilter !== 'all' && u.accountStatus !== statusFilter) return false;
      if (userSearch) {
        const q = userSearch.toLowerCase();
        return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.id.toLowerCase().includes(q);
      }
      return true;
    });
  }, [users, roleFilter, statusFilter, userSearch]);

  const filteredEvents = useMemo(() => {
    if (!auditSearch) return auditEvents.slice(0, 50);
    const q = auditSearch.toLowerCase();
    return auditEvents.filter(e =>
      e.userName.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.targetRef.toLowerCase().includes(q)
    ).slice(0, 50);
  }, [auditEvents, auditSearch]);

  const formatTime = (iso: string) => new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit'
  });

  const SelectFilter = ({ value, onChange, options, label }: {
    value: string; onChange: (v: string) => void;
    options: { value: string; label: string }[]; label: string;
  }) => (
    <div className="relative">
      <select value={value} onChange={e => onChange(e.target.value)} aria-label={label}
        className="text-xs rounded-xl border border-slate-200 dark:border-brand-dark-border bg-white dark:bg-brand-dark-surface px-3 py-2 pr-7 text-slate-700 dark:text-brand-dark-text focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  );

  return (
    <AdminPortalLayout
      pageTitle="Access & Audit"
      pageSubtitle="Admin user management and full audit trail"
      headerAction={
        <button type="button" onClick={() => setShowNewUserHint(true)}
          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-colors shadow-sm">
          <UserPlus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Admin User</span>
        </button>
      }
    >
      {/* Tab Toggle */}
      <div className="flex gap-1 mb-4 bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border p-1.5 shadow-xs w-fit">
        <button type="button" onClick={() => setTab('users')}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl transition-colors ${
            tab === 'users' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 dark:text-brand-dark-muted hover:bg-slate-100 dark:hover:bg-brand-dark-elevated'
          }`}>
          <ShieldCheck className="w-4 h-4" /> Admin Users
        </button>
        <button type="button" onClick={() => setTab('audit')}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl transition-colors ${
            tab === 'audit' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 dark:text-brand-dark-muted hover:bg-slate-100 dark:hover:bg-brand-dark-elevated'
          }`}>
          <Clock className="w-4 h-4" /> Audit Trail
        </button>
      </div>

      {/* Add User Banner */}
      {showNewUserHint && (
        <div className="flex items-start gap-3 p-4 mb-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-xl text-xs text-blue-800 dark:text-blue-300">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Add New Admin User</p>
            <p className="mt-0.5">In the production system, this opens a user creation form for setting name, email, role, district scope, and access permissions. Audit log is automatically generated on user creation.</p>
          </div>
          <button type="button" onClick={() => setShowNewUserHint(false)}>
            <X className="w-4 h-4 text-blue-500" />
          </button>
        </div>
      )}

      {tab === 'users' && (
        <>
          {/* User Filters */}
          <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border p-3 mb-4 shadow-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div className="relative flex-1 min-w-44">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input type="text" value={userSearch} onChange={e => setUserSearch(e.target.value)}
                  placeholder="Search by name, email, or ID..."
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-brand-dark-border bg-white dark:bg-brand-dark-surface pl-8 pr-3 py-2 text-slate-900 dark:text-brand-dark-text focus:outline-none focus:ring-2 focus:ring-sky-500" />
              </div>
              <SelectFilter value={roleFilter} onChange={v => setRoleFilter(v as AdminRole | 'all')} label="Role" options={ROLE_OPTIONS} />
              <SelectFilter value={statusFilter} onChange={v => setStatusFilter(v as AdminAccountStatus | 'all')} label="Status" options={STATUS_OPTIONS} />
              {(userSearch || roleFilter !== 'all' || statusFilter !== 'all') && (
                <button type="button" onClick={() => { setUserSearch(''); setRoleFilter('all'); setStatusFilter('all'); }}
                  className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 hover:underline">
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <EmptyState icon={ShieldCheck} title="No users found" description="No admin users match your filters." />
          ) : (
            <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs" role="table">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-brand-dark-elevated border-b border-slate-200 dark:border-brand-dark-border">
                      {['ID', 'Name / Email', 'Role', 'Scope', 'Status', 'Last Login', 'Actions'].map(h => (
                        <th key={h} className="text-left px-3 py-2.5 font-semibold text-slate-600 dark:text-brand-dark-muted whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u, i) => (
                      <tr key={u.id}
                        className={`border-t border-slate-100 dark:border-brand-dark-border hover:bg-slate-50 dark:hover:bg-brand-dark-elevated transition-colors ${i % 2 === 0 ? '' : 'bg-slate-50/30 dark:bg-brand-dark-elevated/20'}`}>
                        <td className="px-3 py-2.5 font-mono text-[10px] text-slate-500 dark:text-brand-dark-muted">{u.id}</td>
                        <td className="px-3 py-2.5">
                          <p className="font-semibold text-slate-800 dark:text-brand-dark-heading whitespace-nowrap">{u.name}</p>
                          <p className="text-[10px] text-slate-400 dark:text-brand-dark-muted">{u.email}</p>
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap"><AdminRoleBadge role={u.role} /></td>
                        <td className="px-3 py-2.5 text-slate-600 dark:text-brand-dark-text whitespace-nowrap">
                          {u.assignedDistrict || u.assignedFacilityCode || 'State-wide'}
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap"><AccountStatusBadge status={u.accountStatus} /></td>
                        <td className="px-3 py-2.5 whitespace-nowrap text-slate-500 dark:text-brand-dark-muted">
                          {u.lastLoginAt ? formatTime(u.lastLoginAt) : 'Never'}
                        </td>
                        <td className="px-3 py-2.5">
                          {u.id !== 'ADMIN-001' && (
                            <button type="button"
                              onClick={() => setConfirmAction({ user: u, type: u.accountStatus === 'active' ? 'suspend' : 'activate' })}
                              className={`flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg transition-colors ${
                                u.accountStatus === 'active'
                                  ? 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800/60'
                                  : 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/60'
                              }`}>
                              {u.accountStatus === 'active'
                                ? <><PowerOff className="w-3.5 h-3.5" /> Suspend</>
                                : <><Power className="w-3.5 h-3.5" /> Activate</>}
                            </button>
                          )}
                          {u.id === 'ADMIN-001' && (
                            <span className="text-[10px] text-slate-400 dark:text-brand-dark-muted italic">Your account</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'audit' && (
        <>
          <div className="flex items-center gap-2 p-3 mb-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-xl text-xs text-blue-800 dark:text-blue-300">
            <Info className="w-4 h-4 flex-shrink-0" />
            <span>All administrative actions are automatically logged for accountability. Showing last 50 events.</span>
          </div>

          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input type="text" value={auditSearch} onChange={e => setAuditSearch(e.target.value)}
              placeholder="Search audit log by user, action, or reference..."
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-brand-dark-border bg-white dark:bg-brand-dark-surface pl-8 pr-3 py-2.5 text-slate-900 dark:text-brand-dark-text focus:outline-none focus:ring-2 focus:ring-sky-500" />
          </div>

          <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-brand-dark-elevated border-b border-slate-200 dark:border-brand-dark-border">
                    {['Timestamp', 'User', 'Action', 'Target', 'Result', 'Description'].map(h => (
                      <th key={h} className="text-left px-3 py-2.5 font-semibold text-slate-600 dark:text-brand-dark-muted whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((e, i) => (
                    <tr key={e.id}
                      className={`border-t border-slate-100 dark:border-brand-dark-border hover:bg-slate-50 dark:hover:bg-brand-dark-elevated ${i % 2 === 0 ? '' : 'bg-slate-50/30 dark:bg-brand-dark-elevated/20'}`}>
                      <td className="px-3 py-2 whitespace-nowrap text-slate-500 dark:text-brand-dark-muted">
                        {formatTime(e.timestamp)}
                      </td>
                      <td className="px-3 py-2">
                        <p className="font-semibold text-slate-800 dark:text-brand-dark-heading whitespace-nowrap">{e.userName}</p>
                        <p className="text-[10px] text-slate-400 dark:text-brand-dark-muted capitalize">{e.userRole.replace(/_/g, ' ')}</p>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {ACTION_LABELS[e.action] || e.action}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-mono text-[10px] text-slate-500 dark:text-brand-dark-muted whitespace-nowrap">{e.targetRef}</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-md ${
                          e.result === 'success'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                        }`}>
                          {e.result}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-600 dark:text-brand-dark-text max-w-xs">
                        <span className="truncate block" title={e.description}>{e.description}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredEvents.length === 0 && (
                <div className="flex items-center justify-center p-8 text-xs text-slate-400 dark:text-brand-dark-muted">
                  No matching audit events found.
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Confirm Suspend/Activate Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => setConfirmAction(null)}>
          <div className="w-full max-w-sm bg-white dark:bg-brand-dark-surface rounded-2xl shadow-2xl border border-slate-200 dark:border-brand-dark-border p-5"
            onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-slate-800 dark:text-brand-dark-heading mb-2">
              {confirmAction.type === 'suspend' ? 'Suspend Account' : 'Activate Account'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-brand-dark-text mb-4">
              {confirmAction.type === 'suspend'
                ? `Are you sure you want to suspend the account for "${confirmAction.user.name}"? They will lose all access immediately.`
                : `Are you sure you want to reactivate the account for "${confirmAction.user.name}"?`}
            </p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setConfirmAction(null)}
                className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-brand-dark-text bg-slate-100 dark:bg-brand-dark-elevated rounded-xl hover:bg-slate-200">
                Cancel
              </button>
              <button type="button" onClick={() => {
                if (confirmAction.type === 'suspend') {
                  suspendUser(confirmAction.user.id);
                } else {
                  activateUser(confirmAction.user.id);
                }
                setConfirmAction(null);
              }}
                className={`px-3 py-2 text-xs font-semibold text-white rounded-xl ${
                  confirmAction.type === 'suspend' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}>
                {confirmAction.type === 'suspend' ? 'Suspend' : 'Activate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminPortalLayout>
  );
};
