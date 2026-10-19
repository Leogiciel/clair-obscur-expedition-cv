import type { Shot } from '../Character';

// The character's framing for each screen; every other path (the start screen, the overview) uses the overview's.
const SHOTS: Record<string, Shot> = {
  '/experience': 'experience',
  '/pictos': 'pictos',
  '/skills': 'skills',
  '/luminas': 'luminas',
  '/skill-tree': 'skilltree'
};

// Static hosting (GitHub Pages) serves each screen as a folder, so its URL may end in a slash: /skills/ is /skills.
export const routeOf = (pathname: string) => pathname.replace(/(.)\/$/, '$1');

export const shotOf = (route: string): Shot => SHOTS[route] ?? 'overview';
