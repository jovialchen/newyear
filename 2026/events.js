// ============================================================
//  2026 年事件数据 —— 你只需要改这一个文件
//
//  每个事件有五个字段：
//    type        事件类型，决定路边标志的造型，可选值：
//                  'travel'   家庭旅行 —— 行李箱（照片贴在箱子上）
//                  'movie'    电影/电视剧 —— 爆米花桶（照片是桶身标签）
//                  'book'     读书 —— 一本打开的书（右页是照片）
//                  'study'    学习 —— 小书包（照片在前袋上）
//                  'exercise' 锻炼 —— 哑铃（照片吊牌挂在杆上）
//                  'show'     展览/演出 —— 剧院红幕（照片是舞台）
//                写其他值或留空时，默认显示「木杆路牌」
//    date        显示在卡片顶部的日期，格式随意，如 '2026-01-05' 或 '2026年1月'
//    title       事件标题
//    description 事件描述，写多长都可以
//    photo       照片路径（相对于本文件夹），照片请放在 2026/photos/ 里
//                留空字符串 '' 时，路边标志会显示一个彩色占位图案
//
//  事件会按照下面数组的顺序依次出现在小路上（第一个在最前面）。
//  想加事件就直接往后加，想删就删掉整段，数量不限，页面会自动适应。
// ============================================================

// 事件类型的显示名和卡片标签颜色
export const EVENT_TYPES = {
  travel: { label: '家庭旅行', color: '#ff9a5f' },
  movie: { label: '影视', color: '#7c9ef8' },
  book: { label: '读书', color: '#8f6fd8' },
  study: { label: '学习', color: '#4fae8e' },
  exercise: { label: '锻炼', color: '#e05d5d' },
  show: { label: '展览/演出', color: '#d8a23c' },
};

export const EVENTS = [
  {
    type: 'travel',
    date: '2026-01',
    title: '一月的故事',
    description: '这里写一月发生的事情。',
    photo: '',
  },
  {
    type: 'book',
    date: '2026-01',
    title: '一月的另一件事',
    description: '这里写描述。',
    photo: '',
  },
  {
    type: 'movie',
    date: '2026-02',
    title: '二月的故事',
    description: '这里写描述。',
    photo: '',
  },
  {
    type: 'study',
    date: '2026-02',
    title: '二月的另一件事',
    description: '这里写描述。',
    photo: '',
  },
  {
    type: 'exercise',
    date: '2026-03',
    title: '三月的故事',
    description: '这里写描述。',
    photo: '',
  },
  {
    type: 'show',
    date: '2026-03',
    title: '三月的另一件事',
    description: '这里写描述。',
    photo: '',
  },
  {
    type: 'travel',
    date: '2026-04',
    title: '四月的故事',
    description: '这里写描述。',
    photo: '',
  },
  {
    type: 'book',
    date: '2026-04',
    title: '四月的另一件事',
    description: '这里写描述。',
    photo: '',
  },
  {
    type: 'study',
    date: '2026-05',
    title: '五月的故事',
    description: '这里写描述。',
    photo: '',
  },
  {
    type: 'movie',
    date: '2026-06',
    title: '六月的故事',
    description: '这里写描述。',
    photo: '',
  },
  {
    type: 'exercise',
    date: '2026-06',
    title: '六月的另一件事',
    description: '这里写描述。',
    photo: '',
  },
  {
    type: 'show',
    date: '2026-07',
    title: '七月的故事',
    description: '这里写描述。',
    photo: '',
  },
  {
    type: 'travel',
    date: '2026-08',
    title: '八月的故事',
    description: '这里写描述。',
    photo: '',
  },
  {
    type: 'study',
    date: '2026-08',
    title: '八月的另一件事',
    description: '这里写描述。',
    photo: '',
  },
  {
    type: 'book',
    date: '2026-09',
    title: '九月的故事',
    description: '这里写描述。',
    photo: '',
  },
  {
    type: 'movie',
    date: '2026-10',
    title: '十月的故事',
    description: '这里写描述。',
    photo: '',
  },
  {
    type: 'exercise',
    date: '2026-10',
    title: '十月的另一件事',
    description: '这里写描述。',
    photo: '',
  },
  {
    type: 'show',
    date: '2026-11',
    title: '十一月的故事',
    description: '这里写描述。',
    photo: '',
  },
  {
    type: 'travel',
    date: '2026-12',
    title: '十二月的故事',
    description: '这里写描述。',
    photo: '',
  },
  {
    type: 'show',
    date: '2026-12-31',
    title: '一年的尾声',
    description: '写在年终的话。',
    photo: '',
  },
];
