import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, User, ArrowRight, AlertCircle, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SchoolLoader from '../components/SchoolLoader';

const TeacherLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { loginTeacher, siteContent } = useAuth();
  const navigate = useNavigate();
  const branding = siteContent?.general || { schoolName: "ES RUNABA", motto: "ORA PRO NOBIS", logo: "/runaba-logo.png" };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      const result = loginTeacher(username, password);
      if (result.success) {
        navigate('/teacher-dashboard');
      } else {
        setError(result.error);
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {isLoading && <SchoolLoader />}
      
      {/* Left Panel - Admin Branding */}
      <div className="hidden md:flex md:w-1/2 bg-school-blue flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Background image */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20" 
          style={{ backgroundImage: "url('/slide_classroom.png')" }}
        ></div>
        <div className="absolute inset-0 bg-school-blue/80"></div>

        <div className="relative z-10 text-center">
          <div className="w-24 h-24 bg-school-green rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl border-4 border-white/20">
            <GraduationCap size={48} className="text-white" />
          </div>

          <h1 className="text-4xl font-black text-white mb-3 tracking-tight uppercase">{branding.schoolName}</h1>
          <p className="text-white/70 text-lg font-medium italic mb-2">{branding.motto}</p>
          <div className="w-16 h-1 bg-school-green mx-auto mb-8"></div>
          
          <p className="text-white/60 text-sm leading-relaxed max-w-xs">
            Welcome to the {branding.schoolName} E-Learning Portal. This access is reserved for authorized school administrators and staff.
          </p>

          <div className="mt-12 grid grid-cols-3 gap-4 text-center">
            {[
              { label: 'Founded', value: '2003' },
              { label: 'Pass Rate', value: '99%' },
              { label: 'Leaders', value: '3' },
            ].map((stat, i) => (
              <div key={i} className="bg-white/10 rounded-xl p-3 border border-white/10">
                <p className="text-school-green font-black text-xl">{stat.value}</p>
                <p className="text-white/60 text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full md:w-1/2 min-h-screen flex items-center justify-center bg-slate-50 px-4 sm:px-6 py-12 md:py-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm sm:max-w-md"
        >
          {/* Mobile header */}
          <div className="md:hidden text-center mb-8">
            <div className="w-20 h-20 bg-school-blue rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <GraduationCap size={40} className="text-white" />
            </div>
            <h1 className="text-2xl font-black text-school-blue uppercase tracking-tight">{branding.schoolName}</h1>
            <p className="text-school-green font-bold text-xs tracking-widest uppercase mt-1">{branding.motto}</p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800">E-Learning Portal</h2>
            <p className="text-slate-500 mt-2 text-sm sm:text-base">Sign in to manage site content or access staff features</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-3 border border-red-200"
              >
                <AlertCircle size={18} />
                {error}
              </motion.div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-white border-2 border-slate-200 text-slate-800 focus:border-school-blue focus:ring-0 outline-none transition-all placeholder:text-slate-300 text-base"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" 
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-white border-2 border-slate-200 text-slate-800 focus:border-school-blue focus:ring-0 outline-none transition-all placeholder:text-slate-300 text-base"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-school-blue hover:bg-[#0a192f] text-white font-bold py-4 rounded-xl mt-2 flex items-center justify-center gap-2 transition-all disabled:opacity-60 group text-base shadow-lg shadow-school-blue/20 active:scale-95 touch-manipulation"
            >
              Sign In
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="mt-4 p-3 bg-slate-100 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
              <span className="font-bold text-slate-600">Demo:</span> username: <code className="bg-white px-1 py-0.5 rounded border">teacher</code> / password: <code className="bg-white px-1 py-0.5 rounded border">runaba2024</code>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default TeacherLogin;
