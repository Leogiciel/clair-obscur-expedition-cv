"""Extracts the main screen Skills textures from t11: filled row, empty row, level badge and gold dot.
Grid: 2 columns 413.5 px apart, rows every 82.5 px; column 2 (x 1250) is pixel-aligned, so textures are read there.
Usage: python3 -I scripts/ui-kit/extract/main-skills.py design/frames
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from texlib import *  # noqa: E402,F403

# Row 1, column 2 in t11.
BX0, BY0, BX1, BY1 = 1250, 1106, 1656, 1186
ROW3 = 165                  # row 1 -> row 3 offset (2 x 82.5 px)
DIA = (1288.0, 1145.5)
DIA_R = 33.5                # diamond rule half-diagonal
SPLICE = (1552, 1568)       # blend from the filled row into the empty row's right end
FILL = 22                   # plate fill level (opaque)


def crop(x0, y0, x1, y1):
    return frame('t11')[y0:y1, x0:x1].copy()


def poly(shape, pts, ox, oy):
    m = np.zeros(shape[:2], np.uint8)
    cv2.fillPoly(m, [np.round((np.array(pts, np.float32) - (ox, oy)) * 4).astype(np.int32)], 1, cv2.LINE_AA, shift=2)
    return m.astype(bool)


def keep_connected(m, core):
    n, lab = cv2.connectedComponents(m.astype(np.uint8))
    keep = np.zeros(m.shape, bool)
    for i in np.unique(lab[core & m]):
        if i:
            keep |= lab == i
    return keep | core


def silhouette(img, core):
    """`core` plus connected grey fringes; the character's brown (R - B > 4.5 when dark) is excluded."""
    L = cv2.GaussianBlur(img.max(2), (0, 0), 0.8)
    brown = cv2.GaussianBlur(img[..., 0] - img[..., 2], (0, 0), 1.2) > 4.5
    paint = (L > 3) & ~(brown & (L < 45))
    paint = cv2.morphologyEx(paint.astype(np.uint8), cv2.MORPH_OPEN, np.ones((2, 2), np.uint8)).astype(bool)
    sil = keep_connected(paint, core)
    sil = cv2.morphologyEx(sil.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8)).astype(bool)
    return cv2.GaussianBlur(sil.astype(np.float32), (0, 0), 0.7)


PLATE = [(1294, 1114), (1612, 1114), (1634, 1146), (1609, 1176), (1294, 1176)]


def filled():
    img = crop(BX0, BY0, BX1, BY1)
    right = crop(BX0, BY0 + ROW3, BX1, BY1 + ROW3)
    sh = img.shape
    yy, xx = np.mgrid[:sh[0], :sh[1]]
    R = lambda a, b, c, d: rect(sh, a - BX0, b - BY0, c - BX0, d - BY0)

    # Replace the right end (dot + badge) with the empty row's, which has neither.
    t = np.clip((xx - (SPLICE[0] - BX0)) / (SPLICE[1] - SPLICE[0]), 0, 1)[..., None]
    img = img * (1 - t) + right * t

    band = R(1324, 1123, SPLICE[1], 1170)
    txt = bright_text(img, band, 25) | (img.max(2) > 27)
    img = repaint_in(img, band, txt | ~R(1328, 1121, 1600, 1171), sigma=10, desat=0.2, seed=5)

    d = np.abs(xx - (DIA[0] - BX0)) + np.abs(yy - (DIA[1] - BY0))
    rng = np.random.default_rng(9)
    fib = cv2.GaussianBlur(rng.normal(0, 2.0, sh[:2]).astype(np.float32), (0, 0), sigmaX=4, sigmaY=0.7)[..., None]
    plate_rgb = np.median(img[R(1560, 1128, 1600, 1160)], axis=0)
    inner = cv2.GaussianBlur((d <= DIA_R - 2.6).astype(np.float32), (0, 0), 0.6)[..., None]
    img = img * (1 - inner) + (plate_rgb + fib) * inner

    # No margin around the diamond: the brown background touches it.
    core = (d <= DIA_R + 1.5) | poly(sh, PLATE, BX0, BY0)
    # Plate fringes capped at 4 px; beyond that it is character debris.
    sil = silhouette(img, core) * cv2.dilate(core.astype(np.uint8), np.ones((9, 9), np.uint8))
    dia = cv2.GaussianBlur((d <= DIA_R + 2.2).astype(np.float32), (0, 0), 0.6)
    near_dia = d <= DIA_R + 8
    sil = np.where(near_dia & ~poly(sh, [(1294, 1110), (1700, 1110), (1700, 1182), (1294, 1182)], BX0, BY0), dia, sil)
    img = img * sil[..., None]
    Image.fromarray(np.clip(sil * 255, 0, 255).astype(np.uint8)).save(DEBUG / 'main-skills-row__mask.png')
    save(img, 'main-skills-row', FILL)


