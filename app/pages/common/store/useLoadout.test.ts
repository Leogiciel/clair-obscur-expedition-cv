// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

const KEY = 'cv-loadout';

// A fresh store per test, loaded once the browser storage holds what the test needs.
const loadStore = async () => {
  vi.resetModules();
  const [{ default: useLoadout }, data] = await Promise.all([import('./useLoadout'), import('~/data')]);
  return { useLoadout, data };
};

beforeEach(() => localStorage.clear());

describe('equipping', () => {
  it('unequips an item picked again in its own slot', async () => {
    const { useLoadout } = await loadStore();
    const first = useLoadout.getState().pictos[0]!;
    useLoadout.getState().equipPicto(0, first);
    expect(useLoadout.getState().pictos[0]).toBeNull();
  });

  it('swaps an item already equipped in another slot', async () => {
    const { useLoadout } = await loadStore();
    const [a, b] = useLoadout.getState().pictos;
    useLoadout.getState().equipPicto(0, b!);
    expect(useLoadout.getState().pictos.slice(0, 2)).toEqual([b, a]);
  });

  it('swaps skills the same way', async () => {
    const { useLoadout } = await loadStore();
    const [a, b] = useLoadout.getState().skills;
    useLoadout.getState().equipSkill(1, a!);
    expect(useLoadout.getState().skills.slice(0, 2)).toEqual([b, a]);
  });

  it('clears one slot only', async () => {
    const { useLoadout } = await loadStore();
    const [, b, c] = useLoadout.getState().skills;
    useLoadout.getState().clearSkill(0);
    expect(useLoadout.getState().skills.slice(0, 3)).toEqual([null, b, c]);
  });
});

describe('Lumina budget', () => {
  it('refuses a Lumina past the budget', async () => {
    const { useLoadout, data } = await loadStore();
    // Music and Sports cost 5 each (their levels are fixed, not counted from a date): the second does not fit in 8
    // points.
    useLoadout.getState().toggleLumina('music');
    useLoadout.getState().toggleLumina('sports');
    expect(useLoadout.getState().luminas).toEqual(['music']);
    expect(
      data.luminaPointsSpent(useLoadout.getState().luminas, useLoadout.getState().pictos)
    ).toBeLessThanOrEqual(data.LUMINA_POINTS);
  });

  it('turns a Lumina off again, giving its points back', async () => {
    const { useLoadout } = await loadStore();
    useLoadout.getState().toggleLumina('music');
    useLoadout.getState().toggleLumina('music');
    useLoadout.getState().toggleLumina('sports');
    expect(useLoadout.getState().luminas).toEqual(['sports']);
  });

  it('cannot toggle an equipped picto’s Lumina, which is free', async () => {
    const { useLoadout } = await loadStore();
    const equipped = useLoadout.getState().pictos[0]!;
    useLoadout.getState().toggleLumina(equipped);
    expect(useLoadout.getState().luminas).toEqual([]);
  });

  it('stops paying for a Lumina once its picto is equipped, so unequipping it cannot overrun the budget', async () => {
    const { useLoadout, data } = await loadStore();
    useLoadout.getState().toggleLumina('music');
    useLoadout.getState().equipPicto(0, 'music');
    expect(useLoadout.getState().luminas).toEqual([]);
    useLoadout.getState().clearPicto(0);
    useLoadout.getState().toggleLumina('sports');
    expect(
      data.luminaPointsSpent(useLoadout.getState().luminas, useLoadout.getState().pictos)
    ).toBeLessThanOrEqual(data.LUMINA_POINTS);
  });
});

