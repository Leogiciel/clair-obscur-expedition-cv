import { PICTOS, type Picto } from './pictos';

// Every picto is learned as a Lumina, as in the game once a picto is mastered. Lumina points work like the game's:
// the equipped pictos' Luminas are active for free, any other one costs points from a fixed budget.
export const LUMINA_POINTS = 8;

// Cost grows with the quality's level: under 5 years, under 10, then 10 and more.
export const luminaCost = (p: Picto) => (p.level < 5 ? 1 : p.level < 10 ? 3 : 5);

export const LUMINAS = PICTOS;

// Points spent by the activated Luminas that do not come from an equipped picto.
export const luminaPointsSpent = (active: string[], equipped: (string | null)[]) =>
  active
    .filter((id) => !equipped.includes(id))
    .reduce((sum, id) => sum + luminaCost(PICTOS.find((p) => p.id === id)!), 0);
