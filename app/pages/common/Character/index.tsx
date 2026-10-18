import { useEffect, useLayoutEffect, useRef, useState } from 'react';

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

const SHOTS = Object.keys(framing) as Shot[];

// Phones held upright only see RotateScreen (its media query, repeated here): no clip loads until they turn.
const UPRIGHT = '(orientation: portrait) and (max-width: 1024px)';

// The clips are given their sources on the client only, once the orientation is known: in the server render, a
// phone held upright downloaded all 16 MB of them behind the screen asking to turn it.
const useClipsWanted = () => {
  const [wanted, setWanted] = useState(false);
  useEffect(() => {
    const upright = window.matchMedia(UPRIGHT);
    const update = () => setWanted((was) => was || !upright.matches);
    update();
    upright.addEventListener('change', update);
    return () => upright.removeEventListener('change', update);
  }, []);
  return wanted;
};

const Character = ({ shot }: { shot: Shot }) => {
  const loops = useRef<Partial<Record<Shot, HTMLDivElement | null>>>({});
  const moves = useRef<Partial<Record<string, HTMLVideoElement | null>>>({});
  const shown = useRef<Shot | null>(null);
  const wanted = useClipsWanted();

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
    if (!move || move.readyState < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      hideMoves();
      show(shot, previous !== null && previous !== shot);
      return;
    }

    // The cut: the move replaces the old loop in the same frame as the panels swap.
    hideMoves();
    show(null, false);
    move.currentTime = 0;
    move.style.visibility = 'visible';
    void move.play().catch(() => {});
    let handover = 0;
    const onEnded = () => {
      show(shot, true);
      loops.current[shot]?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: HANDOVER_MS });
      handover = window.setTimeout(hideMoves, HANDOVER_MS);
    };
    move.addEventListener('ended', onEnded, { once: true });
    return () => {
      move.removeEventListener('ended', onEnded);
      window.clearTimeout(handover);
    };
  }, [shot, wanted]);

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
          src={wanted ? src : undefined}
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
              src={wanted ? LOOPS[s] : undefined}
            />
          </div>
        );
      })}
    </>
  );
};

export default Character;
