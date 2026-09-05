import React from 'react';
import { Pill } from 'lucide-react';
import { DashboardLayout } from '../DashboardLayout';

export const PharmacyDashboard: React.FC = () => {
  return (
    <DashboardLayout
      portalTitle="Pharmacy & Dispensary Portal"
      portalSubtitle="Prescription Dispensing & Stock Management"
      portalIcon={<Pill className="w-6 h-6 text-emerald-400" />}
      themeColor="emerald"
    >
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-brand-dark-border rounded-2xl p-8 text-center bg-white/50 dark:bg-brand-dark-surface/50">
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 mb-3 border border-emerald-100 dark:border-emerald-900/40">
          <Pill className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-brand-dark-heading mb-1">
          Pharmacy & Dispensary Dashboard Workspace
        </h2>
        <p className="text-sm text-slate-500 dark:text-brand-dark-muted max-w-md">
          This page is currently blank. Ready to add modules as per your requirements.
        </p>
      </div>
    </DashboardLayout>
  );
};
