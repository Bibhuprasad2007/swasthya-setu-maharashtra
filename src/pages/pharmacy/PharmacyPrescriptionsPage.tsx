import React, { useState, useMemo } from 'react';
import {
  Search,
  AlertTriangle,
  PackageCheck,
  RotateCcw,
  Eye
} from 'lucide-react';
import { PharmacyPortalLayout } from '../../components/layouts/PharmacyPortalLayout';
import { usePharmacyPortal } from '../../context/PharmacyPortalContext';
import { PrescriptionStatusBadge } from '../../components/pharmacy/PharmacyBadges';
import { EmptyState } from '../../components/common/EmptyState';
import { PrescriptionDetailsModal } from '../../components/pharmacy/PrescriptionDetailsModal';
import { ContactDoctorModal } from '../../components/pharmacy/ContactDoctorModal';
import { SafeDispensingModal } from '../../components/pharmacy/SafeDispensingModal';
import { DispensingReceiptModal } from '../../components/pharmacy/DispensingReceiptModal';
import { PharmacyPrescription, DispensingRecord } from '../../types/pharmacy';

export const PharmacyPrescriptionsPage: React.FC = () => {
  const { prescriptions, requestContactDoctor } = usePharmacyPortal();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [facilityFilter, setFacilityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'urgency'>('newest');

  // Modals
  const [selectedRxForView, setSelectedRxForView] = useState<PharmacyPrescription | null>(null);
  const [selectedRxForContact, setSelectedRxForContact] = useState<PharmacyPrescription | null>(null);
  const [selectedRxForDispense, setSelectedRxForDispense] = useState<PharmacyPrescription | null>(null);
  const [generatedReceipt, setGeneratedReceipt] = useState<DispensingRecord | null>(null);

  // Available facilities for filter
  const facilities = useMemo(() => {
    const set = new Set<string>();
    prescriptions.forEach((p) => set.add(p.doctor.facilityName));
    return Array.from(set);
  }, [prescriptions]);

  // Filtered & Sorted prescriptions
  const filteredPrescriptions = useMemo(() => {
    return prescriptions
      .filter((rx) => {
        const query = searchQuery.trim().toLowerCase();
        const matchesSearch =
          !query ||
          rx.id.toLowerCase().includes(query) ||
          rx.patient.name.toLowerCase().includes(query) ||
          rx.patient.abhaId.toLowerCase().includes(query) ||
          rx.patient.maskedPhone.includes(query) ||
          rx.doctor.name.toLowerCase().includes(query);

        const matchesStatus = statusFilter === 'all' || rx.status === statusFilter;
        const matchesFacility = facilityFilter === 'all' || rx.doctor.facilityName === facilityFilter;

        return matchesSearch && matchesStatus && matchesFacility;
      })
      .sort((a, b) => {
        if (sortBy === 'urgency') {
          const urgencyWeight: Record<string, number> = { emergency: 3, urgent: 2, routine: 1 };
          return (urgencyWeight[b.urgency] || 0) - (urgencyWeight[a.urgency] || 0);
        }
        const timeA = new Date(a.issueDate).getTime();
        const timeB = new Date(b.issueDate).getTime();
        return sortBy === 'newest' ? timeB - timeA : timeA - timeB;
      });
  }, [prescriptions, searchQuery, statusFilter, facilityFilter, sortBy]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setFacilityFilter('all');
    setSortBy('newest');
  };

  return (
    <PharmacyPortalLayout
      pageTitle="Digital Prescriptions (e-Rx)"
      pageSubtitle="Authenticated prescriptions received in real-time from government hospitals, PHCs, and clinics"
    >
      <div className="space-y-5">
        {/* Search, Filter & Sort Controls */}
        <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Rx ID, Patient Name, ABHA ID, Mobile, or Doctor..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-900 dark:text-brand-dark-text placeholder-slate-400 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-700 dark:text-brand-dark-text focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Statuses</option>
              <option value="finalized">Finalized (Ready to Dispense)</option>
              <option value="partially_dispensed">Partially Dispensed</option>
              <option value="fully_dispensed">Fully Dispensed</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>

            {/* Facility Filter */}
            <select
              value={facilityFilter}
              onChange={(e) => setFacilityFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-700 dark:text-brand-dark-text focus:ring-2 focus:ring-emerald-500 max-w-[180px] truncate"
            >
              <option value="all">All Facilities</option>
              {facilities.map((fac) => (
                <option key={fac} value={fac}>
                  {fac}
                </option>
              ))}
            </select>

            {/* Sort Options */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border text-slate-700 dark:text-brand-dark-text focus:ring-2 focus:ring-emerald-500"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="urgency">Sort: High Urgency First</option>
            </select>

            {(searchQuery || statusFilter !== 'all' || facilityFilter !== 'all' || sortBy !== 'newest') && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-3 py-2 rounded-xl text-slate-600 dark:text-brand-dark-text bg-slate-100 dark:bg-brand-dark-elevated hover:bg-slate-200 flex items-center gap-1 font-semibold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Prescriptions Table View */}
        <div className="bg-white dark:bg-brand-dark-surface rounded-2xl border border-slate-200 dark:border-brand-dark-border shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-brand-dark-elevated border-b border-slate-200 dark:border-brand-dark-border font-semibold text-slate-600 dark:text-brand-dark-muted text-[11px] uppercase">
                  <th className="px-4 py-3">Prescription ID</th>
                  <th className="px-4 py-3">Patient Details</th>
                  <th className="px-4 py-3">Age / Gender</th>
                  <th className="px-4 py-3">Prescribing Doctor</th>
                  <th className="px-4 py-3">Healthcare Facility</th>
                  <th className="px-4 py-3">Issue Date</th>
                  <th className="px-4 py-3">Valid Until</th>
                  <th className="px-4 py-3 text-center">Drugs</th>
                  <th className="px-4 py-3">Fulfilment Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-brand-dark-border">
                {filteredPrescriptions.map((rx) => {
                  const hasAllergies = rx.patient.allergies && rx.patient.allergies.length > 0;
                  const isDispensable = rx.status === 'finalized' || rx.status === 'partially_dispensed';

                  return (
                    <tr
                      key={rx.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-brand-dark-elevated/40 transition-colors"
                    >
                      <td className="px-4 py-3.5 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {rx.id}
                        {rx.urgency === 'urgent' && (
                          <span className="block text-[9px] text-amber-600 font-sans font-bold uppercase mt-0.5">
                            Urgent Priority
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <strong className="text-slate-900 dark:text-brand-dark-text block">
                          {rx.patient.name}
                        </strong>
                        <span className="text-[11px] text-slate-400 font-mono block">
                          {rx.patient.abhaId}
                        </span>
                        {hasAllergies && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-200 mt-0.5">
                            <AlertTriangle className="w-3 h-3" />
                            Allergy Alert
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-slate-700 dark:text-brand-dark-text">
                        {rx.patient.age} yrs • {rx.patient.gender}
                      </td>
                      <td className="px-4 py-3.5">
                        <strong className="text-slate-800 dark:text-brand-dark-heading block">
                          {rx.doctor.name}
                        </strong>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {rx.doctor.registrationNumber}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 dark:text-brand-dark-muted max-w-[160px] truncate">
                        {rx.doctor.facilityName}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 dark:text-brand-dark-muted whitespace-nowrap">
                        {rx.issueDate}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 dark:text-brand-dark-muted whitespace-nowrap">
                        {rx.validUntil}
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono font-bold text-slate-800 dark:text-brand-dark-text">
                        {rx.medicines.length}
                      </td>
                      <td className="px-4 py-3.5">
                        <PrescriptionStatusBadge status={rx.status} />
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedRxForView(rx)}
                            className="p-1.5 text-slate-600 dark:text-brand-dark-text bg-slate-100 dark:bg-brand-dark-elevated hover:bg-slate-200 rounded-lg"
                            title="View Prescription Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {isDispensable && (
                            <button
                              type="button"
                              onClick={() => setSelectedRxForDispense(rx)}
                              className="px-2.5 py-1.5 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center gap-1"
                            >
                              <PackageCheck className="w-3.5 h-3.5" />
                              <span>Dispense</span>
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

          {filteredPrescriptions.length === 0 && (
            <div className="p-10">
              <EmptyState
                title="No Prescriptions Found"
                description="No digital prescriptions matched your current search parameters or filters."
                actionLabel="Clear Filters"
                onAction={handleClearFilters}
              />
            </div>
          )}
        </div>
      </div>

      {/* Prescription Details Modal */}
      {selectedRxForView && (
        <PrescriptionDetailsModal
          isOpen={!!selectedRxForView}
          prescription={selectedRxForView}
          onClose={() => setSelectedRxForView(null)}
          onStartDispense={(rx) => setSelectedRxForDispense(rx)}
          onContactDoctor={(rx) => setSelectedRxForContact(rx)}
        />
      )}

      {/* Contact Prescribing Doctor Modal */}
      {selectedRxForContact && (
        <ContactDoctorModal
          isOpen={!!selectedRxForContact}
          prescription={selectedRxForContact}
          onClose={() => setSelectedRxForContact(null)}
          onSubmit={(notes) => {
            requestContactDoctor(selectedRxForContact.id, notes, 'Sunita Patil (Registered Pharmacist)');
          }}
        />
      )}

      {/* Safe Dispensing Wizard Modal */}
      {selectedRxForDispense && (
        <SafeDispensingModal
          isOpen={!!selectedRxForDispense}
          prescription={selectedRxForDispense}
          onClose={() => setSelectedRxForDispense(null)}
          onDispensingComplete={(receipt) => {
            setGeneratedReceipt(receipt);
          }}
        />
      )}

      {/* Dispensing Receipt Modal */}
      {generatedReceipt && (
        <DispensingReceiptModal
          isOpen={!!generatedReceipt}
          record={generatedReceipt}
          onClose={() => setGeneratedReceipt(null)}
        />
      )}
    </PharmacyPortalLayout>
  );
};
