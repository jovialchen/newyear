import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { EVENTS, EVENT_TYPES } from './events.js';

const ASSETS = './assets';
const VRM_URL = `${ASSETS}/hazel-pink.vrm`;
const WALK_SPEED = 2.4; // 米/秒
const HAZE_COLOR = new THREE.Color(0xcfe6f2); // 远景揉进天空的颜色

// ---------- 渲染器与场景 ----------
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.NoToneMapping; // 平涂风格：保留材质原色
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

// 扁平渐变天空：白天 ↔ 夜晚可整体渐变（终点放礼花时天黑下来）
const SKY_STOPS = [0, 0.55, 0.8, 1];
const SKY_DAY = ['#87c6ef', '#b8e0f5', '#e8f5fb', '#f4faf2'];
const SKY_NIGHT = ['#04061a', '#0a1330', '#14224a', '#1d3157'];
const NIGHT_FOG = new THREE.Color(0x0a1322);
const skyCanvas = document.createElement('canvas');
skyCanvas.width = 4;
skyCanvas.height = 512;
const skyCtx = skyCanvas.getContext('2d');
const skyTex = new THREE.CanvasTexture(skyCanvas);
skyTex.colorSpace = THREE.SRGBColorSpace;
function paintSky(night) {
    const grad = skyCtx.createLinearGradient(0, 0, 0, 512);
    for (let i = 0; i < SKY_STOPS.length; i++) {
        const c = new THREE.Color(SKY_DAY[i]).lerp(new THREE.Color(SKY_NIGHT[i]), night);
        grad.addColorStop(SKY_STOPS[i], `#${c.getHexString()}`);
    }
    skyCtx.fillStyle = grad;
    skyCtx.fillRect(0, 0, 4, 512);
    skyTex.needsUpdate = true;
    scene.fog.color.copy(HAZE_COLOR).lerp(NIGHT_FOG, night);
}
scene.background = skyTex;
scene.fog = new THREE.Fog(HAZE_COLOR, 55, 170);
paintSky(0);

// 小 FOV，弱化透视，更接近扁平插画的观感
const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 400);
camera.position.set(-6, 3.3, 15.5);

// 灯光只给 VRM 人物用（场景其余部分都是无光照平涂材质）
const hemi = new THREE.HemisphereLight(0xffffff, 0x9ab884, 1.25);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff6e0, 1.6);
sun.position.set(-30, 50, 20);
scene.add(sun);

// ---------- 季节 ----------
// 小路的 t ∈ [0,1] 对应一年的 1~12 月：起点是一月，终点是十二月
function monthAt(t) {
    return Math.min(12, Math.max(1, t * 12 + 1));
}
function seasonAt(t) {
    const m = monthAt(t);
    if (m >= 3 && m < 6) return 'spring';
    if (m >= 6 && m < 9) return 'summer';
    if (m >= 9 && m < 12) return 'autumn';
    return 'winter';
}

// 扁平配色：每季一组树冠色，春天混入"樱花树"
const LEAF_COLORS = {
    spring: ['#7cc46a', '#8fd47e', '#a5dd8f', '#ffc7d8', '#ffd9e4'],
    summer: ['#4f9e46', '#5fb253', '#6fc05f', '#55a84c'],
    autumn: ['#e8a34c', '#d98a3e', '#f2b95f', '#cf7a3a'],
    winter: ['#c4d9e8', '#b3cfe2', '#d3e5f0'],
};
const TRUNK_COLOR = 0x7d5a3c;
const GRASS_COLORS = {
    spring: '#79c168',
    summer: '#4f9e46',
    autumn: '#c9a44e',
};
const PETAL_COLORS = [0xff8fb3, 0xffd166, 0xff6b6b, 0xc58fff, 0xff9f5a, 0xfff3f0];

// 地面颜色：按月份渐变的关键帧 [月份, 颜色]
const GROUND_STOPS = [
    [1, 0xe9eff4], [2.5, 0xe6eee8],
    [3.2, 0x93d06f], [5.5, 0x7fc465],
    [6.2, 0x6ab04f], [8.5, 0x53963f],
    [9.2, 0xbfb45e], [11.4, 0xb09a4a],
    [12, 0xe9eff4],
];
function groundColorAt(month) {
    for (let i = 0; i < GROUND_STOPS.length - 1; i++) {
        const [m0, c0] = GROUND_STOPS[i];
        const [m1, c1] = GROUND_STOPS[i + 1];
        if (month <= m1) {
            const k = (month - m0) / (m1 - m0);
            return new THREE.Color(c0).lerp(new THREE.Color(c1), THREE.MathUtils.clamp(k, 0, 1));
        }
    }
    return new THREE.Color(GROUND_STOPS[GROUND_STOPS.length - 1][1]);
}

// ---------- 小路（蜿蜒的样条曲线，时间轴从左向右） ----------
// 主轴是 +x（屏幕右方），z 方向小幅摆动让路面在侧视角下呈现起伏的"飘带"感
const curvePoints = [new THREE.Vector3(-6, 0, 0)];
const SEG_LEN = 20;
const SEGMENTS = Math.max(14, Math.round(EVENTS.length * 0.75));
for (let i = 0; i < SEGMENTS; i++) {
    curvePoints.push(new THREE.Vector3(
        8 + i * SEG_LEN,
        0,
        Math.sin(i * 1.1) * 7 + Math.sin(i * 0.45) * 4,
    ));
}
const last = curvePoints[curvePoints.length - 1];
curvePoints.push(new THREE.Vector3(last.x + 24, 0, last.z * 0.3));
const curve = new THREE.CatmullRomCurve3(curvePoints, false, 'catmullrom', 0.5);
const curveLength = curve.getLength();
const END_POS = curve.getPointAt(1);

