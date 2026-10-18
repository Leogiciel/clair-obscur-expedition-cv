"""Encodes a transition clip for the web, sped up SPEED times like the game's ≈ 0.75 s camera moves. Each output frame
averages the source frames it spans (a 360° shutter), which gives the move its motion blur. Leading frames
where nothing moves yet are dropped; the end is kept whole so the clip lands on the next loop's first frame.
Usage: python3 -I scripts/character/encode_transition.py <from>-<to>  ->  app/assets/character/<from>-<to>.mp4
"""
import subprocess
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / 'design/character/transitions'
OUT = ROOT / 'app/assets/character'
SPEED = 4
FPS = 48
# A frame counts as moving once it changes by this share of the clip's largest frame-to-frame change.
STILL = 0.1
# The clips are softer than the stills the loops start on: every move fades into the target screen's canvas over its
# last SETTLE seconds, so it lands crisp instead of sharpening at the handover.
SETTLE = 0.18
CANVAS = ROOT / 'design/character/canvas'
# Slow push-ins: the generated clip is soft and the frame blending adds to it, so they are sharpened.
CRISP = {'skills-skilltree', 'skilltree-skills'}
# Moves still moving on their last frame: their last source frames play at half the speed, one per output frame, so
# they ease into the loop. They skip the settle fade, which would blend the moving body with the still.
LAND = {'skilltree-skills': 12}


def frames(path):
    raw = subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-i', str(path), '-vf', 'scale=480:270', '-f', 'rawvideo',
                          '-pix_fmt', 'gray', '-'], check=True, capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, 270, 480).astype(np.float32)


pair = sys.argv[1]
src = SRC / f'{pair}.mp4'
steps = np.abs(np.diff(frames(src), axis=0)).mean((1, 2))
moving = steps > STILL * steps.max()
start = int(np.argmax(moving))
# The end is never trimmed: the generated clip ends on the target canvas, and cutting it short ghosts the settle fade.
end = steps.size + 1
rate = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v', '-show_entries', 'stream=r_frame_rate', '-of',
                       'csv=p=0', str(src)], check=True, capture_output=True, text=True).stdout.strip()
num, den = map(int, rate.split('/'))
# Source frames per output frame.
per = max(1, round(SPEED * num / den / FPS))
land = LAND.get(pair, 0)
frames_out = -(-(end - land - start) // per)
duration = frames_out / FPS
a, b = pair.split('-')
sharpen = ',unsharp=5:5:0.7' if pair in CRISP else ''
graph = (f'[0]split[src][tail];[src]trim=start_frame={start}:end_frame={end - land},setpts=PTS-STARTPTS,'
         + f'tmix=frames={per},'
         + f"select='not(mod(n\\,{per}))',setpts=N/{FPS}/TB,fps={FPS},format=yuv420p{sharpen}[move];")
if land:
    graph += (f'[tail]trim=start_frame={end - land}:end_frame={end},setpts=N/{FPS}/TB,format=yuv420p{sharpen}[landing];'
              + '[move][landing]concat=n=2:v=1[out]')
else:
    graph += ('[tail]nullsink;'
              + f'[1]loop=-1:1,fps={FPS},trim=duration={SETTLE},setpts=PTS-STARTPTS,format=yuv420p[rest];'
              + f'[move][rest]xfade=transition=fade:duration={SETTLE}:offset={duration - SETTLE:.3f},format=yuv420p[out]')
OUT.mkdir(parents=True, exist_ok=True)
dest = OUT / f'{pair}.mp4'
subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', str(src), '-i', str(CANVAS / f'{b}.jpg'),
                '-filter_complex', graph, '-map', '[out]', '-r', str(FPS),
                '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-movflags', '+faststart', '-an', str(dest)], check=True)
print(dest, 'from frame', start)
