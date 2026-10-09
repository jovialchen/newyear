const canvas = document.getElementById('fireworksCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Particle {
    constructor(x, y, color, sizeMultiplier) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.sizeMultiplier = sizeMultiplier;
        this.velocity = {
            x: (Math.random() - 0.5) * 10 * sizeMultiplier,
            y: (Math.random() - 0.5) * 10 * sizeMultiplier
        };
        this.alpha = 1;
        this.friction = 0.96;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2 * this.sizeMultiplier, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }

    update() {
        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= 0.012;
    }
}

let particles = [];

function createFirework() {
    const x = Math.random() * canvas.width;
    const y = Math.random() * (canvas.height * 0.6);
    const color = `hsl(${Math.random() * 360}, 70%, 60%)`;
    const sizeMultiplier = Math.random() * 3 + 1; // Random size between 1x and 4x
    const particleCount = Math.floor(60 * sizeMultiplier);
    
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(x, y, color, sizeMultiplier));
    }
}

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((particle, index) => {
        if (particle.alpha > 0) {
            particle.update();
            particle.draw();
        } else {
            particles.splice(index, 1);
        }
    });

    if (Math.random() < 0.04) {
        createFirework();
    }
}

// 为小星星添加随机闪烁延迟
const backgroundStars = document.querySelectorAll('.star:not(.winter-triangle):not(.orion):not(.canis-minor)');
backgroundStars.forEach(star => {
    star.style.animationDelay = `${Math.random() * 2}s`;
});

// 创建雪花效果
function createSnowflakes() {
    const snowflakeCount = 100;
    const snowGround = document.createElement('div');
    snowGround.className = 'snow-ground';
    document.body.appendChild(snowGround);

    const snowAccumulation = document.createElement('div');
    snowAccumulation.className = 'snow-accumulation';
    snowGround.appendChild(snowAccumulation);

    // 创建不断飘落的雪花
    setInterval(() => {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        snowflake.innerHTML = '❄';
        snowflake.style.left = Math.random() * 100 + 'vw';
        snowflake.style.animationDuration = Math.random() * 3 + 5 + 's';
        snowflake.style.opacity = Math.random() * 0.7 + 0.3;
        snowflake.style.fontSize = Math.random() * 10 + 10 + 'px';
        
        document.body.appendChild(snowflake);

        // 雪花落地后变成积雪
        snowflake.addEventListener('animationend', () => {
            const settledSnow = document.createElement('div');
            settledSnow.className = 'settled-snow';
            settledSnow.innerHTML = '❄';
            settledSnow.style.fontSize = snowflake.style.fontSize;
            settledSnow.style.left = snowflake.style.left;
            settledSnow.style.bottom = Math.random() * 30 + 'px';
            settledSnow.style.opacity = snowflake.style.opacity;
            settledSnow.style.transform = `rotate(${Math.random() * 360}deg)`;
            snowAccumulation.appendChild(settledSnow);
            snowflake.remove();

            // 限制积雪数量，避免太多
            if (snowAccumulation.children.length > 200) {
                snowAccumulation.removeChild(snowAccumulation.firstChild);
            }
        });
    }, 200); // 每200ms创建一个新雪花
}

createSnowflakes();

// 延迟显示文字
setTimeout(() => {
    document.getElementById('main-title').classList.add('fade-in');
    setTimeout(() => {
        document.getElementById('sub-title').classList.add('fade-in');
    }, 1000);
}, 3000);

animate();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
