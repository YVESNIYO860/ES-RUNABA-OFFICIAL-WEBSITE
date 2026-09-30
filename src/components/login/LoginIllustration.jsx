import React from 'react';

/* Role illustration shown beside the sign-in card.
   Moodle's login splits into two columns on wide screens, so the artwork is
   only rendered from the `lg` breakpoint up and is hidden on phones/tablets. */
const LoginIllustration = ({ src, alt, title, subtitle }) => (
  <div className="hidden lg:flex lg:flex-col lg:items-center lg:justify-center lg:gap-4">
    <div className="w-full max-w-md overflow-hidden rounded border border-slate-300 bg-white shadow-[0_.5rem_1rem_rgba(0,0,0,.15)]">
      <img src={src} alt={alt} className="block h-auto w-full" loading="lazy" />
      <div className="border-t border-slate-200 px-6 py-5 text-center">
        <p className="text-xl font-bold text-school-blue">{title}</p>
        <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
      </div>
    </div>
  </div>
);

export default LoginIllustration;
