import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { publicUrl } from '~/publicUrl';

import './style.scss';

type Layer = 'back' | 'front';

interface Petal {
  id: number;
  x: number;
  size: number;
  tint: number;
  path: Keyframe[];
  duration: number;
  flutter: number;
  phase: number;
}

// Rose petals drifting down over every screen, a subtler take on the red petals of the game's skill tree
// (design/skill-tree-screen.png), photographed petals (scripts/character/petals.py). The back layer is drawn under the
// character and his silhouette (CharacterOcclusion), so petals pass behind him; the front layer
// passes over him, larger and casting a shadow. Petals are spawned at random times with random paths, so nothing
// repeats; they only exist on the client.
const LAYERS: Record<
  Layer,
  { size: [number, number]; fall: [number, number]; drift: [number, number]; wait: [number, number] }
> = {
  back: { size: [18, 28], fall: [12, 19], drift: [250, 700], wait: [2.5, 9] },
  front: { size: [40, 58], fall: [8, 13], drift: [400, 900], wait: [8, 22] }
};
const HEIGHT = 1540;
// Dense samples of smooth functions: linear interpolation between them reads as continuous motion.
const SAMPLES = 90;

const between = ([a, b]: [number, number]) => a + Math.random() * (b - a);
const smooth = (t: number) => t * t * (3 - 2 * t);

// A slanted fall bent by the wind: the prevailing drift, two slow swings of random period and phase, and in most
// falls one gust that eases in and out; the spin follows the swings so the petal turns into its motion.
const makePetal = (id: number, layer: Layer): Petal => {
  const c = LAYERS[layer];
  const drift = between(c.drift) * (Math.random() < 0.8 ? 1 : -0.6);
  const swings = [0, 1].map(() => ({
    amp: between([40, 130]),
    freq: between([0.6, 2.2]),
    phase: between([0, Math.PI * 2])
  }));
  const gust =
    Math.random() < 0.6
      ? { at: between([0.2, 0.7]), width: between([0.12, 0.25]), push: drift * between([0.3, 0.7]) }
      : null;
  const spin = { start: between([-40, 40]), turns: between([-160, 160]) };
  const lateral = (t: number) => {
    let x = drift * t;
    for (const s of swings) x += s.amp * Math.sin(Math.PI * 2 * s.freq * t + s.phase);
    if (gust) x += gust.push * smooth(Math.min(1, Math.max(0, (t - gust.at) / gust.width)));
    return x;
  };
  const path: Keyframe[] = Array.from({ length: SAMPLES + 1 }, (_, i) => {
    const t = i / SAMPLES;
    const slope = lateral(Math.min(1, t + 0.01)) - lateral(Math.max(0, t - 0.01));
    const angle = spin.start + spin.turns * t + Math.max(-35, Math.min(35, slope * 0.6));
    return {
      transform: `translate(${lateral(t).toFixed(1)}px, ${(HEIGHT * t).toFixed(1)}px) rotate(${angle.toFixed(1)}deg)`
    };
  });
  return {
    id,
    x: between([-300, 2400]) - drift / 2,
    size: between(c.size),
    tint: Math.floor(Math.random() * 3),
    path,
    duration: between(c.fall),
    flutter: between([2.2, 4.5]),
    phase: Math.random()
  };
};

const Fall = ({ petal, layer, onDone }: { petal: Petal; layer: Layer; onDone: () => void }) => {
  const ref = useRef<HTMLSpanElement>(null);
  // The parent re-renders as petals come and go: the latest callback is read at the end, so the path never restarts.
  const done = useRef(onDone);
  useLayoutEffect(() => {
    done.current = onDone;
  });
  useEffect(() => {
    const animation = ref.current?.animate(petal.path, {
      duration: petal.duration * 1000,
      easing: 'linear',
      fill: 'forwards'
    });
    animation?.addEventListener('finish', () => done.current());
    return () => animation?.cancel();
  }, [petal]);
  return (
    <span ref={ref} className="Petals-fall" style={{ left: petal.x }}>
      <span
        className="Petals-sway"
        style={{ animationDuration: `${petal.flutter}s`, animationDelay: `${-petal.phase * petal.flutter}s` }}
      >
        <img
          src={publicUrl(`ui/petals/petal-${petal.tint}-${layer}.webp`)}
          alt=""
          width={petal.size}
          height={petal.size}
          className="Petals-petal"
        />
      </span>
    </span>
  );
};

const Petals = ({ layer }: { layer: Layer }) => {
  const [petals, setPetals] = useState<Petal[]>([]);
  const next = useRef(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let timer = 0;
    const spawn = () => {
      // Now and then two petals come together, as a gust tears them off.
      const count = Math.random() < 0.2 ? 2 : 1;
      setPetals((list) => [
        ...list,
        ...Array.from({ length: count }, () => makePetal(next.current++, layer))
      ]);
      timer = window.setTimeout(spawn, between(LAYERS[layer].wait) * 1000);
    };
    timer = window.setTimeout(spawn, between([0.5, LAYERS[layer].wait[1]]) * 1000);
    return () => window.clearTimeout(timer);
  }, [layer]);

  return (
    <div className={`Petals Petals--${layer}`} aria-hidden>
      {petals.map((p) => (
        <Fall
          key={p.id}
          petal={p}
          layer={layer}
          onDone={() => setPetals((list) => list.filter((q) => q.id !== p.id))}
        />
      ))}
    </div>
  );
};

export default Petals;
