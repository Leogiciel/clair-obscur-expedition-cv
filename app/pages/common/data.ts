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

export const PICTOS: Item[] = [
  {id: 'curiosity', name: 'Curiosity', level: 5, element: 'cyan'},
  {id: 'teamwork', name: 'Teamwork', level: 4, element: 'green'},
  {id: 'autonomy', name: 'Autonomy', level: 4, element: 'neutral'},
];

export const SKILLS: Item[] = [
  {id: 'react', name: 'React', level: 5, element: 'cyan'},
  {id: 'typescript', name: 'TypeScript', level: 5, element: 'neutral'},
  {id: 'css', name: 'Tailwind', level: 4, element: 'green'},
  {id: 'node', name: 'Node.js', level: 4, element: 'green'},
  {id: 'vite', name: 'Vite', level: 3, element: 'red'},
  {id: 'design', name: 'UI Recreation', level: 3, element: 'neutral'},
];

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
