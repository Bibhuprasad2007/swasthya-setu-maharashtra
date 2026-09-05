import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { PortalSelectPage } from './pages/PortalSelectPage';
import { PortalLoginPage } from './pages/PortalLoginPage';
import { HospitalDashboard } from './pages/dashboards/HospitalDashboard';
import { LaboratoryDashboard } from './pages/dashboards/LaboratoryDashboard';
import { PharmacyDashboard } from './pages/dashboards/PharmacyDashboard';
import { AdminDashboard } from './pages/dashboards/AdminDashboard';
import { ProtectedRoute } from './components/routes/ProtectedRoute';
import { NotFound } from './components/routes/NotFound';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Main Portal Selection Landing Page */}
              <Route path="/" element={<PortalSelectPage />} />
              <Route path="/login" element={<PortalSelectPage />} />

              {/* Dedicated Separate Login Page for each Portal */}
              <Route path="/login/:portalType" element={<PortalLoginPage />} />

              {/* Protected Role-Based Portals */}
              <Route
                path="/hospital/dashboard"
                element={
                  <ProtectedRoute allowedRole="hospital">
                    <HospitalDashboard />
                  </ProtectedRoute>
                }
              />

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
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
