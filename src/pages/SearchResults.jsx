import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, FileText, Calendar, Users, GraduationCap, FlaskConical, Globe, BookOpen, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// --- FUZZY MATCHING UTILITIES ---

// Simple Levenshtein distance
const getLevenshteinDistance = (a, b) => {
  const matrix = Array.from({ length: a.length + 1 }, () => 
    Array.from({ length: b.length + 1 }, (_, i) => i)
  );
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
};

const KEYWORDS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer', 'Economics', 'Geography', 'History',
  'MEG', 'MCE', 'PCB', 'MPC', 'Ordinary Level', 'O-Level', 'A-Level',
  'Laboratory', 'Library', 'ICT', 'Sports', 'Basketball', 'Football',
  'Headteacher', 'Leader', 'Vision', 'Mission', 'Events', 'National Exam'
];

const getDidYouMean = (q) => {
  if (q.length < 3) return null;
  const lowerQ = q.toLowerCase();
  
  for (const kw of KEYWORDS) {
    const lowerKW = kw.toLowerCase();
    const distance = getLevenshteinDistance(lowerQ, lowerKW);
    if (distance > 0 && distance <= 2) return kw;
  }
  return null;
};

// --- AI INTENT ANALYSIS ---
const analyzeIntent = (q, siteContent) => {
  const lowerQ = q.toLowerCase();
  
  // 1. Contact Info
  if (lowerQ.includes('phone') || lowerQ.includes('call') || lowerQ.includes('contact') || lowerQ.includes('email') || lowerQ.includes('reach')) {
    return {
      type: 'Direct Info',
      title: 'How to Reach ES RUNABA',
      content: `Phone: +250 783 883 046 | Email: info@esrunaba.edu`,
      intent: 'contact',
      link: '/contact'
    };
  }
  
  // 2. Head Teacher
  if (lowerQ.includes('head') || lowerQ.includes('principal') || lowerQ.includes('leader') || lowerQ.includes('boss') || lowerQ.includes('director') || lowerQ.includes('bazamanza')) {
    return {
      type: 'Leadership',
      title: 'Our Head Teacher',
      content: 'Father BAZAMANZA Jean Nepomuscene leads our school with a focus on excellence.',
      intent: 'person',
      link: '/about#headteacher'
    };
  }

  // 3. Location
  if (lowerQ.includes('where') || lowerQ.includes('locate') || lowerQ.includes('map') || lowerQ.includes('direction')) {
    return {
      type: 'Navigation',
      title: 'School Location',
      content: 'Burera District, Butaro Sector. Near Butaro Hospital.',
      intent: 'location',
      link: '/contact'
    };
  }

  // 4. Academics
  if (lowerQ.includes('join') || lowerQ.includes('apply') || lowerQ.includes('admission') || lowerQ.includes('study')) {
    return {
      type: 'Admissions',
      title: 'Join Our Community',
      content: 'We offer O-Level and Advanced Level (MPC, MEG, PCB). Application is open in Term 1.',
      intent: 'admission',
      link: '/academics'
    };
  }

  return null;
};