// 铺面用的延长曲线：路在起点之前和 2027 之后都继续延伸、不截断，
// 但人物行走的进度仍只按主曲线计算（从一月走到十二月尽头就停下）
const ribbonPts = curve.getPoints(500);
let headLen = 0; // 起点之前那段延长线的长度
{
    const startTan = curve.getTangentAt(0);
    const startSide = new THREE.Vector3(-startTan.z, 0, startTan.x);
    const start = curve.getPointAt(0);
    const head = [];
    for (let i = 1; i <= 6; i++) {
        head.push(start.clone()
            .addScaledVector(startTan, -i * 16)
            .addScaledVector(startSide, Math.sin(i * 0.9) * 3.5));
    }
    head.reverse(); // 由远及近，接到主曲线起点
    for (let i = 1; i < head.length; i++) headLen += head[i].distanceTo(head[i - 1]);
    headLen += start.distanceTo(head[head.length - 1]);
    ribbonPts.unshift(...head);

    const endTan = curve.getTangentAt(1);
    const endSide = new THREE.Vector3(-endTan.z, 0, endTan.x);
    for (let i = 1; i <= 6; i++) {
        ribbonPts.push(END_POS.clone()
            .addScaledVector(endTan, i * 16)
            .addScaledVector(endSide, Math.sin(i * 0.9) * 3.5));
    }
}
const ribbonCurve = new THREE.CatmullRomCurve3(ribbonPts, false, 'catmullrom', 0.5);

function sideVectorAt(t) {
    const tan = curve.getTangentAt(t);
    return new THREE.Vector3(-tan.z, 0, tan.x).normalize();
}
// 用 x 坐标反推大致的路进度（给地面顶点着色用）
function tAtX(x) {
    return THREE.MathUtils.clamp((x + 6) / (END_POS.x + 6), 0, 1);
}

// ---------- 地面（颜色随月份渐变） ----------
{
    const geo = new THREE.PlaneGeometry(END_POS.x + 480, 500, 64, 40);
    geo.rotateX(-Math.PI / 2);
    const centerX = END_POS.x / 2;
    const colors = [];
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i) + centerX;
        const z = pos.getZ(i);
        const month = monthAt(tAtX(x));
        const base = groundColorAt(month);
        const n = Math.sin(x * 0.11) * Math.cos(z * 0.09) * 0.5 + 0.5;
        const shade = 0.92 + n * 0.12;
        colors.push(base.r * shade, base.g * shade, base.b * shade);
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const ground = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true }));
    ground.position.x = centerX;
    scene.add(ground);
}

// ---------- 路面（沿延长曲线铺设的平涂条带，2027 之后路还在继续） ----------
function buildRibbon(width, y, color, targetCurve) {
    const segments = 900;
    const positions = [];
    const indices = [];
    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const p = targetCurve.getPointAt(t);
        const tan = targetCurve.getTangentAt(t);
        const s = new THREE.Vector3(-tan.z, 0, tan.x).normalize().multiplyScalar(width / 2);
        positions.push(p.x - s.x, y, p.z - s.z, p.x + s.x, y, p.z + s.z);
        if (i < segments) {
            const a = i * 2;
            indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
        }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setIndex(indices);
    return new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color }));
}
scene.add(buildRibbon(3.4, 0.015, 0xb99a6b, ribbonCurve)); // 深色路缘
scene.add(buildRibbon(2.6, 0.03, 0xeedcae, ribbonCurve));  // 浅色路面

// ---------- 扁平纸片景物 ----------
// 所有需要面向相机的物体（树、草、花、云）都登记到这里
const billboards = [];

function flatMat(color, opts = {}) {
    return new THREE.MeshBasicMaterial({ color, ...opts });
}

// 树冠：几个圆拼成的云朵形 + 错位深色纸片层（制造层次）
function makeCanopy(colorHex) {
    const g = new THREE.Group();
    const blobs = [
        [0, 1.55, 1.05],
        [-0.85, 1.15, 0.72],
        [0.85, 1.2, 0.78],
        [-0.42, 1.98, 0.62],
        [0.45, 2.02, 0.6],
    ];
    const shadowMat = flatMat(new THREE.Color(colorHex).multiplyScalar(0.8));
    for (const [x, y, r] of blobs) {
        const m = new THREE.Mesh(new THREE.CircleGeometry(r, 20), shadowMat);
        m.position.set(x + 0.16, y - 0.16, -0.02);
        g.add(m);
    }
    const mat = flatMat(colorHex);
    for (const [x, y, r] of blobs) {
        const m = new THREE.Mesh(new THREE.CircleGeometry(r, 20), mat);
        m.position.set(x, y, 0);
        g.add(m);
    }
    return g;
}

function makeTrunk() {
    const shape = new THREE.Shape();
    shape.moveTo(-0.24, 0);
    shape.lineTo(0.24, 0);
    shape.lineTo(0.1, 1.7);
    shape.lineTo(-0.1, 1.7);
    shape.closePath();
    const m = new THREE.Mesh(new THREE.ShapeGeometry(shape), flatMat(TRUNK_COLOR));
    m.position.z = -0.04;
    return m;
}

// haze：0=近景原色，越大越揉进天空色（假空气透视）
function makeTree(season, haze = 0) {
    const colors = LEAF_COLORS[season];
    const color = new THREE.Color(colors[Math.floor(Math.random() * colors.length)]);
    if (haze > 0) color.lerp(HAZE_COLOR, haze);
    const g = new THREE.Group();
    g.add(makeTrunk());
    g.add(makeCanopy(color));
    return g;
}

function makeGrassTuft(season) {
    const g = new THREE.Group();
    const mat = flatMat(GRASS_COLORS[season] || GRASS_COLORS.summer);
    const blades = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < blades; i++) {
        const x = (i - (blades - 1) / 2) * 0.16;
        const h = 0.45 + Math.random() * 0.35;
        const lean = (Math.random() - 0.5) * 0.2;
        const shape = new THREE.Shape();
        shape.moveTo(x - 0.09, 0);
        shape.lineTo(x + 0.09, 0);
        shape.lineTo(x + lean, h);
        shape.closePath();
        g.add(new THREE.Mesh(new THREE.ShapeGeometry(shape), mat));
    }
    return g;
}

function makeFlower() {
    const g = new THREE.Group();
    const stem = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.55), flatMat(0x5cb84d));
    stem.position.y = 0.27;
    g.add(stem);
    const petalMat = flatMat(PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)]);
    for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        const petal = new THREE.Mesh(new THREE.CircleGeometry(0.11, 12), petalMat);
        petal.position.set(Math.cos(a) * 0.14, 0.58 + Math.sin(a) * 0.14, 0.01);
        g.add(petal);
    }
    const center = new THREE.Mesh(new THREE.CircleGeometry(0.09, 12), flatMat(0xffe08a));
    center.position.set(0, 0.58, 0.02);
    g.add(center);
    return g;
}

