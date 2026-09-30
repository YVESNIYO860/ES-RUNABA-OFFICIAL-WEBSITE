import React from 'react';
import { Info } from 'lucide-react';

const LoginError = ({ message, className = 'border-red-200 bg-red-50 text-red-800', iconClassName = 'text-red-700' }) => {
  if (!message) return null;
  return (
    <div role="alert" className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm leading-5 ${className}`}>
      <Info size={18} className={`mt-0.5 shrink-0 ${iconClassName}`} />
      <span>{message}</span>
    </div>
  );
};

export default LoginError;
