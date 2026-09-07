import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Building, ArrowRight, CheckCircle } from 'lucide-react';
import { PORTALS } from '../../constants/portals';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { PasswordInput } from '../common/PasswordInput';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorAlert } from '../common/ErrorAlert';
import { PortalSelector } from './PortalSelector';

export const LoginForm: React.FC = () => {
  const { selectedPortal, setSelectedPortal, login, isLoading, error, clearError } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

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

  const currentPortalConfig = PORTALS[selectedPortal] || PORTALS.hospital;

  // Clear field-specific errors when user modifies fields or changes portal
  useEffect(() => {
    setFieldErrors({});
    clearError();
  }, [selectedPortal]);

  const validateForm = (): boolean => {
    const errors: { identifier?: string; password?: string; facilityCode?: string } = {};
    if (!identifier.trim()) {
      errors.identifier = `${(t as any)[currentPortalConfig.identifierLabelKey]} is required`;
    }
    if (!password) {
      errors.password = `${t.passwordLabel} is required`;
    } else if (password.length < 4) {
      errors.password = 'Password must be at least 4 characters';
    }
    if (!facilityCode.trim()) {
      errors.facilityCode = `${(t as any)[currentPortalConfig.codeLabelKey]} is required`;
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
        portal: selectedPortal,
        rememberMe,
      });

      setIsSuccess(true);

      setTimeout(() => {
        const targetRoute = PORTALS[user.role]?.dashboardRoute || '/hospital/dashboard';
        navigate(targetRoute, { replace: true });
      }, 600);
    } catch {
      // Error handled via AuthContext
    }
  };

  const identifierLabel = (t as any)[currentPortalConfig.identifierLabelKey] || 'Identifier ID';
  const codeLabel = (t as any)[currentPortalConfig.codeLabelKey] || 'Facility Code';

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-card p-5 sm:p-7">
      
      {/* 4 Portal Selection Tabs / Cards */}
      <div className="mb-6">
        <PortalSelector
          selectedPortal={selectedPortal}
          onSelectPortal={setSelectedPortal}
        />
      </div>

      {/* Global Error Alert */}
      {error && (
        <div className="mb-4">
          <ErrorAlert
            type="error"
            title="Login Failed"
            message={error}
            onDismiss={clearError}
          />
        </div>
      )}

      {/* Success Notification */}
      {isSuccess && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs sm:text-sm font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{t.loginSuccess}</span>
        </div>
      )}

      {/* Dynamic 3-Field Login Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        
        {/* Identifier Field */}
        <div>
          <label htmlFor="portal-identifier" className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
            {identifierLabel} <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" aria-hidden="true" />
            </div>
            <input
              id="portal-identifier"
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
              placeholder={currentPortalConfig.identifierPlaceholder}
              autoComplete="username"
              className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl text-slate-900 placeholder-slate-400 text-sm transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                fieldErrors.identifier
                  ? 'border-rose-400 focus:ring-rose-400'
                  : 'border-slate-300 hover:border-slate-400 focus:border-brand-blue-600 focus:ring-brand-blue-500'
              } ${isLoading || isSuccess ? 'bg-slate-100 cursor-not-allowed' : ''}`}
            />
          </div>
          {fieldErrors.identifier && (
            <p className="mt-1 text-xs text-rose-600 font-medium">
              {fieldErrors.identifier}
            </p>
          )}
        </div>

        {/* Facility / Store / Department Code */}
        <div>
          <label htmlFor="facility-code" className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
            {codeLabel} <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
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
              placeholder={currentPortalConfig.codePlaceholder}
              autoComplete="organization"
              className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl text-slate-900 placeholder-slate-400 text-sm uppercase font-mono transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                fieldErrors.facilityCode
                  ? 'border-rose-400 focus:ring-rose-400'
                  : 'border-slate-300 hover:border-slate-400 focus:border-brand-blue-600 focus:ring-brand-blue-500'
              } ${isLoading || isSuccess ? 'bg-slate-100 cursor-not-allowed' : ''}`}
            />
          </div>
          {fieldErrors.facilityCode && (
            <p className="mt-1 text-xs text-rose-600 font-medium">
              {fieldErrors.facilityCode}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="portal-password" className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
            {t.passwordLabel} <span className="text-rose-500">*</span>
          </label>
          <PasswordInput
            id="portal-password"
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

        {/* Remember device checkbox */}
        <div className="flex items-center justify-between pt-1 text-xs sm:text-sm">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoading || isSuccess}
              className="w-4 h-4 rounded border-slate-300 text-brand-blue-600 focus:ring-brand-blue-500"
            />
            <span className="text-slate-600 font-medium">{t.rememberMe}</span>
          </label>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={isLoading || isSuccess}
          className={`w-full py-3 px-4 rounded-xl text-white font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition-all ${
            isLoading || isSuccess
              ? 'bg-brand-blue-400 cursor-not-allowed'
              : 'bg-brand-blue-600 hover:bg-brand-blue-700 focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:ring-offset-2'
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
    </div>
  );
};
