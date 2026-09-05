import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { DoctorPortalProvider } from './context/DoctorPortalContext';
import { PortalSelectPage } from './pages/PortalSelectPage';
import { PortalLoginPage } from './pages/PortalLoginPage';
import { LaboratoryDashboard } from './pages/dashboards/LaboratoryDashboard';
import { PharmacyDashboard } from './pages/dashboards/PharmacyDashboard';
import { AdminDashboard } from './pages/dashboards/AdminDashboard';
import { ProtectedRoute } from './components/routes/ProtectedRoute';
import { NotFound } from './components/routes/NotFound';

// Hospital / Doctor Portal Pages
import { DashboardPage } from './pages/hospital/DashboardPage';
import { AppointmentsPage } from './pages/hospital/AppointmentsPage';
import { LiveQueuePage } from './pages/hospital/LiveQueuePage';
import { PatientsPage } from './pages/hospital/PatientsPage';
import { ConsultationsPage } from './pages/hospital/ConsultationsPage';
import { PrescriptionsPage } from './pages/hospital/PrescriptionsPage';
import { LabOrdersPage } from './pages/hospital/LabOrdersPage';
import { ReferralsPage } from './pages/hospital/ReferralsPage';
import { TeleconsultationPage } from './pages/hospital/TeleconsultationPage';
import { FollowUpsPage } from './pages/hospital/FollowUpsPage';
import { FacilityStatusPage } from './pages/hospital/FacilityStatusPage';
import { ReportsPage } from './pages/hospital/ReportsPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <DoctorPortalProvider>
            <BrowserRouter>
              <Routes>
                {/* Main Portal Selection Landing Page */}
                <Route path="/" element={<PortalSelectPage />} />
                <Route path="/login" element={<PortalSelectPage />} />

                {/* Dedicated Separate Login Page for each Portal */}
                <Route path="/login/:portalType" element={<PortalLoginPage />} />

                {/* Protected Hospital / Doctor Portal Routes */}
                <Route
                  path="/hospital"
                  element={<Navigate to="/hospital/dashboard" replace />}
                />
                <Route
                  path="/hospital/dashboard"
                  element={
                    <ProtectedRoute allowedRole="hospital">
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hospital/appointments"
                  element={
                    <ProtectedRoute allowedRole="hospital">
                      <AppointmentsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hospital/queue"
                  element={
                    <ProtectedRoute allowedRole="hospital">
                      <LiveQueuePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hospital/patients"
                  element={
                    <ProtectedRoute allowedRole="hospital">
                      <PatientsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hospital/patients/:patientId"
                  element={
                    <ProtectedRoute allowedRole="hospital">
                      <PatientsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hospital/consultations"
                  element={
                    <ProtectedRoute allowedRole="hospital">
                      <ConsultationsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hospital/prescriptions"
                  element={
                    <ProtectedRoute allowedRole="hospital">
                      <PrescriptionsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hospital/lab-orders"
                  element={
                    <ProtectedRoute allowedRole="hospital">
                      <LabOrdersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hospital/referrals"
                  element={
                    <ProtectedRoute allowedRole="hospital">
                      <ReferralsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hospital/teleconsultation"
                  element={
                    <ProtectedRoute allowedRole="hospital">
                      <TeleconsultationPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hospital/follow-ups"
                  element={
                    <ProtectedRoute allowedRole="hospital">
                      <FollowUpsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hospital/facility-status"
                  element={
                    <ProtectedRoute allowedRole="hospital">
                      <FacilityStatusPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hospital/reports"
                  element={
                    <ProtectedRoute allowedRole="hospital">
                      <ReportsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Other Blank Workspace Role-Based Portals (Untouched) */}
                <Route
                  path="/laboratory/dashboard"
                  element={
                    <ProtectedRoute allowedRole="laboratory">
                      <LaboratoryDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/pharmacy/dashboard"
                  element={
                    <ProtectedRoute allowedRole="pharmacy">
                      <PharmacyDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRole="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* 404 Not Found Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </DoctorPortalProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
