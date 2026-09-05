import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Plus,
  AlertTriangle,
  FileText,
  Stethoscope,
  MapPin,
  Activity,
  X,
  CreditCard,
  Pill,
  FlaskConical
} from 'lucide-react';
import { DoctorPortalLayout } from '../../components/layouts/DoctorPortalLayout';
import { EmptyState } from '../../components/common/EmptyState';
import { useDoctorPortal } from '../../context/DoctorPortalContext';
import { PatientRecord } from '../../types/doctor';

export const PatientsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    patients,
    registerPatient,
    setActiveConsultationPatient,
    prescriptions,
    labOrders,
    consultations
  } = useDoctorPortal();

  // Search and Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');

  // Modals
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedPatientForView, setSelectedPatientForView] = useState<PatientRecord | null>(null);
  const [activeProfileTab, setActiveProfileTab] = useState<'overview' | 'allergies' | 'history' | 'prescriptions' | 'labs'>('overview');

  // Registration Form State
  const [regFormData, setRegFormData] = useState({
    name: '',
    dob: '1990-01-01',
    age: 36,
    gender: 'Female' as 'Male' | 'Female' | 'Other',
    phone: '+91 ',
    address: '',
    village: 'Khed Rural',
    taluka: 'Khed',
    district: 'Pune',
    bloodGroup: 'B+',
    emergencyContact: '',
    abhaId: '',
    allergies: '',
    conditions: '',
    isHighRisk: false,
    consentAcknowledged: true
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Filter Patients
  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.phone.includes(searchQuery) ||
        (p.abhaId && p.abhaId.includes(searchQuery)) ||
        p.village.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesGender = genderFilter === 'all' || p.gender === genderFilter;
      const matchesRisk =
        riskFilter === 'all'
          ? true
          : riskFilter === 'high'
          ? p.isHighRisk
          : !p.isHighRisk;

      return matchesSearch && matchesGender && matchesRisk;
    });
  }, [patients, searchQuery, genderFilter, riskFilter]);

  const validateRegForm = () => {
    const errors: Record<string, string> = {};
    if (!regFormData.name.trim()) errors.name = 'Full name is required';
    if (!regFormData.phone.trim() || regFormData.phone.length < 8) errors.phone = 'Valid mobile number required';
    if (!regFormData.address.trim()) errors.address = 'Residential address is required';
    if (!regFormData.consentAcknowledged) errors.consent = 'Patient consent acknowledgment is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRegForm()) return;

    const allergiesList = regFormData.allergies
      ? regFormData.allergies.split(',').map((s) => s.trim())
      : [];
    const conditionsList = regFormData.conditions
      ? regFormData.conditions.split(',').map((s) => s.trim())
      : [];

    const newPt = registerPatient({
      name: regFormData.name,
      dob: regFormData.dob,
      age: Number(regFormData.age) || 30,
      gender: regFormData.gender,
      phone: regFormData.phone,
      address: regFormData.address,
      village: regFormData.village,
      taluka: regFormData.taluka,
      district: regFormData.district,
      bloodGroup: regFormData.bloodGroup,
      emergencyContact: regFormData.emergencyContact,
      abhaId: regFormData.abhaId || undefined,
      allergies: allergiesList,
      conditions: conditionsList,
      isHighRisk: regFormData.isHighRisk
    });

    setIsRegisterModalOpen(false);
    setSelectedPatientForView(newPt);
  };

  const handleStartConsultation = (patient: PatientRecord) => {
    setActiveConsultationPatient(patient);
    navigate('/hospital/consultations');
  };

  // Get Patient's linked records
  const patientPrescriptions = useMemo(() => {
    if (!selectedPatientForView) return [];
    return prescriptions.filter(
      (p) => p.patientId === selectedPatientForView.id || p.patientId === selectedPatientForView.patientId
    );
  }, [prescriptions, selectedPatientForView]);

  const patientLabs = useMemo(() => {
    if (!selectedPatientForView) return [];
    return labOrders.filter(
      (l) => l.patientId === selectedPatientForView.id || l.patientId === selectedPatientForView.patientId
    );
  }, [labOrders, selectedPatientForView]);

  const patientConsults = useMemo(() => {
    if (!selectedPatientForView) return [];
    return consultations.filter(
      (c) => c.patientId === selectedPatientForView.id || c.patientId === selectedPatientForView.patientId
    );
  }, [consultations, selectedPatientForView]);

  return (
    <DoctorPortalLayout
      pageTitle="Patient Directory & Universal Health Records"
      pageSubtitle="Search, register, and inspect clinical histories and ABHA linked files"
      headerAction={
        <button
          type="button"
          onClick={() => setIsRegisterModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-brand-blue-600 to-brand-teal-600 hover:from-brand-blue-700 hover:to-brand-teal-700 shadow-md shadow-brand-blue-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Patient</span>
        </button>
      }
    >
      <div className="space-y-6">
        {/* Search & Filter Bar */}
        <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200/80 dark:border-brand-dark-border p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative min-w-[260px] flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, Patient ID, ABHA number, mobile or village..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-900 dark:text-brand-dark-text placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Gender Filter */}
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-700 dark:text-brand-dark-text focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
            >
              <option value="all">All Genders</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>

            {/* High-Risk Filter */}
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-700 dark:text-brand-dark-text focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
            >
              <option value="all">All Risk Levels</option>
              <option value="high">High-Risk Patients</option>
              <option value="normal">Normal Health</option>
            </select>
          </div>
        </div>

        {/* Patients Grid / Directory Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredPatients.map((patient) => {
            return (
              <div
                key={patient.id}
                className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                  patient.isHighRisk
                    ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60 shadow-xs'
                    : 'bg-white dark:bg-brand-dark-surface border-slate-200/80 dark:border-brand-dark-border shadow-xs hover:shadow-card dark:hover:shadow-card-dark'
                }`}
              >
                <div>
                  {/* Top identifier and risk badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-xs font-bold text-brand-blue-700 dark:text-brand-blue-400 bg-brand-blue-50 dark:bg-brand-blue-950/60 px-2.5 py-1 rounded-lg border border-brand-blue-200 dark:border-brand-blue-800/60">
                      {patient.patientId}
                    </span>

                    {patient.isHighRisk ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-700/60">
                        <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                        High Risk
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-brand-dark-muted">
                        Blood Group: <strong className="text-slate-700 dark:text-brand-dark-text">{patient.bloodGroup}</strong>
                      </span>
                    )}
                  </div>

                  {/* Patient Name & Demographics */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-brand-dark-heading">
                    {patient.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-brand-dark-muted mt-0.5">
                    <span>{patient.gender}, {patient.age} yrs</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {patient.village} ({patient.taluka})
                    </span>
                  </div>

                  {/* ABHA Badge */}
                  {patient.abhaId && (
                    <div className="flex items-center gap-1.5 mt-2.5 text-xs text-slate-600 dark:text-brand-dark-text">
                      <CreditCard className="w-3.5 h-3.5 text-brand-teal-600 dark:text-brand-teal-400" />
                      <span className="font-mono font-semibold">{patient.abhaId}</span>
                    </div>
                  )}

                  {/* Conditions & Allergies Pills */}
                  <div className="mt-3 space-y-1.5">
                    {patient.allergies.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400">
                          Allergies:
                        </span>
                        {patient.allergies.map((a, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 font-semibold"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    )}

                    {patient.conditions.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-brand-dark-muted">
                          Conditions:
                        </span>
                        {patient.conditions.map((c, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-brand-dark-elevated text-slate-700 dark:text-brand-dark-text"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center gap-2 pt-4 mt-4 border-t border-slate-200/60 dark:border-brand-dark-border/60">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPatientForView(patient);
                      setActiveProfileTab('overview');
                    }}
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold text-slate-700 dark:text-brand-dark-text bg-slate-100 dark:bg-brand-dark-elevated hover:bg-slate-200 dark:hover:bg-brand-dark-border transition-colors text-center"
                  >
                    View Record
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStartConsultation(patient)}
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-blue-600 to-brand-teal-600 hover:from-brand-blue-700 hover:to-brand-teal-700 shadow-xs transition-all text-center flex items-center justify-center gap-1.5"
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>Consult</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredPatients.length === 0 && (
          <div className="p-8 bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border">
            <EmptyState
              title="No Patients Found"
              description="No registered patient records match your search or filter criteria."
              actionText="Register New Patient"
              onAction={() => setIsRegisterModalOpen(true)}
            />
          </div>
        )}
      </div>

      {/* Patient Profile Details Modal with Tabs */}
      {selectedPatientForView && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-fade-in"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedPatientForView(null)}
        >
          <div
            className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-brand-dark-surface rounded-2xl shadow-2xl border border-slate-200 dark:border-brand-dark-border overflow-hidden text-left flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Banner */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-brand-navy-900 via-brand-navy-800 to-brand-blue-900 text-white flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-brand-teal-500/20 border border-brand-teal-400/30 flex items-center justify-center text-brand-teal-300">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      {selectedPatientForView.name}
                    </h3>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/10 text-brand-teal-300 border border-white/15">
                      {selectedPatientForView.patientId}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {selectedPatientForView.gender}, {selectedPatientForView.age} yrs • Blood Group: <strong>{selectedPatientForView.bloodGroup}</strong> • Contact: {selectedPatientForView.phone}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPatientForView(null)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Tab Navigation */}
            <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 dark:border-brand-dark-border bg-slate-50 dark:bg-brand-dark-elevated/50 overflow-x-auto">
              {(
                [
                  { id: 'overview', label: 'Clinical Overview', icon: Activity },
                  { id: 'allergies', label: 'Allergies & Conditions', icon: AlertTriangle },
                  { id: 'history', label: 'Past Consultations', icon: FileText },
                  { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
                  { id: 'labs', label: 'Lab Reports', icon: FlaskConical }
                ] as const
              ).map((tab) => {
                const Icon = tab.icon;
                const isActive = activeProfileTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveProfileTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${
                      isActive
                        ? 'border-brand-blue-600 text-brand-blue-700 dark:text-brand-blue-400 bg-white dark:bg-brand-dark-surface rounded-t-lg'
                        : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-brand-dark-muted'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs sm:text-sm">
              {activeProfileTab === 'overview' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-brand-dark-elevated/60 border border-slate-200/80 dark:border-brand-dark-border">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Residential Address
                      </span>
                      <p className="font-semibold text-slate-900 dark:text-brand-dark-heading">
                        {selectedPatientForView.address}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {selectedPatientForView.village}, Taluka {selectedPatientForView.taluka}, Dist. {selectedPatientForView.district}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-brand-dark-elevated/60 border border-slate-200/80 dark:border-brand-dark-border">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Emergency Contact
                      </span>
                      <p className="font-semibold text-slate-900 dark:text-brand-dark-heading">
                        {selectedPatientForView.emergencyContact || 'None recorded'}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Registered Date: {selectedPatientForView.registeredDate}
                      </p>
                    </div>
                  </div>

                  {/* Recorded Vitals */}
                  {selectedPatientForView.vitals && (
                    <div className="p-4 rounded-xl bg-brand-blue-50/60 dark:bg-brand-blue-950/40 border border-brand-blue-100 dark:border-brand-blue-900/40">
                      <div className="flex items-center gap-2 mb-2 font-bold text-brand-blue-900 dark:text-brand-blue-300">
                        <Activity className="w-4 h-4 text-brand-blue-600" />
                        <span>Last Recorded Vital Signs</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                        <div>BP: <strong>{selectedPatientForView.vitals.bpSys}/{selectedPatientForView.vitals.bpDia} mmHg</strong></div>
                        <div>Temp: <strong>{selectedPatientForView.vitals.temperature || '98.6'} °F</strong></div>
                        <div>Pulse: <strong>{selectedPatientForView.vitals.pulse || '76'} bpm</strong></div>
                        <div>SpO2: <strong>{selectedPatientForView.vitals.spo2 || '98'} %</strong></div>
                      </div>
                    </div>
                  )}

                  {selectedPatientForView.notes && (
                    <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-brand-dark-elevated text-xs text-slate-700 dark:text-brand-dark-text">
                      <strong>Doctor Notes:</strong> {selectedPatientForView.notes}
                    </div>
                  )}
                </div>
              )}

              {activeProfileTab === 'allergies' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60">
                    <h4 className="font-bold text-rose-900 dark:text-rose-300 flex items-center gap-2 mb-2 text-sm">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      Known Medical Allergies
                    </h4>
                    {selectedPatientForView.allergies.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1 text-xs text-rose-800 dark:text-rose-200 font-semibold">
                        {selectedPatientForView.allergies.map((a, i) => (
                          <li key={i}>{a}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-rose-700">No known drug allergies reported.</p>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-brand-dark-elevated/60 border border-slate-200 dark:border-brand-dark-border">
                    <h4 className="font-bold text-slate-900 dark:text-brand-dark-heading mb-2 text-sm">
                      Chronic & Pre-Existing Health Conditions
                    </h4>
                    {selectedPatientForView.conditions.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedPatientForView.conditions.map((c, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-lg bg-white dark:bg-brand-dark-surface border border-slate-200 dark:border-brand-dark-border text-xs font-semibold text-slate-800 dark:text-brand-dark-text"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">No chronic conditions recorded.</p>
                    )}
                  </div>
                </div>
              )}

              {activeProfileTab === 'history' && (
                <div className="space-y-3">
                  {patientConsults.length > 0 ? (
                    patientConsults.map((c) => (
                      <div
                        key={c.id}
                        className="p-4 rounded-xl border border-slate-200 dark:border-brand-dark-border bg-slate-50/50 dark:bg-brand-dark-elevated/40 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-brand-dark-heading text-xs">
                            {c.date} • {c.doctorName}
                          </span>
                          <span className="font-mono text-[11px] px-2 py-0.2 rounded bg-brand-blue-50 text-brand-blue-700 border border-brand-blue-200">
                            {c.id}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-brand-dark-text">
                          <strong>Diagnosis:</strong> {c.finalDiagnosis || c.provisionalDiagnosis}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-brand-dark-muted">
                          <strong>Advice:</strong> {c.clinicalAdvice}
                        </p>
                      </div>
                    ))
                  ) : (
                    <EmptyState
                      title="No Past Consultations"
                      description="No prior consultations recorded on this network."
                      compact
                    />
                  )}
                </div>
              )}

              {activeProfileTab === 'prescriptions' && (
                <div className="space-y-3">
                  {patientPrescriptions.length > 0 ? (
                    patientPrescriptions.map((rx) => (
                      <div
                        key={rx.id}
                        className="p-4 rounded-xl border border-slate-200 dark:border-brand-dark-border bg-slate-50/50 dark:bg-brand-dark-elevated/40"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-xs font-mono text-brand-blue-600">
                            {rx.id} ({rx.date})
                          </span>
                          <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {rx.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="space-y-1 text-xs">
                          {rx.medicines.map((m, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                              <span className="font-semibold">{m.medicineName} ({m.strength})</span>
                              <span className="text-slate-500">{m.frequency} • {m.duration}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyState
                      title="No Prescriptions Issued"
                      description="No prescriptions recorded for this patient."
                      compact
                    />
                  )}
                </div>
              )}

              {activeProfileTab === 'labs' && (
                <div className="space-y-3">
                  {patientLabs.length > 0 ? (
                    patientLabs.map((l) => (
                      <div
                        key={l.id}
                        className="p-4 rounded-xl border border-slate-200 dark:border-brand-dark-border bg-slate-50/50 dark:bg-brand-dark-elevated/40"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-mono font-bold text-xs text-teal-600">
                            {l.id} - {l.testCategory}
                          </span>
                          <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-teal-100 text-teal-800">
                            {l.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 font-semibold">{l.tests.join(', ')}</p>
                        <p className="text-[11px] text-slate-500 mt-1">Centre: {l.diagnosticCentre}</p>
                      </div>
                    ))
                  ) : (
                    <EmptyState
                      title="No Lab Orders"
                      description="No diagnostic test orders recorded."
                      compact
                    />
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-brand-dark-elevated/60 border-t border-slate-200 dark:border-brand-dark-border flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedPatientForView(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => {
                  const pt = selectedPatientForView;
                  setSelectedPatientForView(null);
                  handleStartConsultation(pt);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-brand-blue-600 to-brand-teal-600 hover:from-brand-blue-700 hover:to-brand-teal-700 rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Start Active Consultation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register Patient Modal */}
      {isRegisterModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-fade-in"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsRegisterModalOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-brand-dark-surface rounded-2xl shadow-2xl border border-slate-200 dark:border-brand-dark-border p-6 overflow-y-auto text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-brand-dark-border mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-brand-dark-heading">
                  Register New Patient (OPD Desk)
                </h3>
                <p className="text-xs text-slate-500">
                  Universal demographic record generation for Maharashtra Public Health Network
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRegisterModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-brand-dark-text mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={regFormData.name}
                    onChange={(e) => setRegFormData({ ...regFormData, name: e.target.value })}
                    placeholder="e.g. Ramesh Baburao Patil"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-900 dark:text-brand-dark-text focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
                  />
                  {formErrors.name && <p className="text-[11px] text-rose-500 mt-1">{formErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-brand-dark-text mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    value={regFormData.phone}
                    onChange={(e) => setRegFormData({ ...regFormData, phone: e.target.value })}
                    placeholder="+91 98230 XXXXX"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-900 dark:text-brand-dark-text focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
                  />
                  {formErrors.phone && <p className="text-[11px] text-rose-500 mt-1">{formErrors.phone}</p>}
                </div>
              </div>

              {/* Age, Gender & Blood Group */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-brand-dark-text mb-1">
                    Age (Years) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={regFormData.age}
                    onChange={(e) => setRegFormData({ ...regFormData, age: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-900 dark:text-brand-dark-text focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-brand-dark-text mb-1">
                    Gender *
                  </label>
                  <select
                    value={regFormData.gender}
                    onChange={(e) => setRegFormData({ ...regFormData, gender: e.target.value as 'Male' | 'Female' | 'Other' })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-900 dark:text-brand-dark-text focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-brand-dark-text mb-1">
                    Blood Group
                  </label>
                  <select
                    value={regFormData.bloodGroup}
                    onChange={(e) => setRegFormData({ ...regFormData, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-900 dark:text-brand-dark-text focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Address, Village & District */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-brand-dark-text mb-1">
                    Residential Address *
                  </label>
                  <input
                    type="text"
                    value={regFormData.address}
                    onChange={(e) => setRegFormData({ ...regFormData, address: e.target.value })}
                    placeholder="House number, landmark, street"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-900 dark:text-brand-dark-text"
                  />
                  {formErrors.address && <p className="text-[11px] text-rose-500 mt-1">{formErrors.address}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-brand-dark-text mb-1">
                    Village / Town
                  </label>
                  <input
                    type="text"
                    value={regFormData.village}
                    onChange={(e) => setRegFormData({ ...regFormData, village: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-900 dark:text-brand-dark-text"
                  />
                </div>
              </div>

              {/* ABHA Reference & Emergency Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-brand-dark-text mb-1">
                    Optional ABHA ID (Ayushman Bharat)
                  </label>
                  <input
                    type="text"
                    value={regFormData.abhaId}
                    onChange={(e) => setRegFormData({ ...regFormData, abhaId: e.target.value })}
                    placeholder="91-XXXX-XXXX-XXXX"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-900 dark:text-brand-dark-text font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-brand-dark-text mb-1">
                    Emergency Contact Name & Phone
                  </label>
                  <input
                    type="text"
                    value={regFormData.emergencyContact}
                    onChange={(e) => setRegFormData({ ...regFormData, emergencyContact: e.target.value })}
                    placeholder="Relative Name (+91 XXXXX)"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-900 dark:text-brand-dark-text"
                  />
                </div>
              </div>

              {/* Allergies & Conditions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-brand-dark-text mb-1">
                    Known Drug Allergies (comma separated)
                  </label>
                  <input
                    type="text"
                    value={regFormData.allergies}
                    onChange={(e) => setRegFormData({ ...regFormData, allergies: e.target.value })}
                    placeholder="e.g. Penicillin, Sulfa"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-900 dark:text-brand-dark-text"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-brand-dark-text mb-1">
                    Existing Health Conditions
                  </label>
                  <input
                    type="text"
                    value={regFormData.conditions}
                    onChange={(e) => setRegFormData({ ...regFormData, conditions: e.target.value })}
                    placeholder="e.g. Diabetes, Hypertension"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-900 dark:text-brand-dark-text"
                  />
                </div>
              </div>

              {/* High Risk & Consent check */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-brand-dark-border">
                <label className="flex items-center gap-2 text-xs font-semibold text-amber-800 dark:text-amber-300">
                  <input
                    type="checkbox"
                    checked={regFormData.isHighRisk}
                    onChange={(e) => setRegFormData({ ...regFormData, isHighRisk: e.target.checked })}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Mark as High-Risk Patient (ANC / Chronic Severe / Special Care)</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-brand-dark-text">
                  <input
                    type="checkbox"
                    checked={regFormData.consentAcknowledged}
                    onChange={(e) => setRegFormData({ ...regFormData, consentAcknowledged: e.target.checked })}
                    className="rounded text-brand-blue-600 focus:ring-brand-blue-500"
                  />
                  <span>Patient consent given for digital health record creation under Ayushman Bharat protocol.</span>
                </label>
                {formErrors.consent && <p className="text-[11px] text-rose-500">{formErrors.consent}</p>}
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-brand-dark-border">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-brand-blue-600 to-brand-teal-600 rounded-xl shadow-md"
                >
                  Register Patient & Generate ID
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DoctorPortalLayout>
  );
};