def empty():
    y0, y1 = BY0 + ROW3, BY1 + ROW3
    img = crop(BX0, y0, BX1, y1)
    sh = img.shape
    R = lambda a, b, c, d: rect(sh, a - BX0, b - y0, c - BX0, d - y0)
    band = R(1330, 1304, 1360, 1322)
    img = repaint_in(img, band, bright_text(img, band, 27), sigma=6, desat=0.2, seed=6)
    core = poly(sh, [(1307, 1279), (1612, 1279), (1634, 1311), (1609, 1341), (1300, 1341), (1283, 1310)], BX0, y0)
    sil = silhouette(img, core)
    img = img * sil[..., None]
    save(img, 'main-skills-empty', FILL)


# The empty row 165 px below shows exactly what lies under the badge, so alpha and colour are recovered
# by inverting normal compositing.
BADGE = (1614, 1123, 1656, 1166)
BADGE_C = (1634.5, 1143.5)


def badge():
    x0, y0, x1, y1 = BADGE
    lit = crop(*BADGE)
    base = crop(x0, y0 + ROW3, x1, y1 + ROW3)
    sh = lit.shape
    yy, xx = np.mgrid[:sh[0], :sh[1]]
    d = np.abs(xx - (BADGE_C[0] - x0)) + np.abs(yy - (BADGE_C[1] - y0))
    # Exclude the glow of the neighbouring gold dot.
    glow = np.hypot(xx - (1602.5 - x0), yy - (1145 - y0)) < 17
    diff = np.abs(lit - base).max(2)
    a = np.clip(diff / 24, 0, 1) * (d <= 21) * ~glow
    a = np.maximum(a, (d <= 13).astype(np.float32))
    a = cv2.GaussianBlur(a.astype(np.float32), (0, 0), 0.5)
    img = base + (lit - base) / np.maximum(a[..., None], 0.05)
    img = np.clip(img, 0, 255)
    # Digit: high red, which the blue badge lacks.
    digit = (d <= 13) & (img[..., 0] > 72)
    m8 = cv2.dilate(digit.astype(np.uint8) * 255, np.ones((3, 3), np.uint8), iterations=1)
    m8 &= ((d <= 14) * 255).astype(np.uint8)
    blue = np.median(img[(d <= 12) & (m8 == 0)], axis=0)
    img = cv2.inpaint(img.astype(np.uint8), m8, 4, cv2.INPAINT_TELEA).astype(np.float32)
    # The digit brightens its surroundings: pull toward the median badge blue.
    fillc = cv2.GaussianBlur(img, (0, 0), 1.8) * 0.4 + blue * 0.6
    w = cv2.GaussianBlur(m8.astype(np.float32) / 255, (0, 0), 1.2)[..., None]
    img = img * (1 - w) + fillc * w
    rgba = np.dstack([np.clip(img, 0, 255), a * 255]).astype(np.uint8)
    Image.fromarray(rgba, 'RGBA').save(OUT / 'main-skills-badge.webp', lossless=False, quality=92, method=6)
    Image.fromarray(np.clip(img * a[..., None], 0, 255).astype(np.uint8)).save(DEBUG / 'main-skills-badge.png')
    print('main-skills-badge', sh[1], 'x', sh[0])


# Gold dot centre ~ (1602.5, 1145).
DOT = (1584, 1126, 1622, 1164)


def dot():
    x0, y0, x1, y1 = DOT
    lit = crop(x0, y0, x1, y1)
    base = crop(x0, y0 + ROW3, x1, y1 + ROW3)
    add = np.clip(lit - base, 0, 255)
    # The badge overlaps the right corner: clamp the glow to a disk.
    yy, xx = np.mgrid[:add.shape[0], :add.shape[1]]
    r = np.hypot(xx - (1602.5 - x0), yy - (1145 - y0))
    add *= np.clip((17 - r) / 3, 0, 1)[..., None]
    L = add.max(2)
    a = np.clip(L / 255, 0, 1)
    rgb = np.where(a[..., None] > 0, add / np.maximum(a[..., None], 1e-3), 0)
    rgba = np.dstack([np.clip(rgb, 0, 255), a * 255]).astype(np.uint8)
    Image.fromarray(rgba, 'RGBA').save(OUT / 'main-skills-dot.webp', lossless=False, quality=92, method=6)
    Image.fromarray(np.clip(add, 0, 255).astype(np.uint8)).save(DEBUG / 'main-skills-dot.png')
    print('main-skills-dot', add.shape[1], 'x', add.shape[0])


def repaint_in(img, words, excl, **kw):
    rep = repaint_flat(img, words, excl, **kw)
    w = cv2.GaussianBlur(cv2.dilate(words.astype(np.uint8), np.ones((3, 3), np.uint8)).astype(np.float32), (0, 0), 1.5)[..., None]
    return img * (1 - w) + rep * w


