"""Extracts the big-diamond tooltip textures (plate, diamond, divider) from frame t15.
The card sits on the 3D scene, not black, so alpha comes from measured anti-aliased shapes, not luminance.
Usage: python3 scripts/ui-kit/extract/diamond-card.py <frames_dir>
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from texlib import *  # noqa: E402,F403

FR, OX, OY = REFS['diamond-card']
SS = 8  # supersampling factor for anti-aliased shapes
EDGE_BLUR = 0.8


def ref_crop(x0, y0, x1, y1):
    """Crop in reference coordinates (may extend past the reference on the right)."""
    return frame(FR)[OY + y0:OY + y1, OX + x0:OX + x1].copy()


def poly_alpha(shape, pts, origin):
    ox, oy = origin
    m = np.zeros((shape[0] * SS, shape[1] * SS), np.uint8)
    p = np.array([[(x - ox) * SS, (y - oy) * SS] for x, y in pts], np.int32)
    cv2.fillPoly(m, [p], 255)
    m = cv2.resize(m.astype(np.float32) / 255, (shape[1], shape[0]), interpolation=cv2.INTER_AREA)
    return cv2.GaussianBlur(m, (0, 0), EDGE_BLUR) if EDGE_BLUR else m


def diamond_alpha(shape, cx, cy, r, origin):
    ox, oy = origin
    yy, xx = np.mgrid[:shape[0] * SS, :shape[1] * SS].astype(np.float32)
    xx = (xx + 0.5) / SS - 0.5 + ox
    yy = (yy + 0.5) / SS - 0.5 + oy
    m = ((np.abs(xx - cx) + np.abs(yy - cy)) <= r).astype(np.float32)
    m = cv2.resize(m, (shape[1], shape[0]), interpolation=cv2.INTER_AREA)
    # The video capture softens edges over ~3 px; match that blur.
    return cv2.GaussianBlur(m, (0, 0), EDGE_BLUR) if EDGE_BLUR else m


def bleed(img, alpha):
    """Refills edge pixels from the interior so no brown scenery fringe bleeds in."""
    edge = (alpha < 0.5).astype(np.uint8) * 255
    u8 = np.clip(img, 0, 255).astype(np.uint8)
    return cv2.inpaint(u8, edge, 3, cv2.INPAINT_TELEA).astype(np.float32)


def save_rgba(img, alpha, name):
    rgba = np.dstack([np.clip(img, 0, 255), np.clip(alpha, 0, 1) * 255]).astype(np.uint8)
    Image.fromarray(rgba, 'RGBA').save(OUT / f'{name}.webp', lossless=False, quality=92, method=6)
    Image.fromarray(np.clip(img * alpha[..., None], 0, 255).astype(np.uint8)).save(DEBUG / f'{name}.png')
    print(name, rgba.shape[1], 'x', rgba.shape[0])


def fibres(shape, amp, seed):
    rng = np.random.default_rng(seed)
    f = cv2.GaussianBlur(rng.normal(0, 1, shape[:2]).astype(np.float32), (0, 0), sigmaX=5, sigmaY=0.7)
    return (f / max(f.std(), 1e-3) * amp)[..., None]


# Geometry measured on the reference (px, 1x). Diamond: centre and outer half-diagonal (50% edge).
D_CX, D_CY, D_R = 93.75, 104.2, 85.75
D_INNER = 60
# Plate outline, points on the outer edge.
PLATE = [(97.5, 17.5), (107.5, 7.3), (300, 7.0), (606.5, 7.0), (607.4, 18), (625.6, 82.5), (619.2, 90),
         (620.8, 97.5), (595.6, 183.5), (564, 199.6), (97.5, 199.6)]
PX0, PY0, PX1, PY1 = 95, 5, 628, 203
# 9-slice insets (top, right, bottom, left) in texture px.
SLICES = (16, 72, 24, 106)
DX0, DY0, DX1, DY1 = 5, 16, 183, 194


def plate():
    img = ref_crop(PX0, PY0, PX1, PY1)
    sh = img.shape
    org = (PX0, PY0)
    alpha = poly_alpha(sh, PLATE, org)
    loc = lambda x0, y0, x1, y1: rect(sh, x0 - PX0, y0 - PY0, x1 - PX0, y1 - PY0)
    L = img.max(2)
    # Inset polygon: excludes the rules and the right flank.
    inner_pts = [(104, 18), (112, 13), (592, 13), (595, 26), (602, 26), (614.5, 82), (610, 90), (610, 97),
                 (590, 178), (560, 191.5), (104, 191.5)]
    region = poly_alpha(sh, inner_pts, org) > 0.5
    # Plate fill is L ~ 22: brighter is text/divider, darker is their drop shadow.
    hidden = diamond_alpha(sh, D_CX, D_CY, D_R + 3, org) > 0.01
    bad = (region & (L > 31)) | (region & (L < 17)) | hidden
    bad = cv2.dilate(bad.astype(np.uint8), np.ones((3, 3), np.uint8), iterations=3).astype(bool)
    valid = (region & ~bad).astype(np.float32)
    fillc = None
    for sigma in (40, 14, 6):  # coarse to fine: the local estimate wins where it has support
        num = cv2.GaussianBlur(img * valid[..., None], (0, 0), sigma)
        den = cv2.GaussianBlur(valid, (0, 0), sigma)[..., None]
        f = num / np.maximum(den, 1e-6)
        k = np.clip(den / 0.15, 0, 1) if fillc is not None else 1
        fillc = f if fillc is None else fillc * (1 - k) + f * k
    # Plate is nearly uniform in the capture (std < 1): barely visible fibres.
    fillc = fillc + fibres(sh, 0.5, 11)
    w = cv2.GaussianBlur((region | hidden).astype(np.float32), (0, 0), 0.8)[..., None]
    img = img * (1 - w) + fillc * w
    # The "g" descender of "Burning" overlaps the bottom rule: copy the rule profile from just right of it.
    gx0, gx1, gy0, gy1 = 262, 294, 186, 195
    prof = img[gy0 - PY0:gy1 - PY0, 300 - PX0:340 - PX0].mean(1, keepdims=True)
    wx = np.clip(np.minimum(np.arange(gx0, gx1) - gx0, gx1 - 1 - np.arange(gx0, gx1)) / 3, 0, 1)[None, :, None]
    sub = img[gy0 - PY0:gy1 - PY0, gx0 - PX0:gx1 - PX0]
    img[gy0 - PY0:gy1 - PY0, gx0 - PX0:gx1 - PX0] = sub * (1 - wx) + prof * wx
    # Left edge hidden by the diamond: copy the profile of the visible edge (rows 20-26).
    prof = img[20 - PY0:27 - PY0, 0:14].mean(0)
    hy0, hy1 = 27, 182
    blend = np.clip(cv2.GaussianBlur(hidden.astype(np.float32), (0, 0), 1.5)[hy0 - PY0:hy1 - PY0, 0:14], 0, 1)[..., None]
    img[hy0 - PY0:hy1 - PY0, 0:14] = img[hy0 - PY0:hy1 - PY0, 0:14] * (1 - blend) + prof[None] * blend
    img = bleed(img, alpha)
    save_rgba(img, alpha, 'diamond-card-plate')


def diamond_tex():
    img = ref_crop(DX0, DY0, DX1, DY1)
    sh = img.shape
    org = (DX0, DY0)
    alpha = diamond_alpha(sh, D_CX, D_CY, D_R, org)
    yy, xx = np.mgrid[:sh[0], :sh[1]]
    d = np.abs(xx + DX0 - D_CX) + np.abs(yy + DY0 - D_CY)
    ring = (d > D_INNER - 4) & (d < D_INNER - 1)
    base = np.median(img[ring], axis=0)
    w = np.clip((D_INNER - d) / 3.0, 0, 1)[..., None]
    img = img * (1 - w) + (base + fibres(sh, 0.6, 5)) * w
    img = bleed(img, alpha)
    save_rgba(img, alpha, 'diamond-card-diamond')


def divider():
    """Alpha = luminance excess over the plate, colour = the card's cream."""
    x0, y0, x1, y1 = 186, 124, 436, 134
    img = ref_crop(x0, y0, x1, y1)
    base = np.median(img[[0, 1, -2, -1]].reshape(-1, 3), axis=0)
    col = np.array([214, 206, 188], np.float32)
    a = np.clip((img.max(2) - base.max()) / (col.max() - base.max()), 0, 1)
    # Description letters touch the bottom: keep only the rule rows.
    a[:2] = 0
    a[7:] = 0
    rgb = np.broadcast_to(col, img.shape).copy()
    save_rgba(rgb, a, 'diamond-card-divider')


