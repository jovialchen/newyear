const events = {
    message: {
        type: 'message',
        title: 'To My Faraway Friend',
        content: `
            <p>Dear friend,</p>
            <p>It's been a while! Honestly, even though we're far apart and busy with our own lives, I'm missing you a lot and the old days we spent together. So I put together these bits and pieces, thinking that even if we can't meet every day, I can at least let you see what my recent days look like through this.</p>   
            <p>I'm especially grateful that you took the time to read all the way here.</p>
            <p>New Year is coming! I wish you a happy New Year, peace and safety, and little joys every day.</p>

            <p class="signature">— Joyce</p>
        `
    },
    1: [
        {
            persons: [
                { name: 'Pipi', avatar: 'profile-pipi.jpg' },
                { name: 'Beita', avatar: 'profile-beita.jpg' },
                { name: 'Datou', avatar: 'profile-datou.jpg' },
                { name: 'Joyce', avatar: 'profile-joyce.jpg' }
            ],
            date: '2025-01-01 - 2025-01-03',
            title: 'New Year Holiday',
            description: 'The whole family went to Jimo Ancient City. It wasn\'t very fun, but we bought really high-quality and extremely cheap clothes at the clothing wholesale market.',
            category: 'play',
            locations: [
                { name: 'Jimo Ancient City', lat: 36.3856, lng: 120.4471 },
                { name: 'Jimo Clothing Market', lat: 36.3996, lng: 120.4609 }
            ],
            photos: ["2025_01_jimo.jpg"]
        },
        {
            persons: [
                { name: 'Pipi', avatar: 'profile-pipi.jpg' },
                { name: 'Beita', avatar: 'profile-beita.jpg' },
                { name: 'Datou', avatar: 'profile-datou.jpg' },
                { name: 'Joyce', avatar: 'profile-joyce.jpg' }
            ],
            date: '2025-01-30',
            title: 'Langyatai',
            description: 'Last time I visited this spot was in 1995. The scenery is the same as before, but it wasn\'t this cold back then.',
            category: 'play',
            locations: [
                { name: 'Qingdao Langyatai', lat: 35.6456, lng: 119.8801 },
            ],
            photos: ["2025_01_langyatai.jpg","2025_01_langyatai2.jpg"]
        },
        {
            persons: [
                { name: 'Pipi', avatar: 'profile-pipi.jpg' },
                { name: 'Beita', avatar: 'profile-beita.jpg' },
                { name: 'Datou', avatar: 'profile-datou.jpg' },
                { name: 'Joyce', avatar: 'profile-joyce.jpg' }
            ],
            date: '2025-01-01 - 2025-01-30',
            title: 'Aquarium and Boat',
            description: 'We bought really cheap season tickets for the aquarium and the one-hour cruise around Jiaozhou Bay, so we ended up spending every weekend either at the aquarium or on the boat.',
            category: 'play',
            locations: [
                { name: 'Qingdao Aquarium', lat: 36.0532, lng: 120.3224 },
                { name: 'Qingdao Olympic Sailing Center', lat: 36.0499, lng: 120.4036 }
            ],
            photos: ["2025_01_aquarium.jpg", "2025_01_aquarium2.jpg"]
        }
    ],
    2: [
        {
            persons: [
                { name: 'Pipi', avatar: 'profile-pipi.jpg' },
                { name: 'Beita', avatar: 'profile-beita.jpg' },
                { name: 'Datou', avatar: 'profile-datou.jpg' },
                { name: 'Joyce', avatar: 'profile-joyce.jpg' }
            ],
            date: '2025-02-16',
            title: 'Observation Deck in a Skyscraper',
            description: 'This is one of my favorite spots in Qingdao, and it was the first time I brought both kids here. The view was really beatufiful, so I decided to get some nice photos done. But the thing is, the little ones were absolutely terrified during the whole shoot!',
            category: 'play',
            locations: [
                { name: 'Qingdao Haitian Center', lat: 36.0539, lng: 120.3114 },
            ],
            photos: ["2025_02_haitian.jpg", "2025_02_haitian2.jpg"]
        },
        {
            persons: [
                { name: 'Pipi', avatar: 'profile-pipi.jpg' },
                { name: 'Beita', avatar: 'profile-beita.jpg' },
                { name: 'Datou', avatar: 'profile-datou.jpg' },
                { name: 'Joyce', avatar: 'profile-joyce.jpg' }
            ],
            date: '2025-02-01 - 2025-02-28',
            title: 'Zhongshan Park and Zoo',
            description: 'Zhongshan Park and the zoo are connected, so it’s a perfect trip for the kids. They can ride bikes in the park section and then visit the animals — lions, tigers, vultures, pandas — all inside the same grounds. Zhongshan Park is completely free and the ticket to the zoo is only 8.5 RMB. ',
            category: 'play',
            locations: [
                { name: 'Qingdao Zhongshan Park', lat: 36.0564, lng: 120.3490 },
                { name: 'Qingdao Zoo', lat: 36.0623, lng: 120.3518 }
            ],
            photos: ["2025_02_zhongshan.jpg"]
        }
    ],
    3: [
        {
            persons: [
                { name: 'Beita', avatar: 'profile-beita.jpg' },
            ],
            date: '2025-03-01',
            title: 'Beita Starts Kindergarten',
            description: 'Our little Beita has just turned two and a half and has started his first year of Kindergarten (Here Kindergarten typically spans three years (or more) before primary school.) Every day is a new adventure for him, and he often looks completely bewildered.',
            category: 'work',
            photos: ['2025_03_beitaK.jpg',"2025_03_beitaK2.jpg"]
        },
        {
            persons: [
                { name: 'Pipi', avatar: 'profile-pipi.jpg' },
                { name: 'Beita', avatar: 'profile-beita.jpg' },
                { name: 'Joyce', avatar: 'profile-joyce.jpg' }
            ],
            date: '2025-03-08',
            title: 'Celebrating Women\'s Day',
            description: 'Participated in the Women\'s Day activity organized by the kindergarten, worked on a craft project together with Pipi, and had a lot of fun.',
            category: 'love',
            photos: [
                '2025_03_womensday.jpg',
             ],
        },
        {
            persons: [
                { name: 'Pipi', avatar: 'profile-pipi.jpg' },
            ],
            date: '2025-03-16',
            title: 'Flag Raiser Chen Pipi',
            description: 'Chen Pipi finally became a flag raiser. But because I dressed him in too many clothes, the handsome uniform was stretched to look terrible.',
            category: 'work',
            photos: ['2025_03_pipi.jpg']
        },
        {
            persons: [
                { name: 'Joyce', avatar: 'profile-joyce.jpg' }
            ],
            date: '2025-03-29',
            title: 'Spring Equinox Gathering',
            description: 'Got together with friends for the annual Spring Pancake Festival. The food was incredible — possibly the best spring pancakes, fried chicken, and cold lotus root I\'ve ever had. The best part was to `pull a steaming hot pancake right out of the wok with my own hands`.  If that sounds unusual to you, don’t worry — it was a first for me too! I\'d never heard of making Chinese food quite like that.',
            category: 'love',
            photos: ['2025_03_春分.jpg']
        },
        {
            persons: [
                { name: 'Pipi', avatar: 'profile-pipi.jpg' },
                { name: 'Beita', avatar: 'profile-beita.jpg' },
                { name: 'Datou', avatar: 'profile-datou.jpg' },
                { name: 'Joyce', avatar: 'profile-joyce.jpg' }
            ],
            date: '2025-03-01 - 2025-03-31',
            title: 'Spring Slide Days',
            description: 'The kids love the little playgrounds up on Fushan Hill. Now that it\'s spring, we\'re back to our favorite activity: going down the slides.',
            category: 'play',
            locations: [
                { name: 'Qingdao Fushan Forest Park', lat: 36.1000, lng: 120.4036 },
            ],
            photos: ["2025_03_浮山.jpg"]
        }
    ],
    4: [
        {
            persons: [
                { name: 'Pipi', avatar: 'profile-pipi.jpg' },
                { name: 'Beita', avatar: 'profile-beita.jpg' },
                { name: 'Datou', avatar: 'profile-datou.jpg' },
                { name: 'Joyce', avatar: 'profile-joyce.jpg' }
            ],
            date: '2025-04-05',
            title: 'Finding a Less Crowded Spot (Spoiler: Failed)',
            description: 'It\'s spring, and the flowers are out. It feels wrong not to go somewhere, but the thought of tourist crowds is exhausting. I saw hotels in Jiaozhou hadn\'t raised their rates and hoped it meant fewer people. A naive hope, as it turned out. The place was just as packed.',
            category: 'love',
            locations: [
                { name: 'Qingdao Shaohai National Wetland Park', lat: 36.2653, lng: 120.0944 },
            ],
            photos: ["2025_04_胶州.jpg"]
        }
    ],
    5: [
        {
            persons: [
                { name: 'Pipi', avatar: 'profile-pipi.jpg' },
                { name: 'Beita', avatar: 'profile-beita.jpg' },
                { name: 'Datou', avatar: 'profile-datou.jpg' },
                { name: 'Joyce', avatar: 'profile-joyce.jpg' }
            ],
            date: '2025-05-01 - 2025-05-31',
            title: 'May\'s Theme: All About Sand',
            description: 'Weekend agenda for May: playing in the sand at a differnet beach.',
            category: 'health',
            locations: [
                { name: 'Qingdao Shilaoren Beach', lat: 36.0612, lng: 120.4713 },
                { name: 'Qingdao Shazikou Beach', lat: 36.1350, lng: 120.5389 },
                { name: 'Qingdao Baguanguan Beach', lat: 36.0589, lng: 120.3289 },
                { name: 'Qingdao Yangkou Beach', lat: 36.2039, lng: 120.6489 }
            ],
            photos: ["2025_05_挖沙.jpg"]
        }
    ],
    6: [
        {
            persons: [
                { name: 'Pipi', avatar: 'profile-pipi.jpg' },
                { name: 'Joyce', avatar: 'profile-joyce.jpg' },
                { name: 'Datou', avatar: 'profile-datou.jpg' },
            ],
            date: '2025-06-10',
            title: 'Pipi\'s First Concert Performance',
            description: 'He did something special: introduced himself and his piece with a loud, clear voice before performing. Everything went perfectly, and the audience responded with warm applause and cheers!',
            category: 'work',
            photos: ["2025_06_音乐会.jpg"],
            locations: [
                { name: 'Qingdao Zhenchuan Music', lat: 36.0659, lng: 120.3844 },
            ],
        },
        {
            persons: [
                { name: 'Pipi', avatar: 'profile-pipi.jpg' },
            ],
            date: '2025-06-15',
            title: 'Pipi Learned to Jump Rope',
            description: 'Awesome!',
            category: 'health',
            photos: []
        },
        {
            persons: [
                { name: 'Joyce', avatar: 'profile-joyce.jpg' },
            ],
            date: '2025-06-01 - 2025-06-30',
            title: 'Briefly Tried K-pop',
            description: 'Gave up because of being too clumsy.',
            category: 'health',
            photos: []
        },

    ],
    7: [
        {
            persons: [
                { name: 'Beita', avatar: 'profile-beita.jpg' },
                { name: 'Datou', avatar: 'profile-datou.jpg' },
                { name: 'Joyce', avatar: 'profile-joyce.jpg' },
                { name: 'Pipi', avatar: 'profile-pipi.jpg' }
            ],
            date: '2025-07-06',
            title: 'Best Friend Came to Visit',
            description: 'My best friend brought her whole family to visit me—so happy!',
            category: 'love',
            locations: [
                { name: 'Qingdao Polar Ocean World', lat: 36.0547, lng: 120.4658 },
                { name: 'Qingdao Haitian Center', lat: 36.0524, lng: 120.3227 },
                { name: 'Qingdao Wanxianghui', lat: 36.0981, lng: 120.4148 }
            ],
            photos: ["2025_07_xinxin.jpg"]
        },
        {
            persons: [
                { name: 'Beita', avatar: 'profile-beita.jpg' },
                { name: 'Datou', avatar: 'profile-datou.jpg' },
                { name: 'Joyce', avatar: 'profile-joyce.jpg' },
                { name: 'Pipi', avatar: 'profile-pipi.jpg' }
            ],
            date: '2025-07-13 - 2025-07-31',
            title: 'Started Visiting Aquarium Again',
            description: 'With our new Polar Ocean World annual pass, we practically live there on weekends. It’s just aquarium, Ferris wheel, aquarium, Ferris wheel...',
            category: 'play',
            locations: [
                { name: 'Qingdao Polar Ocean World', lat: 36.0547, lng: 120.4658 },
            ],
            photos: ["2025_07_jidi.jpg"]
        },
        {
            persons: [
                { name: 'Datou', avatar: 'profile-datou.jpg' },
                { name: 'Joyce', avatar: 'profile-joyce.jpg' },
            ],
            date: '2025-07-26',
            title: 'Alfons Mucha',
            description: 'We went to the Art Museum to see Mucha\'s exhibition.',
            category: 'play',
            locations: [
                { name: 'Qingdao Art Museum', lat: 36.0589, lng: 120.3224 },
            ],
            photos: ["2025_07_穆夏.jpg"]
        }
    ],
    8: [
        {
            persons: [
                { name: 'Joyce', avatar: 'profile-joyce.jpg' },
                { name: 'Beita', avatar: 'profile-beita.jpg' },
                { name: 'Pipi', avatar: 'profile-pipi.jpg' },
                { name: 'Datou', avatar: 'profile-datou.jpg' },
            ],
            date: '2025-08-16',
            title: 'Yantai',
            description: 'The whole family went to Yantai\'s EuroPark. That morning we scratched the car, so we bought train tickets on the spot and went through a lot of trouble to get there. Then we encountered a power outage at the hotel that hadn\'t happened in years. Fortunately, the water park was fun enough. We\'ll go again next time!',
            category: 'play',
            locations: [
                { name: 'Yantai EuroPark', lat: 36.0671, lng: 120.3826 },
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
            title: 'Left a job',
            description: 'I left the position I worked in for twelve years. Sent away all my technical books, received many, many gifts, and had good conversations with many friends. Thinking that I might never have to do H.248 protocol again makes me both happy and a bit sad.',
            category: 'work',
        }
    ],
    9: [
        {
            persons: [
                { name: 'Joyce', avatar: 'profile-joyce.jpg' },
                { name: 'Beita', avatar: 'profile-beita.jpg' },
                { name: 'Pipi', avatar: 'profile-pipi.jpg' },
            ],
            date: '2025-09-03 - 2025-09-12',
            title: 'Xishuangbanna & Pu\'er',
            description: "So much fun! Love the tropical rainforest, love the red pandas. Love the night sky and fruit-eating bats.",
            category: 'play',
            locations: [
                { name: 'Xishuangbanna', lat: 22.0079, lng: 100.7979 },
                { name: 'Pu\'er', lat: 23.0477, lng: 100.9667 }
            ],
            photos: ["2025_09_yunnan.jpg", "2025_09_yunnan2.jpg", "2025_09_yunnan3.jpg"]
        },
        {
            persons: [
                { name: 'Joyce', avatar: 'profile-joyce.jpg' },
            ],
            date: '2025-09-15',
            title: 'New Job',
            description: 'Started a new job. Officialy in the AI industry.',
            category: 'work',
        }
    ],
    10: [
        {
            persons: [
                { name: 'Joyce', avatar: 'profile-joyce.jpg' },
                { name: 'Beita', avatar: 'profile-beita.jpg' },
                { name: 'Pipi', avatar: 'profile-pipi.jpg' },
                { name: 'Datou', avatar: 'profile-datou.jpg' },
            ],
            date: '2025-10-01 - 2025-10-31',
            title: 'Laoshan',
            description: 'After six years, I got a Laoshan annual pass again and started weekend hiking life. The farm meals have improved a lot compared to before—I wonder if it\'s because I\'ve been eating too much bad food lately.',
            category: 'play',
            locations: [
                { name: 'Laoshan Beijiushui', lat: 36.1767, lng: 120.5539 },
                { name: 'Laoshan Yangkou', lat: 36.2039, lng: 120.6489 }
            ],
            photos: ["2025_10_崂山.jpg", "2025_10_崂山的柿子.jpg"]
        }
    ],
    11: [
        {
            persons: [
                { name: 'Pipi', avatar: 'profile-pipi.jpg' }
            ],
            date: '2025-11-14',
            title: 'Pipi\'s First Piano Competition',
            description: 'Pipi was cool, confident on stage — I was so proud, I cried. He won fantastic feedback, and a first prize.',
            category: 'work',
            locations: [
                { name: 'Qingdao Zhenchuan Music', lat: 36.0659, lng: 120.3844 },
            ],
            photos: ["2025_11_钢琴比赛.jpg"]
        },
        {
            persons: [
                { name: 'Joyce', avatar: 'profile-joyce.jpg' },
                { name: 'Beita', avatar: 'profile-beita.jpg' },
                { name: 'Pipi', avatar: 'profile-pipi.jpg' },
                { name: 'Datou', avatar: 'profile-datou.jpg' },
            ],
            date: '2025-11-15',
            title: 'Rizhao',
            description: 'We went to Rizhao to play. The hotel had a water park—super fun! We had a great time.',
            category: 'play',
            locations: [
                { name: 'Rizhao Kaiyuan Senbo Hotel', lat: 35.4202, lng: 119.5294 },
            ],
            photos: ["2025_11_日照.jpg"]
        }
    ],
    12: [
        {
            persons: [
                { name: 'Pipi', avatar: 'profile-pipi.jpg' },
                { name: 'Beita', avatar: 'profile-beita.jpg' },
            ],
            date: '2025-12-14',
            title: 'Snow!',
            description: 'The little guys love snow so much.',
            category: 'love',
            photos: ["2025_12_snow.jpg"]
        },
        {
            persons: [
                { name: 'Joyce', avatar: 'profile-joyce.jpg' },
            ],
            date: '2025-12-09 - 2025-12-31',
            title: 'Swimming Lessons',
            description: 'I bought a membership at the swimming pool. I probably will need a coach after the New Year—  I can\'t seem to get it right by myself.',
            category: 'health',
        },
        {
            persons: [
                { name: 'Joyce', avatar: 'profile-joyce.jpg' },
            ],
            date: '2025-12-09 - 2025-12-31',
            title: 'Animal Crossing',
            description: 'Five years later, finally completed the museum collection—though I bought it from Taobao.',
            category: 'play',
        }
    ]
};

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
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
            // Separate events with media and without media
            const eventsWithMedia = monthEvents.filter(event => 
                (event.photos && event.photos.length > 0) || 
                (event.videos && event.videos.length > 0)
            );
            const eventsWithoutMedia = monthEvents.filter(event => 
                !(event.photos && event.photos.length > 0) && 
                !(event.videos && event.videos.length > 0)
            );
            
            let html = '';
            
            // Render events with media (full width display)
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
                                        Your browser does not support video playback.
                                    </video>
                                `).join('')}
                            </div>
                        `;
                    }
                    
                    let locationHtml = '';
                    if (event.locations && event.locations.length > 0) {
                        const locationNames = event.locations.map(loc => loc.name).join(', ');
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
                                <span class="event-person">${event.persons.map(p => p.name).join(', ')}</span>
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
            
            // Render events without media (4 columns horizontally)
            if (eventsWithoutMedia.length > 0) {
                html += '<div class="compact-events-grid">';
                html += eventsWithoutMedia.map((event, index) => {
                    const eventId = `event-${month}-compact-${index}`;
                    
                    let locationHtml = '';
                    if (event.locations && event.locations.length > 0) {
                        const locationNames = event.locations.map(loc => loc.name).join(', ');
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
                                <span class="event-person">${event.persons.map(p => p.name).join(', ')}</span>
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
            eventsHtml = '<div class="no-events">No special events this month</div>';
        }
        
        monthEl.innerHTML = `
            <div class="month-header">${monthNames[month - 1]}</div>
            <div class="events">${eventsHtml}</div>
        `;
        
        timelineEl.appendChild(monthEl);
    }
    
    // Initialize maps after DOM is updated
    initializeMaps();
    
    // Add message to friend
    if (events.message && events.message.type === 'message') {
        const messageEl = document.createElement('div');
        messageEl.className = 'month message-section';
        messageEl.innerHTML = `
            <div class="month-header message-header">💌 ${events.message.title}</div>
            <div class="message-content">${events.message.content}</div>
        `;
        timelineEl.appendChild(messageEl);
    }
    
    // Add Coming Events in 2026 section
    const comingEl = document.createElement('div');
    comingEl.className = 'month coming-events';
    
    const comingEvents = [
        {
            persons: [
                { name: 'Pipi', avatar: 'profile-pipi.jpg' },
                { name: 'Beita', avatar: 'profile-beita.jpg' },
                { name: 'Datou', avatar: 'profile-datou.jpg' },
                { name: 'Joyce', avatar: 'profile-joyce.jpg' }
            ],
            date: '2026-01-01 - 2026-01-03',
            title: 'Xuzhou',
            description: 'Really looking forward to Xuzhou\'s food.',
            category: 'play'
        },
        {
            persons: [
                { name: 'Pipi', avatar: 'profile-pipi.jpg' },
                { name: 'Datou', avatar: 'profile-datou.jpg' },
                { name: 'Joyce', avatar: 'profile-joyce.jpg' }
            ],
            date: '2026-01-16',
            title: 'Maksim Mrvica\'s Piano Concert',
            description: 'Can\'t wait!!!!',
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
                    <span class="event-person">${event.persons.map(p => p.name).join(', ')}</span>
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

// Open photo viewer (optional feature)
function openPhoto(photoSrc) {
    // Create modal to display large image
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
    
    // Click to close modal
    modal.onclick = () => {
        document.body.removeChild(modal);
    };
    
    // Press ESC to close modal
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
