/* Shared visual language for the E-Learning login portal.
   Mirrors the Moodle "Boost" login treatment that ES RUNABA's portal
   references: system font stack, lightly-rounded cards, understated
   form controls and a single solid primary button. */

/* Moodle Boost system font stack (kept local to the portal so the
   public website typography is untouched). */
export const portalFont = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';

/* Card: white surface, hairline border, soft elevated shadow, 4px radius. */
export const cardClass = 'rounded bg-white border border-slate-300 shadow-[0_.5rem_1rem_rgba(0,0,0,.15)]';

/* Form label: normal case, 14px, regular weight (Bootstrap/Moodle style). */
export const labelClass = 'block text-sm font-normal leading-5 text-slate-800';

/* Text input: 16px on mobile to stop iOS zoom, 14px from the sm breakpoint. */
export const fieldClass =
  'block w-full rounded border border-slate-400 px-3 py-2 text-base text-slate-900 placeholder-slate-400 outline-none transition focus:border-school-blue focus:ring-2 focus:ring-school-blue/25 sm:text-sm';

/* Primary button: solid fill, bold label, 4px radius. */
export const buttonClass =
  'group flex w-full items-center justify-center gap-2 rounded px-4 py-2.5 text-base font-bold leading-5 text-white transition disabled:opacity-60';

export const buttonBlue = 'bg-school-blue hover:bg-school-blue-dark';
export const buttonGreen = 'bg-school-green hover:bg-school-green-dark';

/* Muted helper text under headings. */
export const mutedClass = 'text-sm text-slate-500';
