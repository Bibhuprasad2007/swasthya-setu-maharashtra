import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { DoctorPortalProvider } from './context/DoctorPortalContext';
import { LabPortalProvider } from './context/LabPortalContext';
import { PharmacyPortalProvider } from './context/PharmacyPortalContext';
import { AdminPortalProvider } from './context/AdminPortalContext';
import { PortalSelectPage } from './pages/PortalSelectPage';
import { PortalLoginPage } from './pages/PortalLoginPage';
import { ProtectedRoute } from './components/routes/ProtectedRoute';
import { NotFound } from './components/routes/NotFound';

// Government Admin Portal Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminFacilitiesPage } from './pages/admin/AdminFacilitiesPage';
import { AdminServiceMonitoringPage } from './pages/admin/AdminServiceMonitoringPage';
import { AdminAlertsPage } from './pages/admin/AdminAlertsPage';
import { AdminReferralsPage } from './pages/admin/AdminReferralsPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminAccessAuditPage } from './pages/admin/AdminAccessAuditPage';

// Pharmacy Portal Pages
import { PharmacyDashboardPage } from './pages/pharmacy/PharmacyDashboardPage';
import { PharmacyPrescriptionsPage } from './pages/pharmacy/PharmacyPrescriptionsPage';
import { PharmacyInventoryPage } from './pages/pharmacy/PharmacyInventoryPage';
import { PharmacyReservationsPage } from './pages/pharmacy/PharmacyReservationsPage';
import { PharmacyDispensingHistoryPage } from './pages/pharmacy/PharmacyDispensingHistoryPage';

// Hospital / Doctor Portal Pages
import { DashboardPage } from './pages/hospital/DashboardPage';
import { AppointmentsPage } from './pages/hospital/AppointmentsPage';
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
                <AdminPortalProvider>
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
                      element={<Navigate to="/hospital/appointments?tab=queue" replace />}
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

                    {/* Government Admin Portal Routes */}
                    <Route
                      path="/admin"
                      element={<Navigate to="/admin/dashboard" replace />}
                    />
                    <Route
                      path="/admin/dashboard"
                      element={
                        <ProtectedRoute allowedRole="admin">
                          <AdminDashboardPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/facilities"
                      element={
                        <ProtectedRoute allowedRole="admin">
                          <AdminFacilitiesPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/service-monitoring"
                      element={
                        <ProtectedRoute allowedRole="admin">
                          <AdminServiceMonitoringPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/alerts"
                      element={
                        <ProtectedRoute allowedRole="admin">
                          <AdminAlertsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/referrals"
                      element={
                        <ProtectedRoute allowedRole="admin">
                          <AdminReferralsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/reports"
                      element={
                        <ProtectedRoute allowedRole="admin">
                          <AdminReportsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/access-audit"
                      element={
                        <ProtectedRoute allowedRole="admin">
                          <AdminAccessAuditPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/users"
                      element={<Navigate to="/admin/access-audit" replace />}
                    />
                    <Route
                      path="/admin/audit-logs"
                      element={<Navigate to="/admin/access-audit" replace />}
                    />

                    {/* 404 Not Found Catch-all */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
                </AdminPortalProvider>
              </PharmacyPortalProvider>
            </LabPortalProvider>
          </DoctorPortalProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
