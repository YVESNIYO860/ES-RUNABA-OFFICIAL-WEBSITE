import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, BookOpen, Users, Trophy, ChevronLeft, ChevronRight, Star, Quote, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SchoolBrand from '../components/SchoolBrand';

/* ─── Slideshow Data ──────────────────────────────────────────────── */
const slides = [
  {
    src: '/slide_classroom.png',
    title: 'WELCOME TO ES RUNABA',
    subtitle: 'Where discipline and skill starts from. Started for deep learning and academic excellence.',
    color: 'from-school-blue/80',
  },
  {
    src: '/slide_sports.png',
    title: 'Thriving Sports Culture',
    subtitle: 'We nurture champions on and off the field — discipline, teamwork, and fun.',
    color: 'from-emerald-900/80',
  },
  {
    src: '/slide_lab.png',
    title: 'State-of-the-Art Labs',
    subtitle: 'Science & ICT laboratories equipped to spark curiosity and innovation.',
    color: 'from-indigo-900/80',
  },
  {
    src: '/slide_graduation.png',
    title: 'Celebrating Success',
    subtitle: 'Proud graduates who carry the RUNABA spirit into university and beyond.',
    color: 'from-amber-900/80',
  },
  {
    src: '/slide_campus.png',
    title: 'Our Beautiful School',
    subtitle: 'Nestled in the green hills of Burera — a peaceful haven for focused learning.',
    color: 'from-teal-900/80',
  },
];

