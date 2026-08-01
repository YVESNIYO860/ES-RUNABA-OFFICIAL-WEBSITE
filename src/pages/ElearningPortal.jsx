import React, { useState } from 'react';
import { BookOpen, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const classOptions = [
  'Senior 1',
  'Senior 2',
  'Senior 3',
  'Senior 4 MEG',
  'Senior 4 MCE',
  'Senior 4 PCB',
  'Senior 5 MEG',
  'Senior 5 MCE',
  'Senior 5 PCB',
  'Senior 6 MEG',
  'Senior 6 MCE',
  'Senior 6 PCB',
];

const ElearningPortal = () => {
  const { siteContent } = useAuth();
  const branding = siteContent?.general || { schoolName: 'ES RUNABA' };
  const [selectedClass, setSelectedClass] = useState('');
  const navigate = useNavigate();

  const handleContinue = () => {
    if (!selectedClass) return;
    navigate('/teacher-login', {
      state: { selectedClass, categoryTitle: selectedClass },
    });
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,_#f8fbff_0%,_#eef4ff_100%)]">
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_-20px_rgba(0,51,102,0.25)] sm:p-10 lg:p-12">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-school-blue text-white shadow-lg">
              <ShieldCheck size={28} />
            </div>
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.35em] text-school-green">ES RUNABA E-Learning</p>
            <h1 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
              A dedicated space for learning at {branding.schoolName}
            </h1>
            <p className="mx-auto mt-4 text-base leading-7 text-slate-600">
              This portal keeps the school experience focused on lessons, classroom resources, and academic support without the regular site navigation.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-2xl rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6 sm:p-8">
            <div className="mb-4 flex items-center gap-3 text-slate-700">
              <BookOpen size={20} className="text-school-blue" />
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-school-green">Select your class</p>
                <p className="text-sm text-slate-600">Choose your class before entering the learning portal.</p>
              </div>
            </div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-school-blue focus:ring-2 focus:ring-school-blue/20"
            >
              <option value="">Select a class to continue</option>
              {classOptions.map((className) => (
                <option key={className} value={className}>{className}</option>
              ))}
            </select>
          </div>

          <div className="mx-auto mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleContinue}
              disabled={!selectedClass}
              className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition ${selectedClass ? 'bg-school-blue hover:bg-blue-700' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}
            >
              Continue to the learning access page
              <ArrowRight size={18} />
            </button>
            <Link
              to="/"
              className="rounded-full border border-slate-300 bg-slate-50 px-6 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-school-blue hover:text-school-blue"
            >
              Return to home
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ElearningPortal;
