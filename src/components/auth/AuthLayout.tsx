import React from 'react';
import { Header } from '../common/Header';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <Header />

      {/* Main Centered Login Section */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-2xl">
          {children}
        </div>
      </main>

      {/* Simple Clean Footer */}
      <footer className="w-full bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2024 SwasthyaSetu Maharashtra - Integrated Rural Healthcare Network</p>
        </div>
      </footer>
    </div>
  );
};
