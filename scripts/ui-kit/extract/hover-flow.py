"""Extracts two seamless paint-fleck strips above a hovered row (video at ~16 s) for PaintFlow, plus the left splash.
Usage: python3 -I scripts/ui-kit/extract/hover-flow.py
"""
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from texlib import *  # noqa: E402,F403

ROOT = Path(__file__).resolve().parents[3]
VIDEO = ROOT / 'design/clair_obscure_expedition_33_interface.mov'
# Capture px: strip above the top rule, between the left splash and the chevron.
X0, Y0, W, H = 530, 456, 330, 14
FADE = 48


def grab(t):
    raw = subprocess.run(
        ['ffmpeg', '-nostdin', '-v', 'error', '-ss', str(t), '-i', str(VIDEO), '-frames:v', '1',
         '-vf', f'crop={W}:{H}:{X0}:{Y0}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
        check=True, capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(H, W, 3).astype(np.float32)


def seamless(img):
    w = img.shape[1] - FADE
    out = img[:, :w].copy()
    ramp = np.linspace(0, 1, FADE, dtype=np.float32)[None, :, None]
    out[:, :FADE] = img[:, w:] * (1 - ramp) + img[:, :FADE] * ramp
    return out


for name, t in (('hover-flow-a', 16.2), ('hover-flow-b', 16.65)):
    img = seamless(grab(t))
    # Low threshold drops video noise on the black background.
    L = img.max(2)
    img = img * np.clip((L[..., None] - 10) / 30, 0, 1)
    # Opaque from 70/255 so flecks stay bright over both plate and scenery.
    save(img, name, 70)

# Left splash from plate-hover (extract-borders.py), faded right so it slides under any row's diamond.
hover = np.asarray(Image.open(OUT / 'plate-hover.webp').convert('RGBA')).astype(np.float32)
SPLASH_W, SPLASH_FADE = 52, 16
splash = hover[:, :SPLASH_W].copy()
splash[:, SPLASH_W - SPLASH_FADE:, 3] *= np.linspace(1, 0, SPLASH_FADE, dtype=np.float32)[None, :]
Image.fromarray(splash.astype(np.uint8), 'RGBA').save(OUT / 'hover-splash.webp', quality=92, method=6)
print('hover-splash', SPLASH_W, 'x', splash.shape[0])
