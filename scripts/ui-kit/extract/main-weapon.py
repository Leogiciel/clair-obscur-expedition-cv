"""Extracts the main screen equipped weapon plate. The 5th percentile over main screen video frames removes
moving scenery; spear and text are erased (TextureMainWeapon renders them). Coordinates are capture px.
Usage: python3 -I scripts/ui-kit/extract/main-weapon.py design/frames  ->  public/ui/tex/main-weapon.webp
"""
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from texlib import *  # noqa: E402,F403

ROOT = Path(__file__).resolve().parents[3]
VIDEO = ROOT / 'design/clair_obscure_expedition_33_interface.mov'
# Starts below the "Weapon" title (letters end at y = 810).
X0, Y0, X1, Y1 = 118, 816, 640, 946
W, H = X1 - X0, Y1 - Y0
# Main screen spans in the video: (start, duration) in s.
SPANS = [(0.9, 1.3), (10.5, 0.8)]


def grab(ss, t, fps=24):
    raw = subprocess.run(
        ['ffmpeg', '-nostdin', '-v', 'error', '-ss', str(ss), '-t', str(t), '-i', str(VIDEO),
         '-vf', f'fps={fps},crop={W}:{H}:{X0}:{Y0}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
        check=True, capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3).astype(np.float32)


def line_mask(shape, p0, p1, width):
    m = np.zeros(shape[:2], np.uint8)
    cv2.line(m, tuple(int(v) for v in p0), tuple(int(v) for v in p1), 1, width, cv2.LINE_AA)
    return m.astype(bool)


def norm_fill(img, hole, sx, sy, seed):
    """Anisotropic normalized convolution: sx > sy carries horizontal rules and brush strokes across the hole."""
    valid = 1 - hole.astype(np.float32)
    num = cv2.GaussianBlur(img * valid[..., None], (0, 0), sigmaX=sx, sigmaY=sy)
    den = cv2.GaussianBlur(valid, (0, 0), sigmaX=sx, sigmaY=sy)[..., None]
    near = num / np.maximum(den, 1e-3)
    # Fallback where the whole row is masked (zero denominator): wider isotropic mean.
    num2 = cv2.GaussianBlur(img * valid[..., None], (0, 0), 6)
    den2 = cv2.GaussianBlur(valid, (0, 0), 6)[..., None]
    t = np.clip(den / 0.15, 0, 1)
    near = near * t + num2 / np.maximum(den2, 1e-3) * (1 - t)
    rng = np.random.default_rng(seed)
    fib = cv2.GaussianBlur(rng.normal(0, 2.0, img.shape[:2]).astype(np.float32), (0, 0), sigmaX=5, sigmaY=0.7)[..., None]
    w = cv2.GaussianBlur(hole.astype(np.float32), (0, 0), 0.8)[..., None]
    return img * (1 - w) + (near + fib) * w


def repaint_in(img, words, excl, **kw):
    """repaint_flat limited to `words`; `excl` is only excluded from the mean."""
    rep = repaint_flat(img, words, excl, **kw)
    w = cv2.GaussianBlur(cv2.dilate(words.astype(np.uint8), np.ones((3, 3), np.uint8)).astype(np.float32), (0, 0), 1.5)[..., None]
    return img * (1 - w) + rep * w


stack = np.concatenate([grab(s, t) for s, t in SPANS])
img = np.percentile(stack, 5, axis=0)
sh = img.shape
R = lambda a, b, c, d: rect(sh, a - X0, b - Y0, c - X0, d - Y0)
P = lambda x, y: (x - X0, y - Y0)
yy, xx = np.mgrid[Y0:Y1, X0:X1]

# Spear: shaft (267, 834) -> (182, 927), square guard and teal grip.
L = img.max(2)
loc = L - cv2.medianBlur(np.clip(L, 0, 255).astype(np.uint8), 15)
band = line_mask(sh, P(268, 832), P(181, 929), 11) | R(198, 888, 216, 911) | R(208, 894, 235, 915)
cyan = (img[..., 1] - img[..., 0] > 6) & R(200, 890, 240, 918)
spear = band & ((loc > 6) | cyan)
spear |= line_mask(sh, P(268, 832), P(181, 929), 5) | R(199, 889, 215, 910) | R(208, 894, 234, 914)
spear = cv2.dilate(spear.astype(np.uint8), np.ones((3, 3), np.uint8), iterations=1).astype(bool)
img = norm_fill(img, spear, sx=5, sy=1.2, seed=21)

# Text: fill letters from the same row only; an isotropic mean would pull the bottom rule into the "2".
words = R(292, 868, 434, 905) | R(517, 847, 585, 870) | R(533, 874, 563, 923)
L = img.max(2)
base = cv2.medianBlur(np.clip(L, 0, 255).astype(np.uint8), 21).astype(np.float32)
txt = words & (L > base + 5)
txt = cv2.dilate(txt.astype(np.uint8), np.ones((3, 3), np.uint8), iterations=2).astype(bool) & words
img = norm_fill(img, txt, sx=9, sy=0.8, seed=5)
# Cut the arm: below the bottom rule on the right, and past the bevelled tip edge (597, 880) -> (625, 927).
L = img.max(2)
arm = ((xx >= 480) & (yy >= 934)) | ((yy >= 870) & (xx > 597 + (yy - 880) * 0.6 + 7))
sil = (L > 4) & ~arm
sil = cv2.morphologyEx(sil.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8)).astype(bool)
soft = cv2.GaussianBlur(sil.astype(np.float32), (0, 0), 0.7)[..., None]
img = img * soft

save(img, 'main-weapon', 19)
Image.fromarray(np.clip(255 * (np.clip(img, 0, 255) / 255) ** (1 / 2.2), 0, 255).astype(np.uint8)).save(DEBUG / 'main-weapon__gamma.png')

ref = np.asarray(Image.open(ROOT / 'design/frames/t11.png').convert('RGB')).astype(np.float32)[Y0:Y1, X0:X1]
tex = np.asarray(Image.open(OUT / 'main-weapon.webp').convert('RGBA')).astype(np.float32)
comp = tex[..., :3] * tex[..., 3:] / 255
ZONES = {
    'left smudge': (122, 822, 196, 920),
    'top rule': (300, 832, 500, 850),
    'bottom rule': (240, 914, 470, 934),
    'middle flat': (440, 850, 500, 896),
    'right tip': (565, 838, 632, 930),
}
for k, (a, b, c, d) in ZONES.items():
    e = np.abs(ref[b - Y0:d - Y0, a - X0:c - X0].max(2) - comp[b - Y0:d - Y0, a - X0:c - X0].max(2)).mean()
    print(f'{k:14s} mean error {e:.2f}')
g = lambda a: (255 * (np.clip(a, 0, 255) / 255) ** (1 / 2.2)).astype(np.uint8)
Image.fromarray(np.vstack([g(ref), np.full((4, W, 3), [255, 0, 0], np.uint8), g(comp)])).resize((W * 2, (2 * H + 4) * 2), Image.NEAREST).save(DEBUG / 'main-weapon__check.png')
