import { useHotkeys } from '@tanstack/react-hotkeys';
import { useNavigate } from 'react-router';

import KeyHint from '~/components/ui-kit/KeyHint';
import { SKILLS, SKILL_SLOTS, type Skill, skillById, skillSummary } from '~/data';

import CardTitle from '../common/CardTitle';
import IconButton from '../common/IconButton';
import Label from '../common/Label';
import Num from '../common/Num';
import PlateGrid, { type PlateGridLayout } from '../common/PlateGrid';
import Portrait from '../common/Portrait';
import SortTitle from '../common/SortTitle';
import { STAGE_H } from '../common/Stage/size';
import TechIcon from '../common/TechIcon';
import Tooltip from '../common/Tooltip';
import useLoadout from '../common/store/useLoadout';
import useSlotPicker from '../common/useSlotPicker';
import useSort, { type SortOption } from '../common/useSort';
import SkillSlot from './SkillSlot';
import SkillTreeSigil from './SkillTreeSigil';

// Measured on the capture (t38): same 69-70px rows as the Pictos list, shifted left; plates run ≈ 306px. Columns are
// 366px apart like the Pictos list, so an equipped row's portrait clears the next column. Eight rows hold the CV's 16
// skills and still end above the tooltip.
const LIST: PlateGridLayout = {
  columns: [
    { x: 138, length: 307 },
    { x: 504, length: 305 }
  ],
  firstRow: 326,
  pitch: 69,
  rows: 8
};
// Equipped slots: the home Skills grid, at the same place on both screens.
const SLOT_ORIGIN = { x: 836.5, y: 1106 };
const SLOT_STEP = { x: 413.5, y: 82.5 };
// Measured on the capture (23 s and 38 s): a slot's tooltip sits on top of its own column, just above the slots; a
// list row's sits right of the list, level with the row. Key hints are smaller than on the other screens so they
// clear the slots, as in the game.
const TOOLTIP_WIDTH = 500;
// The tooltip grows with its text, so a slot's one is anchored by its bottom, just above the slots.
const SLOT_TOOLTIP = { dx: -26, bottom: STAGE_H - SLOT_ORIGIN.y + 26 };
const LIST_TOOLTIP_X = 900;

const SORTS: SortOption<Skill>[] = [
  { label: 'Alphabetical', compare: (a, b) => a.name.localeCompare(b.name), descending: false },
  { label: 'Level', compare: (a, b) => a.level - b.level, descending: true }
];

