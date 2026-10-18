"""Extracts the stats column frame and bar textures from t4. Thin rules sit on a translucent panel, so each pixel
is unmixed as obs = bg*(1-a) + C*a over an inpainted bg; bar interiors are a dark veil obs = bg*(1-k).
Coordinates are stats-top.png px. Usage: python3 -I scripts/ui-kit/extract/stats-top.py <frames_dir>
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from texlib import *  # noqa: E402,F403

_, OX, OY = REFS['stats-top']
# Rule colour: brightest rail pixel over black.
C = np.array([214, 220, 216], np.float32)
LC = C.max()


def crop(x0, y0, x1, y1):
    """Crop in reference coordinates (may extend past the reference)."""
    return frame('t4')[OY + y0:OY + y1, OX + x0:OX + x1].copy()


def background(img, mask, radius=4):
    m8 = mask.astype(np.uint8) * 255
    u8 = np.clip(img, 0, 255).astype(np.uint8)
    return cv2.inpaint(u8, m8, radius, cv2.INPAINT_TELEA).astype(np.float32)


def unmix_light(img, bg, mask, floor=0.03):
    """a = (L - L_bg) / (L_C - L_bg) inside the mask."""
    L, Lb = img.max(2), bg.max(2)
    a = np.clip((L - Lb) / np.maximum(LC - Lb, 8), 0, 1)
    a = np.where(mask & (a > floor), a, 0)
    # Own colour only where coverage is high enough, otherwise C.
    own = (img - bg * (1 - a[..., None])) / np.maximum(a[..., None], 1e-3)
    rgb = np.where(a[..., None] > 0.35, np.clip(own, 0, 255), C)
    return rgb, a


def save_rgba(rgb, a, name):
    rgba = np.dstack([np.clip(rgb, 0, 255), np.clip(a, 0, 1) * 255]).astype(np.uint8)
    rgba[a <= 0, :3] = 0
    Image.fromarray(rgba, 'RGBA').save(OUT / f'{name}.webp', lossless=False, quality=94, method=6, alpha_quality=100)
    over = rgb * a[..., None]
    Image.fromarray((255 * (np.clip(over, 0, 255) / 255) ** (1 / 2.2)).astype(np.uint8)).save(DEBUG / f'{name}.png')
    print(name, rgba.shape[1], 'x', rgba.shape[0])


def check_over(name, img, bg, at, zones):
    """Mean luminance error over the estimated bg, counted only on pixels the texture covers."""
    t = np.asarray(Image.open(OUT / f'{name}.webp').convert('RGBA')).astype(np.float32)
    comp = bg * (1 - t[..., 3:] / 255) + t[..., :3] * t[..., 3:] / 255
    out = []
    for x0, y0, x1, y1 in zones:
        sx, sy = x0 - at[0], y0 - at[1]
        sl = (slice(sy, sy + y1 - y0), slice(sx, sx + x1 - x0))
        cov = t[sl][..., 3] > 0
        d = np.abs(img[sl].max(2) - comp[sl].max(2))[cov].mean()
        out.append(round(float(d), 2))
    print(name, 'error over estimated background:', out)
    return out


def band_line(shape, p0, p1, half):
    yy, xx = np.mgrid[:shape[0], :shape[1]].astype(np.float32)
    (x0, y0), (x1, y1) = p0, p1
    dx, dy = x1 - x0, y1 - y0
    t = np.clip(((xx - x0) * dx + (yy - y0) * dy) / (dx * dx + dy * dy), 0, 1)
    return np.hypot(xx - (x0 + t * dx), yy - (y0 + t * dy)) <= half


FX0, FY0, FX1, FY1 = -8, -18, 492, 380


def frame_tex():
    img = crop(FX0, FY0, FX1, FY1)
    sh = img.shape
    L = img.max(2)
    lc = lambda x, y: (x - FX0, y - FY0)  # reference -> texture
    R = lambda x0, y0, x1, y1: rect(sh, *lc(x0, y0), *lc(x1, y1))
    top = R(-8, 1, 460, 8)
    diag = band_line(sh, lc(413, 5), lc(484, 52), 2.6)
    short_h = R(418, 12, 464, 17)
    short_v = R(464, 20, 471, 45)
    right = R(478, 16, 484, FY1)
    left = R(1, 70, 7, FY1)
    # Above the rule near the corner the background is black, so anything bright is corner fraying.
    outside = R(440, FY0, FX1, 2)
    lines = top | diag | short_h | short_v | right | left
    bg = background(img, lines & ~outside)
    bg[outside] = 0
    rgb, a = unmix_light(img, bg, lines | outside)
    # Below L 6 on black is compression noise.
    a = np.where(outside & (L < 6), 0, a)
    # Unmixing over the sword and damask leaves lumps: blur alpha along the uprights.
    vert = (right | left) & ~R(FX0, FY0, FX1, 52)
    a_v = cv2.blur(a, (1, 5))
    a = np.where(vert, a_v, a)
    save_rgba(rgb, a, 'stats-top-frame')
    return img, bg


def bar_tex(name, x0, y0, x1, y1, inner_rows, stops, tips, yc, half, fill=None):
    """inner_rows: rows between the rails (end exclusive); stops/tips: left/right x; fill: gold fill x range to erase."""
    img = crop(x0, y0, x1, y1)
    sh = img.shape
    L = img.max(2)
    lc = lambda x, y: (x - x0, y - y0)
    body = rect(sh, 0, 3, sh[1], sh[0] - 3)
    bg = background(img, body, radius=6)
    ry0, ry1 = inner_rows
    sx0, sx1 = stops
    inner = rect(sh, *lc(sx0 + 2, ry0), *lc(sx1 - 1, ry1))
    # Elsewhere, anything above the estimated bg is damask or sword, not the bar.
    rails_m = rect(sh, 0, *lc(0, ry0 - 6)[1:], sh[1], lc(0, ry0)[1]) | rect(sh, 0, *lc(0, ry1)[1:], sh[1], lc(0, ry1 + 6)[1])
    rails_m &= rect(sh, lc(stops[0], 0)[0], 0, lc(stops[1], 0)[0], sh[0])
    yy, xx = np.mgrid[:sh[0], :sh[1]]
    ycl = yc - y0
    caps_m = np.zeros(sh[:2], bool)
    for stop, tip in ((sx0, tips[0]), (sx1, tips[1])):
        st, tp = stop - x0, tip - x0
        span = (xx - st) / (tp - st)  # 0 at the stop, 1 at the tip
        caps_m |= (span >= -0.05) & (span <= 1.04) & (np.abs(yy - ycl) <= half * (1 - np.clip(span, 0, 1)) + 2.5)
        caps_m |= (np.abs(xx - st) <= 3) & (np.abs(yy - ycl) <= half + 2.5)
    rgb, a = unmix_light(img, bg, (rails_m | caps_m) & ~inner, floor=0.06)
    # Keep rows where the rail exists along the whole length; clip local bulges from sword/damask grain.
    mid = slice(sx0 - x0 + 8, sx1 - x0 - 8)
    pa = np.median(a[:, mid], axis=1)
    keep = rails_m & ~caps_m
    a = np.where(keep, np.where(pa[:, None] > 0.08, np.minimum(a, pa[:, None] * 1.5 + 0.06), 0), a)
    # Veil k measured only where the bg is bright enough to read it.
    Lb = bg.max(2)
    k = np.clip(1 - L / np.maximum(Lb, 1), 0, 0.95)
    valid = inner & (Lb > 15)
    prof = np.array([np.median(k[r][valid[r]]) if valid[r].sum() > 20 else 0 for r in range(sh[0])], np.float32)
    print(name, 'veil k per row:', [round(float(v), 2) for v in prof if v > 0])
    ks = np.where(inner, prof[:, None], 0)
    if fill:
        fa, fb = fill
        cx0, cx1 = lc(fa, 0)[0], lc(fb, 0)[0]
        sane = slice(cx1 + 20, cx1 + 120)
        pa = np.median(a[:, sane], axis=1)[:, None]
        pk = prof[:, None]
        w = np.zeros(sh[1], np.float32)
        w[cx0:cx1] = 1
        w = cv2.GaussianBlur(w[None], (0, 0), 2.0)[0]
        w[:cx0] = 0  # keep the left stop intact
        rows_f = rect(sh, 0, *lc(0, ry0 - 5)[1:], sh[1], lc(0, ry1 + 5)[1])
        w2 = w[None, :] * rows_f
        a = a * (1 - w2) + pa * w2
        ks = ks * (1 - w2) + pk * w2
        rgb = np.where(w2[..., None] > 0, C, rgb)
    alpha = np.maximum(a, ks)
    col = np.where((a >= ks)[..., None], rgb, 0)
    save_rgba(col, alpha, name)
    return img, bg


def fill_tex():
    """XP bar gold fill (texture; its length is data), covering the full bar height including rails."""
    x0, y0, x1, y1 = 101, 127, 268, 152
    img = crop(x0, y0, x1, y1)
    sh = img.shape
    L = img.max(2)
    body = rect(sh, 0, 3, sh[1], sh[0] - 3)
    bg = background(img, body, radius=6)
    Lb = bg.max(2)
    Lf = np.maximum(np.median(L[8:17], axis=0), 150)[None, :]
    a = np.clip((L - Lb) / np.maximum(Lf - Lb, 8), 0, 1)
    a = np.where(body & (a > 0.04), a, 0)
    # Past x 265 only the rail remains.
    a[:, 266 - x0:] = 0
    own = (img - bg * (1 - a[..., None])) / np.maximum(a[..., None], 1e-3)
    save_rgba(np.clip(own, 0, 255), a, 'stats-top-bar-fill')
    return img, bg


fimg, fbg = frame_tex()
b2img, b2bg = bar_tex('stats-top-bar', 22, 181, 464, 211, inner_rows=(191, 200), stops=(42, 445), tips=(28, 458), yc=195, half=9)
b1img, b1bg = bar_tex('stats-top-bar-xp', 74, 125, 466, 155, inner_rows=(136, 143), stops=(99, 447), tips=(81, 458), yc=140, half=9, fill=(101, 268))

fimg2, fbg2 = fill_tex()

# Over black, only zones where the game background is black are comparable.
check('stats-top-frame', 'stats-top', (FX0, FY0), [(350, 0, 390, 9), (450, 0, 462, 9), (470, 230, 490, 300)])
check('stats-top-bar', 'stats-top', (22, 181), [(448, 195, 462, 208), (446, 198, 462, 206)])
check('stats-top-bar-xp', 'stats-top', (74, 125), [(290, 132, 330, 136), (290, 144, 330, 147)])
check('stats-top-bar-fill', 'stats-top', (101, 127), [(110, 133, 250, 146), (250, 131, 266, 148)])
check_over('stats-top-frame', fimg, fbg, (FX0, FY0), [(0, 0, 200, 9), (200, 0, 410, 9), (410, 0, 490, 60),
                                                       (474, 60, 490, 230), (0, 80, 10, 380)])
check_over('stats-top-bar', b2img, b2bg, (22, 181), [(22, 183, 60, 209), (60, 183, 300, 209), (300, 183, 430, 209), (430, 183, 464, 209),
                                                      (60, 186, 430, 191), (60, 200, 430, 206)])  # last two: rails only
check_over('stats-top-bar-fill', fimg2, fbg2, (101, 127), [(101, 129, 266, 150)])
check_over('stats-top-bar-xp', b1img, b1bg, (74, 125), [(74, 127, 101, 153), (280, 126, 380, 153), (380, 126, 466, 153)])
if '--diag' in sys.argv:
    for nm, im_, bg_, (ax, ay), (zx0, zx1) in (('stats-top-bar', b2img, b2bg, (22, 181), (300, 430)), ('stats-top-bar-xp', b1img, b1bg, (74, 125), (380, 466))):
        t = np.asarray(Image.open(OUT / f'{nm}.webp').convert('RGBA')).astype(np.float32)
        comp = bg_ * (1 - t[..., 3:] / 255) + t[..., :3] * t[..., 3:] / 255
        d = (im_.max(2) - comp.max(2))[:, zx0 - ax:zx1 - ax]
        print(nm, 'mean error signed / absolute per row:')
        for r in range(d.shape[0]):
            print(ay + r, round(float(d[r].mean()), 1), round(float(np.abs(d[r]).mean()), 1))
