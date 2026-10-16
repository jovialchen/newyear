#!/usr/bin/env python3
# ============================================================
#  用法：cd 2026 && python3 update_media.py
#
#  扫描 photos/<slug>/ 下每个事件的媒体目录（忽略 .gitkeep 和
#  以 . 开头的文件），按文件名排序，把相对路径列表
#  （形如 'photos/<slug>/xxx.jpg'）写回 events.js 里对应事件的
#  media: [...] 行。目录为空就写 media: [],。
#  图片和视频都可以放；视频支持 mp4/webm/mov/m4v（网页直接播放）。
#  加完照片/视频后跑一次这个脚本即可，不用手动改 events.js。
# ============================================================
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
EVENTS_JS = HERE / 'events.js'
PHOTOS = HERE / 'photos'

SLUG_RE = re.compile(r"^    slug: '([a-z0-9-]+)',$", re.M)
MEDIA_RE = re.compile(r"^    media: \[[^\n]*\],$", re.M)

def main():
    text = EVENTS_JS.read_text(encoding='utf-8')
    slugs = SLUG_RE.findall(text)
    if not slugs:
        sys.exit('events.js 里没有找到任何 slug 字段')
    if len(slugs) != len(set(slugs)):
        sys.exit('events.js 里有重复的 slug，请先修正')

    changed = False
    for slug in slugs:
        d = PHOTOS / slug
        if not d.is_dir():
            d.mkdir(parents=True, exist_ok=True)
            (d / '.gitkeep').touch()
            print(f'  新建目录 photos/{slug}/')
        files = sorted(
            f.name for f in d.iterdir()
            if f.is_file() and not f.name.startswith('.')
        )
        items = ', '.join(f"'photos/{slug}/{name}'" for name in files)
        new_line = f'    media: [{items}],'

        # 从该 slug 出现的位置往后，找紧随其后的 media 行并替换
        pos = text.index(f"    slug: '{slug}',")
        m = MEDIA_RE.search(text, pos)
        if not m:
            sys.exit(f'事件 {slug} 后面没找到 media 行，请检查 events.js 格式')
        if m.group(0) != new_line:
            text = text[:m.start()] + new_line + text[m.end():]
            changed = True
        print(f'  {slug}: {len(files)} 个文件')

    if changed:
        EVENTS_JS.write_text(text, encoding='utf-8')
        print('events.js 已更新')
    else:
        print('没有变化，events.js 保持原样')

if __name__ == '__main__':
    main()
