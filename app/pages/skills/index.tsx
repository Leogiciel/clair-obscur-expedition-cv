import {useCallback, useState} from 'react';
import {useNavigate} from 'react-router';
import TextureTitleSort from '~/components/ui-kit/TextureTitleSort';
import TextureMainSkill from '~/components/ui-kit/TextureMainSkill';
import TextureButton from '~/components/ui-kit/TextureButton';
import KeyHint from '~/components/ui-kit/KeyHint';
import Glyph from '../common/Glyph';
import Label from '../common/Label';
import Num from '../common/Num';
import CardTitle from '../common/CardTitle';
import PlateGrid, {type PlateGridLayout} from '../common/PlateGrid';
import useGridKeys from '../common/PlateGrid/useGridKeys';
import Tooltip from '../common/Tooltip';
import {EQUIPPED_SKILLS, LINKEDIN_URL, SKILLS} from '../common/data';

// Measured on the capture (t38): same 69-70px rows as the Pictos list, shifted left; plates run ≈ 306px.
const LIST: PlateGridLayout = {columns: [{x: 138, length: 307}, {x: 454, length: 305}], firstRow: 326, pitch: 69, rows: 5};
// Equipped slots: the home Skills grid, at the same place on both screens.
const SLOT_ORIGIN = {x: 836.5, y: 1106};
const SLOT_STEP = {x: 413.5, y: 82.5};
// Tooltip just above the slots. Key hints are smaller than on the other screens so they clear the slots, as in the game.
const TOOLTIP = {left: 1224, top: 853, width: 500, height: 220};

const sorted = [...SKILLS].sort((a, b) => a.name.localeCompare(b.name));

const SkillsPage = () => {
  const navigate = useNavigate();
  const [cursor, setCursor] = useState(0);
  const back = useCallback(() => navigate('/'), [navigate]);
  useGridKeys(sorted.length, LIST, cursor, setCursor, back);
  const skill = sorted[cursor];

  return (
    <>
      <TextureTitleSort
        title="Skills"
        className="absolute left-[4px] top-[193px]"
        sortKey={<KeyHint keyLabel="X" tone="x" className="[&_.KeyHint-key]:size-[40px] [&_.KeyHint-key]:text-[20px]"/>}
        sort="Alphabetical"
        aside={<KeyHint keyLabel="R" label="Descending" className="[&_.KeyHint-label]:text-[30px]"/>}
      />

      <PlateGrid
        label="Skills"
        items={sorted}
        layout={LIST}
        cursor={cursor}
        onCursor={setCursor}
        variant={(s, i) => (i === cursor ? 'hover' : s.equipped ? 'selected' : 'normal')}
        itemLabel={(s) => `${s.name}, level ${s.level}${s.equipped ? ', equipped' : ''}`}
        icon={(s) => <Glyph element={s.element}/>}
        aside={(s) => <span className="flex w-[44px] flex-col items-center"><Label size={19}>Level</Label><Num size={36}>{s.level}</Num></span>}
      >
        {(s) => <Label size={s.name.length > 12 ? 23 : 26} className="block">{s.name}</Label>}
      </PlateGrid>

      <Tooltip {...TOOLTIP}>
        <div className="absolute left-[-31px] top-[1px] w-[450px]">
          <span className="absolute left-[2px] top-0 size-[40px]"><Glyph element={skill.element}/></span>
          <CardTitle size={32} className="absolute left-[48px] top-[4px]" style={{letterSpacing: '0.03em'}}>{skill.name}</CardTitle>
          <span className="absolute left-[380px] top-[-6px] flex w-[60px] flex-col items-center"><Label size={20}>Level</Label><Num size={36}>{skill.level}</Num></span>
          <Label as="p" size={26} className="absolute left-[2px] top-[58px] w-[430px]" style={{lineHeight: 1.15}}>{skill.description}</Label>
        </div>
      </Tooltip>

      <ul aria-label="Equipped skills">
        {EQUIPPED_SKILLS.map((s, i) => (
          <li
            key={s.id}
            className="absolute"
            style={{left: SLOT_ORIGIN.x + (i % 2) * SLOT_STEP.x, top: SLOT_ORIGIN.y + Math.floor(i / 2) * SLOT_STEP.y}}
            onMouseEnter={() => setCursor(sorted.indexOf(s))}
          >
            <TextureMainSkill icon={<Glyph element={s.element}/>} level={s.level}>{s.name}</TextureMainSkill>
          </li>
        ))}
      </ul>

      <TextureButton className="absolute left-[1915px] top-[786px]" onClick={() => window.open(`${LINKEDIN_URL}details/skills/`, '_blank', 'noopener')}>
        Skill Tree
      </TextureButton>

      <div className="Screen-hints absolute left-[1700px] top-[1300px] gap-[36px] [&_.KeyHint]:text-[26px] [&_.KeyHint-key]:size-[34px]">
        <KeyHint keyLabel="Y" tone="y" label="Clear Skill Slot"/>
        <KeyHint keyLabel="A" tone="a" label="Select Skill Slot"/>
        <button type="button" className="contents" onClick={back}>
          <KeyHint keyLabel="B" tone="b" label="Back"/>
        </button>
      </div>
    </>
  );
};

export default SkillsPage;
