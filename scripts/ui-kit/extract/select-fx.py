"""Extracts the selected-item paint effect: the idle slot (scaled the same) is subtracted frame by frame.
Paint only drifts left (top fringe 13-26 px/s, smear and bottom fringe ~10 px/s, measured by optical flow),
so we output a static base, seamless fringe strips, and a shared smear taken from the Pictos.
Usage: python3 -I scripts/ui-kit/extract/select-fx.py  ->  public/ui/tex/fx-*.webp + SelectFx/measures.json
"""
import json
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from texlib import *  # noqa: E402,F403

ROOT = Path(__file__).resolve().parents[3]
VIDEO = ROOT / 'design/clair_obscure_expedition_33_interface.mov'
FPS = 20
FADE = 40

# crop: capture (x, y, w, h); selected/idle: video spans (s); box: component origin in the capture, effect is relative to it.
# content/diamond: zeroed areas where the component renders its own content; flows: (x0, y0, x1, y1, px/s leftward).
# head/plate: selected diamond centre and plate height in crop px, used to place and scale the shared smear.
# scale: measured selected-item zoom around `center` (1.1 for Pictos and Skills, none for the weapon).
# borrow: the video shows almost no paint on Skills, so they reuse the Pictos effect scaled to their plate.
ELEMENTS = {
    'picto': {'scale': 1.1, 'center': (374, 1066), 'crop': (20, 990, 640, 150), 'selected': (0.85, 1.45), 'idle': (1.72, 2.1), 'box': (118, 1010),
              'content': (176, 44, 640, 108), 'diamond': (152, 76, 33),
              'drop': [(0, 0, 640, 12), (618, 0, 640, 150), (0, 140, 640, 150), (520, 100, 640, 150)],
              'flows': [(150, 10, 630, 42, 23), (120, 104, 520, 134, 8)], 'head': (131.8, 76), 'plate': 124.3, 'size': (512, 113)},
    'weapon': {'scale': 1.0, 'center': (379, 881), 'crop': (20, 790, 660, 170), 'selected': (9.62, 10.3), 'idle': (0.9, 2.2), 'box': (118, 816),
               'content': (140, 53, 660, 126), 'diamond': None,
               'drop': [(0, 0, 660, 30), (470, 126, 660, 170), (290, 128, 360, 170)],
               'flows': [(140, 28, 640, 74, 26), (240, 128, 500, 156, 9)], 'head': (140, 91), 'plate': 130, 'size': (522, 130)},
    'skill': {'scale': 1.1, 'center': (1453, 1228), 'crop': (1180, 1170, 500, 110), 'box': (1250, 1188.5),
              'head': (89.3, 58), 'plate': 88, 'size': (406, 80), 'borrow': 'picto'},
}
# Shared smear area in the Pictos crop (stops above the next row, which starts at y 131).
SMEAR = (8, 8, 150, 128)
# Measured leftward speed (px/s) and lifetime of one copy (s).
SMEAR_SPEED, SMEAR_LIFE = 10, 3


