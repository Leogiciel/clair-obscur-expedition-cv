"""Extracts the section title rule and sort button textures for 3-slice use. Coordinates are t15 px.
Usage: python3 -I scripts/ui-kit/extract/title-sort.py <frames_dir>
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from texlib import *  # noqa: E402,F403

RX, RY = REFS['title-sort'][1:]


RULE = (4, 193, 768, 293)


def rule():
    x0, y0, x1, y1 = RULE
    img = frame('t15')[y0:y1, x0:x1].copy()
    sh = img.shape
    # Keep only the rule (y 268-279) and the tick (x 130-150).
    keep = rect(sh, 0, 266 - y0, sh[1], 281 - y0) | rect(sh, 128 - x0, 0, 152 - x0, sh[0])
    keep = cv2.GaussianBlur(keep.astype(np.float32), (3, 3), 0)[..., None]
    img = img * keep
    save(img, 'title-sort-rule', 140)


SLAB = (440, 200, 836, 266)
KEY = (508, 232, 25)       # key ring centre and outer radius
LABEL = (622, 215, 708, 244)


def slab():
    x0, y0, x1, y1 = SLAB
    img = frame('t15')[y0:y1, x0:x1].copy()
    sh = img.shape
    # Stray portrait fleck in the top-left corner.
    stray = rect(sh, 0, 0, 470 - x0, 206 - y0)
    img[stray] = 0
    kx, ky, kr = KEY[0] - x0, KEY[1] - y0, KEY[2]
    yy, xx = np.mgrid[:sh[0], :sh[1]]
    disc = (xx - kx) ** 2 + (yy - ky) ** 2 <= kr ** 2
    lx0, ly0, lx1, ly1 = LABEL
    text = bright_text(img, rect(sh, lx0 - x0, ly0 - y0, lx1 - x0, ly1 - y0), 32)
    text = cv2.dilate(text.astype(np.uint8), np.ones((3, 3), np.uint8), iterations=2).astype(bool)
    grain = (730 - x0, 220 - y0, 790 - x0, 244 - y0)
    img = inpaint(img, text, grain, desat=0.6, grow=2)
    # Own 2 px fade: repaint_flat's wider fade left a ghost circle.
    dist = np.sqrt((xx - kx) ** 2 + (yy - ky) ** 2)
    filled = repaint_flat(img, dist <= kr + 8, disc, sigma=14, desat=0.5)
    w = np.clip((kr + 2 - dist) / 2, 0, 1)[..., None]
    img = img * (1 - w) + filled * w
    save(img, 'title-sort-slab', 40)


rule()
slab()

# Zones in title-sort.png px.
check('title-sort-rule', 'title-sort', (RULE[0] - RX, RULE[1] - RY), [
    (0, 76, 300, 90),      # full rule
    (8, 6, 28, 76),        # tick and knot
    (300, 76, 520, 90),    # rule under the slab
    (520, 76, 660, 90),    # end fade
])
check('title-sort-slab', 'title-sort', (SLAB[0] - RX, SLAB[1] - RY), [
    (330, 12, 362, 72),    # left splash
    (412, 12, 700, 26),    # top edge
    (412, 56, 700, 72),    # bottom edge
    (660, 12, 718, 72),    # bevelled tip
])
