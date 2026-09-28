import React, { useSyncExternalStore } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LoaderCircle } from 'lucide-react';
import { getLearningActivitySnapshot, subscribeLearningActivity } from '../utils/learningActivity';

const MotionDiv = motion.div;

const LearningActivityOverlay = () => {
  const activity = useSyncExternalStore(
    subscribeLearningActivity,
    getLearningActivitySnapshot,
    getLearningActivitySnapshot
  );

  return (
    <AnimatePresence>
      {activity.active && (
        <MotionDiv
          role="status"
          aria-live="polite"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/25 px-4 backdrop-blur-[3px]"
        >
          <MotionDiv
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <div className="flex items-center gap-4">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
                <LoaderCircle className="absolute inset-0 h-14 w-14 animate-spin text-school-green motion-reduce:animate-none" strokeWidth={1.5} />
                <img src="/runaba-logo.png" alt="" className="h-9 w-9 object-contain" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-school-green">ES RUNABA E-Learning</p>
                <p className="mt-1 text-base font-semibold text-slate-900">{activity.message}</p>
                <p className="mt-1 text-xs text-slate-500">Please wait while your workspace updates.</p>
              </div>
            </div>
            <div className="mt-5 h-1 overflow-hidden rounded-full bg-slate-100">
              <motion.div
                className="h-full w-1/3 rounded-full bg-school-green"
                animate={{ x: ['-100%', '300%'] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </MotionDiv>
        </MotionDiv>
      )}
    </AnimatePresence>
  );
};

export default LearningActivityOverlay;