"""Widens the Pictos close-up to the game framing: pasted at half size on a 16:9 canvas, its head is ≈ 31 % of the
height with the nose at 58 % of the width, and an edit model paints the back and shoulders around it.
(Prompt-less outpainting raised his arm into a punch, so the body is described.)
Usage: python3 -I scripts/character/pictos_expand.py [model,...] [count]  ->  design/character/outfit/pictos-wide-<model>[-n].png
"""
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from fal import ROOT, data_uri, run  # noqa: E402
from PIL import Image  # noqa: E402

OUT = ROOT / 'design/character/outfit'
SOURCE = ROOT / 'design/character/final/pictos.png'
# Close-up (1920 × 1080): head from y 15 to ≈ 700, nose tip at x 865.
NOSE_X = 865
SCALE = 0.5

PROMPT = (
    'The first image is the exact layout: keep his head exactly as it is, same position, same size, same profile, '
    'same face and hair. Complete the rest of the picture around it: his back and shoulders in the long dark coat '
    'continue down to the bottom edge, the grey scarf around his neck, the leather strap across his back, the gold '
    'embroidered shoulder. His arms hang down relaxed; the near shoulder and upper arm sit in the dark lower left '
    'foreground, never raised. The rest of the frame is a near-black background with a faint vignette. Same warm key '
    'light on his profile and cold rim light on his back. The second image shows the same man and outfit from the '
    'front. Photorealistic cinematic Unreal Engine 5 render. No text, no weapon. Never mirror the image.')

MODELS = {
    'seedream': ('bytedance/seedream/v5/pro/edit', lambda images, count: {
        'prompt': PROMPT, 'image_urls': images, 'image_size': {'width': 1920, 'height': 1080},
        'output_format': 'png', 'num_images': count}),
    'nanobanana': ('google/nano-banana-2.1/edit', lambda images, count: {
        'prompt': PROMPT, 'image_urls': images, 'aspect_ratio': '16:9', 'resolution': '2K', 'output_format': 'png',
        'num_images': count}),
}


def layout():
    closeup = Image.open(SOURCE).convert('RGB')
    closeup = closeup.resize((round(closeup.width * SCALE), round(closeup.height * SCALE)), Image.LANCZOS)
    canvas = Image.new('RGB', (1920, 1080), (8, 9, 11))
    canvas.paste(closeup, (round(0.58 * 1920 - NOSE_X * SCALE), 0))
    dest = OUT / 'pictos-layout.jpg'
    canvas.save(dest, quality=95)
    return data_uri(dest)


def front():
    dest = OUT / 'pictos-front.jpg'
    img = Image.open(ROOT / 'design/character/final/overview.png').convert('RGB')
    img.thumbnail((1080, 1080), Image.LANCZOS)
    img.save(dest, quality=95)
    return data_uri(dest)


args = sys.argv[1:] + [''] * 2
models = args[0].split(',') if args[0] else list(MODELS)
count = int(args[1] or 1)
images = [layout(), front()]
with ThreadPoolExecutor(len(models)) as pool:
    for files in pool.map(lambda m: run(MODELS[m][0], MODELS[m][1](images, count), OUT, f'pictos-wide-{m}'), models):
        print(*files)
