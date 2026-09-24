import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, BookOpen, Lock, User } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SchoolLoader from '../components/SchoolLoader';

const classGroups = [
  { label: 'Senior 1', options: ['Senior 1'] },
  { label: 'Senior 2', options: ['Senior 2'] },
  { label: 'Senior 3', options: ['Senior 3'] },
  { label: 'Senior 4 Science Streams', options: ['Senior 4 Science Stream One', 'Senior 4 Science Stream Two'] },
  { label: 'Senior 5 Science Streams', options: ['Senior 5 Science Stream One', 'Senior 5 Science Stream Two'] },
  { label: 'Senior 6 Science Streams', options: ['Senior 6 MEG', 'Senior 6 MCE', 'Senior 6 PCB'] },
];

const TeacherLogin = () => {
  const location = useLocation();
  const initialClass = location.state?.selectedClass || '';
  const [role, setRole] = useState('teacher');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedClass, setSelectedClass] = useState(initialClass);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { loginTeacher, loginStudent, buildStudentPassword, siteContent } = useAuth();
  const navigate = useNavigate();
  const branding = siteContent?.general || { schoolName: 'ES RUNABA', motto: "HUMILITY, UNITY, GOD'S LOVE" };
  const generatedPassword = role === 'student' && username.trim() && selectedClass
    ? buildStudentPassword(selectedClass, username.trim())
    : '';

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (role === 'student' && !selectedClass) {
      setError('Please select your class before signing in.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const result = role === 'teacher'
        ? loginTeacher(username.trim(), password)
        : loginStudent(username.trim(), generatedPassword, selectedClass);

      if (result.success) {
        navigate(role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard');
      } else {
        setError(result.error);
      }
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f3f7ff] px-4 py-10 sm:px-6 sm:py-14">
      {isLoading && <SchoolLoader />}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_35%)]" />
      <div className="pointer-events-none absolute left-[-6rem] top-32 h-72 w-72 rounded-full bg-school-blue/20 blur-3xl" />
      <div className="pointer-events-none absolute right-[-6rem] top-1/4 h-72 w-72 rounded-full bg-slate-300/20 blur-3xl" />

      <div className="relative mx-auto w-full max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white/95 shadow-[0_35px_80px_rgba(15,23,42,0.14)] backdrop-blur-xl"
        >
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="bg-school-blue px-8 py-10 text-white sm:px-10 sm:py-12">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white/10 text-white shadow-lg">
                  <BookOpen size={24} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-200">{branding.schoolName}</p>
                  <h2 className="mt-2 text-3xl font-black">E-Learning</h2>
                </div>
              </div>

              <p className="mt-8 max-w-xl text-base leading-7 text-slate-100/90 sm:text-lg">
                Access classroom resources, assignments, and announcements inside a secure student and teacher portal.
              </p>

              <div className="mt-10 space-y-5 rounded-[1.75rem] border border-white/10 bg-white/10 p-5">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-200">Teacher access</p>
                  <p className="mt-2 text-sm text-slate-100/90">Log in with your username and password.</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-200">Student access</p>
                  <p className="mt-2 text-sm text-slate-100/90">Choose your science stream and sign in with your registration number.</p>
                </div>
              </div>
            </div>

            <div className="px-8 py-10 sm:px-10 sm:py-12">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">Secure login</p>
                  <h1 className="mt-2 text-3xl font-black text-slate-900">Sign in</h1>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Portal</span>
              </div>

              {error && (
                <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              <div className="mb-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('teacher')}
                    className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition ${role === 'teacher' ? 'bg-school-blue text-white' : 'bg-white text-slate-700 hover:border-school-blue hover:text-school-blue border border-slate-200'}`}
                  >
                    Teacher
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition ${role === 'student' ? 'bg-school-blue text-white' : 'bg-white text-slate-700 hover:border-school-blue hover:text-school-blue border border-slate-200'}`}
                  >
                    Student
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">{role === 'teacher' ? 'Username' : 'Registration number'}</label>
                  <div className="relative mt-2">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      required
                      autoComplete={role === 'teacher' ? 'username' : 'off'}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={role === 'teacher' ? 'Username' : 'Registration number'}
                      className="w-full rounded-3xl border border-slate-300 bg-white px-12 py-3 text-sm text-slate-900 outline-none transition focus:border-school-blue focus:ring-2 focus:ring-school-blue/20"
                    />
                  </div>
                </div>

                {role === 'student' ? (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Class</label>
                    <div className="mt-2">
                      <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-school-blue focus:ring-2 focus:ring-school-blue/20"
                      >
                        <option value="">Select your class</option>
                        {classGroups.map((group) => (
                          <optgroup key={group.label} label={group.label}>
                            {group.options.map((item) => (
                              <option key={item} value={item}>{item}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Password</label>
                    <div className="relative mt-2">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="password"
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full rounded-3xl border border-slate-300 bg-white px-12 py-3 text-sm text-slate-900 outline-none transition focus:border-school-blue focus:ring-2 focus:ring-school-blue/20"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full rounded-3xl bg-school-blue px-4 py-3 text-sm font-bold uppercase tracking-[0.3em] text-white transition hover:bg-blue-700"
                >
                  Log in
                </button>
              </form>

              {selectedClass && role === 'student' && (
                <div className="mt-6 rounded-2xl border border-school-blue/20 bg-school-blue/5 px-4 py-3 text-sm text-slate-900">
                  Selected Class: <span className="font-semibold">{selectedClass}</span>
                </div>
              )}

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">Demo credentials</p>
                <p className="mt-2">Teacher: <span className="font-semibold">teacher</span> / <span className="font-semibold">runaba2024</span></p>
                <p className="mt-1">Student: <span className="font-semibold">S1@001</span> / <span className="font-semibold">ESR/S1@001</span></p>
              </div>

              <div className="mt-5 flex flex-col gap-3 text-center text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                <Link to="/elearning-portal" className="font-semibold text-school-blue hover:text-blue-700">
                  Back to class selection
                </Link>
                <span className="hidden sm:inline">Secure access for students and teachers.</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TeacherLogin;
