import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Activity,
  AlertTriangle,
  Plus,
  Trash2,
  CheckCircle2,
  FileText,
  Pill,
  Share2,
  User,
  History,
  Edit3,
  X
} from 'lucide-react';
import { DoctorPortalLayout } from '../../components/layouts/DoctorPortalLayout';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useDoctorPortal } from '../../context/DoctorPortalContext';
import {
  PatientRecord,
  VitalsData,
  PrescriptionMedicine,
  ConsultationRecord
} from '../../types/doctor';

export const ConsultationsPage: React.FC = () => {
  const {
    patients,
    activeConsultationPatient,
    finalizeConsultation,
    saveConsultationDraft,
    addConsultationAddendum,
    consultations
  } = useDoctorPortal();

  // Active patient selected for consultation
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(
    activeConsultationPatient || patients[0] || null
  );

  // Past consultations for the selected patient
  const patientPastConsultations = consultations.filter(
    (c) => selectedPatient && (c.patientId === selectedPatient.id || c.patientId === selectedPatient.patientId)
  );

  // Clinical Workspace Form State
  const [chiefComplaint, setChiefComplaint] = useState('Fever with chills and body weakness');
  const [symptomsText, setSymptomsText] = useState('High-grade fever, headache, loss of appetite, fatigue');
  const [duration, setDuration] = useState('3 days');
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe'>('moderate');
  const [patientNotes, setPatientNotes] = useState('Took OTC Paracetamol with temporary relief.');

  // Vitals State
  const [vitals, setVitals] = useState<VitalsData>({
    temperature: '101.4',
    bpSys: '130',
    bpDia: '85',
    pulse: '84',
    spo2: '98',
    respiratoryRate: '18',
    height: '160',
    weight: '62',
    bloodSugar: '142'
  });

  // Clinical Notes & Diagnosis
  const [examinationNotes, setExaminationNotes] = useState('Chest clear on auscultation. Throat congested. Abdomen soft, no organomegaly.');
  const [provisionalDiagnosis, setProvisionalDiagnosis] = useState('Acute Febrile Illness (Suspected Enteric / Viral Fever)');
  const [finalDiagnosis, setFinalDiagnosis] = useState('Acute Febrile Illness with Glycemic Fluctuations');
  const [clinicalAdvice, setClinicalAdvice] = useState('Hydration therapy (ORS / clean boiled water). Soft diet. Rest for 3 days. Return immediately if temperature > 103°F or severe vomiting.');
  const [privateNotes, setPrivateNotes] = useState('Monitor Widal & TLC in 48 hours.');

  // Linked Prescriptions inside this consultation
  const [prescribedMedicines, setPrescribedMedicines] = useState<PrescriptionMedicine[]>([
    {
      id: 'med-new-1',
      medicineName: 'Paracetamol Tablets IP',
      genericName: 'Paracetamol',
      strength: '650 mg',
      dosage: '1 tablet',
      frequency: 'Three times daily (1-1-1)',
      route: 'Oral',
      duration: '5 days',
      quantity: 15,
      timing: 'after_food',
      instructions: 'Take after meals for fever relief.'
    },
    {
      id: 'med-new-2',
      medicineName: 'Cefixime Tablets IP',
      genericName: 'Cefixime',
      strength: '200 mg',
      dosage: '1 tablet',
      frequency: 'Twice daily (1-0-1)',
      route: 'Oral',
      duration: '5 days',
      quantity: 10,
      timing: 'after_food',
      instructions: 'Complete full course even if fever settles.'
    }
  ]);

  // Linked Lab Orders inside consultation
  const [includeLabOrder, setIncludeLabOrder] = useState(true);
  const [labTestsSelected, setLabTestsSelected] = useState('Complete Blood Count (CBC), Widal Test');
  const [labUrgency, setLabUrgency] = useState<'routine' | 'urgent' | 'emergency'>('urgent');

  // Linked Referral inside consultation
  const [includeReferral, setIncludeReferral] = useState(false);
  const [referralFacility, setReferralFacility] = useState('Pune District Civil Hospital');
  const [referralDept, setReferralDept] = useState('Internal Medicine & Infectious Diseases');
  const [referralReason, setReferralReason] = useState('Evaluation of persistent pyrexia of unknown origin');

  // Linked Follow-up inside consultation
  const [includeFollowUp, setIncludeFollowUp] = useState(true);
  const [followUpDate, setFollowUpDate] = useState('2026-09-09');
  const [followUpRisk, setFollowUpRisk] = useState<'low' | 'moderate' | 'high'>('high');

  // Confirmation & Read-only State
  const [isFinalizeDialogOpen, setIsFinalizeDialogOpen] = useState(false);
  const [activeConsultationRecord, setActiveConsultationRecord] = useState<ConsultationRecord | null>(null);
  const [isAddendumModalOpen, setIsAddendumModalOpen] = useState(false);
  const [addendumNote, setAddendumNote] = useState('');

  // Update selected patient if context changes
  useEffect(() => {
    if (activeConsultationPatient) {
      setSelectedPatient(activeConsultationPatient);
      if (activeConsultationPatient.vitals) {
        setVitals(activeConsultationPatient.vitals);
      }
    }
  }, [activeConsultationPatient]);

  // Handle adding new medicine item
  const handleAddMedicine = () => {
    const newMed: PrescriptionMedicine = {
      id: 'med-' + Date.now(),
      medicineName: '',
      genericName: '',
      strength: '500 mg',
      dosage: '1 tablet',
      frequency: 'Twice daily (1-0-1)',
      route: 'Oral',
      duration: '5 days',
      quantity: 10,
      timing: 'after_food'
    };
    setPrescribedMedicines([...prescribedMedicines, newMed]);
  };

  const handleRemoveMedicine = (id: string) => {
    setPrescribedMedicines(prescribedMedicines.filter((m) => m.id !== id));
  };

  const handleFinalizeConfirm = () => {
    if (!selectedPatient) return;

    const symptomsList = symptomsText.split(',').map((s) => s.trim()).filter(Boolean);

    const linkedModules: Parameters<typeof finalizeConsultation>[1] = {
      prescription: prescribedMedicines.length > 0
        ? {
            patientId: selectedPatient.id,
            patientName: selectedPatient.name,
            doctorId: 'DOC1001',
            doctorName: 'Dr. Ananya Kulkarni (MBBS, MD)',
            facilityName: 'Primary Health Centre (PHC) Khed',
            date: new Date().toISOString().split('T')[0],
            diagnosis: finalDiagnosis || provisionalDiagnosis,
            medicines: prescribedMedicines,
            instructions: clinicalAdvice
          }
        : undefined,
      labOrders: includeLabOrder
        ? [
            {
              patientId: selectedPatient.id,
              patientName: selectedPatient.name,
              doctorName: 'Dr. Ananya Kulkarni (MBBS, MD)',
              diagnosticCentre: 'PHC Khed In-House Pathology Lab',
              testCategory: 'Diagnostic Workup',
              tests: labTestsSelected.split(',').map((t) => t.trim()),
              clinicalReason: finalDiagnosis || provisionalDiagnosis,
              urgency: labUrgency,
              sampleType: 'Blood / Serum',
              fastingRequired: false,
              instructions: 'Verify high fever panel'
            }
          ]
        : undefined,
      referral: includeReferral
        ? {
            patientId: selectedPatient.id,
            patientName: selectedPatient.name,
            referringDoctor: 'Dr. Ananya Kulkarni (MBBS, MD)',
            referringFacility: 'Primary Health Centre (PHC) Khed',
            receivingFacility: referralFacility,
            department: referralDept,
            referralReason,
            clinicalSummary: examinationNotes,
            provisionalDiagnosis,
            urgency: 'routine',
            preferredDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
            transportRequired: false
          }
        : undefined,
      followUp: includeFollowUp
        ? {
            patientId: selectedPatient.id,
            patientName: selectedPatient.name,
            reason: `Post fever clinical re-assessment for ${finalDiagnosis || provisionalDiagnosis}`,
            dueDate: followUpDate,
            riskLevel: followUpRisk,
            category: 'general',
            assignedWorker: 'ASHA Tai (Khed Ward 2)'
          }
        : undefined
    };

    const finalized = finalizeConsultation(
      {
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        doctorId: 'DOC1001',
        doctorName: 'Dr. Ananya Kulkarni (MBBS, MD)',
        date: new Date().toISOString().split('T')[0],
        chiefComplaint,
        symptoms: symptomsList,
        duration,
        severity,
        patientNotes,
        vitals,
        examinationNotes,
        provisionalDiagnosis,
        finalDiagnosis,
        clinicalAdvice,
        privateNotes
      },
      linkedModules
    );

    setActiveConsultationRecord(finalized);
  };

  const handleAddendumSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addendumNote.trim() || !activeConsultationRecord) return;
    addConsultationAddendum(activeConsultationRecord.id, 'Dr. Ananya Kulkarni (MBBS, MD)', addendumNote);
    setAddendumNote('');
    setIsAddendumModalOpen(false);
  };

  return (
    <DoctorPortalLayout
      pageTitle="Clinical Consultation Workspace"
      pageSubtitle="Comprehensive OPD examination, diagnosis confirmation, and synchronized clinical order entry"
      headerAction={
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              if (selectedPatient) {
                saveConsultationDraft({
                  patientId: selectedPatient.id,
                  patientName: selectedPatient.name,
                  doctorId: 'DOC1001',
                  doctorName: 'Dr. Ananya Kulkarni (MBBS, MD)',
                  date: new Date().toISOString().split('T')[0],
                  chiefComplaint,
                  symptoms: symptomsText.split(',').map((s) => s.trim()),
                  duration,
                  severity,
                  patientNotes,
                  vitals,
                  examinationNotes,
                  provisionalDiagnosis,
                  finalDiagnosis,
                  clinicalAdvice,
                  privateNotes
                });
              }
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-brand-dark-text bg-white dark:bg-brand-dark-surface border border-slate-200 dark:border-brand-dark-border hover:bg-slate-50 transition-colors"
          >
            Save Draft
          </button>

          <button
            type="button"
            onClick={() => setIsFinalizeDialogOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-blue-600 to-brand-teal-600 hover:from-brand-blue-700 hover:to-brand-teal-700 shadow-md shadow-brand-blue-600/20 transition-all focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Finalize Consultation</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Top Patient Selector Bar */}
        <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200/80 dark:border-brand-dark-border p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-blue-50 dark:bg-brand-blue-950/60 text-brand-blue-600 dark:text-brand-blue-400 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 dark:text-brand-dark-muted uppercase tracking-wider block">
                Active Patient File
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-slate-900 dark:text-brand-dark-heading">
                  {selectedPatient ? selectedPatient.name : 'No Patient Selected'}
                </h3>
                {selectedPatient && (
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-brand-dark-elevated text-brand-blue-700 dark:text-brand-blue-400 border border-slate-200 dark:border-brand-dark-border font-bold">
                    {selectedPatient.patientId}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Patient Switcher Dropdown */}
          <div className="flex items-center gap-2 min-w-[240px]">
            <select
              value={selectedPatient?.id || ''}
              onChange={(e) => {
                const pt = patients.find((p) => p.id === e.target.value);
                if (pt) {
                  setSelectedPatient(pt);
                  if (pt.vitals) setVitals(pt.vitals);
                }
              }}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-900 dark:text-brand-dark-text focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
            >
              <option value="">-- Switch Patient from Queue / Directory --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.patientId}) - {p.gender}, {p.age} yrs
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Patient Summary & Allergy Warning Card */}
        {selectedPatient && (
          <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200/80 dark:border-brand-dark-border p-4 sm:p-5 shadow-xs space-y-3">
            {/* Allergy & High Risk Alert Bar */}
            {selectedPatient.allergies.length > 0 && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-xs text-rose-900 dark:text-rose-200 font-semibold">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold uppercase tracking-wider block text-rose-800 dark:text-rose-300">
                    Clinical Decision Support Warning — Drug Allergies
                  </span>
                  <span>Patient reported allergies to: <strong>{selectedPatient.allergies.join(', ')}</strong>. Verify all prescribed items.</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600 dark:text-brand-dark-text pt-1">
              <div>Age & Gender: <strong className="text-slate-900 dark:text-brand-dark-heading">{selectedPatient.gender}, {selectedPatient.age} yrs</strong></div>
              <div>Blood Group: <strong className="text-slate-900 dark:text-brand-dark-heading">{selectedPatient.bloodGroup}</strong></div>
              <div>ABHA ID: <strong className="font-mono text-brand-blue-600 dark:text-brand-blue-400">{selectedPatient.abhaId || 'Linked'}</strong></div>
              <div>Location: <strong>{selectedPatient.village} ({selectedPatient.district})</strong></div>
            </div>
          </div>
        )}

        {/* Main Clinical Grid: Symptoms, Vitals, Examination, Diagnosis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
          {/* Left Column (2 spans): Symptoms, Examination, Diagnoses */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Chief Complaint & Symptoms */}
            <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200/80 dark:border-brand-dark-border p-5 sm:p-6 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-brand-dark-heading flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-brand-blue-600" />
                <span>1. Chief Complaint & Presenting Symptoms</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-brand-dark-text mb-1">
                    Primary Chief Complaint *
                  </label>
                  <input
                    type="text"
                    value={chiefComplaint}
                    onChange={(e) => setChiefComplaint(e.target.value)}
                    placeholder="e.g. Acute fever with body ache"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-900 dark:text-brand-dark-text focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-brand-dark-text mb-1">
                    Duration & Severity
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="e.g. 3 days"
                      className="w-1/2 px-2 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-900 dark:text-brand-dark-text"
                    />
                    <select
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value as 'mild' | 'moderate' | 'severe')}
                      className="w-1/2 px-2 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-900 dark:text-brand-dark-text"
                    >
                      <option value="mild">Mild</option>
                      <option value="moderate">Moderate</option>
                      <option value="severe">Severe</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-brand-dark-text mb-1">
                  Associated Symptoms (comma-separated)
                </label>
                <input
                  type="text"
                  value={symptomsText}
                  onChange={(e) => setSymptomsText(e.target.value)}
                  placeholder="e.g. Cough, sore throat, chills, headache"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-900 dark:text-brand-dark-text"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-brand-dark-text mb-1">
                  Patient History & Subjective Observations
                </label>
                <textarea
                  rows={2}
                  value={patientNotes}
                  onChange={(e) => setPatientNotes(e.target.value)}
                  placeholder="Patient reports onset post-travel, no prior hospitalizations..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-900 dark:text-brand-dark-text"
                />
              </div>
            </div>

            {/* 2. Clinical Examination & Doctor Diagnosis */}
            <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200/80 dark:border-brand-dark-border p-5 sm:p-6 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-brand-dark-heading flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-600" />
                <span>2. Physical Examination & Doctor-Confirmed Diagnosis</span>
              </h4>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-brand-dark-text mb-1">
                  Doctor's Physical Examination Findings
                </label>
                <textarea
                  rows={2}
                  value={examinationNotes}
                  onChange={(e) => setExaminationNotes(e.target.value)}
                  placeholder="Systemic examination findings (CVS, RS, P/A, CNS)..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-900 dark:text-brand-dark-text"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-brand-dark-text mb-1">
                    Doctor Provisional Diagnosis *
                  </label>
                  <input
                    type="text"
                    value={provisionalDiagnosis}
                    onChange={(e) => setProvisionalDiagnosis(e.target.value)}
                    placeholder="Enter provisional clinical impression"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-900 dark:text-brand-dark-text font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-brand-dark-text mb-1">
                    Doctor Final Diagnosis (Confirmed) *
                  </label>
                  <input
                    type="text"
                    value={finalDiagnosis}
                    onChange={(e) => setFinalDiagnosis(e.target.value)}
                    placeholder="Enter confirmed final diagnosis"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-900 dark:text-brand-dark-text font-bold text-brand-blue-700 dark:text-brand-blue-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-brand-dark-text mb-1">
                  Clinical Advice & Non-Pharmacological Care Instructions
                </label>
                <textarea
                  rows={2}
                  value={clinicalAdvice}
                  onChange={(e) => setClinicalAdvice(e.target.value)}
                  placeholder="Dietary precautions, red flags for re-consultation, hydration..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-900 dark:text-brand-dark-text"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-brand-dark-text mb-1">
                  Private Physician Notes (Internal Audit Only)
                </label>
                <textarea
                  rows={2}
                  value={privateNotes}
                  onChange={(e) => setPrivateNotes(e.target.value)}
                  placeholder="Differential considerations, follow-up flags..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-900 dark:text-brand-dark-text"
                />
              </div>
            </div>

            {/* 3. Prescription Manager */}
            <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200/80 dark:border-brand-dark-border p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-brand-dark-border">
                <h4 className="text-sm font-bold text-slate-900 dark:text-brand-dark-heading flex items-center gap-2">
                  <Pill className="w-4 h-4 text-emerald-600" />
                  <span>3. Digital Prescription (Rx)</span>
                </h4>

                <button
                  type="button"
                  onClick={handleAddMedicine}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Medicine</span>
                </button>
              </div>

              <div className="space-y-3">
                {prescribedMedicines.map((med, index) => (
                  <div
                    key={med.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-brand-dark-border bg-slate-50/60 dark:bg-brand-dark-elevated/40 space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-500">
                        Item #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicine(med.id)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-brand-dark-muted mb-0.5">
                          Brand / Medicine Name *
                        </label>
                        <input
                          type="text"
                          value={med.medicineName}
                          onChange={(e) => {
                            const updated = [...prescribedMedicines];
                            updated[index].medicineName = e.target.value;
                            setPrescribedMedicines(updated);
                          }}
                          placeholder="e.g. Amoxicillin Capsules IP"
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-brand-dark-surface border border-slate-200 dark:border-brand-dark-border text-slate-900 dark:text-brand-dark-text"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-brand-dark-muted mb-0.5">
                          Generic Name & Strength
                        </label>
                        <input
                          type="text"
                          value={med.genericName}
                          onChange={(e) => {
                            const updated = [...prescribedMedicines];
                            updated[index].genericName = e.target.value;
                            setPrescribedMedicines(updated);
                          }}
                          placeholder="e.g. Amoxicillin (500mg)"
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-brand-dark-surface border border-slate-200 dark:border-brand-dark-border text-slate-900 dark:text-brand-dark-text"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-brand-dark-muted mb-0.5">
                          Frequency & Timing
                        </label>
                        <select
                          value={med.frequency}
                          onChange={(e) => {
                            const updated = [...prescribedMedicines];
                            updated[index].frequency = e.target.value;
                            setPrescribedMedicines(updated);
                          }}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-brand-dark-surface border border-slate-200 dark:border-brand-dark-border text-slate-900 dark:text-brand-dark-text"
                        >
                          <option value="Once daily (1-0-0)">Once daily (Morning 1-0-0)</option>
                          <option value="Twice daily (1-0-1)">Twice daily (1-0-1)</option>
                          <option value="Three times daily (1-1-1)">Three times daily (1-1-1)</option>
                          <option value="At bedtime (0-0-1)">At bedtime (0-0-1)</option>
                          <option value="As needed (SOS)">As needed (SOS)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Connected Orders: Labs, Referral, Follow-Up */}
            <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200/80 dark:border-brand-dark-border p-5 sm:p-6 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-brand-dark-heading flex items-center gap-2">
                <Share2 className="w-4 h-4 text-purple-600" />
                <span>4. Connected Orders & Follow-Up Continuity</span>
              </h4>

              {/* Lab Order Option */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-brand-dark-border bg-slate-50/50 dark:bg-brand-dark-elevated/40 space-y-2">
                <label className="flex items-center gap-2 font-bold text-xs text-slate-800 dark:text-brand-dark-heading">
                  <input
                    type="checkbox"
                    checked={includeLabOrder}
                    onChange={(e) => setIncludeLabOrder(e.target.checked)}
                    className="rounded text-brand-blue-600"
                  />
                  <span>Dispatch Diagnostic Test Order</span>
                </label>
                {includeLabOrder && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <input
                      type="text"
                      value={labTestsSelected}
                      onChange={(e) => setLabTestsSelected(e.target.value)}
                      placeholder="Tests: CBC, HbA1c, Urine Routine..."
                      className="px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-brand-dark-surface border border-slate-200 dark:border-brand-dark-border"
                    />
                    <select
                      value={labUrgency}
                      onChange={(e) => setLabUrgency(e.target.value as 'routine' | 'urgent' | 'emergency')}
                      className="px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-brand-dark-surface border border-slate-200 dark:border-brand-dark-border"
                    >
                      <option value="routine">Routine</option>
                      <option value="urgent">Urgent</option>
                      <option value="emergency">Emergency</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Referral Option */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-brand-dark-border bg-slate-50/50 dark:bg-brand-dark-elevated/40 space-y-2">
                <label className="flex items-center gap-2 font-bold text-xs text-slate-800 dark:text-brand-dark-heading">
                  <input
                    type="checkbox"
                    checked={includeReferral}
                    onChange={(e) => setIncludeReferral(e.target.checked)}
                    className="rounded text-purple-600"
                  />
                  <span>Create Specialist Hospital Referral</span>
                </label>
                {includeReferral && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    <input
                      type="text"
                      value={referralFacility}
                      onChange={(e) => setReferralFacility(e.target.value)}
                      placeholder="Receiving hospital name"
                      className="px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-brand-dark-surface border border-slate-200 dark:border-brand-dark-border"
                    />
                    <input
                      type="text"
                      value={referralDept}
                      onChange={(e) => setReferralDept(e.target.value)}
                      placeholder="Department (e.g. Cardiology)"
                      className="px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-brand-dark-surface border border-slate-200 dark:border-brand-dark-border"
                    />
                    <input
                      type="text"
                      value={referralReason}
                      onChange={(e) => setReferralReason(e.target.value)}
                      placeholder="Clinical reason for referral"
                      className="px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-brand-dark-surface border border-slate-200 dark:border-brand-dark-border"
                    />
                  </div>
                )}
              </div>

              {/* Follow-up Option */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-brand-dark-border bg-slate-50/50 dark:bg-brand-dark-elevated/40 space-y-2">
                <label className="flex items-center gap-2 font-bold text-xs text-slate-800 dark:text-brand-dark-heading">
                  <input
                    type="checkbox"
                    checked={includeFollowUp}
                    onChange={(e) => setIncludeFollowUp(e.target.checked)}
                    className="rounded text-teal-600"
                  />
                  <span>Schedule Patient Follow-Up Review</span>
                </label>
                {includeFollowUp && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <input
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-brand-dark-surface border border-slate-200 dark:border-brand-dark-border"
                    />
                    <select
                      value={followUpRisk}
                      onChange={(e) => setFollowUpRisk(e.target.value as 'low' | 'moderate' | 'high')}
                      className="px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-brand-dark-surface border border-slate-200 dark:border-brand-dark-border"
                    >
                      <option value="high">High Risk Follow-up</option>
                      <option value="moderate">Moderate Care</option>
                      <option value="low">Routine Post-Care</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column (1 span): Vital Signs Recording & Past Patient Encounters */}
          <div className="space-y-6">
            {/* Vitals Recording Panel */}
            <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200/80 dark:border-brand-dark-border p-5 shadow-xs space-y-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-brand-dark-heading flex items-center gap-2">
                <Activity className="w-4 h-4 text-brand-blue-600" />
                <span>Recorded Vital Signs</span>
              </h4>

              <div className="space-y-2.5 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-brand-dark-muted mb-0.5">
                    Blood Pressure (Sys / Dia mmHg)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={vitals.bpSys || ''}
                      onChange={(e) => setVitals({ ...vitals, bpSys: e.target.value })}
                      placeholder="Sys 120"
                      className="w-1/2 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border"
                    />
                    <input
                      type="number"
                      value={vitals.bpDia || ''}
                      onChange={(e) => setVitals({ ...vitals, bpDia: e.target.value })}
                      placeholder="Dia 80"
                      className="w-1/2 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-brand-dark-muted mb-0.5">
                      Temperature (°F)
                    </label>
                    <input
                      type="text"
                      value={vitals.temperature || ''}
                      onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
                      placeholder="98.6"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-brand-dark-muted mb-0.5">
                      Pulse (bpm)
                    </label>
                    <input
                      type="number"
                      value={vitals.pulse || ''}
                      onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })}
                      placeholder="72"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-brand-dark-muted mb-0.5">
                      SpO2 (%)
                    </label>
                    <input
                      type="number"
                      value={vitals.spo2 || ''}
                      onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
                      placeholder="98"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-brand-dark-muted mb-0.5">
                      Blood Sugar (mg/dL)
                    </label>
                    <input
                      type="number"
                      value={vitals.bloodSugar || ''}
                      onChange={(e) => setVitals({ ...vitals, bloodSugar: e.target.value })}
                      placeholder="110"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Past Encounters History */}
            <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200/80 dark:border-brand-dark-border p-5 shadow-xs space-y-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-brand-dark-heading flex items-center gap-2">
                <History className="w-4 h-4 text-slate-500" />
                <span>Patient Visit History</span>
              </h4>

              <div className="space-y-2 text-xs">
                {patientPastConsultations.length > 0 ? (
                  patientPastConsultations.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-xl bg-slate-50/70 dark:bg-brand-dark-elevated/40 border border-slate-200/70 dark:border-brand-dark-border/80"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 dark:text-brand-dark-heading">
                          {c.date}
                        </span>
                        <span className="font-mono text-[10px] text-brand-blue-600">
                          {c.id}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-brand-dark-text truncate">
                        {c.finalDiagnosis || c.provisionalDiagnosis}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">No prior consultation records on file.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Addendum Modal */}
      {isAddendumModalOpen && activeConsultationRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-brand-dark-border">
              <h3 className="text-base font-bold text-slate-900 dark:text-brand-dark-heading flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-brand-blue-600" />
                Add Official Clinical Addendum
              </h3>
              <button
                type="button"
                onClick={() => setIsAddendumModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddendumSubmit} className="space-y-3">
              <p className="text-xs text-slate-500">
                Finalized records cannot be modified. Addenda are permanently timestamped and appended with physician attribution.
              </p>
              <textarea
                rows={3}
                value={addendumNote}
                onChange={(e) => setAddendumNote(e.target.value)}
                placeholder="Enter addendum observation, subsequent test correlation, or amended advice..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border"
                required
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddendumModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-brand-blue-600 rounded-xl"
                >
                  Append Addendum
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Finalize Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isFinalizeDialogOpen}
        title="Finalize Consultation Records?"
        message={`Confirm and lock clinical notes for ${selectedPatient?.name}? This will synchronize digital prescription Rx, lab orders, and follow-up schedules across the network.`}
        confirmLabel="Finalize & Transmit"
        cancelLabel="Review Again"
        type="info"
        onConfirm={handleFinalizeConfirm}
        onCancel={() => setIsFinalizeDialogOpen(false)}
      />
    </DoctorPortalLayout>
  );
};
