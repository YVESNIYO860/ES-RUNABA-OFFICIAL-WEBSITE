import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = ({ className = '', compact = false }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className={`group relative flex items-center justify-center rounded-full border transition-all duration-300 ${
        compact
          ? 'w-9 h-9 border-white/15 bg-white/10 text-white hover:bg-white/20 hover:border-school-green/50'
          : 'w-10 h-10 border-slate-200 bg-slate-50 text-slate-600 hover:border-school-blue/40 hover:text-school-blue dark:border-slate-600 dark:bg-slate-800 dark:text-amber-300 dark:hover:border-amber-400/50'
      } ${className}`}
    >
      <Sun
        size={compact ? 16 : 18}
        className={`absolute transition-all duration-300 ${isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`}
      />
      <Moon
        size={compact ? 16 : 18}
        className={`absolute transition-all duration-300 ${isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`}
      />
    </button>
  );
};

export default ThemeToggle;
