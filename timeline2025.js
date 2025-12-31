const events = {
    message: {
        type: 'message',
        title: '写给远方的朋友',
        content: `
            <p>亲爱的朋友，</p>
            <p>好久不见啦！说真的，虽然咱们隔得远，平时也各忙各的，但每次静下来，总会想起你们。所以特意整理了这些零零碎碎，想着就算不能天天见面，也能用这种方式，让你们看看我最近的日子是啥模样。</p>   
            <p>平时聊天不多，但是我一直有想起你哦。特别感谢你，居然花了这么长时间一直读到这里，好像咱们又坐在了一块儿，慢慢聊着天。</p>
            <p>新年就要到啦，祝你新年快乐，平平安安的，每天都有点小确幸。</p>

            <p class="signature">—— Joyce</p>
        `
    },
    1: [
        {
            persons: [
                { name: '皮皮', avatar: 'profile-pipi.jpg' },
                { name: '贝塔', avatar: 'profile-beita.jpg' },
                { name: '大头', avatar: 'profile-datou.jpg' },
                { name: 'Joyce', avatar: 'profile-joyce.jpg' }
            ],
            date: '2025-01-01 - 2025-01-03',
            title: '元旦假期',
            description: '全家一起去了即墨古城，并没有很好玩，但是在服装批发市场买到了质量很好又极度便宜的衣服。',
            category: 'play',
            locations: [
                { name: '即墨古城', lat: 36.3856, lng: 120.4471 },
                { name: '即墨服装市场', lat: 36.3996, lng: 120.4609 }
            ],
            photos: ["2025_01_jimo.jpg"]
        },
        {
            persons: [
                { name: '皮皮', avatar: 'profile-pipi.jpg' },
                { name: '贝塔', avatar: 'profile-beita.jpg' },
                { name: '大头', avatar: 'profile-datou.jpg' },
                { name: 'Joyce', avatar: 'profile-joyce.jpg' }
            ],
            date: '2025-01-30',
            title: '琅玡台',
            description: '冒着寒风去了一趟琅玡台，这地方和以前风景一样，但是以前没有这么冷。',
            category: 'play',
            locations: [
                { name: '青岛琅玡台', lat: 35.6456, lng: 119.8801 },
            ],
            photos: ["2025_01_langyatai.jpg","2025_01_langyatai2.jpg"]
        },
        {
            persons: [
                { name: '皮皮', avatar: 'profile-pipi.jpg' },
                { name: '贝塔', avatar: 'profile-beita.jpg' },
                { name: '大头', avatar: 'profile-datou.jpg' },
                { name: 'Joyce', avatar: 'profile-joyce.jpg' }
            ],
            date: '2025-01-01 - 2025-01-30',
            title: '一张特别划算的游玩票',
            description: '因为买了海底世界和轮船的冬季票，整个冬天的周末要么在逛水族馆，要么坐船吹冷冷的海风。',
            category: 'play',
            locations: [
                { name: '青岛水族馆', lat: 36.0532, lng: 120.3224 },
                { name: '青岛奥帆中心', lat: 36.0499, lng: 120.4036 }
            ],
            photos: ["2025_01_aquarium.jpg", "2025_01_aquarium2.jpg"]
        }
    ],
    2: [
        {
            persons: [
                { name: '皮皮', avatar: 'profile-pipi.jpg' },
                { name: '贝塔', avatar: 'profile-beita.jpg' },
                { name: '大头', avatar: 'profile-datou.jpg' },
                { name: 'Joyce', avatar: 'profile-joyce.jpg' }
            ],
            date: '2025-02-16',
            title: '摩天大楼里的观景台',
            description: '觉得风景好美，于是花了很多钱拍照，结果小伙子们都吓得瑟瑟发抖。',
            category: 'play',
            locations: [
                { name: '青岛云上海天', lat: 36.0539, lng: 120.3114 },
            ],
            photos: ["2025_02_haitian.jpg", "2025_02_haitian2.jpg"]
        },
        {
            persons: [
                { name: '皮皮', avatar: 'profile-pipi.jpg' },
                { name: '贝塔', avatar: 'profile-beita.jpg' },
                { name: '大头', avatar: 'profile-datou.jpg' },
                { name: 'Joyce', avatar: 'profile-joyce.jpg' }
            ],
            date: '2025-02-01 - 2025-02-28',
            title: '中山公园和动物园',
            description: '中山公园和动物园连在一起。中山公园可以骑车。小朋友们喜欢看小动物，我们就经常去看小动物，动物园8.5元一张门票也太划算了。',
            category: 'play',
            locations: [
                { name: '青岛中山公园', lat: 36.0564, lng: 120.3490 },
                { name: '青岛动物园', lat: 36.0623, lng: 120.3518 }
            ],
            photos: ["2025_02_zhongshan.jpg"]
        }
    ],
    3: [
        {
            persons: [
                { name: '贝塔', avatar: 'profile-beita.jpg' },
            ],
            date: '2025-03-01',
            title: '幼儿园小班的陈贝塔',
            description: '刚满两岁半的陈贝塔上了幼儿园，每天都很懵。',
            category: 'work',
            photos: ['2025_03_beitaK.jpg',"2025_03_beitaK2.jpg"]
        },
        {
            persons: [
                { name: '皮皮', avatar: 'profile-pipi.jpg' },
                { name: '贝塔', avatar: 'profile-beita.jpg' },
                { name: 'Joyce', avatar: 'profile-joyce.jpg' }
            ],
            date: '2025-03-08',
            title: '庆祝妇女节',
            description: '参加幼儿园组织的妇女节活动，和小皮皮一起做手工，玩得很开心。',
            category: 'love',
            photos: [
                '2025_03_womensday.jpg',
             ],
        },
        {
            persons: [
                { name: '皮皮', avatar: 'profile-pipi.jpg' },
            ],
            date: '2025-03-16',
            title: '升旗手陈皮皮',
            description: '陈皮皮好不容易当了升旗手， 结果因为妈妈给穿了太多的衣服， 把帅气的旗手服撑得好难看。',
            category: 'work',
            photos: ['2025_03_pipi.jpg']
        },
        {
            persons: [
                { name: 'Joyce', avatar: 'profile-joyce.jpg' }
            ],
            date: '2025-03-29',
            title: '庆祝春分的聚会',
            description: '一年一度的春饼节，去姐妹家里吃了这辈子吃过的最好吃的春饼炸鸡凉拌藕，并且自己动手实践从热气腾腾锅里揪出了一张煎饼。',
            category: 'love',
            photos: ['2025_03_春分.jpg']
        },
        {
            persons: [
                { name: '皮皮', avatar: 'profile-pipi.jpg' },
                { name: '贝塔', avatar: 'profile-beita.jpg' },
                { name: '大头', avatar: 'profile-datou.jpg' },
                { name: 'Joyce', avatar: 'profile-joyce.jpg' }
            ],
            date: '2025-03-01 - 2025-03-31',
            title: '春天就适合玩滑梯',
            description: '所以我们都在浮山玩滑梯。',
            category: 'play',
            locations: [
                { name: '青岛浮山森林公园', lat: 36.1000, lng: 120.4036 },
            ],
            photos: ["2025_03_浮山.jpg"]
        }
    ],
    4: [
        {
            persons: [
                { name: '皮皮', avatar: 'profile-pipi.jpg' },
                { name: '贝塔', avatar: 'profile-beita.jpg' },
                { name: '大头', avatar: 'profile-datou.jpg' },
                { name: 'Joyce', avatar: 'profile-joyce.jpg' }
            ],
            date: '2025-04-05',
            title: '假期哪里有人少的地方',
            description: '春暖花开， 不出去玩实在不划算， 出去玩又觉得到处的游客都太多了很麻烦，看到胶州的旅馆没有涨价就以为人不会太多，太天真了！',
            category: 'love',
            locations: [
                { name: '青岛少海国家湿地公园', lat: 36.2653, lng: 120.0944 },
            ],
            photos: ["2025_04_胶州.jpg"]
        }
    ],
    5: [
        {
            persons: [
                { name: '皮皮', avatar: 'profile-pipi.jpg' },
                { name: '贝塔', avatar: 'profile-beita.jpg' },
                { name: '大头', avatar: 'profile-datou.jpg' },
                { name: 'Joyce', avatar: 'profile-joyce.jpg' }
            ],
            date: '2025-05-01 - 2025-05-31',
            title: '五月的主题是挖沙',
            description: '每个周末都在挖沙',
            category: 'health',
            locations: [
                { name: '青岛石老人沙滩', lat: 36.0612, lng: 120.4713 },
                { name: '青岛沙子口沙滩', lat: 36.1350, lng: 120.5389 },
                { name: '青岛八大关沙滩', lat: 36.0589, lng: 120.3289 },
                { name: '青岛仰口沙滩', lat: 36.2039, lng: 120.6489 }
            ],
            photos: ["2025_05_挖沙.jpg"]
        }
    ],
    6: [
        {
            persons: [
                { name: '皮皮', avatar: 'profile-pipi.jpg' },
                { name: 'Joyce', avatar: 'profile-joyce.jpg' },
                { name: '大头', avatar: 'profile-datou.jpg' },
            ],
            date: '2025-06-10',
            title: '皮皮的第一次音乐会演出',
            description: '皮崽的第一次音乐会演出，因为精彩的报幕得到了阵阵掌声和欢呼！',
            category: 'work',
            photos: ["2025_06_音乐会.jpg"],
            locations: [
                { name: '青岛臻传音乐', lat: 36.0659, lng: 120.3844 },
            ],
        },
        {
            persons: [
                { name: '皮皮', avatar: 'profile-pipi.jpg' },
            ],
            date: '2025-06-15',
            title: '皮皮会跳绳了',
            description: '太棒了！',
            category: 'health',
            photos: []
        },
        {
            persons: [
                { name: 'Joyce', avatar: 'profile-joyce.jpg' },
            ],
            date: '2025-06-01 - 2025-06-30',
            title: '短暂尝试了Kpop',
            description: '因为跳得太丑而放弃了。',
            category: 'health',
            photos: []
        },

    ],
    7: [
        {
            persons: [
                { name: '贝塔', avatar: 'profile-beita.jpg' },
                { name: '大头', avatar: 'profile-datou.jpg' },
                { name: 'Joyce', avatar: 'profile-joyce.jpg' },
                { name: '皮皮', avatar: 'profile-pipi.jpg' }
            ],
            date: '2025-07-06',
            title: '最好的盆友来找我玩',
            description: '我的闺蜜带者全家来找我玩，开心！',
            category: 'love',
            locations: [
                { name: '青岛极地海洋世界', lat: 36.0547, lng: 120.4658 },
                { name: '青岛海天中心', lat: 36.0524, lng: 120.3227 },
                { name: '青岛万象汇', lat: 36.0981, lng: 120.4148 }
            ],
            photos: ["2025_07_xinxin.jpg"]
        },
        {
            persons: [
                { name: '贝塔', avatar: 'profile-beita.jpg' },
                { name: '大头', avatar: 'profile-datou.jpg' },
                { name: 'Joyce', avatar: 'profile-joyce.jpg' },
                { name: '皮皮', avatar: 'profile-pipi.jpg' }
            ],
            date: '2025-07-13 - 2025-07-31',
            title: '又开始逛水族馆了',
            description: '买了极地的年卡，开始了逛水族馆又逛水族馆坐摩天轮又坐摩天轮的周末。',
            category: 'play',
            locations: [
                { name: '青岛极地海洋世界', lat: 36.0547, lng: 120.4658 },
            ],
            photos: ["2025_07_jidi.jpg"]
        },
        {
            persons: [
                { name: '大头', avatar: 'profile-datou.jpg' },
                { name: 'Joyce', avatar: 'profile-joyce.jpg' },
            ],
            date: '2025-07-26',
            title: '穆夏',
            description: '去美术馆看了穆夏的画展。',
            category: 'play',
            locations: [
                { name: '青岛美术馆', lat: 36.0589, lng: 120.3224 },
            ],
            photos: ["2025_07_穆夏.jpg"]
        }
    ],
    8: [
        {
            persons: [
                { name: 'Joyce', avatar: 'profile-joyce.jpg' },
                { name: '贝塔', avatar: 'profile-beita.jpg' },
                { name: '皮皮', avatar: 'profile-pipi.jpg' },
                { name: '大头', avatar: 'profile-datou.jpg' },
            ],
            date: '2025-08-16',
            title: '烟台',
            description: '全家一起去烟台的欧乐堡。当天早上把车蹭了，现买了火车票，非常折腾地去了。去了又遇到了旅馆里好多年不见的停电。好在水上乐园足够好玩，下次还去咔咔。',
            category: 'play',
            locations: [
                { name: '烟台欧乐堡', lat: 36.0671, lng: 120.3826 },
            ],
            photos: [
                '2025_08_europark.jpg',
            ]
        },
        {
            persons: [
                { name: 'Joyce', avatar: 'profile-joyce.jpg' },
            ],
            date: '2025-08-29',
            title: '离职',
            description: '离开了工作十二年的岗位。送走了自己所有的技术书籍。收到了好多好多礼物。和好多朋友好好聊了天。想到以后可能再也不用做H248了，有点开心又有点伤感。',
            category: 'work',
        }
    ],
    9: [
        {
            persons: [
                { name: 'Joyce', avatar: 'profile-joyce.jpg' },
                { name: '贝塔', avatar: 'profile-beita.jpg' },
                { name: '皮皮', avatar: 'profile-pipi.jpg' },
            ],
            date: '2025-09-03 - 2025-09-12',
            title: '西双版纳 & 普洱',
            description: "太好玩啦， 喜欢热带雨林，喜欢小熊猫。喜欢夜晚的天空，和爱吃水果的蝙蝠。",
            category: 'play',
            locations: [
                { name: '西双版纳', lat: 22.0079, lng: 100.7979 },
                { name: '普洱', lat: 23.0477, lng: 100.9667 }
            ],
            photos: ["2025_09_yunnan.jpg", "2025_09_yunnan2.jpg", "2025_09_yunnan3.jpg"]
        },
        {
            persons: [
                { name: 'Joyce', avatar: 'profile-joyce.jpg' },
            ],
            date: '2025-09-15',
            title: '新工作',
            description: '开始了新工作，以后就是算法工程师啦。',
            category: 'work',
        }
    ],
    10: [
        {
            persons: [
                { name: 'Joyce', avatar: 'profile-joyce.jpg' },
                { name: '贝塔', avatar: 'profile-beita.jpg' },
                { name: '皮皮', avatar: 'profile-pipi.jpg' },
                { name: '大头', avatar: 'profile-datou.jpg' },
            ],
            date: '2025-10-01 - 2025-10-31',
            title: '崂山',
            description: '时隔六年，又办了崂山的年卡， 开始周末爬山的生活了。农家宴比以往进步很多，不知道是不是因为我最近吃的不好吃的比较多。',
            category: 'play',
            locations: [
                { name: '崂山北九水', lat: 36.1767, lng: 120.5539 },
                { name: '崂山仰口', lat: 36.2039, lng: 120.6489 }
            ],
            photos: ["2025_10_崂山.jpg", "2025_10_崂山的柿子.jpg"]
        }
    ],
    11: [
        {
            persons: [
                { name: '皮皮', avatar: 'profile-pipi.jpg' }
            ],
            date: '2025-11-14',
            title: '皮皮的第一次钢琴比赛',
            description: '发挥超稳的，老母亲激动地热泪盈眶，得了很好的评委反馈，并且得了一等奖。',
            category: 'work',
            locations: [
                { name: '青岛臻传音乐', lat: 36.0659, lng: 120.3844 },
            ],
            photos: ["2025_11_钢琴比赛.jpg"]
        },
        {
            persons: [
                { name: 'Joyce', avatar: 'profile-joyce.jpg' },
                { name: '贝塔', avatar: 'profile-beita.jpg' },
                { name: '皮皮', avatar: 'profile-pipi.jpg' },
                { name: '大头', avatar: 'profile-datou.jpg' },
            ],
            date: '2025-11-15',
            title: '日照',
            description: '去了日照玩， 酒店里有一个水上乐园，超好玩啊， 玩得开心。',
            category: 'play',
            locations: [
                { name: '日照开元森泊酒店', lat: 35.4202, lng: 119.5294 },
            ],
            photos: ["2025_11_日照.jpg"]
        }
    ],
    12: [
        {
            persons: [
                { name: '皮皮', avatar: 'profile-pipi.jpg' },
                { name: '贝塔', avatar: 'profile-beita.jpg' },
            ],
            date: '2025-12-14',
            title: '下雪啦',
            description: '小伙子们好喜欢下雪的。',
            category: 'love',
            photos: ["2025_12_snow.jpg"]
        },
        {
            persons: [
                { name: 'Joyce', avatar: 'profile-joyce.jpg' },
            ],
            date: '2025-12-09 - 2025-12-31',
            title: '游泳课',
            description: '办了游泳馆的会员，年后得请个教练了，游得乱七八糟的。',
            category: 'health',
        },
        {
            persons: [
                { name: 'Joyce', avatar: 'profile-joyce.jpg' },
            ],
            date: '2025-12-09 - 2025-12-31',
            title: '动物森友会',
            description: '五年了，终于集齐了博物馆的馆藏， 虽然也是淘宝买的。',
            category: 'play',
        }
    ]
};

