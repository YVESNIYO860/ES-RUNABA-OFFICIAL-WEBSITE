import React from 'react';
import { LogOut } from 'lucide-react';
import ProfileAvatar from './ProfileAvatar';

const roleLabels = {
  student: 'Student',
  teacher: 'Teacher',
  dos: 'Director of Studies'
};

const LearningDashboardFooter = ({ user, onLogout, onContact }) => {
  const displayName = user.fullName || user.name || roleLabels[user.role] || 'User';
  const roleLabel = roleLabels[user.role] || 'Portal user';
  const classLabel = user.role === 'student' && user.class ? ` · ${user.class}` : '';

  return (
    <footer className="border-t border-slate-200 bg-white px-4 py-4 sm:px-6 md:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <ProfileAvatar user={user} size={40} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">Hello, {displayName}</p>
            <p className="mt-1 truncate text-xs text-slate-500">{roleLabel}{classLabel} · ES RUNABA E-Learning</p>
            <p className="mt-1 text-xs text-slate-400">
              For your security the portal signs you out automatically after 20 minutes without activity.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm">
          <a href="/" className="font-medium text-school-blue hover:text-school-green">School website</a>
          <button type="button" onClick={onContact} className="font-medium text-school-blue hover:text-school-green">Contact</button>
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
