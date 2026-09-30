import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SchoolLoader from '../components/SchoolLoader';
import { getELearningClassGroups } from '../utils/schoolClasses';
import { isSupabaseConfigured } from '../supabase';
import { loadSchoolClasses } from '../utils/elearningStore';
import RoleSwitcher from '../components/login/RoleSwitcher';
import StudentLoginView from '../components/login/StudentLoginView';
import TeacherLoginView from '../components/login/TeacherLoginView';
import DosLoginView from '../components/login/DosLoginView';
import PortalFooter from '../components/login/PortalFooter';
import LogoWatermark from '../components/login/LogoWatermark';
import { portalFont } from '../components/login/loginTheme';

const TeacherLogin = ({ initialRole = 'student' }) => {
  const location = useLocation();
  const initialClass = location.state?.selectedClass || '';
  const [role, setRole] = useState(initialRole);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedClass, setSelectedClass] = useState(initialClass);
  const [classNames, setClassNames] = useState(() => getELearningClassGroups().flatMap(group => group.options.map(option => option.value)));
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const errorSoundContext = useRef(null);

  const { loginTeacher, loginDos, loginStudent, siteContent } = useAuth();
  const classGroups = [{ label: 'Classes', options: classNames.map(name => ({ value: name, label: name })) }];
  const navigate = useNavigate();
  const branding = siteContent?.general || { schoolName: 'ES RUNABA', motto: "HUMILITY, UNITY, GOD'S LOVE" };

  const prepareErrorSound = () => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;
      if (!errorSoundContext.current) errorSoundContext.current = new AudioContextClass();
      if (errorSoundContext.current.state === 'suspended') errorSoundContext.current.resume().catch(() => {});
      return errorSoundContext.current;
    } catch {
      return null;
    }
  };

  const showInvalidCredentials = (audioContext) => {
    setError('Invalid credentials. Please check your login details and try again.');
    if (!audioContext) return;
    try {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const startTime = audioContext.currentTime;
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, startTime);
      oscillator.frequency.setValueAtTime(330, startTime + 0.12);
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.07, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.24);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.25);
    } catch {
      // Keep sign-in feedback available even when browser audio is unsupported.
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;
    let isActive = true;
    loadSchoolClasses()
      .then(names => { if (isActive) setClassNames(names); })
      .catch(loadError => console.error('Failed to load registered classes:', loadError));
    return () => { isActive = false; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (role === 'student' && !selectedClass) {
      setError('Please select your class before signing in.');
      return;
    }

    const audioContext = prepareErrorSound();
    setIsLoading(true);
    try {
      const result = role === 'teacher'
        ? await loginTeacher(username.trim(), password)
        : role === 'dos'
          ? await loginDos(username.trim(), password)
          : await loginStudent(username.trim(), password, selectedClass);

      if (result.success) {
        navigate(role === 'student' ? '/student-dashboard' : '/teacher-dashboard');
      } else if (!isSupabaseConfigured) {
        setError('Sign-in is temporarily unavailable. Please try again later.');
      } else {
        showInvalidCredentials(audioContext);
      }
    } catch {
      showInvalidCredentials(audioContext);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = (nextRole) => {
    setRole(nextRole);
    setError('');
  };

  const sharedProps = {
    branding,
    username,
    onUsernameChange: setUsername,
    password,
    onPasswordChange: setPassword,
    error,
    isLoading,
    onSubmit: handleSubmit
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-100" style={{ fontFamily: portalFont }}>
      {isLoading && <SchoolLoader />}

      <LogoWatermark />

      <div className="relative z-10 flex min-h-screen flex-col">
      <div className="relative z-10 mx-auto w-full max-w-md px-4 pt-5 sm:px-6 sm:pt-6">
        <div className="mb-4 flex items-center justify-between gap-2 sm:mb-5 sm:gap-4">
          <Link to="/" className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-white p-1.5 shadow-sm ring-1 ring-slate-300 sm:h-11 sm:w-11">
              <img src="/runaba-logo.png" alt="ES RUNABA logo" className="h-full w-full object-contain" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-base font-bold leading-tight text-school-blue">
                {branding.schoolName}
              </span>
              <span className="mt-0.5 block truncate text-sm leading-tight text-slate-500">
                E-Learning Portal
              </span>
            </span>
          </Link>
          <Link
            to="/"
            className="shrink-0 rounded border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-school-blue hover:text-school-blue sm:px-4"
          >
            <span className="sm:hidden">← Back</span>
            <span className="hidden sm:inline">← Back to website</span>
          </Link>
        </div>

        <RoleSwitcher role={role} onChange={handleRoleChange} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={role}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
        >
          {role === 'student' && (
            <StudentLoginView
              {...sharedProps}
              classGroups={classGroups}
              selectedClass={selectedClass}
              onSelectedClassChange={setSelectedClass}
            />
          )}
          {role === 'teacher' && <TeacherLoginView {...sharedProps} />}
          {role === 'dos' && <DosLoginView {...sharedProps} />}
        </motion.div>
      </AnimatePresence>

        <div className="mt-auto">
          <PortalFooter />
        </div>
      </div>
    </div>
  );
};

export default TeacherLogin;

