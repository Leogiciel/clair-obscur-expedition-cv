import { describe, expect, it } from 'vitest';

import { clipsOf } from './plan';

const MOVES = [
  'overview-experience',
  'experience-overview',
  'overview-pictos',
  'pictos-overview',
  'overview-skills',
  'skills-overview',
  'overview-luminas',
  'luminas-overview',
  'luminas-pictos',
  'pictos-luminas',
  'skills-skilltree',
  'skilltree-skills'
];

describe('clipsOf', () => {
  it('keeps a screen’s loop, the moves out of it and the loops they land on', () => {
    const { loops, moves } = clipsOf(new Set(['skills']), MOVES);
    expect([...moves].sort()).toEqual(['skills-overview', 'skills-skilltree']);
    expect([...loops].sort()).toEqual(['overview', 'skills', 'skilltree']);
  });

  it('keeps nine clips on the overview and three on the skill tree, not all eighteen', () => {
    const count = (shot: string) => {
      const { loops, moves } = clipsOf(new Set([shot]), MOVES);
      return loops.size + moves.size;
    };
    expect(count('overview')).toBe(9);
    expect(count('skilltree')).toBe(3);
  });

  it('keeps the move being played: the screen it leaves stays in the set', () => {
    const { moves } = clipsOf(new Set(['overview', 'skills']), MOVES);
    expect(moves.has('skills-overview')).toBe(true);
    expect(moves.has('overview-skills')).toBe(true);
  });
});
