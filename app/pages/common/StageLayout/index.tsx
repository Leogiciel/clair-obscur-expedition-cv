import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router';

import Character from '../Character';
import CharacterOcclusion from '../CharacterOcclusion';
import CharacterStats from '../CharacterStats';
import Petals from '../Petals';
import RotateScreen from '../RotateScreen';
import Stage from '../Stage';
import useLoadout from '../store/useLoadout';
import { routeOf, shotOf } from './screen';

export interface StageContext {
  from: string;
}

// The character and stats column persist across screens; only the outlet is swapped, which gives
// the game's single-frame UI cut while the character runs its own transition.
const StageLayout = () => {
  const pathname = routeOf(useLocation().pathname);
  // The screen the visitor came from, updated during the render that changes screen (React's pattern for state
  // derived from a previous prop), so the new screen reads it on its first render.
  const [route, setRoute] = useState({ path: pathname, from: pathname });
  if (route.path !== pathname) setRoute({ path: pathname, from: route.path });
  const { from } = route;
  // The saved loadout is applied after mount, so the server render and hydration both use the default one.
  useEffect(() => {
    void useLoadout.persist.rehydrate();
  }, []);

  const shot = shotOf(pathname);

  return (
    <>
      <Stage
        backdrop={
          <>
            <Petals layer="back" />
            <CharacterOcclusion shot={shot} />
            <Character shot={shot} />
            <Petals layer="front" />
          </>
        }
      >
        <CharacterStats className="absolute left-[1880px] top-[80px] h-[700px] w-[490px]" />
        <Outlet context={{ from } satisfies StageContext} />
      </Stage>
      <RotateScreen />
    </>
  );
};

export default StageLayout;
