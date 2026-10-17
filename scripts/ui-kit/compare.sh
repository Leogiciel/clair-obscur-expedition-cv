#!/usr/bin/env bash
# Compares each UI kit recreation with its reference (design/ref/), side by side and zoomed.
# Requires: server with DEV_KIT=true (yarn dev --port 5199), gstack browse, ffmpeg.
# Usage: scripts/ui-kit/compare.sh <out_dir> [url]
# Output: <ref>__<zone>.png, reference on the left, recreation on the right.
set -euo pipefail
OUT=${1:?dossier de sortie}
URL=${2:-http://localhost:5199/dev/kit}
ROOT=$(cd "$(dirname "$0")/../.." && pwd)
REF=$ROOT/design/ref
B=${BROWSE:-$HOME/.claude/skills/gstack/browse/dist/browse}
mkdir -p "$OUT"

"$B" viewport 1000x900 >/dev/null
"$B" goto "$URL" >/dev/null
"$B" js "document.fonts.ready.then(() => 1)" >/dev/null

# section | reference | zone | crop w:h:x:y | zoom
ZONES="
1|rows.png|full|760:210:0:0|2
1|rows.png|left|200:70:0:0|3
1|rows.png|right|170:70:220:0|3
2|weapon-rows.png|full|480:170:0:0|2
3|title-sort.png|full|840:90:0:0|2
3|title-sort.png|title|300:90:0:0|3
3|title-sort.png|sort|440:90:300:0|3
4|stats-top.png|full|490:380:0:0|2
4|stats-top.png|top-right|220:140:270:0|3
5|diamond-card.png|full|620:210:0:0|2
5|diamond-card.png|right|160:210:460:0|3
6|card-weapon.png|full|510:210:0:0|2
7|luminas.png|full|490:240:0:0|2
7|luminas.png|left|260:140:30:95|3
8|portraits.png|full|510:140:0:0|2
10|empty.png|full|200:200:0:0|2
"
SHOT=" "
while IFS='|' read -r sec ref zone crop zoom; do
  [ -z "$sec" ] && continue
  # One screenshot per section (macOS bash 3 has no associative arrays).
  case "$SHOT" in *" $sec "*) ;; *)
    "$B" screenshot --selector "section:nth-of-type($sec) [data-recreation]" "$OUT/.mine_$sec.png" >/dev/null
    SHOT="$SHOT$sec "
  esac
  name=$(basename "$ref" .png)
  # -nostdin: otherwise ffmpeg consumes the zone list from stdin.
  ffmpeg -nostdin -v error -y -i "$REF/$ref" -i "$OUT/.mine_$sec.png" -filter_complex \
    "[0]crop=$crop,scale=iw*$zoom:-1:flags=lanczos[a];[1]crop=$crop,scale=iw*$zoom:-1:flags=lanczos[b];[a]pad=iw+12:ih:0:0:red[a2];[a2][b]hstack" \
    "$OUT/${name}__${zone}.png"
done <<< "$ZONES"
ls "$OUT"/*.png
