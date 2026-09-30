import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Layers, User } from 'lucide-react';
import LoginError from './LoginError';
import PasswordField from './PasswordField';
import StudentScene from './scenes/StudentScene';
import LoginIllustration from './LoginIllustration';
import { buttonBlue, buttonClass, cardClass, fieldClass, labelClass, portalFont } from './loginTheme';

const inputBase = `${fieldClass} pl-10`;

const StudentLoginView = ({
  branding,
  classGroups,
  selectedClass,
  onSelectedClassChange,
  username,
  onUsernameChange,
  password,
  onPasswordChange,
  error,
  isLoading,
  onSubmit
}) => (
  <div className="relative overflow-hidden bg-slate-100" style={{ fontFamily: portalFont }}>
    <div className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-school-blue/10 blur-3xl" />
    <div className="pointer-events-none absolute -right-20 top-40 h-72 w-72 rounded-full bg-school-green/10 blur-3xl" />

    <div className="relative mx-auto w-full max-w-md px-4 py-8 sm:px-6 sm:py-12 lg:max-w-5xl lg:py-14">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-12">
        <LoginIllustration src="/login-student.jpg" alt="Students learning together in a computer classroom" title="Learn at your own pace" subtitle="Lessons, assignments and quizzes for every class." />
        <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`${cardClass} p-6 sm:p-8`}
      >
        <h2 className="text-center text-2xl font-bold text-slate-900">{branding.schoolName}</h2>
        <p className="mt-1 text-center text-sm text-slate-500">Student sign in</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {error && <LoginError message={error} />}

          <div>
            <label htmlFor="student-class" className={labelClass}>Class</label>
            <div className="relative mt-1">
              <Layers className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select
                id="student-class"
                required
                value={selectedClass}
                onChange={(event) => onSelectedClassChange(event.target.value)}
                className={`${inputBase} appearance-none pr-10 font-semibold`}
              >
                <option value="">Select your class</option>
                {classGroups.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.options.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="student-identifier" className={labelClass}>Registration number</label>
            <div className="relative mt-1">
              <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                id="student-identifier"
                type="text"
                required
                autoComplete="off"
                value={username}
                onChange={(event) => onUsernameChange(event.target.value)}
                placeholder="Registration number"
                className={inputBase}
              />
            </div>
          </div>

          <PasswordField
            id="student-password"
            label="Password"
            labelClassName={labelClass}
            inputClassName={inputBase}
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            placeholder="Password"
          />

          <button
            type="submit"
            disabled={isLoading}
            className={`${buttonClass} ${buttonBlue} mt-1 py-2.5`}
          >
            Sign in
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </button>
        </form>
      </motion.div>
        </div>
      </div>

      {/* Animation stage — students reading and drifting past */}
      <div className="relative h-36 w-full overflow-hidden border-t border-slate-200 bg-slate-200/60 sm:h-52">
        <StudentScene />
      </div>
    </div>
  </div>
);

export default StudentLoginView;
