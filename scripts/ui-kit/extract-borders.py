"""Extracts the Pictos row and weapon card textures for 9-slice use (see texlib.py).
Usage: python3 -I scripts/ui-kit/extract-borders.py <frames_dir>
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from texlib import *  # noqa: E402,F403

# rows.png is a crop of frame t15 at x=160, y=320.
RX, RY = 160, 320


def row(name, x0, y0, x1, y1, icon, portrait, band, fill_level, grain):
    """Coordinates are in rows.png space; icon/portrait = (cx, cy, r)."""
    img = frame('t15')[RY + y0:RY + y1, RX + x0:RX + x1].copy()
    sh = img.shape
    loc = lambda c: (c[0] - x0, c[1] - y0, c[2])
    bx0, by0, bx1, by1 = band
    mask = bright_text(img, rect(sh, bx0 - x0, by0 - y0, bx1 - x0, by1 - y0), fill_level + 22)
    g = grain
    img = inpaint(img, mask, (g[0] - x0, g[1] - y0, g[2] - x0, g[3] - y0))
    # Diamond interiors painted solid black: the component draws its own icon/portrait there.
    inner = diamond(sh, *loc(icon))
    if portrait:
        inner |= diamond(sh, *loc(portrait))
    soft = cv2.GaussianBlur(inner.astype(np.float32), (3, 3), 0)[..., None]
    img = img * (1 - soft) + 10 * soft
    save(img, name, fill_level)


row('plate-normal', 3, 75, 340, 141, icon=(30, 107, 17), portrait=None,
    band=(60, 84, 304, 131), fill_level=22, grain=(218, 92, 256, 124))
row('plate-selected', 368, 66, 742, 141, icon=(400, 107, 17), portrait=(708, 108, 22),
    band=(428, 84, 676, 131), fill_level=49, grain=(568, 92, 626, 124))
row('plate-hover', 328, 0, 752, 72, icon=(390, 37, 18), portrait=(721, 37, 22),
    band=(418, 12, 692, 63), fill_level=22, grain=(592, 16, 636, 58))


def card():
    x0, y0, x1, y1 = 740, 296, 1300, 512
    img = frame('t4')[y0:y1, x0:x1].copy()
    sh = img.shape
    L = img.max(2)
    # Second rect: the "Level 2" label overlapping the top-right corner.
    mask = bright_text(img, rect(sh, 800 - x0, 326 - y0, 1270 - x0, 500 - y0), 27)
    mask |= rect(sh, 1222 - x0, 296 - y0, 1292 - x0, 374 - y0)
    # Teal weapon blades overflow onto the card.
    teal = (img[..., 1] - img[..., 0] > 10) & (L > 20)
    mask |= teal
    inner = rect(sh, 796 - x0, 327 - y0, 1268 - x0, 489 - y0)
    img = repaint_flat(img, inner, mask)
    save(img, 'card-weapon', 17)


card()
