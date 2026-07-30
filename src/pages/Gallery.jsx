import React, { useState } from 'react';
import { X, Maximize2, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Gallery = () => {
  const { siteContent } = useAuth();
  const branding = siteContent?.general || { schoolName: "ES RUNABA" };

  const photoModules = import.meta.glob('../assets/school-photos/*.{jpg,jpeg,png,webp}', { eager: true, as: 'url' });
  const images = Object.entries(photoModules).map(([path, url]) => {
    const name = path.split('/').pop()?.replace(/\.(jpe?g|png|webp)$/i, '') || 'School Photo';
    const caption = name.replace(/[-_]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
    return { url: String(url), caption };
  });

  const defaultImages = [
    { url: '/slide_classroom.png', caption: 'Main Building' },
    { url: '/slide_sports.png', caption: 'Students in Class' },
    { url: '/slide_lab.png', caption: 'Science Lab Session' },
    { url: '/slide_graduation.png', caption: 'Graduation Day' },
    { url: '/slide_campus.png', caption: 'Campus View' },
    { url: '/runaba-logo.png', caption: 'School Logo' },
    { url: '/slide_classroom.png', caption: 'Learning Space' },
    { url: '/slide_sports.png', caption: 'Sports Event' },
  ];

  const displayedImages = images.length > 0 ? images : defaultImages;

  const [selectedImg, setSelectedImg] = useState(null);

  return (
    <div className="pb-20 bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[55vh] min-h-[400px] flex items-center justify-center overflow-hidden">
         {/* Fixed Background Image */}
         <div 
           className="absolute inset-x-0 inset-y-0 bg-[url('/slide_classroom.png')] bg-cover bg-center bg-fixed"
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
                 <ImageIcon size={32} className="text-white" />
             </motion.div>
             <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-7xl font-black mb-6 text-white drop-shadow-2xl italic tracking-tighter"
             >
                 School Gallery
             </motion.h1>
             <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl md:text-2xl text-slate-100 max-w-2xl mx-auto font-light drop-shadow-lg"
             >
                 Glimpses of life, learning, and success at {branding.schoolName}.
             </motion.p>
         </div>
      </section>

      <section className="py-16 md:py-24 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayedImages.map((img, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={idx} 
              className="group relative cursor-pointer overflow-hidden rounded-2xl bg-slate-200 aspect-square shadow-sm hover:shadow-xl transition-all"
              onClick={() => setSelectedImg(img)}
            >
              <img 
                src={img.url} 
                alt={img.caption} 
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-school-blue/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                <div className="bg-white/20 p-4 rounded-full">
                    <Maximize2 className="text-white" size={32} />
                </div>
              </div>
              <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent translate-y-2 group-hover:translate-y-0 transition-transform">
                <p className="text-white text-sm font-bold uppercase tracking-wider">{img.caption}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Lightbox */}
      {selectedImg && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-12 transition-all backdrop-blur-md">
          <button 
            className="absolute top-8 right-8 text-white/50 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all"
            onClick={() => setSelectedImg(null)}
          >
            <X size={32} />
          </button>
          
          <div className="max-w-6xl w-full flex flex-col items-center">
            <img 
              src={selectedImg.url} 
              alt={selectedImg.caption} 
              className="max-h-[85vh] w-auto rounded-xl shadow-2xl border border-white/10"
            />
            <div className="mt-6 flex flex-col items-center">
                <p className="text-white text-2xl font-bold tracking-wide">{selectedImg.caption}</p>
                <div className="mt-4 h-1 w-12 bg-school-green rounded-full"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
