import {useHotkeys} from '@tanstack/react-hotkeys';

type Direction = 'up' | 'down' | 'left' | 'right';

const VECTORS: Record<Direction, [number, number]> = {up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0]};

// Spatial navigation between the focusable elements matched by `selector`: an arrow moves focus to the nearest
// element whose centre lies within 45° of that direction (any element further that way when none is), favouring the
// best aligned. With nothing focused yet, any arrow focuses the first element.
const useArrowNav = (selector: string) => {
  const move = (direction: Direction) => {
    const items = [...document.querySelectorAll<HTMLElement>(selector)];
    if (!items.length) return;
    const current = document.activeElement instanceof HTMLElement && items.includes(document.activeElement) ? document.activeElement : null;
    if (!current) {
      items[0].focus();
      return;
    }
    const centre = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return [r.left + r.width / 2, r.top + r.height / 2];
    };
    const [cx, cy] = centre(current);
    const [vx, vy] = VECTORS[direction];
    const pick = (inCone: boolean) => {
      let best: HTMLElement | null = null;
      let bestScore = Infinity;
      for (const el of items) {
        if (el === current) continue;
        const [x, y] = centre(el);
        const along = (x - cx) * vx + (y - cy) * vy;
        const across = Math.abs((x - cx) * vy - (y - cy) * vx);
        // Slots offset by a few pixels are not "to the right": first look within 45° of the direction.
        if (along <= (inCone ? across : 1)) continue;
        const score = along + 2 * across;
        if (score < bestScore) {
          bestScore = score;
          best = el;
        }
      }
      return best;
    };
    (pick(true) ?? pick(false))?.focus();
  };

  useHotkeys([
    {hotkey: 'ArrowUp', callback: () => move('up')},
    {hotkey: 'ArrowDown', callback: () => move('down')},
    {hotkey: 'ArrowLeft', callback: () => move('left')},
    {hotkey: 'ArrowRight', callback: () => move('right')},
  ]);
};

export default useArrowNav;
