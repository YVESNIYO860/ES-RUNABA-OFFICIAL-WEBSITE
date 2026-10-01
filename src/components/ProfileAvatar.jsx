import React, { useState } from 'react';

/* Rosettes float above the profile photo so the avatar stays identifiable
   even when the dashboard is zoomed or photographed on a phone. */
const BadgeIcon = ({ tone, letter }) => (
  <span
    aria-hidden="true"
    className={`pointer-events-none absolute flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-[10px] font-black leading-none text-white shadow ${
      tone === 'green' ? 'bg-school-green' : tone === 'blue' ? 'bg-school-blue' : 'bg-amber-500'
    }`}
  >
    {letter}
  </span>
);

const avatarBadgesByRole = {
  student: [
    { tone: 'green', letter: 'E', className: '-right-1 -top-1' },
    { tone: 'blue', letter: 'R', className: '-bottom-1 -right-1' }
  ],
  teacher: [
    { tone: 'blue', letter: 'T', className: '-right-1 -top-1' },
    { tone: 'green', letter: 'T', className: '-bottom-1 -right-1' }
  ],
  dos: [
    { tone: 'amber', letter: 'D', className: '-right-1 -top-1' },
    { tone: 'blue', letter: 'D', className: '-bottom-1 -right-1' }
  ]
};

/* Stable name-based palettes create staff portraits locally without external image requests. */
const roleBadgeLabel = {
  student: 'Student',
  teacher: 'Teacher',
  dos: 'Director of Studies'
};

const getInitials = (name) => String(name || '').trim().split(/\s+/)
  .filter(part => part && !['mr.', 'mrs.', 'ms.', 'fr.', 'dr.', 'sir', 'madam'].includes(part.toLowerCase()))
  .slice(0, 2)
  .map(part => part[0])
  .join('')
  .toUpperCase() || '?';

const portraitPalettes = [
  { background: '#dceee8', skin: '#8f563f', hair: '#202b35', shirt: '#17664f' },
  { background: '#e9e4d9', skin: '#bd805d', hair: '#392c2a', shirt: '#1f4e75' },
  { background: '#dce8f1', skin: '#6c402f', hair: '#171d27', shirt: '#98602d' },
  { background: '#f1e2d7', skin: '#d49a73', hair: '#4a3028', shirt: '#345b50' },
  { background: '#e2e4d3', skin: '#9c634a', hair: '#25212a', shirt: '#6b4d7b' },
  { background: '#d9e9e4', skin: '#744631', hair: '#30241f', shirt: '#a0473a' }
];

const getPortraitPalette = (user) => {
  const seed = `${user?.role || ''}:${user?.fullName || user?.name || ''}`.toLowerCase();
  const hash = [...seed].reduce((value, character) => ((value * 31) + character.charCodeAt(0)) >>> 0, 7);
  return portraitPalettes[hash % portraitPalettes.length];
};

const avatarShell = (size, className, ringClassName) => ({
  sharedStyle: {
    width: size,
    height: size,
    fontSize: Math.max(10, Math.round(size * 0.38))
  },
  sharedClassName: `shrink-0 rounded-full ${ringClassName} ${className}`
});

const ProfileAvatar = ({ user, size = 40, className = '', ringClassName = '', showBadges = false, withMeta = false, metaClassName = '', title = '' }) => {
  const [brokenSources, setBrokenSources] = useState([]);
  const { sharedStyle, sharedClassName } = avatarShell(size, className, ringClassName);
  const badges = showBadges ? (avatarBadgesByRole[user?.role] || []) : [];
  const displayName = user?.fullName || user?.name || 'user';
  const accessibleLabel = `${roleBadgeLabel[user?.role] || 'Portal user'} avatar for ${displayName}`;
  const storedPhoto = user?.role === 'student' ? String(user?.photoUrl || '').trim() : '';
  const src = storedPhoto && !brokenSources.includes(storedPhoto) ? storedPhoto : '';

  if (src) {
    return (
      <span className="relative inline-flex shrink-0" style={sharedStyle} title={title || accessibleLabel}>
        <img
          src={src}
          alt={`${roleBadgeLabel[user?.role] || 'Portal user'} photo of ${displayName}`}
          style={sharedStyle}
          referrerPolicy="no-referrer"
          loading="lazy"
          decoding="async"
          onError={() => setBrokenSources((current) => (current.includes(src) ? current : [...current, src]))}
          className={`${sharedClassName} bg-slate-100 object-cover`}
        />
        {badges.map((badge) => (
          <span key={`${badge.tone}-${badge.letter}`} className={badge.className}>
            <BadgeIcon tone={badge.tone} letter={badge.letter} />
          </span>
        ))}
      </span>
    );
  }

  const palette = getPortraitPalette(user);

  return (
    <span className="relative inline-flex shrink-0" style={sharedStyle} title={title || accessibleLabel}>
      <span
        role="img"
        aria-label={accessibleLabel}
        style={sharedStyle}
        className={`${sharedClassName} relative flex items-end justify-center overflow-hidden`}
      >
        <span className="absolute inset-0" style={{ backgroundColor: palette.background }} />
        <span className="absolute left-1/2 top-[14%] h-[40%] w-[58%] -translate-x-1/2 rounded-t-[55%] rounded-b-[38%]" style={{ backgroundColor: palette.hair }} />
        <span className="absolute left-1/2 top-[27%] h-[40%] w-[39%] -translate-x-1/2 rounded-[45%]" style={{ backgroundColor: palette.skin }} />
        <span className="absolute bottom-[-16%] left-1/2 h-[48%] w-[82%] -translate-x-1/2 rounded-t-[55%]" style={{ backgroundColor: palette.shirt }} />
        <span className="absolute left-1/2 top-[45%] h-[4%] w-[4%] -translate-x-[180%] rounded-full bg-slate-900/80" />
        <span className="absolute left-1/2 top-[45%] h-[4%] w-[4%] translate-x-[80%] rounded-full bg-slate-900/80" />
        <span className="absolute bottom-[4%] z-10 rounded bg-black/40 px-1 text-[0.45em] font-bold leading-tight text-white">{getInitials(displayName)}</span>
      </span>
      {badges.map((badge) => (
        <span key={`${badge.tone}-${badge.letter}`} className={badge.className}>
          <BadgeIcon tone={badge.tone} letter={badge.letter} />
        </span>
      ))}
    </span>
  );
};

export default ProfileAvatar;
