import React from 'react';
import { Arm, Body, CartoonBook, Face, Head, Leg } from './CartoonParts';

/* A student sitting cross-legged, reading a book whose pages turn.
   The drift animation owns `transform` on the outer element, so the scale
   must live on a separate wrapper to avoid being overwritten. */
const ReadingStudent = ({ skin = '#F7C9A3', shirt = '#003366', trouser = '#001F3F', book = '#2E7D32', duration = '34s', reverse = false, scale = 1, style }) => (
  <div
    className="absolute bottom-0"
    style={{ animation: `${reverse ? 'scene-drift-reverse' : 'scene-drift'} ${duration} linear infinite` }}
  >
    <div style={{ transform: `scale(${scale})`, transformOrigin: 'bottom left', ...style }}>
      <div className="relative" style={{ animation: 'scene-bob 3.4s ease-in-out infinite' }}>
      {/* Shadow */}
      <div className="absolute left-1/2 -bottom-2 h-3 w-28 -translate-x-1/2 rounded-[50%] bg-school-blue/10" />

      {/* Legs crossed in front */}
      <div className="absolute -bottom-1 left-1/2 z-0 -translate-x-1/2">
        <div className="relative h-9 w-24">
          <Leg color={trouser} style={{ left: 12, transform: 'rotate(62deg)' }} duration="4s" />
          <Leg color={trouser} reverse style={{ left: 52, transform: 'rotate(-62deg)' }} duration="4s" />
        </div>
      </div>

      {/* Torso */}
      <div className="relative z-10">
        <Body color={shirt}>
          {/* Arms resting on the book */}
          <Arm color={shirt} style={{ left: 2, top: 10, transform: 'rotate(38deg)', animation: 'none' }} />
          <Arm color={shirt} reverse style={{ right: 2, top: 10, transform: 'rotate(-38deg)', animation: 'none' }} />
        </Body>

        {/* Head */}
        <div className="relative z-20 -mt-1 ml-[3px]">
          <Head skin={skin} hair="#2C1B12">
            <Face />
          </Head>
        </div>
      </div>

      {/* Open book in front of the student */}
      <div className="relative z-30 -mt-6 ml-1">
        <CartoonBook width={82} cover={book} />
      </div>

      {/* Floating idea sparkles */}
      <div className="absolute -top-6 right-2 z-40 space-y-1">
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            className="block rounded-full bg-school-green"
            style={{
              width: 5, height: 5, opacity: 0.9,
              marginLeft: dot * 7,
              animation: `scene-drift-slow ${2.2 + dot * 0.5}s ease-in-out infinite`,
              animationDelay: `${dot * 0.35}s`
            }}
          />
        ))}
      </div>
    </div>
  </div>
  </div>
);

/* Books and pencils floating through the scene for depth. */
const FloatingProps = () => (
  <>
    <div
      className="absolute top-16 left-0"
      style={{ animation: 'scene-drift 26s linear infinite' }}
    >
      <div className="h-5 w-8 rounded-[3px] bg-school-blue/30 shadow-sm" style={{ animation: 'scene-drift-slow 4s ease-in-out infinite' }} />
    </div>
    <div
      className="absolute top-40 left-0"
      style={{ animation: 'scene-drift-reverse 34s linear infinite' }}
    >
      <div className="h-6 w-4 rotate-12 rounded-[2px] bg-school-green/40" style={{ animation: 'scene-drift-slow 5s ease-in-out infinite' }} />
    </div>
    <div
      className="absolute top-24 left-0"
      style={{ animation: 'scene-drift 44s linear infinite' }}
    >
      <div className="h-4 w-10 rounded-full bg-school-blue/20" style={{ animation: 'scene-drift-slow 6s ease-in-out infinite' }} />
    </div>
  </>
);

const StudentScene = () => (
  <div className="scene-animate pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
    <FloatingProps />
    <ReadingStudent duration="30s" scale={0.72} />
    <ReadingStudent duration="42s" reverse shirt="#2E7D32" book="#003366" skin="#E8B48C" scale={0.55} />
    <ReadingStudent duration="52s" shirt="#003366" book="#2E7D32" skin="#8D5A3B" scale={0.62} />
  </div>
);

export default StudentScene;
