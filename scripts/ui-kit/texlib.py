"""Shared helpers to extract UI kit textures from 1x crops of the 2510x1380 game capture.
Content is erased, then alpha = L / plate_fill_L (unpremultiplied), so the texture over black
reproduces the game pixels. argv[1]: dir of frames t4.png, t15.png... (video at 4 s, 15 s...).
"""
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else None
OUT = Path(__file__).resolve().parents[2] / 'public/ui/tex'
OUT.mkdir(parents=True, exist_ok=True)
DEBUG = OUT.parent.parent.parent / 'design/tex-debug'
DEBUG.mkdir(parents=True, exist_ok=True)

frames = {}


def frame(name):
    if name not in frames:
        frames[name] = np.asarray(Image.open(SRC / f'{name}.png').convert('RGB')).astype(np.float32)
    return frames[name]


def diamond(shape, cx, cy, r):
    """r is the half-diagonal."""
    yy, xx = np.mgrid[:shape[0], :shape[1]]
    return (np.abs(xx - cx) + np.abs(yy - cy)) <= r


def rect(shape, x0, y0, x1, y1):
    m = np.zeros(shape[:2], bool)
    m[y0:y1, x0:x1] = True
    return m


def inpaint(img, mask, grain_from, desat=0.0, grow=2):
    """Inpaints the mask, then re-adds high-frequency grain sampled from a clean paint area."""
    m8 = cv2.dilate(mask.astype(np.uint8) * 255, np.ones((3, 3), np.uint8), iterations=grow)
    u8 = np.clip(img, 0, 255).astype(np.uint8)
    out = cv2.inpaint(u8, m8, 6, cv2.INPAINT_TELEA).astype(np.float32)
    # Horizontal blur kernel: brush fibres run horizontally.
    gx0, gy0, gx1, gy1 = grain_from
    patch = img[gy0:gy1, gx0:gx1]
    hf = patch - cv2.blur(patch, (15, 3))
    ph, pw = hf.shape[:2]
    reps = (img.shape[0] // ph + 2, img.shape[1] // pw + 2, 1)
    tile = np.tile(hf, reps)
    # Offset so the grain is not copied back onto its own source.
    tile = tile[ph // 2:ph // 2 + img.shape[0], pw // 3:pw // 3 + img.shape[1]]
    soft = cv2.GaussianBlur(m8.astype(np.float32) / 255, (5, 5), 0)[..., None]
    # Gold text tints the inpainting; desat pulls it back toward grey.
    grey = out.mean(2, keepdims=True)
    out = out + (grey - out) * desat * soft
    return out + tile * soft


def bright_text(img, region, thr):
    L = img.max(2)
    return region & (L > thr)


def save(img, name, fill_level):
    """Alpha against black (plate fill level = opaque), unpremultiplied colour."""
    L = img.max(2)
    a = np.clip(L / fill_level, 0, 1)
    a = np.where(L < 3, 0, a)
    rgb = np.where(a[..., None] > 0, img / np.maximum(a[..., None], 1e-3), 0)
    rgba = np.dstack([np.clip(rgb, 0, 255), a * 255]).astype(np.uint8)
    Image.fromarray(rgba, 'RGBA').save(OUT / f'{name}.webp', lossless=False, quality=92, method=6)
    Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).save(DEBUG / f'{name}.png')
    print(name, rgba.shape[1], 'x', rgba.shape[0])



# Origin of each design/ref/<name>.png within its source frame: (frame, x, y).
REFS = {
    'rows': ('t15', 160, 320),
    'weapon-rows': ('t4', 200, 310),
    'title-sort': ('t15', 120, 190),
    'stats-top': ('t4', 1880, 80),
    'card-weapon': ('t4', 790, 280),
    'diamond-card': ('t15', 1020, 730),
    'luminas': ('t15', 1850, 900),
    'portraits': ('t15', 110, 60),
    'keyhints': ('t15', 1700, 1290),
    'radar': ('t4', 1920, 480),
    'list-panel': ('t4', 120, 280),
    'empty': ('t15', 1020, 1020),
    'card-equipped': ('t4', 1870, 960),
}


def repaint_flat(img, region, mask, sigma=14, desat=0.5, seed=7):
    """Repaints `region` by normalized convolution of clean pixels (`mask` excluded), plus random fibres."""
    sh = img.shape
    L = img.max(2)
    region = region.astype(np.float32)
    shadow = region.astype(bool) & (np.abs(L - cv2.medianBlur(np.clip(L, 0, 255).astype(np.uint8), 31)) > 3)
    bad = cv2.dilate((mask | shadow).astype(np.uint8), np.ones((3, 3), np.uint8), iterations=3).astype(np.float32)
    valid = 1 - bad
    num = cv2.GaussianBlur(img * valid[..., None], (0, 0), sigma)
    den = cv2.GaussianBlur(valid, (0, 0), sigma)[..., None]
    fillc = num / np.maximum(den, 1e-3)
    fillc = fillc + (fillc.mean(2, keepdims=True) - fillc) * desat
    rng = np.random.default_rng(seed)
    fibres = cv2.GaussianBlur(rng.normal(0, 3.2, sh[:2]).astype(np.float32), (0, 0), sigmaX=6, sigmaY=0.7)[..., None]
    w = np.maximum(cv2.GaussianBlur(region, (0, 0), 3), cv2.GaussianBlur(bad * (1 - region), (0, 0), 1.2))[..., None]
    return img * (1 - w) + (fillc + fibres) * w


def check(name, ref, at, zones):
    """Mean luminance error (0-255) per zone of the texture composited at `at` over design/ref/<ref>.png."""
    root = OUT.parent.parent.parent
    r = np.asarray(Image.open(root / f'design/ref/{ref}.png').convert('RGB')).astype(np.float32)
    t = np.asarray(Image.open(OUT / f'{name}.webp').convert('RGBA')).astype(np.float32)
    canvas = np.zeros_like(r)
    x, y = at
    h, w = t.shape[:2]
    cx0, cy0 = max(x, 0), max(y, 0)
    cx1, cy1 = min(x + w, r.shape[1]), min(y + h, r.shape[0])
    sub = t[cy0 - y:cy1 - y, cx0 - x:cx1 - x]
    canvas[cy0:cy1, cx0:cx1] = sub[..., :3] * sub[..., 3:] / 255
    out = []
    for z in zones:
        x0, y0, x1, y1 = z
        d = np.abs(r[y0:y1, x0:x1].max(2) - canvas[y0:y1, x0:x1].max(2)).mean()
        out.append(round(float(d), 2))
    Image.fromarray(np.hstack([r, np.full((r.shape[0], 6, 3), [255, 0, 0], np.float32), canvas]).astype(np.uint8)).save(DEBUG / f'{name}__check.png')
    print(name, 'écart moyen par zone :', out)
    return out