def compare(name, at, zones, src_off=(0, 0), additive=None):
    """Mean luminance error (0-255) per capture-px zone of the texture composited at `at` vs t11."""
    t = np.asarray(Image.open(OUT / f'{name}.webp').convert('RGBA')).astype(np.float32)
    h, w = t.shape[:2]
    comp = t[..., :3] * t[..., 3:] / 255
    if additive is not None:
        comp = additive
    ref = frame('t11')
    out = []
    for x0, y0, x1, y1 in zones:
        r = ref[y0 + src_off[1]:y1 + src_off[1], x0 + src_off[0]:x1 + src_off[0]].max(2)
        c = comp[y0 - at[1]:y1 - at[1], x0 - at[0]:x1 - at[0]].max(2)
        out.append(round(float(np.abs(r - c).mean()), 2))
    x, y = at
    pad = np.zeros((h, 6, 3), np.float32)
    pad[..., 0] = 255
    sbs = np.hstack([ref[y:y + h, x:x + w], pad, comp])
    g = 255 * (np.clip(sbs, 0, 255) / 255) ** (1 / 2.2)
    Image.fromarray(g.astype(np.uint8)).resize((sbs.shape[1] * 2, h * 2), Image.NEAREST).save(DEBUG / f'{name}__check.png')
    print(name, 'mean error per zone:', out)
    return out


filled()
empty()
badge()
dot()
compare('main-skills-row', (BX0, BY0), [
    (1300, 1112, 1600, 1121),   # top rule
    (1294, 1167, 1560, 1180),   # bottom rule and worn edge
    (1600, 1110, 1648, 1182),   # chevron (taken from the empty row)
    (1254, 1112, 1322, 1180),   # diamond (erased interior: error expected)
], src_off=(0, 0))
compare('main-skills-row', (BX0, BY0), [(1600, 1110, 1648, 1182), (1560, 1121, 1600, 1170)], src_off=(0, ROW3))
compare('main-skills-empty', (BX0, BY0 + ROW3), [
    (1300, 1277, 1600, 1286),   # top rule
    (1294, 1332, 1600, 1346),   # bottom rule
    (1256, 1275, 1310, 1346),   # left chevron and fringe
    (1600, 1275, 1648, 1347),   # right chevron
    (1360, 1290, 1600, 1330),   # flat
])


def check_stack():
    """Row + additive dot + badge composited over black vs row 1 column 2 (badge digit excluded)."""
    r = np.asarray(Image.open(OUT / 'main-skills-row.webp').convert('RGBA')).astype(np.float32)
    dt = np.asarray(Image.open(OUT / 'main-skills-dot.webp').convert('RGBA')).astype(np.float32)
    bd = np.asarray(Image.open(OUT / 'main-skills-badge.webp').convert('RGBA')).astype(np.float32)
    comp = r[..., :3] * r[..., 3:] / 255
    dx, dy = DOT[0] - BX0, DOT[1] - BY0
    comp[dy:dy + dt.shape[0], dx:dx + dt.shape[1]] += dt[..., :3] * dt[..., 3:] / 255
    bx, by = BADGE[0] - BX0, BADGE[1] - BY0
    a = bd[..., 3:] / 255
    sub = comp[by:by + bd.shape[0], bx:bx + bd.shape[1]]
    comp[by:by + bd.shape[0], bx:bx + bd.shape[1]] = sub * (1 - a) + bd[..., :3] * a
    comp = np.clip(comp, 0, 255)
    ref = crop(BX0, BY0, BX1, BY1)
    yy, xx = np.mgrid[:ref.shape[0], :ref.shape[1]]
    num = np.abs(xx - (BADGE_C[0] - BX0)) + np.abs(yy - (BADGE_C[1] - BY0)) <= 12
    out = []
    for x0, y0, x1, y1 in [(1586, 1128, 1616, 1162), (1612, 1120, 1656, 1168), (1560, 1110, 1656, 1184)]:
        sl = (slice(y0 - BY0, y1 - BY0), slice(x0 - BX0, x1 - BX0))
        e = np.abs(ref[sl].max(2) - comp[sl].max(2))[~num[sl]]
        out.append(round(float(e.mean()), 2))
    s = np.vstack([ref, np.zeros((4, ref.shape[1], 3)), comp])[:, 300:]
    g = 255 * (np.clip(s, 0, 255) / 255) ** (1 / 2.2)
    Image.fromarray(g.astype(np.uint8)).resize((s.shape[1] * 6, s.shape[0] * 6), Image.NEAREST).save(DEBUG / 'main-skills-stack__check.png')
    print('stacked row + dot + badge, error (dot, badge excluding digit, end):', out)


check_stack()
