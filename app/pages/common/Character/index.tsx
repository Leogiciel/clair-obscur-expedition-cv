import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';

import experienceToOverview from '~/assets/character/experience-overview.mp4';
import experienceClip from '~/assets/character/experience.mp4';
import framing from '~/assets/character/framing.json';
import luminasToOverview from '~/assets/character/luminas-overview.mp4';
import luminasToPictos from '~/assets/character/luminas-pictos.mp4';
import luminasClip from '~/assets/character/luminas.mp4';
import overviewToExperience from '~/assets/character/overview-experience.mp4';
import overviewToLuminas from '~/assets/character/overview-luminas.mp4';
import overviewToPictos from '~/assets/character/overview-pictos.mp4';
import overviewToSkills from '~/assets/character/overview-skills.mp4';
import overviewClip from '~/assets/character/overview.mp4';
import pictosToLuminas from '~/assets/character/pictos-luminas.mp4';
import pictosToOverview from '~/assets/character/pictos-overview.mp4';
import pictosClip from '~/assets/character/pictos.mp4';
import skillsToOverview from '~/assets/character/skills-overview.mp4';
import skillsToSkilltree from '~/assets/character/skills-skilltree.mp4';
import skillsClip from '~/assets/character/skills.mp4';
import skilltreeToSkills from '~/assets/character/skilltree-skills.mp4';
import skilltreeClip from '~/assets/character/skilltree.mp4';

import { clipUrl, clipsVersion, preloadClips, subscribeClips } from './clips';
import { clipsOf } from './plan';
import './style.scss';

export type Shot = keyof typeof framing;

// framing.json places each loop on the stage (also read by scripts/character/canvas.py). Game framings: overview
// head ≈ 29 % of the stage height with the face at 48 %; weapon head ≈ 22 % with the face at 61 %, kept right of the
// experience card; pictos head ≈ 31 % in profile, nose at 58 %; skills (arms crossed, face kept in frame unlike the
// game) head ≈ 27 % with the face at 56 %, above the slots.
const LOOPS: Record<Shot, string> = {
  overview: overviewClip,
  experience: experienceClip,
  pictos: pictosClip,
  skills: skillsClip,
  luminas: luminasClip,
  skilltree: skilltreeClip
};

// Camera moves rendered on 16:9 canvases covering the stage width (2510 × 1412), ending on the next loop's first frame.
const TRANSITIONS: Partial<Record<`${Shot}-${Shot}`, string>> = {
  'overview-experience': overviewToExperience,
  'experience-overview': experienceToOverview,
  'overview-pictos': overviewToPictos,
  'pictos-overview': pictosToOverview,
  'overview-skills': overviewToSkills,
  'skills-overview': skillsToOverview,
  'overview-luminas': overviewToLuminas,
  'luminas-overview': luminasToOverview,
  'luminas-pictos': luminasToPictos,
  // The generated return turned through the back of the head: it is the outward move played backwards.
  'pictos-luminas': pictosToLuminas,
  'skills-skilltree': skillsToSkilltree,
  'skilltree-skills': skilltreeToSkills
};
const CANVAS_SCALE = 2510 / 1920;
// Cross-fades the transition's last frame into the loop: same position, but the clips differ in exposure (≈ 9 %) and ribbons.
const HANDOVER_MS = 250;
// How long a move that is not decoded yet is waited for before the screen cuts to the new loop instead.
const MOVE_WAIT_MS = 500;

const SHOTS = Object.keys(framing) as Shot[];
const MOVE_KEYS = Object.keys(TRANSITIONS);

// The phone variant of each clip (scripts/character/encode_mobile.py): 1280 px on the long side, half the decoder
// memory and a third of the download, for screens too small to show the full resolution.
const MOBILE = import.meta.glob<string>('../../../assets/character/mobile/*.mp4', {
  eager: true,
  query: '?url',
  import: 'default'
});
const mobile = (name: string) => MOBILE[`../../../assets/character/mobile/${name}.mp4`];
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
  // The screen whose clips stay loaded once the move into the current one has ended.
  const [settled, setSettled] = useState(shot);
  // The screen the move starts from, updated during the render that changes screen (React's pattern for state derived
  // from a previous prop): its clips, the move among them, stay loaded while it plays.
  const [screens, setScreens] = useState<{ shot: Shot; from: Shot | null }>({ shot, from: null });
  if (screens.shot !== shot) setScreens({ shot, from: screens.shot });
  const from = screens.shot !== shot ? screens.shot : screens.from;
  const needed = clipsOf(new Set([shot, settled, ...(from ? [from] : [])]), MOVE_KEYS);
  useSyncExternalStore(subscribeClips, clipsVersion, () => 0);
  // A clip is given to its <video> once in memory, and only while the current screen may play it.
  const srcOf = (name: string, full: string, isNeeded: boolean) =>
    wanted !== 'none' && isNeeded ? clipUrl(fileFor(wanted, name, full)) : undefined;

  // Every clip is fetched once the set to load is known, the current screen's first; running again on a screen change
  // fetches nothing new, as a clip is never fetched twice.
  useEffect(() => {
    if (wanted === 'none') return;
    const now = [...clipsOf(new Set([shot]), MOVE_KEYS).loops].map((s) => fileFor(wanted, s, LOOPS[s]));
    const loops = SHOTS.map((s) => fileFor(wanted, s, LOOPS[s]));
    const moves = Object.entries(TRANSITIONS).map(([key, src]) => fileFor(wanted, key, src as string));
    preloadClips([...now, ...loops, ...moves]);
  }, [wanted, shot]);

  useLayoutEffect(() => {
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
      setSettled(shot);
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
        setSettled(shot);
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
          src={srcOf(key, src as string, needed.moves.has(key))}
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
