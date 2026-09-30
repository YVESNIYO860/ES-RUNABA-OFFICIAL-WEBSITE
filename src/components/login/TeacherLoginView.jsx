import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Mail } from 'lucide-react';
import LoginError from './LoginError';
import PasswordField from './PasswordField';
import TeacherScene from './scenes/TeacherScene';
import LoginIllustration from './LoginIllustration';
import { buttonClass, buttonGreen, cardClass, fieldClass, labelClass, portalFont } from './loginTheme';

const inputBase = `${fieldClass} pl-10`;

const TeacherLoginView = ({ branding, username, onUsernameChange, password, onPasswordChange, error, isLoading, onSubmit }) => (
  <div className="relative overflow-hidden bg-slate-100" style={{ fontFamily: portalFont }}>
    <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-school-green/10 blur-3xl" />
    <div className="pointer-events-none absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-school-blue/10 blur-3xl" />

    <div className="relative mx-auto w-full max-w-md px-4 py-8 sm:px-6 sm:py-12 lg:max-w-5xl lg:py-14">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-12">
        <LoginIllustration src="/login-teacher.jpg" alt="A teacher instructing pupils at a classroom chalkboard" title="Teach with confidence" subtitle="Manage your classes, lessons and student progress." />
        <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`${cardClass} p-6 sm:p-8`}
      >
        <h2 className="text-center text-2xl font-bold text-slate-900">{branding.schoolName}</h2>
        <p className="mt-1 text-center text-sm text-slate-500">Teacher sign in</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {error && <LoginError message={error} />}

          <div>
            <label htmlFor="teacher-identifier" className={labelClass}>Email or username</label>
            <div className="relative mt-1">
              <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                id="teacher-identifier"
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(event) => onUsernameChange(event.target.value)}
                placeholder="Email or username"
                className={inputBase}
              />
            </div>
          </div>

          <PasswordField
            id="teacher-password"
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

      {/* Animation stage — teacher at the chalkboard */}
      <div className="relative h-44 w-full overflow-hidden border-t border-slate-200 bg-slate-200/60 sm:h-64">
        <TeacherScene />
      </div>
    </div>
  </div>
);

export default TeacherLoginView;
