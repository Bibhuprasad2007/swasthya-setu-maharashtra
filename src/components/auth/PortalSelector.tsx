import React from 'react';
import { PORTAL_LIST } from '../../constants/portals';
import { PortalType } from '../../types/auth';
import { PortalCard } from './PortalCard';

interface PortalSelectorProps {
  selectedPortal: PortalType;
  onSelectPortal: (portal: PortalType) => void;
}

export const PortalSelector: React.FC<PortalSelectorProps> = ({
  selectedPortal,
  onSelectPortal,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Select Healthcare Role Portal
        </label>
        <span className="text-[11px] text-slate-500 font-medium">
          Step 1 of 2
        </span>
      </div>

      <div
        role="radiogroup"
        aria-label="Select healthcare portal role"
        className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3"
      >
        {PORTAL_LIST.map((portal) => (
          <PortalCard
            key={portal.id}
            portal={portal}
            isSelected={selectedPortal === portal.id}
            onSelect={onSelectPortal}
          />
        ))}
      </div>
    </div>
  );
};
