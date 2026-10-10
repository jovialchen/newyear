"""把墙面贴图 qiangmian.jpg 里的深色门区域改成一扇卡通窗户（白框 + 蓝天玻璃）。

用法: python tools/door_to_window.py
直接在源贴图上原地修改，之后重新跑 tools/convert.sh 生效。
"""
from pathlib import Path

from PIL import Image, ImageDraw

SRC = Path("G1642-maya c4d blender max卡通室内场景/katong/qiangmian.jpg")

SKY = (30, 144, 216)      # 与 main.js 的 SKY_COLOR 0x1e90d8 一致
FRAME = (245, 250, 252)   # 窗框白

img = Image.open(SRC).convert("RGB")
w, h = img.size
px = img.load()

# 找深色门区域：门是大块实心藏青矩形，墙裙栏杆是细线。
# 按"每列深色像素数"筛选——门所在列会有大量连续深色像素，栏杆细线只有零星几个
min_x, min_y, max_x, max_y = w, h, 0, 0
y0, y1 = int(h * 0.25), int(h * 0.55)

def is_dark(p):
    r, g, b = p
    return r < 30 and g < 40 and b < 55

col_counts = []
for x in range(w):
    col_counts.append(sum(1 for y in range(y0, y1) if is_dark(px[x, y])))

threshold = (y1 - y0) * 0.3
door_cols = [x for x, c in enumerate(col_counts) if c > threshold]
if not door_cols:
    raise SystemExit("没找到深色门区域")
min_x, max_x = door_cols[0], door_cols[-1]

row_counts = []
for y in range(y0, y1):
    row_counts.append((y, sum(1 for x in range(min_x, max_x + 1) if is_dark(px[x, y]))))
row_threshold = (max_x - min_x) * 0.5
door_rows = [y for y, c in row_counts if c > row_threshold]
if not door_rows:
    raise SystemExit("没找到深色门区域")
min_y, max_y = door_rows[0], door_rows[-1]

# 外扩一圈，把门的绿色边框也盖住
pad_x = int((max_x - min_x) * 0.18)
pad_y = int((max_y - min_y) * 0.06)
min_x, min_y = max(0, min_x - pad_x), max(0, min_y - pad_y)
max_x, max_y = min(w, max_x + pad_x), min(h, max_y + pad_y)

draw = ImageDraw.Draw(img)

# 白色外框
draw.rectangle([min_x, min_y, max_x, max_y], fill=FRAME)

# 蓝天玻璃（内缩一圈作为框厚）
bw = max(6, int((max_x - min_x) * 0.07))
bh = max(6, int((max_y - min_y) * 0.05))
gx0, gy0, gx1, gy1 = min_x + bw, min_y + bh, max_x - bw, max_y - bh
draw.rectangle([gx0, gy0, gx1, gy1], fill=SKY)

# 窗棂：1 根竖条 + 3 根横条（和房间里其他窗户的分格风格一致）
bar_v = max(4, int((gx1 - gx0) * 0.06))
bar_h = max(4, int((gy1 - gy0) * 0.04))
cx = (gx0 + gx1) // 2
draw.rectangle([cx - bar_v // 2, gy0, cx + bar_v // 2, gy1], fill=FRAME)
for i in range(1, 4):
    cy = gy0 + (gy1 - gy0) * i // 4
    draw.rectangle([gx0, cy - bar_h // 2, gx1, cy + bar_h // 2], fill=FRAME)

img.save(SRC, quality=92)
print(f"门区域 ({min_x},{min_y})-({max_x},{max_y}) 已改绘成窗户")
