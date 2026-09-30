import React from 'react';

/* Shared CSS cartoon building blocks used by the login scenes. */

export const Face = ({ eye = '#1F2937', smile = '#B45309' }) => (
  <div className="relative">
    {/* Eyes */}
    <span
      className="absolute rounded-full"
      style={{
        width: 6, height: 8, background: eye, left: 10, top: 18,
        transformOrigin: 'center', animation: 'eyes-blink 4.5s infinite'
      }}
    />
    <span
      className="absolute rounded-full"
      style={{
        width: 6, height: 8, background: eye, left: 24, top: 18,
        transformOrigin: 'center', animation: 'eyes-blink 4.5s infinite 0.08s'
      }}
    />
    {/* Smile */}
    <span
      className="absolute rounded-b-full border-b-[3px] border-current"
      style={{ width: 14, height: 8, left: 13, top: 30, color: smile }}
    />
    {/* Cheeks */}
    <span className="absolute rounded-full" style={{ width: 7, height: 5, background: '#FCA5A5', left: 3, top: 26, opacity: 0.55 }} />
    <span className="absolute rounded-full" style={{ width: 7, height: 5, background: '#FCA5A5', left: 30, top: 26, opacity: 0.55 }} />
  </div>
);

export const Head = ({ skin = '#F7C9A3', hair = '#3F2E20', style, children }) => (
  <div className="relative" style={{ width: 40, height: 40, borderRadius: '50% 50% 46% 46%', background: skin, boxShadow: 'inset 0 -3px 0 rgba(0,0,0,0.06)', ...style }}>
    {/* Hair */}
    <div
      className="absolute left-0 top-0 w-full"
      style={{
        height: 16,
        borderRadius: '50% 50% 40% 40%',
        background: hair
      }}
    />
    {children}
  </div>
);

/* Limb pivot sits at the top so rotation swings from the shoulder/hip. */
export const Arm = ({ color = '#3B82F6', rotate = 0, duration = '3s', style, reverse = false }) => (
  <div
    className="absolute"
    style={{
      width: 8, height: 30, borderRadius: 6, background: color,
      transformOrigin: 'top center',
      transform: `rotate(${rotate}deg)`,
      animation: `${reverse ? 'arm-point' : 'arm-write'} ${duration} ease-in-out infinite`,
      ...style
    }}
  />
);

export const Leg = ({ color = '#1E3A8A', reverse = false, duration = '1.1s', style }) => (
  <div
    className="absolute"
    style={{
      width: 9, height: 34, borderRadius: 5, background: color,
      transformOrigin: 'top center',
      animation: `${reverse ? 'leg-swing-back' : 'leg-swing'} ${duration} ease-in-out infinite`,
      ...style
    }}
  >
    <div className="absolute left-[-3px] bottom-[-2px] h-[7px] w-[15px] rounded-full bg-slate-800" />
  </div>
);

export const Body = ({ color = '#3B82F6', style, children }) => (
  <div
    className="relative rounded-[14px]"
    style={{ width: 46, height: 54, background: color, ...style }}
  >
    {children}
  </div>
);

/* Reusable open book with a turning page. */
export const CartoonBook = ({ width = 76, style, cover = '#2563EB', pageColor = '#FEFCE8' }) => (
  <div className="relative" style={{ width, height: width * 0.62, ...style }}>
    {/* Back cover / left page */}
    <div
      className="absolute left-0 top-0 h-full w-1/2 rounded-l-[6px]"
      style={{ background: pageColor, boxShadow: 'inset -2px 0 0 rgba(0,0,0,0.08)' }}
    >
      <div className="mx-auto mt-2 w-3/4 space-y-[3px]">
        {[0, 1, 2].map((row) => (
          <div key={row} className="h-[2px] rounded-full bg-slate-400/50" />
        ))}
      </div>
    </div>
    {/* Right page */}
    <div
      className="absolute right-0 top-0 h-full w-1/2 rounded-r-[6px]"
      style={{ background: pageColor, boxShadow: 'inset 2px 0 0 rgba(0,0,0,0.08)' }}
    >
      <div className="mx-auto mt-2 w-3/4 space-y-[3px]">
        {[0, 1, 2].map((row) => (
          <div key={row} className="h-[2px] rounded-full bg-slate-400/50" />
        ))}
      </div>
    </div>
    {/* Spine */}
    <div className="absolute left-1/2 top-0 h-full w-[3px] -translate-x-1/2 rounded-full" style={{ background: cover }} />
    {/* Turning page */}
    <div
      className="absolute left-1/2 top-0 h-full w-1/2 origin-left rounded-r-[6px]"
      style={{
        background: pageColor,
        transformStyle: 'preserve-3d',
        backfaceVisibility: 'visible',
        animation: 'book-page-turn 4s ease-in-out infinite'
      }}
    />
  </div>
);
