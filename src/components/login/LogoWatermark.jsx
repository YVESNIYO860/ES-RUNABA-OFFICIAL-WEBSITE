import React from 'react';

/* Large ES RUNABA crest rendered as a faint background watermark.
   Sits behind all portal content, is purely decorative, and fades out
   toward the edges so it never competes with the sign-in card. */
const LogoWatermark = ({ tone = 'blue', className = '' }) => {
  const toneClass = tone === 'dark' ? 'opacity-[0.07]' : 'opacity-[0.10]';

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden ${className}`}
    >
      <img
        src="/runaba-logo.png"
        alt=""
        className={`w-[130%] max-w-none select-none sm:w-[100%] ${toneClass}`}
        style={{
          maskImage: 'radial-gradient(ellipse at center, black 25%, transparent 72%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 25%, transparent 72%)'
        }}
      />
    </div>
  );
};

export default LogoWatermark;
