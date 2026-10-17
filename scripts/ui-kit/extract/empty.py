"""Extracts the empty slot diamond (empty-slot.webp) and a 45-degree unrotated 9-slice square (empty-square.webp).
It sits on scenery, not black: outer half of the rule uses alpha = (P - B) / (W - B), B inpainted from outside.
Usage: python3 -I scripts/ui-kit/extract/empty.py <frames_dir>
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from texlib import *  # noqa: E402,F403

FRAME, RX, RY = REFS['empty']
# Diamond centre and L1 radii of the rule, in empty.png px.
CX, CY = 94, 95
R_SPLIT = 81   # inside: opaque
R_OUT = 91     # outside: transparent
WHITE = np.array([246, 238, 229], np.float32)
X0, Y0, X1, Y1 = 2, 3, 187, 188


def slot():
    img = frame(FRAME)[RY:RY + 200, RX:RX + 200].copy()
    sh = img.shape
    yy, xx = np.mgrid[:sh[0], :sh[1]]
    d = np.abs(xx - CX) + np.abs(yy - CY)
    fill = np.median(img[(d < 60) & ~rect(sh, 46, 74, 142, 122)], axis=0)

    text = rect(sh, 46, 74, 142, 122) & (d < 70)
    img[text] = fill

    hole = (d <= R_OUT + 1).astype(np.uint8) * 255
    bg = cv2.inpaint(np.clip(img, 0, 255).astype(np.uint8), hole, 5, cv2.INPAINT_TELEA).astype(np.float32)

    P, B = img.max(2), bg.max(2)
    a = np.clip((P - B) / np.maximum(WHITE.max() - B, 1), 0, 1)
    a = np.where(d <= R_SPLIT, 1.0, np.where(d > R_OUT, 0.0, a))
    a = np.where(a < 0.012, 0, a)
    # Unmix colour: P = a*C + (1-a)*B.
    C = (img - (1 - a[..., None]) * bg) / np.maximum(a[..., None], 1e-3)
    C = np.where(d[..., None] <= R_SPLIT, img, np.clip(C, 0, 255))
    rgba = np.dstack([C, a * 255])[Y0:Y1, X0:X1]
    out = np.clip(rgba, 0, 255).astype(np.uint8)
    Image.fromarray(out, 'RGBA').save(OUT / 'empty-slot.webp', lossless=False, quality=92, method=6)
    Image.fromarray(np.clip(C * a[..., None], 0, 255).astype(np.uint8)[Y0:Y1, X0:X1]).save(DEBUG / 'empty-slot.png')
    print('empty-slot', out.shape[1], 'x', out.shape[0])
    return rgba


SHARPEN = float(sys.argv[2]) if len(sys.argv) > 2 else 0.5


def square(rgba, scale=4):
    h, w = rgba.shape[:2]
    pm = np.dstack([rgba[..., :3] * rgba[..., 3:] / 255, rgba[..., 3]])
    big = cv2.resize(pm, (w * scale, h * scale), interpolation=cv2.INTER_CUBIC)
    c = ((w * scale - 1) / 2, (h * scale - 1) / 2)
    M = cv2.getRotationMatrix2D(c, -45, 1.0)
    rot = cv2.warpAffine(big, M, (w * scale, h * scale), flags=cv2.INTER_CUBIC)
    # Odd side (like the 185 px crop) so both centres land on the same pixel, no half-pixel shift.
    side = int(np.ceil(R_OUT * np.sqrt(2) / 2)) * 2 + 1
    s0 = int(round(c[0] - (side - 1) / 2 * scale - (scale - 1) / 2))
    rot = rot[s0:s0 + side * scale, s0:s0 + side * scale]
    small = cv2.resize(rot, (side, side), interpolation=cv2.INTER_AREA)
    # Sharpen to offset the double rotation blur (here, then the browser's bilinear).
    small = np.clip(small + SHARPEN * (small - cv2.GaussianBlur(small, (0, 0), 0.8)), 0, 255)
    small[..., :3] = np.minimum(small[..., :3], small[..., 3:])
    a = np.clip(small[..., 3:], 0, 255)
    rgb = np.where(a > 0, small[..., :3] * 255 / np.maximum(a, 1e-3), 0)
    out = np.clip(np.dstack([rgb, a]), 0, 255).astype(np.uint8)
    Image.fromarray(out, 'RGBA').save(OUT / 'empty-square.webp', lossless=False, quality=92, method=6)
    print('empty-square', side, 'x', side)
    return out


def check_square(sq, scale=4):
    """Simulates the browser's +45 degree bilinear rotation."""
    h = sq.shape[0]
    D = X1 - X0
    pm = sq[..., :3].astype(np.float32) * sq[..., 3:] / 255
    pad = np.zeros((D, D, 3), np.float32)
    o = (D - h) // 2
    pad[o:o + h, o:o + h] = pm
    M = cv2.getRotationMatrix2D(((D - 1) / 2, (D - 1) / 2), 45, 1.0)
    return cv2.warpAffine(pad, M, (D, D), flags=cv2.INTER_LINEAR)


rgba = slot()
sq = square(rgba)

# Right/bottom edges only: the scenery there is black, so the reference is comparable.
ZONES = [
    (120, 30, 150, 60),    # top-right edge
    (150, 70, 186, 120),   # right tip
    (120, 125, 160, 160),  # bottom-right edge
    (80, 160, 110, 190),   # bottom tip
    (90, 16, 99, 45),      # top tip (the hand around it is excluded)
    (70, 130, 120, 160),   # lower interior
]
check('empty-slot', 'empty', (X0, Y0), ZONES)

r = np.asarray(Image.open(Path(__file__).resolve().parents[3] / 'design/ref/empty.png').convert('RGB')).astype(np.float32)
sim = np.zeros_like(r)
sim[Y0:Y1, X0:X1] = check_square(sq)
errs = [round(float(np.abs(r[y0:y1, x0:x1].max(2) - sim[y0:y1, x0:x1].max(2)).mean()), 2) for x0, y0, x1, y1 in ZONES]
print('empty-square (rotation simulée) écart moyen par zone :', errs)
Image.fromarray(np.hstack([r, np.full((200, 6, 3), [255, 0, 0], np.float32), sim]).astype(np.uint8)).save(DEBUG / 'empty-square__check.png')
