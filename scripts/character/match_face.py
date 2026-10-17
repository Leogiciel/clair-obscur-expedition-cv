"""Re-renders the role still's face from the validated overview head, so both screens show the same man.
Usage: python3 -I scripts/character/match_face.py [model,...] [count] [tag]  ->  design/character/outfit/role-face-<model><tag>[-n].png
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from fal import ROOT, data_uri, run  # noqa: E402
from concurrent.futures import ThreadPoolExecutor  # noqa: E402
from PIL import Image, ImageDraw, ImageFilter  # noqa: E402

DESIGN = ROOT / 'design'
OUT = DESIGN / 'character/outfit'
BASE = OUT / 'role-1.png'
# Head of the overview still (1080 × 1920), the face the role shot must match.
HEAD = (OUT / 'overview.png', (230, 120, 650, 600))
FACES = [DESIGN / 'character/likeness/face-identity-front.jpg', DESIGN / 'character/likeness/face-identity-three-quarter.jpg']

PROMPT = (
    'Image 1 is the base image. Replace only his face and hair so that he is exactly the man of image 2, seen at the '
    'three-quarter angle of image 1: same face shape and width, same eyes, eyebrows, nose, lips, jaw, skin tone, '
    'mole and haircut as image 2; the last images are photos of the same man. His hair, as in image 2: soft volume '
    'on top swept to one side with a few strands toward the forehead, sides short but not shaved, no visible skin '
    'fade or undercut line. His face is as full and wide as in image 2, not slimmer. Keep the head angle, head size, '
    'position and gaze of image 1, and keep everything else in image 1 exactly: outfit, scarf, hands, rapier, cyan '
    'ribbons, lighting, colour grade, framing and background. Photorealistic cinematic Unreal Engine 5 render. '
    'Never mirror the image.')


def jpeg(path, name, box=None, size=(1920, 1920)):
    dest = OUT / f'{name}.jpg'
    img = Image.open(path).convert('RGB')
    img = img.crop(box) if box else img
    img.thumbnail(size, Image.LANCZOS)
    img.save(dest, quality=95)
    return data_uri(dest)


# Head area of the role still (1920 × 1080) that the masked model may repaint.
HEAD_BOX = (930, 20, 1270, 400)


def mask():
    """OpenAI-style mask: transparent where the model may paint (the head, feathered), opaque elsewhere."""
    dest = OUT / 'role-head-mask.png'
    alpha = Image.new('L', (1920, 1080), 255)
    hole = Image.new('L', (1920, 1080), 0)
    ImageDraw.Draw(hole).ellipse(HEAD_BOX, fill=255)
    alpha.paste(0, mask=hole.filter(ImageFilter.GaussianBlur(12)))
    Image.merge('RGBA', (*Image.new('RGB', (1920, 1080), (0, 0, 0)).split(), alpha)).save(dest)
    return data_uri(dest)


MODELS = {
    'seedream': ('bytedance/seedream/v5/pro/edit', lambda images, count: {
        'prompt': PROMPT, 'image_urls': images, 'image_size': {'width': 1920, 'height': 1080},
        'output_format': 'png', 'num_images': count}),
    'nanobanana': ('google/nano-banana-2.1/edit', lambda images, count: {
        'prompt': PROMPT, 'image_urls': images, 'aspect_ratio': '16:9', 'resolution': '2K', 'output_format': 'png',
        'num_images': count}),
    'flux': ('blackforestlabs/flux-3/edit-image', lambda images, count: {
        'prompt': PROMPT, 'image_urls': images, 'aspect_ratio': '16:9', 'resolution': '2k', 'output_format': 'png'}),
    'gpt': ('openai/gpt-image-2/edit', lambda images, count: {
        'prompt': PROMPT, 'image_urls': images, 'mask_url': mask(), 'quality': 'high', 'output_format': 'png',
        'num_images': count}),
}

# Usage: match_face.py [model,...] [count] [tag]
args = sys.argv[1:] + [''] * 3
models = args[0].split(',') if args[0] else ['seedream']
count = int(args[1] or 1)
images = [jpeg(BASE, 'base-role-face'), jpeg(*HEAD[:1], 'overview-head', HEAD[1])] + [jpeg(p, f'ref-{p.stem}') for p in FACES]
with ThreadPoolExecutor(len(models)) as pool:
    runs = pool.map(lambda m: run(MODELS[m][0], MODELS[m][1](images, count), OUT, f'role-face-{m}{args[2]}'), models)
    for files in runs:
        print(*files)
