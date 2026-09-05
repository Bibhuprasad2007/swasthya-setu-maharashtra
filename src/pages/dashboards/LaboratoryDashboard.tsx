import React from 'react';
import { FlaskConical } from 'lucide-react';
import { DashboardLayout } from '../DashboardLayout';

export const LaboratoryDashboard: React.FC = () => {
  return (
    <DashboardLayout
      portalTitle="Diagnostic Laboratory Portal"
      portalSubtitle="Test Orders & Specimen Management"
      portalIcon={<FlaskConical className="w-6 h-6 text-teal-400" />}
      themeColor="teal"
    >
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-brand-dark-border rounded-2xl p-8 text-center bg-white/50 dark:bg-brand-dark-surface/50">
        <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 mb-3 border border-teal-100 dark:border-teal-900/40">
          <FlaskConical className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-brand-dark-heading mb-1">
          Diagnostic Laboratory Dashboard Workspace
        </h2>
        <p className="text-sm text-slate-500 dark:text-brand-dark-muted max-w-md">
          This page is currently blank. Ready to add modules as per your requirements.
        </p>
      </div>
    </DashboardLayout>
  );
};
