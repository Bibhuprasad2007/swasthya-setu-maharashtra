import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Volume2, 
  FileText, 
  Clock, 
  AlertCircle, 
  X
} from 'lucide-react';
import { PatientQueueItem, PriorityLevel } from '../../types/doctor';
import { PatientQueueCard } from './PatientQueueCard';
import { EmptyState } from '../common/EmptyState';
import { useLanguage } from '../../context/LanguageContext';

interface PatientQueueProps {
  patients: PatientQueueItem[];
  onCallPatient: (patient: PatientQueueItem) => void;
  onViewPatient: (patient: PatientQueueItem) => void;
}

export const PatientQueue: React.FC<PatientQueueProps> = ({
  patients,
  onCallPatient,
  onViewPatient
}) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | PriorityLevel>('all');
  const [activeCalledNotice, setActiveCalledNotice] = useState<string | null>(null);

  // Filter patients based on search and priority
  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        patient.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (patient.abhaId && patient.abhaId.includes(searchQuery));

      const matchesPriority =
        priorityFilter === 'all' || patient.priority === priorityFilter;

      return matchesSearch && matchesPriority;
    });
  }, [patients, searchQuery, priorityFilter]);

  const handleCall = (patient: PatientQueueItem) => {
    setActiveCalledNotice(`Calling ${patient.patientName} (Token ${patient.token}) to OPD Room 1`);
    onCallPatient(patient);
    // Automatically dismiss notice after 5 seconds
    setTimeout(() => {
      setActiveCalledNotice((prev) => (prev?.includes(patient.token) ? null : prev));
    }, 5000);
  };

  return (
    <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200/80 dark:border-brand-dark-border shadow-xs overflow-hidden">
      {/* Queue Header & Filters */}
      <div className="p-5 sm:p-6 border-b border-slate-200/80 dark:border-brand-dark-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-brand-dark-heading">
                {t.queueTitle}
              </h3>
              <span className="px-2 py-0.5 rounded-md bg-brand-blue-50 dark:bg-brand-blue-950/60 text-brand-blue-700 dark:text-brand-blue-300 text-xs font-bold border border-brand-blue-200 dark:border-brand-blue-800/60">
                {filteredPatients.length} Active
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-brand-dark-muted mt-0.5">
              {t.queueSubtitle}
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPatientPlaceholder}
                className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-900 dark:text-brand-dark-text placeholder-slate-400 dark:placeholder-brand-dark-muted focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:bg-white dark:focus:bg-brand-dark-surface transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-brand-dark-text"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-brand-dark-elevated p-1 rounded-xl border border-slate-200/80 dark:border-brand-dark-border">
              <button
                type="button"
                onClick={() => setPriorityFilter('all')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  priorityFilter === 'all'
                    ? 'bg-white dark:bg-brand-dark-surface text-slate-900 dark:text-brand-dark-heading shadow-xs'
                    : 'text-slate-600 dark:text-brand-dark-muted hover:text-slate-900'
                }`}
              >
                {t.filterAll}
              </button>
              <button
                type="button"
                onClick={() => setPriorityFilter('high')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  priorityFilter === 'high'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-amber-700 dark:text-amber-400 hover:bg-amber-100/50 dark:hover:bg-amber-950/40'
                }`}
              >
                {t.filterHigh}
              </button>
              <button
                type="button"
                onClick={() => setPriorityFilter('normal')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  priorityFilter === 'normal'
                    ? 'bg-white dark:bg-brand-dark-surface text-slate-900 dark:text-brand-dark-heading shadow-xs'
                    : 'text-slate-600 dark:text-brand-dark-muted hover:text-slate-900'
                }`}
              >
                {t.filterNormal}
              </button>
            </div>
          </div>
        </div>

        {/* Live Call Notice Banner */}
        {activeCalledNotice && (
          <div className="mt-3.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between gap-3 text-xs font-semibold text-emerald-900 dark:text-emerald-200 animate-fade-in">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 animate-pulse" />
              <span>{activeCalledNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveCalledNotice(null)}
              className="p-1 text-emerald-700 hover:text-emerald-900 dark:text-emerald-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Table on Desktop / Tablet (md and up) */}
      <div className="hidden md:block overflow-x-auto">
        {filteredPatients.length > 0 ? (
          <table className="w-full text-left border-collapse" aria-label={t.queueTitle}>
            <thead>
              <tr className="bg-slate-50/80 dark:bg-brand-dark-elevated/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-brand-dark-muted border-b border-slate-200 dark:border-brand-dark-border">
                <th scope="col" className="py-3 px-4">{t.colToken}</th>
                <th scope="col" className="py-3 px-4">{t.colPatient}</th>
                <th scope="col" className="py-3 px-4">{t.colAge}</th>
                <th scope="col" className="py-3 px-4">{t.colReason}</th>
                <th scope="col" className="py-3 px-4">{t.colWaiting}</th>
                <th scope="col" className="py-3 px-4">{t.colPriority}</th>
                <th scope="col" className="py-3 px-4 text-right">{t.colAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-brand-dark-border/60 text-xs">
              {filteredPatients.map((patient) => {
                const isHigh = patient.priority === 'high';
                return (
                  <tr
                    key={patient.id}
                    className={`transition-colors hover:bg-slate-50/80 dark:hover:bg-brand-dark-elevated/40 ${
                      isHigh ? 'bg-amber-50/20 dark:bg-amber-950/10' : ''
                    }`}
                  >
                    {/* Token */}
                    <td className="py-3.5 px-4 font-mono font-bold text-brand-blue-700 dark:text-brand-blue-400 whitespace-nowrap">
                      <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border">
                        {patient.token}
                      </span>
                    </td>

                    {/* Patient Name & ABHA */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-brand-dark-heading">
                        {patient.patientName}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-brand-dark-muted font-mono">
                        {patient.abhaId || 'ABHA-LINKED'}
                      </div>
                    </td>

                    {/* Age & Gender */}
                    <td className="py-3.5 px-4 text-slate-700 dark:text-brand-dark-text whitespace-nowrap">
                      {patient.age} yrs • {patient.gender === 'Female' ? 'F' : 'M'}
                    </td>

                    {/* Symptoms / Reason */}
                    <td className="py-3.5 px-4 text-slate-700 dark:text-brand-dark-text max-w-xs truncate font-medium">
                      {patient.reason}
                    </td>

                    {/* Waiting Time */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-brand-dark-muted whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{patient.waitingMinutes} {t.minutesAgo}</span>
                      </div>
                    </td>

                    {/* Priority Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          isHigh
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60'
                            : 'bg-slate-100 text-slate-700 dark:bg-brand-dark-elevated dark:text-brand-dark-muted border border-slate-200 dark:border-brand-dark-border'
                        }`}
                      >
                        {isHigh && <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />}
                        {isHigh ? t.badgeHighPriority : t.badgeNormalPriority}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCall(patient)}
                          aria-label={`${t.callPatientBtn} ${patient.patientName}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-brand-blue-600 to-brand-teal-600 hover:from-brand-blue-700 hover:to-brand-teal-700 shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>{t.callPatientBtn}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onViewPatient(patient)}
                          aria-label={`${t.viewPatientBtn} for ${patient.patientName}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-brand-dark-text bg-slate-100 dark:bg-brand-dark-elevated hover:bg-slate-200 dark:hover:bg-brand-dark-border transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{t.viewPatientBtn}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="p-8">
            <EmptyState
              title={t.noPatientsFound}
              description={t.noPatientsDesc}
              compact
              actionText="Reset Filters"
              onAction={() => {
                setSearchQuery('');
                setPriorityFilter('all');
              }}
            />
          </div>
        )}
      </div>

      {/* Cards on Mobile (< md) */}
      <div className="block md:hidden p-4 space-y-3">
        {filteredPatients.length > 0 ? (
          filteredPatients.map((patient) => (
            <PatientQueueCard
              key={patient.id}
              patient={patient}
              onCall={handleCall}
              onView={onViewPatient}
            />
          ))
        ) : (
          <EmptyState
            title={t.noPatientsFound}
            description={t.noPatientsDesc}
            compact
            actionText="Reset Filters"
            onAction={() => {
              setSearchQuery('');
              setPriorityFilter('all');
            }}
          />
        )}
      </div>
    </div>
  );
};
