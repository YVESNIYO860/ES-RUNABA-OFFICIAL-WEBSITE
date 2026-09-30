import React from 'react';
import { Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* Shown when the portal session is close to timing out, so the user gets a
   chance to stay signed in before the idle sign-out fires. */
const SessionTimeoutNotice = () => {
  const { sessionWarning, dismissSessionWarning } = useAuth();

  if (!sessionWarning) return null;

  return (
    <div
      role="alert"
      className="fixed inset-x-0 bottom-0 z-[300] border-t-4 border-amber-500 bg-white px-4 py-4 shadow-2xl sm:bottom-4 sm:left-1/2 sm:right-auto sm:w-[26rem] sm:-translate-x-1/2 sm:rounded-lg sm:border-l-4 sm:border-t-0"
    >
      <div className="flex items-start gap-3">
        <Clock size={20} className="mt-0.5 shrink-0 text-amber-600" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="font-bold text-slate-900">Your session is about to end</p>
          <p className="mt-1 text-sm text-slate-600">
            You will be signed out automatically in one minute because of inactivity. Move the mouse or
            press any key to stay signed in.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={dismissSessionWarning}
        className="mt-3 w-full rounded bg-amber-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-amber-600"
      >
        Stay signed in
      </button>
    </div>
  );
};

export default SessionTimeoutNotice;