// 沿路散布。opts.seasons 限定出现的季节；opts.side='far' 只放路的远侧（不挡人物）
function scatter(makeFn, count, minDist, maxDist, scaleRange, opts = {}) {
    let placed = 0;
    let attempts = 0;
    while (placed < count && attempts < count * 25) {
        attempts++;
        const t = Math.random();
        const season = seasonAt(t);
        if (opts.seasons && !opts.seasons.includes(season)) continue;
        const p = curve.getPointAt(t);
        const side = sideVectorAt(t);
        let sign = Math.random() < 0.5 ? -1 : 1;
        // 相机在 +z 一侧：远侧 = z 更小的一侧
        if (opts.side === 'far' && side.z * sign > 0) sign = -sign;
        if (opts.side === 'near' && side.z * sign < 0) sign = -sign;
        const dist = minDist + Math.random() * (maxDist - minDist);
        const obj = makeFn(season);
        obj.scale.setScalar(scaleRange[0] + Math.random() * (scaleRange[1] - scaleRange[0]));
        obj.position.set(p.x + side.x * sign * dist, 0, p.z + side.z * sign * dist);
        scene.add(obj);
        billboards.push(obj);
        placed++;
    }
}

// 树大多放在路的远侧；近侧放少量稀疏的树，偶尔从镜头前掠过（增加前景层次）
// 近 / 中 / 远三档：越远越大片、越揉进天空色，形成层次
scatter((s) => makeTree(s, 0), 60, 4.2, 10, [1.0, 1.7], { side: 'far' });
scatter((s) => makeTree(s, 0.35), 70, 10, 22, [1.3, 2.2], { side: 'far' });
scatter((s) => makeTree(s, 0.6), 80, 20, 48, [1.8, 3.0], { side: 'far' });
// 前景树两档：一档偶尔掠过画面一角；一档更靠近镜头、个头更矮，
// 在画面里只露下缘（近大远小，越近越靠下），丰富前景但不挡路上的人
scatter((s) => makeTree(s, 0), 22, 4.5, 9, [0.7, 1.15], { side: 'near' });
scatter((s) => makeTree(s, 0), 30, 9, 13.5, [0.65, 1.0], { side: 'near' });
scatter(makeGrassTuft, 220, 2.6, 10, [0.7, 1.4], { seasons: ['spring', 'summer', 'autumn'] });
scatter(makeGrassTuft, 170, 2.5, 14, [0.8, 1.6], { seasons: ['spring', 'summer', 'autumn'], side: 'near' });
scatter(makeFlower, 90, 2.6, 7, [0.8, 1.3], { seasons: ['spring', 'summer'] });
scatter(makeFlower, 50, 7, 13, [0.9, 1.4], { seasons: ['spring', 'summer'], side: 'near' });

// 起点之前和 2027 之后的路段：路旁继续有些落雪的树，越远越揉进天色，路才不会戛然而止
{
    const ribbonLen = ribbonCurve.getLength();
    const uHead = headLen / ribbonLen;                  // 主曲线起点在延长曲线上的位置
    const uTail = (headLen + curveLength) / ribbonLen;  // 主曲线终点的位置
    const plantBeyond = (uLo, uHi, fracOf) => {
        for (let i = 0; i < 14; i++) {
            const u = uLo + ((i + 0.5) / 14) * (uHi - uLo);
            const p = ribbonCurve.getPointAt(u);
            const tan = ribbonCurve.getTangentAt(u);
            const side = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
            let sign = Math.random() < 0.5 ? -1 : 1;
            if (side.z * sign > 0) sign = -sign; // 远侧，不挡人物
            const tree = makeTree('winter', 0.2 + fracOf(u) * 0.55);
            const dist = 4.5 + Math.random() * 16;
            tree.scale.setScalar(1.1 + Math.random() * 1.3);
            tree.position.set(p.x + side.x * sign * dist, 0, p.z + side.z * sign * dist);
            scene.add(tree);
            billboards.push(tree);
        }
    };
    plantBeyond(0, uHead, (u) => (uHead - u) / uHead);
    plantBeyond(uTail, 1, (u) => (u - uTail) / (1 - uTail));
}

// ---------- 远山（路的远侧背景剪影，压扁的椭圆山包，随机分布留有空隙） ----------
{
    const hillColors = [0xb9d4c8, 0xa9cdbd, 0xc9ded3];
    for (let i = 0; i < 8; i++) {
        const r = 20 + Math.random() * 22;
        const hill = new THREE.Mesh(
            new THREE.CircleGeometry(r, 32, 0, Math.PI),
            flatMat(hillColors[i % hillColors.length]),
        );
        hill.scale.set(1.6 + Math.random() * 1.2, 0.34 + Math.random() * 0.2, 1); // 宽而矮，才像山
        hill.position.set(
            Math.random() * (END_POS.x + 60) - 30, // 随机散落在全程，有些地方没有山
            0,
            -75 - Math.random() * 30,
        );
        scene.add(hill);
    }
}

// ---------- 云（扁平纸片，缓慢漂移） ----------
const clouds = [];
{
    for (let i = 0; i < 10; i++) {
        const g = new THREE.Group();
        const mat = flatMat(0xffffff, { transparent: true, opacity: 0.92 });
        const puffs = 3 + Math.floor(Math.random() * 2);
        for (let j = 0; j < puffs; j++) {
            const r = 1.6 + Math.random() * 1.6;
            const puff = new THREE.Mesh(new THREE.CircleGeometry(r, 20), mat);
            puff.position.set((j - (puffs - 1) / 2) * 2.2, Math.random() * 0.8, 0);
            g.add(puff);
        }
        const t = Math.random();
        const p = curve.getPointAt(t);
        g.position.set(p.x + (Math.random() - 0.5) * 50, 12 + Math.random() * 9, p.z - 42 - Math.random() * 30);
        g.scale.setScalar(1.2 + Math.random() * 1.4);
        g.userData.speed = 0.25 + Math.random() * 0.45;
        scene.add(g);
        clouds.push(g);
        billboards.push(g);
    }
}

// ---------- 雪（只下在冬季路段） ----------
// 圆点贴图：PointsMaterial 默认渲染成方块，贴个圆形才像雪花
function makeDotTexture() {
    const c = document.createElement('canvas');
    c.width = c.height = 32;
    const ctx = c.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 2, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.7, 'rgba(255,255,255,0.9)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
}
const dotTex = makeDotTexture();

