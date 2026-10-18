"""Encodes the phone variant of every web clip: 1280 px on the long side (a landscape phone shows the character on
≈ 1700 device px, and the clips are soft already), which cuts each decoder's memory by more than half. Re-encoded from
the web clips, so it runs after encode.py and encode_transition.py.
Usage: python3 -I scripts/character/encode_mobile.py  ->  app/assets/character/mobile/<clip>.mp4
"""
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / 'app/assets/character'
OUT = SRC / 'mobile'
OUT.mkdir(exist_ok=True)
for clip in sorted(SRC.glob('*.mp4')):
    dest = OUT / clip.name
    subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', str(clip),
                    '-vf', "scale='if(gt(iw,ih),1280,-2)':'if(gt(iw,ih),-2,1280)':flags=lanczos",
                    '-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-pix_fmt', 'yuv420p',
                    '-movflags', '+faststart', '-an', str(dest)], check=True)
    print(f'{clip.name:26s} {clip.stat().st_size // 1024:5d} KB -> {dest.stat().st_size // 1024:5d} KB')
