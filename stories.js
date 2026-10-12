// 2026 年度故事数据。
// 想改内容？只改这个文件：
// - 每个类别 = 书架上一簇书（title 是类别名，color 是书的颜色）
// - shelf: 0 放左边书架，1 放右边书架；同一书架上类别多了会依次分配到不同的书
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
        id: 'food',
        title: '美食',
        color: 0xe8853d,
        shelf: 0,
        pages: [
            {
                date: '2026-01',
                title: '示例：跨年火锅',
                text: '热气腾腾的一年从一锅开始。',
                photo: null,
            },
            {
                date: '2026-07',
                title: '示例：深夜食堂',
                text: '加班后的那碗面，是夏天最好的安慰。',
                photo: null,
            },
        ],
    },
    {
        id: 'pets',
        title: '宠物',
        color: 0x5cb85c,
        shelf: 0,
        pages: [
            {
                date: '2026-03',
                title: '示例：春天的第一趟遛弯',
                text: '它在草地上打了个滚，满身都是花粉。',
                photo: null,
            },
            {
                date: '2026-09',
                title: '示例：拆家现场',
                text: '回家看到这一幕，血压和可爱度同时飙升。',
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
                text: '第二个类别放在另一个书架上。类别可以增加：只要在 stories.js 里再加一项，书架上就会多一簇书。',
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
    {
        id: 'reading',
        title: '阅读',
        color: 0x8e6fc0,
        shelf: 1,
        pages: [
            {
                date: '2026-04',
                title: '示例：读完的第一本书',
                text: '窝在沙发里读完的那个下午，窗外正好下雨。',
                photo: null,
            },
        ],
    },
    {
        id: 'music',
        title: '音乐',
        color: 0xe86a92,
        shelf: 1,
        pages: [
            {
                date: '2026-06',
                title: '示例：夏天的音乐会',
                text: '草坪、晚风、和跑调的大合唱。',
                photo: null,
            },
            {
                date: '2026-10',
                title: '示例：练琴打卡',
                text: '指尖起茧的日子，旋律慢慢成形。',
                photo: null,
            },
        ],
    },
];