/* ─── Slideshow Component ─────────────────────────────────────────── */
const HeroSlideshow = ({ slides }) => {
  const { siteContent } = useAuth();
  const slideList = slides ?? [];
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const goTo = useCallback((index, dir = 1) => {
    setDirection(dir);
    setCurrent(index);
  }, []);

  const next = useCallback(() => {
    if (slideList.length === 0) return;
    goTo((current + 1) % slideList.length, 1);
  }, [current, goTo, slideList.length]);

  const prev = useCallback(() => {
    if (slideList.length === 0) return;
    goTo((current - 1 + slideList.length) % slideList.length, -1);
  }, [current, goTo, slideList.length]);

  useEffect(() => {
    if (slideList.length === 0) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next, slideList.length]);

  if (slideList.length === 0 || !siteContent) return null;

  const variants = {
    enter: (dir) => ({ x: dir > 0 ? '10%' : '-10%', opacity: 0, scale: 1.05 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir) => ({ x: dir > 0 ? '-10%' : '10%', opacity: 0, scale: 1.05 }),
  };

  return (
    <section className="relative h-[90vh] md:h-screen w-full overflow-hidden bg-[#0a192f] font-sans group">
      {/* Background Slides */}
      <AnimatePresence custom={direction} initial={false}>
        <motion.div
          key={current}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0"
        >
          <img
            src={slideList[current].src}
            alt={slideList[current].title}
            className="w-full h-full object-cover"
          />
          {/* Enhanced dramatic overlays for extreme readability */}
          <div className="absolute inset-0 bg-black/20 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/80 via-[#020617]/30 to-transparent w-full md:w-[60%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/80 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content Container */}
      <div className="absolute inset-0 z-10 flex flex-col justify-center pb-24 md:pb-0 px-6 md:px-16 lg:px-24">
        <div className="max-w-7xl w-full mx-auto flex flex-col items-start mt-16 md:mt-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={`text-${current}`}
              initial={{ opacity: 0, y: 40, x: -20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: -20, x: 20 }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
              className="w-full max-w-4xl relative"
            >
              {/* Accents (Vertical Line) */}
              <div className="absolute -left-6 md:-left-12 top-4 bottom-4 w-1.5 bg-school-green rounded-full shadow-[0_0_15px_rgba(34,197,94,0.5)] hidden md:block"></div>

              <div className="mb-6 flex items-center gap-4 hidden md:flex">
                <span className="px-5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-[0.25em] shadow-xl">
                  {slideList[current].title.split(' ')[0]}
                </span>
                <div className="h-[1px] w-24 bg-white/40"></div>
              </div>

              <motion.h1 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.4 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-[5rem] font-black text-white mb-6 leading-[1.1] tracking-tight drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] font-sans notranslate"
                translate="no"
              >
                {slideList[current].title.split(' ').map((word, i) => (
                  <motion.span 
                    key={i} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + (i * 0.1) }}
                    className="inline-block mr-[0.2em]"
                  >
                    {word}
                  </motion.span>
                ))}
              </motion.h1>

              <p className="text-lg md:text-xl lg:text-2xl text-slate-100 mb-10 max-w-2xl leading-relaxed font-medium drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                {slideList[current].subtitle}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link to="/about" className="group relative overflow-hidden bg-school-green text-white px-8 py-4 rounded-full font-bold text-lg tracking-wide transition-all shadow-[0_8px_20px_rgba(34,197,94,0.3)] hover:shadow-[0_8px_25px_rgba(34,197,94,0.5)] hover:-translate-y-1 flex items-center justify-center gap-3 z-10 w-full sm:w-auto">
                  <div className="absolute inset-0 w-0 bg-white/20 transition-all duration-300 ease-out group-hover:w-full z-[-1]"></div>
                  Explore <SchoolBrand name={siteContent.general.schoolName} className="inline" /> <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/academics"
                  className="px-8 py-4 rounded-full text-white font-bold text-lg border-2 border-white/20 backdrop-blur-md hover:bg-white hover:text-slate-900 transition-all shadow-[0_8px_20px_rgba(0,0,0,0.2)] hover:-translate-y-1 flex items-center justify-center w-full sm:w-auto"
                >
                  Discover Programs
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute right-6 md:right-16 bottom-32 md:bottom-1/2 md:translate-y-1/2 z-20 flex md:flex-col gap-4 hidden lg:flex">
        <button
          onClick={prev}
          className="w-14 h-14 rounded-full border border-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-black transition-all group overflow-hidden relative"
        >
          <ChevronLeft className="z-10 group-hover:-translate-y-1 transition-transform" size={24} />
        </button>
        <button
          onClick={next}
          className="w-14 h-14 rounded-full border border-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-black transition-all group overflow-hidden relative"
        >
          <ChevronRight className="z-10 group-hover:translate-y-1 transition-transform" size={24} />
        </button>
      </div>

      {/* Slide Indicators with Progress */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent pt-12 pb-6 md:pb-10 px-6 md:px-16 lg:px-24">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex gap-2.5 md:gap-4 flex-1 max-w-2xl">
            {slideList.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i, i > current ? 1 : -1)}
                className="relative h-1.5 md:h-2 flex-1 rounded-none bg-white/20 overflow-hidden cursor-pointer hover:bg-white/30 transition-colors"
                aria-label={`Go to slide ${i + 1}`}
              >
                {i === current && (
                  <motion.div
                    layoutId="progress"
                    className="absolute top-0 left-0 bottom-0 bg-school-green"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 6, ease: 'linear' }}
                  />
                )}
                {i < current && <div className="absolute inset-0 bg-school-green/60" />}
              </button>
            ))}
          </div>
          <div className="text-white font-mono text-sm md:text-base tracking-widest font-bold ml-8">
            {String(current + 1).padStart(2, '0')} <span className="text-white/40">/ {String(slideList.length).padStart(2, '0')}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ─── Home Page ───────────────────────────────────────────────────── */
