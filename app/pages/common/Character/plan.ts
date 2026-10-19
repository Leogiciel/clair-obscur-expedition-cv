// iOS keeps a decoder per loaded clip and kills the tab past its memory cap ("A problem repeatedly occurred"): only the
// clips a screen can play next stay loaded, its loop, the moves out of it ("<from>-<to>") and the loops they land on;
// the others are unloaded. While a move plays, the screen it leaves keeps its clips too.
export const clipsOf = <Shot extends string>(shots: Set<Shot>, moveKeys: string[]) => {
  const moves = moveKeys.filter((key) => shots.has(key.split('-')[0] as Shot));
  return {
    moves: new Set(moves),
    loops: new Set<Shot>([...shots, ...moves.map((key) => key.split('-')[1] as Shot)])
  };
};

// The screens whose clips stay loaded: the current one, and while a move into it plays (until `settled` catches up),
// the screen it left; after a quick second navigation, the one before too. Once settled, only the current screen.
export const liveShots = <Shot extends string>(
  shot: Shot,
  settled: Shot,
  screens: { shot: Shot; from: Shot | null }
): Set<Shot> => {
  if (settled === shot && screens.shot === shot) return new Set([shot]);
  const from = screens.shot !== shot ? screens.shot : screens.from;
  return new Set([shot, settled, ...(from ? [from] : [])]);
};