const monthNames = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
];

// Store maps for later reference
const maps = {};

function renderTimeline() {
    const timelineEl = document.getElementById('timeline');
    
    for (let month = 1; month <= 12; month++) {
        const monthEl = document.createElement('div');
        monthEl.className = 'month';
        
        const monthEvents = events[month] || [];
        
        let eventsHtml = '';
        if (monthEvents.length > 0) {
            // 分离有媒体和无媒体的事件
            const eventsWithMedia = monthEvents.filter(event => 
                (event.photos && event.photos.length > 0) || 
                (event.videos && event.videos.length > 0)
            );
            const eventsWithoutMedia = monthEvents.filter(event => 
                !(event.photos && event.photos.length > 0) && 
                !(event.videos && event.videos.length > 0)
            );
            
            let html = '';
            
            // 渲染有媒体的事件（全宽显示）
            if (eventsWithMedia.length > 0) {
                html += eventsWithMedia.map((event, index) => {
                    const eventId = `event-${month}-${index}`;
                    
                    let photosHtml = '';
                    if (event.photos && event.photos.length > 0) {
                        photosHtml = `
                            <div class="event-photos">
                                ${event.photos.map(photo => `<img src="${photo}" alt="${event.title}" onclick="openPhoto('${photo}')">`).join('')}
                            </div>
                        `;
                    }
                    
                    let videosHtml = '';
                    if (event.videos && event.videos.length > 0) {
                        videosHtml = `
                            <div class="event-videos">
                                ${event.videos.map(video => `
                                    <video controls onclick="event.stopPropagation()">
                                        <source src="${video}" type="video/mp4">
                                        您的浏览器不支持视频播放。
                                    </video>
                                `).join('')}
                            </div>
                        `;
                    }
                    
                    let locationHtml = '';
                    if (event.locations && event.locations.length > 0) {
                        const locationNames = event.locations.map(loc => loc.name).join('、');
                        locationHtml = `
                            <div class="event-location">
                                <div class="location-info">
                                    <span class="location-icon">📍</span>
                                    <span class="location-name">${locationNames}</span>
                                </div>
                                <div id="${eventId}-map" class="event-map"></div>
                            </div>
                        `;
                    }
                    
                    const categoryClass = event.category || 'work';
                    
                    return `
                        <div class="event event-${categoryClass}">
                            <div class="event-header">
                                <div class="event-avatars">
                                    ${event.persons.map(p => `<img src="${p.avatar}" alt="${p.name}" class="event-avatar" title="${p.name}">`).join('')}
                                </div>
                                <span class="event-person">${event.persons.map(p => p.name).join('、')}</span>
                                <span class="event-date">${event.date}</span>
                            </div>
                            <div class="event-title">${event.title}</div>
                            <div class="event-description">${event.description}</div>
                            ${locationHtml}
                            ${photosHtml}
                            ${videosHtml}
                        </div>
                    `;
                }).join('');
            }
            
            // 渲染无媒体的事件（4列横向）
            if (eventsWithoutMedia.length > 0) {
                html += '<div class="compact-events-grid">';
                html += eventsWithoutMedia.map((event, index) => {
                    const eventId = `event-${month}-compact-${index}`;
                    
                    let locationHtml = '';
                    if (event.locations && event.locations.length > 0) {
                        const locationNames = event.locations.map(loc => loc.name).join('、');
                        locationHtml = `
                            <div class="compact-location">
                                <span class="location-icon">📍</span>
                                <span class="location-name">${locationNames}</span>
                            </div>
                        `;
                    }
                    
                    const categoryClass = event.category || 'work';
                    
                    return `
                        <div class="event compact event-${categoryClass}">
                            <div class="event-header">
                                <div class="event-avatars">
                                    ${event.persons.map(p => `<img src="${p.avatar}" alt="${p.name}" class="event-avatar" title="${p.name}">`).join('')}
                                </div>
                                <span class="event-person">${event.persons.map(p => p.name).join('、')}</span>
                                <span class="event-date">${event.date}</span>
                            </div>
                            <div class="event-title">${event.title}</div>
                            <div class="event-description">${event.description}</div>
                            ${locationHtml}
                        </div>
                    `;
                }).join('');
                html += '</div>';
            }
            
            eventsHtml = html;
        } else {
            eventsHtml = '<div class="no-events">本月暂无特殊事件</div>';
        }
        
        monthEl.innerHTML = `
            <div class="month-header">${monthNames[month - 1]}</div>
            <div class="events">${eventsHtml}</div>
        `;
        
        timelineEl.appendChild(monthEl);
    }
    
    // Initialize maps after DOM is updated
    initializeMaps();
    
    // 添加给朋友的消息
    if (events.message && events.message.type === 'message') {
        const messageEl = document.createElement('div');
        messageEl.className = 'month message-section';
        messageEl.innerHTML = `
            <div class="month-header message-header">💌 ${events.message.title}</div>
            <div class="message-content">${events.message.content}</div>
        `;
        timelineEl.appendChild(messageEl);
    }
    
    // 添加 Coming Events in 2026 部分
    const comingEl = document.createElement('div');
    comingEl.className = 'month coming-events';
    
    const comingEvents = [
        {
            persons: [
                { name: '皮皮', avatar: 'profile-pipi.jpg' },
                { name: '贝塔', avatar: 'profile-beita.jpg' },
                { name: '大头', avatar: 'profile-datou.jpg' },
                { name: 'Joyce', avatar: 'profile-joyce.jpg' }
            ],
            date: '2026-01-01 - 2026-01-03',
            title: '徐州',
            description: '十分期待徐州的美食。',
            category: 'play'
        },
        {
            persons: [
                { name: '皮皮', avatar: 'profile-pipi.jpg' },
                { name: '大头', avatar: 'profile-datou.jpg' },
                { name: 'Joyce', avatar: 'profile-joyce.jpg' }
            ],
            date: '2026-01-16',
            title: '马克西姆的钢琴音乐会',
            description: '期待！',
            category: 'play'
        },
    ];
    
    let comingHtml = '<div class="compact-events-grid">';
    comingHtml += comingEvents.map(event => {
        const categoryClass = event.category || 'work';
        
        return `
            <div class="event compact event-${categoryClass}">
                <div class="event-header">
                    <div class="event-avatars">
                        ${event.persons.map(p => `<img src="${p.avatar}" alt="${p.name}" class="event-avatar" title="${p.name}">`).join('')}
                    </div>
                    <span class="event-person">${event.persons.map(p => p.name).join('、')}</span>
                    <span class="event-date">${event.date}</span>
                </div>
                <div class="event-title">${event.title}</div>
                <div class="event-description">${event.description}</div>
            </div>
        `;
    }).join('');
    comingHtml += '</div>';
    
    comingEl.innerHTML = `
        <div class="month-header coming-header">🚀 Coming Events in 2026</div>
        ${comingHtml}
    `;
    
    timelineEl.appendChild(comingEl);
}

