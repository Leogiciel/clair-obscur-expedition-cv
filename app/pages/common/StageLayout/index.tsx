import {useEffect, useRef} from 'react';
import {Outlet, useLocation} from 'react-router';
import Stage from '../Stage';
import Character, {type Shot} from '../Character';
import PartyBar from '../PartyBar';
import CharacterStats from '../CharacterStats';

const SHOTS: Record<string, Shot> = {'/role': 'role', '/pictos': 'pictos', '/skills': 'skills'};

export interface StageContext {
  from: string;
}

// The character, party bar and stats column persist across screens; only the outlet is swapped, which gives
// the game's single-frame UI cut while the character runs its own transition.
const StageLayout = () => {
  const {pathname} = useLocation();
  const previous = useRef(pathname);
  const from = previous.current;
  useEffect(() => {
    previous.current = pathname;
  }, [pathname]);

  return (
    <Stage>
      <Character shot={SHOTS[pathname] ?? 'overview'}/>
      <PartyBar/>
      <CharacterStats className="absolute left-[1880px] top-[80px] h-[700px] w-[490px]"/>
      <Outlet context={{from} satisfies StageContext}/>
    </Stage>
  );
};

export default StageLayout;
