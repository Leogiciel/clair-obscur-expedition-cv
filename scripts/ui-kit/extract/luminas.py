"""Extracts the Luminas header, row and gold dot textures. Coordinates are luminas.png px (t15 at 1850, 900).
Usage: python3 -I scripts/ui-kit/extract/luminas.py <frames_dir>
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from texlib import *  # noqa: E402,F403

RX, RY = 1850, 900


def crop(name, x0, y0, x1, y1):
    return frame(name)[RY + y0:RY + y1, RX + x0:RX + x1].copy()


def silhouette(img, thr, core, open_px=7, feather=1.5):
    """Soft mask of the component touching `core`; the opening cuts background lattice lines off the edge."""
    L = cv2.GaussianBlur(img.max(2), (0, 0), 1)
    m = (L > thr).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((open_px, open_px), np.uint8))
    n, lab = cv2.connectedComponents(m)
    keep = np.zeros_like(m)
    for i in np.unique(lab[core & (m > 0)]):
        keep |= (lab == i).astype(np.uint8)
    keep |= core.astype(np.uint8)
    # Restore the frayed fringes the opening trimmed.
    keep = cv2.morphologyEx(keep, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    keep = cv2.dilate(keep, np.ones((3, 3), np.uint8), iterations=2)
    return cv2.GaussianBlur(keep.astype(np.float32), (0, 0), feather)


def poly(shape, pts):
    m = np.zeros(shape[:2], np.uint8)
    cv2.fillPoly(m, [np.array(pts, np.int32)], 1)
    return m.astype(bool)


# Row 1 of t15 (no gold dot).
ROW = (40, 92, 476, 163)
DIA = (87.5, 127.5, 30.5)         # diamond centre and outer rule half-diagonal


def row():
    x0, y0, x1, y1 = ROW
    img = crop('t15', *ROW)
    sh = img.shape
    cx, cy, r = DIA[0] - x0, DIA[1] - y0, DIA[2]
    yy, xx = np.mgrid[:sh[0], :sh[1]]
    d = np.abs(xx - cx) + np.abs(yy - cy)

    band = poly(sh, [(120 - x0, 105 - y0), (437 - x0, 105 - y0), (453 - x0, 129 - y0), (437 - x0, 151 - y0),
                     (120 - x0, 151 - y0)])
    # repaint_flat also repaints excluded pixels, so its result is kept only inside the band.
    text = bright_text(img, band, 30) | (d <= 36) | (img.max(2) > 30) | (img.max(2) < 14)
    rep = repaint_flat(img, band & (d > 34), text, sigma=10)
    w = cv2.GaussianBlur((band & (d > 34)).astype(np.float32), (0, 0), 1.5)[..., None]
    img = img * (1 - w) + rep * w

    ring = (d > 20) & (d < 24) & (img.max(2) - img.min(2) < 12)
    grey = np.median(img[ring], axis=0)
    inner = cv2.GaussianBlur((d <= 26).astype(np.float32), (0, 0), 0.8)[..., None]
    rng = np.random.default_rng(3)
    fib = cv2.GaussianBlur(rng.normal(0, 2.0, sh[:2]).astype(np.float32), (0, 0), sigmaX=4, sigmaY=0.7)[..., None]
    img = img * (1 - inner) + (grey + fib) * inner

    core = poly(sh, [(cx - r - 6, cy), (cx - 4, cy - r - 2), (102 - x0, 100 - y0), (441 - x0, 100 - y0),
                     (463 - x0, 130 - y0), (440 - x0, 156 - y0), (102 - x0, 156 - y0), (cx - 4, cy + r + 2)])
    # Thick lattice lines touch the chevron: clamp to the shape plus 3 px of fringe.
    near = cv2.GaussianBlur(cv2.dilate(core.astype(np.uint8), np.ones((3, 3), np.uint8), iterations=3)
                            .astype(np.float32), (0, 0), 1)
    img = img * (silhouette(img, 7, core) * near)[..., None]
    save(img, 'luminas-row', 22)
    check('luminas-row', 'luminas', (x0, y0), [
        (52, 94, 124, 108),    # diamond top tip and edges
        (52, 146, 124, 162),   # bottom tip
        (130, 96, 420, 106),   # plate top rule
        (130, 150, 420, 160),  # frayed bottom edge
        (438, 100, 462, 150),  # chevron
    ])


# Equipped gold dot: additive difference t1.5 - t15 on row 1.
DOT = (440, 110, 476, 146)


def dot():
    a = crop('t1.5', *DOT)
    b = crop('t15', *DOT)
    img = np.clip(a - b, 0, 255)
    img = np.where(img.max(2, keepdims=True) < 4, 0, img)
    save(img, 'luminas-dot', 255)


HEAD = (200, -18, 478, 88)        # extends above the reference


def head():
    x0, y0, x1, y1 = HEAD
    img = crop('t15', *HEAD)
    sh = img.shape
    L = img.max(2)
    sat = img.max(2) - img.min(2)
    # The "S" of LUMINAS overlaps the left edge.
    s_mask = rect(sh, 0, 10 - y0, 226 - x0, 50 - y0) & (L > 70) & (sat < 60)
    # Digits and halo only, so the damask just above stays intact.
    zone = rect(sh, 326 - x0, 10 - y0, 414 - x0, 60 - y0)
    digits = zone & ((L > 28) | (img[..., 1] - img[..., 0] > 8))
    count = zone & cv2.dilate(digits.astype(np.uint8), np.ones((3, 3), np.uint8), iterations=5).astype(bool)
    count_txt = count & ((L > 21) | (img[..., 1] - img[..., 0] > 4))
    glyph = rect(sh, 420 - x0, 5 - y0, 475 - x0, 60 - y0) & ((img[..., 1] - img[..., 0] > 18) | (L > 60))
    glyph = cv2.dilate(glyph.astype(np.uint8), np.ones((3, 3), np.uint8), iterations=1).astype(bool)
    rep = repaint_flat(img, count, count_txt | (L > 26), sigma=12)
    w = cv2.GaussianBlur(count.astype(np.float32), (0, 0), 1.5)[..., None]
    img = img * (1 - w) + rep * w
    img = inpaint(img, s_mask, (300 - x0, 20 - y0, 330 - x0, 40 - y0), desat=0.6, grow=1)
    # The glyph overlaps the fringe; silhouette() redraws the edge afterwards.
    g = cv2.dilate(glyph.astype(np.uint8), np.ones((3, 3), np.uint8), iterations=2)
    u8 = np.clip(img, 0, 255).astype(np.uint8)
    img = cv2.inpaint(u8, g * 255, 5, cv2.INPAINT_NS).astype(np.float32)
    # Desaturate the glyph's cyan/pink glow.
    gs = cv2.GaussianBlur(cv2.dilate(g, np.ones((5, 5), np.uint8), iterations=2).astype(np.float32), (0, 0), 2)[..., None]
    img = img + (img.mean(2, keepdims=True) - img) * gs
    # Right edge under the glyph, measured: x~428 at top (worn corner) to x~456 at bottom.
    yy, xx = np.mgrid[:sh[0], :sh[1]]
    edge = 428 - x0 + np.clip((yy + y0 - 14) / 36, 0, 1) * 28
    rng = np.random.default_rng(5)
    edge = edge + cv2.GaussianBlur(rng.normal(0, 3, sh[:2]).astype(np.float32), (0, 0), 1.5) * 1.5
    out = (xx > edge) & (yy + y0 < 56)
    img = img * (1 - cv2.GaussianBlur(out.astype(np.float32), (0, 0), 0.8))[..., None]

    core = poly(sh, [(226 - x0, -4 - y0), (424 - x0, -4 - y0), (440 - x0, 30 - y0), (450 - x0, 70 - y0),
                     (240 - x0, 76 - y0), (222 - x0, 40 - y0)])
    img = img * silhouette(img, 8, core)[..., None]
    # Left of the damask is scenery (character), not header.
    jit = cv2.GaussianBlur(rng.normal(0, 3, sh[:2]).astype(np.float32), (0, 0), sigmaX=0.8, sigmaY=2.5) * 4
    img = img * np.clip((xx + x0 - 216 + jit) / 6, 0, 1)[..., None]
    save(img, 'luminas-head', 18)
    check('luminas-head', 'luminas', (x0, y0), [
        (230, 0, 330, 8),      # top rule
        (230, 52, 330, 80),    # damask and bottom edge
        (330, 54, 420, 80),    # bottom edge under the counter
        (400, 0, 428, 10),     # worn top-right corner
        (420, 58, 470, 84),    # right/bottom edge under the glyph
    ])


row()
dot()
head()
