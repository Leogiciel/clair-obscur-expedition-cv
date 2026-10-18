// Generates the seamless grunge wear mask for the UI kit.
// Usage: node scripts/ui-kit/masks.mjs  ->  public/ui/grunge.webp
import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const OUT = new URL('../../public/ui/', import.meta.url);
await mkdir(OUT, { recursive: true });

function rng(seed) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function noise2(seed, period = 0) {
  const rand = rng(seed);
  const SIZE = 512;
  const grid = Float32Array.from({ length: SIZE * SIZE }, rand);
  const wrap = (v) => ((v % SIZE) + SIZE) % SIZE;
  const fade = (t) => t * t * (3 - 2 * t);
  return (x, y) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const p = period || SIZE;
    const x0 = wrap(xi % p),
      x1 = wrap((xi + 1) % p);
    const y0 = wrap(yi % p),
      y1 = wrap((yi + 1) % p);
    const u = fade(x - xi);
    const v = fade(y - yi);
    const a = grid[y0 * SIZE + x0],
      b = grid[y0 * SIZE + x1];
    const c = grid[y1 * SIZE + x0],
      d = grid[y1 * SIZE + x1];
    return (a + (b - a) * u) * (1 - v) + (c + (d - c) * u) * v;
  };
}

function fbm(n, x, y, octaves, period = 0) {
  let sum = 0,
    amp = 0.5,
    f = 1,
    norm = 0;
  for (let o = 0; o < octaves; o++) {
    sum += amp * n(x * f, y * f, period * f);
    norm += amp;
    amp *= 0.5;
    f *= 2;
  }
  return sum / norm;
}

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (e0, e1, v) => {
  const t = clamp01((v - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};

function grunge(seed = 7, S = 512) {
  const n = noise2(seed);
  const data = new Uint8Array(S * S * 2);
  const P = 16; // noise period in cells, makes the tile seamless
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const v = fbm(n, (x / S) * P, (y / S) * P, 5, P);
      const i = (y * S + x) * 2;
      data[i] = 255;
      data[i + 1] = Math.round(smooth(0.32, 0.5, v) * 255);
    }
  }
  return { data, W: S, H: S };
}

async function save({ data, W, H }, name, alphaQuality = 75) {
  await sharp(Buffer.from(data), { raw: { width: W, height: H, channels: 2 } })
    .webp({ quality: 80, alphaQuality, effort: 6 })
    .toFile(new URL(name, OUT).pathname);
}

// Lower alpha quality is invisible on a blurry mask.
await save(grunge(), 'grunge.webp', 45);
console.log('grunge → public/ui/');
