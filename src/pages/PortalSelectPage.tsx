import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { PORTAL_LIST } from '../constants/portals';
import { Header } from '../components/common/Header';
import { MedicalBackground } from '../components/common/MedicalBackground';
import { TrustIndicators } from '../components/common/TrustIndicators';
import { PortalCard } from '../components/auth/PortalCard';

export const PortalSelectPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-brand-dark-bg transition-colors duration-200 relative overflow-x-hidden">
      {/* Ambient Medical Glow & ECG Background */}
      <MedicalBackground />

      {/* Sticky Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 z-10 flex flex-col justify-center">
        
        {/* Hero Section */}
        <section aria-labelledby="portal-selection-heading" className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-blue-50 dark:bg-brand-blue-950/70 text-brand-blue-700 dark:text-brand-blue-300 border border-brand-blue-200 dark:border-brand-blue-800/80 mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-brand-blue-600 dark:text-brand-blue-400" />
            <span>Unified Healthcare Authentication</span>
          </div>

          {/* Heading */}
          <h2
            id="portal-selection-heading"
            className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-brand-dark-heading tracking-tight leading-tight"
          >
            Select Your Healthcare Portal
          </h2>

          {/* Supporting Text */}
          <p className="text-sm sm:text-base text-slate-600 dark:text-brand-dark-muted mt-3 leading-relaxed max-w-2xl mx-auto">
            Securely access your authorized workspace and coordinate healthcare services across Maharashtra.
          </p>

          {/* Trust Indicators */}
          <div className="mt-4">
            <TrustIndicators />
          </div>

        </section>

        {/* 2x2 Responsive Portal Cards Grid */}
        <section aria-label="Available Healthcare Portals" className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 max-w-5xl mx-auto">
            {PORTAL_LIST.map((portal) => (
              <PortalCard
                key={portal.id}
                portal={portal}
                onClick={() => navigate(`/login/${portal.id}`)}
              />
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full bg-white/80 dark:bg-brand-dark-surface/80 backdrop-blur-sm border-t border-slate-200 dark:border-brand-dark-border py-4 text-center text-xs text-slate-500 dark:text-brand-dark-muted z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2024 SwasthyaSetu Maharashtra — Integrated Rural Healthcare Network</p>
          <div className="flex items-center gap-4 text-slate-400 dark:text-slate-500 text-[11px]">
            <span>ABHA & NDHM Grid</span>
            <span>•</span>
            <span>256-bit TLS Encrypted</span>
            <span>•</span>
            <span>HIPAA Compliant</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
