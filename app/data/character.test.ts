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

  it('gives the year a leap day when one falls before the next birthday', async () => {
    // 27 June 2027 to 27 June 2028 holds 29 February 2028.
    expect((await load('2027-10-01T12:00:00')).CHARACTER.xp.max).toBe(366);
  });

  it('starts the XP bar empty on the birthday itself', async () => {
    expect((await load('2026-06-27T12:00:00')).CHARACTER.xp.value).toBe(0);
  });
});

describe('CHARACTER stats', () => {
  it('counts Health as the months worked, overlaps once', async () => {
    const [{ CHARACTER }, { EXPERIENCES, monthsOf }] = await at('2026-10-19T12:00:00', () =>
      Promise.all([import('./character'), import('./experiences')])
    );
    const health = Number(CHARACTER.combat.find((s) => s.label === 'Health')?.value);
    const months = EXPERIENCES.map(monthsOf);
    // At least the longest position, less than all of them added up (AwesomeApps ran alongside other jobs).
    expect(health).toBeGreaterThanOrEqual(Math.max(...months));
    expect(health).toBeLessThan(months.reduce((a, b) => a + b, 0));
    expect(CHARACTER.health).toEqual({ value: health, max: health });
  });

  it('counts every company once', async () => {
    const [{ CHARACTER }, { EXPERIENCES }] = await at('2026-10-19T12:00:00', () =>
      Promise.all([import('./character'), import('./experiences')])
    );
    const companies = new Set(EXPERIENCES.map((e) => e.company)).size;
    expect(CHARACTER.combat.find((s) => s.label === 'Companies')?.value).toBe(String(companies));
  });
});
