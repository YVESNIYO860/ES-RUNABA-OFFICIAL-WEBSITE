import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const formatRemaining = (totalSeconds) => {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = String(safeSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
};

/* Shown one minute before the 20 minute inactivity limit, so the user gets a
   chance to stay signed in before the automatic sign-out fires. */
const SessionTimeoutNotice = () => {
  const { sessionWarning, sessionDeadline, staySignedIn } = useAuth();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!sessionWarning) return undefined;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [sessionWarning]);

  if (!sessionWarning) return null;

  const remainingSeconds = sessionDeadline ? Math.max(0, Math.round((sessionDeadline - now) / 1000)) : 60;

  return (
    <div
      role="alert"
      className="fixed inset-x-0 bottom-0 z-[300] border-t-4 border-amber-500 bg-white px-4 py-4 shadow-2xl sm:bottom-4 sm:left-1/2 sm:right-auto sm:w-[28rem] sm:-translate-x-1/2 sm:rounded-lg sm:border-l-4 sm:border-t-0"
    >
      <div className="flex items-start gap-3">
        <Clock size={20} className="mt-0.5 shrink-0 text-amber-600" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-bold text-slate-900">Your session is about to end</p>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-black tabular-nums text-amber-800">
              {formatRemaining(remainingSeconds)}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            For your security the portal signs you out after 20 minutes without activity. Move the
            mouse, press any key, or use the button below to keep working.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={staySignedIn}
        className="mt-3 w-full rounded bg-amber-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-amber-600"
      >
        Stay signed in
      </button>
    </div>
  );
};

export default SessionTimeoutNotice;