// --- COMPONENT ---

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { siteContent } = useAuth();
  
  const searchParams = new URLSearchParams(location.search);
  const initialQuery = searchParams.get('q') || '';
  
  const [localQuery, setLocalQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [suggestion, setSuggestion] = useState(null);
  const [aiIntent, setAiIntent] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Sync with URL and Invisible AI Redirection
  useEffect(() => {
    setLocalQuery(initialQuery);
    if (initialQuery) {
      const qLower = initialQuery.toLowerCase().trim();
      const aiRedirect = analyzeIntent(qLower, siteContent);
      
      // Invisible AI Analysis: Direct Redirection
      if (aiRedirect && aiRedirect.link) {
         navigate(aiRedirect.link, { replace: true });
         return; // Skip rendering search results entirely
      }
      
      performSearch(initialQuery);
    } else {
      setAiIntent(null);
    }
  }, [initialQuery, navigate, siteContent]);

  const performSearch = (q) => {
    if (!q.trim()) {
      setResults([]);
      setSuggestion(null);
      return;
    }

    setIsSearching(true);
    
    // Artificial delay to simulate "analysis" and make it feel more intentional/premium
    setTimeout(() => {
      const qLower = q.toLowerCase().trim();
      const newsResults = [];
      
      // 1. Analyze Suggestion (Fuzzy Match)
      setSuggestion(getDidYouMean(qLower));

      // 3. Perform Search across Site Content
      if (siteContent) {
        // About & Home
        if (siteContent.home.about.discoverTitle.toLowerCase().includes(qLower) || 
            siteContent.home.about.discoverText.toLowerCase().includes(qLower) ||
            qLower.includes('history') || qLower.includes('legacy')) {
          newsResults.push({
            type: 'Page',
            category: 'About',
            title: 'School History & Legacy',
            snippet: 'Founded in 2003, ES RUNABA has evolved into a premier educational institution...',
            link: '/about#history',
            icon: <FileText className="text-blue-500" />
          });
        }
        
        // Routine Search Addition
        if (qLower.includes('routine') || qLower.includes('schedule') || qLower.includes('timetable') || qLower.includes('time')) {
           newsResults.push({
            type: 'Page',
            category: 'About',
            title: 'School Routine',
            snippet: 'Our balanced approach to academic, spiritual, and physical development.',
            link: '/about#routine',
            icon: <Calendar className="text-emerald-500" />
          });
        }
        
        // Faculty Search Addition
        if (qLower.includes('staff') || qLower.includes('teacher') || qLower.includes('faculty')) {
           newsResults.push({
            type: 'Page',
            category: 'About',
            title: 'Our Distinguished Faculty',
            snippet: 'Meet the pillars of science and education at ES RUNABA.',
            link: '/about#faculty',
            icon: <Users className="text-pink-500" />
          });
        }

        // Leader / Headteacher Intent Analysis
        const leaders = ['father', 'bazamanza', 'jean', 'nepomuscene', 'head', 'leader', 'founder'];
        if (leaders.some(l => qLower.includes(l))) {
           newsResults.push({
            type: 'Staff',
            category: 'Leadership',
            title: siteContent.about.headTeacher.name,
            snippet: 'Head Teacher of ES RUNABA. Visionary leader focusing on infrastructure and academic excellence.',
            link: '/about#headteacher',
            icon: <Users className="text-amber-500" />
          });
        }

        // Facilities
        siteContent.home.about.facilities.forEach(f => {
          if (f.toLowerCase().includes(qLower)) {
            newsResults.push({
              type: 'Facility',
              category: 'Infrastructure',
              title: f,
              snippet: 'Part of our state-of-the-art campus facilities designed for modern learning.',
              link: '/academics',
              icon: <FlaskConical className="text-emerald-500" />
            });
          }
        });
      }

      // 3. Academic Combinations
      const combinations = [
        { code: 'MEG', name: 'Mathematics, Economics & Geography', keywords: 'meg, math, econ, geo', link: '/academics' },
        { code: 'MCE', name: 'Mathematics, Computer Science & Economics', keywords: 'mce, computer, math, ict', link: '/academics' },
        { code: 'PCB', name: 'Physics, Chemistry & Biology', keywords: 'pcb, science, bio, chem', link: '/academics' }
      ];

      combinations.forEach(comb => {
        if (comb.name.toLowerCase().includes(qLower) || comb.keywords.toLowerCase().includes(qLower) || comb.code.toLowerCase().includes(qLower)) {
          newsResults.push({
            type: 'Academic',
            category: 'Combinations',
            title: `${comb.name} (${comb.code})`,
            snippet: 'Advanced level specialization program at ES RUNABA.',
            link: '/academics',
            icon: <GraduationCap className="text-indigo-500" />
          });
        }
      });

      // 4. Events
      const events = JSON.parse(localStorage.getItem('events_db') || '[]');
      events.forEach(event => {
        if (event.title.toLowerCase().includes(qLower) || event.desc.toLowerCase().includes(qLower)) {
          newsResults.push({
            type: 'Event',
            category: 'Community',
            title: event.title,
            snippet: `${event.date} • ${event.loc} • ${event.desc}`,
            link: '/about',
            icon: <Calendar className="text-purple-500" />
          });
        }
      });

      setResults(newsResults);
      setIsSearching(false);
      
      // Auto-focus the first result for accessibility
      if (newsResults.length > 0) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 400); 
  };

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (localQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(localQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-24 font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Search Header */}
        <div className="mb-16">
          <span className="text-school-green font-black tracking-[0.4em] uppercase text-[10px] mb-4 block">Search Engine</span>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-8 italic">Search ES RUNABA</h1>
          
          <form onSubmit={handleManualSearch} className="relative group max-w-3xl">
            <input 
              type="text"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              placeholder="Search academic programs, events, staff..."
              className="w-full h-16 md:h-20 bg-white border-2 border-slate-200 rounded-[2rem] px-8 pl-14 md:pl-20 text-xl font-medium text-slate-800 outline-none focus:border-school-green/50 focus:shadow-[0_20px_40px_rgba(34,197,94,0.1)] transition-all shadow-xl shadow-slate-200/50"
            />
            <Search className="absolute left-6 md:left-8 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-school-green transition-colors" size={28} />
            <button 
               type="submit"
               className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 bg-slate-900 hover:bg-slate-800 text-white px-6 md:px-8 py-2 md:py-3 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
            >
              Search
            </button>
          </form>

          {/* Autocomplete / Suggested keywords bar */}
          <div className="mt-4 flex flex-wrap gap-2 px-4">
             <span className="text-[10px] text-slate-400 uppercase font-black self-center mr-2">Quick results:</span>
             {['PCB', 'MCB', 'MCE', 'Laboratories', 'Father BAZAMANZA'].map(tag => (
               <button 
                key={tag}
                onClick={() => {setLocalQuery(tag); navigate(`/search?q=${encodeURIComponent(tag)}`);}}
                className="text-[10px] bg-slate-200/50 hover:bg-school-green hover:text-white px-3 py-1 rounded-full font-bold text-slate-500 uppercase transition-all tracking-tighter"
               >
                 {tag}
               </button>
             ))}
          </div>
        </div>

        {/* Results Body */}
        <div className="space-y-8">
          
          {/* AI Spotlight / Intent Feature */}
          <AnimatePresence>
            {aiIntent && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden shadow-2xl"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-school-green/20 rounded-full -mr-32 -mt-32 blur-[80px] pointer-events-none"></div>
                <div className="relative z-10">
                   <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-px bg-school-green/40"></div>
                      <span className="text-school-green font-black uppercase tracking-[0.4em] text-[10px]">AI Search Intelligence</span>
                   </div>
                   
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                      <div className="space-y-4">
                        <h4 className="text-3xl font-black text-white italic tracking-tighter uppercase">{aiIntent.title}</h4>
                        <p className="text-slate-300 text-lg md:text-xl font-light leading-relaxed max-w-2xl">{aiIntent.content}</p>
                      </div>
                      <Link 
                        to={aiIntent.link}
                        className="bg-white text-slate-900 px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-school-green hover:text-white transition-all shadow-xl hover:-translate-y-1 block text-center"
                      >
                         Go Directly <ArrowRight size={16} className="inline ml-2" />
                      </Link>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Suggestion / Spellcheck */}
          {suggestion && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-amber-50 border border-amber-200 rounded-2xl p-4 md:p-6 flex items-center gap-4 text-amber-800"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <AlertCircle size={20} className="text-amber-600" />
              </div>
              <div className="flex-1">
                 <p className="text-sm md:text-base font-medium">
                  Did you mean: <button 
                    onClick={() => {setLocalQuery(suggestion); navigate(`/search?q=${encodeURIComponent(suggestion)}`);}}
                    className="font-bold underline decoration-2 underline-offset-4 hover:text-amber-900 transition-colors"
                  >
                    {suggestion}
                  </button>?
                </p>
              </div>
            </motion.div>
          )}

          {/* Result List */}
          <div className="grid grid-cols-1 gap-4">
            {isSearching ? (
              // Loading Skeleton
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white/40 border border-slate-100 rounded-[2.5rem] p-8 animate-pulse space-y-4">
                  <div className="h-4 w-32 bg-slate-200 rounded"></div>
                  <div className="h-8 w-2/3 bg-slate-200 rounded"></div>
                  <div className="h-4 w-full bg-slate-200 rounded"></div>
                </div>
              ))
            ) : initialQuery && results.length > 0 ? (
              <AnimatePresence>
                {results.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link
                      to={item.link}
                      className="group block bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:border-school-green/30 transition-all relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-2 h-full bg-slate-100 group-hover:bg-school-green transition-colors"></div>
                      
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-start gap-6">
                          <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                             {React.cloneElement(item.icon, { size: 28 })}
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-school-green flex items-center gap-1">
                                 <AlertCircle size={10} /> {item.category}
                               </span>
                               <span className="text-[9px] bg-slate-900 text-white px-2 py-0.5 rounded font-black uppercase tracking-tighter">{item.type}</span>
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 leading-tight mb-3 italic tracking-tight uppercase group-hover:text-school-blue transition-colors">
                              {item.title}
                            </h3>
                            <p className="text-slate-500 max-w-2xl text-lg font-light leading-relaxed mb-4">{item.snippet}</p>
                          </div>
                        </div>
                        <div className="hidden md:flex flex-col items-end">
                           <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-school-green group-hover:text-white transition-all group-hover:translate-x-2">
                              <ArrowRight size={24} />
                           </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : initialQuery ? (
              // No Results Found but have a query
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-24 px-8 bg-white border border-slate-100 rounded-[3rem] shadow-sm"
              >
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                  <Search size={40} />
                </div>
                <h3 className="text-3xl font-black text-slate-800 mb-4 tracking-tighter">No exact matches found</h3>
                <p className="text-slate-500 max-w-md mx-auto text-lg font-light italic">
                  We couldn't find exactly what you're looking for. Try a broad keyword like "Science", "Math", or "Father".
                </p>
                
                <div className="mt-12">
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-6">Popular Pages</p>
                   <div className="flex flex-wrap justify-center gap-4">
                      {['About Us', 'Academics', 'Student Life', 'Contact'].map(p => (
                        <Link 
                          key={p} 
                          to={`/${p.toLowerCase().replace(' ', '-')}`}
                          className="px-6 py-2 border-2 border-slate-100 rounded-full text-xs font-bold text-slate-500 hover:border-school-green hover:text-school-green transition-all"
                        >
                          {p}
                        </Link>
                      ))}
                   </div>
                </div>
              </motion.div>
            ) : (
              // Empty State (Initial Page Load)
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-20 grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                <div className="bg-school-blue text-white rounded-[3rem] p-10 flex flex-col justify-between h-80 relative overflow-hidden shadow-2xl">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                   <h3 className="text-3xl font-black italic tracking-tighter leading-none uppercase">Discover Our Academics</h3>
                   <p className="text-white/60 font-light text-lg">Detailed information on MEG, MCB, MCE combinations and O-Level.</p>
                   <Link to="/academics" className="flex items-center gap-2 font-black uppercase tracking-widest text-xs hover:gap-4 transition-all">
                      View Programs <ArrowRight size={16} />
                   </Link>
                </div>
                
                <div className="bg-school-green text-white rounded-[3rem] p-10 flex flex-col justify-between h-80 relative overflow-hidden shadow-2xl">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                   <h3 className="text-3xl font-black italic tracking-tighter leading-none uppercase">Connect With School</h3>
                   <p className="text-white/60 font-light text-lg">Find contact details and learn about our visionary leadership.</p>
                   <Link to="/contact" className="flex items-center gap-2 font-black uppercase tracking-widest text-xs hover:gap-4 transition-all">
                      Get In Touch <ArrowRight size={16} />
                   </Link>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
