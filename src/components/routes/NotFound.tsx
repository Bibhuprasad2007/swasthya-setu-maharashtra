import React from 'react';
import { Link } from 'react-router-dom';
import { AlertOctagon, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const NotFound: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-200">
          <AlertOctagon className="w-8 h-8" />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 mb-2">404 - {t.pageNotFound}</h1>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          {t.pageNotFoundDesc}
        </p>

        <Link
          to="/login"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-navy-900 hover:bg-brand-navy-800 text-white text-sm font-semibold rounded-xl shadow transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.backToLogin}</span>
        </Link>
      </div>
    </div>
  );
};
