import React, { useState, useMemo } from 'react';
import {
  CalendarClock,
  Search,
  Plus,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Send,
  UserCheck,
  RotateCcw,
  Baby,
  HeartPulse,
  Clock,
  Filter,
  X
} from 'lucide-react';
import { DoctorPortalLayout } from '../../components/layouts/DoctorPortalLayout';
import { useDoctorPortal } from '../../context/DoctorPortalContext';
import { useLanguage } from '../../context/LanguageContext';
import { FollowUpItem } from '../../types/doctor';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';

export const FollowUpsPage: React.FC = () => {
  const { t } = useLanguage();
  const {
    followUps,
    patients,
    addFollowUp,
    updateFollowUpStatus,
    sendReminder,
    addToast
  } = useDoctorPortal();

  // Filters & State
  const [activeTab, setActiveTab] = useState<'all' | 'due_today' | 'upcoming' | 'overdue' | 'high_risk' | 'maternal_child' | 'chronic_care' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<'all' | 'high' | 'moderate' | 'low'>('all');

  // Modal State
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedFollowUp, setSelectedFollowUp] = useState<FollowUpItem | null>(null);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');

  // Confirmation state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Form state for creating a follow-up
  const [newFollowUp, setNewFollowUp] = useState<{
    patientId: string;
    reason: string;
    dueDate: string;
    riskLevel: 'low' | 'moderate' | 'high';
    category: 'maternal_child' | 'chronic_care' | 'post_op' | 'general';
    assignedWorker: string;
    notes: string;
  }>({
    patientId: patients[0]?.patientId || '',
    reason: '',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    riskLevel: 'moderate',
    category: 'general',
    assignedWorker: 'ASHA Sunita Patil (Khed Ward 2)',
    notes: ''
  });

  const todayStr = new Date().toISOString().split('T')[0];

  // Tab counts
  const counts = useMemo(() => {
    return {
      all: followUps.length,
      due_today: followUps.filter((f) => f.dueDate === todayStr && f.completionStatus === 'pending').length,
      upcoming: followUps.filter((f) => f.dueDate > todayStr && f.completionStatus === 'pending').length,
      overdue: followUps.filter((f) => f.dueDate < todayStr && f.completionStatus === 'pending').length,
      high_risk: followUps.filter((f) => f.riskLevel === 'high' && f.completionStatus !== 'completed').length,
      maternal_child: followUps.filter((f) => f.category === 'maternal_child').length,
      chronic_care: followUps.filter((f) => f.category === 'chronic_care').length,
      completed: followUps.filter((f) => f.completionStatus === 'completed').length
    };
  }, [followUps, todayStr]);

  // Filtered List
  const filteredFollowUps = useMemo(() => {
    return followUps.filter((item) => {
      // Search query
      const matchesSearch =
        item.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.assignedWorker.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Risk filter
      if (riskFilter !== 'all' && item.riskLevel !== riskFilter) return false;

      // Category / Tab filter
      switch (activeTab) {
        case 'due_today':
          return item.dueDate === todayStr && item.completionStatus === 'pending';
        case 'upcoming':
          return item.dueDate > todayStr && item.completionStatus === 'pending';
        case 'overdue':
          return item.dueDate < todayStr && item.completionStatus === 'pending';
        case 'high_risk':
          return item.riskLevel === 'high' && item.completionStatus !== 'completed';
        case 'maternal_child':
          return item.category === 'maternal_child';
        case 'chronic_care':
          return item.category === 'chronic_care';
        case 'completed':
          return item.completionStatus === 'completed';
        case 'all':
        default:
          return true;
      }
    });
  }, [followUps, searchQuery, riskFilter, activeTab, todayStr]);

  // Handlers
  const handleCreateFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFollowUp.patientId || !newFollowUp.reason || !newFollowUp.dueDate) {
      addToast('error', 'Validation Error', 'Please complete all required fields.');
      return;
    }

    const patient = patients.find((p) => p.patientId === newFollowUp.patientId);
    const patientName = patient ? patient.name : 'Unknown Patient';

    addFollowUp({
      patientId: newFollowUp.patientId,
      patientName,
      reason: newFollowUp.reason,
      dueDate: newFollowUp.dueDate,
      riskLevel: newFollowUp.riskLevel,
      category: newFollowUp.category,
      assignedWorker: newFollowUp.assignedWorker,
      notes: newFollowUp.notes
    });

    setIsNewModalOpen(false);
    setNewFollowUp({
      patientId: patients[0]?.patientId || '',
      reason: '',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      riskLevel: 'moderate',
      category: 'general',
      assignedWorker: 'ASHA Sunita Patil (Khed Ward 2)',
      notes: ''
    });
  };

  const handleMarkComplete = (item: FollowUpItem) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Complete Follow-up',
      message: `Mark follow-up for ${item.patientName} (${item.patientId}) as completed?`,
      onConfirm: () => {
        updateFollowUpStatus(item.id, 'completed');
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleOpenReschedule = (item: FollowUpItem) => {
    setSelectedFollowUp(item);
    setRescheduleDate(item.dueDate);
    setIsRescheduleModalOpen(true);
  };

  const handleConfirmReschedule = () => {
    if (!selectedFollowUp || !rescheduleDate) return;
    updateFollowUpStatus(selectedFollowUp.id, 'rescheduled', rescheduleDate);
    setIsRescheduleModalOpen(false);
    setSelectedFollowUp(null);
  };

  const handleSendReminder = (item: FollowUpItem) => {
    sendReminder(item.id);
  };

  const handleEscalateHighRisk = (item: FollowUpItem) => {
    addToast(
      'warning',
      'High-Risk Case Escalated',
      `Alert dispatched to District Medical Officer & CHC Specialist for patient ${item.patientName}.`
    );
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <AlertTriangle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
            High Risk
          </span>
        );
      case 'moderate':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            Moderate Risk
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            Low Risk
          </span>
        );
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'maternal_child':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-800">
            <Baby className="w-3 h-3" />
            Maternal / Child (ANC)
          </span>
        );
      case 'chronic_care':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
            <HeartPulse className="w-3 h-3" />
            NCD / Chronic
          </span>
        );
      case 'post_op':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-200 dark:border-teal-800">
            Post-Operative
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
            General
          </span>
        );
    }
  };

  const getReminderStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-2.5 h-2.5" /> SMS Delivered
          </span>
        );
      case 'sent':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
            <Send className="w-2.5 h-2.5" /> Sent
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
            <Bell className="w-2.5 h-2.5" /> Pending
          </span>
        );
    }
  };

  return (
    <DoctorPortalLayout
      pageTitle={t.docNavFollowups || 'Patient Follow-ups & Reminders'}
      pageSubtitle="Track post-consultation care, maternal-child ANC milestones, chronic NCD compliance, and ASHA field worker outreach."
      headerAction={
        <button
          type="button"
          onClick={() => setIsNewModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-brand-blue-600 hover:bg-brand-blue-700 shadow-sm transition-colors focus:ring-2 focus:ring-brand-blue-500"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Follow-up</span>
        </button>
      }
    >
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200 dark:border-brand-dark-border">
          {[
            { key: 'all', label: 'All Follow-ups', count: counts.all },
            { key: 'due_today', label: 'Due Today', count: counts.due_today },
            { key: 'upcoming', label: 'Upcoming', count: counts.upcoming },
            { key: 'overdue', label: 'Overdue', count: counts.overdue },
            { key: 'high_risk', label: 'High Risk', count: counts.high_risk },
            { key: 'maternal_child', label: 'Maternal/Child', count: counts.maternal_child },
            { key: 'chronic_care', label: 'Chronic Care', count: counts.chronic_care },
            { key: 'completed', label: 'Completed', count: counts.completed }
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-lg text-xs sm:text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-brand-blue-600 text-brand-blue-600 dark:text-brand-blue-400 dark:border-brand-blue-400 bg-brand-blue-50/50 dark:bg-brand-blue-950/20'
                  : 'border-transparent text-slate-600 dark:text-brand-dark-muted hover:text-slate-900 dark:hover:text-brand-dark-heading hover:bg-slate-100/60 dark:hover:bg-brand-dark-elevated/40'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.key
                    ? 'bg-brand-blue-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="bg-white dark:bg-brand-dark-surface p-4 rounded-2xl border border-slate-200/80 dark:border-brand-dark-border/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search patient, ID, ASHA worker..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-brand-dark-border bg-slate-50 dark:bg-brand-dark-bg text-slate-900 dark:text-brand-dark-text focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value as typeof riskFilter)}
              className="px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-brand-dark-border bg-slate-50 dark:bg-brand-dark-bg text-slate-900 dark:text-brand-dark-text focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
            >
              <option value="all">All Risk Levels</option>
              <option value="high">High Risk Only</option>
              <option value="moderate">Moderate Risk</option>
              <option value="low">Low Risk</option>
            </select>
          </div>
        </div>

        {/* Follow-up List */}
        {filteredFollowUps.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="No Follow-ups Found"
            description="There are no follow-ups matching the selected criteria. Schedule one to get started."
            actionLabel="Schedule Follow-up"
            onAction={() => setIsNewModalOpen(true)}
          />
        ) : (
          <div className="space-y-3">
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-brand-dark-border/80 bg-white dark:bg-brand-dark-surface shadow-xs">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50/80 dark:bg-brand-dark-elevated/80 border-b border-slate-200 dark:border-brand-dark-border text-slate-600 dark:text-brand-dark-muted uppercase font-bold text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Patient & ID</th>
                    <th className="py-3 px-4">Follow-up Reason</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Assigned Worker</th>
                    <th className="py-3 px-4">Reminder</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-brand-dark-border">
                  {filteredFollowUps.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-brand-dark-elevated/40 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-brand-dark-heading">
                          {item.patientName}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-brand-dark-muted font-mono">
                          {item.patientId}
                        </div>
                        <div className="mt-1">{getRiskBadge(item.riskLevel)}</div>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-medium text-slate-800 dark:text-brand-dark-text truncate">
                          {item.reason}
                        </div>
                        {item.notes && (
                          <div className="text-xs text-slate-500 dark:text-brand-dark-muted truncate mt-0.5">
                            Note: {item.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">{getCategoryBadge(item.category)}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800 dark:text-brand-dark-heading flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {item.dueDate}
                        </div>
                        {item.dueDate < todayStr && item.completionStatus === 'pending' && (
                          <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                            Overdue
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-xs font-medium text-slate-700 dark:text-brand-dark-muted flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate max-w-[150px]">{item.assignedWorker}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          {getReminderStatusBadge(item.reminderStatus)}
                          {item.lastContactedDate && (
                            <div className="text-[10px] text-slate-400">
                              Last: {item.lastContactedDate}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.completionStatus !== 'completed' ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleSendReminder(item)}
                                title="Send SMS Reminder"
                                className="p-1.5 rounded-lg text-brand-blue-600 hover:bg-brand-blue-50 dark:hover:bg-brand-blue-950/50 border border-brand-blue-200 dark:border-brand-blue-800 transition-colors"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenReschedule(item)}
                                title="Reschedule"
                                className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 border border-amber-200 dark:border-amber-800 transition-colors"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMarkComplete(item)}
                                title="Mark Completed"
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 transition-colors"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                            </span>
                          )}

                          {item.riskLevel === 'high' && item.completionStatus !== 'completed' && (
                            <button
                              type="button"
                              onClick={() => handleEscalateHighRisk(item)}
                              title="Escalate High-Risk Case"
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-rose-200 dark:border-rose-800 transition-colors"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-3">
              {filteredFollowUps.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-white dark:bg-brand-dark-surface border border-slate-200/80 dark:border-brand-dark-border/80 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-brand-dark-heading text-sm">
                        {item.patientName}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-brand-dark-muted font-mono">
                        {item.patientId}
                      </p>
                    </div>
                    {getRiskBadge(item.riskLevel)}
                  </div>

                  <div className="text-xs font-semibold text-slate-800 dark:text-brand-dark-text">
                    {item.reason}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-brand-dark-muted pt-2 border-t border-slate-100 dark:border-brand-dark-border">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Due: {item.dueDate}
                    </span>
                    {getCategoryBadge(item.category)}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-600 dark:text-brand-dark-muted truncate max-w-[160px]">
                      ASHA: {item.assignedWorker}
                    </span>
                    {getReminderStatusBadge(item.reminderStatus)}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-brand-dark-border">
                    {item.completionStatus !== 'completed' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleSendReminder(item)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-brand-blue-600 bg-brand-blue-50 dark:bg-brand-blue-950/50 border border-brand-blue-200 dark:border-brand-blue-800 flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" /> Remind
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenReschedule(item)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" /> Reschedule
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMarkComplete(item)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3" /> Complete
                        </button>
                      </>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Schedule Follow-up Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-brand-dark-border">
              <h3 className="text-lg font-bold text-slate-900 dark:text-brand-dark-heading flex items-center gap-2">
                <CalendarClock className="w-5 h-5 text-brand-blue-600" />
                Schedule Patient Follow-up
              </h3>
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFollowUp} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-brand-dark-text mb-1">
                  Select Patient *
                </label>
                <select
                  value={newFollowUp.patientId}
                  onChange={(e) => setNewFollowUp({ ...newFollowUp, patientId: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-brand-dark-border bg-slate-50 dark:bg-brand-dark-bg text-slate-900 dark:text-brand-dark-text focus:ring-2 focus:ring-brand-blue-500"
                  required
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.patientId}>
                      {p.name} ({p.patientId}) - {p.village}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-brand-dark-text mb-1">
                  Follow-up Reason / Clinical Goal *
                </label>
                <input
                  type="text"
                  placeholder="e.g. BP review, ANC 3rd trimester check, blood sugar fasting"
                  value={newFollowUp.reason}
                  onChange={(e) => setNewFollowUp({ ...newFollowUp, reason: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-brand-dark-border bg-slate-50 dark:bg-brand-dark-bg text-slate-900 dark:text-brand-dark-text focus:ring-2 focus:ring-brand-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-brand-dark-text mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    value={newFollowUp.dueDate}
                    onChange={(e) => setNewFollowUp({ ...newFollowUp, dueDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-brand-dark-border bg-slate-50 dark:bg-brand-dark-bg text-slate-900 dark:text-brand-dark-text focus:ring-2 focus:ring-brand-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-brand-dark-text mb-1">
                    Risk Category
                  </label>
                  <select
                    value={newFollowUp.riskLevel}
                    onChange={(e) =>
                      setNewFollowUp({
                        ...newFollowUp,
                        riskLevel: e.target.value as 'low' | 'moderate' | 'high'
                      })
                    }
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-brand-dark-border bg-slate-50 dark:bg-brand-dark-bg text-slate-900 dark:text-brand-dark-text focus:ring-2 focus:ring-brand-blue-500"
                  >
                    <option value="low">Low Risk</option>
                    <option value="moderate">Moderate Risk</option>
                    <option value="high">High Risk (Priority Flag)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-brand-dark-text mb-1">
                    Clinical Program
                  </label>
                  <select
                    value={newFollowUp.category}
                    onChange={(e) =>
                      setNewFollowUp({
                        ...newFollowUp,
                        category: e.target.value as typeof newFollowUp.category
                      })
                    }
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-brand-dark-border bg-slate-50 dark:bg-brand-dark-bg text-slate-900 dark:text-brand-dark-text focus:ring-2 focus:ring-brand-blue-500"
                  >
                    <option value="general">General Follow-up</option>
                    <option value="maternal_child">Maternal / Child (ANC/PNC)</option>
                    <option value="chronic_care">Chronic Care / NCD</option>
                    <option value="post_op">Post-Operative</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-brand-dark-text mb-1">
                    Assigned ASHA / Field Worker
                  </label>
                  <input
                    type="text"
                    value={newFollowUp.assignedWorker}
                    onChange={(e) => setNewFollowUp({ ...newFollowUp, assignedWorker: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-brand-dark-border bg-slate-50 dark:bg-brand-dark-bg text-slate-900 dark:text-brand-dark-text focus:ring-2 focus:ring-brand-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-brand-dark-text mb-1">
                  Instructions / Protocol Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Special instructions for patient or field worker..."
                  value={newFollowUp.notes}
                  onChange={(e) => setNewFollowUp({ ...newFollowUp, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-brand-dark-border bg-slate-50 dark:bg-brand-dark-bg text-slate-900 dark:text-brand-dark-text focus:ring-2 focus:ring-brand-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-brand-dark-border">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-brand-dark-muted hover:bg-slate-100 dark:hover:bg-brand-dark-elevated rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-brand-blue-600 hover:bg-brand-blue-700 rounded-xl shadow-xs transition-colors"
                >
                  Schedule Follow-up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {isRescheduleModalOpen && selectedFollowUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border max-w-sm w-full p-5 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-brand-dark-heading flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-600" />
              Reschedule Follow-up
            </h3>
            <p className="text-xs text-slate-500 dark:text-brand-dark-muted">
              Select a new follow-up date for {selectedFollowUp.patientName}.
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-brand-dark-text mb-1">
                New Due Date
              </label>
              <input
                type="date"
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-brand-dark-border bg-slate-50 dark:bg-brand-dark-bg text-slate-900 dark:text-brand-dark-text"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsRescheduleModalOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-brand-dark-muted hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReschedule}
                className="px-3 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg"
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </DoctorPortalLayout>
  );
};
