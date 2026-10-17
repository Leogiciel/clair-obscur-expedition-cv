"""Generates each screen's idle loop: the validated still is both the first and the last frame, so the clip loops
without a cut. Usage: python3 -I scripts/character/loops.py [shot,...] [model,...] [tag]
->  design/character/loops/<shot>-<model><tag>.mp4
"""
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from fal import ROOT, data_uri, run  # noqa: E402
from PIL import Image  # noqa: E402

STILLS = ROOT / 'design/character/final'
OUT = ROOT / 'design/character/loops'
DURATION = 8

CAMERA = ('Locked-off static camera: no zoom, no pan, no camera movement. The dark background stays still. '
          'Same person, same face, same outfit throughout. The last frame returns exactly to the starting pose.')
SHOTS = {
    'overview': ((1080, 1920), STILLS / 'overview.png', (
        'Idle portrait: he stands still and breathes slowly and subtly, blinks naturally twice, his gaze lowers '
        'briefly then comes back to the camera, very slight head sway. ')),
    'role': ((1920, 1080), STILLS / 'role.png', (
        'Idle: he breathes slowly and blinks naturally, keeping his open hand low in front of his waist. The rapier '
        'keeps levitating diagonally across his chest above that palm, bobbing gently and keeping its shape; the thin '
        'cyan glowing ribbons slowly swirl around the blade and a few faint cyan particles drift upward. ')),
    'pictos': ((1920, 1080), STILLS / 'pictos.png', (
        'Idle, seen from behind: he breathes slowly, his shoulders rise and fall subtly, he blinks, his head stays in '
        'profile with a very slight sway. ')),
    'skills': ((1920, 1080), STILLS / 'skills.png', (
        'Idle: he stands with his arms crossed, breathes slowly and subtly, blinks naturally, a faint confident smile, '
        'very slight head sway, looking at the camera. ')),
}
NEGATIVE = 'camera movement, zoom, morphing face, extra fingers, text, watermark, blur, distortion, low quality'

MODELS = {
    'kling': ('fal-ai/kling-video/v3/pro/image-to-video', lambda prompt, image: {
        'prompt': prompt, 'start_image_url': image, 'end_image_url': image, 'duration': str(DURATION),
        'generate_audio': False, 'negative_prompt': NEGATIVE}),
    'wan': ('alibaba/wan-3.0/image-to-video', lambda prompt, image: {
        'prompt': prompt, 'start_image_url': image, 'end_image_url': image, 'duration': DURATION,
        'resolution': '1080p', 'audio': False, 'enable_prompt_expansion': False}),
    'seedance': ('bytedance/seedance-2.5/us/image-to-video', lambda prompt, image: {
        'prompt': prompt, 'image_url': image, 'end_image_url': image, 'duration': str(DURATION),
        'resolution': '720p', 'generate_audio': False}),
}


def keyframe(shot):
    """JPEG at the clip size: multi-megabyte PNG data URIs get the request dropped."""
    size, path, _ = SHOTS[shot]
    OUT.mkdir(parents=True, exist_ok=True)
    dest = OUT / f'key-{shot}.jpg'
    Image.open(path).convert('RGB').resize(size, Image.LANCZOS).save(dest, quality=95)
    return dest


def main(shots, models, tag):
    jobs = [(shot, label) for shot in shots for label in models]

    def go(job):
        shot, label = job
        model, build = MODELS[label]
        return run(model, build(SHOTS[shot][2] + CAMERA, data_uri(keyframe(shot))), OUT, f'{shot}-{label}{tag}', poll=10)

    with ThreadPoolExecutor(len(jobs)) as pool:
        for files in pool.map(go, jobs):
            print(*files)


args = sys.argv[1:] + [''] * 3
main(args[0].split(',') if args[0] else list(SHOTS), args[1].split(',') if args[1] else ['kling', 'wan'], args[2])
