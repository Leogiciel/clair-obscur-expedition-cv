"""Extracts the "Available Lumina Points" plaque (dark brushed band, cyan rules and specks) from the Luminas screenshot;
the label, the number and the Lumina glyph are painted over with the band's colour and drawn by the page.
Usage: python3 -I scripts/ui-kit/extract/lumina-points.py  ->  public/ui/tex/lumina-points.webp
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from texlib import *  # noqa: E402,F403

ROOT = Path(__file__).resolve().parents[3]
# The screenshot is 1250 × 703, half the 2510 × 1380 stage.
SRC = ROOT / 'design/luminas-screen.webp'
X0, Y0, X1, Y1 = 680, 545, 890, 627
# Text and glyph boxes in crop px.
TEXT = [(38, 14, 162, 34), (78, 36, 140, 62)]

img = np.asarray(Image.open(SRC).convert('RGB')).astype(np.float32)[Y0:Y1, X0:X1]
h, w = img.shape[:2]
mask = np.zeros((h, w), np.uint8)
for x0, y0, x1, y1 in TEXT:
    mask[y0:y1, x0:x1] = 255
# The band is a flat dark grey there: fill with its colour plus matching grain (inpainting smeared the ornament above).
band = np.zeros((h, w), bool)
band[30:66, 30:175] = True
band &= mask == 0
colour = np.median(img[band], 0)
grain = cv2.GaussianBlur(np.random.default_rng(3).normal(0, 2.0, (h, w)).astype(np.float32), (0, 0), 0.6)[..., None]
soft = cv2.GaussianBlur(mask.astype(np.float32) / 255, (0, 0), 1.5)[..., None]
clean = img * (1 - soft) + (colour + grain) * soft
clean = cv2.resize(clean, (w * 2, h * 2), interpolation=cv2.INTER_CUBIC)
H, W = clean.shape[:2]
# Opaque in the middle, feathered to the stage on every side.
yy, xx = np.mgrid[:H, :W]
edge = np.minimum.reduce([xx / 50, (W - 1 - xx) / 50, yy / 24, (H - 1 - yy) / 24])
alpha = np.clip(edge, 0, 1) * 255
Image.fromarray(np.dstack([np.clip(clean, 0, 255), alpha]).astype(np.uint8), 'RGBA').save(OUT / 'lumina-points.webp', quality=90)
Image.fromarray(np.clip(clean * 2.5, 0, 255).astype(np.uint8)).save(DEBUG / 'lumina-points__x2.5.png')
print(W, H)
