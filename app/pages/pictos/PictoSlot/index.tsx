import SelectFx from '~/components/ui-kit/SelectFx';
import measures from '~/components/ui-kit/SelectFx/measures.json';
import TextureDiamondCard from '~/components/ui-kit/TextureDiamondCard';
import TextureEmpty from '~/components/ui-kit/TextureEmpty';
import type { Picto } from '~/data';

import Glyph from '../../common/Glyph';
import Label from '../../common/Label';
import PictoDetails from '../PictoDetails';

interface PictoSlotProps {
  picto: Picto | null;
  index: number;
  focused: boolean;
  left: number;
  top: number;
  onFocus: () => void;
  onLeave: () => void;
  onOpen: () => void;
}

// Measured on the capture (13.98-14.3 s): the card under the cursor grows 1.102 in 0.1 s around (349, 94) and paint
// flares on its left and top edges (SelectFx `card`). An empty slot only grows; its diamond sits 10px lower and 3px
// left of a card's.
const CARD = { width: 623, height: 198, scale: 1.102, origin: measures.card.origin };
const EMPTY = { size: 185 };

const PictoSlot = ({ picto, index, focused, left, top, onFocus, onLeave, onOpen }: PictoSlotProps) => {
  const box = picto
    ? { left, top, width: CARD.width, height: CARD.height }
    : { left: left - 3, top: top + 10, width: EMPTY.size, height: EMPTY.size };
  const origin = picto ? `${CARD.origin[0]}px ${CARD.origin[1]}px` : '50% 50%';
  return (
    <button
      type="button"
      className={`Screen-item ${focused ? 'Screen-item--active' : ''}`}
      style={{ ...box, '--slide': '0px', '--sel-scale': CARD.scale } as React.CSSProperties}
      aria-label={`Pictos slot ${index + 1}: ${picto ? picto.name : 'empty'}`}
      aria-current={focused}
      onMouseEnter={onFocus}
      onFocus={onFocus}
      onMouseLeave={onLeave}
      onBlur={onLeave}
      onClick={onOpen}
    >
      <div className="Screen-slide" style={{ transformOrigin: origin }}>
        {picto ? (
          <TextureDiamondCard icon={<Glyph element={picto.element} />}>
            <PictoDetails picto={picto} />
          </TextureDiamondCard>
        ) : (
          <TextureEmpty>
            <Label size={30}>Empty</Label>
          </TextureEmpty>
        )}
      </div>
      {picto && <SelectFx kind="card" active={focused} />}
    </button>
  );
};

export default PictoSlot;
