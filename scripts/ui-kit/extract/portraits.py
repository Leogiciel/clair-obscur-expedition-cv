"""Extracts the team bar portrait shields (inactive/active) and LB/RB key badges. Coordinates are portraits.png px.
t38 shows the same shields with characters swapped and identical paint, so t15 vs t38 gives the portrait mask.
Usage: python3 -I scripts/ui-kit/extract/portraits.py <frames_dir>
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from texlib import *  # noqa: E402,F403

_, OX, OY = REFS['portraits']
# Horizontal offset of each shield in t38 vs t15 (measured by correlation).
T38_SMALL, T38_BIG = 183, -183


def crop(name, box, dx=0):
    x0, y0, x1, y1 = box
    return frame(name)[OY + y0:OY + y1, OX + x0 + dx:OX + x1 + dx].copy()


def poly(shape, pts, box):
    m = np.zeros(shape[:2], np.uint8)
    p = np.array([[x - box[0], y - box[1]] for x, y in pts], np.int32)
    cv2.fillPoly(m, [p], 1)
    return m.astype(bool)


def grow(m, n):
    return cv2.dilate(m.astype(np.uint8), np.ones((3, 3), np.uint8), iterations=n).astype(bool) if n > 0 else \
        cv2.erode(m.astype(np.uint8), np.ones((3, 3), np.uint8), iterations=-n).astype(bool)


def fill_backdrop(img, inside, bad, seed, margin=3, scales=(10, 20, 40, 80)):
    """Repaints the inside with a multi-scale normalized convolution plus noise matched to the original grain."""
    sh = img.shape
    valid = inside & ~grow(bad, margin)

    def smooth(valid):
        v = valid.astype(np.float32)
        acc = np.zeros_like(img)
        done = np.zeros(sh[:2], np.float32)
        for s in scales:
            num = cv2.GaussianBlur(img * v[..., None], (0, 0), s)
            den = cv2.GaussianBlur(v, (0, 0), s)
            w = np.clip(den / 0.4, 0, 1) * (1 - done)
            acc += num / np.maximum(den, 1e-4)[..., None] * w[..., None]
            done += w
        return acc / np.maximum(done, 1e-4)[..., None]

    # Second pass excludes outliers from the first estimate (hair remnants, portrait outline).
    fillc = smooth(valid)
    out = np.abs(img.max(2) - fillc.max(2)) > 7
    valid &= ~grow(out, 1)
    fillc = smooth(valid)
    # Repaint the whole inside to avoid a seam between clean and repaired areas.
    region = inside
    # Robust std (MAD) of the clean high frequencies.
    hv = (img - cv2.GaussianBlur(img, (0, 0), 3)).max(2)[valid]
    sd = float(1.4826 * np.median(np.abs(hv - np.median(hv))))
    rng = np.random.default_rng(seed)
    noise = cv2.GaussianBlur(rng.normal(0, 1, sh[:2]).astype(np.float32), (0, 0), sigmaX=2, sigmaY=0.6)
    noise *= 0.8 * sd / max(float(noise.std()), 1e-3)
    w = cv2.GaussianBlur(region.astype(np.float32), (0, 0), 0.8)[..., None] * inside[..., None]
    return img * (1 - w) + (fillc + noise[..., None]) * w


def seg_dist(px, py, a, b):
    ax, ay = a
    bx, by = b
    dx, dy = bx - ax, by - ay
    t = np.clip(((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy), 0, 1)
    return np.hypot(px - ax - t * dx, py - ay - t * dy)


def clone_along_edges(img, damaged, outer, box, edges, bad, mirror=None):
    """Clones the band along its own edge from a clean part, so fibres keep their direction.
    mirror: {edge: tip_x} for a fully covered edge, sourced from the opposite edge flipped around the tip."""
    mirror = mirror or {}
    sh = img.shape
    yy, xx = np.mgrid[:sh[0], :sh[1]]
    px, py = xx + box[0], yy + box[1]
    segs = [(outer[i], outer[(i + 1) % len(outer)]) for i in range(len(outer))]
    dist = np.stack([seg_dist(px, py, a, b) for a, b in segs])
    near = dist.argmin(0)
    out = img.copy()
    weight = np.zeros(sh[:2], np.float32)
    bad = bad.copy()
    # Mirrored edges last, so their source edge is already repaired.
    for i in sorted(edges, key=lambda e: e in mirror):
        part = damaged & (near == i)
        if not part.any():
            continue
        (ax, ay), (bx, by) = segs[i]
        n = np.hypot(bx - ax, by - ay)
        ux, uy = (bx - ax) / n, (by - ay) / n
        best = None
        fr = []
        mx = (2 * (mirror[i] - box[0]) - xx) if i in mirror else xx
        sgn = -1 if i in mirror else 1
        ks = range(-70, 71, 2) if i in mirror else sorted(list(range(-70, -9, 2)) + list(range(10, 71, 2)), key=abs)
        for k in sorted(ks, key=abs):
            sx = np.round(mx - sgn * ux * k).astype(int)
            sy = np.round(yy - uy * k).astype(int)
            ok = (sx >= 0) & (sy >= 0) & (sx < sh[1]) & (sy < sh[0])
            if not ok[part].all():
                continue
            fr.append((round(float(bad[sy[part], sx[part]].mean()), 3), k))
            if bad[sy[part], sx[part]].mean() < 0.05:
                best = (sx, sy, k)
                break
        if best is None:
            print('  bord', i, ': aucune source saine', sorted(fr)[:3])
            continue
        sx, sy, k = best
        print('  bord', i, ': décalage', k, 'px,', int(part.sum()), 'px clonés')
        src = out[np.clip(sy, 0, sh[0] - 1), np.clip(sx, 0, sh[1] - 1)]
        w = cv2.GaussianBlur(grow(part, 2).astype(np.float32), (0, 0), 1.2)
        out = out * (1 - w[..., None] * (1 - weight[..., None])) + src * (w[..., None] * (1 - weight[..., None]))
        weight = np.maximum(weight, w)
        bad &= ~part
    return out


def shield(name, base, box, other_dx, outer, inner, flag, keep_extra=(), seed=3, base_dx=0, mirror=None):
    """outer/inner: band outline and inner rule; flag: flag and pole rect."""
    A = crop(base, box, base_dx)
    B = crop('t38' if base == 't15' else 't15', box, base_dx + other_dx)
    sh = A.shape
    O = poly(sh, outer, box)
    I = grow(poly(sh, inner, box), -3)
    keep = grow(O, 5)
    for k in keep_extra:
        keep |= poly(sh, k, box)
    # Outside the shield take the min of both frames (removes neighbours), but keep the base where they
    # agree: the min of two noisy frames darkens.
    same = (np.abs(cv2.GaussianBlur(A, (0, 0), 1.5) - cv2.GaussianBlur(B, (0, 0), 1.5)).max(2) < 40)[..., None]
    img = np.where(grow(O, 1)[..., None] | same, A, np.minimum(A, B))
    img = img * keep[..., None]
    # Smoothed comparison: compression alone makes the frames differ by ~8 on average.
    d = np.abs(cv2.GaussianBlur(A, (0, 0), 1.5) - cv2.GaussianBlur(B, (0, 0), 1.5)).max(2)
    M = cv2.morphologyEx(((d > 16) & grow(O, 1)).astype(np.uint8), cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    M = cv2.morphologyEx(M, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    M = grow(M, 1) & grow(O, 1)
    F = rect(sh, flag[0] - box[0], flag[1] - box[1], flag[2] - box[0], flag[3] - box[1])
    # Gold or skin remnants on the band.
    L = A.max(2)
    M |= grow((A[..., 0] - A[..., 2] > 42) & (L > 60) & O, 1)
    bad = M | F
    band_dmg = M & ~I
    img = clone_along_edges(img, band_dmg, outer, box, edges=range(len(outer)), bad=bad | ~grow(O, 4), mirror=mirror)
    img = fill_backdrop(img, I, (M | F) & I, seed)
    # Darkest inside pixel as fill level, so the whole inside is opaque.
    fill_level = float(img.max(2)[I].min())
    dbg = np.dstack([M * 255, F * 255, I * 120]).astype(np.uint8)
    Image.fromarray(dbg).save(DEBUG / f'{name}__mask.png')
    save(img, name, fill_level)


def key(name, box, inside):
    img = crop('t15', box)
    sh = img.shape
    I = rect(sh, inside[0] - box[0], inside[1] - box[1], inside[2] - box[0], inside[3] - box[1])
    letters = grow(bright_text(img, I, 55), 1)
    img = fill_backdrop(img, I, letters, seed=5, margin=1, scales=(4, 8, 16))
    save(img, name, 24)


SMALL_BOX = (78, 10, 246, 124)
SMALL_OUTER = [(88, 22), (165, 18), (233, 22), (233, 27), (225, 76), (158, 113), (126, 102)]
SMALL_INNER = [(97, 27), (227, 27), (221, 72), (158, 104), (130, 95)]
shield('portraits-frame', 't15', SMALL_BOX, T38_SMALL, SMALL_OUTER, SMALL_INNER, flag=(184, 32, 222, 70),
       mirror={5: 158})

BIG_BOX = (210, -6, 462, 144)
BIG_OUTER = [(238, 3), (443, 6), (446, 17), (441, 76), (337, 132), (296, 113)]
BIG_INNER = [(254, 13), (432, 13), (428, 72), (336, 121), (302, 103)]
# Thin diagonal streaks under the active shield's edges belong to it.
BIG_STREAKS = [[(222, 90), (246, 52), (292, 50), (300, 112), (250, 122), (214, 118), (214, 100)],
               [(400, 70), (450, 70), (450, 78), (462, 78), (462, 144), (400, 144)]]
shield('portraits-frame-active', 't15', BIG_BOX, T38_BIG, BIG_OUTER, BIG_INNER, flag=(374, 24, 418, 74),
       keep_extra=BIG_STREAKS, mirror={4: 337})

# RB mirrors LB but each is extracted separately to keep its own pixels.
key('portraits-key-left', (8, 45, 60, 80), inside=(21, 53, 48, 71))
key('portraits-key-right', (448, 45, 500, 80), inside=(459, 53, 489, 71))

check('portraits-frame', 'portraits', (SMALL_BOX[0], SMALL_BOX[1]),
      [(86, 17, 138, 26), (176, 17, 232, 26), (90, 26, 112, 60), (222, 24, 240, 70), (180, 80, 222, 100), (104, 31, 128, 48)])
check('portraits-frame-active', 'portraits', (BIG_BOX[0], BIG_BOX[1]),
      [(240, 0, 360, 12), (240, 12, 290, 60), (430, 6, 452, 70), (370, 80, 440, 120), (240, 78, 290, 112),
       (262, 18, 300, 40)])
check('portraits-key-left', 'portraits', (8, 45), [(10, 47, 58, 53), (10, 47, 21, 78), (48, 47, 58, 78), (10, 71, 58, 78)])
check('portraits-key-right', 'portraits', (448, 45), [(450, 47, 498, 53), (450, 47, 459, 78), (489, 47, 498, 78), (450, 71, 498, 78)])
