"""Renders a screen's character exactly as the page shows it (framing.json, Character's edge masks and lift to the
stage background), on a 16:9 canvas covering the stage width: the transition clips start and end on these.
Usage: python3 -I scripts/character/canvas.py [shot ...]  ->  design/character/canvas/<shot>.jpg
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
FRAMING = json.loads((ROOT / 'app/assets/character/framing.json').read_text())
STILLS = ROOT / 'design/character/final'
OUT = ROOT / 'design/character/canvas'
STAGE_W = 2510
# 1920 × 1080 over the stage width covers 2510 × 1412: the stage plus 32 px below it.
CANVAS = (1920, 1080)
STAGE_H = round(STAGE_W * CANVAS[1] / CANVAS[0])
STAGE_BG = 7


def ramp(n, stops):
    """1-D CSS linear-gradient alpha from (position, alpha) stops in 0-1."""
    pos = (np.arange(n) + 0.5) / n
    xs, ys = zip(*stops)
    return np.interp(pos, xs, ys)


def render(shot):
    f = FRAMING[shot]
    w, h = round(f['width'] * f['scale']), round(f['height'] * f['scale'])
    still = np.asarray(Image.open(STILLS / f'{shot}.png').convert('RGB').resize((w, h), Image.LANCZOS)).astype(np.float32)
    # Same as .Screen-character in app/pages/common/style.scss.
    mask = (ramp(h, [(0, 0), (0.06, 1), (0.78, 1), (1, 0)])[:, None]
            * ramp(w, [(0, 0), (0.14, 1), (0.84, 1), (1, 0)])[None, :])[..., None]
    box = np.maximum(still, STAGE_BG)
    stage = np.full((STAGE_H, STAGE_W, 3), STAGE_BG, np.float32)
    x0, y0 = round(f['x']), round(f['y'])
    sx0, sy0 = max(0, -x0), max(0, -y0)
    dx0, dy0 = max(0, x0), max(0, y0)
    dx1, dy1 = min(STAGE_W, x0 + w), min(STAGE_H, y0 + h)
    region = (slice(dy0, dy1), slice(dx0, dx1))
    src = (slice(sy0, sy0 + dy1 - dy0), slice(sx0, sx0 + dx1 - dx0))
    stage[region] = stage[region] * (1 - mask[src]) + box[src] * mask[src]
    OUT.mkdir(parents=True, exist_ok=True)
    dest = OUT / f'{shot}.jpg'
    Image.fromarray(np.clip(stage, 0, 255).astype(np.uint8)).resize(CANVAS, Image.LANCZOS).save(dest, quality=95)
    return dest


if __name__ == '__main__':
    for shot in sys.argv[1:] or list(FRAMING):
        print(render(shot))
