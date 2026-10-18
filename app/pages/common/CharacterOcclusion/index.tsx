import framing from '~/assets/character/framing.json';
import { publicUrl } from '~/publicUrl';

import type { Shot } from '../Character';
import './style.scss';

// The character's silhouette (scripts/character/mattes.py) filled with the stage colour, between the back petals and
// the character: the clip is lightened onto the stage, so without it petals would show through his dark clothes.
// A static layer, cheap to composite, unlike a mask over the moving petals.
const CharacterOcclusion = ({ shot }: { shot: Shot }) => {
  const f = framing[shot];
  return (
    <div
      className="CharacterOcclusion"
      style={{
        left: f.x,
        top: f.y,
        width: f.width * f.scale,
        height: f.height * f.scale,
        maskImage: `url('${publicUrl(`ui/character/${shot}-matte.webp`)}')`
      }}
      aria-hidden
    />
  );
};

export default CharacterOcclusion;
