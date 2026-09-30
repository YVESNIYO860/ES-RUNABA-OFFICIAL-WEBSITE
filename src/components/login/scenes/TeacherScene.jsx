import React from 'react';
import { Arm, Body, Face, Head, Leg } from './CartoonParts';

/* Teacher standing beside a chalkboard, arm writing/pointing. */
const TeachingTeacher = ({ skin = '#C68642', shirt = '#FFFFFF', trouser = '#003366', accent = '#2E7D32' }) => (
  <div className="relative">
    <div style={{ animation: 'scene-bob 3s ease-in-out infinite' }} className="relative">
      <div className="absolute left-1/2 -bottom-3 h-3 w-32 -translate-x-1/2 rounded-[50%] bg-school-green-dark/15" />

      {/* Legs */}
      <div className="absolute left-1/2 top-[86px] -translate-x-1/2">
        <div className="relative h-9 w-14">
          <Leg color={trouser} style={{ left: 16 }} />
          <Leg color={trouser} reverse style={{ left: 40 }} />
        </div>
      </div>

      {/* Body */}
      <div className="relative z-10 ml-6">
        <Body color={shirt}>
          {/* Shirt tie / accent stripe */}
          <div className="absolute left-1/2 top-0 h-full w-[6px] -translate-x-1/2" style={{ background: accent }} />
          {/* Writing arm reaching to the board */}
          <Arm color={shirt} duration="2.6s" style={{ right: -6, top: 8, transform: 'rotate(-64deg)' }} />
          {/* Other arm relaxed */}
          <Arm color={shirt} reverse duration="3.4s" style={{ left: 4, top: 12, transform: 'rotate(14deg)' }} />
        </Body>

        <div className="relative z-20 -mt-1 ml-[3px]">
          <Head skin={skin} hair="#1F2937">
            <Face />
          </Head>
        </div>
      </div>
    </div>
  </div>
);

/* Chalkboard with a diagram that "draws" itself, plus chalk dust. */
const Chalkboard = () => (
  <div className="relative">
    {/* Board */}
    <div className="relative h-40 w-56 rounded-lg border-[6px] border-school-green-dark bg-school-green-dark p-3 shadow-2xl">
      {/* Chalk writing lines */}
      <div className="space-y-2">
        {[100, 80, 90].map((width, index) => (
          <div
            key={width}
            className="h-[5px] rounded-full bg-white/70"
            style={{
              width: `${width}%`,
              animation: `chalk-puff 3.6s ease-in-out infinite ${index * 0.5}s`
            }}
          />
        ))}
      </div>

      {/* Triangle diagram */}
      <svg viewBox="0 0 100 60" className="absolute bottom-3 right-3 h-14 w-20">
        <polygon
          points="50,4 96,56 4,56"
          fill="none"
          stroke="#FDE68A"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 200,
            strokeDashoffset: 200,
            animation: 'chalk-puff 4.5s ease-in-out infinite'
          }}
        />
      </svg>

      {/* Chalk dust particles near the teacher's hand */}
      {[0, 1, 2, 3].map((particle) => (
        <span
          key={particle}
          className="absolute h-1.5 w-1.5 rounded-full bg-white/70"
          style={{
            right: 4 + particle * 5,
            top: 92 + (particle % 2) * 6,
            animation: `chalk-puff 3s ease-out infinite ${particle * 0.7}s`
          }}
        />
      ))}

      {/* Chalk tray */}
      <div className="absolute -bottom-3 left-3 right-3 h-2.5 rounded-full bg-school-green-dark" />
      <div className="absolute -bottom-1 left-6 h-2 w-8 rounded-full bg-white/80" />
    </div>
  </div>
);

const TeacherScene = () => (
  <div className="scene-animate pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
    <div className="absolute bottom-1 right-1 flex origin-bottom-right scale-[0.6] items-end gap-2 sm:bottom-6 sm:right-10 sm:scale-100 sm:gap-8">
      <Chalkboard />
      <TeachingTeacher />
    </div>

    {/* Floating question marks */}
    <div className="absolute right-6 top-12 hidden text-school-green/50 sm:block">
      {['?', '!', '?'].map((mark, index) => (
        <span
          key={`${mark}-${index}`}
          className="absolute text-3xl font-black"
          style={{
            left: index * 26,
            top: index * 20,
            animation: `scene-drift-slow ${3 + index * 0.7}s ease-in-out infinite`,
            animationDelay: `${index * 0.4}s`
          }}
        >
          {mark}
        </span>
      ))}
    </div>
  </div>
);

export default TeacherScene;
