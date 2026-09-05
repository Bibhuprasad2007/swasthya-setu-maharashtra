import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Volume2,
  AlertTriangle,
  Stethoscope,
  Search,
  CheckCircle2,
  SkipForward,
  UserX,
  Flame
} from 'lucide-react';
import { DoctorPortalLayout } from '../../components/layouts/DoctorPortalLayout';
import { PatientActionModal } from '../../components/doctor/PatientActionModal';
import { EmptyState } from '../../components/common/EmptyState';
import { useDoctorPortal } from '../../context/DoctorPortalContext';
import { QueuePatientItem, PriorityLevel, QueueStatus, PatientQueueItem } from '../../types/doctor';

export const LiveQueuePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    queue,
    stats,
    callPatient,
    recallPatient,
    startConsultationFromQueue,
    skipPatient,
    markNoShow,
    changeQueuePriority
  } = useDoctorPortal();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | PriorityLevel>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | QueueStatus>('waiting');

  // Modal State
  const [selectedPatientModal, setSelectedPatientModal] = useState<PatientQueueItem | null>(null);
  const [modalMode, setModalMode] = useState<'call' | 'view'>('call');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Active Tokens
  const waitingPatients = queue.filter((q) => q.status === 'waiting' || q.status === 'called');
  const currentToken = waitingPatients.find((q) => q.status === 'called') || waitingPatients[0];
  const nextToken = waitingPatients.length > 1 ? (waitingPatients[0] === currentToken ? waitingPatients[1] : waitingPatients[0]) : null;

  // Filtered list
  const filteredQueue = useMemo(() => {
    return queue.filter((item) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        item.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.reason.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;
      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'waiting'
          ? item.status === 'waiting' || item.status === 'called'
          : item.status === statusFilter;

      return matchesSearch && matchesPriority && matchesStatus;
    });
  }, [queue, searchQuery, priorityFilter, statusFilter]);

  const handleStartConsult = (queueId: string) => {
    const pt = startConsultationFromQueue(queueId);
    if (pt) {
      navigate('/hospital/consultations');
    }
  };

  const openActionModal = (item: QueuePatientItem, mode: 'call' | 'view') => {
    setSelectedPatientModal({
      id: item.id,
      token: item.token,
      patientName: item.patientName,
      age: item.age,
      gender: item.gender,
      reason: item.reason,
      waitingMinutes: item.waitingMinutes,
      priority: item.priority === 'emergency' ? 'high' : item.priority,
      abhaId: item.abhaId,
      vitalSummary: item.vitalSummary
    });
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const getPriorityBadge = (priority: PriorityLevel) => {
    switch (priority) {
      case 'emergency':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-rose-800 dark:text-rose-200 bg-rose-100 dark:bg-rose-950/80 px-2.5 py-0.5 rounded-full border border-rose-400 dark:border-rose-700 animate-pulse">
            <Flame className="w-3 h-3 text-rose-600 dark:text-rose-400" />
            EMERGENCY
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-700/60">
            <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            High Priority
          </span>
        );
      case 'normal':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-brand-dark-muted bg-slate-100 dark:bg-brand-dark-elevated px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-brand-dark-border">
            Normal
          </span>
        );
    }
  };

  const getStatusBadge = (status: QueueStatus) => {
    switch (status) {
      case 'called':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-blue-800 dark:text-brand-blue-300 bg-brand-blue-50 dark:bg-brand-blue-950/70 px-2.5 py-0.5 rounded-full border border-brand-blue-300 dark:border-brand-blue-700/60 animate-pulse">
            <Volume2 className="w-3 h-3" />
            Called (Chamber 1)
          </span>
        );
      case 'in_consultation':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-800 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/70 px-2.5 py-0.5 rounded-full border border-purple-300 dark:border-purple-700/60">
            <Stethoscope className="w-3 h-3" />
            In Consultation
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700/60">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </span>
        );
      case 'skipped':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-brand-dark-muted bg-slate-100 dark:bg-brand-dark-elevated px-2.5 py-0.5 rounded-full">
            <SkipForward className="w-3 h-3" />
            Skipped
          </span>
        );
      case 'no_show':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/70 px-2.5 py-0.5 rounded-full border border-rose-300 dark:border-rose-700/60">
            <UserX className="w-3 h-3" />
            No-Show
          </span>
        );
      case 'waiting':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/70 px-2.5 py-0.5 rounded-full border border-teal-300 dark:border-teal-700/60">
            <Clock className="w-3 h-3" />
            Waiting
          </span>
        );
    }
  };

  return (
    <DoctorPortalLayout
      pageTitle="Live OPD Patient Queue"
      pageSubtitle="Real-time patient calling, triage priority assignment, and consultation entry"
    >
      <div className="space-y-6">
        {/* Real-time Token Header Board */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Current Calling Token */}
          <div className="lg:col-span-2 p-5 rounded-2xl bg-gradient-to-br from-brand-navy-900 via-brand-navy-800 to-brand-blue-900 text-white shadow-xl border border-brand-navy-700/60 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-brand-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 animate-pulse" />
                Active Calling Token
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/15">
                Chamber 1
              </span>
            </div>

            {currentToken ? (
              <div className="my-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl sm:text-5xl font-extrabold font-mono text-white tracking-tight">
                    {currentToken.token}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-white truncate max-w-[200px]">
                      {currentToken.patientName}
                    </h3>
                    <p className="text-xs text-slate-300">
                      {currentToken.gender === 'Female' ? 'F' : 'M'}, {currentToken.age} yrs • Wait: {currentToken.waitingMinutes}m
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-300 my-4">No patient currently called</p>
            )}

            <div className="flex items-center gap-2 pt-2 border-t border-white/15">
              {currentToken && (
                <>
                  <button
                    type="button"
                    onClick={() => recallPatient(currentToken.id)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    Recall
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStartConsult(currentToken.id)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-gradient-to-r from-brand-teal-400 to-brand-blue-500 hover:from-brand-teal-300 hover:to-brand-blue-400 text-brand-navy-950 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-brand-teal-500/20"
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    Start Consult
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Next Up Token */}
          <div className="p-5 rounded-2xl bg-white dark:bg-brand-dark-surface border border-slate-200/80 dark:border-brand-dark-border shadow-xs flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-brand-dark-muted uppercase tracking-wider">
              Next In Line
            </span>
            <div className="my-2">
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-brand-dark-heading">
                {nextToken ? nextToken.token : '--'}
              </div>
              <p className="text-xs text-slate-600 dark:text-brand-dark-text truncate mt-1">
                {nextToken ? nextToken.patientName : 'No pending tokens'}
              </p>
            </div>
            <span className="text-[11px] text-slate-400 dark:text-brand-dark-muted">
              Auto-queued by triage
            </span>
          </div>

          {/* Total Waiting Metric */}
          <div className="p-5 rounded-2xl bg-white dark:bg-brand-dark-surface border border-slate-200/80 dark:border-brand-dark-border shadow-xs flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-brand-dark-muted uppercase tracking-wider">
              Total Waiting
            </span>
            <div className="my-2">
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-brand-blue-600 dark:text-brand-blue-400">
                {stats.waitingPatientsCount < 10 ? `0${stats.waitingPatientsCount}` : stats.waitingPatientsCount}
              </div>
              <p className="text-xs text-slate-600 dark:text-brand-dark-text mt-1">
                Avg. wait: <strong>{stats.avgWaitMinutes} mins</strong>
              </p>
            </div>
            <span className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold">
              OPD Flow Steady
            </span>
          </div>

          {/* Priority Alert Metric */}
          <div className="p-5 rounded-2xl bg-white dark:bg-brand-dark-surface border border-slate-200/80 dark:border-brand-dark-border shadow-xs flex flex-col justify-between">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Priority Cases
            </span>
            <div className="my-2">
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-600 dark:text-amber-400">
                {stats.priorityCasesCount < 10 ? `0${stats.priorityCasesCount}` : stats.priorityCasesCount}
              </div>
              <p className="text-xs text-slate-600 dark:text-brand-dark-text mt-1">
                Require priority care
              </p>
            </div>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
              High attention active
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200/80 dark:border-brand-dark-border p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative min-w-[240px] flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by token, patient name, ID, symptoms..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-900 dark:text-brand-dark-text placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | QueueStatus)}
              className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-700 dark:text-brand-dark-text focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
            >
              <option value="waiting">Active Queue (Waiting & Called)</option>
              <option value="all">All Queue History</option>
              <option value="in_consultation">In Consultation</option>
              <option value="completed">Completed</option>
              <option value="skipped">Skipped</option>
              <option value="no_show">No-Show</option>
            </select>

            {/* Priority Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-brand-dark-elevated p-1 rounded-xl border border-slate-200/80 dark:border-brand-dark-border">
              <button
                type="button"
                onClick={() => setPriorityFilter('all')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  priorityFilter === 'all'
                    ? 'bg-white dark:bg-brand-dark-surface text-slate-900 dark:text-brand-dark-heading shadow-xs'
                    : 'text-slate-600 dark:text-brand-dark-muted'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setPriorityFilter('emergency')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  priorityFilter === 'emergency'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50'
                }`}
              >
                Emergency
              </button>
              <button
                type="button"
                onClick={() => setPriorityFilter('high')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  priorityFilter === 'high'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-amber-700 dark:text-amber-400 hover:bg-amber-50'
                }`}
              >
                High
              </button>
              <button
                type="button"
                onClick={() => setPriorityFilter('normal')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  priorityFilter === 'normal'
                    ? 'bg-white dark:bg-brand-dark-surface text-slate-900 dark:text-brand-dark-heading shadow-xs'
                    : 'text-slate-600 dark:text-brand-dark-muted'
                }`}
              >
                Normal
              </button>
            </div>
          </div>
        </div>

        {/* Queue Table */}
        <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200/80 dark:border-brand-dark-border shadow-xs overflow-hidden">
          {filteredQueue.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse" aria-label="OPD Live Queue">
                  <thead>
                    <tr className="bg-slate-50/80 dark:bg-brand-dark-elevated/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-brand-dark-muted border-b border-slate-200 dark:border-brand-dark-border">
                      <th scope="col" className="py-3 px-4">Token</th>
                      <th scope="col" className="py-3 px-4">Patient</th>
                      <th scope="col" className="py-3 px-4">Symptoms / Reason</th>
                      <th scope="col" className="py-3 px-4">Waiting Time</th>
                      <th scope="col" className="py-3 px-4">Priority</th>
                      <th scope="col" className="py-3 px-4">Status</th>
                      <th scope="col" className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-brand-dark-border/60 text-xs">
                    {filteredQueue.map((item) => {
                      const isEmergency = item.priority === 'emergency';
                      const isHigh = item.priority === 'high';

                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-slate-50/80 dark:hover:bg-brand-dark-elevated/40 transition-colors ${
                            isEmergency
                              ? 'bg-rose-50/30 dark:bg-rose-950/20'
                              : isHigh
                              ? 'bg-amber-50/20 dark:bg-amber-950/10'
                              : ''
                          }`}
                        >
                          {/* Token */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="px-2.5 py-1.5 rounded-lg bg-brand-navy-900 dark:bg-brand-dark-elevated text-white font-mono font-bold text-xs border border-brand-navy-700 dark:border-brand-dark-border">
                              {item.token}
                            </span>
                          </td>

                          {/* Patient */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 dark:text-brand-dark-heading">
                              {item.patientName}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-brand-dark-muted">
                              {item.gender}, {item.age} yrs • <span className="font-mono">{item.patientId}</span>
                            </div>
                          </td>

                          {/* Symptoms */}
                          <td className="py-3.5 px-4 max-w-xs truncate text-slate-700 dark:text-brand-dark-text font-medium">
                            {item.reason}
                            {item.vitalSummary && (
                              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                                {item.vitalSummary}
                              </div>
                            )}
                          </td>

                          {/* Waiting Time */}
                          <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 dark:text-brand-dark-muted">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{item.waitingMinutes} mins</span>
                            </div>
                          </td>

                          {/* Priority */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              {getPriorityBadge(item.priority)}
                              {/* Quick toggle priority dropdown */}
                              <select
                                value={item.priority}
                                onChange={(e) => changeQueuePriority(item.id, e.target.value as PriorityLevel)}
                                className="text-[10px] py-0.5 px-1 rounded bg-transparent border border-slate-200 dark:border-brand-dark-border text-slate-500 cursor-pointer"
                                title="Change Priority"
                              >
                                <option value="normal">Normal</option>
                                <option value="high">High</option>
                                <option value="emergency">Emergency</option>
                              </select>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {getStatusBadge(item.status)}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center justify-end gap-1.5">
                              {/* Call Action */}
                              <button
                                type="button"
                                onClick={() => {
                                  callPatient(item.id);
                                  openActionModal(item, 'call');
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-brand-blue-600 to-brand-teal-600 hover:from-brand-blue-700 hover:to-brand-teal-700 shadow-xs"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                                <span>Call</span>
                              </button>

                              {/* Start Consult */}
                              <button
                                type="button"
                                onClick={() => handleStartConsult(item.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-white bg-brand-navy-900 dark:bg-brand-dark-elevated hover:bg-brand-navy-800 border border-brand-navy-700 dark:border-brand-dark-border shadow-xs"
                              >
                                <Stethoscope className="w-3.5 h-3.5 text-brand-teal-400" />
                                <span>Consult</span>
                              </button>

                              {/* Skip button */}
                              {item.status === 'waiting' && (
                                <button
                                  type="button"
                                  onClick={() => skipPatient(item.id)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-brand-dark-elevated"
                                  title="Skip Patient"
                                >
                                  <SkipForward className="w-4 h-4" />
                                </button>
                              )}

                              {/* Mark No Show */}
                              {item.status === 'waiting' && (
                                <button
                                  type="button"
                                  onClick={() => markNoShow(item.id)}
                                  className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                  title="Mark No Show"
                                >
                                  <UserX className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="block md:hidden p-4 space-y-3">
                {filteredQueue.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-brand-dark-border bg-slate-50/50 dark:bg-brand-dark-elevated/40 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-brand-navy-900 text-white font-mono font-bold text-xs">
                        Token {item.token}
                      </span>
                      {getPriorityBadge(item.priority)}
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-brand-dark-heading">
                        {item.patientName}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-brand-dark-muted">
                        {item.gender}, {item.age} yrs • Wait: {item.waitingMinutes} mins
                      </p>
                      <p className="text-xs text-slate-700 dark:text-brand-dark-text mt-1">
                        {item.reason}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-brand-dark-border/60">
                      <div>{getStatusBadge(item.status)}</div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            callPatient(item.id);
                            openActionModal(item, 'call');
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-brand-blue-600 hover:bg-brand-blue-700 shadow-xs"
                        >
                          Call
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStartConsult(item.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-brand-navy-900 hover:bg-brand-navy-800 shadow-xs"
                        >
                          Consult
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="p-8">
              <EmptyState
                title="No Patients in Queue"
                description="The OPD Queue is currently clear for the selected filter. Checked in patients will automatically appear here."
              />
            </div>
          )}
        </div>
      </div>

      {/* Patient Action Modal */}
      <PatientActionModal
        isOpen={isModalOpen}
        mode={modalMode}
        patient={selectedPatientModal}
        onClose={() => setIsModalOpen(false)}
        onConfirmCall={(pt) => {
          callPatient(pt.id);
        }}
      />
    </DoctorPortalLayout>
  );
};
