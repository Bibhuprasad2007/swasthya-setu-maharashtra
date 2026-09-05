import React from 'react';
import { 
  Stethoscope, 
  ArrowRight, 
  Sparkles,
  Award
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface DoctorWelcomeCardProps {
  onStartConsultation: () => void;
  onViewQueue: () => void;
}

export const DoctorWelcomeCard: React.FC<DoctorWelcomeCardProps> = ({
  onStartConsultation,
  onViewQueue
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-navy-900 via-brand-navy-800 to-brand-blue-900 text-white shadow-lg border border-brand-navy-700/60 dark:border-brand-dark-border p-6 sm:p-7">
      {/* Subtle modern background glow */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-56 h-56 bg-brand-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/3 -mb-10 w-40 h-40 bg-brand-blue-400/15 rounded-full blur-2xl pointer-events-none" />

      {/* Subtle ECG heartbeat line */}
      <svg
        className="absolute right-36 bottom-0 top-0 h-full w-1/3 text-white/[0.04] pointer-events-none hidden md:block"
        viewBox="0 0 300 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <path
          d="M0 60H90L105 20L120 100L135 40L150 75L165 60H300"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        {/* Doctor Name & Specialization */}
        <div className="flex items-center gap-4">
          {/* Avatar Icon */}
          <div className="relative flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-brand-teal-500 to-brand-blue-600 flex items-center justify-center text-white shadow-md shadow-brand-teal-500/20 border border-white/20">
            <Stethoscope className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-brand-navy-900 flex items-center justify-center" title="Active On Duty">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {user?.name || 'Dr. Ananya Kulkarni (MBBS, MD)'}
              </h2>
            </div>

            <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-brand-teal-300">
              <Award className="w-4 h-4 text-brand-teal-400" />
              <span>{user?.roleTitle || 'Chief Medical Officer (General Medicine)'}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 flex-shrink-0 pt-2 sm:pt-0">
          <button
            type="button"
            onClick={onStartConsultation}
            className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-brand-teal-400 to-brand-blue-500 hover:from-brand-teal-300 hover:to-brand-blue-400 text-brand-navy-950 shadow-md shadow-brand-teal-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-brand-teal-300"
          >
            <Stethoscope className="w-4 h-4" />
            <span>{t.startConsultation}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onViewQueue}
            className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-white/40"
          >
            <Sparkles className="w-4 h-4 text-brand-teal-300" />
            <span>{t.viewLiveQueue}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
