import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Calendar,
  Plus,
  Search,
  CheckCircle2,
  X,
  UserCheck,
  CalendarCheck,
  Stethoscope,
  Video,
  RefreshCcw,
  Ban,
  Clock
} from 'lucide-react';
import { DoctorPortalLayout } from '../../components/layouts/DoctorPortalLayout';
import { AppointmentsQueueTab } from './AppointmentsQueueTab';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { useDoctorPortal } from '../../context/DoctorPortalContext';
import { AppointmentItem, AppointmentStatus, AppointmentType } from '../../types/doctor';

export const AppointmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'scheduled';

  const {
    appointments,
    patients,
    bookAppointment,
    checkInAppointment,
    rescheduleAppointment,
    cancelAppointment,
    setActiveConsultationPatient,
    getPatientById
  } = useDoctorPortal();

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'today' | 'tomorrow' | 'week' | 'all'>('today');
  const [typeFilter, setTypeFilter] = useState<'all' | AppointmentType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | AppointmentStatus>('all');

  // Modal State
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentItem | null>(null);

  // New Appointment Form State
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM',
    type: 'in_person' as AppointmentType,
    department: 'General Medicine',
    doctorName: 'Dr. Ananya Kulkarni (MBBS, MD)',
    reason: '',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Reschedule Form State
  const [rescheduleData, setRescheduleData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '11:00 AM'
  });

  // Filter Appointments
  const filteredAppointments = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    return appointments.filter((apt) => {
      // Search query
      const matchesSearch =
        searchQuery.trim() === '' ||
        apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.reason.toLowerCase().includes(searchQuery.toLowerCase());

      // Date tab
      let matchesDate = true;
      if (dateFilter === 'today') {
        matchesDate = apt.date === today || apt.date === '2026-09-06';
      } else if (dateFilter === 'tomorrow') {
        matchesDate = apt.date === tomorrow || apt.date === '2026-09-07';
      }

      // Type
      const matchesType = typeFilter === 'all' || apt.type === typeFilter;

      // Status
      const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;

      return matchesSearch && matchesDate && matchesType && matchesStatus;
    });
  }, [appointments, searchQuery, dateFilter, typeFilter, statusFilter]);

  // Validation
  const validateBookForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.patientName.trim()) {
      errors.patientName = 'Patient selection or name is required';
    }
    if (!formData.reason.trim()) {
      errors.reason = 'Clinical reason for appointment is required';
    }
    if (!formData.date) {
      errors.date = 'Date is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateBookForm()) return;

    bookAppointment({
      patientId: formData.patientId || 'pt-' + Date.now(),
      patientName: formData.patientName,
      date: formData.date,
      time: formData.time,
      type: formData.type,
      department: formData.department,
      doctorName: formData.doctorName,
      reason: formData.reason,
      notes: formData.notes
    });

    setIsBookModalOpen(false);
    setFormData({
      patientId: '',
      patientName: '',
      date: new Date().toISOString().split('T')[0],
      time: '10:00 AM',
      type: 'in_person',
      department: 'General Medicine',
      doctorName: 'Dr. Ananya Kulkarni (MBBS, MD)',
      reason: '',
      notes: ''
    });
  };

  const handleStartConsultation = (apt: AppointmentItem) => {
    const pt = getPatientById(apt.patientId);
    if (pt) {
      setActiveConsultationPatient(pt);
    }
    navigate('/hospital/consultations');
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'in_queue':
      case 'checked_in':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/70 px-2.5 py-0.5 rounded-full border border-teal-300 dark:border-teal-700/60">
            <UserCheck className="w-3 h-3 text-teal-600 dark:text-teal-400" />
            In OPD Queue
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700/60">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            Confirmed
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-blue-800 dark:text-brand-blue-300 bg-brand-blue-50 dark:bg-brand-blue-950/70 px-2.5 py-0.5 rounded-full border border-brand-blue-300 dark:border-brand-blue-700/60">
            <Calendar className="w-3 h-3" />
            Scheduled
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-brand-dark-elevated px-2.5 py-0.5 rounded-full">
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/70 px-2.5 py-0.5 rounded-full border border-rose-300 dark:border-rose-700/60">
            <Ban className="w-3 h-3" />
            Cancelled
          </span>
        );
      case 'no_show':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/70 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-700/60">
            No-Show
          </span>
        );
    }
  };

  const getTypeBadge = (type: AppointmentType) => {
    switch (type) {
      case 'teleconsultation':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-800/60">
            <Video className="w-3 h-3" />
            Teleconsult
          </span>
        );
      case 'follow_up':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-200 dark:border-cyan-800/60">
            <RefreshCcw className="w-3 h-3" />
            Follow-up
          </span>
        );
      case 'in_person':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-blue-700 dark:text-brand-blue-300 bg-brand-blue-50 dark:bg-brand-blue-950/60 px-2 py-0.5 rounded-md border border-brand-blue-200 dark:border-brand-blue-800/60">
            <Stethoscope className="w-3 h-3" />
            In-Person
          </span>
        );
    }
  };

  return (
    <DoctorPortalLayout
      pageTitle="Appointments Management"
      pageSubtitle="Schedule, track, and check-in patient slots across OPD and Telemedicine"
      headerAction={
        <button
          type="button"
          onClick={() => setIsBookModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-brand-blue-600 to-brand-teal-600 hover:from-brand-blue-700 hover:to-brand-teal-700 shadow-md shadow-brand-blue-600/20 transition-all focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
        >
          <Plus className="w-4 h-4" />
          <span>Book Appointment</span>
        </button>
      }
    >
      <div className="space-y-6">
        {/* Main Tabs Navigation */}
        <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200/80 dark:border-brand-dark-border p-2 shadow-xs">
          <div className="flex overflow-x-auto gap-2">
            {[
              { id: 'scheduled', label: 'Scheduled Appointments', icon: Calendar },
              { id: 'queue', label: 'Checked-in / Live Queue', icon: Clock },
              { id: 'completed', label: 'Completed', icon: CheckCircle2 },
              { id: 'cancelled', label: 'Cancelled / No-show', icon: Ban }
            ].map((tabItem) => (
              <button
                key={tabItem.id}
                type="button"
                onClick={() => setSearchParams({ tab: tabItem.id })}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                  activeTab === tabItem.id
                    ? 'bg-brand-blue-50 dark:bg-brand-blue-900/40 text-brand-blue-700 dark:text-brand-blue-300 shadow-inner'
                    : 'text-slate-600 dark:text-brand-dark-muted hover:bg-slate-50 dark:hover:bg-brand-dark-elevated hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <tabItem.icon className="w-4 h-4" />
                <span>{tabItem.label}</span>
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'queue' ? (
          <AppointmentsQueueTab />
        ) : (
          <>
            {/* Filters & Tabs Bar */}
            <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200/80 dark:border-brand-dark-border p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Quick Date Tabs */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-brand-dark-elevated p-1 rounded-xl border border-slate-200/80 dark:border-brand-dark-border overflow-x-auto">
                  {(['today', 'tomorrow', 'week', 'all'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setDateFilter(tab)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize whitespace-nowrap transition-all ${
                    dateFilter === tab
                      ? 'bg-white dark:bg-brand-dark-surface text-brand-blue-700 dark:text-brand-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-brand-dark-muted hover:text-slate-900'
                  }`}
                >
                  {tab === 'today' ? "Today's Slots" : tab === 'tomorrow' ? 'Tomorrow' : tab === 'week' ? 'This Week' : 'All Appointments'}
                </button>
              ))}
            </div>

            {/* Search & Dropdowns */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search */}
              <div className="relative min-w-[200px] flex-1 sm:flex-initial">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search patient, ID, reason..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-900 dark:text-brand-dark-text placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
                />
              </div>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as 'all' | AppointmentType)}
                className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-700 dark:text-brand-dark-text focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
              >
                <option value="all">All Types</option>
                <option value="in_person">In-Person</option>
                <option value="teleconsultation">Teleconsultation</option>
                <option value="follow_up">Follow-up</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | AppointmentStatus)}
                className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-700 dark:text-brand-dark-text focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_queue">In OPD Queue</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Appointments Table on Desktop / Cards on Mobile */}
        <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200/80 dark:border-brand-dark-border shadow-xs overflow-hidden">
          {filteredAppointments.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse" aria-label="Appointments List">
                  <thead>
                    <tr className="bg-slate-50/80 dark:bg-brand-dark-elevated/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-brand-dark-muted border-b border-slate-200 dark:border-brand-dark-border">
                      <th scope="col" className="py-3 px-4">Time & Date</th>
                      <th scope="col" className="py-3 px-4">Patient</th>
                      <th scope="col" className="py-3 px-4">Reason</th>
                      <th scope="col" className="py-3 px-4">Type</th>
                      <th scope="col" className="py-3 px-4">Status</th>
                      <th scope="col" className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-brand-dark-border/60 text-xs">
                    {filteredAppointments.map((apt) => (
                      <tr
                        key={apt.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-brand-dark-elevated/40 transition-colors"
                      >
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-mono font-bold text-brand-blue-700 dark:text-brand-blue-400">
                            {apt.time}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-brand-dark-muted">
                            {apt.date}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-brand-dark-heading">
                            {apt.patientName}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-brand-dark-muted font-mono">
                            {apt.patientId}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 max-w-xs truncate text-slate-700 dark:text-brand-dark-text font-medium">
                          {apt.reason}
                          {apt.queueToken && (
                            <span className="ml-2 px-1.5 py-0.2 rounded bg-brand-navy-900 dark:bg-brand-dark-elevated text-white font-mono text-[10px]">
                              Token {apt.queueToken}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {getTypeBadge(apt.type)}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {getStatusBadge(apt.status)}
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            {/* Check-In Action (if not checked in yet) */}
                            {apt.status === 'confirmed' || apt.status === 'scheduled' ? (
                              <button
                                type="button"
                                onClick={() => checkInAppointment(apt.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-teal-500"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Check In</span>
                              </button>
                            ) : null}

                            {/* Start Consultation Action */}
                            {apt.status === 'in_queue' || apt.status === 'confirmed' ? (
                              <button
                                type="button"
                                onClick={() => handleStartConsultation(apt)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-white bg-brand-blue-600 hover:bg-brand-blue-700 shadow-xs transition-all"
                              >
                                <Stethoscope className="w-3.5 h-3.5" />
                                <span>Consult</span>
                              </button>
                            ) : null}

                            {/* Reschedule */}
                            {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedAppointment(apt);
                                  setRescheduleData({ date: apt.date, time: apt.time });
                                  setIsRescheduleModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-brand-dark-elevated transition-colors"
                                title="Reschedule"
                              >
                                <CalendarCheck className="w-4 h-4" />
                              </button>
                            )}

                            {/* Cancel */}
                            {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedAppointment(apt);
                                  setIsCancelDialogOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                title="Cancel"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card Layout */}
              <div className="block md:hidden p-4 space-y-3">
                {filteredAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-brand-dark-border bg-slate-50/50 dark:bg-brand-dark-elevated/40 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="font-mono font-bold text-xs text-brand-blue-700 dark:text-brand-blue-400">
                          {apt.time}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-brand-dark-muted ml-2">
                          {apt.date}
                        </span>
                      </div>
                      {getStatusBadge(apt.status)}
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-brand-dark-heading">
                        {apt.patientName}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-brand-dark-text mt-0.5">
                        {apt.reason}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-brand-dark-border/60">
                      <div>{getTypeBadge(apt.type)}</div>

                      <div className="flex items-center gap-2">
                        {apt.status === 'confirmed' || apt.status === 'scheduled' ? (
                          <button
                            type="button"
                            onClick={() => checkInAppointment(apt.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-xs"
                          >
                            Check In
                          </button>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => handleStartConsultation(apt)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-brand-blue-600 hover:bg-brand-blue-700 shadow-xs"
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
                title="No Appointments Found"
                description="No appointment slots match the selected date or search filter. You can book a new slot anytime."
                actionText="Book New Appointment"
                onAction={() => setIsBookModalOpen(true)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Book Appointment Modal */}
      {isBookModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-fade-in"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsBookModalOpen(false)}
        >
          <div
            className="relative w-full max-w-lg bg-white dark:bg-brand-dark-surface rounded-2xl shadow-2xl border border-slate-200 dark:border-brand-dark-border p-6 overflow-hidden text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-brand-dark-border mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-brand-blue-50 dark:bg-brand-blue-950/60 text-brand-blue-600 dark:text-brand-blue-400 flex items-center justify-center border border-brand-blue-100 dark:border-brand-blue-900/40">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-brand-dark-heading">
                    Book New Clinical Appointment
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-brand-dark-muted">
                    Schedule an OPD or Teleconsultation consultation
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsBookModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-brand-dark-heading hover:bg-slate-100 dark:hover:bg-brand-dark-elevated"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookSubmit} className="space-y-4">
              {/* Select Existing Patient or Type Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-brand-dark-text mb-1">
                  Select Registered Patient *
                </label>
                <select
                  value={formData.patientId}
                  onChange={(e) => {
                    const selected = patients.find((p) => p.id === e.target.value);
                    if (selected) {
                      setFormData({
                        ...formData,
                        patientId: selected.id,
                        patientName: selected.name
                      });
                    }
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-900 dark:text-brand-dark-text focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
                >
                  <option value="">-- Choose from Patient Directory --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.patientId}) - {p.gender}, {p.age} yrs
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-brand-dark-text mb-1">
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  placeholder="Enter full patient name"
                  className={`w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border ${
                    formErrors.patientName ? 'border-rose-500' : 'border-slate-200 dark:border-brand-dark-border'
                  } text-slate-900 dark:text-brand-dark-text focus:outline-none focus:ring-2 focus:ring-brand-blue-500`}
                />
                {formErrors.patientName && (
                  <p className="text-[11px] text-rose-500 mt-1">{formErrors.patientName}</p>
                )}
              </div>

              {/* Date and Time Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-brand-dark-text mb-1">
                    Appointment Date *
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-900 dark:text-brand-dark-text focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-brand-dark-text mb-1">
                    Time Slot *
                  </label>
                  <select
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-900 dark:text-brand-dark-text focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
                  >
                    {['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '02:00 PM', '02:30 PM', '03:00 PM'].map(
                      (t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              {/* Consultation Type & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-brand-dark-text mb-1">
                    Consultation Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as AppointmentType })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-900 dark:text-brand-dark-text focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
                  >
                    <option value="in_person">In-Person OPD</option>
                    <option value="teleconsultation">Teleconsultation Link</option>
                    <option value="follow_up">Clinical Follow-up</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-brand-dark-text mb-1">
                    Clinical Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-900 dark:text-brand-dark-text focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
                  >
                    <option value="General Medicine">General Medicine</option>
                    <option value="Obstetrics & Maternal Care">Obstetrics & Maternal Care</option>
                    <option value="Pediatrics & Child Health">Pediatrics & Child Health</option>
                    <option value="Rural Health Tele-OPD">Rural Health Tele-OPD</option>
                  </select>
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-brand-dark-text mb-1">
                  Reason for Visit / Symptoms *
                </label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="e.g. Fever, persistent cough, BP review..."
                  className={`w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border ${
                    formErrors.reason ? 'border-rose-500' : 'border-slate-200 dark:border-brand-dark-border'
                  } text-slate-900 dark:text-brand-dark-text focus:outline-none focus:ring-2 focus:ring-brand-blue-500`}
                />
                {formErrors.reason && (
                  <p className="text-[11px] text-rose-500 mt-1">{formErrors.reason}</p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-brand-dark-border">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-brand-dark-text bg-slate-100 dark:bg-brand-dark-elevated hover:bg-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-brand-blue-600 to-brand-teal-600 hover:from-brand-blue-700 hover:to-brand-teal-700 rounded-xl shadow-md shadow-brand-blue-600/20"
                >
                  Confirm Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {isRescheduleModalOpen && selectedAppointment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-fade-in"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsRescheduleModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md bg-white dark:bg-brand-dark-surface rounded-2xl shadow-2xl border border-slate-200 dark:border-brand-dark-border p-6 overflow-hidden text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-brand-dark-border mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-brand-dark-heading">
                Reschedule Appointment
              </h3>
              <button
                type="button"
                onClick={() => setIsRescheduleModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-brand-dark-text">
                Rescheduling appointment for <strong>{selectedAppointment.patientName}</strong> ({selectedAppointment.patientId}).
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-brand-dark-text mb-1">
                  New Date
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={rescheduleData.date}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-900 dark:text-brand-dark-text"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-brand-dark-text mb-1">
                  New Time Slot
                </label>
                <select
                  value={rescheduleData.time}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-900 dark:text-brand-dark-text"
                >
                  {['09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '02:00 PM', '03:00 PM'].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-brand-dark-border">
                <button
                  type="button"
                  onClick={() => setIsRescheduleModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    rescheduleAppointment(selectedAppointment.id, rescheduleData.date, rescheduleData.time);
                    setIsRescheduleModalOpen(false);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-brand-blue-600 rounded-xl shadow-xs"
                >
                  Confirm Reschedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isCancelDialogOpen}
        title="Cancel Appointment?"
        message={`Are you sure you want to cancel the scheduled appointment for ${selectedAppointment?.patientName}? This action will release the assigned clinical slot.`}
        confirmLabel="Yes, Cancel Slot"
        cancelLabel="Keep Appointment"
        type="danger"
        onConfirm={() => {
          if (selectedAppointment) {
            cancelAppointment(selectedAppointment.id, 'Cancelled by doctor/OPD desk');
          }
        }}
        onCancel={() => setIsCancelDialogOpen(false)}
      />
          </>
        )}
    </DoctorPortalLayout>
  );
};
