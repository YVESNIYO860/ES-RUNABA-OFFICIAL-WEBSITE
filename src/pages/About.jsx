import React from 'react';
import { motion, useSpring } from 'framer-motion';
import { Target, Eye, ShieldCheck, Quote, Cpu, Users, CalendarDays, ArrowDown, User, Briefcase, MapPin, Phone, HandHeart, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ProfileAvatar from '../components/ProfileAvatar';
import { schoolPhotoUrls } from '../utils/schoolPhotoUrls';
import labImage from '../assets/school-photos/school photos (6).jpeg'; 

const teachersData = [
  {
    area: 'Sciences',
    subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Subsidiary Math'],
    level: 'O-Level and A-Level'
  },
  {
    area: 'Languages and Humanities',
    subjects: ['Kinyarwanda', 'English', 'French', 'Geography', 'History'],
    level: 'O-Level'
  },
  {
    area: 'ICT and Computing',
    subjects: ['ICT', 'Computer Science'],
    level: 'O-Level and A-Level'
  },
  {
    area: 'Economics and Entrepreneurship',
    subjects: ['Economics', 'Entrepreneurship', 'General Paper'],
    level: 'A-Level'
  }
];

const routineSchedule = [
  { day: 'Monday', morning: ['07:30 AM - Morning assembly', '08:00 AM - Morning lessons'], midday: ['10:30 AM - Short break', '12:30 PM - Lunch break'], afternoon: ['02:00 PM - Afternoon session'], evening: ['No special event listed'] },
  { day: 'Tuesday', morning: ['08:00 AM - Morning lessons'], midday: ['10:30 AM - Short break', '12:30 PM - Lunch break'], afternoon: ['02:00 PM - Afternoon session'], evening: ['No special event listed'] },
  { day: 'Wednesday', morning: ['08:00 AM - Morning lessons'], midday: ['10:30 AM - Short break', '12:30 PM - Lunch break'], afternoon: ['02:00 PM - Afternoon session'], evening: ['04:00 PM - Sports and PE'] },
  { day: 'Thursday', morning: ['08:00 AM - Morning lessons'], midday: ['10:30 AM - Short break', '12:30 PM - Lunch break'], afternoon: ['02:00 PM - Afternoon session'], evening: ['No special event listed'] },
  { day: 'Friday', morning: ['08:00 AM - Morning lessons'], midday: ['10:30 AM - Short break', '12:30 PM - Lunch break'], afternoon: ['02:00 PM - Afternoon session'], evening: ['04:30 PM - Holy Mass'] },
  { day: 'Saturday', morning: ['No school routine listed'], midday: ['No school routine listed'], afternoon: ['No school routine listed'], evening: ['No school routine listed'] },
  { day: 'Sunday', morning: ['No school routine listed'], midday: ['No school routine listed'], afternoon: ['No school routine listed'], evening: ['No school routine listed'] }
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
  const logoX = useSpring(0, { stiffness: 120, damping: 24 });
  const logoY = useSpring(0, { stiffness: 120, damping: 24 });

  const handleCoreValuesPointerMove = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    logoX.set((event.clientX - bounds.left - bounds.width / 2) * 0.018);
    logoY.set((event.clientY - bounds.top - bounds.height / 2) * 0.018);
  };

  const resetCoreValuesLogo = () => {
    logoX.set(0);
    logoY.set(0);
  };
  
  if (!siteContent) return <div className="min-h-screen bg-white flex items-center justify-center text-slate-500">Loading...</div>;

  const { about, general } = siteContent;
  const schoolLeaders = [
    {
      role: 'Head Teacher',
      name: about?.headTeacher?.name,
      phone: '0788 859 152',
      avatarRole: 'teacher',
      description: 'Guiding the school community and supporting every learner’s growth.'
    },
    {
      role: 'Director of Studies',
      name: 'UWIZEYIMANA Jean Dedieu',
      phone: '0783505100',
      avatarRole: 'dos',
      description: 'Coordinating teaching and learning to support strong academic progress.'
    },
    {
      role: 'Secretary',
      avatarRole: 'teacher',
      description: 'Supporting school communication and day-to-day administration.'
    },
    {
      role: 'Bursar',
      phone: '0788424660',
      avatarRole: 'dos',
      description: 'Managing school finances and supporting responsible use of resources.'
    }
  ];

  return (
    <div className="pb-16 bg-white">
      {/* Hero Section */}
      <section className="relative h-[55vh] min-h-[400px] flex items-center justify-center overflow-hidden">
         {/* Fixed Background Image */}
         <div 
           className="absolute inset-x-0 inset-y-0 bg-cover bg-center bg-fixed"
           style={{ backgroundImage: `url('${schoolPhotoUrls[0] ?? '/slide_campus.png'}')` }}
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
                 About {general.schoolName}
             </motion.h1>
             <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl md:text-2xl text-slate-100 uppercase tracking-[0.4em] font-black drop-shadow-lg"
             >
                 {about.hero.motto}
             </motion.p>
         </div>

         {/* Decorative bottom curve */}
         <div className="absolute bottom-0 left-0 right-0 h-16 bg-white" style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 0, 50% 100%, 0 0)' }}></div>
      </section>

      {/* History & Context */}
      <section className="relative isolate mx-auto max-w-5xl overflow-hidden py-20 px-4 text-center md:px-8">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
          <img src="/runaba-logo.png" alt="" className="w-[min(76vw,400px)] opacity-[0.18] dark:opacity-[0.23]" />
        </div>
        <div className="relative z-10 space-y-8">
          <h2 className="text-4xl font-black text-school-blue italic tracking-tighter uppercase">Our Legacy of Excellence</h2>
          <p className="text-slate-600 leading-relaxed text-xl font-light">
            {general.schoolName} stands as a beacon of academic excellence in the region. Founded in 2003 with a vision to transform lives through quality education, our institution has evolved into a prestigious center for holistic development, guided by a total of three visionary leaders throughout its history.
          </p>
          <p className="text-slate-600 leading-relaxed text-lg">
            At {general.schoolName}, we pride ourselves on our strong integration with the community and the history of our academic combinations. We work closely with parents and local leaders to create a conducive environment for learning, where every student is valued, respected, and supported in their unique educational journey.
          </p>
        </div>
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
                src={labImage} 
                alt="RUNABA Laboratory Exterior" 
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
              <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter text-slate-900 leading-[1.1]">Where Theory Meets Hands-On Innovation</h2>
              <div className="w-24 h-1.5 bg-school-green"></div>
            </div>
            
            <p className="text-slate-600 leading-relaxed text-lg font-light">
              At ES RUNABA, we don't just teach from textbooks. Our world-class laboratories and ICT facilities are active hubs where students experiment, fail, refine, and eventually master the skills of the future. 
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
        <div className="absolute inset-0 bg-school-green/10 opacity-30 pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-4 md:px-8 relative z-10">
          <div className="text-center mb-16">
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
                               <p className="text-xs text-slate-400 leading-none">Headmaster</p>
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
      <section className="bg-white py-20 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="card border-l-4 border-school-blue shadow-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-school-blue/10 text-school-blue rounded-full">
                <Target size={28} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Our Mission</h3>
            </div>
            <p className="text-slate-600 italic dark:text-slate-300">
              "To educate each person in their full humanity and integrity."
            </p>
          </div>

          <div className="card border-l-4 border-school-green shadow-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-school-green/10 text-school-green rounded-full">
                <Eye size={28} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Our Vision</h3>
            </div>
            <p className="text-slate-600 italic dark:text-slate-300">
              "Vision for Excellence: to become a classic school."
            </p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section onPointerMove={handleCoreValuesPointerMove} onPointerLeave={resetCoreValuesLogo} className="relative isolate overflow-hidden bg-[#f4f8f6] py-20 dark:bg-slate-950">
        <motion.img aria-hidden="true" src="/runaba-logo.png" alt="" style={{ x: logoX, y: logoY }} className="pointer-events-none absolute left-1/2 top-[58%] z-0 w-[min(58vw,520px)] -translate-x-1/2 -translate-y-1/2 opacity-10" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-school-green">What guides us</p>
            <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white md:text-5xl">Core Values</h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
              The principles that shape how we learn, work together, and care for others.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: 'Humility', icon: <HandHeart />, description: 'We learn with open minds, serve with respect, and recognize there is always room to grow.' },
              { title: 'Unity', icon: <Users />, description: 'We work together as one school community, valuing every person and supporting one another.' },
              { title: "God's Love", icon: <Heart />, description: "We reflect God's love through compassion, kindness, forgiveness, and care for all." },
              { title: 'Creativity', icon: <Cpu />, description: 'We encourage curiosity, imagination, and original thinking in learning and problem-solving.' },
              { title: 'Service to Others', icon: <Briefcase />, description: 'We put care into action by helping others and contributing to our community.' },
              { title: 'Self-Confidence', icon: <User />, description: 'We help learners trust their abilities and approach new challenges with courage.' },
              { title: 'Competitiveness', icon: <Target />, description: 'We strive for excellence through effort, teamwork, and respect for others.' },
              { title: 'Commitment', icon: <ShieldCheck />, description: 'We stay dedicated to learning, our responsibilities, and the goals we share.' },
              { title: 'Honesty', icon: <Eye />, description: 'We tell the truth, act with integrity, and take responsibility for our choices.' },
            ].map((value, index) => (
              <motion.article
                key={value.title}
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                className="rounded-lg border border-slate-200 p-6 shadow-sm transition-shadow hover:border-school-green/50 hover:shadow-md dark:border-slate-800"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-school-blue/10 text-school-blue dark:bg-sky-300/10 dark:text-sky-300">
                    {React.cloneElement(value.icon, { size: 20, strokeWidth: 1.8 })}
                  </span>
                  <span className="font-mono text-xs font-semibold text-slate-400 dark:text-slate-500">{String(index + 1).padStart(2, '0')}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{value.title}</h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-600 dark:text-slate-300">{value.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* School Leadership */}
      <section id="leadership" aria-labelledby="school-leadership-heading" className="bg-slate-50 py-20 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-12 text-center">
            <h2 id="school-leadership-heading" className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">School Leadership</h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-300">Meet the team guiding learning and supporting our school community.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {schoolLeaders.map((leader) => (
              <article key={leader.role} className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <ProfileAvatar
                  user={{ role: leader.avatarRole, fullName: leader.name || leader.role }}
                  size={88}
                  ringClassName="ring-4 ring-slate-100 dark:ring-slate-800"
                  title={`${leader.role} avatar`}
                />
                <div className="mt-5">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{leader.role}</h3>
                  {leader.name && <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">{leader.name}</p>}
                  <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{leader.description}</p>
                </div>
                <div className="mt-auto border-t border-slate-200 pt-4 dark:border-slate-700">
                  {leader.phone ? (
                    <a href={`tel:${leader.phone.replace(/\s/g, '')}`} className="inline-flex items-center gap-2 text-sm font-semibold text-school-blue hover:text-school-green dark:text-sky-300">
                      <Phone size={16} aria-hidden="true" />
                      {leader.phone}
                    </a>
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">Phone number to be added</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Faculty Section */}
      <section id="faculty" className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter italic">Our Teachers</h2>
            <div className="w-24 h-1.5 bg-school-green mx-auto mt-6 shadow-[0_0_15px_rgba(34,197,94,0.4)]"></div>
            <p className="mx-auto mt-5 max-w-2xl text-slate-600">
              Meet the subject areas taught at ES RUNABA. Teacher names, photos, experience, and telephone details will be added soon.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teachersData.map((teacher, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 hover:shadow-[0_24px_48px_rgba(0,0,0,0.1)] transition-all flex flex-col h-full"
              >
                {/* Image Container */}
                <div role="img" aria-label={`${teacher.area} teacher photo placeholder`} className="flex aspect-[4/3] flex-col items-center justify-center bg-[#eef4f1]">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-school-blue text-white shadow-lg ring-4 ring-school-green/20">
                    <User size={40} aria-hidden="true" />
                  </div>
                  <span className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">Teacher photo to be added</span>
                </div>

                {/* Content */}
                <div className="flex flex-grow flex-col p-6">
                  <div className="mb-4">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-school-blue">{teacher.level}</p>
                    <h3 className="text-xl font-bold text-slate-900">{teacher.area}</h3>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Lessons taught</p>
                    <ul className="flex flex-wrap gap-2">
                      {teacher.subjects.map((subject) => (
                        <li key={subject} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">{subject}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-auto space-y-3 border-t border-slate-200 pt-4">
                    <div className="flex items-center gap-3 text-slate-500">
                      <Briefcase size={16} className="text-school-blue" />
                      <span className="text-xs font-bold">Years of experience: To be added</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500">
                      <Phone size={16} className="text-school-blue" />
                      <span className="text-xs font-bold">Telephone: To be added</span>
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
              <div className="aspect-square bg-school-green/15 rounded-3xl border-8 border-white/10 shadow-2xl flex flex-col items-center justify-center text-center">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-school-green text-school-blue flex items-center justify-center shadow-xl border-4 border-white/30">
                  <span className="text-6xl md:text-7xl font-black tracking-tight">FB</span>
                </div>
                <span className="mt-6 text-xs font-black uppercase tracking-[0.25em] text-white/70">Head Teacher</span>
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
                <p className="text-slate-400 font-medium text-sm mt-1">{about.headTeacher.role}</p>
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

      {/* Weekly Routine */}
      <section id="routine" className="relative overflow-hidden bg-slate-900 py-20 text-white">
        <div className="absolute inset-0 bg-[url('/slide_campus.png')] bg-cover bg-fixed opacity-10 blur-[2px]"></div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-10 space-y-4">
            <h2 className="text-4xl font-black italic tracking-tight md:text-5xl">School Routine</h2>
            <div className="h-1.5 w-24 bg-school-green"></div>
            <p className="max-w-3xl text-sm leading-relaxed text-slate-300">
              Weekday lesson times and listed school activities are shown below. Weekend routines have not been provided.
            </p>
          </div>
          <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <caption className="sr-only">School routine from Monday through Sunday, morning to evening</caption>
              <thead className="bg-white/10 text-xs uppercase tracking-wide text-school-green">
                <tr>
                  <th scope="col" className="px-5 py-4">Day</th>
                  <th scope="col" className="px-5 py-4">Morning</th>
                  <th scope="col" className="px-5 py-4">Midday</th>
                  <th scope="col" className="px-5 py-4">Afternoon</th>
                  <th scope="col" className="px-5 py-4">Evening</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-sm text-slate-200">
                {routineSchedule.map((day) => (
                  <tr key={day.day} className="align-top transition-colors hover:bg-white/5">
                    <th scope="row" className="whitespace-nowrap px-5 py-4 font-bold text-white">{day.day}</th>
                    {['morning', 'midday', 'afternoon', 'evening'].map((period) => (
                      <td key={period} className="min-w-48 px-5 py-4">
                        {day[period].map((activity) => (
                          <p key={activity} className="mb-1 last:mb-0">{activity}</p>
                        ))}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
