import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  DEFAULT_PICTOS,
  DEFAULT_SKILLS,
  EXPERIENCES,
  LUMINAS,
  LUMINA_POINTS,
  PICTO_SLOTS,
  SKILL_SLOTS,
  type TechId,
  luminaCost,
  luminaPointsSpent
} from '../data';

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
      equipPicto: (slot, id) => set((s) => ({ pictos: equip(s.pictos, slot, id) })),
      clearPicto: (slot) => set((s) => ({ pictos: clear(s.pictos, slot) })),
      equipSkill: (slot, id) => set((s) => ({ skills: equip(s.skills, slot, id) })),
      clearSkill: (slot) => set((s) => ({ skills: clear(s.skills, slot) })),
      equipExperience: (id) => set({ experience: id })
    }),
    {
      name: 'cv-loadout',
      version: 2,
      migrate: (state) => ({ luminas: [], ...(state as object) }) as unknown as Loadout,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: ({ pictos, skills, experience, luminas }) => ({ pictos, skills, experience, luminas })
    }
  )
);

export default useLoadout;
