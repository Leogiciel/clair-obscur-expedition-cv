import { useHotkeys } from '@tanstack/react-hotkeys';
import { useMemo, useState } from 'react';

export interface SortOption<T> {
  label: string;
  // Ascending order; R reverses it.
  compare: (a: T, b: T) => number;
  descending: boolean;
}

// The game's list sorting: X cycles the sort key, R flips the direction. Each key starts in its own direction.
const useSort = <T>(items: T[], options: SortOption<T>[]) => {
  const [index, setIndex] = useState(0);
  const [descending, setDescending] = useState(options[0].descending);
  const option = options[index];

  const next = () => {
    const i = (index + 1) % options.length;
    setIndex(i);
    setDescending(options[i].descending);
  };
  const flip = () => setDescending((d) => !d);

  useHotkeys([
    { hotkey: 'X', callback: next },
    { hotkey: 'R', callback: flip }
  ]);

  const sorted = useMemo(
    () => [...items].sort((a, b) => (descending ? -1 : 1) * option.compare(a, b)),
    [items, option, descending]
  );
  return { sorted, label: option.label, descending, next, flip };
};

export default useSort;