// 打开照片查看器（可选功能）
function openPhoto(photoSrc) {
    // 创建模态框显示大图
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        cursor: pointer;
    `;
    
    const img = document.createElement('img');
    img.src = photoSrc;
    img.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        object-fit: contain;
        border-radius: 8px;
    `;
    
    modal.appendChild(img);
    document.body.appendChild(modal);
    
    // 点击关闭模态框
    modal.onclick = () => {
        document.body.removeChild(modal);
    };
    
    // 按ESC关闭模态框
    const closeOnEsc = (e) => {
        if (e.key === 'Escape') {
            document.body.removeChild(modal);
            document.removeEventListener('keydown', closeOnEsc);
        }
    };
    document.addEventListener('keydown', closeOnEsc);
}

// Initialize maps for events with location data
function initializeMaps() {
    for (let month = 1; month <= 12; month++) {
        const monthEvents = events[month] || [];
        
        // Initialize maps for all events with locations (not just those with media)
        monthEvents.forEach((event, index) => {
            if (event.locations && event.locations.length > 0) {
                const eventId = `event-${month}-${index}`;
                const mapId = `${eventId}-map`;
                const mapElement = document.getElementById(mapId);
                
                if (mapElement) {
                    // Calculate center point (average of all locations)
                    const avgLat = event.locations.reduce((sum, loc) => sum + loc.lat, 0) / event.locations.length;
                    const avgLng = event.locations.reduce((sum, loc) => sum + loc.lng, 0) / event.locations.length;
                    
                    // Create map
                    const map = L.map(mapId, {
                        center: [avgLat, avgLng],
                        zoom: 12,
                        zoomControl: false,
                        attributionControl: false,
                        scrollWheelZoom: false
                    });
                    
                    // Add OpenStreetMap tiles
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        maxZoom: 19
                    }).addTo(map);
                    
                    // Add markers for all locations
                    event.locations.forEach(loc => {
                        L.marker([loc.lat, loc.lng])
                            .bindPopup(loc.name)
                            .addTo(map);
                    });
                    
                    // Fit bounds to show all markers
                    if (event.locations.length > 1) {
                        const bounds = L.latLngBounds(event.locations.map(loc => [loc.lat, loc.lng]));
                        map.fitBounds(bounds, { padding: [20, 20] });
                    }
                    
                    // Disable scroll zoom to prevent page scrolling interference
                    mapElement.addEventListener('wheel', (e) => {
                        e.stopPropagation();
                    }, { passive: true });
                    
                    // Store map reference
                    maps[mapId] = map;
                }
            }
        });
    }
}

// Render timeline when page loads
document.addEventListener('DOMContentLoaded', renderTimeline);
