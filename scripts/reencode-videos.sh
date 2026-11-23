#!/usr/bin/env bash
# Réencode des vidéos pour la grille : H.264 High, petit côté ≤ 1080 px, CRF 21,
# yuv420p, plage de la source, étiquettes couleur de la source (BT.709), démarrage rapide, AAC 128 kbit/s.
# Si le résultat est plus lourd que l'original (déjà en H.264 MP4), l'original est copié.
#
# Usage : scripts/reencode-videos.sh <dossier source> <dossier destination>
# Réglage validé le 2026-11-23 sur les 13 vidéos du site : 80 Mo → 25,6 Mo ; image affichée
# identique à l'original à moins d'un niveau près (0 à 0,8 sur 255) dans Safari et Chrome.
set -euo pipefail
src=${1:?dossier source}; dst=${2:?dossier destination}
mkdir -p "$dst"
for f in "$src"/*.mov "$src"/*.MOV "$src"/*.mp4 "$src"/*.MP4; do
  [ -e "$f" ] || continue
  name=$(basename "$f"); out="$dst/${name%.*}.mp4"
  read -r w h < <(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "$f" | tr , ' ')
  if [ "$w" -le "$h" ]; then vf="scale='min(1080,iw)':-2"; else vf="scale=-2:'min(1080,ih)'"; fi
  # Aucune conversion de plage : une source en plage complète (pc) le reste, avec
  # son étiquette (ramenée en plage vidéo : écart mesuré de 1,8 niveau ; gardée : 0,2).
  range=$(ffprobe -v error -select_streams v:0 -show_entries stream=color_range -of csv=p=0 "$f")
  # Étiquettes BT.709 seulement si la source en porte : une source sans étiquette
  # est interprétée par le navigateur selon sa taille (BT.601 en définition
  # standard) ; on la laisse sans étiquette pour qu'il l'interprète pareil.
  space=$(ffprobe -v error -select_streams v:0 -show_entries stream=color_space -of csv=p=0 "$f")
  if [ "$range" = pc ]; then tags=(-color_range pc); else tags=(-color_range tv); fi
  if [ "$space" = bt709 ]; then tags+=(-color_primaries bt709 -color_trc bt709 -colorspace bt709); fi
  ffmpeg -v error -nostdin -y -i "$f" \
    -vf "$vf,format=yuv420p" \
    -c:v libx264 -preset slow -crf 21 -profile:v high \
    "${tags[@]}" \
    -movflags +faststart -c:a aac -b:a 128k "$out"
  codec=$(ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of csv=p=0 "$f")
  if [ "$codec" = h264 ] && [[ "$name" =~ \.(mp4|MP4)$ ]] && [ "$(stat -f %z "$out")" -ge "$(stat -f %z "$f")" ]; then
    cp "$f" "$out"; echo "$name : original conservé ($(stat -f %z "$f") o)"
  else
    echo "$name : $(stat -f %z "$f") o → $(stat -f %z "$out") o"
  fi
done
