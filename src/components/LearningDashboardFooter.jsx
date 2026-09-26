import React from 'react';
import { LogOut } from 'lucide-react';

const roleLabels = {
  student: 'Student',
  teacher: 'Teacher',
  dos: 'Director of Studies'
};

const LearningDashboardFooter = ({ user, onLogout }) => {
  const displayName = user.fullName || user.name || user.email || 'User';
  const roleLabel = roleLabels[user.role] || 'Portal user';
  const classLabel = user.role === 'student' && user.class ? ` · ${user.class}` : '';

  return (
    <footer className="border-t border-slate-200 bg-white px-4 py-4 sm:px-6 md:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">Hello, {displayName}</p>
          <p className="mt-1 truncate text-xs text-slate-500">{roleLabel}{classLabel} · ES RUNABA E-Learning</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm">
          <a href="/" className="font-medium text-school-blue hover:text-school-green">School website</a>
          <a href="/contact" className="font-medium text-school-blue hover:text-school-green">Contact</a>
          <button type="button" onClick={onLogout} className="inline-flex items-center gap-2 font-semibold text-slate-600 hover:text-red-600">
            <LogOut size={16} aria-hidden="true" />
            Sign out
          </button>
        </div>
      </div>
    </footer>
  );
};

export default LearningDashboardFooter;
