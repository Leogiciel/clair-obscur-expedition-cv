"""Extracts the weapon screen list panel and equipped card. The screen is static from 3.0 to 9.25 s, so a per-pixel
median removes compression noise and transient hover; rows and text are erased.
Usage: python3 -I scripts/ui-kit/extract/weapon-screen.py  ->  public/ui/tex/weapon-screen-*.webp
"""
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from texlib import *  # noqa: E402,F403

ROOT = Path(__file__).resolve().parents[3]
VIDEO = ROOT / 'design/clair_obscure_expedition_33_interface.mov'


def median(x0, y0, x1, y1, start=3.0, dur=6.3, fps=4):
    w, h = x1 - x0, y1 - y0
    raw = subprocess.run(
        ['ffmpeg', '-nostdin', '-v', 'error', '-ss', str(start), '-t', str(dur), '-i', str(VIDEO),
         '-vf', f'fps={fps},crop={w}:{h}:{x0}:{y0}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
        check=True, capture_output=True).stdout
    stack = np.frombuffer(raw, np.uint8).reshape(-1, h, w, 3).astype(np.float32)
    return np.percentile(stack, 50, axis=0)


def poly_mask(shape, pts, ox, oy):
    m = np.zeros(shape[:2], np.uint8)
    p = np.array(pts, np.float32) - (ox, oy)
    cv2.fillPoly(m, [np.round(p * 4).astype(np.int32)], 1, cv2.LINE_AA, shift=2)
    return m.astype(bool)


def fill_holes(m):
    m8 = m.astype(np.uint8)
    h, w = m8.shape
    pad = np.zeros((h + 2, w + 2), np.uint8)
    pad[1:-1, 1:-1] = m8
    flood = pad.copy()
    cv2.floodFill(flood, None, (0, 0), 1)
    return m | (flood[1:-1, 1:-1] == 0)


def patch_fill(img, mask, forbid, cell=12, ring=5, search=120, step=2):
    """Patch-based fill, same as stats-backdrop.py."""
    H, W = mask.shape
    out = img.copy()
    hole = mask.astype(bool).copy()
    filled = np.zeros_like(hole)
    S = cell + 2 * ring
    for cy in range(0, H, cell):
        for cx in range(0, W, cell):
            if not hole[cy:cy + cell, cx:cx + cell].any():
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
            out[by0:by0 + S, bx0:bx0 + S] = np.where(box_hole[..., None], src, target)
            filled[by0:by0 + S, bx0:bx0 + S] |= box_hole
            hole[by0:by0 + S, bx0:bx0 + S] = False
    return out, filled


def lift(img, name):
    """Gamma-lifted debug image to reveal text ghosts and stains."""
    g = 255 * (np.clip(img, 0, 255) / 255) ** (1 / 2.4)
    Image.fromarray(g.astype(np.uint8)).save(DEBUG / f'{name}__lift.png')


# Starts below the title rule (y 271-275, rendered by TextureTitleSort).
PANEL = (100, 278, 758, 1096)


def panel():
    x0, y0, x1, y1 = PANEL
    img = median(x0, y0, x1, y1)
    sh = img.shape
    L = img.max(2)

    sel = poly_mask(sh, [(244, 314), (676, 314), (698, 357), (676, 402), (244, 402), (212, 357)], x0, y0)
    nor = poly_mask(sh, [(270, 403), (644, 403), (666, 440), (644, 481), (270, 481), (242, 440)], x0, y0)
    chroma = cv2.GaussianBlur(img[..., 0] - img[..., 1], (0, 0), 1.5) > 6.5
    chroma &= rect(sh, 190 - x0, 305 - y0, 700 - x0, 410 - y0)
    rows = sel | nor | chroma
    rows = cv2.dilate(rows.astype(np.uint8), np.ones((3, 3), np.uint8), iterations=2).astype(bool)

    # Never copy from the bevelled corner.
    corner = rect(sh, 650 - x0, 0, sh[1], 360 - y0)
    # Top half fills from the damask above; bottom half fills on the flipped image from the dark veil below,
    # so the seam lands under the rows where it is invisible.
    mid = 404 - y0
    top = rows.copy()
    top[mid:] = False
    patched, done_t = patch_fill(img, top, corner | rows)
    bot = rows.copy()
    bot[:mid] = False
    pf, done_b = patch_fill(patched[::-1].copy(), bot[::-1].copy(), corner[::-1].copy())
    patched, done = pf[::-1], done_t | done_b[::-1]
    rest = rows & ~done
    img = cv2.inpaint(np.clip(patched, 0, 255).astype(np.uint8), rest.astype(np.uint8) * 255, 5,
                      cv2.INPAINT_TELEA).astype(np.float32)
    seam = cv2.GaussianBlur(img, (0, 0), 0.8)
    w = cv2.GaussianBlur(rows.astype(np.float32), (0, 0), 1.5)[..., None] * 0.5
    img = img * (1 - w) + seam * w
    # Desaturate leftover purple picked up at the edges.
    g = cv2.GaussianBlur(rows.astype(np.float32), (0, 0), 2)[..., None]
    img = img + (img.mean(2, keepdims=True) - img) * g

    save(img, 'weapon-screen-panel', 24)
    lift(img, 'weapon-screen-panel')
    Image.fromarray(rows.astype(np.uint8) * 255).save(DEBUG / 'weapon-screen-panel__mask.png')
    rx, ry = REFS['list-panel'][1:]
    check('weapon-screen-panel', 'list-panel', (x0 - rx, y0 - ry), [
        (20, 220, 50, 780),     # left vertical rule
        (60, 240, 200, 600),    # left damask and big brush stroke
        (200, 220, 620, 780),   # dark veil and right damask
        (540, 0, 640, 70),      # bevelled corner and right rule
        (0, 0, 120, 30),        # damask under the title rule
    ])


CARD = (1830, 918, 2400, 1172)


def card():
    x0, y0, x1, y1 = CARD
    img = median(x0, y0, x1, y1)
    sh = img.shape
    L = img.max(2)
    R = lambda a, b, c, d: rect(sh, a - x0, b - y0, c - x0, d - y0)

    # A 9x9 opening keeps the card flat (~17) and drops the thin damask lines.
    lit = (L > 11).astype(np.uint8)
    body = cv2.morphologyEx(lit, cv2.MORPH_OPEN, np.ones((9, 9), np.uint8))
    n, lab, stats, _ = cv2.connectedComponentsWithStats(body)
    body = lab == (1 + np.argmax(stats[1:, cv2.CC_STAT_AREA]))
    body = fill_holes(body)
    # Worn edges: take real painted pixels within 3 px.
    near = cv2.dilate(body.astype(np.uint8), np.ones((7, 7), np.uint8)).astype(bool)
    sil = body | (near & (L > 9))
    sil |= R(1873, 1018, 1886, 1162) & (L > 25)
    sil |= R(1875, 1018, 1883, 1162) & (L > 13)   # fading lower part of the rule
    sil |= R(1925, 966, 2295, 977) & (L > 25)
    # "Level 2" overflows the top-right corner: clamp the top edge to y 987 there.
    sil &= ~(R(2300, 918, 2400, 984) & ~body)
    sil &= ~R(2310, 918, 2400, 987)
    sil = cv2.morphologyEx(sil.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8)).astype(bool)

    words = R(1905, 982, 2365, 1140) | R(2310, 978, 2378, 1028)
    words &= ~R(1873, 900, 1886, 1200) & ~R(1925, 960, 2295, 979)
    txt = bright_text(img, words, 30) | ~cv2.erode(sil.astype(np.uint8), np.ones((5, 5), np.uint8)).astype(bool)
    rep = repaint_flat(img, words, txt, sigma=10, desat=0.4, seed=9)
    w = cv2.GaussianBlur(cv2.dilate(words.astype(np.uint8), np.ones((3, 3), np.uint8)).astype(np.float32), (0, 0), 1.5)[..., None]
    img = img * (1 - w) + rep * w

    soft = cv2.GaussianBlur(sil.astype(np.float32), (0, 0), 0.7)[..., None]
    img = img * soft
    Image.fromarray(sil.astype(np.uint8) * 255).save(DEBUG / 'weapon-screen-card__mask.png')
    save(img, 'weapon-screen-card', 17)
    lift(img, 'weapon-screen-card')
    rx, ry = REFS['card-equipped'][1:]
    check('weapon-screen-card', 'card-equipped', (x0 - rx, y0 - ry), [
        (65, 4, 415, 16),      # top rule
        (5, 62, 16, 192),      # left vertical rule
        (0, 0, 70, 50),        # painted blade
        (20, 150, 500, 186),   # bottom of the flat
        (470, 70, 504, 180),   # right edge
    ])


panel()
card()
