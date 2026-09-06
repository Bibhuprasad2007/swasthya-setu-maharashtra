import React from 'react';
import { KeyRound, Sparkles, Building2, FlaskConical, Pill, ShieldAlert } from 'lucide-react';
import { MOCK_ACCOUNTS } from '../../services/mockAuthData';
import { PortalType } from '../../types/auth';
import { useLanguage } from '../../context/LanguageContext';

interface QuickDemoFillProps {
  onSelectAccount: (account: {
    portal: PortalType;
    identifier: string;
    password: string;
    facilityCode: string;
  }) => void;
  activePortal: PortalType;
}

export const QuickDemoFill: React.FC<QuickDemoFillProps> = ({
  onSelectAccount,
  activePortal,
}) => {
  const { t } = useLanguage();

  const getPortalIcon = (portal: PortalType) => {
    switch (portal) {
      case 'hospital':
        return <Building2 className="w-3.5 h-3.5 text-blue-600" />;
      case 'laboratory':
        return <FlaskConical className="w-3.5 h-3.5 text-teal-600" />;
      case 'pharmacy':
        return <Pill className="w-3.5 h-3.5 text-indigo-600" />;
      case 'admin':
        return <ShieldAlert className="w-3.5 h-3.5 text-slate-700" />;
    }
  };

  const getPortalName = (portal: PortalType) => {
    switch (portal) {
      case 'hospital':
        return 'Hospital / Doctor';
      case 'laboratory':
        return 'Diagnostic Lab';
      case 'pharmacy':
        return 'Pharmacy';
      case 'admin':
        return 'Govt Admin';
    }
  };

  return (
    <div className="mt-6 pt-5 border-t border-dashed border-slate-200">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <KeyRound className="w-3.5 h-3.5 text-brand-blue-600" />
          <span>{t.demoAccountsTitle}</span>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
          <Sparkles className="w-3 h-3 text-amber-500" />
          SIH Prototype
        </span>
      </div>

      <p className="text-[11px] text-slate-500 mb-3">
        {t.demoClickToFill}
      </p>

      <div className="grid grid-cols-2 gap-2">
        {MOCK_ACCOUNTS.map((acc) => {
          const isCurrentActive = acc.portal === activePortal;
          return (
            <button
              key={acc.identifier}
              type="button"
              onClick={() =>
                onSelectAccount({
                  portal: acc.portal,
                  identifier: acc.identifier,
                  password: acc.password,
                  facilityCode: acc.facilityCode,
                })
              }
              aria-label={`Fill demo credentials for ${getPortalName(acc.portal)}`}
              className={`flex flex-col items-start p-2.5 rounded-lg text-left transition-all border ${
                isCurrentActive
                  ? 'bg-brand-blue-50/70 border-brand-blue-300 ring-1 ring-brand-blue-400'
                  : 'bg-slate-50/80 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-1.5 w-full mb-1">
                {getPortalIcon(acc.portal)}
                <span className="text-xs font-semibold text-slate-800 truncate">
                  {getPortalName(acc.portal)}
                </span>
              </div>
              <div className="w-full text-[11px] font-mono text-slate-600 space-y-0.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">ID:</span>
                  <span className="font-semibold text-slate-700">{acc.identifier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Code:</span>
                  <span className="text-slate-600">{acc.facilityCode}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
