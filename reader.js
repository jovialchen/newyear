// 阅读面板：打开某个类别的"书"，左右翻页。
const overlay = document.getElementById('reader-overlay');
const bookEl = overlay.querySelector('.reader-book');
const photoEl = document.getElementById('page-photo');
const dateBigEl = document.getElementById('page-date-big');
const titleEl = document.getElementById('page-title');
const dateEl = document.getElementById('page-date');
const textEl = document.getElementById('page-text');
const indicatorEl = document.getElementById('page-indicator');
const prevBtn = document.getElementById('page-prev');
const nextBtn = document.getElementById('page-next');
const closeBtn = document.getElementById('reader-close');

let currentCategory = null;
let currentPage = 0;
let opened = false;

function renderPage() {
    const page = currentCategory.pages[currentPage];
    const total = currentCategory.pages.length;

    if (page.photo) {
        photoEl.src = page.photo;
        photoEl.classList.remove('hidden');
        dateBigEl.textContent = '';
    } else {
        photoEl.classList.add('hidden');
        photoEl.removeAttribute('src');
        dateBigEl.textContent = page.date;
    }

    titleEl.textContent = page.title;
    dateEl.textContent = page.date;
    textEl.textContent = page.text;
    indicatorEl.textContent = `${currentPage + 1} / ${total}`;
    prevBtn.disabled = currentPage === 0;
    nextBtn.disabled = currentPage === total - 1;

    for (const el of overlay.querySelectorAll('.page')) {
        el.classList.remove('flipping');
        void el.offsetWidth; // 重新触发翻页动画
        el.classList.add('flipping');
    }
}

function flip(delta) {
    const total = currentCategory.pages.length;
    const next = currentPage + delta;
    if (next < 0 || next >= total) return;
    currentPage = next;
    renderPage();
}

export function openReader(category) {
    currentCategory = category;
    currentPage = 0;
    opened = true;
    overlay.classList.remove('hidden');
    bookEl.classList.remove('closing');
    renderPage();
}

export function closeReader() {
    if (!opened) return;
    opened = false;
    bookEl.classList.add('closing');
    bookEl.addEventListener('animationend', () => {
        overlay.classList.add('hidden');
        bookEl.classList.remove('closing');
    }, { once: true });
}

export function isReaderOpen() {
    return opened;
}

prevBtn.addEventListener('click', () => flip(-1));
nextBtn.addEventListener('click', () => flip(1));
closeBtn.addEventListener('click', closeReader);

overlay.addEventListener('click', (event) => {
    if (event.target === overlay) closeReader();
});

window.addEventListener('keydown', (event) => {
    if (!opened) return;
    if (event.key === 'Escape') closeReader();
    else if (event.key === 'ArrowLeft') flip(-1);
    else if (event.key === 'ArrowRight') flip(1);
});
