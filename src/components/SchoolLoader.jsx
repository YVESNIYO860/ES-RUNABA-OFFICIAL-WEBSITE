import React from 'react';
import { motion } from 'framer-motion';

const SchoolLoader = () => {
  const navy = "#1a3a5a";
  const gold = "#c5a059";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 fixed inset-0 z-[100]">
      <div className="relative flex items-center justify-center w-48 h-48">
        
        {/* Rotating Outer Ring */}
        <motion.svg
          className="absolute w-full h-full"
          viewBox="0 0 100 100"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={navy}
            strokeWidth="2"
            strokeOpacity="0.1"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={gold}
            strokeWidth="3"
            strokeDasharray="70 200"
            strokeLinecap="round"
          />
        </motion.svg>

        {/* Center Icon: Candle & Book */}
        <div className="flex flex-col items-center">
          {/* Flame */}
          <motion.div
            animate={{ 
              scaleY: [1, 1.3, 0.9, 1.1, 1],
              opacity: [0.7, 1, 0.8, 0.9, 0.7],
              rotate: [-2, 2, -1, 3, 0],
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            style={{
              width: '14px',
              height: '24px',
              backgroundColor: '#ff9d00',
              backgroundImage: 'radial-gradient(circle at 50% 100%, #ffffff 0%, #ffde00 30%, #ff9d00 60%, rgba(255, 69, 0, 0) 100%)',
              borderRadius: '50% 50% 35% 35% / 80% 80% 20% 20%',
              boxShadow: '0 -5px 20px #ff9d00, 0 0 40px rgba(255, 157, 0, 0.4)',
              marginBottom: '-2px',
              zIndex: 10
            }}
          />
          
          {/* Candle */}
          <div 
            className="w-4 h-12 bg-white border-2 rounded-sm" 
            style={{ borderColor: navy }}
          />
          
          {/* Book */}
          <div 
            className="w-12 h-2 mt-1 rounded-sm" 
            style={{ backgroundColor: navy }} 
          />
        </div>
      </div>

      {/* Text Branding */}
      <div className="mt-8 text-center">
        <h1 
          className="text-2xl font-bold tracking-widest uppercase"
          style={{ color: navy, fontFamily: 'serif' }}
        >
          ES RUNABA
        </h1>
        
        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-sm italic font-medium tracking-wide uppercase"
          style={{ color: gold }}
        >
          Ora Pro Nobis
        </motion.p>
      </div>
    </div>
  );
};

export default SchoolLoader;
