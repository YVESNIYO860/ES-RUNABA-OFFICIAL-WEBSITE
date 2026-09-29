import React, { useState } from 'react';
import { KeyRound, PanelsTopLeft, Printer, UserRound } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from './ThemeToggle';
import { isSupabaseConfigured, supabase } from '../supabase';
import { runWithLearningActivity } from '../utils/learningActivity';

const LearningSettings = ({ user, views }) => {
  const { isDark } = useTheme();
  const defaultViewKey = `es_runaba_learning_home_${user.id}`;
  const answerKeyKey = `es_runaba_include_answer_key_${user.id}`;
  const preparationPlaceKey = `es_runaba_exam_preparation_place_${user.id}`;
  const [defaultView, setDefaultView] = useState(() => localStorage.getItem(defaultViewKey) || views[0]?.id || '');
  const [includeAnswerKey, setIncludeAnswerKey] = useState(() => localStorage.getItem(answerKeyKey) === 'true');
  const [preparationPlace, setPreparationPlace] = useState(() => localStorage.getItem(preparationPlaceKey) || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleDefaultViewChange = (event) => {
    const nextView = event.target.value;
    setDefaultView(nextView);
    localStorage.setItem(defaultViewKey, nextView);
  };

  const handleAnswerKeyChange = (event) => {
    const enabled = event.target.checked;
    setIncludeAnswerKey(enabled);
    localStorage.setItem(answerKeyKey, String(enabled));
  };

  const handlePreparationPlaceChange = (event) => {
    const place = event.target.value;
    setPreparationPlace(place);
    localStorage.setItem(preparationPlaceKey, place);
  };

  const handlePasswordUpdate = async (event) => {
    event.preventDefault();
    setPasswordMessage('');
    if (!isSupabaseConfigured) {
      setPasswordMessage('Password changes require an active ES RUNABA account connection.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMessage('Use at least 8 characters for your new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage('The passwords do not match.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await runWithLearningActivity('Updating your account password', async () => {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
      });
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMessage('Password updated successfully.');
    } catch (error) {
      setPasswordMessage(error.message || 'Could not update your password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-10">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-school-green">ES RUNABA E-Learning</p>
        <h2 className="mt-2 text-3xl font-bold text-school-blue">Settings</h2>
        <p className="mt-2 text-sm text-slate-600">Manage your workspace and account preferences.</p>
      </header>

      <section className="border-y border-slate-200 py-6">
        <div className="flex items-start gap-3">
          <PanelsTopLeft className="mt-0.5 text-school-blue" size={20} />
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-slate-900">Workspace</h3>
            <label htmlFor="learning-default-view" className="mt-4 block text-sm font-medium text-slate-700">Open dashboard to</label>
            <select id="learning-default-view" value={defaultView} onChange={handleDefaultViewChange} className="mt-1 w-full max-w-md rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">
              {views.map(view => <option key={view.id} value={view.id}>{view.label}</option>)}
            </select>
            <p className="mt-2 text-xs text-slate-500">This preference is saved on this device for your account.</p>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-3">
          <PanelsTopLeft className="text-school-blue" size={20} />
          <div className="flex-1">
            <h3 className="font-bold text-slate-900">Appearance</h3>
            <p className="mt-1 text-sm text-slate-600">Current mode: {isDark ? 'Dark' : 'Light'}</p>
          </div>
          <ThemeToggle />
        </div>
      </section>

      {['teacher', 'dos'].includes(user.role) && (
        <section className="border-b border-slate-200 pb-6">
          <div className="flex items-start gap-3">
            <Printer className="mt-0.5 text-school-blue" size={20} />
            <div>
              <h3 className="font-bold text-slate-900">Exam printing</h3>
              <label className="mt-3 flex items-start gap-3 text-sm text-slate-700">
                <input type="checkbox" checked={includeAnswerKey} onChange={handleAnswerKeyChange} className="mt-0.5 accent-school-green" />
                <span>Include a separate teacher answer key when printing exams.</span>
              </label>
              <label htmlFor="exam-preparation-place" className="mt-4 block text-sm font-medium text-slate-700">
                Place of examination preparation
                <input id="exam-preparation-place" type="text" value={preparationPlace} onChange={handlePreparationPlaceChange} placeholder="e.g. ES RUNABA Examination Office" className="mt-1 w-full max-w-md rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" />
                <span className="mt-1 block text-xs font-normal text-slate-500">This place is shown on printed exam papers and saved on this device.</span>
              </label>
            </div>
          </div>
        </section>
      )}

      {user.role === 'student' && (
        <section className="border-b border-slate-200 pb-6">
          <div className="flex items-start gap-3">
            <UserRound className="mt-0.5 text-school-blue" size={20} />
            <div>
              <h3 className="font-bold text-slate-900">Student profile</h3>
              <dl className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                <div><dt className="text-slate-500">Name</dt><dd className="font-medium text-slate-800">{user.fullName || user.name}</dd></div>
                <div><dt className="text-slate-500">Class</dt><dd className="font-medium text-slate-800">{user.class || 'Not assigned'}</dd></div>
                <div><dt className="text-slate-500">Registration number</dt><dd className="font-medium text-slate-800">{user.regNumber || 'Not assigned'}</dd></div>
              </dl>
            </div>
          </div>
        </section>
      )}

      <section className="border-b border-slate-200 pb-6">
        <div className="flex items-start gap-3">
          <KeyRound className="mt-0.5 text-school-blue" size={20} />
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-slate-900">Account security</h3>
            <form onSubmit={handlePasswordUpdate} className="mt-4 max-w-md space-y-3">
              <label className="block text-sm font-medium text-slate-700">
                New password
                <input required minLength={8} type="password" autoComplete="new-password" value={newPassword} onChange={event => setNewPassword(event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Confirm new password
                <input required minLength={8} type="password" autoComplete="new-password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
              </label>
              {passwordMessage && <p role="status" className="text-sm text-slate-600">{passwordMessage}</p>}
              <button type="submit" disabled={isUpdatingPassword || !isSupabaseConfigured} className="btn-primary disabled:cursor-not-allowed disabled:opacity-50">
                {isUpdatingPassword ? 'Updating...' : 'Update password'}
              </button>
              {!isSupabaseConfigured && <p className="text-xs text-slate-500">Password updates are unavailable in demo mode.</p>}
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LearningSettings;