import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PortalType } from '../../types/auth';
import { PORTALS } from '../../constants/portals';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: PortalType;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRole,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-slate-200">
          <div className="w-8 h-8 border-3 border-brand-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-700">Verifying security credentials...</p>
        </div>
      </div>
    );
  }

  // If not logged in, redirect to login page
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If logged in user role does not match allowed role for this portal route, redirect to their own dashboard
  if (user.role !== allowedRole) {
    const userRoute = PORTALS[user.role]?.dashboardRoute || '/login';
    return <Navigate to={userRoute} replace />;
  }

  return <>{children}</>;
};
