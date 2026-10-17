"""Encodes a generated loop for the web: the clip's last FADE seconds are cross-faded into its first ones, so the
loop point never shows the small drift the models leave between their last and first frames.
Usage: python3 -I scripts/character/encode.py <shot> <model>  ->  app/assets/character/<shot>.mp4
"""
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LOOPS = ROOT / 'design/character/loops'
OUT = ROOT / 'app/assets/character'
FADE = 0.5
# Near-static clips need a finer quantizer, or the loop point shows the jump from accumulated P-frame noise to a fresh keyframe.
CRF = {'overview': '18'}

shot, model = sys.argv[1:3]
src = LOOPS / f'{shot}-{model}.mp4'
probe = json.loads(subprocess.run(
    ['ffprobe', '-v', 'error', '-select_streams', 'v', '-count_frames', '-show_entries',
     'stream=nb_read_frames,r_frame_rate', '-of', 'json', str(src)], check=True, capture_output=True).stdout)['streams'][0]
# Cut on frame indices: second-based trims miss frames at 24 fps and the gap gets padded with repeats.
frames = int(probe['nb_read_frames'])
num, den = map(int, probe['r_frame_rate'].split('/'))
fps = num / den
fade = round(FADE * fps)
graph = (f'[0]split=3[a][b][c];'
         f'[a]trim=start_frame={frames - fade}:end_frame={frames},setpts=PTS-STARTPTS[tail];'
         f'[b]trim=start_frame=0:end_frame={fade},setpts=PTS-STARTPTS[head];'
         f'[c]trim=start_frame={fade}:end_frame={frames - fade},setpts=PTS-STARTPTS[mid];'
         f'[tail][head]xfade=transition=fade:duration={fade / fps}:offset=0[seam];'
         f'[seam][mid]concat=n=2:v=1:a=0,format=yuv420p[out]')
OUT.mkdir(parents=True, exist_ok=True)
subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', str(src), '-filter_complex', graph, '-map', '[out]',
                '-c:v', 'libx264', '-preset', 'slow', '-crf', CRF.get(shot, '23'), '-movflags', '+faststart', '-an',
                str(OUT / f'{shot}.mp4')], check=True)
print(OUT / f'{shot}.mp4')
