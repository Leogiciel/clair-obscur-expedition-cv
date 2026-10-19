// @vitest-environment jsdom
import { act, cleanup, fireEvent, renderHook } from '@testing-library/react';

import { afterEach, describe, expect, it, vi } from 'vitest';

import useSlotPicker from '.';

// Five items in two columns of three rows; three slots in two columns (the last row is partial).
const ITEMS = ['a', 'b', 'c', 'd', 'e'];
const LAYOUT = {
  columns: [
    { x: 0, length: 300 },
    { x: 400, length: 300 }
  ],
  firstRow: 0,
  pitch: 70,
  rows: 3
};

const setup = (equipped: (string | null)[] = ['c', null, null]) => {
  const equip = vi.fn();
  const clear = vi.fn();
  const onBack = vi.fn();
  const hook = renderHook(() =>
    useSlotPicker({
      items: ITEMS,
      layout: LAYOUT,
      slotCount: 3,
      slotColumns: 2,
      slotItem: (slot) => equipped[slot],
      equip,
      clear,
      onBack
    })
  );
  return { ...hook, equip, clear, onBack };
};
// Testing Library only cleans up by itself with Vitest's globals, which this project leaves off.
afterEach(cleanup);

const press = (key: string) => act(() => void fireEvent.keyDown(document.body, { key }));

describe('useSlotPicker, on the slots', () => {
  it('moves between slots and stops at the grid’s edges', () => {
    const { result } = setup();
    press('ArrowRight');
    expect(result.current.slot).toBe(1);
    press('ArrowRight');
    expect(result.current.slot).toBe(1);
    press('ArrowDown');
    // Row 2 has a single slot: moving down from the right column lands on it.
    expect(result.current.slot).toBe(2);
  });

  it('opens the list on the item the slot holds, or on the first one', () => {
    const { result } = setup(['c', null, null]);
    press('Enter');
    expect(result.current.mode).toBe('list');
    expect(result.current.hovered).toBe(ITEMS.indexOf('c'));
    press('Escape');
    press('ArrowRight');
    press('Enter');
    expect(result.current.hovered).toBe(0);
  });

  it('clears the slot with Y and leaves the screen with B', () => {
    const { clear, onBack } = setup();
    press('y');
    expect(clear).toHaveBeenCalledWith(0);
    press('b');
    expect(onBack).toHaveBeenCalledOnce();
  });
});

describe('useSlotPicker, with a slot button focused', () => {
  // A regression: Enter both clicked the focused slot and ran the screen's shortcut, opening the list and
  // confirming in one press.
  it('leaves Enter to the button instead of acting twice', () => {
    const { result } = setup();
    const button = document.body.appendChild(document.createElement('button'));
    button.focus();
    act(() => void fireEvent.keyDown(button, { key: 'Enter' }));
    expect(result.current.mode).toBe('slots');
    button.remove();
  });
});

describe('useSlotPicker, in the list', () => {
  it('moves through the columns and clamps to the items there are', () => {
    const { result } = setup([null, null, null]);
    press('Enter');
    press('ArrowRight');
    // Column 2 holds d and e: index 3.
    expect(result.current.hovered).toBe(3);
    press('ArrowDown');
    press('ArrowDown');
    expect(result.current.hovered).toBe(4);
  });

  it('equips the hovered item with A and goes back to the slots', () => {
    const { result, equip } = setup([null, null, null]);
    press('Enter');
    press('ArrowDown');
    press('a');
    expect(equip).toHaveBeenCalledWith(0, 'b');
    expect(result.current.mode).toBe('slots');
  });

  it('goes back to the slots without equipping on B, without leaving the screen', () => {
    const { result, equip, onBack } = setup();
    press('Enter');
    press('b');
    expect(result.current.mode).toBe('slots');
    expect(equip).not.toHaveBeenCalled();
    expect(onBack).not.toHaveBeenCalled();
  });
});
