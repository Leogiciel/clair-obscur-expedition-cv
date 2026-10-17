#!/usr/bin/env bash
# Compares site screens (2510x1380) with game video frames: stacked and 50% overlay.
# Usage: scripts/ui-kit/compare-screens.sh <out_dir> [base_url]
set -euo pipefail
OUT=${1:?dossier de sortie}
BASE=${2:-http://localhost:5199}
ROOT=$(cd "$(dirname "$0")/../.." && pwd)
B=${BROWSE:-$HOME/.claude/skills/gstack/browse/dist/browse}
mkdir -p "$OUT"
"$B" viewport 2510x1380 >/dev/null
# screen | path | video frame
for spec in "home|/|t11" "role|/role|t6" "pictos|/pictos|t15" "skills|/skills|t38"; do
  IFS='|' read -r name path frame <<< "$spec"
  "$B" goto "$BASE$path" >/dev/null
  "$B" js "document.fonts.ready.then(()=>new Promise(r=>setTimeout(r,1500)))" >/dev/null
  # Hide the background video: compare the UI, not the scenery.
  "$B" js "document.querySelectorAll('video').forEach(v=>v.style.visibility='hidden');1" >/dev/null
  "$B" screenshot "$OUT/$name.png" >/dev/null
  ffmpeg -nostdin -v error -y -i "$ROOT/design/frames/$frame.png" -i "$OUT/$name.png" -filter_complex \
    "[0]scale=1255:690[a];[1]scale=1255:690[b];[a][b]vstack" "$OUT/${name}__stack.png"
  ffmpeg -nostdin -v error -y -i "$ROOT/design/frames/$frame.png" -i "$OUT/$name.png" -filter_complex \
    "[0]scale=2000:1100[a];[1]scale=2000:1100[b];[a][b]blend=all_mode=average" "$OUT/${name}__overlay.png"
done
ls "$OUT"
