"""Generates the Luminas still: the same man and outfit, bust in three-quarter view turned toward the list on the left.
Usage: python3 -I scripts/character/luminas.py [model,...] [count]  ->  design/character/outfit/luminas-<model>[-n].png
"""
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from fal import ROOT, data_uri, run  # noqa: E402
from PIL import Image  # noqa: E402

OUT = ROOT / 'design/character/outfit'
REFS = [ROOT / 'design/character/final/overview.png', ROOT / 'design/character/final/experience.png']

# Framing from the game's Luminas screen (design/luminas-screen.webp): bust, three-quarter view facing the left of the
# image, face at ≈ 68 % of the width, top of the head at ≈ 14 % of the height, chin at ≈ 43 %.
PROMPT = (
    'The same man as in the images: same face, same haircut, same outfit (long dark coat with gold embroidered '
    'shoulder, violet waistcoat, grey scarf, leather strap with brass buckle, gold arm bands). New camera angle, 16:9 '
    'landscape: bust shot from mid-chest up, his body and head in three-quarter view turned toward the left of the '
    'image, calm and thoughtful, looking toward the left. His face is at 68% of the image width; the top of his head '
    'is at 14% of the height and his chin at 43%. The left half of the frame stays dark and empty. Same lighting: warm '
    'key light from the left, cold rim light, low key, desaturated, near-black background. Photorealistic cinematic '
    'Unreal Engine 5 render. No text, no weapon. Never mirror the image.')

MODELS = {
    'seedream': ('bytedance/seedream/v5/pro/edit', lambda images, count: {
        'prompt': PROMPT, 'image_urls': images, 'image_size': {'width': 1920, 'height': 1080},
        'output_format': 'png', 'num_images': count}),
    'nanobanana': ('google/nano-banana-2.1/edit', lambda images, count: {
        'prompt': PROMPT, 'image_urls': images, 'aspect_ratio': '16:9', 'resolution': '2K', 'output_format': 'png',
        'num_images': count}),
}


def jpeg(path):
    dest = OUT / f'ref-luminas-{path.stem}.jpg'
    img = Image.open(path).convert('RGB')
    img.thumbnail((1920, 1920), Image.LANCZOS)
    img.save(dest, quality=95)
    return data_uri(dest)


args = sys.argv[1:] + [''] * 2
models = args[0].split(',') if args[0] else list(MODELS)
count = int(args[1] or 1)
images = [jpeg(p) for p in REFS]
with ThreadPoolExecutor(len(models)) as pool:
    for files in pool.map(lambda m: run(MODELS[m][0], MODELS[m][1](images, count), OUT, f'luminas-{m}'), models):
        print(*files)
