"""Extracts the weapon list rows (selected and normal) from t4. They sit on damask, not black, so each plate is
cut out by an explicit silhouette. Coordinates are weapon-rows.png px.
Usage: python3 -I scripts/ui-kit/extract/weapon-rows.py <frames_dir>
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from texlib import *  # noqa: E402,F403

_, RX, RY = REFS['weapon-rows']


def crop(x0, y0, x1, y1):
    return frame('t4')[RY + y0:RY + y1, RX + x0:RX + x1].copy()


def line_mask(shape, p0, p1, width):
    m = np.zeros(shape[:2], np.uint8)
    cv2.line(m, tuple(int(v) for v in p0), tuple(int(v) for v in p1), 1, width, cv2.LINE_AA)
    return m.astype(bool)


def fill_holes(m):
    m8 = m.astype(np.uint8)
    h, w = m8.shape
    pad = np.zeros((h + 2, w + 2), np.uint8)
    pad[1:-1, 1:-1] = m8
    flood = pad.copy()
    cv2.floodFill(flood, None, (0, 0), 1)
    return m | (flood[1:-1, 1:-1] == 0)


def repaint_in(img, words, excl, **kw):
    """repaint_flat limited to `words`; `excl` is only excluded from the mean."""
    rep = repaint_flat(img, words, excl, **kw)
    w = cv2.GaussianBlur(cv2.dilate(words.astype(np.uint8), np.ones((3, 3), np.uint8)).astype(np.float32), (0, 0), 1.5)[..., None]
    return img * (1 - w) + rep * w


def selected():
    # The right tip slightly exceeds the reference.
    x0, y0, x1, y1 = 0, 0, 488, 92
    img = crop(x0, y0, x1, y1)
    sh = img.shape
    L = img.max(2)
    off = lambda x, y: (x - x0, y - y0)
    R = lambda a, b, c, d: rect(sh, a - x0, b - y0, c - x0, d - y0)

    # Purple plate (R > G) vs neutral grey damask.
    chroma = cv2.GaussianBlur(img[..., 0] - img[..., 1], (0, 0), 1.5)
    core = chroma > 6.5
    core = cv2.morphologyEx(core.astype(np.uint8), cv2.MORPH_OPEN, np.ones((3, 3), np.uint8)).astype(bool)
    # Fill each purple row end to end; below the lobe the bottom-left edge follows (30, 42) -> (66, 80).
    body = np.zeros_like(core)
    for y in range(13 - y0, 78 - y0):
        xs = np.where(core[y])[0]
        if len(xs) > 8:
            lo = xs.min()
            if y + y0 > 42:
                lo = max(lo, int(30 - x0 + (y + y0 - 42) * 36 / 38))
            body[y, lo:xs.max() + 1] = True
    body = fill_holes(cv2.morphologyEx(body.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8)).astype(bool))
    # Extend columns/rows while paint stays brighter than black, median-smoothed to avoid isolated teeth.
    sil = body.copy()

    def extend(lim, n, cond, axis_len):
        out = np.zeros(axis_len, int)
        for i, start in enumerate(lim):
            if start is None:
                continue
            k = 0
            while k < n and cond(i, start, k + 1):
                k += 1
            out[i] = k
        return cv2.medianBlur(out.astype(np.uint8)[None], 5)[0].astype(int)

    cols = [np.where(body[:, x])[0] for x in range(sh[1])]
    top = [c.min() if len(c) else None for c in cols]
    bot = [c.max() if len(c) else None for c in cols]
    up = extend(top, 9, lambda x, y, k: y - k >= 0 and L[y - k, x] > 24, sh[1])
    dn = extend(bot, 9, lambda x, y, k: y + k < sh[0] and L[y + k, x] > 24, sh[1])
    for x in range(sh[1]):
        if top[x] is not None:
            sil[top[x] - up[x]:top[x], x] = True
            sil[bot[x] + 1:bot[x] + 1 + dn[x], x] = True
    rows = [np.where(body[y])[0] for y in range(sh[0])]
    left = [r.min() if len(r) and y + y0 < 50 else None for y, r in enumerate(rows)]
    lf = extend(left, 14, lambda y, x, k: x - k >= 0 and L[y, x - k] > 30, sh[0])
    for y in range(sh[0]):
        if left[y] is not None:
            sil[y, left[y] - lf[y]:left[y]] = True
    sil = cv2.morphologyEx(sil.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8)).astype(bool)
    sil = cv2.GaussianBlur(sil.astype(np.float32), (0, 0), 1.4) > 0.5

    loc = L - cv2.medianBlur(np.clip(L, 0, 255).astype(np.uint8), 11)
    zone = line_mask(sh, off(131, 0), off(62, 80), 11) | R(70, 44, 104, 70)
    sword = zone & ((loc > 7) | (img[..., 1] - img[..., 0] > 8))
    sword |= line_mask(sh, off(129, 2), off(64, 78), 3)
    # Small-radius normalized convolution keeps the local hue without pulling the splash grey across.
    sw = cv2.dilate(sword.astype(np.uint8), np.ones((3, 3), np.uint8), iterations=2).astype(np.float32)
    valid = 1 - sw
    near = cv2.GaussianBlur(img * valid[..., None], (0, 0), 3) / np.maximum(cv2.GaussianBlur(valid, (0, 0), 3), 1e-3)[..., None]
    rng = np.random.default_rng(11)
    fib = cv2.GaussianBlur(rng.normal(0, 2.5, sh[:2]).astype(np.float32), (0, 0), sigmaX=5, sigmaY=0.7)[..., None]
    w = cv2.GaussianBlur(sw, (0, 0), 1.0)[..., None]
    img = img * (1 - w) + (near + fib) * w
    words = R(150, 26, 312, 64) | R(360, 12, 430, 41) | R(376, 38, 412, 82)
    txt = bright_text(img, words, 34) | ~cv2.erode(body.astype(np.uint8), np.ones((5, 5), np.uint8)).astype(bool)
    img = repaint_in(img, words, txt, sigma=10, desat=0.0, seed=3)

    soft = cv2.GaussianBlur(sil.astype(np.float32), (0, 0), 0.8)[..., None]
    img = img * soft
    Image.fromarray(np.clip(sil * 255, 0, 255).astype(np.uint8)).save(DEBUG / 'weapon-rows-selected__mask.png')
    save(img, 'weapon-rows-selected', 18)
    check('weapon-rows-selected', 'weapon-rows', (x0, y0), [
        (150, 4, 360, 16),    # top edge and white splash
        (130, 70, 370, 82),   # bottom edge
        (430, 22, 466, 72),   # right tip
        (22, 16, 56, 38),     # purple splash lobe
        (104, 44, 150, 70),   # grey splash right of the blade
    ])


def unselected():
    x0, y0, x1, y1 = 44, 94, 464, 168
    img = crop(x0, y0, x1, y1)
    sh = img.shape
    L = img.max(2)
    R = lambda a, b, c, d: rect(sh, a - x0, b - y0, c - x0, d - y0)

    # Rule hexagon grown ~2 px: paint slightly overflows the rule.
    poly = np.array([(79, 98.5), (433, 98.5), (458.5, 133), (429, 164), (72, 164), (48, 130)], np.float32)
    poly -= (x0, y0)
    m = np.zeros(sh[:2], np.uint8)
    cv2.fillPoly(m, [np.round(poly * 4).astype(np.int32)], 1, cv2.LINE_AA, shift=2)
    sil = m.astype(bool)

    sword = line_mask(sh, (138 - x0, 102 - y0), (82 - x0, 159 - y0), 5)
    sword |= R(88, 134, 104, 150) & (L > 34)
    sword &= ~R(0, 158, 999, 999) | (L > 34) & R(78, 156, 92, 162)
    img = inpaint(img, sword & ~R(0, 99, 999, 104), (200 - x0, 106 - y0, 260 - x0, 118 - y0), desat=0.5, grow=1)
    words = R(160, 106, 302, 150) | R(352, 103, 414, 128) | R(368, 122, 398, 165)
    inner = cv2.erode(sil.astype(np.uint8), np.ones((7, 7), np.uint8)).astype(bool)
    txt = bright_text(img, words, 32) | ~inner
    img = repaint_in(img, words, txt, sigma=10, desat=0.3, seed=5)

    soft = cv2.GaussianBlur(sil.astype(np.float32), (0, 0), 0.7)[..., None]
    img = img * soft
    save(img, 'weapon-rows-normal', 21)
    check('weapon-rows-normal', 'weapon-rows', (x0, y0), [
        (150, 97, 340, 106),   # top rule
        (110, 154, 330, 165),  # bottom rule
        (418, 104, 438, 158),  # right chevron
        (74, 104, 90, 114),    # left notch, upper arm
        (62, 146, 80, 158),    # left notch, lower arm
        (300, 132, 350, 152),  # flat between name and Level
    ])


selected()
unselected()
