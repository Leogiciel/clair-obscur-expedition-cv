"""Extracts the main screen right column textures: lattice backdrop (continues stats-backdrop below y 900),
the frame's left upright, and the Wardrobe button plate. The lattice comes from skill tree frames (~37-38.5 s).
Usage: python3 -I scripts/ui-kit/extract/main-right.py
"""
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from texlib import *  # noqa: E402,F403

ROOT = Path(__file__).resolve().parents[3]
VIDEO = ROOT / 'design/clair_obscure_expedition_33_interface.mov'
# Video crop in capture px.
SX, SY, SW, SH = 1820, 760, 690, 560
FPS = 4
# Skill tree frames at FPS: no UI under the column.
SKILL = slice(148, 155)


def frames():
    raw = subprocess.run(
        ['ffmpeg', '-nostdin', '-v', 'error', '-i', str(VIDEO), '-vf', f'fps={FPS},crop={SW}:{SH}:{SX}:{SY}',
         '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
        check=True, capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, SH, SW, 3).astype(np.float32)


def sub(img, x0, y0, x1, y1):
    """Crop in capture coordinates."""
    return img[y0 - SY:y1 - SY, x0 - SX:x1 - SX].copy()


def mode_image(stack, step=4):
    """Per-pixel median of the most frequent luminance bin: the static scenery wins over changing UI."""
    L = stack.max(3)
    bins = np.clip(L // step, 0, 255 // step).astype(np.int32)
    n = 255 // step + 1
    counts = np.zeros((n,) + L.shape[1:], np.int32)
    for b in range(n):
        counts[b] = (bins == b).sum(0)
    # Merge neighbouring bins: compression noise straddles bin edges.
    smooth = counts.copy()
    smooth[1:] += counts[:-1]
    smooth[:-1] += counts[1:]
    best = smooth.argmax(0)
    keep = np.abs(bins - best[None]) <= 1
    vals = np.where(keep[..., None], stack, np.nan)
    return np.nanmedian(vals, axis=0), smooth.max(0) / len(stack)


def patch_fill(img, mask, cell=12, ring=5, search=120, step=2):
    """Patch-based fill: copies the best-matching clean lattice patch so the pattern continues instead of blurring."""
    H, W = mask.shape
    out = img.copy()
    hole = mask.astype(bool).copy()
    filled = np.zeros_like(hole)
    S = cell + 2 * ring
    for cy in range(0, H, cell):
        for cx in range(0, W, cell):
            if not hole[cy:cy + cell, cx:cx + cell].any():
                continue
            by0, bx0 = max(cy - ring, 0), max(cx - ring, 0)
            by0, bx0 = min(by0, H - S), min(bx0, W - S)
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
                    if hole[sy:sy + S, sx:sx + S].any():
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


stack = frames()
L_all = stack.max(3)
skill = np.median(stack[SKILL], axis=0)

BX0, BY0, BX1, BY1 = 1860, 900, 2440, 1290
BACK_FADE = 40           # bottom px faded to transparent
# Texture px: hand area and the Luminas row ends inside it.
HAND = (410, 120, 580, 390)
ROW_ENDS = (410, 80, 485, 270)


def backdrop():
    base = sub(skill, BX0, BY0, BX1, BY1)
    md, _ = mode_image(stack[:, BY0 - SY:BY1 - SY, BX0 - SX:BX1 - SX])
    sd = stack[SKILL, BY0 - SY:BY1 - SY, BX0 - SX:BX1 - SX].max(3).std(0)
    # The hand moves through the skill tree frames; the most frequent value is the lattice, except under
    # the row ends where it is UI, so only motion counts there.
    ends = rect(base.shape, *ROW_ENDS)
    hand = rect(base.shape, *HAND) & (((np.abs(base - md).max(2) > 3) & ~ends) | (sd > 4))
    hand = cv2.dilate(hand.astype(np.uint8), np.ones((3, 3), np.uint8), iterations=3).astype(bool)
    hand &= rect(base.shape, *HAND)
    img = np.where(hand[..., None], md, base)
    doubt = hand & ends
    img, done = patch_fill(img, doubt)
    rest = doubt & ~done
    if rest.any():
        img = cv2.inpaint(np.clip(img, 0, 255).astype(np.uint8), rest.astype(np.uint8) * 255, 5,
                          cv2.INPAINT_TELEA).astype(np.float32)
    # Warm hand reflection left on the lattice: retint to the lattice hue, keep luminance.
    L = img.max(2, keepdims=True)
    lat = (L[..., 0] > 15) & ~rect(base.shape, *HAND)
    tint = np.median(img[lat] / L[lat], axis=0)
    warm = rect(base.shape, *HAND) & (img[..., 0] - img[..., 2] > (tint[0] - tint[2]) * L[..., 0] + 1.5)
    warm = cv2.GaussianBlur(cv2.dilate(warm.astype(np.uint8), np.ones((3, 3), np.uint8), iterations=2)
                            .astype(np.float32), (0, 0), 1.5)[..., None]
    img = img * (1 - warm) + L * tint * warm
    print('backdrop: lattice tint', np.round(tint, 3), 'warm reflection', int((warm > 0.5).sum()), 'px')
    moving = hand
    print('backdrop: motion outside the hand area', int(((sd > 6) & ~rect(base.shape, *HAND)).sum()), 'px')
    w = cv2.GaussianBlur(moving.astype(np.float32), (0, 0), 1.5)[..., None] * 0.4
    img = img * (1 - w) + cv2.GaussianBlur(img, (0, 0), 0.8) * w
    # Fade out before the key hints.
    h = img.shape[0]
    fade = np.clip((h - np.arange(h)) / BACK_FADE, 0, 1)[:, None, None]
    print('backdrop: pixels kept', int(moving.sum()), '/ copied', int(doubt.sum()))
    save(img * fade, 'main-right-backdrop', 28)
    Image.fromarray(np.clip(img * 7, 0, 255).astype(np.uint8)).save(DEBUG / 'main-right-backdrop__x7.png')
    # Check against the main screen (median of t11 +/- 0.5 s).
    main = sub(np.median(stack[42:47], axis=0), BX0, BY0, BX1, BY1)
    zones = {'right': (2340, 920, 2440, 1240), 'below the rows': (1880, 1130, 2320, 1240),
             'left': (1866, 920, 1880, 1080)}
    out = {}
    for k, (x0, y0, x1, y1) in zones.items():
        a = main[y0 - BY0:y1 - BY0, x0 - BX0:x1 - BX0].max(2)
        b = img[y0 - BY0:y1 - BY0, x0 - BX0:x1 - BX0].max(2)
        out[k] = round(float(np.abs(a - b).mean()), 2)
    print('backdrop: mean difference from the main screen', out)
    return img


LX0, LY0, LX1, LY1 = 1852, 1080, 1888, 1272


def line(lattice):
    # Frames where the Luminas block is shown (0-2 s and 10-11 s).
    main = np.median(np.concatenate([stack[4:8], stack[40:47]]), axis=0)
    img = sub(main, LX0, LY0, LX1, LY1)
    bg = lattice[LY0 - BY0:LY1 - BY0, LX0 - BX0:LX1 - BX0] if LX0 >= BX0 else None
    bg = sub(skill, LX0, LY0, LX1, LY1) if bg is None else bg
    diff = img.max(2) - bg.max(2)
    m = (diff > 4).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((5, 1), np.uint8))
    n, lab, stats, _ = cv2.connectedComponentsWithStats(m)
    keep = np.zeros_like(m)
    for i in range(1, n):
        if stats[i, cv2.CC_STAT_HEIGHT] > 60 or stats[i, cv2.CC_STAT_WIDTH] > 10:
            keep |= (lab == i).astype(np.uint8)
    keep = cv2.dilate(keep, np.ones((3, 3), np.uint8), iterations=1)
    w = cv2.GaussianBlur(keep.astype(np.float32), (0, 0), 0.7)
    # Subtract the lattice the line partly covers.
    out = np.clip(img - bg * (1 - np.clip(diff / 60, 0, 1))[..., None], 0, 255) * w[..., None]
    ys, xs = np.nonzero(keep)
    print('line: stroke x', LX0 + xs.min(), '..', LX0 + xs.max(), ' y', LY0 + ys.min(), '..', LY0 + ys.max())
    save(out, 'main-right-line', 110)
    Image.fromarray(np.clip(out * 3, 0, 255).astype(np.uint8)).save(DEBUG / 'main-right-line__x3.png')


WX0, WY0, WX1, WY1 = 1915, 786, 2325, 872
ART = (1974, 2054)                            # outfit illustration columns
TEXT = (2091, 811, 2231, 849)
DOT_C = (2274, 832, 16)                       # gold dot centre and erased halo radius
# Chevron inner rules under the dot, measured on their visible parts.
DOT_LINES = [((2271, 809), (2291, 829)), ((2293, 834), (2276, 851))]
EDGE_TOP, EDGE_BOTTOM = 801, 859              # top rule to bottom edge under the illustration


def poly(shape, pts):
    m = np.zeros(shape[:2], np.uint8)
    cv2.fillPoly(m, [np.array(pts, np.int32)], 1)
    return m.astype(bool)


def silhouette(img, thr, core, open_px=5, feather=1.2):
    """See luminas.py."""
    L = cv2.GaussianBlur(img.max(2), (0, 0), 1)
    m = (L > thr).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((open_px, open_px), np.uint8))
    n, lab = cv2.connectedComponents(m)
    keep = np.zeros_like(m)
    for i in np.unique(lab[core & (m > 0)]):
        keep |= (lab == i).astype(np.uint8)
    keep |= core.astype(np.uint8)
    keep = cv2.morphologyEx(keep, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    keep = cv2.dilate(keep, np.ones((3, 3), np.uint8), iterations=2)
    return cv2.GaussianBlur(keep.astype(np.float32), (0, 0), feather)


def wardrobe():
    # Median of main screen frames: less compression noise than t11.
    src = np.median(np.concatenate([stack[4:11], stack[40:46]]), axis=0)
    img = sub(src, WX0, WY0, WX1, WY1)
    sh = img.shape
    X = lambda x: x - WX0  # noqa: E731
    Y = lambda y: y - WY0  # noqa: E731
    L = img.max(2)
    rng = np.random.default_rng(11)

    # Under the illustration: row-wise blend between clean columns on each side (rules are horizontal).
    a0, a1 = X(ART[0]), X(ART[1])
    left = img[:, a0 - 6:a0 - 1].mean(1)
    right = img[:, a1 + 1:a1 + 6].mean(1)
    t = np.linspace(0, 1, a1 - a0)[None, :, None]
    band = left[:, None] * (1 - t) + right[:, None] * t
    fib = cv2.GaussianBlur(rng.normal(0, 1.0, band.shape[:2]).astype(np.float32), (0, 0), sigmaX=5, sigmaY=0.6)
    inner = np.zeros(sh[0], np.float32)
    inner[Y(EDGE_TOP) + 9:Y(EDGE_BOTTOM) - 9] = 1
    band = band + (fib * inner[:, None])[..., None]
    rows = np.zeros(sh[0], np.float32)
    rows[Y(EDGE_TOP):Y(EDGE_BOTTOM)] = 1
    patch = img.copy()
    patch[:, a0:a1] = band * rows[:, None, None]
    m = rect(sh, a0, 0, a1, sh[0]).astype(np.float32)
    m = cv2.GaussianBlur(m, (0, 0), 1.2)[..., None]
    img = img * (1 - m) + patch * m

    x0, y0, x1, y1 = X(TEXT[0]), Y(TEXT[1]), X(TEXT[2]), Y(TEXT[3])
    left = img[y0:y1, x0 - 5:x0].mean(1)
    right = img[y0:y1, x1:x1 + 4].mean(1)
    t = np.linspace(0, 1, x1 - x0)[None, :, None]
    fib = cv2.GaussianBlur(rng.normal(0, 1.0, (y1 - y0, x1 - x0)).astype(np.float32), (0, 0), sigmaX=5, sigmaY=0.6)
    patch = img.copy()
    patch[y0:y1, x0:x1] = left[:, None] * (1 - t) + right[:, None] * t + fib[..., None]
    m = cv2.GaussianBlur(rect(sh, x0, y0, x1, y1).astype(np.float32), (0, 0), 1.0)[..., None]
    img = img * (1 - m) + patch * m

    # Repaint the gold dot disk, then redraw the chevron inner rules it covered.
    yy, xx = np.mgrid[:sh[0], :sh[1]]
    r = np.hypot(xx - X(DOT_C[0]), yy - Y(DOT_C[1]))
    flat = np.median(img[Y(840):Y(848), X(2232):X(2250)].reshape(-1, 3), axis=0)
    fib = cv2.GaussianBlur(rng.normal(0, 1.0, sh[:2]).astype(np.float32), (0, 0), sigmaX=5, sigmaY=0.6)
    fill = flat + fib[..., None]
    stroke = np.zeros(sh[:2], np.float32)
    for (ax, ay), (bx, by) in DOT_LINES:
        cv2.line(stroke, (X(ax) * 16, Y(ay) * 16), (X(bx) * 16, Y(by) * 16), 1.0, 2, cv2.LINE_AA, shift=4)
    stroke = cv2.GaussianBlur(stroke, (0, 0), 0.7)
    stroke = stroke / max(stroke.max(), 1e-3)
    line_rgb = np.median(img[Y(809):Y(813), X(2270):X(2275)].reshape(-1, 3), axis=0) * 1.15
    fill = fill * (1 - stroke[..., None]) + line_rgb * stroke[..., None]
    disk = np.clip((DOT_C[2] + 1 - r) / 2, 0, 1)[..., None]
    img = img * (1 - disk) + fill * disk
    halo = np.clip((DOT_C[2] + 8 - r) / 4, 0, 1)[..., None]
    img = img + (img.mean(2, keepdims=True) - img) * halo

    # Includes the drip under the label.
    core = poly(sh, [(X(1924), Y(831)), (X(1946), Y(803)), (X(2290), Y(803)), (X(2313), Y(831)),
                     (X(2290), Y(857)), (X(2250), Y(857)), (X(2246), Y(867)), (X(2172), Y(867)),
                     (X(2168), Y(857)), (X(1946), Y(857))])
    near = cv2.GaussianBlur(cv2.dilate(core.astype(np.uint8), np.ones((3, 3), np.uint8), iterations=4)
                            .astype(np.float32), (0, 0), 1)
    img = img * (silhouette(img, 6, core) * near)[..., None]
    save(img, 'main-right-wardrobe', 18)
    Image.fromarray(np.clip((img / 255) ** (1 / 1.8) * 255, 0, 255).astype(np.uint8)).save(DEBUG / 'main-right-wardrobe__lift.png')
    t = np.asarray(Image.open(OUT / 'main-right-wardrobe.webp').convert('RGBA')).astype(np.float32)
    zones = {'left diamond': (1920, 800, 1972, 862), 'top rule': (2056, 796, 2300, 811),
             'bottom edge': (2056, 849, 2300, 866), 'chevron': (2297, 805, 2318, 858)}
    # Also composite over the bare lattice (weapon tooltip frames, 3.5-9 s, no button), as in the page.
    under = sub(np.median(stack[14:36], axis=0), WX0, WY0, WX1, WY1)
    a = t[..., 3:] / 255
    comp_black = (t[..., :3] * a).max(2)
    comp = (under * (1 - a) + t[..., :3] * a).max(2)
    ref = sub(src, WX0, WY0, WX1, WY1).max(2)
    print('wardrobe: over black', {k: round(float(np.abs(comp_black[Y(z[1]):Y(z[3]), X(z[0]):X(z[2])] - ref[Y(z[1]):Y(z[3]), X(z[0]):X(z[2])]).mean()), 2) for k, z in zones.items()})
    out = {}
    for k, (x0, y0, x1, y1) in zones.items():
        out[k] = round(float(np.abs(comp[Y(y0):Y(y1), X(x0):X(x1)] - ref[Y(y0):Y(y1), X(x0):X(x1)]).mean()), 2)
    print('wardrobe: over the lattice', out)
    Image.fromarray(np.clip(np.vstack([ref, comp, np.abs(ref - comp) * 4]) * 2, 0, 255).astype(np.uint8)).save(DEBUG / 'main-right-wardrobe__check.png')


lattice = backdrop()
line(lattice)
wardrobe()
