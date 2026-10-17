"""Generates the 16:9 master still of each screen from frames of the current character clip.
Usage: python3 -I scripts/character/stills.py [shot,...] [model,...] [tag]  ->  design/character/stills/<shot>-<model><tag>.png
"""
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from fal import ROOT, data_uri, run  # noqa: E402

CLIP = ROOT / 'design/character/source-clip.mp4'
OUT = ROOT / 'design/character/stills'
# Eyes open towards the camera (t 3 s) and a lowered gaze (t 1 s) give the models two views of the face.
REFS = (3.0, 1.0)

IDENTITY = ('Keep this exact person: same face, same features, same skin, same hair, same outfit, same proportions. '
            'Do not beautify, do not change age or ethnicity, never mirror the image.')
LOOK = ('Photorealistic cinematic Unreal Engine 5 render, high skin micro-detail, warm key light from the left, '
        'cold rim light from the right, 8:1 contrast, desaturated grade, near-black background (#0a0a08) '
        'with a faint vignette. No text, no UI, no frame, no watermark.')

# Framings measured on the game. The overview keeps the clip's portrait framing, placed by
# Character.tsx: recomposing it into 16:9 moved or shrank the character, so the model only re-renders it sharper.
SHOTS = {
    'overview': ('9:16', (
        'Re-render the first image as a sharp, high-resolution still with exactly the same framing, position, '
        'size, pose, expression and gaze; only add detail. The second image shows the same face.')),
    'role': ('16:9', (
        'Recompose as a 16:9 landscape cinematic shot. Waist-up, body in three-quarter view turned toward the left of '
        'the frame, face at 61% of the image width, top of the head at 13% of the height, chin at 35%. '
        'His open gloved hand is raised at chest height, palm up, and an ornate rapier of original design levitates '
        'above it, blade on a diagonal rising toward the top right corner and leaving the frame there; thin abstract '
        'cyan glowing ribbons swirl around the blade. The left 40% of the frame stays dark and empty.')),
}

SIZES = {'9:16': {'width': 1080, 'height': 1920}, '16:9': {'width': 1920, 'height': 1080}}
MODELS = {
    'nanobanana': ('google/nano-banana-2.1/edit', lambda prompt, refs, aspect: {
        'prompt': prompt, 'image_urls': refs, 'aspect_ratio': aspect, 'resolution': '2K', 'output_format': 'png'}),
    'seedream': ('bytedance/seedream/v5/pro/edit', lambda prompt, refs, aspect: {
        'prompt': prompt, 'image_urls': refs, 'image_size': SIZES[aspect], 'output_format': 'png'}),
}


def frame(t):
    dest = OUT / f'ref-{t:g}.png'
    if not dest.exists():
        OUT.mkdir(parents=True, exist_ok=True)
        subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-ss', str(t), '-i', str(CLIP), '-frames:v', '1', str(dest)], check=True)
    return dest


def main(shots, models, tag):
    refs = [data_uri(frame(t)) for t in REFS]
    jobs = [(shot, label, *MODELS[label]) for shot in shots for label in models]
    with ThreadPoolExecutor(len(jobs)) as pool:
        runs = pool.map(lambda j: run(j[2], j[3](f'{SHOTS[j[0]][1]} {IDENTITY} {LOOK}', refs, SHOTS[j[0]][0]), OUT,
                                      f'{j[0]}-{j[1]}{tag}'), jobs)
        for files in runs:
            print(*files)


args = sys.argv[1:] + [''] * 3
main(args[0].split(',') if args[0] else list(SHOTS), args[1].split(',') if args[1] else list(MODELS), args[2])
