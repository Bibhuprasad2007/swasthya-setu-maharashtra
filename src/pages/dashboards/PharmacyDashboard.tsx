import React from 'react';
import { PharmacyDashboardPage } from '../pharmacy/PharmacyDashboardPage';

/**
 * Legacy Dashboard route wrapper
 * Delegating to the complete PharmacyDashboardPage
 */
export const PharmacyDashboard: React.FC = () => {
  return <PharmacyDashboardPage />;
};

export default PharmacyDashboard;
