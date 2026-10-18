import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router';

import KeyHint from '~/components/ui-kit/KeyHint';

import Glyph from '../common/Glyph';
import Label from '../common/Label';
import Luminas from '../common/Luminas';
import Num from '../common/Num';
import PlateGrid, { type PlateGridLayout } from '../common/PlateGrid';
import Portrait from '../common/Portrait';
import SortTitle from '../common/SortTitle';
import type { StageContext } from '../common/StageLayout';
import Tooltip from '../common/Tooltip';
import { PICTOS, PICTO_SLOTS, type Picto, pictoById } from '../common/data';
import useLoadout from '../common/store/useLoadout';
import useSlotPicker from '../common/useSlotPicker';
import useSort, { type SortOption } from '../common/useSort';
import PictoDetails from './PictoDetails';
import PictoSlot from './PictoSlot';

// Measured on the capture (t15): 70px rows in two columns; plates run 310px (left) and 318px (right).
const LIST: PlateGridLayout = {
  columns: [
    { x: 172, length: 310 },
    { x: 538, length: 318 }
  ],
  firstRow: 329,
  pitch: 70,
  rows: 3
};
const SLOT = { x: 1025, y: 457, pitch: 278 };
// Hovered-row tooltip: top on the row's top rule, title 25px and text 19px inside its left edge (same type sizes
// as the cards).
const TOOLTIP_X = 941;

const SORTS: SortOption<Picto>[] = [
  { label: 'Level', compare: (a, b) => a.level - b.level, descending: true },
  { label: 'Alphabetical', compare: (a, b) => a.name.localeCompare(b.name), descending: false }
];

const PictosPage = () => {
  const navigate = useNavigate();
  // Opened from the Luminas screen (Edit Pictos), Back returns there, as in the game.
  const { from } = useOutletContext<StageContext>();
  const [backTo] = useState(from === '/luminas' ? '/luminas' : '/overview');
  const sort = useSort(PICTOS, SORTS);
  const { sorted } = sort;
  const slots = useLoadout((s) => s.pictos);
  const equip = useLoadout((s) => s.equipPicto);
  const clear = useLoadout((s) => s.clearPicto);
  const equipped = (p: Picto) => slots.includes(p.id);
  const picker = useSlotPicker<Picto>({
    items: sorted,
    layout: LIST,
    slotCount: PICTO_SLOTS,
    slotColumns: 1,
    slotItem: (s) => (slots[s] ? pictoById(slots[s]) : null),
    equip: (s, p) => equip(s, p.id),
    clear,
    onBack: () => navigate(backTo)
  });
  const hovered = picker.hovered === null ? null : sorted[picker.hovered];
  const inSlot = slots[picker.slot];

  return (
    <>
      <SortTitle title="Pictos" sort={sort} />

      <PlateGrid
        label="Pictos"
        items={sorted}
        layout={LIST}
        hovered={picker.hovered}
        onHover={picker.setHovered}
        onPick={picker.pick}
        variant={(p) => (equipped(p) ? 'selected' : 'normal')}
        itemLabel={(p) => `${p.name}, level ${p.level}${equipped(p) ? ', equipped' : ''}`}
        icon={(p) => <Glyph element={p.element} muted={!equipped(p)} />}
        portrait={(p) => (equipped(p) ? <Portrait /> : undefined)}
        aside={(p) => (
          <span className="flex w-[44px] flex-col items-center">
            <Label size={19}>Level</Label>
            <Num size={36}>{p.level}</Num>
          </span>
        )}
      >
        {(p) => (
          <Label size={p.name.length > 12 ? 23 : 26} className="block">
            {p.name}
          </Label>
        )}
      </PlateGrid>

      <section aria-label="Equipped pictos">
        {slots.map((id, i) => (
          <PictoSlot
            key={i}
            index={i}
            picto={id ? pictoById(id) : null}
            focused={picker.slotActive(i)}
            left={SLOT.x}
            top={SLOT.y + i * SLOT.pitch}
            onFocus={() => picker.pointSlot(i)}
            onLeave={picker.leaveSlot}
            onOpen={() => picker.open(i)}
          />
        ))}
      </section>

      {hovered && picker.hovered !== null && (
        <Tooltip left={TOOLTIP_X} top={LIST.firstRow + (picker.hovered % LIST.rows) * LIST.pitch} width={500}>
          <div className="relative left-[-14px] top-[1px] w-[440px]">
            <PictoDetails picto={hovered} />
          </div>
        </Tooltip>
      )}

      <Luminas />

      <div className="Screen-hints absolute left-[1520px] top-[1293px]">
        {picker.mode === 'slots' ? (
          <>
            {inSlot && (
              <button type="button" className="contents" onClick={() => clear(picker.slot)}>
                <KeyHint keyLabel="Y" tone="y" label="Clear Pictos Slot" />
              </button>
            )}
            <button type="button" className="contents" onClick={() => picker.open(picker.slot)}>
              <KeyHint keyLabel="A" tone="a" label="Select Pictos Slot" />
            </button>
          </>
        ) : (
          hovered && (
            <button
              type="button"
              className="contents"
              onClick={() => picker.hovered !== null && picker.pick(picker.hovered)}
            >
              <KeyHint
                keyLabel="A"
                tone="a"
                label={inSlot === hovered.id ? 'Unequip Pictos' : 'Equip Pictos'}
              />
            </button>
          )
        )}
        <button type="button" className="contents" onClick={picker.cancel}>
          <KeyHint keyLabel="B" tone="b" label="Back" />
        </button>
      </div>
    </>
  );
};

export default PictosPage;
