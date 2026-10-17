import {useCallback, useState} from 'react';
import {useNavigate} from 'react-router';
import TextureTitleSort from '~/components/ui-kit/TextureTitleSort';
import TextureDiamondCard from '~/components/ui-kit/TextureDiamondCard';
import TextureEmpty from '~/components/ui-kit/TextureEmpty';
import KeyHint from '~/components/ui-kit/KeyHint';
import Glyph from '../common/Glyph';
import Label from '../common/Label';
import Num from '../common/Num';
import PortraitStub from '../common/PortraitStub';
import PlateGrid, {type PlateGridLayout} from '../common/PlateGrid';
import useGridKeys from '../common/PlateGrid/useGridKeys';
import Tooltip from '../common/Tooltip';
import Luminas from '../common/Luminas';
import {EQUIPPED, PICTO_SLOTS, PICTOS} from '../common/data';
import PictoDetails from './PictoDetails';

// Measured on the capture (t15): 70px rows in two columns; plates run 310px (left) and 318px (right).
const LIST: PlateGridLayout = {columns: [{x: 172, length: 310}, {x: 538, length: 318}], firstRow: 329, pitch: 70, rows: 3};
// Equipped slots: diamond cards 278px apart; an empty slot's diamond sits 10px lower than a card's.
const SLOT = {x: 1025, y: 457, pitch: 278};
// Hovered-row tooltip: top on the row's top rule, title 25px and text 19px inside its left edge (same type sizes
// as the cards).
const TOOLTIP_X = 941;

const sorted = [...PICTOS].sort((a, b) => b.level - a.level);

const PictosPage = () => {
  const navigate = useNavigate();
  const [cursor, setCursor] = useState(0);
  const back = useCallback(() => navigate('/'), [navigate]);
  useGridKeys(sorted.length, LIST, cursor, setCursor, back);
  const picto = sorted[cursor];

  return (
    <>
      <TextureTitleSort
        title="Pictos"
        className="absolute left-[4px] top-[193px]"
        sortKey={<KeyHint keyLabel="X" tone="x" className="[&_.KeyHint-key]:size-[40px] [&_.KeyHint-key]:text-[20px]"/>}
        sort="Level"
        aside={<KeyHint keyLabel="R" label="Descending" className="[&_.KeyHint-label]:text-[30px]"/>}
      />

      <PlateGrid
        label="Pictos"
        items={sorted}
        layout={LIST}
        cursor={cursor}
        onCursor={setCursor}
        variant={(p, i) => (i === cursor ? 'hover' : p.equipped ? 'selected' : 'normal')}
        itemLabel={(p) => `${p.name}, level ${p.level}${p.equipped ? ', equipped' : ''}`}
        icon={(p) => <Glyph element={p.element}/>}
        portrait={(p) => (p.equipped ? <PortraitStub/> : undefined)}
        aside={(p) => <span className="flex w-[44px] flex-col items-center"><Label size={19}>Level</Label><Num size={36}>{p.level}</Num></span>}
      >
        {(p) => <Label size={p.name.length > 12 ? 23 : 26} className="block">{p.name}</Label>}
      </PlateGrid>

      <section aria-label="Equipped pictos">
        {Array.from({length: PICTO_SLOTS}, (_, i) => {
          const equipped = EQUIPPED[i];
          const top = SLOT.y + i * SLOT.pitch;
          return equipped ? (
            <TextureDiamondCard key={equipped.id} icon={<Glyph element={equipped.element}/>} className="absolute" style={{left: SLOT.x, top}}>
              <PictoDetails picto={equipped}/>
            </TextureDiamondCard>
          ) : (
            <TextureEmpty key={`empty-${i}`} className="absolute" style={{left: SLOT.x - 3, top: top + 10}}>
              <Label size={30}>Empty</Label>
            </TextureEmpty>
          );
        })}
      </section>

      <Tooltip left={TOOLTIP_X} top={LIST.firstRow + (cursor % LIST.rows) * LIST.pitch} width={500} height={215}>
        <div className="absolute left-[-31px] top-[1px] h-[190px] w-[440px]">
          <PictoDetails picto={picto}/>
        </div>
      </Tooltip>

      <Luminas/>

      <div className="Screen-hints absolute left-[1520px] top-[1293px]">
        <KeyHint keyLabel="Y" tone="y" label="Add to Favourites"/>
        <KeyHint keyLabel="A" tone="a" label={picto.equipped ? 'Unequip Pictos' : 'Equip Pictos'}/>
        <button type="button" className="contents" onClick={back}>
          <KeyHint keyLabel="B" tone="b" label="Back"/>
        </button>
      </div>
    </>
  );
};

export default PictosPage;
