import React from 'react';
import ThemeToggle from './ThemeToggle';
import LanguageSelector from './LanguageSelector';

/**
 * @param {'top' | 'main' | 'mobile' | 'drawer'} variant
 * - top: dark top bar (desktop)
 * - main: pill group in desktop nav
 * - mobile: icon-only for narrow header bar
 * - drawer: full-width row inside mobile menu
 */
const HeaderUtilities = ({ variant = 'main' }) => {
  if (variant === 'top') {
    return (
      <div className="flex items-center gap-1.5 shrink-0">
        <LanguageSelector compact iconOnly={false} dropdownAlign="right" />
        <div className="w-px h-5 bg-white/20" />
        <ThemeToggle compact />
      </div>
    );
  }

  if (variant === 'mobile') {
    return (
      <div className="flex items-center gap-1 shrink-0">
        <LanguageSelector compact iconOnly onDark dropdownAlign="right" />
        <ThemeToggle compact />
      </div>
    );
  }

  if (variant === 'drawer') {
    return (
      <div className="grid grid-cols-2 gap-3 w-full">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">
            Language
          </span>
          <LanguageSelector fullWidth dropdownAlign="left" />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">
            Theme
          </span>
          <div className="flex items-center gap-2 h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800">
            <ThemeToggle className="!w-9 !h-9 shrink-0" />
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Light / Dark</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center gap-1.5 p-1 rounded-full border border-slate-200/80 bg-slate-50/80 dark:border-slate-600 dark:bg-slate-800/80 shrink-0">
      <LanguageSelector dropdownAlign="right" />
      <div className="w-px h-5 bg-slate-200 dark:bg-slate-600" />
      <ThemeToggle />
    </div>
  );
};

export default HeaderUtilities;
