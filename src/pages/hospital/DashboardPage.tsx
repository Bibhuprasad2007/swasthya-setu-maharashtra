import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Stethoscope,
  Volume2
} from 'lucide-react';
import { DoctorPortalLayout } from '../../components/layouts/DoctorPortalLayout';
import { DoctorWelcomeCard } from '../../components/doctor/DoctorWelcomeCard';
import { DashboardStatCard } from '../../components/doctor/DashboardStatCard';
import { QuickActions } from '../../components/doctor/QuickActions';
import { ClinicalAlerts } from '../../components/doctor/ClinicalAlerts';
import { RecentActivity } from '../../components/doctor/RecentActivity';
import { PatientActionModal } from '../../components/doctor/PatientActionModal';
import { useDoctorPortal } from '../../context/DoctorPortalContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  DashboardStatItem,
  ClinicalAlertItem,
  RecentActivityItem,
  QueuePatientItem,
  PatientQueueItem
} from '../../types/doctor';

export const DashboardPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const {
    stats,
    queue,
    appointments,
    callPatient,
    setActiveConsultationPatient,
    getPatientById
  } = useDoctorPortal();

  // Patient action modal
  const [selectedPatientModal, setSelectedPatientModal] = useState<PatientQueueItem | null>(null);
  const [modalMode, setModalMode] = useState<'call' | 'view'>('call');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const queueSectionRef = useRef<HTMLDivElement>(null);

  // Summary Stat Cards computed from centralized state
  const summaryStats: DashboardStatItem[] = [
    {
      id: 'today_appointments',
      titleKey: 'statTodayAppointments',
      value: stats.todayAppointmentsCount,
      badgeText: `${stats.completedAppointmentsCount} completed`,
      badgeType: 'blue',
      iconName: 'calendar',
      accentColor: 'blue'
    },
    {
      id: 'waiting_patients',
      titleKey: 'statWaitingPatients',
      value: stats.waitingPatientsCount < 10 ? `0${stats.waitingPatientsCount}` : stats.waitingPatientsCount,
      badgeText: `Avg. wait: ${stats.avgWaitMinutes} mins`,
      badgeType: 'teal',
      iconName: 'users',
      accentColor: 'teal'
    },
    {
      id: 'priority_cases',
      titleKey: 'statPriorityCases',
      value: stats.priorityCasesCount < 10 ? `0${stats.priorityCasesCount}` : stats.priorityCasesCount,
      badgeText: 'Require early attention',
      badgeType: 'amber',
      iconName: 'alert',
      accentColor: 'amber'
    },
    {
      id: 'completed_consultations',
      titleKey: 'statCompletedConsultations',
      value: stats.completedConsultationsCount < 10 ? `0${stats.completedConsultationsCount}` : stats.completedConsultationsCount,
      badgeText: 'Completed today',
      badgeType: 'emerald',
      iconName: 'activity',
      accentColor: 'emerald'
    }
  ];

  // Clinical Alerts derived from active orders
  const clinicalAlerts: ClinicalAlertItem[] = [
    {
      id: 'alert-lab',
      titleKey: 'alertLabReports',
      descKey: 'alertLabReportsDesc',
      count: stats.pendingLabReportsCount,
      type: 'lab',
      severity: 'warning',
      actionLabelKey: 'actionReview'
    },
    {
      id: 'alert-ref',
      titleKey: 'alertReferrals',
      descKey: 'alertReferralsDesc',
      count: stats.pendingReferralsCount,
      type: 'referral',
      severity: 'amber',
      actionLabelKey: 'actionReview'
    },
    {
      id: 'alert-follow',
      titleKey: 'alertFollowups',
      descKey: 'alertFollowupsDesc',
      count: stats.dueFollowUpsCount,
      type: 'followup',
      severity: 'danger',
      actionLabelKey: 'actionReview'
    }
  ];

  // Recent Activities
  const recentActivities: RecentActivityItem[] = [
    {
      id: 'act-1',
      type: 'prescription',
      titleKey: 'activityPrescription',
      patientId: '#PT-8942',
      timestamp: '12 mins ago',
      details: 'Amoxicillin 500mg, Paracetamol 650mg prescribed'
    },
    {
      id: 'act-2',
      type: 'lab_received',
      titleKey: 'activityLabReceived',
      patientId: '#PT-7721',
      timestamp: '35 mins ago',
      details: 'Complete Blood Count (CBC) & HbA1c verified'
    },
    {
      id: 'act-3',
      type: 'referral_accepted',
      titleKey: 'activityReferralAccepted',
      patientId: '#PT-9034',
      timestamp: '1 hour ago',
      details: 'Referral accepted by Pune District Civil Hospital'
    },
    {
      id: 'act-4',
      type: 'consultation_completed',
      titleKey: 'activityConsultCompleted',
      patientId: '#PT-8419',
      timestamp: '2 hours ago',
      details: 'Primary consultation closed, follow-up scheduled'
    }
  ];

  // Quick Action Navigator
  const handleQuickAction = (actionKey: string) => {
    switch (actionKey) {
      case 'find_patient':
        navigate('/hospital/patients');
        break;
      case 'new_consultation':
        navigate('/hospital/consultations');
        break;
      case 'create_prescription':
        navigate('/hospital/prescriptions');
        break;
      case 'start_teleconsult':
        navigate('/hospital/teleconsultation');
        break;
      default:
        navigate('/hospital/dashboard');
    }
  };

  const handleStartConsultationForPatient = (patientId: string) => {
    const pt = getPatientById(patientId);
    if (pt) {
      setActiveConsultationPatient(pt);
    }
    navigate('/hospital/consultations');
  };

  const openPatientModal = (item: QueuePatientItem, mode: 'call' | 'view') => {
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

  const activeQueuePreview = queue.filter((q) => q.status === 'waiting' || q.status === 'called').slice(0, 3);
  const upcomingAppointmentsPreview = appointments.filter((a) => a.status !== 'cancelled').slice(0, 3);

  return (
    <DoctorPortalLayout>
      <div className="space-y-6 sm:space-y-8">
        {/* 1. Welcome Card Profile */}
        <section aria-label={t.welcomeBack || 'Doctor Welcome'}>
          <DoctorWelcomeCard
            onStartConsultation={() => navigate('/hospital/consultations')}
            onViewQueue={() => navigate('/hospital/appointments?tab=queue')}
          />
        </section>

        {/* 2. Summary Metric Cards */}
        <section aria-label={t.todayOverview || 'Today Overview'}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {summaryStats.map((stat) => (
              <DashboardStatCard
                key={stat.id}
                stat={stat}
                onClick={() => {
                  if (stat.id === 'waiting_patients') navigate('/hospital/appointments?tab=queue');
                  else if (stat.id === 'today_appointments') navigate('/hospital/appointments');
                  else if (stat.id === 'priority_cases') navigate('/hospital/appointments?tab=queue');
                  else if (stat.id === 'completed_consultations') navigate('/hospital/consultations');
                }}
              />
            ))}
          </div>
        </section>

        {/* 3. Quick Actions */}
        <section aria-label={t.quickActionsTitle || 'Quick Actions'}>
          <QuickActions onActionClick={(key) => handleQuickAction(key)} />
        </section>

        {/* 4. Live OPD Queue Preview & Upcoming Appointments Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
          {/* Left: Live Queue Preview */}
          <div className="lg:col-span-2 space-y-4" ref={queueSectionRef}>
            <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200/80 dark:border-brand-dark-border shadow-xs p-5 sm:p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-brand-dark-border mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-brand-dark-heading">
                      {t.queueTitle || 'Live OPD Queue'}
                    </h3>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-brand-blue-50 dark:bg-brand-blue-950/60 text-brand-blue-700 dark:text-brand-blue-300 border border-brand-blue-200 dark:border-brand-blue-800/60">
                      {stats.waitingPatientsCount} Waiting
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-brand-dark-muted mt-0.5">
                    Real-time registered patient tokens
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/hospital/appointments?tab=queue')}
                  className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-brand-blue-600 hover:text-brand-blue-700 dark:text-brand-blue-400 dark:hover:text-brand-blue-300"
                >
                  <span>Full Queue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Patient List */}
              <div className="space-y-3">
                {activeQueuePreview.map((item) => {
                  const isHigh = item.priority === 'high' || item.priority === 'emergency';
                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isHigh
                          ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60 shadow-xs'
                          : 'bg-slate-50/70 dark:bg-brand-dark-elevated/60 border-slate-200/70 dark:border-brand-dark-border/80'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="px-2.5 py-1.5 rounded-lg bg-brand-navy-900 dark:bg-brand-dark-elevated text-white font-mono font-bold text-xs border border-brand-navy-700 dark:border-brand-dark-border flex-shrink-0">
                          {item.token}
                        </span>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-brand-dark-heading">
                              {item.patientName}
                            </h4>
                            <span className="text-xs text-slate-500 dark:text-brand-dark-muted">
                              {item.gender === 'Female' ? 'F' : 'M'}, {item.age} yrs
                            </span>
                            <span
                              className={`text-[11px] font-bold px-2 py-0.2 rounded-full ${
                                isHigh
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60'
                                  : 'bg-slate-100 text-slate-700 dark:bg-brand-dark-elevated dark:text-brand-dark-muted border border-slate-200 dark:border-brand-dark-border'
                              }`}
                            >
                              {item.priority.toUpperCase()}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 dark:text-brand-dark-text mt-1">
                            {item.reason} • Waiting: <strong>{item.waitingMinutes} mins</strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            callPatient(item.id);
                            openPatientModal(item, 'call');
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-brand-blue-600 to-brand-teal-600 hover:from-brand-blue-700 hover:to-brand-teal-700 shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Call</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStartConsultationForPatient(item.patientId)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-brand-dark-text bg-white dark:bg-brand-dark-surface hover:bg-slate-100 dark:hover:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border shadow-2xs transition-colors"
                        >
                          <Stethoscope className="w-3.5 h-3.5 text-brand-blue-600 dark:text-brand-blue-400" />
                          <span>Consult</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Upcoming Appointments Preview */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200/80 dark:border-brand-dark-border shadow-xs p-5 sm:p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-brand-dark-border mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-brand-dark-heading">
                    {t.upcomingTitle || 'Appointments'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-brand-dark-muted mt-0.5">
                    Today's slots
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/hospital/appointments')}
                  className="inline-flex items-center gap-1 text-xs font-bold text-brand-blue-600 dark:text-brand-blue-400 hover:text-brand-blue-700 hover:underline"
                >
                  <span>All Slots</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {upcomingAppointmentsPreview.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-3 rounded-xl bg-slate-50/70 dark:bg-brand-dark-elevated/60 border border-slate-200/70 dark:border-brand-dark-border/80"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-mono font-bold text-xs text-brand-blue-700 dark:text-brand-blue-400">
                        {apt.time}
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-0.2 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                        {apt.type === 'teleconsultation' ? 'Teleconsult' : 'In-person'}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 dark:text-brand-dark-heading">
                      {apt.patientName}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-brand-dark-muted truncate mt-0.5">
                      {apt.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 5. Clinical Attention Required & Live Activity Log */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start">
          <section aria-label={t.clinicalAttentionTitle || 'Clinical Attention'}>
            <ClinicalAlerts
              alerts={clinicalAlerts}
              onReviewAlert={(alert) => {
                if (alert.type === 'lab') navigate('/hospital/lab-orders');
                else if (alert.type === 'referral') navigate('/hospital/referrals');
                else if (alert.type === 'followup') navigate('/hospital/follow-ups');
              }}
            />
          </section>

          <section aria-label={t.recentActivityTitle || 'Recent Activity'}>
            <RecentActivity activities={recentActivities} />
          </section>
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
