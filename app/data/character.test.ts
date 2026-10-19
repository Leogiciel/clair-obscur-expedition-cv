import { at } from '~/test/at';

import { describe, expect, it } from 'vitest';

const load = (date: string) => at(date, () => import('./character'));

describe('CHARACTER level', () => {
  it('is the owner’s age, which goes up on the birthday (27 June 1991)', async () => {
    expect((await load('2026-06-26T12:00:00')).CHARACTER.level).toBe(34);
    expect((await load('2026-06-27T12:00:00')).CHARACTER.level).toBe(35);
  });

  it('fills the XP bar with the days since the last birthday', async () => {
    const { xp } = (await load('2026-10-19T12:00:00')).CHARACTER;
    // 27 June to 19 October: 114 days, out of the 365 until the next birthday.
    expect(xp).toEqual({ value: 114, max: 365 });
  });

  it('starts the XP bar empty on the birthday itself', async () => {
    expect((await load('2026-06-27T12:00:00')).CHARACTER.xp.value).toBe(0);
  });
});

describe('CHARACTER stats', () => {
  it('derives Health and Companies from the positions', async () => {
    const [{ CHARACTER }, { EXPERIENCES, monthsAcross }] = await at('2026-10-19T12:00:00', () =>
      Promise.all([import('./character'), import('./experiences')])
    );
    const stat = (label: string) => CHARACTER.combat.find((s) => s.label === label)?.value;
    expect(stat('Health')).toBe(String(monthsAcross(EXPERIENCES)));
    expect(stat('Companies')).toBe(String(EXPERIENCES.length));
    expect(CHARACTER.health).toEqual({ value: monthsAcross(EXPERIENCES), max: monthsAcross(EXPERIENCES) });
  });

  it('gives the radar its five attributes', async () => {
    const { CHARACTER } = await load('2026-10-19T12:00:00');
    expect(CHARACTER.attributes.map((a) => a.label)).toEqual([
      'Vitality',
      'Might',
      'Agility',
      'Defense',
      'Luck'
    ]);
  });
});
