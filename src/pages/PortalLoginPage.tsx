import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Building, 
  ArrowRight, 
  CheckCircle, 
  Stethoscope, 
  FlaskConical, 
  Pill, 
  ShieldCheck,
  KeyRound
} from 'lucide-react';
import { PORTALS } from '../constants/portals';
import { PortalType } from '../types/auth';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Header } from '../components/common/Header';
import { MedicalBackground } from '../components/common/MedicalBackground';
import { PasswordInput } from '../components/common/PasswordInput';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { MOCK_ACCOUNTS } from '../services/mockAuthData';

export const PortalLoginPage: React.FC = () => {
  const { portalType } = useParams<{ portalType: string }>();
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuth();
  const { t } = useLanguage();

  const validPortals: PortalType[] = ['hospital', 'laboratory', 'pharmacy', 'admin'];
  const currentPortalType = (portalType as PortalType) || 'hospital';

  // If invalid portal route, redirect to portal selector
  if (!validPortals.includes(currentPortalType)) {
    return <Navigate to="/" replace />;
  }

  const portalConfig = PORTALS[currentPortalType];
  const demoAccount = MOCK_ACCOUNTS.find((acc) => acc.portal === currentPortalType);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [facilityCode, setFacilityCode] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    identifier?: string;
    password?: string;
    facilityCode?: string;
  }>({});
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setFieldErrors({});
    clearError();
  }, [currentPortalType]);

  const getPortalIcon = () => {
    switch (currentPortalType) {
      case 'hospital':
        return <Stethoscope className="w-6 h-6 text-brand-blue-600 dark:text-brand-blue-400" aria-hidden="true" />;
      case 'laboratory':
        return <FlaskConical className="w-6 h-6 text-brand-teal-600 dark:text-brand-teal-400" aria-hidden="true" />;
      case 'pharmacy':
        return <Pill className="w-6 h-6 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />;
      case 'admin':
        return <ShieldCheck className="w-6 h-6 text-sky-600 dark:text-sky-400" aria-hidden="true" />;
    }
  };

  const getThemeTopLine = () => {
    switch (currentPortalType) {
      case 'hospital': return 'bg-gradient-to-r from-blue-500 to-cyan-400';
      case 'laboratory': return 'bg-gradient-to-r from-teal-500 to-emerald-400';
      case 'pharmacy': return 'bg-gradient-to-r from-emerald-500 to-teal-400';
      case 'admin': return 'bg-gradient-to-r from-sky-500 to-indigo-500';
    }
  };

  const validateForm = (): boolean => {
    const errors: { identifier?: string; password?: string; facilityCode?: string } = {};
    if (!identifier.trim()) {
      errors.identifier = `${(t as any)[portalConfig.identifierLabelKey]} is required`;
    }
    if (!password) {
      errors.password = `${t.passwordLabel} is required`;
    } else if (password.length < 4) {
      errors.password = 'Password must be at least 4 characters';
    }
    if (!facilityCode.trim()) {
      errors.facilityCode = `${(t as any)[portalConfig.codeLabelKey]} is required`;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) {
      return;
    }

    try {
      const user = await login({
        identifier: identifier.trim(),
        password,
        facilityCode: facilityCode.trim(),
        portal: currentPortalType,
        rememberMe,
      });

      setIsSuccess(true);

      setTimeout(() => {
        const targetRoute = PORTALS[user.role]?.dashboardRoute || '/hospital/dashboard';
        navigate(targetRoute, { replace: true });
      }, 600);
    } catch {
      // Error handled in AuthContext
    }
  };

  const handleFillDemo = () => {
    if (demoAccount) {
      setIdentifier(demoAccount.identifier);
      setPassword(demoAccount.password);
      setFacilityCode(demoAccount.facilityCode);
      setFieldErrors({});
      clearError();
    }
  };

  const portalTitle = (t as any)[portalConfig.titleKey] || currentPortalType;
  const portalDesc = (t as any)[portalConfig.descriptionKey] || '';
  const identifierLabel = (t as any)[portalConfig.identifierLabelKey] || 'Identifier ID';
  const codeLabel = (t as any)[portalConfig.codeLabelKey] || 'Facility Code';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-brand-dark-bg transition-colors duration-200 relative overflow-x-hidden">
      <MedicalBackground />
      <Header />

      <main className="flex-1 max-w-lg mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 flex flex-col justify-center z-10">
        
        {/* Back Link */}
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-brand-dark-text hover:text-brand-blue-600 dark:hover:text-brand-blue-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Change Portal / Role</span>
          </Link>
        </div>

        {/* Dedicated Login Card */}
        <div className="relative bg-white dark:bg-brand-dark-surface rounded-[22px] border border-slate-200/90 dark:border-brand-dark-border shadow-card dark:shadow-card-dark p-6 sm:p-8 overflow-hidden">
          
          {/* Top colored accent line */}
          <div className={`absolute top-0 left-0 right-0 h-1.5 ${getThemeTopLine()}`} />

          {/* Header of Dedicated Portal */}
          <div className="flex items-center gap-3.5 pb-4 mb-5 border-b border-slate-100 dark:border-brand-dark-border/80">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-brand-dark-elevated border border-slate-200 dark:border-brand-dark-border">
              {getPortalIcon()}
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-blue-700 dark:text-brand-blue-300 bg-brand-blue-50 dark:bg-brand-blue-950/60 px-2 py-0.5 rounded-md border border-brand-blue-200 dark:border-brand-blue-800/60">
                {portalConfig.badge}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-brand-dark-heading mt-1">
                {portalTitle} Login
              </h2>
              <p className="text-xs text-slate-500 dark:text-brand-dark-muted mt-0.5">
                {portalDesc}
              </p>
            </div>
          </div>

          {/* Global Error Alert */}
          {error && (
            <div className="mb-4">
              <ErrorAlert
                type="error"
                title="Login Error"
                message={error}
                onDismiss={clearError}
              />
            </div>
          )}

          {/* Success Banner */}
          {isSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-xl text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span>{t.loginSuccess}</span>
            </div>
          )}

          {/* Dedicated Login Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            
            {/* Identifier Field */}
            <div>
              <label htmlFor="portal-id" className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {identifierLabel} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <User className="w-4 h-4" aria-hidden="true" />
                </div>
                <input
                  id="portal-id"
                  name="identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (fieldErrors.identifier) {
                      setFieldErrors({ ...fieldErrors, identifier: undefined });
                    }
                  }}
                  disabled={isLoading || isSuccess}
                  required
                  placeholder={portalConfig.identifierPlaceholder}
                  autoComplete="username"
                  className={`w-full pl-10 pr-4 py-2.5 bg-white dark:bg-brand-dark-bg border rounded-xl text-slate-900 dark:text-brand-dark-heading placeholder-slate-400 dark:placeholder-slate-500 text-sm transition-colors shadow-xs focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-brand-dark-surface ${
                    fieldErrors.identifier
                      ? 'border-rose-400 focus:ring-rose-400 dark:border-rose-500/70'
                      : 'border-slate-300 dark:border-brand-dark-border hover:border-slate-400 dark:hover:border-slate-600 focus:border-brand-blue-600 dark:focus:border-brand-blue-400 focus:ring-brand-blue-500 dark:focus:ring-brand-blue-400'
                  } ${isLoading || isSuccess ? 'bg-slate-100 dark:bg-slate-900 cursor-not-allowed' : ''}`}
                />
              </div>
              {fieldErrors.identifier && (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">
                  {fieldErrors.identifier}
                </p>
              )}
            </div>

            {/* Facility / Store / Dept Code */}
            <div>
              <label htmlFor="facility-code" className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {codeLabel} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Building className="w-4 h-4" aria-hidden="true" />
                </div>
                <input
                  id="facility-code"
                  name="facilityCode"
                  type="text"
                  value={facilityCode}
                  onChange={(e) => {
                    setFacilityCode(e.target.value.toUpperCase());
                    if (fieldErrors.facilityCode) {
                      setFieldErrors({ ...fieldErrors, facilityCode: undefined });
                    }
                  }}
                  disabled={isLoading || isSuccess}
                  required
                  placeholder={portalConfig.codePlaceholder}
                  autoComplete="organization"
                  className={`w-full pl-10 pr-4 py-2.5 bg-white dark:bg-brand-dark-bg border rounded-xl text-slate-900 dark:text-brand-dark-heading placeholder-slate-400 dark:placeholder-slate-500 text-sm uppercase font-mono transition-colors shadow-xs focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-brand-dark-surface ${
                    fieldErrors.facilityCode
                      ? 'border-rose-400 focus:ring-rose-400 dark:border-rose-500/70'
                      : 'border-slate-300 dark:border-brand-dark-border hover:border-slate-400 dark:hover:border-slate-600 focus:border-brand-blue-600 dark:focus:border-brand-blue-400 focus:ring-brand-blue-500 dark:focus:ring-brand-blue-400'
                  } ${isLoading || isSuccess ? 'bg-slate-100 dark:bg-slate-900 cursor-not-allowed' : ''}`}
                />
              </div>
              {fieldErrors.facilityCode && (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">
                  {fieldErrors.facilityCode}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="portal-pass" className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.passwordLabel} <span className="text-rose-500">*</span>
              </label>
              <PasswordInput
                id="portal-pass"
                name="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) {
                    setFieldErrors({ ...fieldErrors, password: undefined });
                  }
                }}
                disabled={isLoading || isSuccess}
                required
                error={fieldErrors.password}
              />
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1 text-xs sm:text-sm">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading || isSuccess}
                  className="w-4 h-4 rounded border-slate-300 dark:border-brand-dark-border text-brand-blue-600 focus:ring-brand-blue-500 bg-white dark:bg-brand-dark-bg"
                />
                <span className="text-slate-600 dark:text-slate-300 font-medium">{t.rememberMe}</span>
              </label>
            </div>

            {/* Login Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className={`w-full py-3 px-4 rounded-xl text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition-all ${
                isLoading || isSuccess
                  ? 'bg-brand-blue-400 dark:bg-brand-blue-600/50 cursor-not-allowed'
                  : 'bg-brand-blue-600 hover:bg-brand-blue-700 dark:bg-brand-blue-500 dark:hover:bg-brand-blue-400 dark:text-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:ring-offset-2 dark:focus:ring-offset-brand-dark-surface'
              }`}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>{t.loggingInBtn}</span>
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>{t.loginSuccess}</span>
                </>
              ) : (
                <>
                  <span>{t.secureLoginBtn}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          {/* Quick Demo Credentials Button for this role */}
          {demoAccount && (
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-brand-dark-border/80">
              <button
                type="button"
                onClick={handleFillDemo}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-brand-dark-elevated hover:bg-slate-100 dark:hover:bg-brand-dark-border/40 border border-slate-200 dark:border-brand-dark-border transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-brand-blue-600 dark:text-brand-blue-400 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-brand-dark-heading block">
                      Auto-fill Demo Credentials
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-brand-dark-muted">
                      {demoAccount.identifier} | {demoAccount.facilityCode}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-brand-blue-600 dark:text-brand-blue-400">
                  Click to Fill
                </span>
              </button>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white/80 dark:bg-brand-dark-surface/80 backdrop-blur-sm border-t border-slate-200 dark:border-brand-dark-border py-4 text-center text-xs text-slate-500 dark:text-brand-dark-muted z-10">
        <p>© 2024 SwasthyaSetu Maharashtra — Integrated Rural Healthcare Network</p>
      </footer>
    </div>
  );
};
