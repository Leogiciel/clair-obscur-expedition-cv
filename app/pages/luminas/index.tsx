import { useHotkeys } from '@tanstack/react-hotkeys';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import KeyHint from '~/components/ui-kit/KeyHint';
import TextureLuminasRow from '~/components/ui-kit/TextureLuminas/TextureLuminasRow';
import {
  LUMINAS,
  LUMINA_POINTS,
  type LuminaCategory,
  type Picto,
  luminaCost,
  luminaPointsSpent,
  pictoById
} from '~/data';

import Glyph from '../common/Glyph';
import Label from '../common/Label';
import Num from '../common/Num';
import PlateGrid, { type PlateGridLayout } from '../common/PlateGrid';
import Portrait from '../common/Portrait';
import SortTitle from '../common/SortTitle';
import Tooltip from '../common/Tooltip';
import enterHotkey from '../common/enterHotkey';
import useLoadout from '../common/store/useLoadout';
import useSort, { type SortOption } from '../common/useSort';
import PictoDetails from '../pictos/PictoDetails';
import EditPictos from './EditPictos';
import LuminaPoints from './LuminaPoints';
import LuminaTabs from './LuminaTabs';

type Tab = 'All' | LuminaCategory;
const TABS: Tab[] = ['All', 'Offensive', 'Defensive', 'Support'];

// Measured on the game screenshot (design/luminas-screen.webp): three columns, 70px rows; columns are 380px apart
// (game: 350) so an equipped Lumina's portrait clears the next column.
const COLUMNS = [
  { x: 180, length: 300 },
  { x: 560, length: 300 },
  { x: 940, length: 300 }
];
const GRID = { firstRow: 400, pitch: 70 };
const TOOLTIP_X = 1320;

const SORTS: SortOption<Picto>[] = [
  { label: 'Alphabetical', compare: (a, b) => a.name.localeCompare(b.name), descending: false },
  { label: 'Cost', compare: (a, b) => luminaCost(a) - luminaCost(b), descending: true }
];

