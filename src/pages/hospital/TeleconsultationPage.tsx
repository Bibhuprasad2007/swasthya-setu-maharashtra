import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Plus,
  User,
  FileText,
  Pill,
  FlaskConical,
  X,
  Wifi
} from 'lucide-react';
import { DoctorPortalLayout } from '../../components/layouts/DoctorPortalLayout';
import { useDoctorPortal } from '../../context/DoctorPortalContext';
import { TeleconsultSession } from '../../types/doctor';

export const TeleconsultationPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    teleconsultations,
    patients,
    createTeleconsult,
    updateTeleconsultStatus,
    setActiveConsultationPatient,
    getPatientById
  } = useDoctorPortal();

  // Active call chamber state
  const [activeCallSession, setActiveCallSession] = useState<TeleconsultSession | null>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isLowBandwidthMode, setIsLowBandwidthMode] = useState(false);
  const [callNotes, setCallNotes] = useState('');

  // Modals
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // New Session Form State
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    scheduledTime: '11:30 AM',
    durationMinutes: 15,
    department: 'Rural Health Tele-OPD',
    doctorName: 'Dr. Ananya Kulkarni (MBBS, MD)',
    notes: 'Sub-Centre teleconsultation link'
  });

  const handleStartCall = (session: TeleconsultSession) => {
    setActiveCallSession(session);
    updateTeleconsultStatus(session.id, 'in_progress');
    const pt = getPatientById(session.patientId);
    if (pt) setActiveConsultationPatient(pt);
  };

  const handleEndCall = () => {
    if (activeCallSession) {
      updateTeleconsultStatus(activeCallSession.id, 'completed');
      setActiveCallSession(null);
    }
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientName) return;

    createTeleconsult({
      patientId: formData.patientId || 'pt-' + Date.now(),
      patientName: formData.patientName,
      scheduledTime: formData.scheduledTime,
      durationMinutes: Number(formData.durationMinutes) || 15,
      department: formData.department,
      doctorName: formData.doctorName,
      notes: formData.notes
    });

    setIsScheduleModalOpen(false);
  };

  return (
    <DoctorPortalLayout
      pageTitle="Telemedicine & Remote Village OPD"
      pageSubtitle="Live high-definition encrypted audio-video consultations with rural Sub-Centres and Health Wellness Centres (HWC)"
      headerAction={
        <button
          type="button"
          onClick={() => setIsScheduleModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md shadow-purple-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Tele-OPD Slot</span>
        </button>
      }
    >
      <div className="space-y-6">
        {/* Active Teleconsultation Live Room */}
        {activeCallSession ? (
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-2xl border border-slate-700 space-y-6 animate-fade-in">
            {/* Top Call Info Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Tele-OPD Live: {activeCallSession.patientName}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-300 font-mono border border-purple-500/40">
                      {activeCallSession.id}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Channel: <strong>{activeCallSession.channelName || 'Sub-Centre Hub 01'}</strong> • 15 Mins Slot
                  </p>
                </div>
              </div>

              {/* Network Status & Bandwidth Toggle */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-800/60">
                  <Wifi className="w-3.5 h-3.5" />
                  <span>Optimal 1080p (60ms)</span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsLowBandwidthMode(!isLowBandwidthMode)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-semibold border transition-all ${
                    isLowBandwidthMode
                      ? 'bg-amber-500 text-white border-amber-400'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {isLowBandwidthMode ? 'Low Bandwidth: ON (Audio Priority)' : 'Low Bandwidth: Auto'}
                </button>
              </div>
            </div>

            {/* Video Streams & Clinical Notes Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Main Video Stage (2 spans) */}
              <div className="lg:col-span-2 space-y-4">
                <div className="relative aspect-video rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center shadow-inner">
                  {/* Remote Patient Video Feed Simulator */}
                  <div className="flex flex-col items-center justify-center text-center p-6 space-y-2">
                    <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 border-2 border-brand-teal-500 shadow-lg">
                      <User className="w-10 h-10" />
                    </div>
                    <h4 className="text-base font-bold text-white">
                      {activeCallSession.patientName} (Rural Sub-Centre Patient)
                    </h4>
                    <p className="text-xs text-slate-400 max-w-sm">
                      Video simulation active. Assisted by Community Health Officer (CHO) at PHC Khed Sub-Centre.
                    </p>
                    <span className="text-[10px] text-brand-teal-400 font-mono">
                      Encrypted End-to-End ABDM WebRTC Stream
                    </span>
                  </div>

                  {/* Picture-in-Picture Doctor Preview */}
                  <div className="absolute bottom-4 right-4 w-36 sm:w-44 aspect-video rounded-xl bg-slate-900 border-2 border-brand-blue-500 shadow-2xl flex items-center justify-center overflow-hidden">
                    {isCameraOn ? (
                      <div className="text-center p-2">
                        <span className="text-[10px] font-bold text-brand-blue-300 block">Dr. Ananya Kulkarni</span>
                        <span className="text-[9px] text-slate-400 font-mono">Chamber Cam</span>
                      </div>
                    ) : (
                      <div className="text-slate-500 flex flex-col items-center">
                        <VideoOff className="w-5 h-5" />
                        <span className="text-[9px]">Camera Muted</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Call Control Strip */}
                <div className="flex items-center justify-center gap-4 py-3 bg-slate-950/80 rounded-2xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsMicOn(!isMicOn)}
                    className={`p-3.5 rounded-full font-bold transition-all ${
                      isMicOn ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-rose-600 text-white'
                    }`}
                    title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
                  >
                    {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCameraOn(!isCameraOn)}
                    className={`p-3.5 rounded-full font-bold transition-all ${
                      isCameraOn ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-rose-600 text-white'
                    }`}
                    title={isCameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
                  >
                    {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                  </button>

                  <button
                    type="button"
                    onClick={handleEndCall}
                    className="px-6 py-3.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all"
                  >
                    <PhoneOff className="w-5 h-5" />
                    <span>End Tele-OPD Session</span>
                  </button>
                </div>
              </div>

              {/* Right Side: Quick In-Call Clinical Workspace */}
              <div className="space-y-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-teal-300">
                  Live Consultation Shortcuts
                </h4>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    In-Call Clinical Observations
                  </label>
                  <textarea
                    rows={4}
                    value={callNotes}
                    onChange={(e) => setCallNotes(e.target.value)}
                    placeholder="Enter observations during video stream..."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-blue-500"
                  />
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 block mb-1">
                    Synchronized Actions
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate('/hospital/consultations')}
                    className="w-full py-2 px-3 rounded-xl bg-brand-blue-600 hover:bg-brand-blue-700 text-white font-bold text-xs flex items-center justify-between"
                  >
                    <span>Open Full Clinical Notes</span>
                    <FileText className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/hospital/prescriptions')}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-between"
                  >
                    <span>Issue e-Prescription (Rx)</span>
                    <Pill className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/hospital/lab-orders')}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-between"
                  >
                    <span>Order Diagnostic Tests</span>
                    <FlaskConical className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Scheduled Teleconsultation Sessions List */}
        <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200/80 dark:border-brand-dark-border p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-brand-dark-border">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-brand-dark-heading">
                Today's Tele-OPD Video Sessions
              </h3>
              <p className="text-xs text-slate-500 dark:text-brand-dark-muted">
                Pre-scheduled rural health connections with Sub-Centre telemedicine rooms
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teleconsultations.map((session) => (
              <div
                key={session.id}
                className="p-5 rounded-2xl border border-slate-200/80 dark:border-brand-dark-border bg-slate-50/50 dark:bg-brand-dark-elevated/40 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-800/60">
                      {session.scheduledTime}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {session.status.toUpperCase()}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 dark:text-brand-dark-heading">
                    {session.patientName}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Dept: {session.department} • {session.durationMinutes} mins
                  </p>
                  <p className="text-xs text-slate-600 dark:text-brand-dark-text mt-2">
                    {session.notes}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/60 dark:border-brand-dark-border/60">
                  <button
                    type="button"
                    onClick={() => handleStartCall(session)}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md shadow-purple-600/20 flex items-center justify-center gap-2"
                  >
                    <Video className="w-4 h-4" />
                    <span>Launch Tele-Consult Room</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      {isScheduleModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-fade-in"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsScheduleModalOpen(false)}
        >
          <div
            className="relative w-full max-w-lg bg-white dark:bg-brand-dark-surface rounded-2xl shadow-2xl border border-slate-200 dark:border-brand-dark-border p-6 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-brand-dark-border mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-brand-dark-heading">
                Schedule New Tele-OPD Video Slot
              </h3>
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-brand-dark-text mb-1">
                  Select Patient *
                </label>
                <select
                  value={formData.patientId}
                  onChange={(e) => {
                    const pt = patients.find((p) => p.id === e.target.value);
                    if (pt) {
                      setFormData({
                        ...formData,
                        patientId: pt.id,
                        patientName: pt.name
                      });
                    }
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.patientId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-brand-dark-text mb-1">
                    Scheduled Time Slot
                  </label>
                  <input
                    type="text"
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-brand-dark-text mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-brand-dark-text mb-1">
                  Sub-Centre / Connection Notes
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-brand-dark-border">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-xs"
                >
                  Confirm Video Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DoctorPortalLayout>
  );
};
