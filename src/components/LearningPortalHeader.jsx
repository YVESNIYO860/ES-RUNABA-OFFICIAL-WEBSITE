import React from 'react';
import { BookOpen } from 'lucide-react';

const roleLabels = {
  student: 'Student portal',
  teacher: 'Teacher portal',
  dos: 'Director of Studies'
};

const LearningPortalHeader = ({ user }) => (
  <header className="relative z-20 flex min-h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-2 shadow-sm sm:px-6">
    <a href="/" className="flex min-w-0 items-center gap-3" aria-label="ES RUNABA E-Learning home">
      <img src="/runaba-logo.png" alt="ES RUNABA logo" className="h-11 w-11 shrink-0 object-contain" />
      <span className="min-w-0">
        <span className="block truncate text-sm font-black uppercase tracking-[0.08em] text-school-blue sm:text-base">ES RUNABA</span>
        <span className="mt-0.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.16em] text-school-green sm:text-xs"><BookOpen size={12} /> E-Learning System</span>
      </span>
    </a>
    <div className="shrink-0 text-right">
      <p className="text-xs font-semibold text-slate-800 sm:text-sm">{user.fullName || user.name}</p>
      <p className="mt-0.5 text-[10px] font-semibold text-slate-500 sm:text-xs">{roleLabels[user.role] || 'Portal user'}</p>
    </div>
  </header>
);

export default LearningPortalHeader;
