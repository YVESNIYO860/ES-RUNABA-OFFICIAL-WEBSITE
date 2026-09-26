import React, { useState } from 'react';
import { BookOpen, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eLearningClassGroups } from '../utils/schoolClasses';

const ElearningPortal = () => {
  const { siteContent } = useAuth();
  const branding = siteContent?.general || { schoolName: 'ES RUNABA' };
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const activeClassGroup = eLearningClassGroups.find((group) => group.label === selectedGroup);
  const navigate = useNavigate();

  const handleContinue = () => {
    if (!activeClassGroup || !selectedClass) return;
    navigate('/student-login', {
      state: { selectedClass, categoryTitle: selectedClass },
    });
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,_#f8fbff_0%,_#eef4ff_100%)]">
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_-20px_rgba(0,51,102,0.25)] sm:p-8 lg:p-12">
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

          <div className="mx-auto mt-8 w-full max-w-3xl rounded-xl border border-slate-200 bg-slate-50 p-4 sm:mt-10 sm:p-6">
            <div className="mb-5 flex min-w-0 items-start gap-3 text-slate-700">
              <BookOpen size={20} className="mt-0.5 shrink-0 text-school-blue" />
              <div className="min-w-0">
                <p className="text-sm font-semibold uppercase tracking-wide text-school-green">Select your class</p>
                <p className="mt-1 text-sm leading-5 text-slate-600">Choose a year or class group, then select your class or stream.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="min-w-0">
                <label htmlFor="class-group" className="mb-2 block text-sm font-semibold text-slate-700">Year or class group</label>
                <select
                  id="class-group"
                  value={selectedGroup}
                  onChange={(e) => {
                    setSelectedGroup(e.target.value);
                    setSelectedClass('');
                  }}
                  className="w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-800 outline-none transition focus:border-school-blue focus:ring-2 focus:ring-school-blue/20"
                >
                  <option value="">Choose a year or group</option>
                  {eLearningClassGroups.map((group) => (
                    <option key={group.label} value={group.label}>{group.label}</option>
                  ))}
                </select>
              </div>
              <div className="min-w-0">
                <label htmlFor="class-selection" className="mb-2 block text-sm font-semibold text-slate-700">Class or stream</label>
                <select
                  id="class-selection"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  disabled={!activeClassGroup}
                  className="w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-800 outline-none transition focus:border-school-blue focus:ring-2 focus:ring-school-blue/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                >
                  <option value="">{activeClassGroup ? 'Choose a class or stream' : 'Choose a group first'}</option>
                  {activeClassGroup?.options.map((classOption) => (
                    <option key={classOption.value} value={classOption.value}>{classOption.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-6 flex w-full max-w-3xl flex-col justify-center gap-3 sm:mt-8 sm:flex-row">
            <button
              type="button"
              onClick={handleContinue}
              disabled={!activeClassGroup || !selectedClass}
              className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition sm:w-auto ${activeClassGroup && selectedClass ? 'bg-school-blue hover:bg-blue-700' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}
            >
              Continue to the learning access page
              <ArrowRight size={18} />
            </button>
            <Link
              to="/"
              className="w-full rounded-full border border-slate-300 bg-slate-50 px-6 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-school-blue hover:text-school-blue sm:w-auto"
            >
              Return to home
            </Link>
          </div>
          <div className="mx-auto mt-6 flex w-full max-w-3xl flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-semibold">
            <Link to="/teacher-login" className="text-school-blue hover:text-school-green">Teacher login</Link>
            <Link to="/dos-login" className="text-school-blue hover:text-school-green">Director of Studies login</Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ElearningPortal;
