import { CHARACTER } from './character';

// The start screen's number. Its digits are drawn by hand (StartScreen/ExpeditionLogo), so changing it means drawing
// the new digits there too.
export const EXPEDITION = 35;
// The game prints its build number in the bottom right corner of its title screen; this one is the CV's.
export const BUILD = '35.10';

export const SITE_TITLE = `${CHARACTER.name}: Expedition ${EXPEDITION}`;

// One title and description per route; `title` is prefixed to the site title, the start screen shows it alone.
const PAGES = {
  start: { title: null, description: `The CV of ${CHARACTER.name}, as a Clair Obscur menu` },
  overview: { title: 'Overview', description: `The CV of ${CHARACTER.name}, as a Clair Obscur menu` },
  experience: { title: 'Experience', description: `Work experience of ${CHARACTER.name}` },
  pictos: { title: 'Pictos', description: `Qualities of ${CHARACTER.name}` },
  luminas: { title: 'Luminas', description: `Qualities of ${CHARACTER.name}` },
  skills: { title: 'Skills', description: `Skills of ${CHARACTER.name}` },
  skillTree: { title: 'Skill Tree', description: `Learning path of ${CHARACTER.name}` }
} as const;

export const pageMeta = (page: keyof typeof PAGES) => {
  const { title, description } = PAGES[page];
  return [
    { title: title ? `${title} — ${SITE_TITLE}` : SITE_TITLE },
    { name: 'description', content: description }
  ];
};