plate()
diamond_tex()
divider()


def compose_check(zones):
    root = OUT.parent.parent.parent
    r = np.asarray(Image.open(root / 'design/ref/diamond-card.png').convert('RGB')).astype(np.float32)
    canvas = np.zeros_like(r)
    for name, (x, y) in (('diamond-card-plate', (PX0, PY0)), ('diamond-card-divider', (186, 124)),
                         ('diamond-card-diamond', (DX0, DY0))):
        t = np.asarray(Image.open(OUT / f'{name}.webp').convert('RGBA')).astype(np.float32)
        h, w = t.shape[:2]
        cx1, cy1 = min(x + w, r.shape[1]), min(y + h, r.shape[0])
        sub = t[:cy1 - y, :cx1 - x]
        a = sub[..., 3:] / 255
        canvas[y:cy1, x:cx1] = canvas[y:cy1, x:cx1] * (1 - a) + sub[..., :3] * a
    # Outside the silhouette the reference shows the 3D scene: measure only the silhouette and black areas.
    sil = np.zeros(r.shape[:2], np.float32)
    sil[PY0:PY1, PX0:min(PX1, r.shape[1])] = poly_alpha((PY1 - PY0, PX1 - PX0), PLATE, (PX0, PY0))[:, :r.shape[1] - PX0]
    sil[DY0:DY1, DX0:DX1] = np.maximum(sil[DY0:DY1, DX0:DX1], diamond_alpha((DY1 - DY0, DX1 - DX0), D_CX, D_CY, D_R, (DX0, DY0)))
    keep = (sil > 0.99) | (r.max(2) < 4)
    out = {}
    for k, (x0, y0, x1, y1) in zones.items():
        m = keep[y0:y1, x0:x1]
        out[k] = round(float(np.abs(r[y0:y1, x0:x1].max(2) - canvas[y0:y1, x0:x1].max(2))[m].mean()), 2)
    lift = lambda im: 255 * (np.clip(im, 0, 255) / 255) ** 0.5
    sep = np.full((r.shape[0], 6, 3), [255, 0, 0], np.float32)
    Image.fromarray(np.hstack([lift(r), sep, lift(canvas)]).astype(np.uint8)).save(DEBUG / 'diamond-card__check.png')
    print('diamond-card mean error per zone:', out)
    return out


compose_check({
    'top-rule': (200, 3, 590, 14),
    'bottom-rule': (200, 192, 560, 202),
    'top-right-hook': (588, 4, 612, 26),
    'right-side-top': (590, 18, 630, 82),
    'right-side-bottom': (575, 98, 630, 182),
    'bottom-bevel': (556, 176, 600, 202),
    'top-left-corner': (90, 2, 130, 22),
    'top-left-diamond': (30, 30, 62, 62),
    'right-diamond': (150, 70, 185, 140),
    'bottom-diamond': (60, 150, 135, 200),
    'separator-rule': (189, 126, 433, 131),
    'empty-plate': (440, 90, 540, 100),
})
