"""OBJ -> GLB 转换（保留材质/贴图/UV，顺便把贴图缩到 1024 以内）。

用法: python tools/convert.py 输入.obj 输出.glb
依赖: pip install trimesh pillow numpy
"""
import sys

import trimesh

MAX_TEXTURE = 1024


def shrink_images(material, seen):
    image = getattr(material, "image", None)
    if image is not None and id(image) not in seen:
        seen.add(id(image))
        if max(image.size) > MAX_TEXTURE:
            image.thumbnail((MAX_TEXTURE, MAX_TEXTURE))
    for sub in getattr(material, "materials", []) or []:
        shrink_images(sub, seen)


def convert(src: str, dst: str) -> None:
    scene = trimesh.load(src, force="scene")
    seen = set()
    for geometry in scene.geometry.values():
        material = getattr(getattr(geometry, "visual", None), "material", None)
        if material is not None:
            shrink_images(material, seen)
    scene.export(dst)


if __name__ == "__main__":
    convert(sys.argv[1], sys.argv[2])
