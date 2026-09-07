import React, { useState } from 'react';
import {
  Building2,
  Users,
  Bed,
  Truck,
  Activity,
  Zap,
  Wifi,
  Stethoscope,
  Clock,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Check,
  X,
  Server
} from 'lucide-react';
import { DoctorPortalLayout } from '../../components/layouts/DoctorPortalLayout';
import { useDoctorPortal } from '../../context/DoctorPortalContext';
import { useLanguage } from '../../context/LanguageContext';
import { FacilityCapacity, FacilityEquipmentItem } from '../../types/doctor';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const FacilityStatusPage: React.FC = () => {
  const { t } = useLanguage();
  const { facilityCapacity, updateFacilityCapacity } = useDoctorPortal();

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editedCapacity, setEditedCapacity] = useState<FacilityCapacity>(facilityCapacity);

  // Critical Confirmation Dialog
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

  const handleStartEdit = () => {
    setEditedCapacity(JSON.parse(JSON.stringify(facilityCapacity)));
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveCapacity = () => {
    // Check if critical status (Emergency or OPD) is changed to restricted
    const emergencyChangedToWarning =
      editedCapacity.services.emergency !== 'Operational' &&
      facilityCapacity.services.emergency === 'Operational';

    if (emergencyChangedToWarning) {
      setConfirmDialog({
        isOpen: true,
        title: 'Critical Emergency Status Change',
        message: `You are altering the Emergency Wing status to "${editedCapacity.services.emergency}". This notifies 108 EMS ambulance dispatch and the District Health Officer. Proceed?`,
        onConfirm: () => {
          updateFacilityCapacity(editedCapacity);
          setIsEditing(false);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      });
    } else {
      updateFacilityCapacity(editedCapacity);
      setIsEditing(false);
    }
  };

  const handleEquipmentStatusChange = (
    eqId: string,
    newStatus: FacilityEquipmentItem['status']
  ) => {
    const updated = editedCapacity.equipment.map((eq) =>
      eq.id === eqId ? { ...eq, status: newStatus, lastInspection: 'Today' } : eq
    );
    setEditedCapacity({ ...editedCapacity, equipment: updated });
  };

  const getEquipmentStatusBadge = (status: string) => {
    switch (status) {
      case 'Available':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3" /> Available
          </span>
        );
      case 'In Use':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Activity className="w-3 h-3" /> In Use
          </span>
        );
      case 'Maintenance':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="w-3 h-3" /> Maintenance
          </span>
        );
      case 'Out of Service':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <X className="w-3 h-3" /> Out of Service
          </span>
        );
      default:
        return null;
    }
  };

  const capacity = isEditing ? editedCapacity : facilityCapacity;

  return (
    <DoctorPortalLayout
      pageTitle={t.docNavFacilityStatus || 'Facility Status & Operational Capacity'}
      pageSubtitle={`Real-time bed availability, clinical staff on duty, emergency infrastructure, and equipment health for ${facilityCapacity.facilityName}.`}
      headerAction={
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              type="button"
              onClick={handleStartEdit}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-700 dark:text-brand-dark-text bg-white dark:bg-brand-dark-surface border border-slate-200 dark:border-brand-dark-border hover:bg-slate-50 dark:hover:bg-brand-dark-elevated shadow-xs transition-colors"
            >
              <Edit3 className="w-4 h-4 text-brand-blue-600" />
              <span>Update Status</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-brand-dark-muted hover:bg-slate-100 dark:hover:bg-brand-dark-elevated transition-colors"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCapacity}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-colors"
              >
                <Check className="w-4 h-4" /> Save Status
              </button>
            </div>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header Pill & Last updated */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-100/80 dark:bg-brand-dark-surface border border-slate-200 dark:border-brand-dark-border text-xs text-slate-600 dark:text-brand-dark-muted">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Facility Code: <strong className="font-mono text-slate-800 dark:text-brand-dark-heading">{facilityCapacity.facilityCode}</strong> ({facilityCapacity.district} District)</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            <span>Last Updated: {facilityCapacity.lastUpdated}</span>
          </div>
        </div>

        {/* 1. Top Section: Staff On Duty & Clinical Workload */}
        <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200/80 dark:border-brand-dark-border/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-brand-dark-heading flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-blue-600" />
              Staff On Duty & Clinical Workload
            </h3>
            <span className="text-xs font-semibold text-brand-blue-700 dark:text-brand-blue-300 bg-brand-blue-50 dark:bg-brand-blue-950/60 px-2.5 py-1 rounded-lg border border-brand-blue-200 dark:border-brand-blue-800">
              Shift: {capacity.staff.shiftStatus}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-brand-dark-elevated/40 border border-slate-200 dark:border-brand-dark-border">
              <span className="text-xs text-slate-500 dark:text-brand-dark-muted block">
                Doctors On Duty
              </span>
              {isEditing ? (
                <input
                  type="number"
                  min={0}
                  value={editedCapacity.staff.doctorsOnDuty}
                  onChange={(e) =>
                    setEditedCapacity({
                      ...editedCapacity,
                      staff: { ...editedCapacity.staff, doctorsOnDuty: Number(e.target.value) }
                    })
                  }
                  className="w-full mt-1 px-2 py-1 text-lg font-bold rounded-lg border border-slate-300 bg-white dark:bg-brand-dark-bg text-slate-900 dark:text-brand-dark-text"
                />
              ) : (
                <span className="text-2xl font-extrabold text-slate-900 dark:text-brand-dark-heading mt-1 block">
                  {capacity.staff.doctorsOnDuty}
                </span>
              )}
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-brand-dark-elevated/40 border border-slate-200 dark:border-brand-dark-border">
              <span className="text-xs text-slate-500 dark:text-brand-dark-muted block">
                Nurses & Staff
              </span>
              {isEditing ? (
                <input
                  type="number"
                  min={0}
                  value={editedCapacity.staff.nursesAvailable}
                  onChange={(e) =>
                    setEditedCapacity({
                      ...editedCapacity,
                      staff: { ...editedCapacity.staff, nursesAvailable: Number(e.target.value) }
                    })
                  }
                  className="w-full mt-1 px-2 py-1 text-lg font-bold rounded-lg border border-slate-300 bg-white dark:bg-brand-dark-bg text-slate-900 dark:text-brand-dark-text"
                />
              ) : (
                <span className="text-2xl font-extrabold text-slate-900 dark:text-brand-dark-heading mt-1 block">
                  {capacity.staff.nursesAvailable}
                </span>
              )}
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-brand-dark-elevated/40 border border-slate-200 dark:border-brand-dark-border">
              <span className="text-xs text-slate-500 dark:text-brand-dark-muted block">
                Specialists Available
              </span>
              {isEditing ? (
                <input
                  type="number"
                  min={0}
                  value={editedCapacity.staff.specialistsAvailable}
                  onChange={(e) =>
                    setEditedCapacity({
                      ...editedCapacity,
                      staff: {
                        ...editedCapacity.staff,
                        specialistsAvailable: Number(e.target.value)
                      }
                    })
                  }
                  className="w-full mt-1 px-2 py-1 text-lg font-bold rounded-lg border border-slate-300 bg-white dark:bg-brand-dark-bg text-slate-900 dark:text-brand-dark-text"
                />
              ) : (
                <span className="text-2xl font-extrabold text-slate-900 dark:text-brand-dark-heading mt-1 block">
                  {capacity.staff.specialistsAvailable}
                </span>
              )}
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-brand-dark-elevated/40 border border-slate-200 dark:border-brand-dark-border">
              <span className="text-xs text-slate-500 dark:text-brand-dark-muted block">
                Workload Load Index
              </span>
              {isEditing ? (
                <select
                  value={editedCapacity.staff.currentWorkload}
                  onChange={(e) =>
                    setEditedCapacity({
                      ...editedCapacity,
                      staff: {
                        ...editedCapacity.staff,
                        currentWorkload: e.target.value as typeof editedCapacity.staff.currentWorkload
                      }
                    })
                  }
                  className="w-full mt-1 px-2 py-1.5 text-xs font-bold rounded-lg border border-slate-300 bg-white dark:bg-brand-dark-bg text-slate-900 dark:text-brand-dark-text"
                >
                  <option value="Low">Low</option>
                  <option value="Moderate">Moderate</option>
                  <option value="High">High</option>
                  <option value="Overload">Overload</option>
                </select>
              ) : (
                <span className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-1 block flex items-center gap-1">
                  <Flame className="w-4 h-4" />
                  {capacity.staff.currentWorkload}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 2. Middle Grid: Core Services & Infrastructure */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Services Operational Status */}
          <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200/80 dark:border-brand-dark-border/80 p-5 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-brand-dark-heading flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-brand-teal-600" />
              Department & Service Status
            </h3>

            <div className="space-y-3">
              {[
                { name: 'Outpatient Department (OPD)', key: 'opd', val: capacity.services.opd, options: ['Operational', 'Limited', 'Closed'] },
                { name: 'Emergency & Casualty', key: 'emergency', val: capacity.services.emergency, options: ['Operational', 'Overloaded', 'Diverted'] },
                { name: 'Teleconsultation Chamber', key: 'teleconsultation', val: capacity.services.teleconsultation, options: ['Online', 'Offline'] },
                { name: 'Diagnostic Laboratory', key: 'laboratory', val: capacity.services.laboratory, options: ['Processing', 'Maintenance'] },
                { name: 'Hospital Pharmacy Counter', key: 'pharmacy', val: capacity.services.pharmacy, options: ['Dispensing', 'Stock Verification'] }
              ].map((svc) => (
                <div
                  key={svc.key}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-brand-dark-elevated/40 border border-slate-200 dark:border-brand-dark-border"
                >
                  <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-brand-dark-heading">
                    {svc.name}
                  </span>
                  {isEditing ? (
                    <select
                      value={svc.val}
                      onChange={(e) =>
                        setEditedCapacity({
                          ...editedCapacity,
                          services: {
                            ...editedCapacity.services,
                            [svc.key]: e.target.value
                          }
                        })
                      }
                      className="text-xs font-bold px-2 py-1 rounded-lg border border-slate-300 bg-white dark:bg-brand-dark-bg text-slate-900 dark:text-brand-dark-text"
                    >
                      {svc.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                        svc.val === 'Operational' || svc.val === 'Online' || svc.val === 'Processing' || svc.val === 'Dispensing'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      {svc.val}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Infrastructure & Resources */}
          <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200/80 dark:border-brand-dark-border/80 p-5 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-brand-dark-heading flex items-center gap-2">
              <Building2 className="w-5 h-5 text-brand-blue-600" />
              Beds, Ambulance & Utilities
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {/* Bed Availability */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-brand-dark-elevated/40 border border-slate-200 dark:border-brand-dark-border">
                <div className="flex items-center gap-2 text-slate-500 dark:text-brand-dark-muted text-xs font-semibold">
                  <Bed className="w-4 h-4 text-brand-blue-600" />
                  <span>Bed Availability</span>
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  {isEditing ? (
                    <input
                      type="number"
                      min={0}
                      value={editedCapacity.infrastructure.availableBeds}
                      onChange={(e) =>
                        setEditedCapacity({
                          ...editedCapacity,
                          infrastructure: {
                            ...editedCapacity.infrastructure,
                            availableBeds: Number(e.target.value)
                          }
                        })
                      }
                      className="w-16 px-1.5 py-0.5 text-lg font-bold border rounded"
                    />
                  ) : (
                    <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                      {capacity.infrastructure.availableBeds}
                    </span>
                  )}
                  <span className="text-xs text-slate-500">
                    / {capacity.infrastructure.totalBeds} total
                  </span>
                </div>
              </div>

              {/* Ambulance Availability */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-brand-dark-elevated/40 border border-slate-200 dark:border-brand-dark-border">
                <div className="flex items-center gap-2 text-slate-500 dark:text-brand-dark-muted text-xs font-semibold">
                  <Truck className="w-4 h-4 text-rose-600" />
                  <span>108 Ambulances</span>
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  {isEditing ? (
                    <input
                      type="number"
                      min={0}
                      value={editedCapacity.infrastructure.ambulancesAvailable}
                      onChange={(e) =>
                        setEditedCapacity({
                          ...editedCapacity,
                          infrastructure: {
                            ...editedCapacity.infrastructure,
                            ambulancesAvailable: Number(e.target.value)
                          }
                        })
                      }
                      className="w-16 px-1.5 py-0.5 text-lg font-bold border rounded"
                    />
                  ) : (
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-brand-dark-heading">
                      {capacity.infrastructure.ambulancesAvailable}
                    </span>
                  )}
                  <span className="text-xs text-slate-500">stationed at PHC</span>
                </div>
              </div>

              {/* Oxygen Cylinders */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-brand-dark-elevated/40 border border-slate-200 dark:border-brand-dark-border">
                <div className="flex items-center gap-2 text-slate-500 dark:text-brand-dark-muted text-xs font-semibold">
                  <Zap className="w-4 h-4 text-teal-600" />
                  <span>Oxygen Cylinders</span>
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-brand-dark-heading">
                    {capacity.infrastructure.oxygenCylinders}
                  </span>
                  <span className="text-xs text-slate-500 ml-1">full units</span>
                </div>
              </div>

              {/* Power Backup */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-brand-dark-elevated/40 border border-slate-200 dark:border-brand-dark-border">
                <div className="flex items-center gap-2 text-slate-500 dark:text-brand-dark-muted text-xs font-semibold">
                  <Server className="w-4 h-4 text-amber-600" />
                  <span>Power Backup</span>
                </div>
                <div className="mt-2 text-xs font-bold text-slate-800 dark:text-brand-dark-text truncate">
                  {capacity.infrastructure.powerBackup}
                </div>
              </div>
            </div>

            {/* Network / ABDM Connectivity */}
            <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold">
                <Wifi className="w-4 h-4" />
                <span>{capacity.infrastructure.internetConnectivity}</span>
              </div>
              <span className="font-bold text-emerald-700 dark:text-emerald-400">99.8% Uptime</span>
            </div>
          </div>
        </div>

        {/* 3. Bottom Section: Medical Diagnostic Equipment Inventory */}
        <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200/80 dark:border-brand-dark-border/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-brand-dark-heading flex items-center gap-2">
                <Activity className="w-5 h-5 text-brand-blue-600" />
                Diagnostic & Critical Medical Equipment
              </h3>
              <p className="text-xs text-slate-500 dark:text-brand-dark-muted mt-0.5">
                Real-time operational readiness of radiological, cardiology and biochemical diagnostic units.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-brand-dark-border">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-brand-dark-elevated text-slate-600 dark:text-brand-dark-muted uppercase font-bold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Equipment Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Last Inspected</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-brand-dark-border">
                {capacity.equipment.map((eq) => (
                  <tr
                    key={eq.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-brand-dark-elevated/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-brand-dark-heading">
                      {eq.name}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-brand-dark-muted">
                      {eq.category}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-brand-dark-muted">
                      {eq.location}
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-brand-dark-muted">
                      {eq.lastInspection}
                    </td>
                    <td className="py-3 px-4">
                      {isEditing ? (
                        <select
                          value={eq.status}
                          onChange={(e) =>
                            handleEquipmentStatusChange(
                              eq.id,
                              e.target.value as FacilityEquipmentItem['status']
                            )
                          }
                          className="text-xs font-bold px-2 py-1 rounded border border-slate-300 bg-white dark:bg-brand-dark-bg text-slate-900 dark:text-brand-dark-text"
                        >
                          <option value="Available">Available</option>
                          <option value="In Use">In Use</option>
                          <option value="Maintenance">Maintenance</option>
                          <option value="Out of Service">Out of Service</option>
                        </select>
                      ) : (
                        getEquipmentStatusBadge(eq.status)
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

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
