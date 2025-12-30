const events = {
    1: [
        {
            persons: [
                { name: '贝塔', avatar: 'profile-beita.jpg' }
            ],
            date: '2025-01-01',
            title: '新年第一天',
            description: '和家人一起庆祝新年，制定了2025年的目标和计划。',
            category: 'love',
            photos: [] // 可以在这里添加照片路径，例如: ['photo1.jpg', 'photo2.jpg']
        },
        {
            persons: [
                { name: '大头', avatar: 'profile-datou.jpg' }
            ],
            date: '2025-01-15',
            title: '项目启动',
            description: '正式启动了今年的重要项目，团队充满热情和期待。',
            category: 'work',
            photos: []
        }
    ],
    2: [
        {
            persons: [
                { name: 'Joyce', avatar: 'profile-joyce.jpg' }
            ],
            date: '2025-02-14',
            title: '情人节',
            description: '和朋友们一起度过了一个浪漫而温馨的情人节。',
            category: 'love',
            photos: []
        }
    ],
    3: [
        {
            persons: [
                { name: '皮皮', avatar: 'profile-pipi.jpg' },
                { name: '贝塔', avatar: 'profile-beita.jpg' },
                { name: '大头', avatar: 'profile-datou.jpg' },
                { name: 'Joyce', avatar: 'profile-joyce.jpg' }
            ],
            date: '2025-03-08',
            title: '四人聚会',
            description: '四人一起参加了公司组织的妇女节庆祝活动，收获满满。',
            category: 'play',
            photos: [
                'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400',
                'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400'
            ],
            videos: ['https://www.w3schools.com/html/mov_bbb.mp4']
        },
        {
            persons: [
                { name: '贝塔', avatar: 'profile-beita.jpg' }
            ],
            date: '2025-03-20',
            title: '春分',
            description: '春分时节，和朋友一起去踏青，欣赏春天的美景。',
            category: 'health',
            photos: []
        }
    ],
    4: [
        {
            persons: [
                { name: '大头', avatar: 'profile-datou.jpg' }
            ],
            date: '2025-04-05',
            title: '清明节',
            description: '回乡祭祖，缅怀先人，与家人团聚。',
            category: 'love',
            photos: []
        }
    ],
    5: [
        {
            persons: [
                { name: 'Joyce', avatar: 'profile-joyce.jpg' }
            ],
            date: '2025-05-01',
            title: '劳动节',
            description: '劳动节假期，放松身心，为接下来的工作充电。',
            category: 'health',
            photos: []
        }
    ],
    6: [
        {
            persons: [
                { name: '皮皮', avatar: 'profile-pipi.jpg' },
                { name: '贝塔', avatar: 'profile-beita.jpg' }
            ],
            date: '2025-06-01',
            title: '儿童节',
            description: '虽然已经长大，但还是要保持童心，快乐过节！',
            category: 'play',
            photos: []
        },
        {
            persons: [
                { name: '贝塔', avatar: 'profile-beita.jpg' },
                { name: '大头', avatar: 'profile-datou.jpg' },
                { name: 'Joyce', avatar: 'profile-joyce.jpg' },
                { name: '皮皮', avatar: 'profile-pipi.jpg' }
            ],
            date: '2025-06-15',
            title: '项目完成庆祝',
            description: '经过三个月的努力，项目终于顺利交付！四人一起庆祝。',
            category: 'work',
            photos: []
        }
    ],
    7: [
        {
            persons: [
                { name: '大头', avatar: 'profile-datou.jpg' }
            ],
            date: '2025-07-01',
            title: '季度总结',
            description: '完成了上半年工作总结，为下半年制定新计划。',
            category: 'work',
            photos: []
        }
    ],
    8: [
        {
            persons: [
                { name: 'Joyce', avatar: 'profile-joyce.jpg' },
                { name: '贝塔', avatar: 'profile-beita.jpg' },
                { name: '皮皮', avatar: 'profile-pipi.jpg' }
            ],
            date: '2025-08-15',
            title: '暑假旅行',
            description: '和好友们一起去了海边度假，享受阳光和沙滩。',
            category: 'play',
            photos: [
                'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400',
                'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=400',
                'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400'
            ]
        }
    ],
    9: [
        {
            persons: [
                { name: '皮皮', avatar: 'profile-pipi.jpg' }
            ],
            date: '2025-09-10',
            title: '教师节',
            description: '感谢曾经教导过自己的老师们，送上了祝福和礼物。',
            category: 'love',
            photos: []
        },
        {
            persons: [
                { name: '贝塔', avatar: 'profile-beita.jpg' },
                { name: '大头', avatar: 'profile-datou.jpg' },
                { name: 'Joyce', avatar: 'profile-joyce.jpg' },
                { name: '皮皮', avatar: 'profile-pipi.jpg' }
            ],
            date: '2025-09-25',
            title: '中秋团圆',
            description: '中秋团圆，四人一起赏月吃月饼，共度佳节。',
            category: 'love',
            photos: []
        }
    ],
    10: [
        {
            persons: [
                { name: '大头', avatar: 'profile-datou.jpg' },
                { name: '贝塔', avatar: 'profile-beita.jpg' }
            ],
            date: '2025-10-01',
            title: '国庆节',
            description: '庆祝祖国华诞，享受七天长假。',
            category: 'play',
            photos: []
        }
    ],
    11: [
        {
            persons: [
                { name: 'Joyce', avatar: 'profile-joyce.jpg' },
                { name: '皮皮', avatar: 'profile-pipi.jpg' }
            ],
            date: '2025-11-11',
            title: '双十一购物',
            description: '理性消费，只买需要的，享受优惠。',
            category: 'play',
            photos: []
        }
    ],
    12: [
        {
            persons: [
                { name: '皮皮', avatar: 'profile-pipi.jpg' },
                { name: '贝塔', avatar: 'profile-beita.jpg' },
                { name: '大头', avatar: 'profile-datou.jpg' },
                { name: 'Joyce', avatar: 'profile-joyce.jpg' }
            ],
            date: '2025-12-25',
            title: '圣诞节',
            description: '四个人一起过圣诞，交换礼物，分享快乐。',
            category: 'love',
            photos: []
        },
        {
            persons: [
                { name: '贝塔', avatar: 'profile-beita.jpg' },
                { name: '大头', avatar: 'profile-datou.jpg' },
                { name: 'Joyce', avatar: 'profile-joyce.jpg' },
                { name: '皮皮', avatar: 'profile-pipi.jpg' }
            ],
            date: '2025-12-31',
            title: '跨年夜',
            description: '四个人一起回顾2025年的成长和收获，展望美好的2026年！',
            category: 'love',
            photos: []
        }
    ]
};

