"""Dresses the validated stills in the game's expedition outfit, from a body-only crop of a reference costume, and
moves the role weapon in front of the torso so the stats column no longer hides it.
Usage: python3 -I scripts/character/outfit.py [shot,...] [count] [tag]  ->  design/character/outfit/<shot><tag>.png
"""
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from fal import ROOT, data_uri, run  # noqa: E402
from PIL import Image  # noqa: E402

DESIGN = ROOT / 'design'
OUT = DESIGN / 'character/outfit'
# Neck down only, so the reference character's face never reaches the model.
REFERENCE = (DESIGN / 'outfit_clairobscure.png', (0, 290, 716, 1300))
FACES = [DESIGN / 'character/likeness/face-identity-front.jpg', DESIGN / 'character/likeness/face-identity-three-quarter.jpg']

OUTFIT = (
    'Dress him in the outfit of the second image (only its clothes; that image has no face): a long dark charcoal '
    'coat with light top-stitched seams falling to the knees, his left shoulder covered with gold embroidered '
    'filigree, a dark violet waistcoat under it, a soft grey scarf wrapped around the neck, a leather strap across the '
    'chest closed by a tarnished brass buckle, a belt with a pouch, gold bands around the upper arm, a fingerless '
    'leather glove on one hand and an ornate black-and-gold articulated gauntlet on the other. Replace the current '
    'space-suit collar and jacket entirely. ')
KEEP = (
    'Keep exactly his face, hair, expression, head size, head position and gaze from the first image; the last '
    'images show his face. Keep the framing, lighting, colour grade and dark background of the first image. '
    'Photorealistic cinematic Unreal Engine 5 render. No text, no watermark. Never mirror the image.')

SHOTS = {
    'overview': ((1080, 1920), DESIGN / 'character/likeness/overview-seedream.png', OUTFIT + 'Same pose. ' + KEEP),
    'role': ((1920, 1080), DESIGN / 'character/likeness/role-seedream.png', OUTFIT + (
        'Change the pose of the weapon: his open gloved hand is now held low in front of his waist, slightly to the '
        'left of his body, palm up, and the rapier levitates diagonally in front of his chest, its hilt just above '
        'that palm and its blade rising across his body toward the top right corner of the image, leaving the frame '
        'there; thin cyan glowing ribbons swirl around the blade. Nothing else stands right of his shoulder. ') + KEEP),
}


def jpeg(path, size, name, box=None):
    """JPEG at a bounded size: multi-megabyte PNG data URIs get the request dropped."""
    dest = OUT / f'{name}.jpg'
    img = Image.open(path).convert('RGB')
    img = img.crop(box) if box else img
    img.thumbnail(size, Image.LANCZOS)
    img.save(dest, quality=95)
    return data_uri(dest)


def main(shots, count, tag):
    OUT.mkdir(parents=True, exist_ok=True)
    reference = jpeg(REFERENCE[0], (1024, 1024), 'reference', REFERENCE[1])
    faces = [jpeg(p, (1024, 1024), f'face-{p.stem}') for p in FACES]

    def go(shot):
        size, base, prompt = SHOTS[shot]
        args = {'prompt': prompt, 'image_urls': [jpeg(base, size, f'base-{shot}'), reference] + faces,
                'image_size': {'width': size[0], 'height': size[1]}, 'output_format': 'png', 'num_images': count}
        return run('bytedance/seedream/v5/pro/edit', args, OUT, f'{shot}{tag}')

    with ThreadPoolExecutor(len(shots)) as pool:
        for files in pool.map(go, shots):
            print(*files)


args = sys.argv[1:] + [''] * 3
main(args[0].split(',') if args[0] else list(SHOTS), int(args[1] or 2), args[2])
