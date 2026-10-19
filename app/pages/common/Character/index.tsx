import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';

import { clipUrl, clipsVersion, preloadClips, subscribeClips } from './clips';
import { clipsOf, liveShots } from './plan';
import { LOOPS, MOVE_KEYS, SHOTS, type Shot, TRANSITIONS, framing, mobile } from './sources';
import './style.scss';

export type { Shot } from './sources';

const CANVAS_SCALE = 2510 / 1920;
// Cross-fades the transition's last frame into the loop: same position, but the clips differ in exposure (≈ 9 %) and ribbons.
const HANDOVER_MS = 250;
// How long a move that is not decoded yet is waited for before the screen cuts to the new loop instead.
const MOVE_WAIT_MS = 500;

// Landscape phones; tablets and computers are taller.
const SMALL = '(max-height: 540px)';

// Phones held upright only see RotateScreen (its media query, repeated here): no clip loads until they turn.
const UPRIGHT = '(orientation: portrait) and (max-width: 1024px)';

// The clips are given their sources on the client only, once the orientation is known: in the server render, a
// phone held upright downloaded all 16 MB of them behind the screen asking to turn it.
// Which set of clips to load: none yet, the phone variants or the full ones (decided once, when they are first wanted).
const useClipsWanted = () => {
  const [wanted, setWanted] = useState<'none' | 'small' | 'full'>('none');
  useEffect(() => {
    const upright = window.matchMedia(UPRIGHT);
    const update = () =>
      setWanted((was) =>
        was !== 'none' || upright.matches ? was : window.matchMedia(SMALL).matches ? 'small' : 'full'
      );
    update();
    upright.addEventListener('change', update);
    return () => upright.removeEventListener('change', update);
  }, []);
  return wanted;
};

const fileFor = (set: 'small' | 'full', name: string, full: string) =>
  set === 'small' ? mobile(name) : full;

const Character = ({ shot }: { shot: Shot }) => {
  const loops = useRef<Partial<Record<Shot, HTMLDivElement | null>>>({});
  const moves = useRef<Partial<Record<string, HTMLVideoElement | null>>>({});
  const shown = useRef<Shot | null>(null);
  const wanted = useClipsWanted();
  // The screen the move starts from, set during the render that changes screen (React's pattern for state derived
  // from a previous prop) and cleared once the move has ended: its clips, the move among them, stay loaded meanwhile.
  const [screens, setScreens] = useState<{ shot: Shot; from: Shot | null }>({ shot, from: null });
  if (screens.shot !== shot) setScreens({ shot, from: screens.shot });
  const needed = clipsOf(liveShots(shot, screens.from), MOVE_KEYS);
  useSyncExternalStore(subscribeClips, clipsVersion, () => 0);
  // A clip is given to its <video> once in memory, and only while the current screen may play it.
  const srcOf = (name: string, full: string, isNeeded: boolean) =>
    wanted !== 'none' && isNeeded ? clipUrl(fileFor(wanted, name, full)) : undefined;

  // Every clip is fetched once the set to load is known, the screen showing then first (a phone turned to landscape
  // may have changed screen while upright).
  useEffect(() => {
    if (wanted === 'none') return;
    const current = shown.current ? [shown.current] : [];
    const now = [...clipsOf(new Set(current), MOVE_KEYS).loops].map((s) => fileFor(wanted, s, LOOPS[s]));
    const loops = SHOTS.map((s) => fileFor(wanted, s, LOOPS[s]));
    const moves = Object.entries(TRANSITIONS).map(([key, src]) => fileFor(wanted, key, src));
    preloadClips([...now, ...loops, ...moves]);
  }, [wanted]);

  useLayoutEffect(() => {
    const settle = () => setScreens((s) => (s.shot === shot && s.from !== null ? { shot, from: null } : s));
    const show = (s: Shot | null, restart: boolean) => {
      for (const other of SHOTS) {
        const box = loops.current[other];
        const video = box?.querySelector('video');
        if (!box || !video) continue;
        box.style.visibility = other === s ? 'visible' : 'hidden';
        if (other !== s) video.pause();
        else {
          if (restart) video.currentTime = 0;
          void video.play().catch(() => {});
        }
      }
    };
    const hideMoves = () => {
      for (const video of Object.values(moves.current)) {
        if (!video) continue;
        video.pause();
        video.style.visibility = 'hidden';
      }
    };

    const previous = shown.current;
    shown.current = shot;
    const move = previous && previous !== shot ? moves.current[`${previous}-${shot}`] : null;
    const cut = () => {
      hideMoves();
      show(shot, previous !== null && previous !== shot);
      settle();
    };
    if (!move || !move.getAttribute('src') || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      cut();
      return;
    }

    // The move replaces the old loop as the panels swap; one not decoded yet is waited for a moment, the old loop
    // still showing, rather than dropped for a cut.
    let handover = 0;
    let waited = 0;
    const start = () => {
      window.clearTimeout(waited);
      hideMoves();
      show(null, false);
      move.currentTime = 0;
      move.style.visibility = 'visible';
      void move.play().catch(() => {});
    };
    if (move.readyState >= 2) start();
    else {
      move.addEventListener('loadeddata', start, { once: true });
      waited = window.setTimeout(() => {
        move.removeEventListener('loadeddata', start);
        cut();
      }, MOVE_WAIT_MS);
    }
    const onEnded = () => {
      show(shot, true);
      loops.current[shot]?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: HANDOVER_MS });
      handover = window.setTimeout(() => {
        hideMoves();
        settle();
      }, HANDOVER_MS);
    };
    move.addEventListener('ended', onEnded, { once: true });
    return () => {
      move.removeEventListener('loadeddata', start);
      move.removeEventListener('ended', onEnded);
      window.clearTimeout(handover);
      window.clearTimeout(waited);
    };
  }, [shot, wanted]);

  // A video keeps its decoder after losing its src attribute until it is reloaded empty; and Safari does not load a
  // video again when its src comes back (nor honour preload on iOS), so a clip given back its source is loaded here.
  useEffect(() => {
    const all = [
      ...Object.values(moves.current),
      ...SHOTS.map((s) => loops.current[s]?.querySelector('video'))
    ];
    for (const video of all) {
      if (!video) continue;
      const src = video.getAttribute('src');
      if (src ? video.currentSrc !== src || video.networkState === video.NETWORK_EMPTY : video.currentSrc)
        video.load();
    }
  });

  return (
    <>
      {Object.entries(TRANSITIONS).map(([key, src]) => (
        <video
          key={key}
          ref={(el) => {
            moves.current[key] = el;
          }}
          className="Character-move"
          style={{ transform: `scale(${CANVAS_SCALE})` }}
          src={srcOf(key, src, needed.moves.has(key))}
          muted
          playsInline
          preload="auto"
          aria-hidden
        />
      ))}
      {SHOTS.map((s) => {
        const f = framing[s];
        return (
          <div
            key={s}
            ref={(el) => {
              loops.current[s] = el;
            }}
            className="Character-loop"
            style={{
              width: f.width,
              height: f.height,
              transform: `translate(${f.x}px, ${f.y}px) scale(${f.scale})`,
              visibility: s === shot ? 'visible' : 'hidden'
            }}
            aria-hidden
          >
            <video
              autoPlay={s === shot}
              loop
              muted
              playsInline
              preload="auto"
              src={srcOf(s, LOOPS[s], needed.loops.has(s))}
            />
          </div>
        );
      })}
    </>
  );
};

export default Character;