const SkillsPage = () => {
  const navigate = useNavigate();
  const sort = useSort(SKILLS, SORTS);
  const { sorted } = sort;
  const slots = useLoadout((s) => s.skills);
  const equip = useLoadout((s) => s.equipSkill);
  const clear = useLoadout((s) => s.clearSkill);
  const equipped = (s: Skill) => slots.includes(s.id);
  useHotkeys([{ hotkey: 'C', callback: () => void navigate('/skill-tree') }]);
  const picker = useSlotPicker<Skill>({
    items: sorted,
    layout: LIST,
    slotCount: SKILL_SLOTS,
    slotColumns: 2,
    slotItem: (i) => (slots[i] ? skillById(slots[i]) : null),
    equip: (i, s) => equip(i, s.id),
    clear,
    onBack: () => void navigate('/overview')
  });
  const hovered = picker.hovered === null ? null : sorted[picker.hovered];
  const pointedSlot = slots.findIndex((_, i) => picker.slotActive(i) && !picker.slotEditing(i));
  const slotSkill = pointedSlot >= 0 && slots[pointedSlot] ? skillById(slots[pointedSlot]) : null;
  const tip =
    hovered && picker.hovered !== null
      ? {
          skill: hovered,
          left: LIST_TOOLTIP_X,
          top: LIST.firstRow + (picker.hovered % LIST.rows) * LIST.pitch,
          bottom: undefined
        }
      : slotSkill
        ? {
            skill: slotSkill,
            left: SLOT_ORIGIN.x + (pointedSlot % 2) * SLOT_STEP.x + SLOT_TOOLTIP.dx,
            top: undefined,
            bottom: SLOT_TOOLTIP.bottom
          }
        : null;
  const inSlot = slots[picker.slot];

  return (
    <>
      <SortTitle title="Skills" sort={sort} />

      <PlateGrid
        label="Skills"
        items={sorted}
        layout={LIST}
        hovered={picker.hovered}
        onHover={picker.setHovered}
        onPick={picker.pick}
        variant={(s) => (equipped(s) ? 'selected' : 'normal')}
        itemLabel={(s) => `${s.name}, level ${s.level}${equipped(s) ? ', equipped' : ''}`}
        icon={(s) => <TechIcon id={s.id} muted={!equipped(s)} />}
        portrait={(s) => (equipped(s) ? <Portrait /> : undefined)}
        aside={(s) => (
          <span className="flex w-[44px] flex-col items-center">
            <Label size={19}>Level</Label>
            <Num size={36}>{s.level}</Num>
          </span>
        )}
      >
        {(s) => (
          <Label size={s.name.length > 12 ? 23 : 26} className="block">
            {s.name}
          </Label>
        )}
      </PlateGrid>

      {tip && (
        <Tooltip width={TOOLTIP_WIDTH} left={tip.left} top={tip.top} bottom={tip.bottom}>
          <div className="relative left-[-14px] top-[1px] w-[420px]">
            <span className="absolute left-[2px] top-[-2px] grid size-[44px] place-items-center">
              <TechIcon id={tip.skill.id} />
            </span>
            <CardTitle
              size={32}
              className="absolute left-[48px] top-[4px]"
              style={{ letterSpacing: '0.03em' }}
            >
              {tip.skill.name}
            </CardTitle>
            <span className="absolute left-[359px] top-0 flex w-[60px] flex-col items-center">
              <Label size={20}>Level</Label>
              <Num size={36}>{tip.skill.level}</Num>
            </span>
            <Label
              as="p"
              size={20}
              className="absolute left-[27px] top-[52px] w-[380px]"
              style={{ opacity: 0.75 }}
            >
              {tip.skill.category}
            </Label>
            <Label as="p" size={26} className="ml-[27px] w-[380px] pt-[84px]" style={{ lineHeight: 1.15 }}>
              {skillSummary(tip.skill)}
            </Label>
          </div>
        </Tooltip>
      )}

      <section aria-label="Equipped skills">
        {slots.map((id, i) => (
          <SkillSlot
            key={i}
            index={i}
            skill={id ? skillById(id) : null}
            focused={picker.slotActive(i)}
            left={SLOT_ORIGIN.x + (i % 2) * SLOT_STEP.x}
            top={SLOT_ORIGIN.y + Math.floor(i / 2) * SLOT_STEP.y}
            onFocus={() => picker.pointSlot(i)}
            onLeave={picker.leaveSlot}
            onOpen={() => picker.open(i)}
          />
        ))}
      </section>

      <IconButton
        icon={<SkillTreeSigil />}
        keyLabel="C"
        className="absolute left-[1866px] top-[786px]"
        onClick={() => void navigate('/skill-tree')}
      >
        Skill Tree
      </IconButton>

      <div className="Screen-hints absolute left-[1700px] top-[1300px] gap-[36px] [&_.KeyHint]:text-[26px] [&_.KeyHint-key]:size-[34px]">
        {picker.mode === 'slots' ? (
          <>
            {inSlot && (
              <button type="button" className="contents" onClick={() => clear(picker.slot)}>
                <KeyHint keyLabel="Y" tone="y" label="Clear Skill Slot" />
              </button>
            )}
            <button type="button" className="contents" onClick={() => picker.open(picker.slot)}>
              <KeyHint keyLabel="A" tone="a" label="Select Skill Slot" />
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
                label={inSlot === hovered.id ? 'Unequip Skill' : 'Equip Skill'}
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

export default SkillsPage;
