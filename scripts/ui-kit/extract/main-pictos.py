"""Extracts the main screen Pictos plates (filled from the video at 35.5 s, where the background is pure black; empty from t11).
Coordinates are capture px (2510x1380).
Usage: python3 -I scripts/ui-kit/extract/main-pictos.py design/frames  ->  public/ui/tex/main-pictos-*.webp
"""
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from texlib import *  # noqa: E402,F403

ROOT = Path(__file__).resolve().parents[3]
VIDEO = ROOT / 'design/clair_obscure_expedition_33_interface.mov'

FILLED = (118, 1010, 630, 1123)
EMPTY = (82, 1233, 650, 1352)
# Filled slot diamond: centre and cream rule half-diagonal.
DIA = (175.5, 1066.5, 36)


def video_frame(t):
    raw = subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-ss', str(t), '-i', str(VIDEO), '-frames:v', '1',
                          '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], check=True, capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(1380, 2510, 3).astype(np.float32)


def box(sh, x0, y0):
    """rect() in capture px, clamped to the texture box (no negative indices)."""
    return lambda a, b, c, d: rect(sh, max(a - x0, 0), max(b - y0, 0), max(c - x0, 0), max(d - y0, 0))


def repaint_in(img, words, excl, **kw):
    rep = repaint_flat(img, words, excl, **kw)
    w = cv2.GaussianBlur(cv2.dilate(words.astype(np.uint8), np.ones((3, 3), np.uint8)).astype(np.float32),
                         (0, 0), 1.5)[..., None]
    return img * (1 - w) + rep * w


def local_text(img, region, thr):
    L = img.max(2)
    med = cv2.medianBlur(np.clip(L, 0, 255).astype(np.uint8), 31).astype(np.float32)
    return region & (L - med > thr)


def compare(name, src, box, zones, skip=None):
    """Mean luminance error (0-255) per capture-px zone, ignoring `skip` (intentionally erased or scenery pixels)."""
    x0, y0, x1, y1 = box
    ref = src[y0:y1, x0:x1]
    t = np.asarray(Image.open(OUT / f'{name}.webp').convert('RGBA')).astype(np.float32)
    over = t[..., :3] * t[..., 3:] / 255
    diff = np.abs(ref.max(2) - over.max(2))
    ok = np.ones(diff.shape, bool) if skip is None else ~skip
    out = []
    for a, b, c, d in zones:
        z = (slice(b - y0, d - y0), slice(a - x0, c - x0))
        out.append(round(float(diff[z][ok[z]].mean()), 2))
    lift = lambda im: 255 * (np.clip(im, 0, 255) / 255) ** (1 / 2.2)
    sep = np.full((ref.shape[0], 4, 3), [255, 0, 0], np.float32)
    Image.fromarray(np.vstack([np.hstack([lift(ref), sep, lift(over)]),
                               np.hstack([ref, sep, over])]).astype(np.uint8)).save(DEBUG / f'{name}__check.png')
    print(name, 'écart moyen par zone :', out)
    return out


def filled():
    src = video_frame(35.5)
    x0, y0, x1, y1 = FILLED
    img = src[y0:y1, x0:x1].copy()
    sh = img.shape
    R = box(sh, x0, y0)
    cx, cy, r = DIA[0] - x0, DIA[1] - y0, DIA[2]
    yy, xx = np.mgrid[:sh[0], :sh[1]]
    d = np.abs(xx - cx) + np.abs(yy - cy)

    ring = (d > 25) & (d < 29)
    grey = np.median(img[ring], axis=0)
    inner = cv2.GaussianBlur((d <= 28).astype(np.float32), (0, 0), 0.8)[..., None]
    rng = np.random.default_rng(5)
    fib = cv2.GaussianBlur(rng.normal(0, 1.6, sh[:2]).astype(np.float32), (0, 0), sigmaX=4, sigmaY=0.7)[..., None]
    img = img * (1 - inner) + (grey + fib) * inner

    words = R(226, 1046, 430, 1094) | R(510, 1034, 584, 1061) | R(514, 1061, 578, 1097)
    txt = local_text(img, words, 14) | ~R(0, 1036, 9999, 1096) | (d <= 44)
    img = repaint_in(img, words, txt, sigma=9, desat=0.2, seed=3)

    save(img, 'main-pictos-filled', 20)
    compare('main-pictos-filled', src, FILLED, [
        (122, 1012, 160, 1122),   # left splash behind the diamond tip
        (135, 1026, 217, 1108),   # diamond cream rule
        (220, 1012, 600, 1036),   # top rule and edge
        (220, 1096, 600, 1123),   # bottom rule and frayed edge
        (580, 1030, 630, 1110),   # right tip
        (430, 1040, 505, 1094),   # flat between name and Level
    ], skip=d <= 28)


def empty():
    src = frame('t11')
    x0, y0, x1, y1 = EMPTY
    img = src[y0:y1, x0:x1].copy()
    sh = img.shape
    R = box(sh, x0, y0)
    L = img.max(2)

    # The character's arm is saturated brown (R - B > 0.3 L) while the plate is neutral grey: keep only
    # the estimated grey part, so paint over the hand survives and the bare hand drops to ~0 (transparent).
    chroma = img[..., 0] - img[..., 2]
    warm = cv2.GaussianBlur(((chroma > np.maximum(0.3 * L, 3)) & (L > 4)).astype(np.float32), (0, 0), 1.2)
    grey = np.clip(img[..., 2] - 0.7 * chroma, 0, None)[..., None].repeat(3, 2)
    w = np.clip(warm * 1.5, 0, 1)[..., None]
    img = img * (1 - w) + grey * w
    L = img.max(2)
    m = (L > 5).astype(np.uint8)
    n, lab, stats, _ = cv2.connectedComponentsWithStats(m)
    keep = np.zeros_like(m)
    for i in range(1, n):
        if stats[i, cv2.CC_STAT_AREA] > 40:
            keep |= (lab == i).astype(np.uint8)
    keep |= R(150, 1246, 610, 1328).astype(np.uint8)
    # Where the arm was, clamp to the plate hexagon plus ~12 px of fringe.
    env = np.zeros(sh[:2], np.uint8)
    pts = np.array([(0, 0), (588, 1236), (642, 1292), (598, 1352), (0, 1352)], np.float32) - (x0, y0)
    pts[[0, 4], 0] = 0
    cv2.fillPoly(env, [np.round(pts).astype(np.int32)], 1)
    keep &= env
    keep = cv2.morphologyEx(keep, cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8))
    sil = cv2.GaussianBlur(keep.astype(np.float32), (0, 0), 0.7)
    img = np.where(L[..., None] < 3, 0, img)

    dash = R(214, 1284, 250, 1300)
    txt = local_text(img, dash, 10) | ~R(0, 1250, 9999, 1320)
    img = repaint_in(img, dash, txt, sigma=6, desat=0.2, seed=9)

    img = img * sil[..., None]
    Image.fromarray((sil * 255).astype(np.uint8)).save(DEBUG / 'main-pictos-empty__mask.png')
    save(img, 'main-pictos-empty', 12)
    compare('main-pictos-empty', src, EMPTY, [
        (84, 1236, 200, 1340),    # splash and left chevron
        (200, 1236, 540, 1258),   # top rule and edge
        (200, 1316, 540, 1350),   # bottom rule and edge
        (520, 1250, 600, 1320),   # ghost diamond on the right
        (260, 1260, 500, 1316),   # flat
    ], skip=warm > 0.05)


filled()
empty()
