import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, KeyRound } from 'lucide-react';
import LoginError from './LoginError';
import PasswordField from './PasswordField';
import DosScene from './scenes/DosScene';
import LoginIllustration from './LoginIllustration';
import { buttonClass, buttonGreen, cardClass, fieldClass, labelClass, portalFont } from './loginTheme';

const inputBase = `${fieldClass} border-slate-600 bg-slate-800 pl-10 text-white placeholder-slate-400 focus:border-school-green focus:ring-school-green/25`;

const DosLoginView = ({ branding, username, onUsernameChange, password, onPasswordChange, error, isLoading, onSubmit }) => (
  <div className="relative overflow-hidden bg-slate-800 px-4 py-8 sm:px-6 sm:py-12" style={{ fontFamily: portalFont }}>
    <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-school-blue/30 blur-3xl" />
    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:44px_44px]" />

    <div className="relative mx-auto w-full max-w-md lg:max-w-5xl">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-12">
        <LoginIllustration src="/login-dos.jpg" alt="A leadership team in an academic planning meeting" />
        <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`${cardClass} p-6 sm:p-8`}
      >
        <h2 className="text-center text-2xl font-bold text-slate-900">{branding.schoolName}</h2>
        <p className="mt-1 text-center text-sm text-slate-500">Director of Studies</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {error && <LoginError message={error} className="border-red-300 bg-red-50 text-red-800" iconClassName="text-red-700" />}

          <div>
            <label htmlFor="dos-identifier" className={labelClass}>Email</label>
            <div className="relative mt-1">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                id="dos-identifier"
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(event) => onUsernameChange(event.target.value)}
                placeholder="Email"
                className={inputBase}
              />
            </div>
          </div>

          <PasswordField
            id="dos-password"
            label="Password"
            labelClassName={labelClass}
            inputClassName={inputBase}
            iconClassName="text-slate-400"
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            placeholder="Password"
          />

          <button
            type="submit"
            disabled={isLoading}
            className={`${buttonClass} ${buttonGreen} mt-1`}
          >
            Sign in
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </button>
        </form>
      </motion.div>
        </div>
      </div>
    </div>

    {/* Animation stage — the leader leading the group forward */}
    <div className="relative mx-auto mt-6 h-44 w-full max-w-md overflow-hidden rounded border border-slate-600 bg-slate-700/60 sm:mt-8 sm:h-60 lg:max-w-5xl">
      <DosScene />
    </div>
  </div>
);

export default DosLoginView;
