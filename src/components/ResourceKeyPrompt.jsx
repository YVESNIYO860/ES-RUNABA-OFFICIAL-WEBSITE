import React, { useState } from 'react';
import { KeyRound, X } from 'lucide-react';

const ResourceKeyPrompt = ({ title, error, isVerifying = false, onCancel, onSubmit }) => {
  const [code, setCode] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(code);
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-950/60 px-4 py-6" role="presentation">
      <section role="dialog" aria-modal="true" aria-labelledby="resource-key-title" className="w-full max-w-md border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-school-green/10 text-school-green"><KeyRound size={20} /></span>
            <h2 id="resource-key-title" className="mt-4 text-xl font-bold text-slate-900">Enter enrollment key</h2>
            <p className="mt-1 text-sm text-slate-600">Your teacher requires an enrollment key to open <strong>{title}</strong>.</p>
          </div>
          <button type="button" onClick={onCancel} aria-label="Close access key prompt" className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <label htmlFor="resource-access-key" className="block text-sm font-semibold text-slate-700">Enrollment key</label>
          <input id="resource-access-key" autoFocus autoComplete="off" required value={code} onChange={event => setCode(event.target.value)} placeholder="RUN-XXXX-XXXX-..." className="w-full rounded-md border border-slate-300 px-3 py-2.5 font-mono uppercase tracking-wider focus:border-school-blue focus:outline-none focus:ring-2 focus:ring-school-blue/20" />
          {error && <p role="alert" className="text-sm font-medium text-red-700">{error}</p>}
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onCancel} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={isVerifying || !code.trim()} className="inline-flex items-center justify-center gap-2 rounded-md bg-school-blue px-4 py-2 text-sm font-bold text-white hover:bg-school-blue-dark disabled:cursor-not-allowed disabled:opacity-50">
              {isVerifying ? 'Checking...' : 'Open resource'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default ResourceKeyPrompt;