import React from 'react';

/* Role illustration shown beside the sign-in card.
   Moodle's login splits into two columns on wide screens, so the artwork is
   only rendered from the `lg` breakpoint up and is hidden on phones/tablets. */
const LoginIllustration = ({ src, alt }) => (
  <div className="hidden lg:flex lg:items-center lg:justify-center">
    <div className="w-full max-w-md overflow-hidden rounded border border-slate-300 bg-white shadow-[0_.5rem_1rem_rgba(0,0,0,.15)]">
      <img src={src} alt={alt} className="block h-auto w-full" loading="lazy" />
    </div>
  </div>
);

export default LoginIllustration;
