// TODO: Pictos, levels and figures are placeholders; replace with the real ones.

export type Element = 'neutral' | 'green' | 'red' | 'cyan';

export interface Item {
  id: string;
  name: string;
  level: number;
  element: Element;
}

// Most recent first (ROLES[0] is the current role).
// TODO: placeholder roles; replace with the LinkedIn profile positions (title, company, dates).
export interface Role {
  id: string;
  title: string;
  company: string;
  period: string;
  level: number;
  years: number;
  team: number;
  leadership: string;
  delivery: string;
}

export const ROLES: Role[] = [
  {id: 'cto', title: 'CTO', company: 'Company', period: '20XX – today', level: 3, years: 3, team: 12, leadership: 'A', delivery: 'B'},
  {id: 'lead', title: 'Lead Developer', company: 'Company', period: '20XX – 20XX', level: 2, years: 3, team: 6, leadership: 'B', delivery: 'A'},
  {id: 'fullstack', title: 'Full-stack Developer', company: 'Company', period: '20XX – 20XX', level: 1, years: 4, team: 4, leadership: 'C', delivery: 'B'},
];

export interface Picto extends Item {
  stats: [{label: string; value: string}, {label: string; value: string}];
  description: string;
  equipped: boolean;
}

// TODO: placeholder qualities; replace with the real ones.
export const PICTOS: Picto[] = [
  {id: 'curiosity', name: 'Curiosity', level: 5, element: 'cyan', equipped: true,
    stats: [{label: 'Learning', value: '12'}, {label: 'Insight', value: '8%'}], description: 'Picks up a new stack before the first sprint ends.'},
  {id: 'teamwork', name: 'Teamwork', level: 4, element: 'green', equipped: true,
    stats: [{label: 'Support', value: '10'}, {label: 'Synergy', value: '6%'}], description: 'Every review leaves the team a little faster.'},
  {id: 'autonomy', name: 'Autonomy', level: 4, element: 'neutral', equipped: true,
    stats: [{label: 'Drive', value: '11'}, {label: 'Ownership', value: '7%'}], description: 'Takes a vague need all the way to production.'},
  {id: 'mentoring', name: 'Mentoring', level: 3, element: 'green', equipped: false,
    stats: [{label: 'Support', value: '9'}, {label: 'Growth', value: '5%'}], description: 'Juniors gain a level after each pairing session.'},
  {id: 'pragmatism', name: 'Pragmatism', level: 3, element: 'red', equipped: false,
    stats: [{label: 'Delivery', value: '10'}, {label: 'Focus', value: '4%'}], description: 'Ships the simplest version that solves the problem.'},
  {id: 'communication', name: 'Communication', level: 2, element: 'cyan', equipped: false,
    stats: [{label: 'Clarity', value: '8'}, {label: 'Reach', value: '3%'}], description: 'Turns technical trade-offs into clear decisions.'},
];

export const EQUIPPED = PICTOS.filter((p) => p.equipped);
export const PICTO_SLOTS = 3;

export interface Skill extends Item {
  description: string;
  equipped: boolean;
}

// TODO: placeholder skills; replace with the real ones. The equipped ones fill the six home slots, in this order.
export const SKILLS: Skill[] = [
  {id: 'react', name: 'React', level: 5, element: 'cyan', equipped: true, description: 'Component architecture, hooks, server rendering with React Router.'},
  {id: 'typescript', name: 'TypeScript', level: 5, element: 'neutral', equipped: true, description: 'Strict types end to end, from API contracts to UI state.'},
  {id: 'css', name: 'Tailwind', level: 4, element: 'green', equipped: true, description: 'Design systems and pixel-exact layouts, SCSS when it fits better.'},
  {id: 'node', name: 'Node.js', level: 4, element: 'green', equipped: true, description: 'APIs, workers and build tooling.'},
  {id: 'vite', name: 'Vite', level: 3, element: 'red', equipped: true, description: 'Fast builds, asset pipelines and dev tooling.'},
  {id: 'design', name: 'UI Recreation', level: 3, element: 'neutral', equipped: true, description: 'Rebuilds interfaces from video captures, down to the texture.'},
  {id: 'python', name: 'Python', level: 3, element: 'cyan', equipped: false, description: 'Image and video processing scripts with OpenCV and NumPy.'},
  {id: 'postgres', name: 'PostgreSQL', level: 3, element: 'green', equipped: false, description: 'Schema design, query tuning and migrations.'},
  {id: 'docker', name: 'Docker', level: 2, element: 'red', equipped: false, description: 'Containerised dev environments and deployments.'},
];

export const EQUIPPED_SKILLS = SKILLS.filter((s) => s.equipped);

export const CHARACTER = {
  name: 'Olivier',
  level: 34,
  xp: {value: 750, max: 1000},
  secondary: {value: 750, max: 1000},
  combat: [
    {label: 'Health', value: '160'},
    {label: 'Speed', value: '216'},
    {label: 'Attack Power', value: '76'},
    {label: 'Critical Rate', value: '8%'},
    {label: 'Defense', value: '0'},
  ],
};

export const LUMINA_SLOTS = 5;
export const LINKEDIN_URL = 'https://www.linkedin.com/in/olivier-nguyen-98b642150/';