let snow = null;
const snowSpeeds = [];
{
    const winterRanges = [[0, 1 / 6], [11 / 12, 1]];
    const count = 380;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        const range = winterRanges[i % 2];
        const t = range[0] + Math.random() * (range[1] - range[0]);
        const p = curve.getPointAt(t);
        const side = sideVectorAt(t);
        const d = (Math.random() - 0.5) * 24;
        positions[i * 3] = p.x + side.x * d;
        positions[i * 3 + 1] = 0.5 + Math.random() * 8;
        positions[i * 3 + 2] = p.z + side.z * d;
        snowSpeeds.push(0.8 + Math.random() * 0.9);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    snow = new THREE.Points(geo, new THREE.PointsMaterial({
        color: 0xffffff, size: 0.22, map: dotTex, transparent: true, opacity: 0.95, depthWrite: false,
    }));
    scene.add(snow);
}

// 星星：白天隐没，入夜后在终点方向的夜空浮现
let starMat = null;
{
    const count = 240;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        positions[i * 3] = END_POS.x - 130 + Math.random() * 260;
        positions[i * 3 + 1] = 10 + Math.random() * 48;
        positions[i * 3 + 2] = -25 - Math.random() * 120;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starMat = new THREE.PointsMaterial({
        color: 0xfff4d0, size: 0.55, map: dotTex, transparent: true, opacity: 0,
        depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
    });
    scene.add(new THREE.Points(geo, starMat));
}

// ---------- 月亮（2026 年 12 月 31 日的月相：下弦月，月龄 22 天，照亮约 47%，左半边亮） ----------
let moonMat = null;
{
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const ctx = c.getContext('2d');
    const cx = 128, cy = 128, r = 72;
    // 光晕
    const glow = ctx.createRadialGradient(cx, cy, r * 0.6, cx, cy, 128);
    glow.addColorStop(0, 'rgba(255, 244, 200, 0.45)');
    glow.addColorStop(1, 'rgba(255, 244, 200, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 256, 256);
    // 暗面（淡淡地透出轮廓）
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(30, 40, 70, 0.5)';
    ctx.fill();
    // 亮面：亏月下弦 → 左半亮，晨昏线微微向左鼓（照亮比例 0.47 → 鼓出 (1-2×0.47)r）
    const rx = (1 - 2 * 0.47) * r;
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI / 2, Math.PI * 1.5);           // 左半圆（下→左→上）
    ctx.ellipse(cx, cy, rx, r, 0, -Math.PI / 2, Math.PI / 2, true); // 晨昏线（上→左→下）
    ctx.fillStyle = '#fff6d8';
    ctx.fill();
    // 环形山（只在亮面一侧）
    ctx.fillStyle = 'rgba(214, 200, 160, 0.8)';
    for (const [mx, my, mr] of [[-30, -18, 9], [-13, 22, 6], [-44, 14, 5]]) {
        ctx.beginPath();
        ctx.arc(cx + mx, cy + my, mr, 0, Math.PI * 2);
        ctx.fill();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    moonMat = new THREE.MeshBasicMaterial({
        map: tex, transparent: true, opacity: 0, depthWrite: false, fog: false,
    });
    moonMat.userData.keepAtNight = true; // 夜里也保持发亮
    const moon = new THREE.Mesh(new THREE.PlaneGeometry(11, 11), moonMat);
    moon.position.set(END_POS.x + 16, 17, -55);
    scene.add(moon);
    billboards.push(moon);
}

function updateSnow(dt) {
    const pos = snow.geometry.attributes.position;
    for (let i = 0; i < snowSpeeds.length; i++) {
        let y = pos.array[i * 3 + 1] - snowSpeeds[i] * dt;
        if (y < 0) y = 6 + Math.random() * 3;
        pos.array[i * 3 + 1] = y;
    }
    pos.needsUpdate = true;
}

// ---------- 人物 ----------
const character = new THREE.Group();
scene.add(character);
let vrm = null;
let bones = null;
const VRM_BONE_NAMES = [
    'hips', 'spine', 'head',
    'leftUpperLeg', 'rightUpperLeg', 'leftLowerLeg', 'rightLowerLeg',
    'leftUpperArm', 'rightUpperArm', 'leftLowerArm', 'rightLowerArm',
];

function fallbackCharacter() {
    const body = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.28, 0.7, 4, 10),
        new THREE.MeshStandardMaterial({ color: 0xff9fb0, roughness: 0.8 }),
    );
    body.position.y = 0.85;
    const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 16, 12),
        new THREE.MeshStandardMaterial({ color: 0xffd9c0, roughness: 0.8 }),
    );
    head.position.y = 1.6;
    character.add(body, head);
}

async function loadCharacter(manager) {
    try {
        const loader = new GLTFLoader(manager);
        loader.register((parser) => new VRMLoaderPlugin(parser));
        const gltf = await loader.loadAsync(VRM_URL);
        vrm = gltf.userData.vrm;
        VRMUtils.removeUnnecessaryVertices(gltf.scene);
        VRMUtils.combineSkeletons(gltf.scene);
        character.add(vrm.scene);
        bones = {};
        for (const name of VRM_BONE_NAMES) {
            bones[name] = vrm.humanoid.getNormalizedBoneNode(name);
        }
        if (vrm.lookAt) vrm.lookAt.target = camera;
    } catch (e) {
        console.warn('VRM 加载失败，使用备用小人：', e);
        vrm = null;
        bones = null;
        fallbackCharacter();
    }
}

// 手臂自然下垂的角度（VRM 模型默认是 T-pose，需要把大臂放下来）
const ARM_DOWN = 1.15;
const ARM_SWING = 0.28;
let walkPhase = 0;

function animateCharacter(dt, walking, time) {
    if (bones) {
        walkPhase += dt * (walking ? 7 : 2);
        const amp = walking ? 1 : 0;
        const s = Math.sin(walkPhase);
        const set = (name, x, z) => {
            if (!bones[name]) return;
            if (x !== null) bones[name].rotation.x = x;
            if (z !== null) bones[name].rotation.z = z;
        };
        set('leftUpperLeg', s * 0.55 * amp, null);
        set('rightUpperLeg', -s * 0.55 * amp, null);
        set('leftLowerLeg', Math.max(0, -s) * 0.8 * amp, null);
        set('rightLowerLeg', Math.max(0, s) * 0.8 * amp, null);
        // 大臂：先垂下来（z），再前后摆（x）
        set('leftUpperArm', -s * ARM_SWING * amp, -ARM_DOWN);
        set('rightUpperArm', s * ARM_SWING * amp, ARM_DOWN);
        // 小臂：跟着垂下，略微向前弯一点
        set('leftLowerArm', null, -ARM_DOWN * 0.25);
        set('rightLowerArm', null, ARM_DOWN * 0.25);
        set('spine', walking ? 0.05 : Math.sin(time * 1.4) * 0.02, null);
        if (bones.hips) bones.hips.rotation.y = s * 0.05 * amp;
    }
    const bob = walking ? Math.abs(Math.sin(walkPhase)) * 0.05 : 0;
    character.position.y = bob;
}