const Home = () => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const { siteContent } = useAuth();

  if (!siteContent) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>;

  const home = siteContent?.home || { hero: [], about: { discoverTitle: '', discoverText: '', discoverImage: '', passRate: '', staffRate: '', facilities: [] } };

  return (
    <div className="flex flex-col">
      {/* Photo Lightbox Overlay */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setLightboxOpen(false)}
        >
          <img 
            src="/builder.jpeg" 
            alt="NIYONKURU Yves" 
            className="max-h-[90vh] max-w-[90vw] object-contain shadow-2xl border-4 border-school-green" 
          />
          <button 
            className="absolute top-4 right-4 text-white bg-black/60 rounded-full w-10 h-10 flex items-center justify-center text-2xl hover:bg-school-green transition-colors"
            onClick={() => setLightboxOpen(false)}
          >&times;</button>
        </div>
      )}
      {/* Hero Slideshow */}
      <HeroSlideshow slides={home.hero} />

      {/* Parallax Section 1 */}
      <section 
        className="relative py-32 md:py-40 bg-fixed bg-center bg-cover flex items-center justify-center border-y-8 border-school-green/20" 
        style={{ backgroundImage: "url('/slide_campus.png')" }}
      >
        <div className="absolute inset-0 bg-[#0a192f]/80 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a192f]/50 to-transparent"></div>
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-6 max-w-4xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-white drop-shadow-2xl mb-8 tracking-tighter uppercase italic">
            A Legacy of Excellence
          </h2>
          <div className="w-24 h-1.5 bg-school-green mx-auto mb-8 shadow-[0_0_15px_rgba(34,197,94,0.6)]"></div>
          <p className="text-xl md:text-3xl text-white/90 font-light drop-shadow-md leading-relaxed">
            Discover a campus where tradition meets innovation, preparing students for a <span className="text-school-green font-bold">limitless future</span>.
          </p>
        </motion.div>
      </section>

      {/* Highlights Section */}
      <section className="section-padding bg-white relative overflow-hidden">
        <div className="absolute left-0 top-0 w-64 h-64 bg-slate-50 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -10 }}
            className="p-10 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-all group"
          >
            <div className="w-20 h-20 bg-school-blue/10 text-school-blue rounded-2xl flex items-center justify-center mb-6 rotate-3 group-hover:rotate-0 transition-transform">
              <BookOpen size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-4">Quality Academics</h3>
            <p className="text-slate-500 leading-relaxed">
              Offering both O-Level and specialized A-Level combinations with experienced and dedicated tutors.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -10 }}
            className="p-10 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-all group"
          >
            <div className="w-20 h-20 bg-school-green/10 text-school-green rounded-2xl flex items-center justify-center mb-6 -rotate-3 group-hover:rotate-0 transition-transform">
              <Users size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-4">Vibrant Community</h3>
            <p className="text-slate-500 leading-relaxed">
              A diverse and inclusive environment where every student has the chance to belong and thrive.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -10 }}
            className="p-10 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-all group"
          >
            <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6 rotate-6 group-hover:rotate-0 transition-transform">
              <Trophy size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-4">Success Path</h3>
            <p className="text-slate-500 leading-relaxed">
              We take deep pride in our students' national exam performance and extra-curricular victories.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Expansive About Section */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-school-green/5 rounded-bl-[100px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2 relative"
          >
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.2)] border-8 border-white p-0">
              <img
                src="https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=2070&auto=format&fit=crop"
                alt="Students studying"
                className="w-full h-[600px] object-cover scale-105 hover:scale-100 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-school-blue/10 mix-blend-overlay"></div>
            </div>
            {/* Floating stats card */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="absolute -bottom-8 -right-8 z-20 bg-school-green text-white p-8 rounded-3xl shadow-2xl hidden md:block border-4 border-white"
            >
              <div className="text-5xl font-black mb-1 flex items-center gap-1">20<span className="text-2xl text-white/80">+</span></div>
              <p className="text-xs uppercase tracking-[0.2em] font-black opacity-90 leading-tight">Years of Academic<br/>Excellence</p>
            </motion.div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2 space-y-8 relative z-10"
          >
            <div>
              <span className="text-school-green font-bold tracking-widest uppercase text-sm flex items-center gap-2 mb-3">
                <div className="w-6 h-[2px] bg-school-green"></div>
                Discover <SchoolBrand name={siteContent.general.schoolName} className="inline" />
              </span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 leading-tight">
                {home.about.discoverTitle}
              </h2>
            </div>
            
            <p className="text-slate-600 leading-relaxed text-lg">
              {home.about.discoverText}
            </p>
            
            <div className="mt-6 border border-slate-300 p-5 bg-white shadow-sm rounded">
              <p className="mb-2"><strong className="text-lg text-school-blue">{home.about.passRate.split(':')[0]}:</strong>{home.about.passRate.split(':')[1]}</p>
              <p className="mb-4"><strong className="text-lg text-school-blue">{home.about.staffRate.split(':')[0]}:</strong>{home.about.staffRate.split(':')[1]}</p>
              
              <p className="font-bold underline mb-2">Our Facilities include:</p>
              <ul className="list-disc ml-6 text-slate-800 space-y-1">
                {home.about.facilities.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
            
            <Link to="/about" className="inline-flex items-center gap-3 bg-school-blue text-white px-8 py-4 font-bold rounded-md hover:bg-[#0a192f] transition-colors mt-8 shadow-lg group">
              Read Our Full Story <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-slate-50 border-y border-slate-200 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-school-green font-bold uppercase tracking-[0.3em] text-[10px] mb-4 block">Voices of Success</span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mt-2 tracking-tight italic">Our Community Story</h2>
            <div className="w-24 h-1.5 bg-school-green mx-auto mt-6 shadow-[0_0_15px_rgba(34,197,94,0.4)]"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Testimony 1 - Yves (Builder) - Featured card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="md:col-span-2 bg-white border border-slate-100 shadow-[0_30px_60px_rgba(0,0,0,0.08)] p-10 rounded-[2.5rem] flex flex-col md:flex-row gap-10 items-center relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-school-green/5 rounded-bl-full pointer-events-none"></div>
              <div className="shrink-0 flex flex-col items-center text-center w-48 relative">
                <button 
                  onClick={() => setLightboxOpen(true)}
                  className="cursor-zoom-in group relative block mb-4"
                  title="Click to view full photo"
                >
                  <div className="relative">
                    <img
                      src="/builder.jpeg"
                      alt="NIYONKURU Yves"
                      className="w-36 h-48 object-cover object-top rounded-2xl border-4 border-white shadow-xl group-hover:border-school-green transition-all"
                      onError={e => { e.target.style.display='none'; }}
                    />
                    <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-school-green rounded-full flex items-center justify-center text-white border-4 border-white">
                      <Quote size={16} />
                    </div>
                  </div>
                </button>
                <p className="font-black text-slate-900 text-lg leading-tight uppercase tracking-tight">NIYONKURU Yves</p>
                <p className="text-school-green text-[10px] font-black uppercase tracking-[0.2em] mt-1.5">Alumni · Creative Dev</p>
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex justify-center md:justify-start gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} size={14} className="text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-slate-800 leading-relaxed text-lg font-medium italic">
                  "I am truly grateful for the strong education I received at <SchoolBrand name={siteContent.general.schoolName} className="inline" />. It gave me the confidence to dive into technology and grow my skills to reach university level. 
                </p>
                <p className="text-slate-600 leading-relaxed text-base mt-4 font-light">
                  Today, I am proud to be the developer of our school's website — giving back to the institution that sparked my journey in learning and innovation."
                </p>
              </div>
            </motion.div>

            {/* Testimony 2 placeholder — add more */}
            {/* To add more testimonies, copy the block below and fill in the details */}
            {[
              {
                name: "Add Your Name Here",
                role: "Alumni / Parent / Student",
                text: "Share your experience at ES RUNABA here. Contact the school to have your testimony featured on this page.",
                placeholder: true
              }
            ].map((t, i) => !t.placeholder ? (
              <div key={i} className="bg-white border border-slate-200 shadow p-6">
                <div className="text-school-green text-4xl font-serif leading-none mb-2">"</div>
                <p className="text-slate-700 leading-relaxed text-sm mb-6">{t.text}</p>
                <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                  <div className="w-12 h-12 bg-slate-200 border-2 border-school-green flex items-center justify-center text-slate-500 font-bold text-lg">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{t.name}</p>
                    <p className="text-school-green text-xs font-bold uppercase tracking-wide">{t.role}</p>
                  </div>
                </div>
              </div>
            ) : null)}
          </div>

          <p className="text-center text-slate-500 text-sm mt-8 italic">
            Want to share your story? <a href="/contact" className="text-school-green font-bold underline">Contact us</a> to be featured here.
          </p>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-28 border-t-8 border-school-green/10 flex items-center justify-center overflow-hidden">
        <motion.div 
          initial={{ scale: 1.1 }}
          whileInView={{ scale: 1 }}
          transition={{ duration: 10, ease: "linear" }}
          className="absolute inset-x-0 inset-y-0 bg-[url('/slide_graduation.png')] bg-cover bg-center bg-fixed opacity-40"
        />
        {/* Deep branded School Blue overlay instead of black or white */}
        <div className="absolute inset-0 bg-school-blue/60" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 text-center px-6 max-w-4xl mx-auto"
        >
          <span className="text-school-green text-xs font-black uppercase tracking-[0.4em] mb-6 block">Future Ready</span>
          <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter" style={{ textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl md:text-2xl text-slate-300 font-light mb-12 leading-relaxed">
            Join the <SchoolBrand name={siteContent.general.schoolName} className="text-white font-bold inline" /> family and build a foundation for lifelong success.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/contact#contact-form" className="inline-flex items-center gap-4 bg-school-green text-white px-12 py-6 font-black text-lg uppercase tracking-widest rounded-full hover:bg-green-500 transition-all shadow-[0_20px_40px_rgba(34,197,94,0.4)]">
              Apply Now <ArrowRight size={24} />
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;
