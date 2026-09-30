import React from 'react';
import { Award, BookOpen, GraduationCap } from 'lucide-react';

const ROLES = [
  { id: 'student', label: 'Student', icon: GraduationCap, active: 'bg-school-blue text-white shadow-md shadow-school-blue/25' },
  { id: 'teacher', label: 'Teacher', icon: BookOpen, active: 'bg-school-green text-white shadow-md shadow-school-green/25' },
  { id: 'dos', label: 'DOS', icon: Award, active: 'bg-school-blue-dark text-white shadow-md shadow-school-blue-dark/30' }
];

const RoleSwitcher = ({ role, onChange, dark = false }) => (
  <div
    role="tablist"
    aria-label="Choose sign-in type"
    className={`flex flex-wrap gap-1 rounded border p-1 ${dark ? 'border-slate-600 bg-slate-700' : 'border-slate-300 bg-white'}`}
  >
    {ROLES.map(({ id, label, icon: Icon, active }) => (
      <button
        key={id}
        type="button"
        role="tab"
        aria-selected={role === id}
        onClick={() => onChange(id)}
        className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-sm px-2 py-2 text-sm font-medium transition sm:gap-2 sm:px-3 ${
          role === id
            ? active
            : dark
              ? 'text-slate-300 hover:bg-slate-600 hover:text-white'
              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
        }`}
      >
        <Icon size={16} className="shrink-0" />
        <span className="truncate">{label}</span>
      </button>
    ))}
  </div>
);

export default RoleSwitcher;