def grab(t0, t1, crop):
    x, y, w, h = crop
    raw = subprocess.run(
        ['ffmpeg', '-nostdin', '-v', 'error', '-ss', str(t0), '-t', str(t1 - t0), '-i', str(VIDEO),
         '-vf', f'fps={FPS},crop={w}:{h}:{x}:{y}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
        check=True, capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, h, w, 3).astype(np.float32)


def write(img, name, level=60):
    # Luminance alpha keeps black transparent after compression; normal blend over dark matches the additive original.
    a = np.clip(img.max(2) / level, 0, 1)
    rgb = np.where(a[..., None] > 0, img / np.maximum(a[..., None], 1e-3), 0)
    rgba = np.dstack([np.clip(rgb, 0, 255), a * 255]).astype(np.uint8)
    Image.fromarray(rgba, 'RGBA').save(OUT / f'{name}.webp', quality=88, alpha_quality=90, method=6)


def seamless(strip):
    fade = min(FADE, strip.shape[1] // 3)
    tile_w = strip.shape[1] - fade
    ramp = np.linspace(0, 1, fade, dtype=np.float32)[None, :, None]
    tile = strip[:, :tile_w].copy()
    tile[:, :fade] = strip[:, tile_w:] * (1 - ramp) + strip[:, :fade] * ramp
    return tile


def envelope(img, fx_=12, fy_=3):
    h, w = img.shape[:2]
    env = cv2.GaussianBlur(np.clip(img.max(2) / 60, 0, 1), (0, 0), sigmaX=10, sigmaY=3)
    env = np.clip(env / max(np.percentile(env, 95), 1e-3), 0, 1)
    win = np.minimum.outer(np.minimum(np.arange(h), np.arange(h)[::-1]) / fy_,
                           np.minimum(np.arange(w), np.arange(w)[::-1]) / fx_)
    return env * np.clip(win, 0, 1)


def write_mask(env, name):
    mask = np.dstack([np.full(env.shape + (3,), 255, np.float32), env * 255]).astype(np.uint8)
    Image.fromarray(mask, 'RGBA').save(OUT / f'{name}.webp', quality=90, method=6)


def extract(name, e):
    sel = grab(*e['selected'], e['crop'])
    idle = np.median(grab(*e['idle'], e['crop']), axis=0)
    sel_med = np.median(sel, axis=0)
    sc = e['scale']
    px, py = e['center'][0] - e['crop'][0], e['center'][1] - e['crop'][1]
    M = np.float32([[sc, 0, px * (1 - sc)], [0, sc, py * (1 - sc)]])
    base = cv2.warpAffine(idle, M, (idle.shape[1], idle.shape[0]), flags=cv2.INTER_LINEAR, borderValue=0)
    fx = np.clip(sel - base[None], 0, 255)
    fx = np.where(fx.max(3, keepdims=True) > 6, fx, 0)
    # Keep what is present in at least a quarter of frames: paint stays, the moving character passes.
    presence = (fx.max(3) > 6).mean(0)
    fx *= np.clip((presence - 0.25) / 0.25, 0, 1)[None, ..., None]
    n, h, w = fx.shape[:3]
    content = rect((h, w), *e['content'])
    if e['diamond']:
        content |= diamond((h, w), *e['diamond'])
    content = cv2.warpAffine(content.astype(np.uint8), M, (w, h), flags=cv2.INTER_NEAREST).astype(bool)
    keep = ~content
    for z in e['drop']:
        keep &= ~rect((h, w), *z)
    # Coloured pixels are icons, never the grey paint.
    fx *= (np.ptp(sel, axis=3, keepdims=True) < 45)
    keep = cv2.GaussianBlur(keep.astype(np.float32), (0, 0), 2)
    fx *= keep[None, ..., None]
    med = np.median(fx, axis=0)
    # Sharpest frame for strips: the median smears the flecks.
    sharp = fx[np.argmax(fx.max(3).sum((1, 2)))]
    under = np.zeros((h, w), np.float32)
    flows = []
    for i, (x0, y0, x1, y1, speed) in enumerate(e['flows']):
        tile = seamless(sharp[y0:y1, x0:x1])
        env = envelope(med[y0:y1, x0:x1])
        under[y0:y1, x0:x1] = np.maximum(under[y0:y1, x0:x1], env)
        write(tile, f'fx-{name}-flow-{i}')
        write_mask(env, f'fx-{name}-mask-{i}')
        flows.append({'left': x0, 'top': y0, 'width': x1 - x0, 'height': y1 - y0, 'tile': tile.shape[1], 'speed': speed})
    if name == 'picto':
        # Raw pixels, not the difference with idle, which loses the dry-brush fibres.
        x0, y0, x1, y1 = SMEAR
        gray = sel[:, y0:y1, x0:x1].max(3)
        # Skip the first frames: the zoom is still animating.
        best = 4 + int(np.argmax([cv2.Laplacian(g, cv2.CV_32F).var() for g in gray[4:]]))
        smear = np.clip(sel[best, y0:y1, x0:x1] - 8, 0, 255)
        cx, cy, r = e['diamond']
        hole = diamond((h, w), *e['head'], r * sc + 10)[y0:y1, x0:x1]
        smear *= 1 - cv2.GaussianBlur(hole.astype(np.float32), (0, 0), 2)[..., None]
        write(smear, 'fx-smear', 45)
        sh, sw = smear.shape[:2]
        fade_x = np.clip(np.arange(sw) / 40, 0, 1)[None, :]
        fade_y = np.clip(np.minimum(np.arange(sh), np.arange(sh)[::-1]) / 10, 0, 1)[:, None]
        write_mask((fade_x * fade_y).astype(np.float32), 'fx-smear-mask')
    # The shared smear replaces this crop's own smear left of the head.
    hx = e['head'][0]
    under = np.maximum(under, np.clip((hx + 10 - np.arange(w, dtype=np.float32)) / 24, 0, 1)[None, :] / 0.7)
    write(med * np.clip(1 - 0.7 * under[..., None], 0, 1), f'fx-{name}')
    Image.fromarray(np.clip(sel_med, 0, 255).astype(np.uint8)).save(DEBUG / f'fx-{name}__selected.png')
    Image.fromarray(np.clip(fx[n // 2] * 2, 0, 255).astype(np.uint8)).save(DEBUG / f'fx-{name}__frame.png')
    return {
        'asset': name, 'width': w, 'height': h,
        'left': e['crop'][0] - e['box'][0], 'top': e['crop'][1] - e['box'][1],
        'flows': flows,
    }


def plate_rect(e):
    w, h = e['size'][0] * e['scale'], e['size'][1] * e['scale']
    return e['center'][0] - e['crop'][0] - w / 2, e['center'][1] - e['crop'][1] - h / 2, w, h


def borrowed(e):
    """Maps another element's effect plate onto this plate; strip tiles scale with height to keep proportions."""
    src = ELEMENTS[e['borrow']]
    m = measures[e['borrow']]
    px, py, pw, ph = plate_rect(src)
    tx, ty, tw, th = plate_rect(e)
    sx, sy = tw / pw, th / ph
    zx, zy = tx - px * sx, ty - py * sy
    return {
        'asset': e['borrow'],
        'width': round(m['width'] * sx, 1), 'height': round(m['height'] * sy, 1),
        'left': round(zx + e['crop'][0] - e['box'][0], 1), 'top': round(zy + e['crop'][1] - e['box'][1], 1),
        'flows': [{'left': round(f['left'] * sx, 1), 'top': round(f['top'] * sy, 1),
                   'width': round(f['width'] * sx, 1), 'height': round(f['height'] * sy, 1),
                   'tile': round(f['tile'] * sy, 1), 'speed': round(f['speed'] * sx, 1)} for f in m['flows']],
    }


measures = {}
for name, e in ELEMENTS.items():
    if 'borrow' in e:
        measures[name] = borrowed(e)
    else:
        measures[name] = extract(name, e)
    k = e['plate'] / ELEMENTS['picto']['plate']
    px0, py0 = ELEMENTS['picto']['head']
    x0, y0, x1, y1 = SMEAR
    hx, hy = e['head']
    measures[name]['smear'] = {
        'left': round(hx + (x0 - px0) * k + e['crop'][0] - e['box'][0], 1),
        'top': round(hy + (y0 - py0) * k + e['crop'][1] - e['box'][1], 1),
        'width': round((x1 - x0) * k, 1), 'height': round((y1 - y0) * k, 1),
        'drift': round(SMEAR_SPEED * SMEAR_LIFE * k, 1), 'life': SMEAR_LIFE,
    }
    # Zoom origin relative to the box.
    measures[name]['origin'] = [e['center'][0] - e['box'][0], e['center'][1] - e['box'][1]]
    print(name, measures[name])

(ROOT / 'app/components/ui-kit/SelectFx/measures.json').write_text(json.dumps(measures, indent=2) + '\n')
