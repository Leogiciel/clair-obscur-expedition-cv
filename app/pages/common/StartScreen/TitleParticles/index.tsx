import { useEffect, useRef } from 'react';

import { STAGE_H, STAGE_W } from '../../Stage';

// The title screen's petals, drawn on one canvas: hundreds of DOM petals with a CSS blur each dropped the screen to
// ≈ 20 fps. As in the game (design/ref/loading), glowing crimson flakes gather in a band on the left and white specks
// on the right, the centre behind the logo staying sparse; most are a little out of focus, some near ones larger and
// very blurred. Each flake is an irregular shard filled with a glowing gradient (lit up, a petal photo's dark edge read
// as an outline), stretched along its fall when out of focus. Sprites are baked once per tint, shape and depth.
const COUNT = 260;
const SHAPES = 8;
// Depths, nearest last: blur (px), size range (px), opacity, share of the flakes.
const DEPTHS = [
  { blur: 1.5, size: [14, 26], alpha: 0.7, share: 0.35 },
  { blur: 3, size: [26, 46], alpha: 0.65, share: 0.35 },
  { blur: 5, size: [40, 66], alpha: 0.5, share: 0.2 },
  { blur: 9, size: [70, 110], alpha: 0.3, share: 0.1 }
] as const;
// Core to edge, as the lit flakes read on the title screen.
const TINTS = {
  red: ['#ffc2cc', '#d23c55', 'rgb(110 15 25 / 0)'],
  white: ['#ffffff', '#f2f1ee', 'rgb(220 218 214 / 0.4)']
} as const;
// Sprite canvases are drawn at this size; the flake fills its middle, the rest is room for the blur.
const SPRITE_PX = 64;
const FILL = 0.5;
// The canvas renders at this share of the stage and is scaled up: the flakes are soft anyway, and a full-size canvas
// redrawn every frame cost a third of the frame rate.
const RESOLUTION = 0.5;

type Tint = keyof typeof TINTS;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  spin: number;
  size: number;
  depth: number;
  tint: Tint;
  shape: number;
  sway: number;
  phase: number;
}

const between = (a: number, b: number) => a + Math.random() * (b - a);

// A tight crimson band on the left, white specks across the right, a few strays in between.
const column = () => {
  const r = Math.random();
  return r < 0.38 ? between(-40, 520) : r < 0.95 ? between(1450, STAGE_W + 60) : between(520, 1450);
};

const pickDepth = () => {
  let r = Math.random();
  for (let i = 0; i < DEPTHS.length; i++) {
    r -= DEPTHS[i].share;
    if (r <= 0) return i;
  }
  return DEPTHS.length - 1;
};

const spawn = (y?: number): Particle => {
  const depth = pickDepth();
  const [min, max] = DEPTHS[depth].size;
  const x = column();
  // Nearer flakes fall faster, as parallax would have it.
  const speed = 60 + depth * 28;
  return {
    x,
    y: y ?? -60,
    vx: between(5, 25),
    vy: between(speed * 0.7, speed * 1.2),
    angle: between(0, Math.PI * 2),
    spin: between(-1.2, 1.2),
    size: between(min, max),
    depth,
    tint: x > STAGE_W / 2 ? 'white' : 'red',
    shape: Math.floor(Math.random() * SHAPES),
    sway: between(15, 45),
    phase: between(0, Math.PI * 2)
  };
};

// An irregular shard: a few points around a centre at random radii, so no two flakes share an outline.
const shard = (ctx: CanvasRenderingContext2D, r: number) => {
  const points = 4 + Math.floor(Math.random() * 3);
  ctx.beginPath();
  for (let i = 0; i < points; i++) {
    const a = (i / points) * Math.PI * 2 + between(-0.35, 0.35);
    const d = r * between(0.45, 1);
    ctx[i ? 'lineTo' : 'moveTo'](Math.cos(a) * d, Math.sin(a) * d * between(0.45, 0.8));
  }
  ctx.closePath();
};

// One canvas per tint, shape and depth: an irregular shard filled with a glow, then blurred for its depth.
const bake = () => {
  const out: Record<string, HTMLCanvasElement> = {};
  const r = (SPRITE_PX * FILL) / 2;
  for (const tint of Object.keys(TINTS) as Tint[]) {
    for (let shape = 0; shape < SHAPES; shape++) {
      const flat = document.createElement('canvas');
      flat.width = flat.height = SPRITE_PX;
      const f = flat.getContext('2d');
      if (!f) continue;
      f.translate(SPRITE_PX / 2, SPRITE_PX / 2);
      const glow = f.createRadialGradient(0, 0, 0, 0, 0, r);
      const [core, mid, edge] = TINTS[tint];
      glow.addColorStop(0, core);
      glow.addColorStop(0.55, mid);
      glow.addColorStop(1, edge);
      f.fillStyle = glow;
      shard(f, r);
      f.fill();
      DEPTHS.forEach(({ blur }, depth) => {
        const c = document.createElement('canvas');
        c.width = c.height = SPRITE_PX;
        const ctx = c.getContext('2d');
        if (!ctx) return;
        ctx.filter = `blur(${blur * (SPRITE_PX / 40)}px)`;
        ctx.drawImage(flat, 0, 0);
        out[`${tint}-${shape}-${depth}`] = c;
      });
    }
  }
  return out;
};

const TitleParticles = () => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (!ctx || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    const sprites = bake();
    // The screen opens already full of flakes.
    const particles = Array.from({ length: COUNT }, () => spawn(between(-60, STAGE_H)));
    let last = performance.now();
    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      ctx.setTransform(RESOLUTION, 0, 0, RESOLUTION, 0, 0);
      ctx.clearRect(0, 0, STAGE_W, STAGE_H);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.angle += p.spin * dt;
        if (p.y > STAGE_H + 60) particles[i] = spawn();
        const sprite = sprites[`${p.tint}-${p.shape}-${p.depth}`];
        // The crimson flakes read larger than the white specks on the title screen.
        const s = (p.size / FILL) * (p.tint === 'red' ? 1.35 : 1);
        // The flake turns over as it falls: its width breathes with the sway.
        const flip = 0.45 + 0.55 * Math.abs(Math.cos(now / 900 + p.phase));
        ctx.save();
        // Measured on the game: the white side reads dimmer than a full-strength layer, the crimson one a little brighter.
        ctx.globalAlpha = Math.min(1, DEPTHS[p.depth].alpha * (p.tint === 'white' ? 0.6 : 1.2));
        ctx.translate(p.x + Math.sin(now / 1400 + p.phase) * p.sway, p.y);
        ctx.rotate(p.angle);
        // Out-of-focus flakes smear along their fall.
        ctx.scale(flip, 1 + DEPTHS[p.depth].blur * 0.12);
        ctx.drawImage(sprite, -s / 2, -s / 2, s, s);
        ctx.restore();
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <canvas
      ref={ref}
      className="TitleParticles"
      width={STAGE_W * RESOLUTION}
      height={STAGE_H * RESOLUTION}
      aria-hidden
    />
  );
};

export default TitleParticles;
