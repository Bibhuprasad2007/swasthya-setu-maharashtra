import React from 'react';
import { Stethoscope } from 'lucide-react';
import { DashboardLayout } from '../DashboardLayout';

export const HospitalDashboard: React.FC = () => {
  return (
    <DashboardLayout
      portalTitle="Hospital & Doctor Portal"
      portalSubtitle="Clinical Consultations, OPD & Records"
      portalIcon={<Stethoscope className="w-6 h-6 text-brand-blue-400" />}
      themeColor="blue"
    >
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-brand-dark-border rounded-2xl p-8 text-center bg-white/50 dark:bg-brand-dark-surface/50">
        <div className="p-4 rounded-2xl bg-brand-blue-50 dark:bg-brand-blue-950/50 text-brand-blue-600 dark:text-brand-blue-400 mb-3 border border-brand-blue-100 dark:border-brand-blue-900/40">
          <Stethoscope className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-brand-dark-heading mb-1">
          Hospital / Doctor Dashboard Workspace
        </h2>
        <p className="text-sm text-slate-500 dark:text-brand-dark-muted max-w-md">
          This page is currently blank. Ready to add modules as per your requirements.
        </p>
      </div>
    </DashboardLayout>
  );
};
