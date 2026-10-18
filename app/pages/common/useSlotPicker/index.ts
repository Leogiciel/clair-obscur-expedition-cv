import { useHotkeys } from '@tanstack/react-hotkeys';
import { useState } from 'react';

import type { PlateGridLayout } from '../PlateGrid';
import enterHotkey from '../enterHotkey';

export type PickerMode = 'slots' | 'list';

interface SlotPickerOptions<T> {
  items: T[];
  layout: PlateGridLayout;
  // Equipped slots form a grid of `slotColumns` columns, filled row by row.
  slotCount: number;
  slotColumns: number;
  slotItem: (slot: number) => T | null;
  equip: (slot: number, item: T) => void;
  clear: (slot: number) => void;
  onBack: () => void;
}

// The game's two-step loadout: the cursor starts on the equipped slots (A opens one, Y clears it, B leaves), then
// moves to the list (A equips the item into that slot and returns to the slots, B returns without change).
// `hovered` is the list item under the pointer or the keyboard cursor: tooltips show only for it.
const useSlotPicker = <T>({
  items,
  layout,
  slotCount,
  slotColumns,
  slotItem,
  equip,
  clear,
  onBack
}: SlotPickerOptions<T>) => {
  const [mode, setMode] = useState<PickerMode>('slots');
  const [slot, setSlot] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  // The slot cursor is kept for the keyboard, but its effect shows only while the slot is pointed at or moved to.
  const [slotShown, setSlotShown] = useState(false);
  // Slot under the pointer, in either step.
  const [pointed, setPointed] = useState<number | null>(null);

  const open = (s: number) => {
    setSlot(s);
    setMode('list');
    const current = slotItem(s);
    setHovered(current === null ? 0 : Math.max(0, items.indexOf(current)));
  };
  const pick = (i: number) => {
    equip(slot, items[i]);
    setMode('slots');
    setHovered(null);
  };
  const leaveList = () => {
    setMode('slots');
    setHovered(null);
  };

  const moveSlot = (dx: number, dy: number) => {
    const col = slot % slotColumns;
    const row = Math.floor(slot / slotColumns);
    const rows = Math.ceil(slotCount / slotColumns);
    const next =
      Math.min(rows - 1, Math.max(0, row + dy)) * slotColumns +
      Math.min(slotColumns - 1, Math.max(0, col + dx));
    setSlot(Math.min(slotCount - 1, next));
    setSlotShown(true);
  };
  const moveCursor = (dx: number, dy: number) => {
    const at = hovered ?? 0;
    const col = Math.floor(at / layout.rows);
    const row = at % layout.rows;
    const c = Math.min(layout.columns.length - 1, Math.max(0, col + dx));
    const r = Math.min(layout.rows - 1, Math.max(0, row + dy));
    setHovered(Math.min(items.length - 1, c * layout.rows + r));
  };
  const move = (dx: number, dy: number) => (mode === 'slots' ? moveSlot(dx, dy) : moveCursor(dx, dy));
  const confirm = () => (mode === 'slots' ? open(slot) : hovered !== null && pick(hovered));
  const cancel = () => (mode === 'list' ? leaveList() : onBack());

  useHotkeys([
    { hotkey: 'ArrowUp', callback: () => move(0, -1) },
    { hotkey: 'ArrowDown', callback: () => move(0, 1) },
    { hotkey: 'ArrowLeft', callback: () => move(-1, 0) },
    { hotkey: 'ArrowRight', callback: () => move(1, 0) },
    enterHotkey(confirm),
    { hotkey: 'A', callback: confirm },
    { hotkey: 'Y', callback: () => mode === 'slots' && clear(slot) },
    { hotkey: 'Delete', callback: () => mode === 'slots' && clear(slot) },
    { hotkey: 'Escape', callback: cancel },
    { hotkey: 'B', callback: cancel }
  ]);

  const pointSlot = (s: number) => {
    setPointed(s);
    if (mode !== 'slots') return;
    setSlot(s);
    setSlotShown(true);
  };
  const leaveSlot = () => {
    setPointed(null);
    setSlotShown(false);
  };
  // While a slot is being changed it keeps its selected look, so it reads as the one being edited; the other slots
  // still react to the pointer (a click there switches the slot being edited).
  const slotEditing = (s: number) => mode === 'list' && slot === s;
  const slotActive = (s: number) =>
    pointed === s || slotEditing(s) || (mode === 'slots' && slotShown && slot === s);

  return {
    mode,
    slot,
    hovered,
    setHovered,
    open,
    pick,
    cancel,
    pointSlot,
    leaveSlot,
    slotActive,
    slotEditing
  };
};

export default useSlotPicker;