// ---------- 事件节点（木杆 + 拍立得照片 + 发光球） ----------
function placeholderTexture(index) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 192;
    const ctx = canvas.getContext('2d');
    const hue = (index * 47) % 360;
    const grad = ctx.createLinearGradient(0, 0, 256, 192);
    grad.addColorStop(0, `hsl(${hue}, 55%, 62%)`);
    grad.addColorStop(1, `hsl(${(hue + 50) % 360}, 55%, 45%)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 192);
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold 84px Kalam, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(index + 1), 128, 100);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
}

function glowSpriteTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
    grad.addColorStop(0, 'rgba(255, 230, 160, 0.9)');
    grad.addColorStop(0.4, 'rgba(255, 210, 120, 0.35)');
    grad.addColorStop(1, 'rgba(255, 210, 120, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
}
const glowTex = glowSpriteTexture();

// ---------- 事件标志：每种类型一个不同的扁平小物件（照片嵌在物件上） ----------
function roundedRectGeo(w, h, r) {
    const s = new THREE.Shape();
    const x = -w / 2;
    const y = -h / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y);
    s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r);
    s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h);
    s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r);
    s.quadraticCurveTo(x, y, x + r, y);
    return new THREE.ShapeGeometry(s);
}
const RECT = (w, h) => new THREE.PlaneGeometry(w, h);
const CIRC = (r) => new THREE.CircleGeometry(r, 24);

function part(geo, color, x, y, z = 0, rz = 0) {
    const m = new THREE.Mesh(geo, flatMat(color));
    m.position.set(x, y, z);
    if (rz) m.rotation.z = rz;
    return m;
}

// 白边照片（可带一点倾斜，像随手贴上去的）
function addPhoto(g, photoMat, w, h, x, y, rz = 0, border = 0.09, borderColor = 0xfffaf0) {
    g.add(part(RECT(w + border * 2, h + border * 2), borderColor, x, y, 0.01, rz));
    const ph = new THREE.Mesh(new THREE.PlaneGeometry(w, h), photoMat);
    ph.position.set(x, y, 0.02);
    ph.rotation.z = rz;
    g.add(ph);
}

// 返回 { group, topY }：topY 是放发光球的高度
function buildProp(type, photoMat) {
    const g = new THREE.Group();
    let topY = 2.4;
    switch (type) {
        case 'travel': { // 家庭旅行：行李箱，照片是贴在箱子上的贴纸
            g.add(part(roundedRectGeo(1.8, 1.25, 0.18), 0xd98a4e, 0, 0.82));
            g.add(part(roundedRectGeo(0.5, 0.24, 0.1), 0x8a5a30, 0, 1.56));
            g.add(part(RECT(0.16, 1.25), 0xb46a34, -0.52, 0.82, 0.005));
            g.add(part(RECT(0.16, 1.25), 0xb46a34, 0.52, 0.82, 0.005));
            g.add(part(CIRC(0.11), 0x5a4632, -0.55, 0.16, 0.005));
            g.add(part(CIRC(0.11), 0x5a4632, 0.55, 0.16, 0.005));
            addPhoto(g, photoMat, 0.72, 0.54, -0.12, 0.86, 0.1);
            topY = 2.1;
            break;
        }
        case 'movie': { // 影视：爆米花桶，照片是桶身标签
            // 桶身（上宽下窄的梯形）和红条纹
            const bucket = new THREE.Shape();
            bucket.moveTo(-0.78, 0.7);
            bucket.lineTo(0.78, 0.7);
            bucket.lineTo(0.56, -0.7);
            bucket.lineTo(-0.56, -0.7);
            bucket.closePath();
            g.add(part(new THREE.ShapeGeometry(bucket), 0xfffaf0, 0, 0.85));
            // 条纹跟着桶身的斜度走（半宽随高度线性变化）
            for (const sx of [-0.42, 0, 0.42]) {
                const stripe = new THREE.Shape();
                const t = 0.13; // 条纹半宽
                stripe.moveTo(sx - t * 1.1, 0.7);
                stripe.lineTo(sx + t * 1.1, 0.7);
                stripe.lineTo(sx + t * 0.9, -0.7);
                stripe.lineTo(sx - t * 0.9, -0.7);
                stripe.closePath();
                g.add(part(new THREE.ShapeGeometry(stripe), 0xe05d5d, 0, 0.85, 0.005));
            }
            // 顶上的爆米花球
            const popColors = [0xfff3d0, 0xffe9b0, 0xfff8e0];
            [[-0.55, 1.58, 0.26], [-0.15, 1.72, 0.3], [0.3, 1.66, 0.27], [0.62, 1.55, 0.22], [-0.38, 1.78, 0.2], [0.12, 1.85, 0.22]].forEach(([x, y, r], i) => {
                g.add(part(CIRC(r), popColors[i % 3], x, y, 0.01));
            });
            addPhoto(g, photoMat, 0.68, 0.52, 0, 0.82, 0.04, 0.07);
            topY = 2.3;
            break;
        }
        case 'book': { // 读书：一本打开的书，照片在右页
            g.add(part(roundedRectGeo(2.05, 1.4, 0.12), 0x8f6fd8, 0, 0.85));
            g.add(part(RECT(0.9, 1.2), 0xfffaf0, -0.48, 0.87, 0.005, 0.06));
            g.add(part(RECT(0.9, 1.2), 0xfffaf0, 0.48, 0.87, 0.005, -0.06));
            for (let i = 0; i < 4; i++) {
                g.add(part(RECT(0.58, 0.045), 0xc9c2b8, -0.48, 1.18 - i * 0.22, 0.01, 0.06));
            }
            addPhoto(g, photoMat, 0.62, 0.82, 0.48, 0.87, -0.06, 0.05);
            topY = 1.9;
            break;
        }
        case 'study': { // 学习：小书包，照片在前袋上
            // 两侧露出的肩带
            g.add(part(roundedRectGeo(0.22, 0.9, 0.1), 0xc44a3c, -0.78, 0.95, -0.005, -0.12));
            g.add(part(roundedRectGeo(0.22, 0.9, 0.1), 0xc44a3c, 0.78, 0.95, -0.005, 0.12));
            // 包身
            g.add(part(roundedRectGeo(1.5, 1.5, 0.38), 0xf26d5b, 0, 0.92));
            // 顶盖和提手
            g.add(part(roundedRectGeo(1.1, 0.5, 0.2), 0xe05a48, 0, 1.62, 0.005));
            g.add(part(roundedRectGeo(0.42, 0.2, 0.09), 0xc44a3c, 0, 1.92));
            // 前袋
            g.add(part(roundedRectGeo(1.0, 0.78, 0.2), 0xff9a86, 0, 0.6, 0.005));
            addPhoto(g, photoMat, 0.66, 0.48, 0, 0.62, -0.03, 0.06);
            topY = 2.35;
            break;
        }
        case 'exercise': { // 锻炼：胖哑铃，照片吊牌挂在杆上
            // 握杆
            g.add(part(roundedRectGeo(1.7, 0.22, 0.11), 0x5a6a7a, 0, 0.78));
            // 两端铃片（圆角方片，外大内小）
            for (const sx of [-1, 1]) {
                g.add(part(roundedRectGeo(0.34, 1.0, 0.14), 0xc44a3c, sx * 0.82, 0.78));
                g.add(part(roundedRectGeo(0.3, 0.78, 0.12), 0xe05d5d, sx * 0.56, 0.78, 0.005));
            }
            // 吊牌：细绳 + 白边照片
            g.add(part(RECT(0.03, 0.3), 0xb0a48e, -0.14, 0.5, 0));
            g.add(part(RECT(0.03, 0.3), 0xb0a48e, 0.14, 0.5, 0));
            addPhoto(g, photoMat, 0.58, 0.44, 0, 0.22, 0.02, 0.06);
            topY = 1.75;
            break;
        }
        case 'show': { // 展览/演出：剧院红幕，照片是舞台
            // 舞台台面
            g.add(part(roundedRectGeo(2.4, 0.22, 0.1), 0x8a5a30, 0, 0.28));
            // 舞台背景（照片）
            addPhoto(g, photoMat, 1.6, 1.15, 0, 1.1, 0, 0.08, 0xfff6df);
            // 两侧红幕（微微外翻）
            g.add(part(roundedRectGeo(0.48, 1.75, 0.18), 0xd84a4a, -1.05, 1.15, 0.015, -0.09));
            g.add(part(roundedRectGeo(0.48, 1.75, 0.18), 0xd84a4a, 1.05, 1.15, 0.015, 0.09));
            // 顶部帘幔 + 波浪帘边（一排圆）
            g.add(part(roundedRectGeo(2.4, 0.5, 0.16), 0xd84a4a, 0, 2.1, 0.02));
            for (let i = 0; i < 6; i++) {
                g.add(part(CIRC(0.17), 0xd84a4a, -1.0 + i * 0.4, 1.82, 0.02));
            }
            // 帘幔金色穗带
            g.add(part(RECT(2.0, 0.07), 0xffd166, 0, 1.98, 0.025));
            topY = 2.7;
            break;
        }
        default: { // 默认：木杆路牌
            g.add(part(new THREE.CylinderGeometry(0.05, 0.06, 1.6, 6), 0x8a6a4a, 0, 0.8));
            addPhoto(g, photoMat, 1.76, 1.28, 0, 2.0, 0, 0.12);
            topY = 3.1;
            break;
        }
    }
    return { group: g, topY };
}

const markers = [];
EVENTS.forEach((ev, i) => {
    const t = (i + 1) / (EVENTS.length + 1);
    const p = curve.getPointAt(t);
    const side = sideVectorAt(t);
    if (side.z > 0) side.negate(); // 标志放在路的远侧，面向相机
    const pos = p.clone().add(side.multiplyScalar(2.2));

    const group = new THREE.Group();
    group.position.copy(pos);

    const photoMat = new THREE.MeshBasicMaterial({ map: placeholderTexture(i) });
    const prop = buildProp(ev.type, photoMat);
    const frame = prop.group;
    group.add(frame);

    // 发光球：核心小球 + 光晕贴片
    const orbMat = new THREE.MeshBasicMaterial({
        color: 0xffd98a, transparent: true, opacity: 0.95,
        depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 12), orbMat);
    orb.position.y = prop.topY;
    group.add(orb);
    const haloMat = new THREE.SpriteMaterial({
        map: glowTex, transparent: true, opacity: 0.55,
        depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const halo = new THREE.Sprite(haloMat);
    halo.scale.setScalar(1.3);
    halo.position.y = prop.topY;
    group.add(halo);

    // 有真实照片时替换贴图
    if (ev.photo) {
        new THREE.TextureLoader().load(ev.photo, (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            photoMat.map = tex;
            photoMat.needsUpdate = true;
        });
    }

    scene.add(group);
    billboards.push(group); // 扁平物件，始终面向相机
    markers.push({ t, event: ev, group, orb, orbMat, haloMat, frame, orbY: prop.topY, triggered: false, index: i });
});

// ---------- 终点牌 ----------
{
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffe9a3';
    ctx.font = 'bold 130px Kalam, "Great Vibes", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(255, 200, 90, 0.9)';
    ctx.shadowBlur = 30;
    ctx.fillText('2027 新年快乐', 512, 128);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    const signMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false });
    signMat.userData.keepAtNight = true; // 天黑后仍保持发亮
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(10, 2.5), signMat);
    sign.position.set(END_POS.x, 3.6, END_POS.z);
    scene.add(sign);
}

// ---------- 烟花 ----------
const fireworks = [];
let fireworkTimer = 0;
// 终点演出的状态：停下 → 转身背对屏幕 → 天黑 → 放礼花
const finale = { time: 0, turnFrom: 0, turnTo: 0, fireworksStarted: false, away: new THREE.Vector3(0, 0, -1) };
function spawnBurst() {
    const count = 110;
    const positions = new Float32Array(count * 3);
    const velocities = [];
    // 礼花在人物前方（她背对镜头望去的方向）的夜空里炸开
    const side = new THREE.Vector3(-finale.away.z, 0, finale.away.x);
    const center = character.position.clone()
        .addScaledVector(finale.away, 18 + Math.random() * 16)
        .addScaledVector(side, (Math.random() - 0.5) * 20);
    center.y = 6 + Math.random() * 7;
    for (let i = 0; i < count; i++) {
        positions[i * 3] = center.x;
        positions[i * 3 + 1] = center.y;
        positions[i * 3 + 2] = center.z;
        const dir = new THREE.Vector3().randomDirection();
        velocities.push(dir.multiplyScalar(3.5 + Math.random() * 4.5));
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
        color: new THREE.Color().setHSL(Math.random(), 0.85, 0.65),
        size: 0.22, transparent: true, opacity: 1,
        depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const points = new THREE.Points(geo, mat);
    scene.add(points);
    fireworks.push({ points, velocities, life: 1.7 });
}

function updateFireworks(dt) {
    for (let i = fireworks.length - 1; i >= 0; i--) {
        const f = fireworks[i];
        f.life -= dt;
        const pos = f.points.geometry.attributes.position;
        for (let j = 0; j < f.velocities.length; j++) {
            const v = f.velocities[j];
            v.y -= 4.5 * dt;
            pos.array[j * 3] += v.x * dt;
            pos.array[j * 3 + 1] += v.y * dt;
            pos.array[j * 3 + 2] += v.z * dt;
        }
        pos.needsUpdate = true;
        f.points.material.opacity = Math.max(0, f.life / 1.7);
        if (f.life <= 0) {
            scene.remove(f.points);
            f.points.geometry.dispose();
            f.points.material.dispose();
            fireworks.splice(i, 1);
        }
    }
}

// ---------- 入夜：天空/雾/灯光/所有平涂材质整体变暗 ----------
// 收集所有可变暗的材质（烟花、星星、光晕等加法混合的除外，越夜越亮）
const nightMats = [];
scene.traverse((o) => {
    if (!o.material) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of mats) {
        if (m.blending === THREE.AdditiveBlending || !m.color || m.userData.keepAtNight) continue;
        m.userData.dayColor = m.color.clone();
        nightMats.push(m);
    }
});

let night = 0; // 0 = 白天，1 = 夜晚
let nightTarget = 0;
let lastAppliedNight = -1;
function applyNight(n) {
    paintSky(n);
    for (const m of nightMats) {
        m.color.copy(m.userData.dayColor).multiplyScalar(1 - 0.74 * n);
    }
    hemi.intensity = 1.25 * (1 - 0.7 * n);
    sun.intensity = 1.6 * (1 - 0.85 * n);
    if (starMat) starMat.opacity = n * 0.95;
    if (moonMat) moonMat.opacity = n;
}

// 最短路径的角度插值（转身用）
function lerpAngle(a, b, t) {
    let d = (b - a) % (Math.PI * 2);
    if (d > Math.PI) d -= Math.PI * 2;
    if (d < -Math.PI) d += Math.PI * 2;
    return a + d * t;
}

// ---------- 状态机与 UI ----------
let state = 'loading'; // loading → ready → walking ⇄ paused → finale → finished
let progress = 0;

// 人物转身后凝望的天空方向（VRM 视线目标）
const skyGaze = new THREE.Object3D();
scene.add(skyGaze);

const $ = (id) => document.getElementById(id);
const ui = {
    loading: $('loading'),
    loadingText: $('loading-text'),
    startScreen: $('start-screen'),
    startBtn: $('start-btn'),
    eventCard: $('event-card'),
    cardPhoto: $('card-photo'),
    cardPlaceholder: $('card-photo-placeholder'),
    cardDate: $('card-date'),
    cardType: $('card-type'),
    cardTitle: $('card-title'),
    cardDesc: $('card-desc'),
    cardCounter: $('card-counter'),
    continueBtn: $('continue-btn'),
    endScreen: $('end-screen'),
    restartBtn: $('restart-btn'),
    progressFill: $('progress-fill'),
};

ui.startBtn.addEventListener('click', () => {
    ui.startScreen.classList.add('hidden');
    state = 'walking';
});

ui.continueBtn.addEventListener('click', () => {
    ui.eventCard.classList.add('hidden');
    state = 'walking';
});

ui.restartBtn.addEventListener('click', () => window.location.reload());

function arriveAt(marker) {
    state = 'paused';
    marker.triggered = true;
    marker.orbMat.opacity = 0.25;
    marker.haloMat.opacity = 0.15;
    const ev = marker.event;
    if (ev.photo) {
        ui.cardPhoto.src = ev.photo;
        ui.cardPhoto.style.display = 'block';
        ui.cardPlaceholder.style.display = 'none';
    } else {
        ui.cardPhoto.style.display = 'none';
        ui.cardPlaceholder.style.display = 'flex';
    }
    ui.cardDate.textContent = ev.date || '';
    const tp = EVENT_TYPES[ev.type];
    if (tp) {
        ui.cardType.textContent = tp.label;
        ui.cardType.style.background = tp.color;
        ui.cardType.style.display = 'inline-block';
    } else {
        ui.cardType.style.display = 'none';
    }
    ui.cardTitle.textContent = ev.title || '';
    ui.cardDesc.textContent = ev.description || '';
    ui.cardCounter.textContent = `第 ${marker.index + 1} 站 · 共 ${markers.length} 站`;
    ui.eventCard.classList.remove('hidden');
}

function finish() {
    state = 'finale';
    finale.time = 0;
    finale.fireworksStarted = false;
    finale.turnFrom = character.rotation.y;
    // 背对屏幕：镜头始终在人物 +z 一侧，所以"背对"就是面向 -z，
    // 再稍微偏向路的前方（2027 与礼花的方向）。不取 camera.position，
    // 因为跳转进度后相机还在平滑跟随途中，方向不可靠。
    const tan = curve.getTangentAt(Math.min(progress, 1));
    const away = new THREE.Vector3(0, 0, -1).addScaledVector(tan, 0.45).normalize();
    finale.away.copy(away);
    finale.turnTo = Math.atan2(away.x, away.z);
    if (vrm && vrm.lookAt) vrm.lookAt.target = skyGaze;
}

// ---------- 进度条：可拖动跳转，站点圆点直达 ----------
function setTriggered(m, flag) {
    m.triggered = flag;
    m.orbMat.opacity = flag ? 0.25 : 0.95;
    m.haloMat.opacity = flag ? 0.15 : 0.55;
}

// 跳到小路上的任意位置：之前的站标记为已过，之后的站恢复可触发
function jumpTo(t) {
    if (state === 'loading' || state === 'ready') return;
    progress = THREE.MathUtils.clamp(t, 0, 0.99);
    for (const m of markers) setTriggered(m, m.t < progress);
    ui.eventCard.classList.add('hidden');
    ui.endScreen.classList.add('hidden');
    ui.progressFill.style.width = `${Math.round(progress * 100)}%`;
    // 从终点演出跳回：天重新亮起来，视线重新看向镜头
    nightTarget = 0;
    finale.fireworksStarted = false;
    if (vrm && vrm.lookAt) vrm.lookAt.target = camera;
    state = 'walking';
}

const progressBar = $('progress');
markers.forEach((m) => {
    const dot = document.createElement('div');
    dot.className = 'progress-dot';
    dot.style.left = `${m.t * 100}%`;
    dot.title = `${m.event.date || ''} ${m.event.title || ''}`.trim();
    dot.addEventListener('pointerdown', (e) => e.stopPropagation());
    dot.addEventListener('click', (e) => {
        e.stopPropagation();
        if (state === 'loading' || state === 'ready') return;
        jumpTo(m.t);
        arriveAt(m);
    });
    progressBar.appendChild(dot);
});

let scrubbing = false;
function barT(e) {
    const r = progressBar.getBoundingClientRect();
    return THREE.MathUtils.clamp((e.clientX - r.left) / r.width, 0, 1);
}
progressBar.addEventListener('pointerdown', (e) => {
    if (state === 'loading' || state === 'ready') return;
    scrubbing = true;
    jumpTo(barT(e));
});
window.addEventListener('pointermove', (e) => {
    if (scrubbing) jumpTo(barT(e));
});
window.addEventListener('pointerup', () => {
    scrubbing = false;
});

// ---------- 加载 ----------
const manager = new THREE.LoadingManager();
manager.onProgress = (url, loaded, total) => {
    ui.loadingText.textContent = `正在走进森林… ${Math.round((loaded / total) * 100)}%`;
};

loadCharacter(manager).then(() => {
    ui.loading.classList.add('hidden');
    ui.startScreen.classList.remove('hidden');
    state = 'ready';
});

// ---------- 主循环 ----------
const clock = new THREE.Clock();
const camTarget = new THREE.Vector3(0, 1.5, 0);

function tick() {
    requestAnimationFrame(tick);
    const dt = Math.min(clock.getDelta(), 0.05);
    const time = clock.elapsedTime;

    const walking = state === 'walking';
    if (walking) {
        progress += (WALK_SPEED / curveLength) * dt;
        const next = markers.find((m) => !m.triggered);
        if (next && progress >= next.t) {
            progress = next.t;
            arriveAt(next);
        } else if (progress >= 0.995) {
            progress = 0.995;
            finish();
        }
        ui.progressFill.style.width = `${Math.round(progress * 100)}%`;
    }

    // 人物位置与朝向
    const t = Math.min(progress, 1);
    const p = curve.getPointAt(t);
    const tan = curve.getTangentAt(t);
    character.position.x = p.x;
    character.position.z = p.z;
    if (state !== 'finale' && state !== 'finished') {
        character.rotation.y = Math.atan2(tan.x, tan.z);
    }
    animateCharacter(dt, walking, time);
    if (vrm) vrm.update(dt);

    // 终点演出：停下 → 转身背对屏幕 → 天黑 → 放礼花
    if (state === 'finale') {
        finale.time += dt;
        const k = THREE.MathUtils.clamp((finale.time - 0.5) / 1.5, 0, 1);
        character.rotation.y = lerpAngle(finale.turnFrom, finale.turnTo, k * k * (3 - 2 * k));
        if (finale.time > 1.0) nightTarget = 1;
        if (finale.time > 2.3) finale.fireworksStarted = true;
        if (finale.time > 5.4) {
            state = 'finished';
            ui.endScreen.classList.remove('hidden');
        }
    }
    if (state === 'finale' || state === 'finished') {
        skyGaze.position.copy(character.position).addScaledVector(finale.away, 10);
        skyGaze.position.y = 5.5;
    }

    // 昼夜渐变（拖动进度条跳回时会重新天亮）
    if (night !== nightTarget) {
        night = THREE.MathUtils.clamp(
            night + Math.sign(nightTarget - night) * dt / (nightTarget > night ? 2.8 : 1.2),
            0, 1,
        );
    }
    if (Math.abs(night - lastAppliedNight) > 0.0004) {
        applyNight(night);
        lastAppliedNight = night;
    }

    // 侧视角相机：固定在路的 +z 一侧，平移跟随人物（停顿时视线转向路牌）
    let lookGoal;
    if (state === 'paused') {
        const m = markers.find((mk) => mk.triggered && mk.t === progress);
        lookGoal = m ? m.group.position.clone().setY(1.3) : p.clone().add(tan.clone().multiplyScalar(2)).setY(1.4);
    } else if (state === 'finale' || state === 'finished') {
        // 视线随她转向夜空，入夜后稍微抬高看礼花
        lookGoal = p.clone().addScaledVector(finale.away, 4).setY(1.4 + night * 2.4);
    } else {
        lookGoal = p.clone().add(tan.clone().multiplyScalar(2)).setY(1.4);
    }
    const camGoal = p.clone()
        .add(new THREE.Vector3(0, 3.3 + Math.sin(time * 0.7) * 0.08, 15.5));
    const k = 1 - Math.exp(-3 * dt);
    camera.position.lerp(camGoal, k);
    camTarget.lerp(lookGoal, k);
    camera.lookAt(camTarget);

    // 纸片景物面向相机；云缓慢漂移
    for (const b of billboards) {
        b.rotation.y = Math.atan2(camera.position.x - b.position.x, camera.position.z - b.position.z);
    }
    for (const c of clouds) {
        c.position.x += c.userData.speed * dt;
    }

    // 氛围动画
    updateSnow(dt);
    for (const m of markers) {
        if (!m.triggered) {
            const pulse = 1 + 0.18 * Math.sin(time * 2.5 + m.index);
            m.orb.scale.setScalar(pulse);
            m.haloMat.opacity = 0.38 + 0.18 * Math.sin(time * 2.5 + m.index);
            m.orb.position.y = m.orbY + Math.sin(time * 1.6 + m.index * 1.3) * 0.12;
            m.frame.position.y = Math.sin(time * 1.6 + m.index * 1.3) * 0.07;
        }
    }

    if (state === 'finished' || finale.fireworksStarted) {
        fireworkTimer -= dt;
        if (fireworkTimer <= 0) {
            spawnBurst();
            fireworkTimer = 0.8 + Math.random() * 0.5;
        }
    }
    updateFireworks(dt);

    renderer.render(scene, camera);
}
tick();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
