import React, { useState, useEffect } from 'react';
import { Trophy, Trees, Mic2, Users2, BookHeart, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const activities = [
  { 
    name: 'Debate Club', icon: <Mic2 size={28} />, category: 'Club',
    desc: 'Sharpen public speaking and critical thinking skills in a competitive environment.',
    color: 'bg-blue-600',
    photos: [
      'https://images.unsplash.com/photo-1571624436279-b272aff752b5?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1529070538774-1843cb3265df?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=1200&auto=format&fit=crop',
    ]
  },
  { 
    name: 'Environmental Club', icon: <Trees size={28} />, category: 'Club',
    desc: 'Join tree planting and sustainability initiatives to protect our local ecosystem.',
    color: 'bg-green-700',
    photos: [
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1542621334-a254cf47733d?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1622359416413-eb89d81373ed?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1200&auto=format&fit=crop',
    ]
  },
  { 
    name: 'Science Club', icon: <BookHeart size={28} />, category: 'Club',
    desc: 'Discover biology, chemistry, and physics through exciting hands-on experiments.',
    color: 'bg-purple-700',
    photos: [
      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1628595351029-c2bf17511435?q=80&w=1200&auto=format&fit=crop',
    ]
  },
  { 
    name: 'Traditional Dance', icon: <Users2 size={28} />, category: 'Culture',
    desc: 'Celebrate and preserve our Rwandan culture through high-energy performances.',
    color: 'bg-amber-700',
    photos: [
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1594913612716-e5b1fd919bd4?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1533147670608-2a2f9776d3ac?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?q=80&w=1200&auto=format&fit=crop',
    ]
  },
  { 
    name: 'Football', icon: <Trophy size={28} />, category: 'Sports',
    desc: 'Compete in inter-school tournaments and build incredible teamwork on the pitch.',
    color: 'bg-school-blue',
    photos: [
      'https://images.unsplash.com/photo-1518622358385-8ea7d0794bf6?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1553773077-91673515eaaf?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1431324155629-1a6d0a6eb4f2?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?q=80&w=1200&auto=format&fit=crop',
    ]
  },
  { 
    name: 'Basketball', icon: <Trophy size={28} />, category: 'Sports',
    desc: 'Improve cardiovascular endurance and court strategy with our varsity team.',
    color: 'bg-orange-600',
    photos: [
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1518063319789-7217e6706b04?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1519861531473-9200262188bf?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=1200&auto=format&fit=crop',
    ]
  },
  { 
    name: 'Volleyball', icon: <Trophy size={28} />, category: 'Sports',
    desc: 'Master the spike, improve reflexes, and build team synchrony on the court.',
    color: 'bg-red-600',
    photos: [
      'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1593786274422-901d36a9aeff?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1588667623912-74768eff1b5d?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=1200&auto=format&fit=crop',
    ]
  },
  { 
    name: "Girls' Empowerment", icon: <Users2 size={28} />, category: 'Society',
    desc: 'A safe space to build leadership skills, confidence, and career readiness.',
    color: 'bg-pink-600',
    photos: [
      'https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1200&auto=format&fit=crop',
    ]
  },
];

const StudentLife = () => {
  const { siteContent } = useAuth();
  const [gallery, setGallery] = useState(null);
  const [events, setEvents] = useState([]);

  // Load events from localStorage (set by admin dashboard)
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('events_db') || '[]');
    setEvents(stored);
  }, []); // { activity, photoIndex }

  // Close on Escape key
  useEffect(() => {
    const onKey = (e) => {
      if (!gallery) return;
      if (e.key === 'Escape') setGallery(null);
      if (e.key === 'ArrowRight') nextPhoto();
      if (e.key === 'ArrowLeft') prevPhoto();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [gallery]);

  // Lock body scroll when gallery is open
  useEffect(() => {
    document.body.style.overflow = gallery ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [gallery]);

  if (!siteContent) return <div className="min-h-screen bg-white"></div>;
  const { general } = siteContent;

  const openGallery = (activity) => setGallery({ activity, photoIndex: 0 });
  const closeGallery = () => setGallery(null);
  const nextPhoto = () => setGallery(g => ({ ...g, photoIndex: (g.photoIndex + 1) % g.activity.photos.length }));
  const prevPhoto = () => setGallery(g => ({ ...g, photoIndex: (g.photoIndex - 1 + g.activity.photos.length) % g.activity.photos.length }));

  return (
    <div className="pb-20 bg-white">

      {/* ── Fullscreen Gallery Lightbox ── */}
      <AnimatePresence>
        {gallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50 flex flex-col"
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between px-6 py-4 bg-black/80 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${gallery.activity.color} text-white`}>
                  {gallery.activity.icon}
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg leading-tight">{gallery.activity.name}</h3>
                  <p className="text-white/50 text-xs uppercase tracking-wider">{gallery.activity.category} · Photo {gallery.photoIndex + 1} of {gallery.activity.photos.length}</p>
                </div>
              </div>
              <button 
                onClick={closeGallery}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-red-500 flex items-center justify-center text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Main Photo */}
            <div className="flex-1 relative flex items-center justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.img
                  key={gallery.photoIndex}
                  src={gallery.activity.photos[gallery.photoIndex]}
                  alt={`${gallery.activity.name} photo ${gallery.photoIndex + 1}`}
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="max-h-full max-w-full object-contain"
                />
              </AnimatePresence>

              {/* Prev Button */}
              <button
                onClick={prevPhoto}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/60 hover:bg-white hover:text-black text-white rounded-full flex items-center justify-center transition-all border border-white/20"
              >
                <ChevronLeft size={24} />
              </button>

              {/* Next Button */}
              <button
                onClick={nextPhoto}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/60 hover:bg-white hover:text-black text-white rounded-full flex items-center justify-center transition-all border border-white/20"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Thumbnail Strip */}
            <div className="shrink-0 bg-black/80 border-t border-white/10 px-4 py-3 flex gap-2 overflow-x-auto justify-center">
              {gallery.activity.photos.map((url, i) => (
                <button 
                  key={i}
                  onClick={() => setGallery(g => ({ ...g, photoIndex: i }))}
                  className={`w-16 h-12 rounded overflow-hidden border-2 shrink-0 transition-all ${i === gallery.photoIndex ? 'border-school-green scale-110' : 'border-white/20 opacity-50 hover:opacity-80'}`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Description bar */}
            <div className="shrink-0 bg-black/90 px-6 py-3 text-center">
              <p className="text-white/70 text-sm">{gallery.activity.desc}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative h-[55vh] min-h-[400px] flex items-center justify-center overflow-hidden">
         {/* Fixed Background Image */}
         <div 
           className="absolute inset-x-0 inset-y-0 bg-[url('https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center bg-fixed"
         />
         {/* Minimal Clarity Overlay */}
         <div className="absolute inset-0 bg-black/40" />
         
         <div className="relative z-10 text-center text-white px-4">
             <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-16 h-16 bg-white/10 backdrop-blur border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
             >
                 <Users2 size={32} className="text-white" />
             </motion.div>
             <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-7xl font-black mb-6 text-white drop-shadow-2xl italic tracking-tighter"
             >
                 Student Life
             </motion.h1>
             <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl md:text-2xl text-slate-100 max-w-3xl mx-auto font-light drop-shadow-lg"
             >
                 Exploring the vibrant clubs, sports, and culture at ES RUNABA
             </motion.p>
         </div>
      </section>

      {/* Activity Grid */}
      <section id="activities" className="py-16 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-800">Clubs & Activities</h2>
          <p className="text-slate-500 mt-2">Click on any card to open a full photo gallery</p>
          <div className="w-16 h-1 bg-school-green mx-auto mt-4"></div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {activities.map((act, i) => (
            <motion.button
              key={i}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => openGallery(act)}
              className="group relative overflow-hidden rounded-2xl shadow-md cursor-pointer text-left h-44 md:h-52 border-2 border-transparent hover:border-school-green transition-all"
              style={{ backgroundImage: `url(${act.photos[0]})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            >
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-all"></div>
              {/* Bottom label */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <div className={`inline-flex items-center justify-center p-1.5 rounded-lg ${act.color} text-white mb-2`}>
                  {act.icon}
                </div>
                <h4 className="text-white font-bold text-sm leading-tight">{act.name}</h4>
                <p className="text-white/60 text-xs uppercase tracking-wider mt-0.5">{act.category}</p>
              </div>
              {/* Hover cue */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-xs px-2 py-1 rounded-full font-bold">
                View Photos
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Sports Section */}
      <section className="bg-slate-900 py-24 px-4 md:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#000000] opacity-50 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 to-transparent pointer-events-none"></div>
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4 relative z-10">
          <span className="text-amber-500 font-bold uppercase tracking-[0.2em] text-xs font-mono">Excellence on the Field</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white">Health & Sports</h2>
          <p className="text-slate-300 text-lg leading-relaxed">
            At {general.schoolName}, we believe a healthy body houses a healthy mind. Our sports programs foster teamwork, discipline, and physical fitness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto relative z-10">
          <div className="group relative overflow-hidden rounded-[2rem] h-96 shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=2090&auto=format&fit=crop" 
              alt="Basketball" 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end p-8 md:p-12">
              <div className="text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-3xl font-bold mb-2">Inter-School Competitions</h3>
                <p className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">Our teams represent Burera district in provincial championships every year.</p>
              </div>
            </div>
          </div>
          <div className="group relative overflow-hidden rounded-[2rem] h-96 shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1517466787573-087754b2b09d?q=80&w=1972&auto=format&fit=crop" 
              alt="Football" 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end p-8 md:p-12">
              <div className="text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-3xl font-bold mb-2">Modern Playing Grounds</h3>
                <p className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">We provide well-maintained facilities for football, volleyball, and basketball.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-24 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-school-green font-bold uppercase tracking-[0.2em] text-xs">Mark Your Calendars</span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mt-2">Upcoming Events</h2>
        </div>
        
        <div className="space-y-6">
          {events.length === 0 && (
            <p className="text-center text-slate-400 italic py-10">No upcoming events scheduled. Check back soon!</p>
          )}
          {events.map((ev, i) => (
            <div key={ev.id || i} className="flex flex-col md:flex-row items-center gap-8 p-8 bg-white border border-slate-100 hover:border-school-blue/20 rounded-[2rem] hover:shadow-xl transition-all group">
              <div className="bg-slate-50 border border-slate-100 group-hover:bg-school-blue group-hover:border-school-blue text-slate-700 group-hover:text-white transition-colors w-28 h-28 rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-sm">
                <span className="text-3xl font-black leading-none">{ev.date.split(' ')[0]}</span>
                <span className="text-xs uppercase font-bold text-school-green group-hover:text-green-300 mt-1 tracking-widest">{ev.date.split(' ')[1] || ''}</span>
              </div>
              <div className="flex-grow text-center md:text-left">
                <h4 className="text-2xl font-bold text-slate-800 mb-2">{ev.title}</h4>
                <p className="text-slate-500 mb-3 leading-relaxed">{ev.desc}</p>
                <div className="flex items-center justify-center md:justify-start gap-2 text-sm font-bold text-school-blue">
                  <div className="w-1.5 h-1.5 rounded-full bg-school-green"></div> {ev.loc}
                </div>
              </div>
              <button className="bg-school-blue/5 hover:bg-school-blue text-school-blue hover:text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors whitespace-nowrap">
                Save Date
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default StudentLife;
