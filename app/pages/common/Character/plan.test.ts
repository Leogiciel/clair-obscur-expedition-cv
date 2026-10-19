import { describe, expect, it } from 'vitest';

import { clipsOf, liveShots } from './plan';
import { MOVE_KEYS, SHOTS, type Shot } from './sources';

const clipCount = (shots: Shot[]) => {
  const { loops, moves } = clipsOf(new Set(shots), MOVE_KEYS);
  return loops.size + moves.size;
};

describe('the clips', () => {
  it('only name moves between real screens', () => {
    for (const key of MOVE_KEYS) {
      const [from, to] = key.split('-');
      expect(SHOTS).toContain(from);
      expect(SHOTS).toContain(to);
    }
  });
});

describe('clipsOf', () => {
  it('keeps a screen’s loop, the moves out of it and the loops they land on', () => {
    const { loops, moves } = clipsOf(new Set<Shot>(['skills']), MOVE_KEYS);
    expect([...moves].sort()).toEqual(['skills-overview', 'skills-skilltree']);
    expect([...loops].sort()).toEqual(['overview', 'skills', 'skilltree']);
  });

  // iOS kills the tab past its memory cap when all eighteen clips are decoded at once.
  it('keeps at most nine clips loaded on any screen, never all of them', () => {
    const all = SHOTS.length + MOVE_KEYS.length;
    for (const shot of SHOTS) expect(clipCount([shot])).toBeLessThanOrEqual(9);
    expect(clipCount(['overview'])).toBeLessThan(all);
    expect(clipCount(['skilltree'])).toBe(3);
  });
});

describe('liveShots', () => {
  it('keeps the screen being left while the move into the new one plays', () => {
    expect(liveShots<Shot>('skills', 'overview', { shot: 'skills', from: 'overview' })).toEqual(
      new Set(['skills', 'overview'])
    );
  });

  it('drops the screen left behind once the move has settled', () => {
    // A regression: the left screen's clips stayed attached after the move, undoing the iOS memory cap.
    const live = liveShots<Shot>('skilltree', 'skilltree', { shot: 'skilltree', from: 'skills' });
    expect(live).toEqual(new Set(['skilltree']));
    expect(clipCount([...live])).toBe(3);
  });

  it('keeps the move in flight through a quick second navigation', () => {
    // Overview → skills, then skill tree before the first move settled: the render of the new screen still holds
    // the previous one.
    expect(liveShots<Shot>('skilltree', 'overview', { shot: 'skills', from: 'overview' })).toEqual(
      new Set(['skilltree', 'overview', 'skills'])
    );
  });
});