const monthNames = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
];

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
                html += eventsWithMedia.map(event => {
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
                            ${photosHtml}
                            ${videosHtml}
                        </div>
                    `;
                }).join('');
            }
            
            // 渲染无媒体的事件（4列横向）
            if (eventsWithoutMedia.length > 0) {
                html += '<div class="compact-events-grid">';
                html += eventsWithoutMedia.map(event => {
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
            date: '2026-01-01',
            title: '新年聚会',
            description: '期待在2026年的第一天，四个人再次相聚，展望新一年的美好！',
            category: 'love'
        },
        {
            persons: [
                { name: '皮皮', avatar: 'profile-pipi.jpg' },
                { name: '贝塔', avatar: 'profile-beita.jpg' }
            ],
            date: '2026-02-14',
            title: '情人节庆祝',
            description: '计划一起度过浪漫的情人节，创造美好回忆。',
            category: 'love'
        },
        {
            persons: [
                { name: '大头', avatar: 'profile-datou.jpg' },
                { name: 'Joyce', avatar: 'profile-joyce.jpg' }
            ],
            date: '2026-03-08',
            title: '妇女节活动',
            description: '参加公司组织的妇女节庆祝活动，延续2025年的快乐。',
            category: 'play'
        },
        {
            persons: [
                { name: '贝塔', avatar: 'profile-beita.jpg' },
                { name: 'Joyce', avatar: 'profile-joyce.jpg' },
                { name: '皮皮', avatar: 'profile-pipi.jpg' }
            ],
            date: '2026-05-01',
            title: '五一假期旅行',
            description: '计划去一个新地方旅行，探索未知的风景。',
            category: 'play'
        },
        {
            persons: [
                { name: '大头', avatar: 'profile-datou.jpg' },
                { name: '贝塔', avatar: 'profile-beita.jpg' },
                { name: 'Joyce', avatar: 'profile-joyce.jpg' },
                { name: '皮皮', avatar: 'profile-pipi.jpg' }
            ],
            date: '2026-06-15',
            title: '新项目启动',
            description: '四个人将再次合作，开启新的项目征程！',
            category: 'work'
        }
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

// Render timeline when page loads
document.addEventListener('DOMContentLoaded', renderTimeline);
