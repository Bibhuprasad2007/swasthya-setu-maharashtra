import React, { useState } from 'react';
import { Eye, EyeOff, Lock, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface PasswordInputProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  error?: string;
  autoComplete?: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  name,
  value,
  onChange,
  disabled = false,
  required = true,
  placeholder,
  error,
  autoComplete = 'current-password',
}) => {
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isCapsLockOn, setIsCapsLockOn] = useState<boolean>(false);

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState) {
      setIsCapsLockOn(e.getModifierState('CapsLock'));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState) {
      setIsCapsLockOn(e.getModifierState('CapsLock'));
    }
  };

  return (
    <div className="w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
          <Lock className="w-4 h-4" aria-hidden="true" />
        </div>

        <input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          onKeyUp={handleKeyUp}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          placeholder={placeholder || t.passwordPlaceholder}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : isCapsLockOn ? `${id}-capslock` : undefined}
          className={`w-full pl-10 pr-11 py-2.5 sm:py-3 bg-white dark:bg-brand-dark-bg border rounded-xl text-slate-900 dark:text-brand-dark-heading placeholder-slate-400 dark:placeholder-slate-500 text-sm sm:text-base transition-colors shadow-xs focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-brand-dark-surface ${
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-400 dark:border-rose-500/70'
              : 'border-slate-300 dark:border-brand-dark-border hover:border-slate-400 dark:hover:border-slate-600 focus:border-brand-blue-600 dark:focus:border-brand-blue-400 focus:ring-brand-blue-500 dark:focus:ring-brand-blue-400'
          } ${disabled ? 'bg-slate-100 dark:bg-slate-900 text-slate-400 cursor-not-allowed' : ''}`}
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          disabled={disabled}
          tabIndex={0}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none focus:text-brand-blue-600 dark:focus:text-brand-blue-400 transition-colors"
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4" aria-hidden="true" />
          ) : (
            <Eye className="w-4 h-4" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Caps lock warning */}
      {isCapsLockOn && (
        <div
          id={`${id}-capslock`}
          role="alert"
          className="flex items-center gap-1.5 mt-1.5 text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 px-2.5 py-1 rounded-md animate-in fade-in duration-150"
        >
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <span>{t.capsLockWarning}</span>
        </div>
      )}

      {/* Input Error display */}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};
