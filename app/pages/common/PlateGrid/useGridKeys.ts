import {useEffect} from 'react';
import type {PlateGridLayout} from '.';

// Arrow keys move through the grid column by column; Escape and B go back.
const useGridKeys = (count: number, layout: PlateGridLayout, cursor: number, onCursor: (i: number) => void, onBack: () => void) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const col = Math.floor(cursor / layout.rows);
      const row = cursor % layout.rows;
      const at = (c: number, r: number) => Math.min(count - 1, c * layout.rows + r);
      if (e.key === 'ArrowDown') onCursor(at(col, Math.min(layout.rows - 1, row + 1)));
      else if (e.key === 'ArrowUp') onCursor(at(col, Math.max(0, row - 1)));
      else if (e.key === 'ArrowRight') onCursor(at(Math.min(layout.columns.length - 1, col + 1), row));
      else if (e.key === 'ArrowLeft') onCursor(at(Math.max(0, col - 1), row));
      else if (e.key === 'Escape' || e.key === 'b' || e.key === 'B') onBack();
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [count, layout, cursor, onCursor, onBack]);
};

export default useGridKeys;
