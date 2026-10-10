// 2026 年度故事数据。
// 想改内容？只改这个文件：
// - 每个类别 = 书架上的一本书（title 是书脊上的名字，color 是书脊颜色）
// - shelf: 0 放左边书架，1 放右边书架
// - pages 按时间顺序排列，读者用 ◀ ▶ 翻页
// - photo 可留 null（左页会显示放大的日期），或填图片路径如 "photos/2026_03_樱花.jpg"
export const categories = [
    {
        id: 'travel',
        title: '旅行',
        color: 0x4a90d9,
        shelf: 0,
        pages: [
            {
                date: '2026-02',
                title: '示例：新年的第一场雪',
                text: '这里是故事正文。把这一页换成你自己的文字，记录那天发生了什么、去了哪里、心情如何。\n\n可以写很多段，翻页按钮会按顺序带读者看完整个类别。',
                photo: null,
            },
            {
                date: '2026-05',
                title: '示例：海边的周末',
                text: '每一页都可以配一张照片。把图片放进项目后，把 photo 改成图片路径即可。',
                photo: null,
            },
            {
                date: '2026-08',
                title: '示例：山顶的日落',
                text: 'pages 数组里有多少页，读者就能翻多少页。顺序就是这里的顺序。',
                photo: null,
            },
        ],
    },
    {
        id: 'daily',
        title: '日常',
        color: 0xe8604c,
        shelf: 1,
        pages: [
            {
                date: '2026-01',
                title: '示例：家里的新成员',
                text: '第二个类别放在另一个书架上。类别可以增加：只要在 stories.js 里再加一项，书架上就会多一本书。',
                photo: null,
            },
            {
                date: '2026-06',
                title: '示例：厨房实验',
                text: '书名颜色用 color 控制（十六进制），挑一个和封面搭的颜色吧。',
                photo: null,
            },
        ],
    },
];
