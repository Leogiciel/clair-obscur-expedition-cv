import {useLayoutEffect, useRef} from 'react';

export type Shot = 'overview' | 'role';

// The clip is 448 × 880 with the head between y 65 and 270 and the face centred on x 160.
// Game framings: overview head ≈ 29 % of the stage height with the face at 48 %; weapon head ≈ 22 % with the face at 61 %.
const FRAMING: Record<Shot, {x: number; y: number; scale: number}> = {
  overview: {x: 893, y: -3, scale: 1.95},
  role: {x: 1294, y: 83, scale: 1.48},
};

type Point = [number, number];

// Measured by optical flow on the capture, in stage px relative to the new framing: the cut lands on `from`,
// a whip at full speed decelerates to `peak` by `whip` s, then a glide settles by `settle` s
// (`skew` < 1 moves its fastest point earlier).
const ENTER: Record<Shot, {from: Point; peak: Point; whip: number; settle: number; skew: number}> = {
  role: {from: [-430, 170], peak: [310, 0], whip: 0.23, settle: 0.75, skew: 0.6},
  overview: {from: [520, -140], peak: [800, -120], whip: 0.09, settle: 0.6, skew: 0.8},
};

// 180° shutter at 60 fps.
const SHUTTER = 1 / 120;

const smoothstep = (u: number) => u * u * (3 - 2 * u);

const offsetAt = (e: (typeof ENTER)[Shot], t: number): Point => {
  const [fx, fy] = e.from;
  const [px, py] = e.peak;
  if (t < e.whip) {
    // Before the cut the whip keeps its initial speed, so the first frame is already blurred.
    const k = t < 0 ? (3 * t) / e.whip : 1 - (1 - t / e.whip) ** 3;
    return [fx + (px - fx) * k, fy + (py - fy) * k];
  }
  const g = 1 - smoothstep(Math.min(1, (t - e.whip) / (e.settle - e.whip)) ** e.skew);
  return [px * g, py * g];
};

const Character = ({shot}: {shot: Shot}) => {
  const ref = useRef<HTMLDivElement>(null);
  const blurRef = useRef<SVGFEGaussianBlurElement>(null);
  const shown = useRef<Shot | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    const blur = blurRef.current;
    if (!el || !blur) return;
    const f = FRAMING[shot];
    const place = ([x, y]: Point) => {
      el.style.transform = `translate(${f.x + x}px, ${f.y + y}px) scale(${f.scale})`;
    };
    const smear = (bx: number, by: number) => {
      // Filters run in the element's own space, before the framing scale.
      const sx = (0.4 * bx) / f.scale;
      const sy = (0.4 * by) / f.scale;
      blur.setAttribute('stdDeviation', `${sx.toFixed(2)} ${sy.toFixed(2)}`);
      el.style.filter = sx + sy > 0.3 ? 'url(#character-motion)' : '';
    };

    const previous = shown.current;
    shown.current = shot;
    if (previous === null || previous === shot || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      place([0, 0]);
      smear(0, 0);
      return;
    }

    const e = ENTER[shot];
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = (now - start) / 1000;
      if (t >= e.settle) {
        place([0, 0]);
        smear(0, 0);
        return;
      }
      const a = offsetAt(e, t - SHUTTER / 2);
      const b = offsetAt(e, t + SHUTTER / 2);
      place(offsetAt(e, t));
      smear(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]));
      frame = requestAnimationFrame(tick);
    };
    // The first frame is placed before paint so the cut never shows the resting framing.
    tick(start);
    return () => cancelAnimationFrame(frame);
  }, [shot]);

  const f = FRAMING[shot];
  return (
    <>
      <svg className="absolute size-0" aria-hidden>
        <filter id="character-motion" x="-25%" y="-10%" width="150%" height="120%" colorInterpolationFilters="sRGB">
          <feGaussianBlur ref={blurRef} stdDeviation="0 0" edgeMode="none"/>
        </filter>
      </svg>
      <div ref={ref} className="Screen-character" style={{transform: `translate(${f.x}px, ${f.y}px) scale(${f.scale})`}} aria-hidden>
        <video autoPlay loop muted playsInline>
          <source src="/background-video.mp4" type="video/mp4"/>
        </video>
      </div>
    </>
  );
};

export default Character;
