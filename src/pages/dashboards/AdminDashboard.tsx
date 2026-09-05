import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { DashboardLayout } from '../DashboardLayout';

export const AdminDashboard: React.FC = () => {
  return (
    <DashboardLayout
      portalTitle="Government Admin Portal"
      portalSubtitle="Statewide Public Health Governance"
      portalIcon={<ShieldAlert className="w-6 h-6 text-sky-400" />}
      themeColor="cyan"
    >
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-brand-dark-border rounded-2xl p-8 text-center bg-white/50 dark:bg-brand-dark-surface/50">
        <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 mb-3 border border-sky-100 dark:border-sky-900/40">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-brand-dark-heading mb-1">
          Government Admin Dashboard Workspace
        </h2>
        <p className="text-sm text-slate-500 dark:text-brand-dark-muted max-w-md">
          This page is currently blank. Ready to add modules as per your requirements.
        </p>
      </div>
    </DashboardLayout>
  );
};
