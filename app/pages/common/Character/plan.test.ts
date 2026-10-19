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
  // While a move plays both screens keep their clips: overview → Luminas holds twelve, the most at once, still a third
  // fewer than all eighteen.
  it('keeps at most twelve clips loaded during any move', () => {
    const during = MOVE_KEYS.map((key) => {
      const [from, to] = key.split('-') as [Shot, Shot];
      return clipCount([...liveShots(to, from)]);
    });
    expect(Math.max(...during)).toBe(12);
    expect(Math.max(...during)).toBeLessThan(SHOTS.length + MOVE_KEYS.length);
  });

  it('keeps the screen being left while the move into the new one plays', () => {
    expect(liveShots<Shot>('skills', 'overview')).toEqual(new Set(['skills', 'overview']));
  });

  it('drops the screen left behind once the move has settled', () => {
    // A regression: the left screen's clips stayed attached after the move, undoing the iOS memory cap.
    const live = liveShots<Shot>('skilltree', null);
    expect(live).toEqual(new Set(['skilltree']));
    expect(clipCount([...live])).toBe(3);
  });

  it('keeps the return move when the visitor goes back before the move has ended', () => {
    // A regression: overview → skills → overview mid-move cut instead of playing skills → overview.
    const { moves } = clipsOf(liveShots<Shot>('overview', 'skills'), MOVE_KEYS);
    expect(moves.has('skills-overview')).toBe(true);
  });
});
