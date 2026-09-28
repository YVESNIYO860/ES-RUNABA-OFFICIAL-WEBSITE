import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
  return (
    <div className="relative isolate min-h-screen bg-[var(--color-school-light)] transition-colors duration-300 dark:bg-slate-950">
      <div className="relative flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-grow">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
