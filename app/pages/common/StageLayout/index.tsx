import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router';

import Character, { type Shot } from '../Character';
import CharacterOcclusion from '../CharacterOcclusion';
import CharacterStats from '../CharacterStats';
import Petals from '../Petals';
import RotateScreen from '../RotateScreen';
import Stage from '../Stage';
import useLoadout from '../store/useLoadout';

const SHOTS: Record<string, Shot> = {
  '/experience': 'experience',
  '/pictos': 'pictos',
  '/skills': 'skills',
  '/luminas': 'luminas',
  '/skill-tree': 'skilltree'
};

export interface StageContext {
  from: string;
}

// The character and stats column persist across screens; only the outlet is swapped, which gives
// the game's single-frame UI cut while the character runs its own transition.
const StageLayout = () => {
  // Static hosting (GitHub Pages) serves each screen as a folder, so its URL may end in a slash: /skills/ is /skills.
  const pathname = useLocation().pathname.replace(/(.)\/$/, '$1');
  const previous = useRef(pathname);
  const from = previous.current;
  useEffect(() => {
    previous.current = pathname;
  }, [pathname]);
  // The saved loadout is applied after mount, so the server render and hydration both use the default one.
  useEffect(() => {
    void useLoadout.persist.rehydrate();
  }, []);

  const shot = SHOTS[pathname] ?? 'overview';

  return (
    <>
      <Stage>
        <Petals layer="back" />
        <CharacterOcclusion shot={shot} />
        <Character shot={shot} />
        <Petals layer="front" />
        <CharacterStats className="absolute left-[1880px] top-[80px] h-[700px] w-[490px]" />
        <Outlet context={{ from } satisfies StageContext} />
      </Stage>
      <RotateScreen />
    </>
  );
};

export default StageLayout;
