"""Generates photographic rose petal sprites for the falling petals: three isolated petals on black, cut out by a
background-removal model and split into separate files.
Usage: python3 -I scripts/character/petals.py [--grade]  ->  public/ui/petals/petal-<n>[-back|-front].webp
--grade only rebuilds the graded variants from the existing sprites.
"""
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
from fal import ROOT, data_uri, run  # noqa: E402

WORK = ROOT / 'design/character/petals'
OUT = ROOT / 'public/ui/petals'
PROMPT = (
    'Studio macro photograph of three separate single deep red rose petals lying apart on a pure black background, '
    'top view, each petal fully visible and not touching the others: soft velvety texture, slightly curled and cupped '
    'edges, darker crimson at the narrow pale base, lighter red at the broad rounded tip, fine veins, soft light from '
    'the upper left. No stem, no flower, no water drops, no text.')



def grade():
    """Bakes the scene grade into each sprite so no CSS filter runs on the moving petals. Petals stay opaque (see-through
    petals read wrong over the character); they are made discreet by colour instead: a muted, dark oxblood for the
    front layer, darker still and out of focus for the back layer."""
    from PIL import ImageEnhance, ImageFilter
    for n in range(3):
        src = Image.open(OUT / f'petal-{n}.webp').convert('RGBA')
        front = ImageEnhance.Brightness(ImageEnhance.Color(src).enhance(0.45)).enhance(0.6)
        front.save(OUT / f'petal-{n}-front.webp', quality=88)
        back = ImageEnhance.Brightness(ImageEnhance.Color(src).enhance(0.45)).enhance(0.4)
        pad = Image.new('RGBA', (back.width + 16, back.height + 16), (0, 0, 0, 0))
        pad.paste(back, (8, 8))
        pad = pad.filter(ImageFilter.GaussianBlur(4))
        r, g, b, a = pad.split()
        pad.putalpha(a)
        pad.save(OUT / f'petal-{n}-back.webp', quality=88)


if '--grade' in sys.argv:
    grade()
    sys.exit()

work = WORK
work.mkdir(parents=True, exist_ok=True)
sheet = run('fal-ai/flux-2-pro', {'prompt': PROMPT, 'image_size': {'width': 1536, 'height': 768}, 'output_format': 'png'}, work, 'sheet')[0]
src = work / 'sheet.jpg'
Image.open(sheet).convert('RGB').save(src, quality=95)
cut = run('fal-ai/bria/background/remove', {'image_url': data_uri(src)}, work, 'cut')[0]

rgba = np.asarray(Image.open(cut).convert('RGBA'))
alpha = (rgba[..., 3] > 40).astype(np.uint8)
count, labels, stats, _ = cv2.connectedComponentsWithStats(alpha)
order = sorted(range(1, count), key=lambda i: -stats[i, cv2.CC_STAT_AREA])[:3]
OUT.mkdir(parents=True, exist_ok=True)
for n, i in enumerate(sorted(order, key=lambda i: stats[i, cv2.CC_STAT_LEFT])):
    x, y, w, h = stats[i, :4]
    piece = rgba[y:y + h, x:x + w].copy()
    piece[..., 3] = np.where(labels[y:y + h, x:x + w] == i, piece[..., 3], 0)
    img = Image.fromarray(piece, 'RGBA')
    img.thumbnail((160, 160), Image.LANCZOS)
    img.save(OUT / f'petal-{n}.webp', quality=88)
    print(n, img.size)
grade()
