import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

const PasswordField = ({
  id = 'login-password',
  label = 'Password',
  value,
  onChange,
  placeholder = 'Password',
  labelClassName = '',
  inputClassName = '',
  iconClassName = 'text-slate-400'
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className={labelClassName}>{label}</label>
      <div className="relative">
        <Lock className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${iconClassName}`} size={18} />
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          required
          autoComplete="current-password"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full pl-10 pr-10 ${inputClassName}`}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className={`absolute right-4 top-1/2 -translate-y-1/2 transition hover:opacity-70 ${iconClassName}`}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
};

export default PasswordField;
