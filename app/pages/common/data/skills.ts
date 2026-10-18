import {TECH, type TechId} from './tech';
import {EXPERIENCES, monthsAcross, yearsOf} from './experiences';

export interface Skill {
  id: TechId;
  name: string;
  category: 'Languages & frameworks' | 'Databases';
  // Years of professional use across the positions that list it; 1 for techs no position lists.
  level: number;
  usedAt: string[];
}

// The CV's skills section, in its order.
const CV: [TechId, Skill['category']][] = [
  ['react', 'Languages & frameworks'], ['typescript', 'Languages & frameworks'], ['graphql', 'Languages & frameworks'],
  ['reactnative', 'Languages & frameworks'], ['remix', 'Languages & frameworks'], ['svelte', 'Languages & frameworks'],
  ['nextjs', 'Languages & frameworks'], ['node', 'Languages & frameworks'], ['python', 'Languages & frameworks'],
  ['django', 'Languages & frameworks'], ['rust', 'Languages & frameworks'],
  ['sql', 'Databases'], ['mysql', 'Databases'], ['oracle', 'Databases'], ['mongodb', 'Databases'], ['postgres', 'Databases'],
];
// Plain SQL comes with every relational database a position used.
const IMPLIES: Partial<Record<TechId, TechId[]>> = {sql: ['postgres', 'mysql']};

export const SKILLS: Skill[] = CV.map(([id, category]) => {
  const ids = [id, ...(IMPLIES[id] ?? [])];
  const positions = EXPERIENCES.filter((e) => e.stack.some((t) => ids.includes(t)));
  return {id, name: TECH[id].name, category, level: yearsOf(monthsAcross(positions)), usedAt: positions.map((e) => e.company)};
});

export const SKILL_SLOTS = 6;
// Default loadout: the most practised skills (ties keep the CV order).
export const DEFAULT_SKILLS = [...SKILLS].sort((a, b) => b.level - a.level).slice(0, SKILL_SLOTS).map((s) => s.id);

export const skillById = (id: TechId) => SKILLS.find((s) => s.id === id)!;

export const skillSummary = (s: Skill) =>
  s.usedAt.length ? `Used at ${s.usedAt.join(', ')}.` : 'In the toolbox, outside the positions listed here.';
