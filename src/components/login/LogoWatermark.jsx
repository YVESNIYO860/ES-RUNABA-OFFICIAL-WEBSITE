import React from 'react';

/* ES RUNABA crest rendered as a refined background watermark.
 *
 * The crest is a fully opaque, highly detailed image (navy ring, red
 * sunburst, gold text). Dropping that straight to low opacity produces a
 * muddy smudge rather than an elegant watermark, so it is first reduced to
 * a monochrome brand mark: desaturated, tinted to the school blue, and
 * blurred to remove the fine lettering. Only then is the opacity applied.
 *
 * On light surfaces the mark multiplies into the background; on dark
 * surfaces it is tinted light so it stays visible without glowing.
 */
const LogoWatermark = ({ tone = 'blue' }) => {
  const isDark = tone === 'dark';

  const filter = isDark
    ? 'grayscale(1) brightness(0) invert(1) blur(0.5px)'
    : 'grayscale(1) sepia(1) hue-rotate(170deg) saturate(2.4) brightness(0.62) contrast(1.05) blur(0.5px)';

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden"
    >
      <img
        src="/runaba-logo.png"
        alt=""
        aria-hidden="true"
        draggable="false"
        className={`w-[115%] max-w-none select-none sm:w-[92%] ${isDark ? 'opacity-[0.07]' : 'opacity-[0.13]'}`}
        style={{
          filter,
          mixBlendMode: isDark ? 'screen' : 'multiply',
          maskImage: 'radial-gradient(ellipse 62% 58% at 50% 50%, black 0%, rgba(0,0,0,0.55) 42%, transparent 76%)',
          WebkitMaskImage: 'radial-gradient(ellipse 62% 58% at 50% 50%, black 0%, rgba(0,0,0,0.55) 42%, transparent 76%)'
        }}
      />
    </div>
  );
};

export default LogoWatermark;
