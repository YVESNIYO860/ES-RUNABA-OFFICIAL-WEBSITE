import React from 'react';
import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Elearning = () => {
  const { siteContent } = useAuth();
  const branding = siteContent?.general || { schoolName: 'ES RUNABA' };

  const openPortal = () => {
    window.open('/elearning-portal', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,_#f8fbff_0%,_#eef4ff_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-4xl items-center">
        <div className="w-full rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_-20px_rgba(0,51,102,0.25)] sm:p-10 lg:p-12">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-school-blue text-white shadow-lg">
              <BookOpen size={28} />
            </div>
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.35em] text-school-green">ES RUNABA E-Learning</p>
            <h1 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
              Welcome to the {branding.schoolName} Learning Hub
            </h1>
            <p className="mx-auto mt-4 text-base leading-7 text-slate-600">
              This is the official {branding.schoolName} e-learning section designed for students and teachers to access lessons, class resources, and academic support in a simple school portal experience.
            </p>
          </div>

          <div className="mx-auto mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={openPortal}
              className="rounded-full bg-school-blue px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Enter the ES RUNABA Learning Portal
            </button>
            <Link
              to="/about"
              className="rounded-full border border-slate-300 bg-slate-50 px-6 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-school-blue hover:text-school-blue"
            >
              Back to School Overview
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Elearning;
