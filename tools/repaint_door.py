"""把墙面贴图 qiangmian.jpg 里的深色门区域重绘成浅色木纹门（程序化生成木纹）。

用法: python tools/repaint_door.py
直接在源贴图上原地修改，之后重新跑 tools/convert.sh 生效。
"""
from pathlib import Path

import numpy as np
from PIL import Image

SRC = Path("G1642-maya c4d blender max卡通室内场景/katong/qiangmian.jpg")


def make_wood(width, height, seed=7):
    """程序化浅色木纹：竖向正弦纹理 + 低频噪声扰动，无板缝。"""
    rng = np.random.default_rng(seed)
    x = np.linspace(0, width / 18.0, width)[None, :]          # 横向决定条纹
    y = np.linspace(0, height / 90.0, height)[:, None]        # 纵向轻微扰动

    # 低频噪声（ coarse random grid 双线性放大），让条纹自然弯曲
    coarse = rng.random((6, 8))
    noise = np.array(Image.fromarray((coarse * 255).astype(np.uint8)).resize((width, height), Image.BILINEAR)) / 255.0

    wave = np.sin(x * 2 * np.pi + noise * 6 + y * 0.8)
    fine = np.sin(x * 14 * np.pi + noise * 12) * 0.3          # 细木纹
    grain = 0.82 + wave * 0.10 + fine * 0.08 + noise * 0.06

    # 浅木底色（偏暖白蜡木色）
    base = np.array([0xf2, 0xda, 0xae], dtype=float)
    darker = np.array([0xc9, 0xa4, 0x6d], dtype=float)
    t = np.clip((grain - 0.6) / 0.8, 0, 1)[..., None]
    rgb = base + (darker - base) * t
    return Image.fromarray(rgb.astype(np.uint8))


img = Image.open(SRC).convert("RGB")
w, h = img.size
px = img.load()

# 找深色门区域：门是大块实心深色矩形，墙裙栏杆是细线。
# 按"每列深色像素数"筛选——门所在列会有大量连续深色像素，栏杆细线只有零星几个
y0, y1 = int(h * 0.25), int(h * 0.55)

def is_dark(p):
    r, g, b = p
    return r < 30 and g < 40 and b < 55

door_cols = [
    x for x in range(w)
    if sum(1 for y in range(y0, y1) if is_dark(px[x, y])) > (y1 - y0) * 0.3
]
if not door_cols:
    raise SystemExit("没找到深色门区域")
min_x, max_x = door_cols[0], door_cols[-1]

door_rows = [
    y for y in range(y0, y1)
    if sum(1 for x in range(min_x, max_x + 1) if is_dark(px[x, y])) > (max_x - min_x) * 0.5
]
if not door_rows:
    raise SystemExit("没找到深色门区域")
min_y, max_y = door_rows[0], door_rows[-1]

# 外扩一点，盖住深色边缘（绿色门框保留，当作浅色门的门框）
pad_x = int((max_x - min_x) * 0.04)
pad_y = int((max_y - min_y) * 0.03)
min_x, min_y = max(0, min_x - pad_x), max(0, min_y - pad_y)
max_x, max_y = min(w, max_x + pad_x), min(h, max_y + pad_y)

# 程序化生成浅色木纹，贴到门区域
grain = make_wood(max_x - min_x + 1, max_y - min_y + 1)
img.paste(grain, (min_x, min_y))

img.save(SRC, quality=92)
print(f"门区域 ({min_x},{min_y})-({max_x},{max_y}) 已重绘为浅色木纹")
