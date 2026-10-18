"""Extracts the "Skill Points Available" panel (dark plaque, gold brush strokes, thin frame) from the Skill Tree
screenshot; the title, number, Recoat line and reset button are painted over with the plaque colour and drawn by the
page. Usage: python3 -I scripts/ui-kit/extract/skill-points.py  ->  public/ui/tex/skill-points.webp
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from texlib import *  # noqa: E402,F403

ROOT = Path(__file__).resolve().parents[3]
SRC = ROOT / 'design/skill-tree-screen.png'
X0, Y0, X1, Y1 = 1180, 46, 1600, 300
# Text and button boxes in crop px.
TEXT = [(22, 10, 398, 52), (192, 56, 232, 112), (118, 132, 308, 172), (96, 172, 330, 254)]

img = np.asarray(Image.open(SRC).convert('RGB')).astype(np.float32)[Y0:Y1, X0:X1]
h, w = img.shape[:2]
mask = np.zeros((h, w), np.uint8)
for x0, y0, x1, y1 in TEXT:
    mask[y0:y1, x0:x1] = 255
plaque = np.zeros((h, w), bool)
plaque[50:250, 60:360] = True
plaque &= (mask == 0) & (img.max(2) < 40)
colour = np.median(img[plaque], 0)
grain = cv2.GaussianBlur(np.random.default_rng(5).normal(0, 2.0, (h, w)).astype(np.float32), (0, 0), 0.6)[..., None]
soft = cv2.GaussianBlur(mask.astype(np.float32) / 255, (0, 0), 2)[..., None]
clean = img * (1 - soft) + (colour + grain) * soft
clean = cv2.resize(clean, (w * 2, h * 2), interpolation=cv2.INTER_CUBIC)
H, W = clean.shape[:2]
Image.fromarray(np.dstack([np.clip(clean, 0, 255), np.full((H, W), 255)]).astype(np.uint8), 'RGBA').save(OUT / 'skill-points.webp', quality=90)
Image.fromarray(np.clip(clean * 2, 0, 255).astype(np.uint8)).save(DEBUG / 'skill-points__x2.png')
print(W, H)
