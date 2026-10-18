import {useEffect, useRef} from 'react';
import {Outlet, useLocation} from 'react-router';
import Stage from '../Stage';
import Character, {type Shot} from '../Character';
import CharacterStats from '../CharacterStats';
import useLoadout from '../store/useLoadout';

const SHOTS: Record<string, Shot> = {'/experience': 'experience', '/pictos': 'pictos', '/skills': 'skills', '/luminas': 'luminas'};

export interface StageContext {
  from: string;
}

// The character and stats column persist across screens; only the outlet is swapped, which gives
// the game's single-frame UI cut while the character runs its own transition.
const StageLayout = () => {
  const {pathname} = useLocation();
  const previous = useRef(pathname);
  const from = previous.current;
  useEffect(() => {
    previous.current = pathname;
  }, [pathname]);
  // The saved loadout is applied after mount, so the server render and hydration both use the default one.
  useEffect(() => {
    void useLoadout.persist.rehydrate();
  }, []);

  return (
    <Stage>
      <Character shot={SHOTS[pathname] ?? 'overview'}/>
      <CharacterStats className="absolute left-[1880px] top-[80px] h-[700px] w-[490px]"/>
      <Outlet context={{from} satisfies StageContext}/>
    </Stage>
  );
};

export default StageLayout;
