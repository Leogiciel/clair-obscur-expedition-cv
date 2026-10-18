"""Silhouette mattes of each screen's character, so petals behind him are hidden by his body only (the clip's box is
opaque). The cut-out comes from a background-removal model (the stills' lit backdrops defeat a threshold).
Usage: python3 -I scripts/character/mattes.py [shot ...]  ->  public/ui/character/<shot>-matte.webp
"""
import json
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
from fal import ROOT, data_uri, run  # noqa: E402

FRAMING = json.loads((ROOT / 'app/assets/character/framing.json').read_text())
STILLS = ROOT / 'design/character/final'
CUTS = ROOT / 'design/character/mattes'
OUT = ROOT / 'public/ui/character'
# Mattes are small: petals only need the outline, softened.
SCALE = 0.25


def matte(shot):
    f = FRAMING[shot]
    src = CUTS / f'{shot}-src.jpg'
    CUTS.mkdir(parents=True, exist_ok=True)
    Image.open(STILLS / f'{shot}.png').convert('RGB').resize((f['width'], f['height'])).save(src, quality=92)
    cut = run('fal-ai/bria/background/remove', {'image_url': data_uri(src)}, CUTS, shot)[0]
    alpha = np.asarray(Image.open(cut).convert('RGBA'))[..., 3].astype(np.float32) / 255
    small = cv2.resize(alpha, (round(f['width'] * SCALE), round(f['height'] * SCALE)), interpolation=cv2.INTER_AREA)
    small = cv2.GaussianBlur(small, (0, 0), 1.2)
    OUT.mkdir(parents=True, exist_ok=True)
    rgba = np.dstack([np.zeros(small.shape + (3,)), small * 255]).astype(np.uint8)
    Image.fromarray(rgba, 'RGBA').save(OUT / f'{shot}-matte.webp', quality=80)
    return shot, f'{small.mean():.0%}'


shots = sys.argv[1:] or list(FRAMING)
with ThreadPoolExecutor(len(shots)) as pool:
    for result in pool.map(matte, shots):
        print(*result)
