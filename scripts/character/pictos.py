"""Generates the Pictos still: the same man and outfit seen from behind, head turned in profile toward the slots.
Usage: python3 -I scripts/character/pictos.py [model,...] [count]  ->  design/character/outfit/pictos-<model>[-n].png
"""
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from fal import ROOT, data_uri, run  # noqa: E402
from PIL import Image  # noqa: E402

OUT = ROOT / 'design/character/outfit'
REFS = [OUT / 'overview.png', OUT / 'role-face-gpt.png']

# Game framing at 0:13 of the capture: profile with the nose toward the left of the screen,
# whole skull with 0-2 % margin at the top, head ≈ 31 % of the height, nose at 57-59 % and the back of the skull at
# 74-76 % of the width; shoulder and arm in the foreground at the lower left.
PROMPT = (
    'The same man as in the images, same face, same haircut, same outfit (long dark coat with gold embroidered '
    'shoulder, grey scarf, leather strap with brass buckle, gold arm bands). New camera angle, 16:9 landscape: the '
    'camera is behind him, three-quarter back view, close-up from the chest up. His head is turned in profile toward '
    'the left of the image, nose pointing to the left edge, his cheek and jaw visible, eyes looking down to the '
    'left. The top of his head nearly touches the top edge; his head fills about a third of the image height; his '
    'nose is at 58% of the image width and the back of his head at 75%. His back and shoulder fill the lower middle, '
    'and his arm passes in the dark foreground at the lower left. The left 40% and the top left of the frame stay '
    'dark. Same lighting: warm key light from the left on his profile, cold rim light on the back of his head and '
    'shoulder, low key, desaturated, near-black background. Photorealistic cinematic Unreal Engine 5 render. '
    'No text, no weapon.')

MODELS = {
    'seedream': ('bytedance/seedream/v5/pro/edit', lambda images, count: {
        'prompt': PROMPT, 'image_urls': images, 'image_size': {'width': 1920, 'height': 1080},
        'output_format': 'png', 'num_images': count}),
    'nanobanana': ('google/nano-banana-2.1/edit', lambda images, count: {
        'prompt': PROMPT, 'image_urls': images, 'aspect_ratio': '16:9', 'resolution': '2K', 'output_format': 'png',
        'num_images': count}),
}


def jpeg(path):
    dest = OUT / f'ref-pictos-{path.stem}.jpg'
    img = Image.open(path).convert('RGB')
    img.thumbnail((1920, 1920), Image.LANCZOS)
    img.save(dest, quality=95)
    return data_uri(dest)


args = sys.argv[1:] + [''] * 2
models = args[0].split(',') if args[0] else list(MODELS)
count = int(args[1] or 1)
images = [jpeg(p) for p in REFS]
with ThreadPoolExecutor(len(models)) as pool:
    for files in pool.map(lambda m: run(MODELS[m][0], MODELS[m][1](images, count), OUT, f'pictos-{m}'), models):
        print(*files)
