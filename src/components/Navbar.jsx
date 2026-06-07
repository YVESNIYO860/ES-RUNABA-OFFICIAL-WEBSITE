import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Facebook,
  MessageCircle,
  Mail,
  Phone,
  Youtube,
  Search,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import GlobalSearch from './GlobalSearch';
import HeaderUtilities from './HeaderUtilities';
import SchoolBrand from './SchoolBrand';
import AnnouncementMarquee from './AnnouncementMarquee';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [topSearch, setTopSearch] = useState('');
  const [mobileSearch, setMobileSearch] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, siteContent } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Academics', path: '/academics' },
    { name: 'School Life', path: '/student-life' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'News', path: '/news' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const runSearch = (query, closeMenu = false) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setTopSearch('');
      setMobileSearch('');
      if (closeMenu) setIsOpen(false);
    }
  };

  const onTopSearchSubmit = (e) => {
    e.preventDefault();
    runSearch(topSearch);
  };

  const onMobileSearchSubmit = (e) => {
    e.preventDefault();
    runSearch(mobileSearch, true);
  };


  const branding = siteContent?.general || {
    schoolName: 'ES RUNABA',
    motto: 'ORA PRO NOBIS',
    logo: '/runaba-logo.png',
    contact: { email: 'info@esrunaba.edu', phone: '+250 783 883 046' },
    announcement: { text: '', isActive: false },
  };

  const phone = branding.contact?.phone || '+250 783 883 046';
  const email = branding.contact?.email || 'info@esrunaba.edu';

  return (
    <>
      {/* Desktop top bar */}
      <div className="bg-slate-900 text-white/80 py-2 border-b border-white/5 hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center gap-4 text-[11px] font-bold tracking-widest uppercase min-w-0">
          <div className="flex items-center gap-4 lg:gap-6 min-w-0 shrink">
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-2 hover:text-school-green transition-colors truncate max-w-[14rem] xl:max-w-none"
            >
              <Mail size={12} className="text-school-green shrink-0" />
              <span className="truncate">{email}</span>
            </a>
            <div className="w-px h-3 bg-white/20 shrink-0" />
            <a
              href={`tel:${phone.replace(/\s/g, '')}`}
              className="flex items-center gap-2 hover:text-school-green transition-colors whitespace-nowrap shrink-0"
            >
              <Phone size={12} className="text-school-green shrink-0" />
              {phone}
            </a>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <HeaderUtilities variant="top" />
            <div className="w-px h-3 bg-white/20" />
            <form onSubmit={onTopSearchSubmit} className="relative hidden xl:block">
              <input
                type="search"
                value={topSearch}
                onChange={(e) => setTopSearch(e.target.value)}
                placeholder="Search our school..."
                className="bg-white/5 border border-white/10 rounded-full px-4 py-1 w-40 2xl:w-48 text-[10px] text-white focus:outline-none focus:border-school-green/50 focus:bg-white/10 transition-all placeholder:text-white/20 tracking-normal"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-school-green transition-colors"
              >
                <Search size={12} />
              </button>
            </form>
            <div className="w-px h-3 bg-white/20 hidden xl:block" />
            <div className="flex items-center gap-3">
              <span className="text-white/30 hidden 2xl:inline">Connect:</span>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-school-green transition-all hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook size={14} />
              </a>
              <a
                href="https://wa.me/250783883046"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-school-green transition-all hover:scale-110"
                aria-label="WhatsApp"
              >
                <MessageCircle size={14} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-school-green transition-all hover:scale-110"
                aria-label="YouTube"
              >
                <Youtube size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile / tablet slim bar: contact + utilities */}
      <div className="lg:hidden bg-slate-900 text-white/90 py-1.5 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <a
              href={`tel:${phone.replace(/\s/g, '')}`}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-school-green/30 shrink-0"
              aria-label="Call school"
            >
              <Phone size={14} className="text-school-green" />
            </a>
            <a
              href={`mailto:${email}`}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-school-green/30 shrink-0"
              aria-label="Email school"
            >
              <Mail size={14} className="text-school-green" />
            </a>
            <span className="text-[9px] sm:text-[10px] font-bold truncate hidden min-[400px]:inline text-white/70 max-w-[8rem] sm:max-w-[12rem]">
              {phone}
            </span>
          </div>
          <HeaderUtilities variant="mobile" />
        </div>
      </div>

      <AnimatePresence>
        {branding.announcement?.isActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-school-blue text-white overflow-hidden relative z-[60]"
          >
            <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 flex items-center gap-3 min-w-0">
              <div className="bg-school-green text-white text-[9px] sm:text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest shrink-0 border border-white/20 shadow-sm">
                Notice
              </div>
              <AnnouncementMarquee text={branding.announcement?.text} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 shadow-sm dark:shadow-slate-950/50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center gap-2 min-h-[4rem] sm:min-h-[5rem] py-2 sm:py-0">
            {/* Logo — shrinks on small screens */}
            <div className="flex items-center min-w-0 flex-1 sm:flex-initial">
              <Link to="/" className="flex items-center gap-1.5 sm:gap-2 group min-w-0">
                <img
                  src={branding.logo}
                  alt={`${branding.schoolName} Logo`}
                  className="h-9 w-9 sm:h-11 sm:w-11 md:h-14 md:w-auto object-contain shrink-0 group-hover:scale-105 transition-transform"
                />
                <div className="flex flex-col min-w-0">
                  <SchoolBrand
                    name={branding.schoolName}
                    className="font-extrabold text-base sm:text-xl md:text-2xl text-school-blue dark:text-slate-100 leading-none tracking-tight uppercase truncate block"
                  />
                  <span className="text-[8px] sm:text-[10px] text-school-green font-bold tracking-[0.15em] sm:tracking-[0.2em] uppercase mt-0.5 truncate hidden min-[400px]:block">
                    {branding.motto}
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-4 xl:gap-6 shrink-0">
              {!user &&
                navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`nav-link text-xs uppercase tracking-widest font-black transition-all hover:tracking-[0.2em] relative group py-1 whitespace-nowrap ${
                      isActive(link.path) ? 'text-school-blue' : ''
                    }`}
                  >
                    {link.name}
                    <span
                      className={`absolute bottom-0 left-0 w-full h-0.5 bg-school-blue scale-x-0 group-hover:scale-x-100 transition-transform origin-left ${
                        isActive(link.path) ? 'scale-x-100' : ''
                      }`}
                    />
                  </Link>
                ))}

              <div className="flex items-center gap-2 xl:gap-3 pl-3 xl:pl-4 border-l border-slate-200 dark:border-slate-700">
                <HeaderUtilities variant="main" />

                <button
                  type="button"
                  onClick={() => setIsSearchOpen(true)}
                  className={`p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all ${
                    scrolled ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'
                  }`}
                  aria-label="Search"
                >
                  <Search size={20} />
                </button>

                {!user ? (
                  <Link
                    to="/elearning"
                    className="bg-school-blue text-white px-4 xl:px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-school-blue/20 whitespace-nowrap"
                  >
                    E-Learning
                  </Link>
                ) : (
                  <div className="flex items-center gap-3">
                    <Link
                      to={user.role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard'}
                      className="flex items-center gap-2 text-school-blue font-bold hover:text-school-green transition-colors text-sm whitespace-nowrap"
                    >
                      <LayoutDashboard size={18} />
                      {user.isAdmin ? 'Admin' : 'Portal'}
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm font-bold bg-red-50 dark:bg-red-950/50 dark:text-red-400 px-3 py-1.5 rounded-md transition-colors"
                    >
                      <LogOut size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile / tablet: search + menu */}
            <div className="flex lg:hidden items-center gap-0.5 sm:gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center justify-center w-10 h-10 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Search"
              >
                <Search size={22} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
                aria-label={isOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isOpen}
              >
                {isOpen ? <X size={26} /> : <Menu size={26} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu drawer */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="lg:hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden"
            >
              <div className="max-h-[min(75vh,32rem)] overflow-y-auto overscroll-contain px-3 sm:px-4 py-4 space-y-4">
                {/* Search */}
                <form onSubmit={onMobileSearchSubmit} className="relative">
                  <Search
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                  <input
                    type="search"
                    value={mobileSearch}
                    onChange={(e) => setMobileSearch(e.target.value)}
                    placeholder="Search our school..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-school-blue/30"
                  />
                </form>

                {/* Language + theme (larger touch targets) */}
                <HeaderUtilities variant="drawer" />

                {/* Nav links — 2 columns on wider phones */}
                {!user && (
                  <div className="grid grid-cols-2 gap-2">
                    {navLinks.map((link) => (
                      <Link
                        key={link.name}
                        to={link.path}
                        onClick={() => setIsOpen(false)}
                        className={`px-3 py-3.5 rounded-xl text-center text-[11px] sm:text-xs font-black uppercase tracking-wide ${
                          isActive(link.path)
                            ? 'bg-school-blue text-white'
                            : 'text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-school-blue/10'
                        }`}
                      >
                        {link.name}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Login / portal */}
                <div className="space-y-2 pt-1">
                  {!user ? (
                    <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex flex-col gap-2">
                      <Link 
                        to="/elearning" 
                        onClick={() => setIsOpen(false)}
                        className="w-full flex items-center justify-center gap-2 bg-school-blue text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-school-blue/20"
                      >
                        E-Learning
                      </Link>
                    </div>
                  ) : (
                    <>
                      <Link
                        to={user.role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard'}
                        onClick={() => setIsOpen(false)}
                        className="w-full flex items-center justify-center gap-2 py-3.5 bg-school-blue/10 text-school-blue dark:text-school-green font-bold rounded-xl border border-school-blue/20"
                      >
                        <LayoutDashboard size={20} /> Dashboard
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 py-3.5 text-red-600 dark:text-red-400 font-bold text-sm bg-red-50 dark:bg-red-950/30 rounded-xl"
                      >
                        <LogOut size={18} /> Logout
                      </button>
                    </>
                  )}
                </div>

                {/* Contact + social */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-700">
                  <a
                    href={`tel:${phone.replace(/\s/g, '')}`}
                    className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800"
                  >
                    <Phone size={14} className="text-school-green" /> Call
                  </a>
                  <a
                    href={`mailto:${email}`}
                    className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800"
                  >
                    <Mail size={14} className="text-school-green" /> Email
                  </a>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-school-green"
                    aria-label="Facebook"
                  >
                    <Facebook size={16} />
                  </a>
                  <a
                    href="https://wa.me/250783883046"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-school-green"
                    aria-label="WhatsApp"
                  >
                    <MessageCircle size={16} />
                  </a>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-school-green"
                    aria-label="YouTube"
                  >
                    <Youtube size={16} />
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Navbar;
