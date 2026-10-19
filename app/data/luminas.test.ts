import { describe, expect, it } from 'vitest';

import { LUMINA_POINTS, luminaCost, luminaPointsSpent } from './luminas';
import { type Picto, pictoById } from './pictos';

const picto = (level: number) => ({ level }) as Picto;

describe('luminaCost', () => {
  it('costs 1 under 5 years, 3 under 10, then 5', () => {
    expect([1, 4, 5, 9, 10, 22].map((level) => luminaCost(picto(level)))).toEqual([1, 1, 3, 3, 5, 5]);
  });
});

describe('luminaPointsSpent', () => {
  it('adds up the active Luminas', () => {
    const cost = luminaCost(pictoById('music')) + luminaCost(pictoById('sports'));
    expect(luminaPointsSpent(['music', 'sports'], [])).toBe(cost);
  });

  it('charges nothing for an equipped picto’s Lumina', () => {
    expect(luminaPointsSpent(['music'], ['music', null, null])).toBe(0);
  });

  it('has a budget that cannot hold every Lumina at once', () => {
    expect(LUMINA_POINTS).toBe(8);
  });
});
