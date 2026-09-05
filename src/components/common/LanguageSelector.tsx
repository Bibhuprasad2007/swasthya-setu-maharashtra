import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { SUPPORTED_LANGUAGES } from '../../constants/translations';
import { Language } from '../../types/lang';

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: Language) => {
    setLanguage(code);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent, code: Language) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect(code);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        id="language-menu-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`Current language: ${currentLangObj.nativeName}. Click to change.`}
        className="inline-flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-brand-dark-text bg-white dark:bg-brand-dark-surface border border-slate-200 dark:border-brand-dark-border rounded-xl shadow-xs hover:bg-slate-50 dark:hover:bg-brand-dark-elevated focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-colors"
      >
        <Globe className="w-4 h-4 text-brand-blue-600 dark:text-brand-blue-400" aria-hidden="true" />
        <span className="font-semibold">{currentLangObj.nativeName}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="language-menu-button"
          className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-xl bg-white dark:bg-brand-dark-elevated shadow-xl ring-1 ring-black/5 dark:ring-white/10 border border-slate-200 dark:border-brand-dark-border py-1.5 focus:outline-none animate-in fade-in zoom-in-95 duration-100"
        >
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = lang.code === language;
            return (
              <button
                key={lang.code}
                role="menuitem"
                tabIndex={0}
                onClick={() => handleSelect(lang.code)}
                onKeyDown={(e) => handleKeyDown(e, lang.code)}
                className={`w-full flex items-center justify-between px-3.5 py-2 text-xs sm:text-sm text-left transition-colors ${
                  isSelected
                    ? 'bg-brand-blue-50 dark:bg-brand-blue-950/60 text-brand-blue-700 dark:text-brand-blue-300 font-semibold'
                    : 'text-slate-700 dark:text-brand-dark-text hover:bg-slate-100 dark:hover:bg-brand-dark-surface'
                }`}
              >
                <div className="flex flex-col">
                  <span>{lang.nativeName}</span>
                  <span className="text-[11px] text-slate-400 dark:text-brand-dark-muted font-normal">{lang.label}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-brand-blue-600 dark:text-brand-blue-400" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
