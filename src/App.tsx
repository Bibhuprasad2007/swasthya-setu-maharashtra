import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { DoctorPortalProvider } from './context/DoctorPortalContext';
import { LabPortalProvider } from './context/LabPortalContext';
import { PharmacyPortalProvider } from './context/PharmacyPortalContext';
import { PortalSelectPage } from './pages/PortalSelectPage';
import { PortalLoginPage } from './pages/PortalLoginPage';
import { AdminDashboard } from './pages/dashboards/AdminDashboard';
import { ProtectedRoute } from './components/routes/ProtectedRoute';
import { NotFound } from './components/routes/NotFound';

// Pharmacy Portal Pages
import { PharmacyDashboardPage } from './pages/pharmacy/PharmacyDashboardPage';
import { PharmacyPrescriptionsPage } from './pages/pharmacy/PharmacyPrescriptionsPage';
import { PharmacyInventoryPage } from './pages/pharmacy/PharmacyInventoryPage';
import { PharmacyReservationsPage } from './pages/pharmacy/PharmacyReservationsPage';
import { PharmacyDispensingHistoryPage } from './pages/pharmacy/PharmacyDispensingHistoryPage';

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

// Diagnostic Lab Portal Pages
import { LabDashboardPage } from './pages/lab/LabDashboardPage';
import { LabTestOrdersPage } from './pages/lab/LabTestOrdersPage';
import { LabSampleTrackingPage } from './pages/lab/LabSampleTrackingPage';
import { LabResultEntryPage } from './pages/lab/LabResultEntryPage';
import { LabReportsPage } from './pages/lab/LabReportsPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <DoctorPortalProvider>
            <LabPortalProvider>
              <PharmacyPortalProvider>
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

                  {/* Diagnostic Lab Portal Routes */}
                  <Route
                    path="/laboratory"
                    element={<Navigate to="/laboratory/dashboard" replace />}
                  />
                  <Route
                    path="/laboratory/dashboard"
                    element={
                      <ProtectedRoute allowedRole="laboratory">
                        <LabDashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/laboratory/test-orders"
                    element={
                      <ProtectedRoute allowedRole="laboratory">
                        <LabTestOrdersPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/laboratory/samples"
                    element={
                      <ProtectedRoute allowedRole="laboratory">
                        <LabSampleTrackingPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/laboratory/result-entry"
                    element={
                      <ProtectedRoute allowedRole="laboratory">
                        <LabResultEntryPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/laboratory/reports"
                    element={
                      <ProtectedRoute allowedRole="laboratory">
                        <LabReportsPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Pharmacy Portal Routes */}
                  <Route
                    path="/pharmacy"
                    element={<Navigate to="/pharmacy/dashboard" replace />}
                  />
                  <Route
                    path="/pharmacy/dashboard"
                    element={
                      <ProtectedRoute allowedRole="pharmacy">
                        <PharmacyDashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/pharmacy/prescriptions"
                    element={
                      <ProtectedRoute allowedRole="pharmacy">
                        <PharmacyPrescriptionsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/pharmacy/inventory"
                    element={
                      <ProtectedRoute allowedRole="pharmacy">
                        <PharmacyInventoryPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/pharmacy/reservations"
                    element={
                      <ProtectedRoute allowedRole="pharmacy">
                        <PharmacyReservationsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/pharmacy/dispensing-history"
                    element={
                      <ProtectedRoute allowedRole="pharmacy">
                        <PharmacyDispensingHistoryPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Portal (Untouched) */}
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
              </PharmacyPortalProvider>
            </LabPortalProvider>
          </DoctorPortalProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
