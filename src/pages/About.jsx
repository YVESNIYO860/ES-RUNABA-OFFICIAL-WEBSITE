import React from 'react';
import { motion } from 'framer-motion';
import { Target, Eye, ShieldCheck, Quote, Cpu, Users, CalendarDays, ArrowDown, User, Briefcase, MapPin, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/TranslationContext';

const teachersData = [
  {
    name: 'Mr. Theoneste',
    subjects: 'Mathematics & ICT',
    experience: '12 Years',
    level: 'O-Level',
    phone: '+250 783 883 046',
    bio: 'Dedicated to simplifying complex mathematical concepts and driving digital literacy.',
    image: 'https://images.unsplash.com/photo-1544717305-27a734ef1904?q=80&w=800&auto=format&fit=crop'
  },
  {
    name: 'Mrs. NAmahoro',
    subjects: 'Biology & Chemistry',
    experience: '8 Years',
    level: 'A-Level',
    phone: '+250 783 883 112',
    bio: 'Fostering a deep appreciation for the biological sciences and laboratory research.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop'
  },
  {
    name: 'Mr. Fulgence',
    subjects: 'Physics & Geography',
    experience: '15 Years',
    level: 'A-Level',
    phone: '+250 783 883 055',
    bio: 'Expert in environmental science and physics methodology with over a decade of mentorship.',
    image: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=800&auto=format&fit=crop'
  },
  {
    name: 'Ms. MUKAMANA Solange',
    subjects: 'English & Entrepreneurship',
    experience: '6 Years',
    level: 'O-Level',
    phone: '+250 783 883 099',
    bio: 'Passionate about communication skills and empowering students with business mindsets.',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=800&auto=format&fit=crop'
  }
];

const routines = [
  {
    day: 'Monday',
    event: 'Lesson-Focused Day',
    type: 'Academic Priority',
    icon: <CalendarDays size={20} />,
    slots: [
      { time: '05:30 - 06:00', label: 'Morning assembly & devotion' },
      { time: '06:00 - 07:30', label: 'Lesson block 1: Core subjects' },
      { time: '07:30 - 08:00', label: 'Short break & guidance' },
      { time: '08:00 - 10:30', label: 'Lesson block 2: Labs and electives' },
      { time: '10:30 - 11:00', label: 'Recess / mentorship' },
      { time: '11:00 - 13:00', label: 'Lesson block 3: Academic review' },
      { time: '13:00 - 14:00', label: 'Lunch & rest' },
      { time: '14:00 - 16:00', label: 'Afternoon lessons' },
      { time: '16:00 - 17:30', label: 'Sports, clubs or workshops' },
      { time: '17:30 - 19:00', label: 'Study hall / homework' },
      { time: '19:00 - 20:30', label: 'Dinner & quiet reading' },
      { time: '20:30 - 21:50', label: 'Prep for tomorrow / lights out' }
    ]
  },
  {
    day: 'Tuesday',
    event: 'Lesson-Focused Day',
    type: 'Academic Priority',
    icon: <CalendarDays size={20} />,
    slots: [
      { time: '05:30 - 06:00', label: 'Morning assembly & devotion' },
      { time: '06:00 - 07:30', label: 'Lesson block 1: Core subjects' },
      { time: '07:30 - 08:00', label: 'Short break & guidance' },
      { time: '08:00 - 10:30', label: 'Lesson block 2: Labs and electives' },
      { time: '10:30 - 11:00', label: 'Recess / mentorship' },
      { time: '11:00 - 13:00', label: 'Lesson block 3: Academic review' },
      { time: '13:00 - 14:00', label: 'Lunch & rest' },
      { time: '14:00 - 16:00', label: 'Afternoon lessons' },
      { time: '16:00 - 17:30', label: 'Sports, clubs or workshops' },
      { time: '17:30 - 19:00', label: 'Study hall / homework' },
      { time: '19:00 - 20:30', label: 'Dinner & quiet reading' },
      { time: '20:30 - 21:50', label: 'Prep for tomorrow / lights out' }
    ]
  },
  {
    day: 'Wednesday',
    event: 'Lesson-Focused Day',
    type: 'Academic Priority',
    icon: <CalendarDays size={20} />,
    slots: [
      { time: '05:30 - 06:00', label: 'Morning assembly & devotion' },
      { time: '06:00 - 07:30', label: 'Lesson block 1: Core subjects' },
      { time: '07:30 - 08:00', label: 'Short break & guidance' },
      { time: '08:00 - 10:30', label: 'Lesson block 2: Labs and electives' },
      { time: '10:30 - 11:00', label: 'Recess / mentorship' },
      { time: '11:00 - 13:00', label: 'Lesson block 3: Academic review' },
      { time: '13:00 - 14:00', label: 'Lunch & rest' },
      { time: '14:00 - 16:00', label: 'Afternoon lessons' },
      { time: '16:00 - 17:30', label: 'Sports, clubs or workshops' },
      { time: '17:30 - 19:00', label: 'Study hall / homework' },
      { time: '19:00 - 20:30', label: 'Dinner & quiet reading' },
      { time: '20:30 - 21:50', label: 'Prep for tomorrow / lights out' }
    ]
  },
  {
    day: 'Thursday',
    event: 'Lesson-Focused Day',
    type: 'Academic Priority',
    icon: <CalendarDays size={20} />,
    slots: [
      { time: '05:30 - 06:00', label: 'Morning assembly & devotion' },
      { time: '06:00 - 07:30', label: 'Lesson block 1: Core subjects' },
      { time: '07:30 - 08:00', label: 'Short break & guidance' },
      { time: '08:00 - 10:30', label: 'Lesson block 2: Labs and electives' },
      { time: '10:30 - 11:00', label: 'Recess / mentorship' },
      { time: '11:00 - 13:00', label: 'Lesson block 3: Academic review' },
      { time: '13:00 - 14:00', label: 'Lunch & rest' },
      { time: '14:00 - 16:00', label: 'Afternoon lessons' },
      { time: '16:00 - 17:30', label: 'Sports, clubs or workshops' },
      { time: '17:30 - 19:00', label: 'Study hall / homework' },
      { time: '19:00 - 20:30', label: 'Dinner & quiet reading' },
      { time: '20:30 - 21:50', label: 'Prep for tomorrow / lights out' }
    ]
  },
  {
    day: 'Friday',
    event: 'Lesson-Focused Day',
    type: 'Academic Priority',
    icon: <CalendarDays size={20} />,
    slots: [
      { time: '05:30 - 06:00', label: 'Morning assembly & devotion' },
      { time: '06:00 - 07:30', label: 'Lesson block 1: Core subjects' },
      { time: '07:30 - 08:00', label: 'Short break & guidance' },
      { time: '08:00 - 10:30', label: 'Lesson block 2: Labs and electives' },
      { time: '10:30 - 11:00', label: 'Recess / mentorship' },
      { time: '11:00 - 13:00', label: 'Lesson block 3: Academic review' },
      { time: '13:00 - 14:00', label: 'Lunch & rest' },
      { time: '14:00 - 16:00', label: 'Afternoon lessons' },
      { time: '16:00 - 17:30', label: 'Sports, clubs or workshops' },
      { time: '17:30 - 19:00', label: 'Study hall / homework' },
      { time: '19:00 - 20:30', label: 'Dinner & quiet reading' },
      { time: '20:30 - 21:50', label: 'Prep for tomorrow / lights out' }
    ]
  },
  {
    day: 'Saturday',
    event: 'Weekend Enrichment',
    type: 'Revision & Activities',
    icon: <CalendarDays size={20} />,
    slots: [
      { time: '05:30 - 06:00', label: 'Morning assembly & devotion' },
      { time: '06:00 - 08:00', label: 'Revision lessons' },
      { time: '08:00 - 09:00', label: 'Skills workshop' },
      { time: '09:00 - 10:00', label: 'Community service' },
      { time: '10:00 - 12:00', label: 'Sports & clubs' },
      { time: '12:00 - 13:00', label: 'Lunch & rest' },
      { time: '13:00 - 15:00', label: 'Project work / tutorials' },
      { time: '15:00 - 17:00', label: 'Quiet study' },
      { time: '17:00 - 19:00', label: 'Free time / mentoring' },
      { time: '19:00 - 20:30', label: 'Dinner & discussion' },
      { time: '20:30 - 21:50', label: 'Personal reflection & prep' }
    ]
  },
  {
    day: 'Sunday',
    event: 'Weekend Reflection',
    type: 'Rest & Preparation',
    icon: <CalendarDays size={20} />,
    slots: [
      { time: '05:30 - 06:00', label: 'Morning assembly & devotion' },
      { time: '06:00 - 08:00', label: 'Quiet reading & study' },
      { time: '08:00 - 10:00', label: 'Faith & values session' },
      { time: '10:00 - 12:00', label: 'Family engagement / service' },
      { time: '12:00 - 13:00', label: 'Lunch & rest' },
      { time: '13:00 - 15:00', label: 'Guided study' },
      { time: '15:00 - 17:00', label: 'Preparation for the week' },
      { time: '17:00 - 19:00', label: 'Team reflection & planning' },
      { time: '19:00 - 20:30', label: 'Dinner & quiet reading' },
      { time: '20:30 - 21:50', label: 'Rest and lights out prep' }
    ]
  }
];

const timelineData = [
  { year: '2003', title: 'School Founded', description: 'ES RUNABA opened its doors for the first time with a bold vision to provide quality education to the community.', leader: 'First Headmaster', bg: 'bg-school-blue' },
  { year: '2009', title: 'Academic Expansion', description: 'The school registered its first major milestones in national examinations, establishing its reputation in the district.', leader: 'Second Headmaster', bg: 'bg-school-green' },
  { year: '2017', title: 'A Transformative Era', description: 'Father BAZAMANZA Jean Nepomuscene assumed leadership, bringing a visionary approach to both infrastructure and academics.', leader: 'Father BAZAMANZA Jean Nepomuscene', bg: 'bg-amber-600' },
  { year: '2020', title: 'Infrastructure Boom', description: 'Construction of a massive modern refectory and state-of-the-art laboratories, creating an optimal environment for student growth.', leader: 'Father BAZAMANZA Jean Nepomuscene', bg: 'bg-purple-600' },
  { year: '2023', title: 'Academic Excellence', description: 'Through rigorous academic policies, the student success rate surged from 60% to an unprecedented 99% in both O-Level and A-Level national exams.', leader: 'Father BAZAMANZA Jean Nepomuscene', bg: 'bg-school-blue' },
];

const About = () => {
  const { siteContent } = useAuth();
  const { t } = useTranslation();
  
  if (!siteContent) return <div className="min-h-screen bg-white flex items-center justify-center text-slate-500">Loading...</div>;
  
  const { about, general } = siteContent;
  const replaceSchoolName = (text) => typeof text === 'string' ? text.replace('{schoolName}', general.schoolName) : text;
  return (
    <div className="pb-16 bg-white">
      {/* Hero Section */}
      <section className="relative h-[55vh] min-h-[400px] flex items-center justify-center overflow-hidden">
         {/* Fixed Background Image */}
         <div 
           className="absolute inset-x-0 inset-y-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center bg-fixed"
         />
         {/* Minimal Clarity Overlay */}
         <div className="absolute inset-0 bg-black/20" />
         
         <div className="relative z-10 text-center text-white px-4">
             <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-16 h-16 bg-white/10 backdrop-blur border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
             >
                 <ShieldCheck size={32} className="text-school-green" />
             </motion.div>
             <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-7xl font-black mb-6 text-white drop-shadow-2xl italic tracking-tighter"
             >
                 {replaceSchoolName(t('aboutHeroTitle'))}
             </motion.h1>
             <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl md:text-2xl text-slate-100 uppercase tracking-[0.4em] font-black drop-shadow-lg"
             >
                 {t('aboutHeroSubtitle')}
             </motion.p>
         </div>

         {/* Decorative bottom curve */}
         <div className="absolute bottom-0 left-0 right-0 h-16 bg-white" style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 0, 50% 100%, 0 0)' }}></div>
      </section>

      {/* History & Context */}
      <section className="py-20 px-4 md:px-8 max-w-5xl mx-auto text-center space-y-8">
        <h2 className="text-4xl font-black text-school-blue italic tracking-tighter uppercase">{t('aboutLegacyHeading')}</h2>
        <p className="text-slate-600 leading-relaxed text-xl font-light">
          {replaceSchoolName(t('aboutLegacyText1'))}
        </p>
        <p className="text-slate-600 leading-relaxed text-lg">
          {replaceSchoolName(t('aboutLegacyText2'))}
        </p>
      </section>

      {/* School in Action Section */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col lg:flex-row items-center gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2 relative"
          >
            <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-slate-100 p-2">
              <img 
                src="/about_action_lab_1776438169375.png" 
                alt="Students in Science Lab" 
                className="w-full h-auto rounded-[2.5rem] object-cover"
              />
              <div className="absolute inset-0 bg-school-blue/5 pointer-events-none"></div>
            </div>
            {/* Decals */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-school-green/10 rounded-full blur-3xl -z-10"></div>
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-school-blue/10 rounded-full blur-3xl -z-10"></div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2 space-y-8"
          >
            <div className="space-y-4">
              <span className="text-school-green font-black tracking-[0.4em] uppercase text-[10px] block">{t('aboutSchoolInAction')}</span>
              <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter text-slate-900 leading-[1.1]">{t('aboutActionHeading')}</h2>
              <div className="w-24 h-1.5 bg-school-green"></div>
            </div>
            
            <p className="text-slate-600 leading-relaxed text-lg font-light">
              {t('aboutActionText')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
              <div className="space-y-2">
                <h4 className="text-xl font-bold text-school-blue">Practical Focus</h4>
                <p className="text-sm text-slate-500">Every student spends significant hours in practical sessions across all science combinations.</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-bold text-school-blue">Digital First</h4>
                <p className="text-sm text-slate-500">Integrating technology into every subject to prepare our learners for a globalized economy.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* NEW: School History Timeline */}
      <section id="history" className="py-20 bg-slate-50 relative overflow-hidden">
        {/* Decorative background grid */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-4 md:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="text-school-green font-bold tracking-widest uppercase text-sm mb-2 block">Journey Through Time</span>
            <h2 className="text-4xl font-bold text-slate-800">Our History</h2>
            <div className="w-24 h-1.5 bg-school-green mx-auto mt-6 rounded-full"></div>
          </div>

          <div className="relative border-l-4 border-slate-200 md:mx-auto md:w-max ml-4 md:ml-auto md:border-l-0 md:after:content-[''] md:after:absolute md:after:w-1 md:after:bg-slate-200 md:after:top-0 md:after:bottom-0 md:after:left-1/2 md:after:-ml-0.5">
            {timelineData.map((item, index) => (
              <div key={index} className="relative pl-8 md:pl-0 mb-12 md:mb-20 md:flex md:justify-between md:items-center w-full">
                 {/* Timeline Dot */}
                 <div className={`absolute top-0 left-[-10px] md:left-1/2 md:-ml-3.5 w-6 h-6 rounded-full border-4 border-white shadow ${item.bg} z-10`}></div>

                 {/* Content Box (Left or Right) */}
                 <motion.div 
                    initial={{ opacity: 0, x: index % 2 === 0 ? 50 : -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className={`md:w-[45%] ${index % 2 === 0 ? 'md:ml-auto md:pl-6' : 'md:mr-auto md:pr-6 md:text-right'}`}
                 >
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 hover:shadow-xl transition-shadow relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-2 h-full ${item.bg}`}></div>
                        <div className={`text-4xl font-black opacity-10 absolute -top-2 ${index % 2===0 ? '-right-2' : '-left-2'}`}>
                          {item.year}
                        </div>
                        
                        <div className={`flex items-center gap-2 mb-3 font-bold text-lg ${item.bg.replace('bg-', 'text-')}`}>
                           <CalendarDays size={20} />
                           {item.year}
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">{item.title}</h3>
                        <p className="text-slate-600 mb-4 text-sm leading-relaxed">{item.description}</p>
                        
                        <div className={`pt-4 border-t border-slate-100 flex items-center gap-3 ${index % 2 === 0 ? '' : 'md:flex-row-reverse'}`}>
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border border-slate-300">
                                <User size={16} className="text-slate-500" />
                            </div>
                            <div className="text-left">
                               <p className="text-xs text-slate-400 uppercase font-bold tracking-wider leading-none">Headmaster</p>
                               <p className="text-sm font-semibold text-slate-700">{item.leader}</p>
                            </div>
                        </div>
                    </div>
                 </motion.div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8 text-school-green">
              <ArrowDown size={32} className="mx-auto animate-bounce opacity-50" />
              <p className="font-bold text-xl mt-4 text-slate-800">The Journey Continues...</p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="card border-l-4 border-school-blue shadow-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-school-blue/10 text-school-blue rounded-full">
                <Target size={28} />
              </div>
              <h3 className="text-2xl font-bold">Our Mission</h3>
            </div>
            <p className="text-slate-600 italic">
              "To provide a holistic learning experience that encourages creativity, critical thinking, and innovation, empowering students to become leaders who influence positive change."
            </p>
          </div>

          <div className="card border-l-4 border-school-green shadow-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-school-green/10 text-school-green rounded-full">
                <Eye size={28} />
              </div>
              <h3 className="text-2xl font-bold">Our Vision</h3>
            </div>
            <p className="text-slate-600 italic">
              "To be a premier educational institution recognized for shaping well-rounded individuals capable of contributing meaningfully to society and global development."
            </p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Core Values</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Discipline', icon: <ShieldCheck /> },
            { title: 'Excellence', icon: <Target /> },
            { title: 'Integrity', icon: <Eye /> },
            { title: 'Service', icon: <Target /> },
          ].map((v, i) => (
            <div key={i} className="text-center p-8 bg-slate-50 rounded-2xl shadow-sm border border-slate-100 hover:-translate-y-2 transition-transform">
              <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto text-school-blue mb-4">{v.icon}</div>
              <h4 className="font-bold text-lg">{v.title}</h4>
            </div>
          ))}
        </div>
      </section>

      {/* Weekly Routine Section */}
      <section id="routine" className="py-24 bg-slate-50 text-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.18),_transparent_45%)] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="space-y-4">
              <span className="text-school-blue font-black tracking-[0.4em] uppercase text-[10px] block">Time Management</span>
              <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter">School Routine</h2>
              <div className="w-24 h-1.5 bg-school-blue shadow-[0_0_15px_rgba(59,130,246,0.4)]"></div>
            </div>
            <p className="max-w-md text-slate-600 font-medium italic text-right">
              "A structured day is the foundation of a structured mind. Our routine runs Monday through Sunday from 05:30 AM to 09:50 PM."
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {routines.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-md hover:shadow-xl transition-all"
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="p-4 bg-school-blue/10 text-school-blue rounded-2xl shadow-sm">
                    {item.icon}
                  </div>
                  <span className="text-3xl font-black opacity-20 uppercase tracking-tighter">{item.day}</span>
                </div>
                <h4 className="text-2xl font-black mb-2 uppercase tracking-tight">{item.event}</h4>
                <p className="text-slate-500 text-sm mb-6">{item.type}</p>
                <div className="space-y-3">
                  {item.slots.map((slot, slotIndex) => (
                    <div key={slotIndex} className="flex items-start gap-3 text-slate-600 text-sm">
                      <span className="font-mono text-xs text-school-blue w-24">{slot.time}</span>
                      <span className="leading-tight">{slot.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
             {[
               { t: '05:30 AM', e: 'Day begins' },
               { t: '08:00 AM', e: 'Academic lessons' },
               { t: '12:30 PM', e: 'Midday break' },
               { t: '09:50 PM', e: 'Day closes' }
             ].map((s, i) => (
               <div key={i} className="bg-white border border-slate-200 p-6 rounded-3xl text-center shadow-sm">
                  <p className="text-school-blue font-mono text-sm mb-2">{s.t}</p>
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-[0.3em]">{s.e}</p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Faculty Section */}
      <section id="faculty" className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-20">
            <span className="text-school-green font-black tracking-[0.3em] uppercase text-[10px] mb-4 block">The Pillars of Science</span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter italic">Our Distinguished Faculty</h2>
            <div className="w-24 h-1.5 bg-school-green mx-auto mt-6 shadow-[0_0_15px_rgba(34,197,94,0.4)]"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teachersData.map((teacher, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group bg-slate-50 rounded-[2.5rem] overflow-hidden border border-slate-100 hover:shadow-[0_40px_80px_rgba(0,0,0,0.1)] transition-all flex flex-col h-full"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img 
                    src={teacher.image} 
                    alt={teacher.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                    <p className="text-white text-xs font-light italic leading-relaxed">"{teacher.bio}"</p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 flex flex-col flex-grow">
                  <div className="mb-4">
                    <div className="flex justify-between items-start mb-2">
                       <h3 className="text-xl font-bold text-slate-800 leading-tight">{teacher.name}</h3>
                       <span className="bg-slate-900 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter whitespace-nowrap">{teacher.level}</span>
                    </div>
                    <p className="text-school-green text-[10px] font-black uppercase tracking-widest">{teacher.subjects}</p>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-200 mt-auto">
                    <div className="flex items-center gap-3 text-slate-500">
                      <Briefcase size={16} className="text-school-blue" />
                      <span className="text-xs font-bold">{teacher.experience} Experience</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500">
                      <Phone size={16} className="text-school-blue" />
                      <span className="text-xs font-bold">{teacher.phone}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Head Teacher Message */}
      <section id="headteacher" className="py-20 px-4 max-w-6xl mx-auto">
        <div className="bg-school-blue text-white rounded-[3rem] p-8 md:p-12 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
          
          <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
            <div className="w-full md:w-1/3">
              <div className="aspect-square bg-slate-200 rounded-3xl overflow-hidden border-8 border-white/10 shadow-2xl">
                <img 
                  src={about.headTeacher.image} 
                  alt={about.headTeacher.name} 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="w-full md:w-2/3 space-y-6">
              <Quote size={64} className="text-school-green opacity-30 absolute -top-4 -left-6" />
              <div className="relative">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Message from the Head Teacher</h2>
                <p className="text-slate-200 text-lg md:text-xl italic leading-relaxed font-light">
                  "{about.headTeacher.message}"
                </p>
              </div>
              <div className="pt-6 border-t border-white/20">
                <p className="font-bold text-2xl text-school-green tracking-tight">{about.headTeacher.name}</p>
                <p className="text-slate-400 font-medium tracking-wide uppercase text-sm mt-1">{about.headTeacher.role}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Innovation & Students */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-slate-200 pt-16">
          {/* Developer Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-school-green/10 text-school-green rounded-2xl">
                <Cpu size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">Innovation & Technology</h3>
            </div>
            <p className="text-slate-600 leading-relaxed text-lg">
              Our school's digital infrastructure and systems are meticulously designed and maintained by our technical division. We ensure that technology seamlessly empowers learning and administration, keeping ES RUNABA at the forefront of modern education.
            </p>
          </div>

          {/* Student Body Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-school-blue/10 text-school-blue rounded-2xl">
                <Users size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">Our Vibrant Student Body</h3>
            </div>
            <p className="text-slate-600 leading-relaxed text-lg">
              Our students are the heartbeat of ES RUNABA. They actively engage in diverse projects, extracurricular activities, and community service, making us proud through their achievements and character.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
