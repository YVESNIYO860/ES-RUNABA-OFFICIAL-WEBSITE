import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Landmark, LogOut, LayoutDashboard, Lock, Megaphone, Facebook, MessageCircle, Mail, Phone, Youtube, Search, Sun, Moon, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/TranslationContext';
import GlobalSearch from './GlobalSearch';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [topSearch, setTopSearch] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileLangOpen, setIsMobileLangOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage, t } = useTranslation();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme ? savedTheme === 'dark' : prefersDark;

    setIsDarkMode(theme);
    document.documentElement.classList.toggle('dark', theme);
  }, []);

  const toggleTheme = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    localStorage.setItem('theme', nextMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', nextMode);
  };

  const { user, logout, siteContent } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t('home'), path: '/' },
    { name: t('about'), path: '/about' },
    { name: t('academics'), path: '/academics' },
    { name: t('schoolLife'), path: '/student-life' },
    { name: t('gallery'), path: '/gallery' },
    { name: t('contact'), path: '/contact' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const onTopSearchSubmit = (e) => {
    e.preventDefault();
    if (topSearch.trim()) {
      navigate(`/search?q=${encodeURIComponent(topSearch.trim())}`);
      setTopSearch('');
    }
  };

  const branding = siteContent?.general || {
    schoolName: "ES RUNABA",
    motto: "ORA PRO NOBIS",
    logo: "/runaba-logo.png",
    contact: { email: "info@esrunaba.edu", phone: "+250 798269987" },
    announcement: { text: "", isActive: false }
  };

  return (
    <>
      {/* Top Contact Bar */}
      <div className="bg-slate-900 text-white/80 py-2 border-b border-white/5 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center text-[11px] font-bold tracking-widest uppercase">
          <div className="flex items-center gap-6">
            <a href={`mailto:${branding.contact?.email}`} className="flex items-center gap-2 hover:text-school-green transition-colors">
              <Mail size={12} className="text-school-green" /> {branding.contact?.email}
            </a>
            <div className="w-px h-3 bg-white/20"></div>
            <a href={`tel:${branding.contact?.phone}`} className="flex items-center gap-2 hover:text-school-green transition-colors">
              <Phone size={12} className="text-school-green" /> +250 783 883 046
            </a>
          </div>
          <div className="flex items-center gap-8">
             <form onSubmit={onTopSearchSubmit} className="relative group">
               <input 
                 type="text" 
                 value={topSearch}
                 onChange={(e) => setTopSearch(e.target.value)}
                 placeholder="Search our school..." 
                 className="bg-white/5 border border-white/10 rounded-full px-4 py-1 w-48 text-[10px] text-white focus:outline-none focus:border-school-green/50 focus:bg-white/10 transition-all placeholder:text-white/20 tracking-normal"
               />
               <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-school-green transition-colors">
                 <Search size={12} />
               </button>
            </form>
           <div className="flex items-center gap-3 ml-4">
             <button
               type="button"
               onClick={toggleTheme}
               className="flex items-center justify-center w-8 h-8 rounded-full border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 transition-colors"
               title={isDarkMode ? t('lightTheme') : t('darkTheme')}
               aria-label={isDarkMode ? t('lightTheme') : t('darkTheme')}
             >
               {isDarkMode ? <Sun size={14} className="text-white" /> : <Moon size={14} className="text-white" />}
             </button>
             <div className="relative">
               <select
                 value={language}
                 onChange={(e) => setLanguage(e.target.value)}
                 className="pl-2 pr-6 py-1 rounded-full text-[11px] bg-white/5 border border-white/10 text-white/90 appearance-none"
                 title={t('selectLanguage')}
                 aria-label={t('selectLanguage')}
               >
                 <option value="EN">{t('english')}</option>
                 <option value="FR">{t('french')}</option>
                 <option value="RW">{t('kinyarwanda')}</option>
               </select>
             </div>
           </div>
            <div className="w-px h-3 bg-white/20"></div>
             <div className="flex items-center gap-4">
               <span className="text-white/30 mr-2">{t('connect')}</span>
               <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-school-green transition-all hover:scale-110"><Facebook size={14} /></a>
               <a href="https://wa.me/250783883046" target="_blank" rel="noopener noreferrer" className="hover:text-school-green transition-all hover:scale-110"><MessageCircle size={14} /></a>
               <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-school-green transition-all hover:scale-110"><Youtube size={14} /></a>
            </div>
          </div>
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
            <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-center gap-3">
              <div className="bg-school-green text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest animate-pulse whitespace-nowrap border border-white/20">
                Notice
              </div>
              <p className="text-xs md:text-sm font-bold tracking-wide truncate">
                {branding.announcement?.text}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo and Name */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="p-1 rounded-lg text-white group-hover:scale-105 transition-transform">
                <img src={branding.logo} alt={`${branding.schoolName} Logo`} className="h-14 w-auto object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-2xl text-school-blue leading-none tracking-tight uppercase">{branding.schoolName}</span>
                <span className="text-[10px] text-school-green font-bold tracking-[0.2em] uppercase mt-1">{branding.motto}</span>
              </div>
            </Link>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-5 lg:space-x-7">
            {!user && navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`nav-link text-xs uppercase tracking-widest font-black transition-all hover:tracking-[0.2em] relative group py-1 ${isActive(link.path) ? 'text-school-blue' : ''}`}
              >
                {link.name}
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-school-blue scale-x-0 group-hover:scale-x-100 transition-transform origin-left ${isActive(link.path) ? 'scale-x-100' : ''}`}></span>
              </Link>
            ))}

            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
               {/* Scrolled Search Icon */}
               <button 
                 onClick={() => setIsSearchOpen(true)}
                 className={`p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-all ${scrolled ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'}`}
               >
                 <Search size={20} />
               </button>

               {!user ? (
                   <>
                       <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={toggleTheme}
                            className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                            title="Toggle dark mode"
                          >
                            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                          </button>
                          <div className="relative">
                            <Globe size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <select
                              value={language}
                              onChange={(event) => setLanguage(event.target.value)}
                              className="appearance-none pl-10 pr-4 py-2 rounded-full border border-slate-200 bg-slate-100 text-[10px] uppercase tracking-[0.2em] text-slate-700 focus:outline-none focus:ring-2 focus:ring-school-blue/20"
                              title={t('selectLanguage')}
                            >
                              <option value="EN">{t('english')}</option>
                              <option value="FR">{t('french')}</option>
                              <option value="RW">{t('kinyarwanda')}</option>
                            </select>
                          </div>
                       </div>
                       <a href="https://example.com" target="_blank" rel="noopener noreferrer" className="bg-school-blue text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-school-blue/20">
                         {t('elearning')}
                       </a>
                   </>
               ) : (
                   <div className="flex items-center gap-4">
                       <Link to={user.role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard'} className="flex items-center gap-2 text-school-blue font-bold hover:text-school-green transition-colors">
                            <LayoutDashboard size={18} /> {user.isAdmin ? 'Admin' : 'Portal'}
                       </Link>
                       <button onClick={handleLogout} className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm font-bold bg-red-50 px-3 py-1.5 rounded-md transition-colors">
                           <LogOut size={16} />
                       </button>
                   </div>
               )}
            </div>
          </div>

          <div className="md:hidden flex items-center gap-3 relative">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="text-slate-500 hover:text-school-blue transition-colors p-2"
              aria-label={t('connect')}
            >
              <Search size={24} />
            </button>

            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              title={isDarkMode ? t('lightTheme') : t('darkTheme')}
              aria-label={isDarkMode ? t('lightTheme') : t('darkTheme')}
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <button
              onClick={() => setIsMobileLangOpen((s) => !s)}
              className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              title={t('selectLanguage')}
              aria-haspopup="menu"
              aria-expanded={isMobileLangOpen}
              aria-label={t('selectLanguage')}
            >
              <Globe size={18} />
              <span className="sr-only">{language}</span>
            </button>

            {isMobileLangOpen && (
              <div className="absolute top-14 right-0 bg-white border border-slate-200 rounded-lg shadow-lg p-2 z-50 w-40">
                <button onClick={() => { setLanguage('EN'); setIsMobileLangOpen(false); }} className={`w-full text-left px-3 py-2 rounded hover:bg-slate-50 ${language === 'EN' ? 'font-bold text-school-blue' : ''}`}>{t('english')}</button>
                <button onClick={() => { setLanguage('FR'); setIsMobileLangOpen(false); }} className={`w-full text-left px-3 py-2 rounded hover:bg-slate-50 ${language === 'FR' ? 'font-bold text-school-blue' : ''}`}>{t('french')}</button>
                <button onClick={() => { setLanguage('RW'); setIsMobileLangOpen(false); }} className={`w-full text-left px-3 py-2 rounded hover:bg-slate-50 ${language === 'RW' ? 'font-bold text-school-blue' : ''}`}>{t('kinyarwanda')}</button>
              </div>
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 hover:text-school-blue focus:outline-none p-2"
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Links */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-white border-b border-slate-200"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {!user && navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-4 rounded-xl text-sm font-black uppercase tracking-widest ${
                    isActive(link.path)
                      ? 'bg-school-blue text-white'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-school-blue'
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              <div className="border-t border-slate-100 mt-4 pt-4 px-3 space-y-3 pb-6">
                  {!user ? (
                      <>
                          <a href="https://example.com" target="_blank" rel="noopener noreferrer" onClick={() => setIsOpen(false)} className="w-full block text-center bg-school-blue text-white py-4 rounded-xl font-bold shadow-lg shadow-school-blue/20">
                             {t('eLearningPortal')}
                          </a>
                          <div className="mt-4 space-y-3 px-3">
                            <button
                              type="button"
                              onClick={toggleTheme}
                              className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-100 py-3 text-sm font-bold text-slate-700 hover:bg-slate-200 transition-colors"
                            >
                              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                              {isDarkMode ? t('lightTheme') : t('darkTheme')}
                            </button>
                            <div className="relative">
                              <Globe size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                              <select
                                value={language}
                                onChange={(event) => setLanguage(event.target.value)}
                                className="w-full appearance-none rounded-full border border-slate-200 bg-slate-100 py-3 pl-12 pr-4 text-sm font-bold uppercase tracking-[0.18em] text-slate-700 focus:outline-none focus:ring-2 focus:ring-school-blue/20"
                              >
                                <option value="EN">{t('english')}</option>
                                <option value="FR">{t('french')}</option>
                                <option value="RW">{t('kinyarwanda')}</option>
                              </select>
                            </div>
                          </div>
                          <Link to="/staff-login" onClick={() => setIsOpen(false)} className="w-full block text-center text-slate-500 text-xs font-bold uppercase py-3 border border-slate-200 rounded-xl tracking-widest mt-2 flex items-center justify-center gap-2">
                            <Lock size={14} /> {t('adminAccess')}
                          </Link>
                      </>
                  ) : (
                      <>
                          <Link to={user.role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard'} onClick={() => setIsOpen(false)} className="w-full flex items-center justify-center gap-2 py-4 bg-school-blue/5 text-school-blue font-bold rounded-xl border border-school-blue/20">
                               <LayoutDashboard size={20} /> Dashboard
                          </Link>
                          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-4 text-red-600 font-bold text-sm">
                              <LogOut size={18} /> Logout
                          </button>
                      </>
                  )}
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
