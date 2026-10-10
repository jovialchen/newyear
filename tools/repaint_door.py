"""把墙面贴图 qiangmian.jpg 里的深色门区域重绘成浅色木纹门（纹理取自地板贴图 diban.jpg）。

用法: python tools/repaint_door.py
直接在源贴图上原地修改，之后重新跑 tools/convert.sh 生效。
"""
from pathlib import Path

from PIL import Image

SRC = Path("G1642-maya c4d blender max卡通室内场景/katong/qiangmian.jpg")
WOOD = Path("G1642-maya c4d blender max卡通室内场景/katong/diban.jpg")

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

# 从地板贴图裁一段竖纹木板（取 3 条板缝的宽度），缩放到门区域
wood = Image.open(WOOD).convert("RGB")
grain = wood.crop((60, 0, 200, wood.height)).resize((max_x - min_x + 1, max_y - min_y + 1))
img.paste(grain, (min_x, min_y))

img.save(SRC, quality=92)
print(f"门区域 ({min_x},{min_y})-({max_x},{max_y}) 已重绘为浅色木纹")
