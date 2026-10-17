"""Extracts the stats column damask backdrop: 25th percentile over ~90 video frames removes the moving character;
the static UI is detected by brightness and filled from clean patches.
Usage: python3 -I scripts/ui-kit/extract/stats-backdrop.py  ->  public/ui/tex/stats-backdrop.webp
"""
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from texlib import *  # noqa: E402,F403

ROOT = Path(__file__).resolve().parents[3]
VIDEO = ROOT / 'design/clair_obscure_expedition_33_interface.mov'
# Video crop in capture px.
X0, Y0, W, H = 1860, 60, 580, 840
FPS, COUNT = 2, 92
# Radar chart centre and radius in crop px.
RADAR = (265, 575, 105)


def frames():
    raw = subprocess.run(
        ['ffmpeg', '-nostdin', '-v', 'error', '-i', str(VIDEO), '-vf', f'fps={FPS},crop={W}:{H}:{X0}:{Y0}',
         '-frames:v', str(COUNT), '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
        check=True, capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3).astype(np.float32)


stack = frames()
img = np.percentile(stack, 25, axis=0)
L = img.max(2)

# The embroidery under the name is as bright as the letters, so glyphs are only searched inside these boxes.
TEXT_BOXES = [
    (115, 25, 415, 98),    # name
    (20, 105, 85, 190),    # Level + digit
    (90, 115, 485, 172),   # XP value and bar
    (35, 172, 485, 230),   # second value and bar
    (30, 238, 275, 275),   # Combat Stats
    (30, 276, 495, 388),   # stats grid
    (30, 400, 225, 440),   # Attributes
    (222, 405, 350, 478),  # Vitality
    (90, 512, 165, 583),   # Luck
    (340, 510, 445, 583),  # Might
    (130, 655, 230, 723),  # Defense
    (300, 650, 425, 723),  # Agility
]
yy, xx = np.mgrid[:H, :W]
ui = np.zeros((H, W), bool)
for x0, y0, x1, y1 in TEXT_BOXES:
    ui[y0:y1, x0:x1] |= L[y0:y1, x0:x1] > 45
# UI rules are axis-aligned while the damask lattice is diagonal: a long-segment opening isolates them.
# Subtract what also survives a square opening (bright flats, dense embroidery).
lit = (L > 18).astype(np.uint8)
blobs = cv2.morphologyEx(lit, cv2.MORPH_OPEN, np.ones((7, 7), np.uint8)).astype(bool)
lines = cv2.morphologyEx(lit, cv2.MORPH_OPEN, np.ones((31, 1), np.uint8)).astype(bool)
lines |= cv2.morphologyEx(lit, cv2.MORPH_OPEN, np.ones((1, 41), np.uint8)).astype(bool)
ui |= lines & ~blobs
disc = (xx - RADAR[0]) ** 2 + (yy - RADAR[1]) ** 2 < RADAR[2] ** 2
local = cv2.medianBlur(np.clip(L, 0, 255).astype(np.uint8), 15).astype(np.float32)
ui |= disc & (L > local + 6)
ui = cv2.dilate(ui.astype(np.uint8), np.ones((3, 3), np.uint8), iterations=3)


def patch_fill(img, mask, forbid, cell=14, ring=5, search=110, step=2):
    """Patch-based fill (see main-right.py); filled cells become sources, `forbid` areas never do."""
    out = img.copy()
    hole = mask.astype(bool).copy()
    filled = np.zeros_like(hole)
    S = cell + 2 * ring
    for cy in range(0, H, cell):
        for cx in range(0, W, cell):
            c = hole[cy:cy + cell, cx:cx + cell]
            if not c.any():
                continue
            by0, bx0 = cy - ring, cx - ring
            if by0 < 0 or bx0 < 0 or by0 + S > H or bx0 + S > W:
                continue
            box_hole = hole[by0:by0 + S, bx0:bx0 + S]
            known = ~box_hole
            if known.sum() < S * 2:
                continue
            target = out[by0:by0 + S, bx0:bx0 + S]
            best, best_d = None, np.inf
            for dy in range(-search, search + 1, step):
                sy = by0 + dy
                if sy < 0 or sy + S > H:
                    continue
                for dx in range(-search, search + 1, step):
                    sx = bx0 + dx
                    if sx < 0 or sx + S > W or (abs(dx) < S and abs(dy) < S):
                        continue
                    if hole[sy:sy + S, sx:sx + S].any() or forbid[sy:sy + S, sx:sx + S].any():
                        continue
                    d = ((out[sy:sy + S, sx:sx + S][known] - target[known]) ** 2).mean()
                    if d < best_d:
                        best, best_d = (sy, sx), d
            if best is None:
                continue
            src = out[best[0]:best[0] + S, best[1]:best[1] + S]
            m = box_hole[..., None]
            out[by0:by0 + S, bx0:bx0 + S] = np.where(m, src, target)
            filled[by0:by0 + S, bx0:bx0 + S] |= box_hole
            hole[by0:by0 + S, bx0:bx0 + S] = False
    return out, filled


# Never copy from the bevelled frame corner (diagonals). Leftovers are inpainted.
corner = np.zeros((H, W), bool)
corner[0:110, 410:W] = True
patched, done = patch_fill(img, ui, corner)
rest = ui.astype(bool) & ~done
img = cv2.inpaint(np.clip(patched, 0, 255).astype(np.uint8), rest.astype(np.uint8) * 255, 5, cv2.INPAINT_TELEA).astype(np.float32)
# Inpainted leftovers are desaturated: gold letters tint them.
seam = cv2.GaussianBlur(img, (0, 0), 0.8)
w = cv2.GaussianBlur(ui.astype(np.float32), (0, 0), 1.5)[..., None] * 0.5
img = img * (1 - w) + seam * w
g = cv2.GaussianBlur(rest.astype(np.float32), (0, 0), 2)[..., None]
img = img + (img.mean(2, keepdims=True) - img) * g

save(img, 'stats-backdrop', 28)
Image.fromarray(np.clip(img * 7, 0, 255).astype(np.uint8)).save(DEBUG / 'stats-backdrop__x7.png')
