import React from 'react';

const PortalFooter = () => (
  <footer className="border-t border-slate-200 bg-white px-4 py-5 text-center sm:px-6">
    <p className="text-sm text-slate-600">
      © {new Date().getFullYear()} ES Runaba E-Learning Platform. All rights reserved.
    </p>
    <p className="mt-1 text-sm text-slate-500">
      Designed &amp; Developed by{' '}
      <span className="font-semibold text-school-blue">Niyonkuru Yves</span>
    </p>
    <p className="mt-0.5 text-xs text-slate-400">Web Developer • Software Developer</p>
  </footer>
);

export default PortalFooter;