const LuminasPage = () => {
  const navigate = useNavigate();
  const pictos = useLoadout((s) => s.pictos);
  const active = useLoadout((s) => s.luminas);
  const toggle = useLoadout((s) => s.toggleLumina);
  const reset = useLoadout((s) => s.resetLuminas);
  const [tab, setTab] = useState<Tab>('All');
  const [hovered, setHovered] = useState<number | null>(null);
  const sort = useSort(tab === 'All' ? LUMINAS : LUMINAS.filter((l) => l.category === tab), SORTS);
  const items = sort.sorted;
  const rows = Math.max(1, Math.ceil(items.length / COLUMNS.length));
  const layout: PlateGridLayout = { columns: COLUMNS, firstRow: GRID.firstRow, pitch: GRID.pitch, rows };
  const isFree = (p: Picto) => pictos.includes(p.id);
  const isActive = (p: Picto) => isFree(p) || active.includes(p.id);
  const available = LUMINA_POINTS - luminaPointsSpent(active, pictos);
  // As in the game: inactive Luminas the remaining points can still pay for keep a muted cyan cost; the ones that are
  // out of budget are greyed out entirely.
  const affordable = (p: Picto) => isActive(p) || luminaCost(p) <= available;
  const costColor = (p: Picto) =>
    isActive(p)
      ? 'var(--el-cyan)'
      : affordable(p)
        ? 'color-mix(in srgb, var(--el-cyan) 55%, #5d6b6a)'
        : '#5c5a55';
  const nameStyle = (p: Picto) => (isActive(p) ? {} : affordable(p) ? { opacity: 0.8 } : { opacity: 0.4 });
  const shown = hovered === null ? null : items[hovered];

  const changeTab = (d: number) => {
    setTab((t) => TABS[(TABS.indexOf(t) + d + TABS.length) % TABS.length]);
    setHovered(null);
  };
  const move = (dx: number, dy: number) => {
    const at = hovered ?? 0;
    const col = Math.min(COLUMNS.length - 1, Math.max(0, Math.floor(at / rows) + dx));
    const row = Math.min(rows - 1, Math.max(0, (at % rows) + dy));
    setHovered(Math.min(items.length - 1, col * rows + row));
  };
  useHotkeys([
    { hotkey: 'ArrowUp', callback: () => move(0, -1) },
    { hotkey: 'ArrowDown', callback: () => move(0, 1) },
    { hotkey: 'ArrowLeft', callback: () => move(-1, 0) },
    { hotkey: 'ArrowRight', callback: () => move(1, 0) },
    enterHotkey(() => shown && toggle(shown.id)),
    { hotkey: 'A', callback: () => shown && toggle(shown.id) },
    { hotkey: 'Q', callback: () => changeTab(-1) },
    { hotkey: 'E', callback: () => changeTab(1) },
    { hotkey: 'Y', callback: reset },
    { hotkey: 'C', callback: () => void navigate('/pictos') },
    { hotkey: 'Escape', callback: () => void navigate('/overview') },
    { hotkey: 'B', callback: () => void navigate('/overview') }
  ]);

  return (
    <>
      <SortTitle title="Luminas" sort={sort} />
      <LuminaTabs
        tabs={TABS}
        current={tab}
        onChange={(t) => {
          setTab(t);
          setHovered(null);
        }}
      />

      <PlateGrid
        label="Luminas"
        items={items}
        layout={layout}
        hovered={hovered}
        onHover={setHovered}
        onPick={(i) => toggle(items[i].id)}
        variant={(p) => (isActive(p) ? 'selected' : 'normal')}
        itemLabel={(p) =>
          `${p.name}, cost ${luminaCost(p)}${isFree(p) ? ', from an equipped picto' : isActive(p) ? ', active' : ''}`
        }
        icon={(p) => <Glyph element={p.element} muted={!affordable(p)} />}
        portrait={(p) => (isActive(p) ? <Portrait /> : undefined)}
        aside={(p) => (
          <Num size={34} style={{ color: costColor(p) }}>
            {luminaCost(p)}
          </Num>
        )}
      >
        {(p) => (
          <Label size={p.name.length > 12 ? 23 : 26} className="block" style={nameStyle(p)}>
            {p.name}
          </Label>
        )}
      </PlateGrid>

      {shown && hovered !== null && (
        <Tooltip left={TOOLTIP_X} top={GRID.firstRow + (hovered % rows) * GRID.pitch} width={500}>
          <div className="relative left-[-14px] top-[1px] w-[440px]">
            <PictoDetails picto={shown} />
          </div>
        </Tooltip>
      )}

      <EditPictos onOpen={() => void navigate('/pictos')} />
      <div className="absolute left-[1890px] top-[900px] flex w-[440px] flex-col gap-[6px]">
        {pictos
          .filter((id) => id !== null)
          .map((id) => {
            const p = pictoById(id);
            return (
              <TextureLuminasRow
                key={id}
                marked
                icon={<Glyph element={p.element} />}
                aside={<Num size={30}>{luminaCost(p)}</Num>}
              >
                <Label size={30}>{p.name}</Label>
              </TextureLuminasRow>
            );
          })}
      </div>

      <LuminaPoints available={available} />

      <div className="Screen-hints absolute left-[1480px] top-[1300px] gap-[36px] [&_.KeyHint]:text-[26px] [&_.KeyHint-key]:size-[34px]">
        <button type="button" className="contents" onClick={reset}>
          <KeyHint keyLabel="Y" tone="y" label="Reset" />
        </button>
        {shown && !isFree(shown) && (
          <button type="button" className="contents" onClick={() => toggle(shown.id)}>
            <KeyHint
              keyLabel="A"
              tone="a"
              label={isActive(shown) ? 'Deactivate Lumina' : 'Activate Lumina'}
            />
          </button>
        )}
        <button type="button" className="contents" onClick={() => void navigate('/overview')}>
          <KeyHint keyLabel="B" tone="b" label="Back" />
        </button>
      </div>
    </>
  );
};

export default LuminasPage;
