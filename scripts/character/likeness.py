"""Replaces the head of each master still with the owner's face, from head crops of the identity photos.
Usage: python3 -I scripts/character/likeness.py [shot,...] [model,...] [tag]  ->  design/character/likeness/<shot>-<model><tag>.png
"""
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from fal import ROOT, data_uri, run  # noqa: E402
from PIL import Image  # noqa: E402

DESIGN = ROOT / 'design'
OUT = DESIGN / 'character/likeness'
# Head crops (x0, y0, x1, y1) of the 1369 × 2048 photos: the hand under the chin, red backdrop and beige t-shirt
# are kept out as much as possible so the models only take the face.
PHOTOS = {
    'identity-front.JPG': (400, 80, 1200, 1000),
    'identity-three-quarter.JPG': (430, 100, 1369, 1000),
    'identity-full-body.JPG': (560, 180, 930, 600),
}
BASES = {
    'overview': ('9:16', DESIGN / 'character/stills/overview-seedream.png'),
    'role': ('16:9', DESIGN / 'character/stills/v1/role-nanobanana.png'),
}

PROMPT = (
    'Image 1 is the base image. Replace only the head and face of the man in image 1 with the person shown in the '
    'other images: same facial features, eye shape, eyebrows, nose, lips, jawline and face shape, and the small mole '
    'on his right cheek. He is clean-shaven: no goatee, no beard, no stubble. Keep his short black hair, slightly '
    'grown-out and tousled, with no sharp fade line. Keep everything else in image 1 exactly: framing, position, head '
    'size and angle, gaze direction, expression, outfit, hands, weapon, lighting, colour grade and background. Light '
    'the new face like image 1 (warm key light from the left, cold rim light, low key, desaturated); do not copy the '
    'red background, the beige t-shirt or the hand from the photos. Never mirror the image.')

SIZES = {'9:16': {'width': 1080, 'height': 1920}, '16:9': {'width': 1920, 'height': 1080}}
MODELS = {
    'nanobanana': ('google/nano-banana-2.1/edit', lambda refs, aspect: {
        'prompt': PROMPT, 'image_urls': refs, 'aspect_ratio': aspect, 'resolution': '2K', 'output_format': 'png'}),
    'seedream': ('bytedance/seedream/v5/pro/edit', lambda refs, aspect: {
        'prompt': PROMPT, 'image_urls': refs, 'image_size': SIZES[aspect], 'output_format': 'png'}),
}


# Head of the validated role still: the overview must share its haircut. (x0, y0, x1, y1) in 1920 × 1080 px.
HAIR_REF = (DESIGN / 'character/likeness/role-seedream.png', (900, 40, 1300, 470))
MATCH = (' The last image shows the same man in another shot: give him exactly the same haircut, hair length and '
         'hairline. Keep the face width and proportions of the photos exactly; do not make the face narrower.')


def hair_ref():
    path, box = HAIR_REF
    dest = OUT / 'hair-ref.jpg'
    Image.open(path).convert('RGB').crop(box).save(dest, quality=92)
    return dest


def crops():
    OUT.mkdir(parents=True, exist_ok=True)
    paths = []
    for name, box in PHOTOS.items():
        dest = OUT / f'face-{Path(name).stem}.jpg'
        Image.open(DESIGN / name).crop(box).save(dest, quality=92)
        paths.append(dest)
    return paths


def base(shot):
    """JPEG at the final clip size: multi-megabyte PNG data URIs get the request dropped."""
    aspect, path = BASES[shot]
    dest = OUT / f'base-{shot}.jpg'
    size = SIZES[aspect]
    Image.open(path).convert('RGB').resize((size['width'], size['height']), Image.LANCZOS).save(dest, quality=95)
    return dest


def main(shots, models, tag, count=1):
    faces = [data_uri(p) for p in crops()]
    hair = [data_uri(hair_ref())] if tag.startswith('-match') else []
    jobs = [(shot, label) for shot in shots for label in models]

    def go(job):
        shot, label = job
        model, build = MODELS[label]
        args = build([data_uri(base(shot))] + faces + hair, BASES[shot][0])
        if hair:
            args['prompt'] += MATCH
        args['num_images'] = count
        return run(model, args, OUT, f'{shot}-{label}{tag}')

    with ThreadPoolExecutor(len(jobs)) as pool:
        for files in pool.map(go, jobs):
            print(*files)


# A tag starting with -match adds the role head as a haircut reference; a 4th argument sets the number of variants.
args = sys.argv[1:] + [''] * 4
main(args[0].split(',') if args[0] else list(BASES), args[1].split(',') if args[1] else list(MODELS), args[2],
     int(args[3] or 1))
