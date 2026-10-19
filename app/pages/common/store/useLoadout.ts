import {
  DEFAULT_PICTOS,
  DEFAULT_SKILLS,
  EXPERIENCES,
  LUMINAS,
  LUMINA_POINTS,
  PICTOS,
  PICTO_SLOTS,
  SKILLS,
  SKILL_SLOTS,
  type TechId,
  luminaCost,
  luminaPointsSpent
} from '~/data';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type Slots<T> = (T | null)[];

interface Loadout {
  pictos: Slots<string>;
  skills: Slots<TechId>;
  experience: string;
  // Luminas activated with points (equipped pictos' Luminas are always active and free).
  luminas: string[];
  toggleLumina: (id: string) => void;
  resetLuminas: () => void;
  equipPicto: (slot: number, id: string) => void;
  clearPicto: (slot: number) => void;
  equipSkill: (slot: number, id: TechId) => void;
  clearSkill: (slot: number) => void;
  equipExperience: (id: string) => void;
}

const fill = <T>(ids: T[], count: number): Slots<T> =>
  Array.from({ length: count }, (_, i) => ids[i] ?? null);

// As in the game: picking the item already in the slot unequips it, and an item equipped elsewhere swaps places.
const equip = <T>(slots: Slots<T>, slot: number, id: T): Slots<T> => {
  const next = [...slots];
  if (next[slot] === id) {
    next[slot] = null;
    return next;
  }
  const from = next.indexOf(id);
  if (from >= 0) next[from] = next[slot];
  next[slot] = id;
  return next;
};

const clear = <T>(slots: Slots<T>, slot: number): Slots<T> => slots.map((s, i) => (i === slot ? null : s));

type Saved = Pick<Loadout, 'pictos' | 'skills' | 'experience' | 'luminas'>;

// Each slot keeps an item the data still has, and not already equipped in an earlier slot.
const known = <T>(ids: readonly T[], value: unknown, count: number): Slots<T> => {
  const slots: Slots<T> = [];
  for (let i = 0; i < count; i++) {
    const id = Array.isArray(value) ? (value[i] as T) : null;
    slots.push(ids.includes(id as T) && !slots.includes(id) ? id : null);
  }
  return slots;
};

// A save from an older version of the data can name items that no longer exist: they are dropped, and paid Luminas
// are kept only while they fit the budget, so a stale save never breaks the screens.
const sanitize = (saved: Partial<Saved>, fallback: Saved): Saved => {
  const pictos = known(
    PICTOS.map((p) => p.id),
    saved.pictos,
    PICTO_SLOTS
  );
  const skills = known(
    SKILLS.map((s) => s.id),
    saved.skills,
    SKILL_SLOTS
  );
  const experience = EXPERIENCES.some((e) => e.id === saved.experience)
    ? saved.experience!
    : fallback.experience;
  const luminas: string[] = [];
  for (const id of Array.isArray(saved.luminas) ? saved.luminas : []) {
    const lumina = LUMINAS.find((l) => l.id === id);
    if (!lumina || pictos.includes(id) || luminas.includes(id)) continue;
    if (luminaPointsSpent(luminas, pictos) + luminaCost(lumina) <= LUMINA_POINTS) luminas.push(id);
  }
  return { pictos, skills, experience, luminas };
};

// Persisted per visitor; rehydrated after mount (StageLayout) so the server render keeps the default loadout.
const useLoadout = create<Loadout>()(
  persist(
    (set) => ({
      pictos: fill(DEFAULT_PICTOS, PICTO_SLOTS),
      skills: fill(DEFAULT_SKILLS, SKILL_SLOTS),
      experience: EXPERIENCES[0].id,
      luminas: [],
      toggleLumina: (id) =>
        set((s) => {
          if (s.pictos.includes(id)) return {};
          if (s.luminas.includes(id)) return { luminas: s.luminas.filter((l) => l !== id) };
          const lumina = LUMINAS.find((l) => l.id === id)!;
          return luminaPointsSpent(s.luminas, s.pictos) + luminaCost(lumina) <= LUMINA_POINTS
            ? { luminas: [...s.luminas, id] }
            : {};
        }),
      resetLuminas: () => set({ luminas: [] }),
      // An equipped picto's Lumina is free: it stops being paid for, so unequipping it can't overrun the budget.
      equipPicto: (slot, id) =>
        set((s) => ({ pictos: equip(s.pictos, slot, id), luminas: s.luminas.filter((l) => l !== id) })),
      clearPicto: (slot) => set((s) => ({ pictos: clear(s.pictos, slot) })),
      equipSkill: (slot, id) => set((s) => ({ skills: equip(s.skills, slot, id) })),
      clearSkill: (slot) => set((s) => ({ skills: clear(s.skills, slot) })),
      equipExperience: (id) => set({ experience: id })
    }),
    {
      name: 'cv-loadout',
      version: 2,
      migrate: (state) => ({ luminas: [], ...(state as object) }),
      storage: createJSONStorage(() => localStorage),
      // Called even when nothing is saved: the defaults then stay, and fields missing from a save keep theirs.
      merge: (saved, current) =>
        saved ? { ...current, ...sanitize({ ...current, ...(saved as Partial<Saved>) }, current) } : current,
      skipHydration: true,
      partialize: ({ pictos, skills, experience, luminas }) => ({ pictos, skills, experience, luminas })
    }
  )
);

export default useLoadout;
