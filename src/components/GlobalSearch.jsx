import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, FileText, Calendar, Users, GraduationCap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GlobalSearch = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const { siteContent } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Handle Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      handleLinkClick(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleLinkClick = (link) => {
    navigate(link);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4 md:px-0 font-sans">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl"
          />

          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            className="relative w-full max-w-2xl bg-white/95 rounded-[2rem] shadow-[0_32px_64px_rgba(0,0,0,0.2)] overflow-hidden border border-white/20 backdrop-blur-sm"
          >
            {/* Search Input Head */}
            <form onSubmit={handleManualSearch} className="flex items-center p-6 border-b border-slate-100 bg-white">
              <button type="submit" className="text-school-blue mr-4 shrink-0 hover:scale-110 transition-transform">
                <Search size={24} />
              </button>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search anything..."
                className="flex-1 bg-transparent text-xl text-slate-800 outline-none placeholder:text-slate-300 font-medium"
              />
              <div className="flex items-center gap-2">
                 {query && (
                   <button type="button" onClick={() => setQuery('')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                     <X size={16} />
                   </button>
                 )}
                 <button 
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-500 text-[10px] font-bold uppercase transition-colors"
                >
                  ESC
                </button>
              </div>
            </form>

            {/* Content Area */}
            <div className="max-h-[65vh] overflow-y-auto bg-white/50">
                <div className="p-8">
                  {!query ? (
                    <>
                      <p className="px-4 mb-4 text-[10px] uppercase tracking-[0.3em] font-black text-slate-400">Explore ES RUNABA</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { title: 'Admissions & Contact', desc: 'Registry & Help', link: '/contact', color: 'bg-pink-50 text-pink-600' },
                          { title: 'Academic Programs', desc: 'Combinations & O-Level', link: '/academics', color: 'bg-indigo-50 text-indigo-600' },
                          { title: 'School History', desc: 'Mission & Vision', link: '/about', color: 'bg-blue-50 text-blue-600' },
                          { title: 'School Life', desc: 'Culture & Clubs', link: '/student-life', color: 'bg-purple-50 text-purple-600' }
                        ].map((item, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleLinkClick(item.link)}
                            className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all border border-transparent hover:border-slate-100 text-left group"
                          >
                            <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform`}>
                              {item.title.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800 text-sm">{item.title}</h4>
                              <p className="text-xs text-slate-500">{item.desc}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-10">
                        <div className="w-16 h-16 bg-school-blue/10 rounded-full flex items-center justify-center mx-auto mb-4 text-school-blue">
                           <Search size={32} />
                        </div>
                        <h4 className="text-xl font-bold text-slate-800 mb-2">Ready to search for "{query}"?</h4>
                        <p className="text-slate-500 text-sm mb-6">Press <kbd className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-xs">Enter</kbd> or click the icon at the top to see all results.</p>
                        <button 
                          type="button"
                          onClick={handleManualSearch}
                          className="px-8 py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20"
                        >
                          View Results
                        </button>
                    </div>
                  )}
                  
                  <div className="mt-8 flex items-center gap-3 px-4 py-3 bg-school-blue/5 rounded-xl border border-school-blue/10">
                    <Search className="text-school-blue" size={14} />
                    <p className="text-[11px] text-school-blue font-bold tracking-wide italic leading-relaxed">
                      Search detects combinations, student activities, school facilities, and staff members across the entire website.
                    </p>
                  </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center px-8 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                <span>Navigate ES RUNABA</span>
                <span className="flex items-center gap-2"><kbd className="bg-white border rounded px-1.5 py-0.5 text-[9px] shadow-sm">ESC</kbd> to close</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default GlobalSearch;
