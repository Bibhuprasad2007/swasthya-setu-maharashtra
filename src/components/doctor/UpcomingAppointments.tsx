import React from 'react';
import { 
  Clock, 
  Video, 
  User, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertCircle,
  RefreshCcw,
  FileText
} from 'lucide-react';
import { UpcomingAppointmentItem, AppointmentType, AppointmentStatus } from '../../types/doctor';
import { useLanguage } from '../../context/LanguageContext';

interface UpcomingAppointmentsProps {
  appointments: UpcomingAppointmentItem[];
  onStartAppointment: (appointment: UpcomingAppointmentItem) => void;
  onViewAppointment: (appointment: UpcomingAppointmentItem) => void;
}

export const UpcomingAppointments: React.FC<UpcomingAppointmentsProps> = ({
  appointments,
  onStartAppointment,
  onViewAppointment
}) => {
  const { t } = useLanguage();

  const getTypeBadge = (type: AppointmentType) => {
    switch (type) {
      case 'teleconsultation':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-800/60">
            <Video className="w-3 h-3" />
            {t.typeTeleconsultation}
          </span>
        );
      case 'follow_up':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-200 dark:border-cyan-800/60">
            <RefreshCcw className="w-3 h-3" />
            {t.typeFollowup}
          </span>
        );
      case 'in_person':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-blue-700 dark:text-brand-blue-300 bg-brand-blue-50 dark:bg-brand-blue-950/60 px-2 py-0.5 rounded-md border border-brand-blue-200 dark:border-brand-blue-800/60">
            <User className="w-3 h-3" />
            {t.typeInPerson}
          </span>
        );
    }
  };

  const getStatusBadge = (status: AppointmentStatus | string) => {
    switch (status) {
      case 'confirmed':
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/60">
            <CheckCircle2 className="w-3 h-3" />
            {t.statusConfirmed || 'Confirmed'}
          </span>
        );
      case 'in_queue':
      case 'checked_in':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/60">
            <AlertCircle className="w-3 h-3" />
            {status === 'in_queue' ? 'In Queue' : 'Checked In'}
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
            {t.statusCompleted || 'Completed'}
          </span>
        );
      case 'cancelled':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-800/60">
            {t.statusCancelled || 'Cancelled'}
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200/80 dark:border-brand-dark-border shadow-xs p-5 sm:p-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-brand-dark-border mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-brand-dark-heading">
              {t.upcomingTitle}
            </h3>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-brand-blue-50 dark:bg-brand-blue-950/60 text-brand-blue-700 dark:text-brand-blue-300 border border-brand-blue-200 dark:border-brand-blue-800/60">
              {appointments.length} Slots
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-brand-dark-muted mt-0.5">
            {t.upcomingSubtitle}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {appointments.map((apt) => (
          <div
            key={apt.id}
            className="p-3.5 sm:p-4 rounded-xl bg-slate-50/70 dark:bg-brand-dark-elevated/60 border border-slate-200/70 dark:border-brand-dark-border/80 hover:border-brand-blue-300 dark:hover:border-brand-blue-700/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            {/* Left Column: Time & Patient Info */}
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center justify-center min-w-[64px] py-1.5 px-2 rounded-lg bg-white dark:bg-brand-dark-surface border border-slate-200 dark:border-brand-dark-border shadow-2xs text-center">
                <Clock className="w-3.5 h-3.5 text-brand-blue-600 dark:text-brand-blue-400 mb-0.5" />
                <span className="font-mono font-bold text-xs text-slate-900 dark:text-brand-dark-heading">
                  {apt.time}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-brand-dark-heading">
                    {apt.patientName}
                  </h4>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-brand-dark-muted">
                    {apt.patientId}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {getTypeBadge(apt.type)}
                  {getStatusBadge(apt.status)}
                </div>
              </div>
            </div>

            {/* Right Action */}
            <div className="flex items-center gap-1.5 self-end sm:self-center">
              <button
                type="button"
                onClick={() => onViewAppointment(apt)}
                aria-label={`${t.viewAppointmentBtn} for ${apt.patientName}`}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-brand-dark-text bg-white dark:bg-brand-dark-surface hover:bg-slate-100 dark:hover:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border shadow-2xs transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{t.viewAppointmentBtn}</span>
              </button>

              <button
                type="button"
                onClick={() => onStartAppointment(apt)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-brand-blue-600 to-brand-teal-600 hover:from-brand-blue-700 hover:to-brand-teal-700 shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
              >
                <span>{t.startAppointmentBtn}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
