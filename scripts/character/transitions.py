"""Generates the camera move between two screens: the clip starts on the left screen's canvas and ends on the right
one's (canvas.py), so it hands over to the loops with no jump; encode_transition.py then speeds it up.
Usage: python3 -I scripts/character/transitions.py [pair,...] [model:tag,...]  ->  design/character/transitions/<from>-<to><tag>.mp4
"""
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from canvas import OUT as CANVAS, render  # noqa: E402
from fal import ROOT, data_uri, run  # noqa: E402

OUT = ROOT / 'design/character/transitions'
STYLE = ('One continuous fast cinematic camera move, no cut, natural motion blur, same man, same face, same outfit, '
         'same lighting and near-black background throughout; the move settles exactly on the last image.')
PAIRS = {
    'overview-experience': 'The camera swings around to his left as he turns into a three-quarter view and lowers his open '
                     'hand in front of his waist; a rapier materialises above his palm in a swirl of thin cyan glowing '
                     'ribbons and floats diagonally across his chest.',
    'experience-overview': 'The rapier dissolves into cyan sparks as he turns to face the camera; the camera swings back '
                     'in front of him and settles on a frontal bust shot.',
    # A first prompt let the head turn past the profile and come back to three-quarter: only the camera moves now.
    'overview-pictos': 'He stays still; only the camera moves, in one smooth continuous orbit in a single direction '
                       'from in front of him around to behind his shoulder, so his face turns gradually from front '
                       'view to profile exactly once, never past the profile and never back.',
    'pictos-overview': 'He stays still; only the camera moves, in one smooth continuous orbit in a single direction '
                       'from behind his shoulder around to in front of him, so his face turns gradually from profile '
                       'to front view exactly once, never past it and never back.',
    'overview-skills': 'In one smooth continuous move the camera pulls back a little while he squares his shoulders '
                       'to face the camera and crosses his arms over his chest.',
    'overview-luminas': 'In one smooth continuous move the camera pushes in to a closer bust shot while he turns his '
                        'head and shoulders a quarter turn toward the left of the image, ending in three-quarter view.',
    'luminas-overview': 'In one smooth continuous move the camera pulls back to a bust shot while he turns from a '
                        'three-quarter view back to face the camera.',
    'luminas-pictos': 'In one smooth continuous move the camera orbits from his front three-quarter view around to behind his shoulder as his head turns into profile toward the left, once, never back.',
    # Not used: the result turned through the back of the head; the page plays luminas-pictos reversed instead.
    'pictos-luminas': 'In one smooth continuous move the camera orbits from behind his shoulder around to his front three-quarter view as his head turns from profile, once, never back.',
    'skills-skilltree': 'In one smooth continuous move the camera pushes in from a medium shot to a close bust as he '
                        'uncrosses his arms and lowers them, turning his shoulders slightly to the right.',
    'skilltree-skills': 'In one smooth continuous move the camera pulls back from a close bust to a medium shot as he '
                        'crosses his arms over his chest, facing the camera.',
    'skills-overview': 'In one smooth continuous move he uncrosses his arms and relaxes into the bust pose while the '
                       'camera pushes in a little.',
}
NEGATIVE = ('cut, scene change, extra people, morphing face, extra fingers, text, watermark, distortion, low quality, '
            'head turning back and forth')

MODELS = {
    'kling': ('fal-ai/kling-video/v3/pro/image-to-video', lambda prompt, start, end: {
        'prompt': prompt, 'start_image_url': start, 'end_image_url': end, 'duration': '3', 'generate_audio': False,
        'negative_prompt': NEGATIVE}),
    'wan': ('alibaba/wan-3.0/image-to-video', lambda prompt, start, end: {
        'prompt': prompt, 'start_image_url': start, 'end_image_url': end, 'duration': 3, 'resolution': '1080p',
        'aspect_ratio': '16:9', 'audio': False, 'enable_prompt_expansion': False}),
}


def go(job):
    pair, label, tag = job
    a, b = pair.split('-')
    for shot in (a, b):
        if not (CANVAS / f'{shot}.jpg').exists():
            render(shot)
    model, build = MODELS[label]
    args = build(f'{PAIRS[pair]} {STYLE}', data_uri(CANVAS / f'{a}.jpg'), data_uri(CANVAS / f'{b}.jpg'))
    return run(model, args, OUT, f'{pair}{tag}', poll=10)


args = sys.argv[1:] + [''] * 2
pairs = args[0].split(',') if args[0] else list(PAIRS)
variants = [v.split(':') for v in args[1].split(',')] if args[1] else [['kling', '']]
jobs = [(p, label, tag) for p in pairs for label, tag in variants]
with ThreadPoolExecutor(len(jobs)) as pool:
    for files in pool.map(go, jobs):
        print(*files)
