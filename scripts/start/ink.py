"""Generates the start screen's ink plume from a text prompt alone (no game capture as input), then encodes it for the
page. Usage: python3 -I scripts/start/ink.py [generate]  ->  design/start/ink-seedream.png, public/ui/start-ink.webp
Without `generate`, only the encoding runs, on the image already in design/start.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'character'))
from fal import ROOT, run  # noqa: E402
import numpy as np  # noqa: E402
from PIL import Image, ImageFilter  # noqa: E402

OUT = ROOT / 'design/start'
DEST = ROOT / 'public/ui/start-ink.webp'
PROMPT = (
    'A single plume of dark grey ink swirling slowly in black water, seen in macro. The plume rises diagonally from '
    'the lower left of the frame toward the upper middle and curls back on itself, with glossy liquid folds, '
    'marbled streaks and soft silver highlights catching the edges of the ridges, deep black cores between the '
    'folds. It fills the left half of the frame; the right half is pure black. Very low key, monochrome, no colour, '
    'no particles, no bubbles, no text. Cinematic, photographic, high detail.'
)
MODEL = 'bytedance/seedream/v5/pro/text-to-image'

if 'generate' in sys.argv[1:]:
    files = run(MODEL, {'prompt': PROMPT, 'image_size': {'width': 2560, 'height': 1440}, 'num_images': 1,
                        'output_format': 'png'}, OUT, 'ink-seedream', poll=5)
    print(*files)

W, H = 2510, 1380
# Placement on the stage, read on the game's smoke: the plume runs from above the title's left half down past the left
# of the number. Baked into the image, as its blur and mask are, so the page draws it without any CSS filter (a
# blurred, masked layer under the animated petals halved the frame rate).
SIZE = (2510, 1500)
OFFSET = (-120, -120)
BLUR = 3
LEVEL = 0.4


def ramp(v, a, b):
    return np.clip((v - a) / (b - a), 0, 1)


src = next(OUT.glob('ink-seedream.*'))
ink = Image.open(src).convert('L').resize(SIZE, Image.LANCZOS)
stage = Image.new('L', (W, H), 0)
stage.paste(ink, OFFSET)
a = np.asarray(stage.filter(ImageFilter.GaussianBlur(BLUR))).astype(np.float32)
y, x = np.mgrid[0:H, 0:W].astype(np.float32)
# A diagonal band (CSS linear-gradient at 118°: clear, then full from 32 % to 46 % of the line, then clear)...
angle = np.radians(118)
length = abs(W * np.sin(angle)) + abs(H * np.cos(angle))
t = ((x - W / 2) * np.sin(angle) - (y - H / 2) * np.cos(angle)) / length + 0.5
band = ramp(t, 0.18, 0.32) * (1 - ramp(t, 0.46, 0.60))
# ...within an ellipse round the plume, so the right of the screen stays black.
r = np.hypot((x - 800) / 760, (y - 600) / 620)
ellipse = 1 - ramp(r, 0.4, 1)
out = np.clip(a * band * ellipse * LEVEL, 0, 255).astype(np.uint8)
Image.fromarray(out).save(DEST, quality=82)
print(DEST, DEST.stat().st_size // 1024, 'KB')
