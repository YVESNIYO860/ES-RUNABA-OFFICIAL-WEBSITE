import React, { useEffect, useRef, useState } from 'react';
import { Languages, ChevronDown, Check } from 'lucide-react';
import { applySiteLanguage, getSavedLanguage } from '../utils/translate';

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'fr', label: 'French', native: 'Français' },
  { code: 'rw', label: 'Kinyarwanda', native: 'Ikinyarwanda' },
  { code: 'sw', label: 'Swahili', native: 'Kiswahili' },
];

const LanguageSelector = ({
  className = '',
  compact = false,
  iconOnly = false,
  onDark = false,
  fullWidth = false,
  dropdownAlign = 'right',
}) => {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState('en');
  const [busy, setBusy] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    setCurrent(getSavedLanguage());
  }, []);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const pickLanguage = async (code) => {
    if (busy || code === current) {
      setOpen(false);
      return;
    }
    setBusy(true);
    setOpen(false);
    await applySiteLanguage(code);
  };

  const currentLang = LANGUAGES.find((l) => l.code === current) || LANGUAGES[0];

  const dropdownPosition =
    dropdownAlign === 'left'
      ? 'left-0 right-0 sm:left-0 sm:right-auto sm:min-w-[11rem]'
      : 'right-0 left-auto min-w-[11rem] max-w-[calc(100vw-2rem)]';

  return (
      <div ref={ref} className={`relative ${fullWidth ? 'w-full' : ''} ${className}`}>
        <button
          type="button"
          onClick={() => !busy && setOpen(!open)}
          disabled={busy}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={`Language: ${currentLang.native}. Choose to translate the whole page.`}
          title="Translate entire page"
          className={`flex items-center justify-center gap-1.5 rounded-full border font-bold transition-all duration-300 disabled:opacity-60 ${
            fullWidth
              ? 'w-full h-10 px-3 text-[11px] border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200'
              : iconOnly
                ? onDark
                  ? 'w-9 h-9 border-white/15 bg-white/10 text-white hover:bg-white/20'
                  : 'w-9 h-9 border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200'
                : compact
                  ? 'h-9 px-2.5 text-[10px] border-white/15 bg-white/10 text-white hover:bg-white/20'
                  : 'h-10 px-3 text-[10px] border-slate-200 bg-slate-50 text-slate-600 hover:border-school-blue/40 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200'
          }`}
        >
          <Languages size={iconOnly ? 16 : compact ? 14 : 16} className="text-school-green shrink-0" />
          {!iconOnly && (
            <>
              <span className="truncate normal-case tracking-normal font-semibold text-[11px]">
                {busy ? '…' : currentLang.code.toUpperCase()}
              </span>
              <ChevronDown
                size={14}
                className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
              />
            </>
          )}
        </button>

        {open && (
          <ul
            role="listbox"
            className={`absolute top-full mt-2 py-1.5 rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 z-[200] dark:bg-slate-800 dark:border-slate-600 ${dropdownPosition}`}
          >
            <li className="px-4 py-2 text-[10px] text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-700 mb-1">
              Translates the whole page
            </li>
            {LANGUAGES.map((lang) => (
              <li key={lang.code} role="option" aria-selected={current === lang.code}>
                <button
                  type="button"
                  onClick={() => pickLanguage(lang.code)}
                  disabled={busy}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                    current === lang.code
                      ? 'bg-school-blue/10 text-school-blue dark:bg-school-green/20 dark:text-school-green'
                      : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <span className="min-w-0">
                    <span className="font-bold block truncate">{lang.native}</span>
                    <span className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      {lang.label}
                    </span>
                  </span>
                  {current === lang.code && <Check size={16} className="text-school-green shrink-0" />}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
  );
};

export default LanguageSelector;
