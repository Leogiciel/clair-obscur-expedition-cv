import { at } from '~/test/at';

import { describe, expect, it } from 'vitest';

import type { Experience } from './experiences';

const position = (start: string, end?: string) => ({ start, end, stack: [] }) as unknown as Experience;
const load = () => at('2026-10-19T12:00:00', () => import('./experiences'));

describe('monthsOf', () => {
  it('counts whole months between start and end', async () => {
    const { monthsOf } = await load();
    expect(monthsOf(position('2017-12', '2019-10'))).toBe(22);
  });

  it('runs a current position up to this month', async () => {
    const { monthsOf } = await load();
    expect(monthsOf(position('2025-11'))).toBe(11);
  });

  it('counts a position that starts and ends in the same month as one month', async () => {
    const { monthsOf } = await load();
    expect(monthsOf(position('2024-03', '2024-03'))).toBe(1);
  });
});

describe('monthsAcross', () => {
  it('counts months shared by overlapping positions once', async () => {
    const { monthsAcross } = await load();
    // Jan–Jun and Apr–Sep overlap over Apr–Jun: 9 distinct months, not 12.
    expect(monthsAcross([position('2020-01', '2020-07'), position('2020-04', '2020-10')])).toBe(9);
  });

  it('counts a position within a single month as one month, as monthsOf does', async () => {
    // A regression: these counted 0 in Health while monthsOf gave them 1.
    const { monthsAcross, monthsOf } = await load();
    const sameMonth = position('2024-03', '2024-03');
    const startedThisMonth = position('2026-10');
    expect(monthsAcross([sameMonth])).toBe(1);
    expect(monthsAcross([startedThisMonth])).toBe(1);
    expect(monthsAcross([sameMonth])).toBe(monthsOf(sameMonth));
  });

  it('adds up positions that do not overlap', async () => {
    const { monthsAcross } = await load();
    expect(monthsAcross([position('2020-01', '2020-04'), position('2021-01', '2021-03')])).toBe(5);
  });
});

describe('yearsOf', () => {
  it('rounds to whole years, a short position still counting as one', async () => {
    const { yearsOf } = await load();
    expect([yearsOf(0), yearsOf(5), yearsOf(17), yearsOf(18), yearsOf(85)]).toEqual([1, 1, 1, 2, 7]);
  });
});

describe('periodOf', () => {
  it('reads as month and year, "today" for a current position', async () => {
    const { periodOf } = await load();
    expect(periodOf(position('2017-12', '2019-10'))).toBe('Dec 2017 – Oct 2019');
    expect(periodOf(position('2025-11'))).toBe('Nov 2025 – today');
  });
});

describe('EXPERIENCES', () => {
  it('has unique ids and dates that read as year-month, the end after the start', async () => {
    const { EXPERIENCES } = await load();
    expect(new Set(EXPERIENCES.map((e) => e.id)).size).toBe(EXPERIENCES.length);
    for (const e of EXPERIENCES) expect(e.start).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/);
    for (const e of EXPERIENCES.filter((e) => e.end)) expect(e.end! > e.start).toBe(true);
  });
});
