#!/usr/bin/env bash
# 把 3D 源模型（OBJ）转换为网页用的压缩 GLB。
# 第一步用本机 python（trimesh），第二步用 npx gltf-transform（走 npmmirror 镜像）。
# 用法: bash tools/convert.sh
set -euo pipefail
cd "$(dirname "$0")/.."

SRC="G1642-maya c4d blender max卡通室内场景"
export npm_config_registry=https://registry.npmmirror.com
mkdir -p assets

convert() {
  local input="$1" output="$2"
  local raw="assets/raw_$(basename "$output")"
  echo "== trimesh: $input -> $raw"
  python tools/convert.py "$input" "$raw"
  echo "== gltf-transform: $raw -> $output"
  npx --yes @gltf-transform/cli optimize "$raw" "$output" \
    --compress meshopt --texture-compress webp --texture-size 1024 --palette false
  rm -f "$raw"
}

convert "$SRC/katong/shinei.obj" assets/room.glb
convert "$SRC/Bookcase.obj"      assets/bookcase_a.glb
convert "$SRC/Bookcase.018.obj"  assets/bookcase_b.glb

echo "== done"
ls -lh assets/
