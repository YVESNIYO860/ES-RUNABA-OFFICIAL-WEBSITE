import React from 'react';
import { Arm, Body, Face, Head, Leg } from './CartoonParts';

/* The leader: taller figure holding a waving flag. */
const Leader = () => (
  <div className="relative">
    <div style={{ animation: 'scene-bob 2.6s ease-in-out infinite' }} className="relative">
      <div className="absolute left-1/2 -bottom-3 h-3 w-36 -translate-x-1/2 rounded-[50%] bg-black/40" />

      {/* Legs */}
      <div className="absolute left-1/2 top-[96px] -translate-x-1/2">
        <div className="relative h-10 w-16">
          <Leg color="#001F3F" style={{ left: 18 }} duration="1s" />
          <Leg color="#001F3F" reverse style={{ left: 44 }} duration="1s" />
        </div>
      </div>

      {/* Body with green sash to read as leadership */}
      <div className="relative z-10 ml-7">
        <Body color="#003366">
          <div className="absolute left-0 top-2 h-[10px] w-full -rotate-12 bg-school-green" />
          {/* Flag arm raised */}
          <Arm color="#003366" duration="2.2s" style={{ left: 2, top: 8, transform: 'rotate(150deg)' }} />
          <Arm color="#003366" reverse duration="1.4s" style={{ right: 2, top: 12, transform: 'rotate(-24deg)' }} />
        </Body>

        <div className="relative z-20 -mt-1 ml-[3px]">
          <Head skin="#8D5524" hair="#001F3F">
            <Face />
            {/* Green cap marking the leader */}
            <div
              className="absolute -top-2 left-1/2 h-2.5 w-7 -translate-x-1/2 rounded-t-full bg-school-green"
              style={{ animation: 'halo-spin 9s linear infinite' }}
            />
          </Head>
        </div>
      </div>

      {/* Waving flag on a pole */}
      <div className="absolute -top-16 left-2 z-30 h-24 w-1.5 rounded-full bg-white/80" />
      <div
        className="absolute -top-16 left-3.5 z-30 h-12 w-16 origin-left rounded-r-md bg-school-green"
        style={{ animation: 'flag-wave 1.6s ease-in-out infinite' }}
      >
        <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[10px] font-black text-white">LEAD</span>
      </div>
    </div>
  </div>
);

/* Followers marching behind the leader. */
const Follower = ({ delay = 0, shirt = '#003366', skin = '#A9714B', scale = 1 }) => (
  <div className="relative" style={{ transform: `scale(${scale})` }}>
    <div style={{ animation: `scene-bob 2.2s ease-in-out infinite ${delay}s` }} className="relative">
      <div className="absolute left-1/2 -bottom-2 h-2.5 w-20 -translate-x-1/2 rounded-[50%] bg-black/30" />

      <div className="absolute left-1/2 top-[64px] -translate-x-1/2">
        <div className="relative h-7 w-11">
          <Leg color="#001F3F" style={{ left: 12 }} duration="1s" />
          <Leg color="#001F3F" reverse style={{ left: 32 }} duration="1s" />
        </div>
      </div>

      <div className="relative z-10 ml-4">
        <Body color={shirt}>
          <Arm color={shirt} duration="1.4s" style={{ left: 1, top: 8, transform: 'rotate(28deg)' }} />
          <Arm color={shirt} reverse duration="1.4s" style={{ right: 1, top: 8, transform: 'rotate(-28deg)' }} />
        </Body>
        <div className="relative z-20 -mt-1 ml-[3px]">
          <Head skin={skin} hair="#001F3F">
            <Face />
          </Head>
        </div>
      </div>
    </div>
  </div>
);

const DosScene = () => (
  <div className="scene-animate pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
    <div className="absolute bottom-1 right-1 flex origin-bottom-right scale-[0.62] items-end gap-1.5 sm:bottom-6 sm:right-10 sm:scale-100 sm:gap-5">
      <div className="hidden sm:block">
        <Follower delay={0.35} shirt="#2E7D32" skin="#8D5524" scale={0.8} />
      </div>
      <Follower delay={0.15} shirt="#003366" skin="#C68642" scale={0.9} />
      <Leader />
    </div>
  </div>
);

export default DosScene;