describe('saved loadout', () => {
  const save = (state: object) => localStorage.setItem(KEY, JSON.stringify({ state, version: 2 }));

  it('keeps the default loadout when nothing is saved', async () => {
    const { useLoadout, data } = await loadStore();
    await useLoadout.persist.rehydrate();
    expect(useLoadout.getState().pictos).toEqual(data.DEFAULT_PICTOS);
    expect(useLoadout.getState().skills).toEqual(data.DEFAULT_SKILLS);
  });

  it('restores a valid save', async () => {
    save({
      pictos: ['music', null, null],
      skills: ['rust', null, null, null, null, null],
      experience: 'coinhouse',
      luminas: []
    });
    const { useLoadout } = await loadStore();
    await useLoadout.persist.rehydrate();
    expect(useLoadout.getState().pictos).toEqual(['music', null, null]);
    expect(useLoadout.getState().skills[0]).toBe('rust');
    expect(useLoadout.getState().experience).toBe('coinhouse');
  });

  it('drops what a stale save names but the data no longer has, instead of crashing the screens', async () => {
    save({
      pictos: ['ghost', 'leadership', 42],
      skills: ['nope', 'react'],
      experience: 'gone',
      luminas: ['ghost']
    });
    const { useLoadout, data } = await loadStore();
    await useLoadout.persist.rehydrate();
    const s = useLoadout.getState();
    expect(s.pictos).toEqual([null, 'leadership', null]);
    expect(s.skills).toEqual([null, 'react', null, null, null, null]);
    expect(s.experience).toBe(data.EXPERIENCES[0].id);
    expect(s.luminas).toEqual([]);
  });

  it('migrates a save from before Luminas existed (version 1)', async () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        state: { pictos: ['music', null, null], skills: [], experience: 'coinhouse' },
        version: 1
      })
    );
    const { useLoadout } = await loadStore();
    await useLoadout.persist.rehydrate();
    expect(useLoadout.getState().luminas).toEqual([]);
    expect(useLoadout.getState().pictos[0]).toBe('music');
  });

  it('keeps paid Luminas only while they fit the budget', async () => {
    save({
      pictos: [null, null, null],
      skills: [],
      experience: 'podspace',
      luminas: ['music', 'sports', 'music']
    });
    const { useLoadout, data } = await loadStore();
    await useLoadout.persist.rehydrate();
    const { luminas, pictos } = useLoadout.getState();
    expect(luminas).toEqual(['music']);
    expect(data.luminaPointsSpent(luminas, pictos)).toBeLessThanOrEqual(data.LUMINA_POINTS);
  });

  it('drops a paid Lumina whose picto the save also equips, since that one is free', async () => {
    save({ pictos: ['music', null, null], skills: [], experience: 'podspace', luminas: ['music'] });
    const { useLoadout } = await loadStore();
    await useLoadout.persist.rehydrate();
    expect(useLoadout.getState().luminas).toEqual([]);
  });

  it('keeps an item equipped once when a save repeats it', async () => {
    save({
      pictos: ['music', 'music', null],
      skills: ['react', 'react'],
      experience: 'podspace',
      luminas: []
    });
    const { useLoadout } = await loadStore();
    await useLoadout.persist.rehydrate();
    expect(useLoadout.getState().pictos).toEqual(['music', null, null]);
    expect(useLoadout.getState().skills.slice(0, 2)).toEqual(['react', null]);
  });

  it('does not read the browser storage before it is rehydrated, so the server render and hydration match', async () => {
    save({ pictos: ['music', null, null], skills: [], experience: 'coinhouse', luminas: [] });
    const { useLoadout, data } = await loadStore();
    expect(useLoadout.getState().pictos).toEqual(data.DEFAULT_PICTOS);
    expect(useLoadout.getState().experience).toBe(data.EXPERIENCES[0].id);
  });

  it('saves only the loadout, under the current version', async () => {
    const { useLoadout } = await loadStore();
    useLoadout.getState().equipExperience('coinhouse');
    const saved = JSON.parse(localStorage.getItem(KEY)!) as { state: object; version: number };
    expect(saved.version).toBe(2);
    expect(Object.keys(saved.state).sort()).toEqual(['experience', 'luminas', 'pictos', 'skills']);
    expect(saved.state).toMatchObject({ experience: 'coinhouse' });
  });
});
