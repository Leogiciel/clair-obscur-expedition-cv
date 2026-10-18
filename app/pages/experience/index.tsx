import { useHotkeys } from '@tanstack/react-hotkeys';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import KeyHint from '~/components/ui-kit/KeyHint';
import SelectFx from '~/components/ui-kit/SelectFx';
import TextureCard from '~/components/ui-kit/TextureCard';
import TextureEquippedCard from '~/components/ui-kit/TextureEquippedCard';
import TextureListPanel from '~/components/ui-kit/TextureListPanel';
import TextureWeaponRows from '~/components/ui-kit/TextureWeaponRows';

import CardTitle from '../common/CardTitle';
import CompanyLogo from '../common/CompanyLogo';
import Label from '../common/Label';
import Num from '../common/Num';
import SortTitle from '../common/SortTitle';
import { EXPERIENCES, type Experience, monthsOf, periodOf } from '../common/data';
import useLoadout from '../common/store/useLoadout';
import useSort, { type SortOption } from '../common/useSort';
import ExperienceStats from './ExperienceStats';
import Highlights from './Highlights';
import MonthsBlock from './MonthsBlock';
import StackIcons from './StackIcons';

// Measured on the video: selected row at (200, 310), normal at (244, 404); centers 85px apart. Hovered rows get the
// home screen's selection, stretched to the row.
const FIRST_CENTER = 356;
const PITCH = 85;
const ROW = {
  selected: { x: 200, center: 46, width: 488, height: 92, top: 10 },
  normal: { x: 244, center: 37, width: 420, height: 74, top: 6 }
};

// Chronological: by end date, current positions last (first when descending), then by start date.
const SORTS: SortOption<Experience>[] = [
  {
    label: 'Chronological',
    compare: (a, b) => (a.end ?? '9999').localeCompare(b.end ?? '9999') || a.start.localeCompare(b.start),
    descending: true
  },
  { label: 'Duration', compare: (a, b) => monthsOf(a) - monthsOf(b), descending: true },
  { label: 'Alphabetical', compare: (a, b) => a.company.localeCompare(b.company), descending: false }
];

const ExperiencePage = () => {
  const navigate = useNavigate();
  const sort = useSort(EXPERIENCES, SORTS);
  const list = sort.sorted;
  const equippedId = useLoadout((s) => s.experience);
  const equip = useLoadout((s) => s.equipExperience);
  const [hovered, setHovered] = useState<number | null>(null);
  const current = EXPERIENCES.find((e) => e.id === equippedId) ?? EXPERIENCES[0];
  const shown = hovered === null ? current : list[hovered];
  const move = (d: number) =>
    setHovered((h) => Math.min(list.length - 1, Math.max(0, (h ?? list.indexOf(current)) + d)));

  useHotkeys([
    { hotkey: 'ArrowDown', callback: () => move(1) },
    { hotkey: 'ArrowUp', callback: () => move(-1) },
    { hotkey: 'Enter', callback: () => hovered !== null && equip(list[hovered].id) },
    { hotkey: 'A', callback: () => hovered !== null && equip(list[hovered].id) },
    { hotkey: 'Escape', callback: () => navigate('/') },
    { hotkey: 'B', callback: () => navigate('/') }
  ]);

  return (
    <>
      <TextureListPanel className="absolute left-[100px] top-[278px]" />
      <SortTitle title="Experience" sort={sort} />

      <ul aria-label="Experience" onMouseLeave={() => setHovered(null)}>
        {list.map((e, i) => {
          const variant = e.id === current.id ? 'selected' : 'normal';
          const g = ROW[variant];
          const top = FIRST_CENTER + i * PITCH - g.center;
          return (
            <li key={e.id} className="contents">
              <button
                type="button"
                className={`Screen-item ${hovered === i ? 'Screen-item--active' : ''}`}
                style={
                  {
                    left: g.x,
                    top,
                    width: g.width,
                    height: g.height,
                    zIndex: hovered === i ? 0 : 1,
                    '--slide': '0px',
                    '--sel-scale': 1.1
                  } as React.CSSProperties
                }
                aria-current={variant === 'selected'}
                aria-label={`${e.title}, ${e.company}${variant === 'selected' ? ', equipped' : ''}`}
                onMouseEnter={() => setHovered(i)}
                onFocus={() => setHovered(i)}
                onClick={() => equip(e.id)}
              >
                <div className="Screen-slide">
                  <TextureWeaponRows
                    variant={variant}
                    icon={<CompanyLogo experience={e} />}
                    aside={
                      <span className="flex flex-col items-center">
                        <Label size={22}>Months</Label>
                        <Num size={40}>{monthsOf(e)}</Num>
                      </span>
                    }
                  >
                    <Label size={e.company.length > 10 ? 28 : 34}>{e.company}</Label>
                  </TextureWeaponRows>
                </div>
                <SelectFx kind="skill" active={hovered === i} fit={{ width: g.width, height: g.height }} />
              </button>
            </li>
          );
        })}
      </ul>

      <TextureCard className="pointer-events-none absolute left-[740px] top-[296px] h-[262px] w-[580px]">
        <div className="absolute left-[14px] top-[-22px] h-[240px] w-[480px]">
          <CardTitle
            as="div"
            size={shown.title.length > 20 ? 25 : undefined}
            className="absolute left-[62px] top-[40px] whitespace-nowrap"
          >
            {shown.title}
          </CardTitle>
          <Label as="div" size={20} className="absolute left-[64px] top-[90px]" style={{ opacity: 0.75 }}>
            {shown.company}
            {shown.freelance ? ' (freelance)' : ''} · {periodOf(shown)}
          </Label>
          <span className="absolute left-[420px] top-[24px]">
            <MonthsBlock months={monthsOf(shown)} />
          </span>
          <div className="absolute left-[40px] top-[136px] grid w-[430px] grid-flow-col text-center">
            <ExperienceStats experience={shown} />
          </div>
        </div>
      </TextureCard>

      <StackIcons stack={shown.stack} className="absolute left-[790px] top-[580px]" />
      <Highlights items={shown.highlights} className="absolute left-[150px] top-[870px]" />

      <TextureEquippedCard
        className="absolute left-[1830px] top-[918px]"
        title={<CardTitle size={36}>{current.title}</CardTitle>}
        aside={<MonthsBlock months={monthsOf(current)} />}
      >
        <ExperienceStats experience={current} />
      </TextureEquippedCard>

      <div className="Screen-hints absolute left-[1965px] top-[1293px]">
        {hovered !== null && list[hovered].id !== current.id && (
          <button type="button" className="contents" onClick={() => equip(list[hovered].id)}>
            <KeyHint keyLabel="A" tone="a" label="Equip" />
          </button>
        )}
        <button type="button" className="contents" onClick={() => navigate('/')}>
          <KeyHint keyLabel="B" tone="b" label="Back" />
        </button>
      </div>
    </>
  );
};

export default ExperiencePage;
