import React from 'react';
import { BookOpen, FlaskConical, Globe, Code, Binary, Pi, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '../context/TranslationContext';

const Academics = () => {
  const { t } = useTranslation();
  const combinations = [
    {
      code: 'MEG',
      name: 'Mathematics, Economics & Geography',
      icon: <Globe size={40} className="text-school-blue" />,
      description: 'Prepares students for careers in social sciences, economics, town planning, and environmental management.',
      subjects: ['Core Mathematics', 'Economics', 'Geography', 'General Paper', 'Entrepreneurship']
    },
    {
      code: 'MCE',
      name: 'Mathematics, Computer Science & Economics',
      icon: <Code size={40} className="text-school-green" />,
      description: 'A modern combination focused on logical thinking, programming, and economic principles.',
      subjects: ['Core Mathematics', 'Computer Science', 'Economics', 'General Paper', 'Entrepreneurship']
    },
    {
      code: 'PCB',
      name: 'Physics, Chemistry & Biology',
      icon: <FlaskConical size={40} className="text-red-500" />,
      description: 'The foundation for medical sciences, engineering, and research fields.',
      subjects: ['Physics', 'Chemistry', 'Biology', 'Subsidiary Math', 'General Paper']
    }
  ];

  return (
    <div className="pb-20 bg-white">
      {/* Hero Section */}
      <section className="relative h-[55vh] min-h-[400px] flex items-center justify-center overflow-hidden">
         {/* Fixed Background Image */}
         <div 
           className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center bg-fixed"
         />
         {/* Minimal Clarity Overlay */}
         <div className="absolute inset-0 bg-black/30" />
         
         <div className="relative z-10 text-center text-white px-4">
             <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-16 h-16 bg-white/10 backdrop-blur border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
             >
                 <BookOpen size={32} className="text-white" />
             </motion.div>
             <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-7xl font-black mb-6 text-white drop-shadow-2xl italic tracking-tighter"
             >
                 {t('academicsHeroTitle')}
             </motion.h1>
             <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl md:text-2xl text-slate-100 max-w-2xl mx-auto font-light drop-shadow-lg"
             >
                 {t('academicsHeroSubtitle')}
             </motion.p>
         </div>
      </section>

      {/* Ordinary Level */}
      <section className="section-padding">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="w-full md:w-1/2 space-y-6">
            <h2 className="text-3xl font-bold">{t('academicsOLevelTitle')}</h2>
            <p className="text-slate-600 leading-relaxed text-lg">
              {t('academicsOLevelText')}
            </p>
            <div className="grid grid-cols-2 gap-4">
              {['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Kinyarwanda', 'English', 'French', 'Geography', 'History', 'ICT'].map((sub, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <div className="w-2 h-2 rounded-full bg-school-green"></div>
                  <span className="text-sm font-bold">{sub}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="w-full md:w-1/2 p-6 md:p-12 bg-slate-50 rounded-[3rem] border border-slate-100 relative">
            <div className="absolute top-8 left-8 w-12 h-12 bg-school-blue/10 rounded-full flex items-center justify-center text-school-blue">
                <Globe size={24} />
            </div>
            <div className="pt-12">
               <h4 className="text-2xl font-bold text-school-blue mb-4">{t('academicsFocusHeading')}</h4>
               <p className="text-lg text-slate-600 leading-relaxed italic border-l-4 border-school-green pl-6">{t('academicsFocusText')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Level */}
      <section className="bg-slate-50 py-32 px-4 md:px-8 border-y border-slate-200 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-1/3 h-1/3 bg-school-green/5 rounded-tl-full pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="text-school-green font-black tracking-[0.3em] uppercase text-[10px] mb-4 block">{t('academicsSpecializationsTag')}</span>
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter italic shadow-sm">{t('academicsSectionTitle')}</h2>
            <div className="w-24 h-1.5 bg-school-green mx-auto mt-6 shadow-[0_0_15px_rgba(34,197,94,0.4)]"></div>
          </motion.div>
 
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {combinations.map((comb, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-[2.5rem] p-10 shadow-[0_10px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.12)] transition-all flex flex-col group hover:-translate-y-4 border border-slate-100"
              >
                <div className="mb-8 flex justify-between items-center">
                  <div className="p-5 rounded-3xl bg-slate-50 group-hover:bg-school-blue/5 transition-all rotate-3 group-hover:rotate-0">
                      {comb.icon}
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="bg-slate-900 text-white px-5 py-1.5 rounded-full text-[10px] font-black tracking-widest shadow-lg">{comb.code}</span>
                  </div>
                </div>
                <h3 className="text-3xl font-black mb-6 tracking-tight text-slate-800 italic uppercase underline decoration-school-green decoration-4 underline-offset-8">{comb.name}</h3>
                <p className="text-slate-500 mb-10 flex-grow leading-relaxed font-light text-lg">{comb.description}</p>
                
                <div className="bg-slate-50 rounded-[2rem] p-8 mt-auto border border-slate-100 group-hover:bg-white transition-colors">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 block">{t('academicsCoreSubjects')}</p>
                  <ul className="space-y-4">
                    {comb.subjects.map((s, idx) => (
                      <li key={idx} className="flex items-center gap-4 text-base font-bold text-slate-700">
                        <div className="bg-school-green/20 p-1.5 rounded-full text-school-green">
                            <CheckCircle size={14} />
                        </div>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
 
      {/* Laboratories & Resources */}
      <section className="py-32 px-4 md:px-8 max-w-7xl mx-auto">
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-slate-900 text-white rounded-[4rem] p-10 md:p-24 overflow-hidden relative shadow-[0_50px_100px_rgba(0,0,0,0.3)] border border-white/5"
        >
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-school-green/10 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-school-blue/20 rounded-full blur-[100px] -ml-48 -mb-48 pointer-events-none"></div>
 
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10">
              <div className="space-y-4">
                <span className="text-school-green font-black tracking-[0.4em] uppercase text-[10px] block mb-4">{t('academicsFacilitiesHeading')}</span>
                <h2 className="text-4xl md:text-6xl font-black mb-6 text-white leading-[1.1] tracking-tighter italic">{t('academicsFacilitiesTitle')}</h2>
                <div className="w-24 h-1.5 bg-school-green shadow-[0_0_15px_rgba(34,197,94,0.6)]"></div>
              </div>
              <p className="text-slate-300 text-xl leading-relaxed font-light">
                {t('academicsFacilitiesText')}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                    { icon: <Binary className="text-school-green" size={28} />, name: 'Advanced ICT Lab' },
                    { icon: <FlaskConical className="text-school-green" size={28} />, name: 'Modern Science Labs' },
                    { icon: <Globe className="text-school-green" size={28} />, name: 'Digital Library' }
                ].map((f, i) => (
                    <motion.div 
                        key={i}
                        whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                        className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 px-6 py-5 rounded-2xl font-black tracking-tight"
                    >
                        {f.icon}
                        <span className="uppercase text-[10px] tracking-widest">{f.name}</span>
                    </motion.div>
                ))}
              </div>
            </div>
            
            <div className="relative group">
                <div className="absolute -inset-4 bg-school-green/20 rounded-[3rem] blur-3xl group-hover:bg-school-green/30 transition-all"></div>
                <div className="relative rounded-[3rem] overflow-hidden aspect-[4/5] shadow-2xl border-4 border-white/20">
                  <img 
                    src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2070&auto=format&fit=crop" 
                    alt="Science Lab" 
                    className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000"
                  />
                </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Academics;
