import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { EVENTS, EVENT_TYPES } from './events.js';

// 事件按真实日期比例站在小路上：t = (年内第几天 - 0.5) / 365（2026 非闰年）
// 1 月 1 日 ≈ 0.0014，12 月 31 日 ≈ 0.9986
function dateToT(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dayOfYear = Math.round((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 1)) / 86400000) + 1;
    return (dayOfYear - 0.5) / 365;
}
const MIN_T_GAP = 0.0045; // 相邻标志最小间距（约 1.6 天），防止同一天/连日的标志叠在一起
const markerTs = (() => {
    const sorted = EVENTS.map((ev, i) => ({ t: dateToT(ev.date), i })).sort((a, b) => a.t - b.t);
    let prev = -1;
    const ts = new Array(EVENTS.length);
    for (const s of sorted) {
        const t = Math.max(s.t, prev + MIN_T_GAP);
        ts[s.i] = t;
        prev = t;
    }
    return ts;
})();

const ASSETS = './assets';
const VRM_URL = `${ASSETS}/hazel-pink.vrm`;
const WALK_SPEED = 2.4;  // 米/秒：基准步速（走路↔跑步步态插值的下限）
const RUN_SPEED = 8.0;   // 米/秒：快速滚动时步态插值的上限
let moveSpeed = WALK_SPEED; // 由滚动速度换算而来
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

// 竖屏/窄屏适配：拉远相机距离并适度加大 FOV，竖屏时横向也能装下小路和标志
function viewFit() {
    const a = window.innerWidth / window.innerHeight;
    if (a >= 1.25) return { dist: 1, fov: 38 };
    const k = Math.min(1.25 / a, 2.4);
    return { dist: Math.pow(k, 0.7), fov: 38 * Math.pow(k, 0.3) };
}
let camDist = 1;
function applyViewFit() {
    const vf = viewFit();
    camDist = vf.dist;
    camera.fov = vf.fov;
    camera.updateProjectionMatrix();
}
applyViewFit();
camera.position.set(-6, 3.3, 15.5 * camDist);

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
// 路长固定代表一整年：事件站位按真实日期比例，不再依赖事件数量
const SEGMENTS = 40;
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
const CANOPY_BLOBS = [
    [0, 1.55, 1.05],
    [-0.85, 1.15, 0.72],
    [0.85, 1.2, 0.78],
    [-0.42, 1.98, 0.62],
    [0.45, 2.02, 0.6],
];

function makeCanopy(colorHex) {
    const g = new THREE.Group();
    const shadowMat = flatMat(new THREE.Color(colorHex).multiplyScalar(0.8));
    for (const [x, y, r] of CANOPY_BLOBS) {
        const m = new THREE.Mesh(new THREE.CircleGeometry(r, 20), shadowMat);
        m.position.set(x + 0.16, y - 0.16, -0.02);
        g.add(m);
    }
    const mat = flatMat(colorHex);
    for (const [x, y, r] of CANOPY_BLOBS) {
        const m = new THREE.Mesh(new THREE.CircleGeometry(r, 20), mat);
        m.position.set(x, y, 0);
        g.add(m);
    }
    return g;
}

// 秋天的树结果子：每棵树只结一种果子（苹果 / 橘子 / 桃子），不同的树果子不同
const FRUIT_COLORS = [0xe04b3a, 0xf28c28, 0xffb3a0];
function addFruits(canopy) {
    const fruitColor = FRUIT_COLORS[Math.floor(Math.random() * FRUIT_COLORS.length)];
    const n = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) {
        const [bx, by, br] = CANOPY_BLOBS[Math.floor(Math.random() * CANOPY_BLOBS.length)];
        const a = Math.random() * Math.PI * 2;
        const rr = Math.random() * br * 0.72;
        const f = new THREE.Mesh(
            new THREE.CircleGeometry(0.09 + Math.random() * 0.04, 10),
            flatMat(fruitColor),
        );
        f.position.set(bx + Math.cos(a) * rr, by + Math.sin(a) * rr, 0.015);
        canopy.add(f);
    }
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
    const canopy = makeCanopy(color);
    g.add(canopy);
    // 秋天的近景树大多会结果子（远景揉进天色的树就不点了）
    if (season === 'autumn' && haze <= 0.3 && Math.random() < 0.65) addFruits(canopy);
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

// 雪人：冬天雪地上的装饰。每个雪人都不一样——围巾颜色、鼻子朝向、
// 手臂姿势、有没有帽子、身材比例都随机
const SCARF_COLORS = [0xe05d5d, 0x5a8fd0, 0xf0a03c];
function makeSnowman() {
    const g = new THREE.Group();
    const add = (geo, color, x, y, z = 0, rz = 0) => {
        const m = new THREE.Mesh(geo, flatMat(color));
        m.position.set(x, y, z);
        if (rz) m.rotation.z = rz;
        g.add(m);
        return m;
    };
    const bodyR = 0.56 * (0.92 + Math.random() * 0.16);
    const headR = 0.38 * (0.9 + Math.random() * 0.2);
    const headY = 0.52 + bodyR * 0.55 + headR * 0.75;
    const body = [[0, 0.52, bodyR], [0, headY, headR]];
    for (const [x, y, r] of body) add(new THREE.CircleGeometry(r, 20), 0xd9e6ef, x + 0.07, y - 0.07, -0.02);
    for (const [x, y, r] of body) add(new THREE.CircleGeometry(r, 20), 0xf8fcff, x, y);
    // 树枝手臂：内端深深插进身体里（放在前层，和围巾眼睛同一深度，不会闪面），
    // 无论手臂怎么翘、雪球胖瘦如何，内端都始终在雪球轮廓之内
    const armAngleL = 0.25 + Math.random() * 0.25;
    const armAngleR = 0.25 + Math.random() * 0.25;
    add(new THREE.PlaneGeometry(0.7, 0.06), 0x8a5a30, -0.55, 0.72, 0.02, armAngleL);
    add(new THREE.PlaneGeometry(0.7, 0.06), 0x8a5a30, 0.55, 0.72, 0.02, -armAngleR);
    // 围巾 + 垂下来的一截
    const scarf = SCARF_COLORS[Math.floor(Math.random() * SCARF_COLORS.length)];
    add(new THREE.PlaneGeometry(headR * 1.7, 0.15), scarf, 0, headY - headR * 0.7, 0.01);
    add(new THREE.PlaneGeometry(0.15, 0.34), scarf, 0.16, headY - headR * 0.7 - 0.2, 0.01, -0.12);
    // 眼睛 / 胡萝卜鼻子（朝左或朝右）/ 纽扣
    add(new THREE.CircleGeometry(0.045, 10), 0x3a3230, -0.13, headY + 0.12, 0.01);
    add(new THREE.CircleGeometry(0.045, 10), 0x3a3230, 0.13, headY + 0.12, 0.01);
    const nose = new THREE.Shape();
    nose.moveTo(0, 0.05);
    nose.lineTo(0.3, 0);
    nose.lineTo(0, -0.05);
    nose.closePath();
    const noseDir = Math.random() < 0.5 ? 1 : -1;
    add(new THREE.ShapeGeometry(nose), 0xf2822a, 0.03 * noseDir, headY, 0.01, noseDir < 0 ? Math.PI : 0);
    const buttons = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < buttons; i++) {
        add(new THREE.CircleGeometry(0.05, 10), 0x3a3230, 0, 0.62 - i * 0.2, 0.01);
    }
    // 一半的雪人戴小帽子
    if (Math.random() < 0.5) {
        const hatTilt = (Math.random() - 0.5) * 0.3;
        add(new THREE.PlaneGeometry(headR * 1.5, 0.09), 0x4a4038, 0, headY + headR * 0.78, 0.01, hatTilt);
        add(new THREE.PlaneGeometry(headR * 0.95, 0.3), 0x4a4038, 0, headY + headR * 0.78 + 0.18, 0.01, hatTilt);
    }
    return g;
}

// 蘑菇：秋天草地上的装饰
function makeMushroom() {
    const g = new THREE.Group();
    const add = (geo, color, x, y, z = 0) => {
        const m = new THREE.Mesh(geo, flatMat(color));
        m.position.set(x, y, z);
        g.add(m);
        return m;
    };
    const capColor = [0xd94f3d, 0xe07b39, 0xc94f5a][Math.floor(Math.random() * 3)];
    // 柄
    add(new THREE.PlaneGeometry(0.2, 0.34), 0xfff3dd, 0, 0.17);
    // 伞盖（半圆）+ 白点点
    add(new THREE.CircleGeometry(0.38, 20, 0, Math.PI), capColor, 0, 0.3, 0.01);
    add(new THREE.CircleGeometry(0.05, 8), 0xfff6e6, -0.14, 0.44, 0.02);
    add(new THREE.CircleGeometry(0.04, 8), 0xfff6e6, 0.1, 0.52, 0.02);
    add(new THREE.CircleGeometry(0.035, 8), 0xfff6e6, 0.2, 0.36, 0.02);
    return g;
}
// 沿路散布。opts.seasons 限定出现的季节；opts.side='far' 只放路的远侧（不挡人物）
// opts.avoidR：与任一事件标志的水平距离小于此值就丢弃重抽（树不挡标志）
// opts.maxT：候选 t 超过此值就丢弃重抽（年终路段不撒，终点视野留空）
function scatter(makeFn, count, minDist, maxDist, scaleRange, opts = {}) {
    let placed = 0;
    let attempts = 0;
    while (placed < count && attempts < count * 25) {
        attempts++;
        const t = Math.random();
        if (opts.maxT !== undefined && t > opts.maxT) continue;
        const season = seasonAt(t);
        if (opts.seasons && !opts.seasons.includes(season)) continue;
        const p = curve.getPointAt(t);
        const side = sideVectorAt(t);
        let sign = Math.random() < 0.5 ? -1 : 1;
        // 相机在 +z 一侧：远侧 = z 更小的一侧
        if (opts.side === 'far' && side.z * sign > 0) sign = -sign;
        if (opts.side === 'near' && side.z * sign < 0) sign = -sign;
        const dist = minDist + Math.random() * (maxDist - minDist);
        const x = p.x + side.x * sign * dist;
        const z = p.z + side.z * sign * dist;
        if (opts.avoidR !== undefined) {
            const r2 = opts.avoidR * opts.avoidR;
            let tooClose = false;
            for (const mp of markerPts) {
                const dx = mp.x - x;
                const dz = mp.z - z;
                if (dx * dx + dz * dz < r2) { tooClose = true; break; }
            }
            if (tooClose) continue;
        }
        const obj = makeFn(season);
        obj.scale.setScalar(scaleRange[0] + Math.random() * (scaleRange[1] - scaleRange[0]));
        obj.position.set(x, 0, z);
        scene.add(obj);
        billboards.push(obj);
        placed++;
    }
}

// 事件标志的位置（x/z 平面），撒树时避开它们
const markerPts = markerTs.map((t) => curve.getPointAt(t));

// 树大多放在路的远侧；近侧放少量稀疏的树，偶尔从镜头前掠过（增加前景层次）
// 近 / 中 / 远三档：越远越大片、越揉进天空色，形成层次
scatter((s) => makeTree(s, 0), 60, 4.2, 10, [1.0, 1.7], { side: 'far', avoidR: 3.2 });
scatter((s) => makeTree(s, 0.35), 70, 10, 22, [1.3, 2.2], { side: 'far' });
scatter((s) => makeTree(s, 0.6), 80, 20, 48, [1.8, 3.0], { side: 'far' });
// 前景树两档：一档偶尔掠过画面一角；一档更靠近镜头、个头更矮，
// 在画面里只露下缘（近大远小，越近越靠下），丰富前景但不挡路上的人
// maxT 0.86：年终路段（约 11 月中之后）的近侧不撒树，终点演出视野干净
scatter((s) => makeTree(s, 0), 22, 4.5, 9, [0.7, 1.15], { side: 'near', avoidR: 5, maxT: 0.86 });
scatter((s) => makeTree(s, 0), 30, 9, 13.5, [0.65, 1.0], { side: 'near', avoidR: 4, maxT: 0.86 });
scatter(makeGrassTuft, 220, 2.6, 10, [0.7, 1.4], { seasons: ['spring', 'summer', 'autumn'] });
scatter(makeGrassTuft, 170, 2.5, 14, [0.8, 1.6], { seasons: ['spring', 'summer', 'autumn'], side: 'near' });
scatter(makeFlower, 90, 2.6, 7, [0.8, 1.3], { seasons: ['spring', 'summer'] });
scatter(makeFlower, 50, 7, 13, [0.9, 1.4], { seasons: ['spring', 'summer'], side: 'near' });
// 雪人固定站在开头一月的雪地上（地面雪白但空空的那段路，一远一近）
{
    const spots = [
        { t: 0.045, near: false, dist: 4.2, scale: 1.15 },
        { t: 0.09, near: true, dist: 3.4, scale: 0.85 },
    ];
    for (const spot of spots) {
        const p = curve.getPointAt(spot.t);
        const dir = sideVectorAt(spot.t);
        // 远侧 = z 更小的一侧（不挡人物）；近侧相反
        if (spot.near ? dir.z < 0 : dir.z > 0) dir.negate();
        const snowman = makeSnowman();
        snowman.scale.setScalar(spot.scale);
        snowman.position.set(p.x + dir.x * spot.dist, 0, p.z + dir.z * spot.dist);
        scene.add(snowman);
        billboards.push(snowman);
    }
}
// 秋天的草地上长蘑菇
scatter(makeMushroom, 45, 2.6, 8, [0.6, 1.15], { seasons: ['autumn'] });
scatter(makeMushroom, 25, 2.5, 9, [0.55, 1.0], { seasons: ['autumn'], side: 'near' });

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

// 终点牌旁边也站一个雪人，陪着一起跨年
{
    const endTan = curve.getTangentAt(1);
    const endSide = new THREE.Vector3(-endTan.z, 0, endTan.x).normalize();
    if (endSide.z > 0) endSide.negate(); // 路的远侧，不挡人物
    const snowman = makeSnowman();
    snowman.scale.setScalar(1.25);
    snowman.position.set(
        END_POS.x + endSide.x * 3.4,
        0,
        END_POS.z + endSide.z * 3.4,
    );
    scene.add(snowman);
    billboards.push(snowman);
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
// 云片用不透明材质：入夜后整体变暗成剪影；
// 半透明的话几个圆片重叠处会透出接缝，夜里一眼就看出是圆拼的
// 月亮的位置：云要避开它，终点夜空只留月亮、星星和礼花
const MOON_POS = new THREE.Vector3(END_POS.x + 16, 17, -55);
const clouds = [];
{
    for (let i = 0; i < 10; i++) {
        const g = new THREE.Group();
        const mat = flatMat(0xffffff);
        const puffs = 3 + Math.floor(Math.random() * 2);
        for (let j = 0; j < puffs; j++) {
            const r = 1.6 + Math.random() * 1.6;
            const puff = new THREE.Mesh(new THREE.CircleGeometry(r, 20), mat);
            puff.position.set((j - (puffs - 1) / 2) * 2.2, Math.random() * 0.8, 0);
            g.add(puff);
        }
        const t = Math.random();
        const p = curve.getPointAt(t);
        let x = p.x + (Math.random() - 0.5) * 50;
        const y = 15 + Math.random() * 10;
        // 云在远山背后（山在 z -75~-105）：距离更远、雾气更浓，层次才对
        const z = p.z - 100 - Math.random() * 25;
        // 月亮周围留白
        while (Math.hypot(x - MOON_POS.x, y - MOON_POS.y) < 26) x -= 40;
        g.position.set(x, y, z);
        g.scale.setScalar(1.5 + Math.random() * 1.4);
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
    moon.position.copy(MOON_POS);
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
        // 步频和摆腿幅度跟着速度走：滑得快就跑起来，步子更快更大
        const runK = walking ? THREE.MathUtils.clamp((moveSpeed - WALK_SPEED) / (RUN_SPEED - WALK_SPEED), 0, 1) : 0;
        walkPhase += dt * (walking ? 4.5 + Math.min(moveSpeed, 8) * 1.15 : 2);
        const amp = walking ? 1 + runK * 0.35 : 0;
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
        // 大臂：先垂下来（z），再前后摆（x）；跑起来时摆臂更开
        set('leftUpperArm', -s * (ARM_SWING + runK * 0.3) * amp, -ARM_DOWN);
        set('rightUpperArm', s * (ARM_SWING + runK * 0.3) * amp, ARM_DOWN);
        // 小臂：跟着垂下，略微向前弯一点
        set('leftLowerArm', null, -ARM_DOWN * 0.25);
        set('rightLowerArm', null, ARM_DOWN * 0.25);
        // 跑起来时身体前倾一点
        set('spine', walking ? 0.05 + runK * 0.14 : Math.sin(time * 1.4) * 0.02, null);
        if (bones.hips) bones.hips.rotation.y = s * 0.05 * amp;
    }
    const bob = walking ? Math.abs(Math.sin(walkPhase)) * 0.05 : 0;
    character.position.y = bob;
}

// ---------- 事件节点（图标徽章 + 发光球） ----------

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

// ---------- 事件标志：彩色圆徽章 + 标准图标（emoji），统一造型 ----------
// 徽章插在细木杆上；有照片时徽章中心换成圆形照片，右下角保留类型小图标
const EMOJI_FONT = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';

function drawBadge(ctx, ev, img = null) {
    const tp = EVENT_TYPES[ev.type] || { color: '#b0a48e', icon: '✨' };
    ctx.clearRect(0, 0, 256, 256);
    // 白边圆环 + 彩色圆底
    ctx.beginPath(); ctx.arc(128, 128, 122, 0, Math.PI * 2); ctx.fillStyle = '#fffaf0'; ctx.fill();
    ctx.beginPath(); ctx.arc(128, 128, 106, 0, Math.PI * 2); ctx.fillStyle = tp.color; ctx.fill();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (img) {
        // 圆形照片铺满徽章中心
        ctx.save();
        ctx.beginPath(); ctx.arc(128, 128, 100, 0, Math.PI * 2); ctx.clip();
        const s = Math.max(256 / img.width, 256 / img.height);
        ctx.drawImage(img, 128 - (img.width * s) / 2, 128 - (img.height * s) / 2, img.width * s, img.height * s);
        ctx.restore();
        // 右下角类型小圆标
        ctx.beginPath(); ctx.arc(194, 194, 40, 0, Math.PI * 2); ctx.fillStyle = '#fffaf0'; ctx.fill();
        ctx.beginPath(); ctx.arc(194, 194, 31, 0, Math.PI * 2); ctx.fillStyle = tp.color; ctx.fill();
        ctx.font = `36px ${EMOJI_FONT}`;
        ctx.fillText(tp.icon, 194, 197);
    } else {
        ctx.font = `104px ${EMOJI_FONT}`;
        ctx.fillText(tp.icon, 128, 136);
    }
}

// 返回 { group, topY }：topY 是放发光球的高度
function buildBadge(ev) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d');
    drawBadge(ctx, ev);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    // 有真实照片时画进徽章（media 里第一张图片，视频跳过）
    const firstImg = (ev.media || []).find((src) => !isVideo(src));
    if (firstImg) {
        const img = new Image();
        img.onload = () => { drawBadge(ctx, ev, img); tex.needsUpdate = true; };
        img.src = firstImg;
    }
    const g = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 1.0, 6), flatMat(0x8a6a4a));
    pole.position.y = 0.5;
    g.add(pole);
    const badge = new THREE.Mesh(
        new THREE.PlaneGeometry(1.5, 1.5),
        new THREE.MeshBasicMaterial({ map: tex, transparent: true }),
    );
    badge.position.y = 1.75;
    g.add(badge);
    return { group: g, topY: 2.75 };
}

const isVideo = (src) => /\.(mp4|webm|mov|m4v)$/i.test(src);

const markers = [];
EVENTS.forEach((ev, i) => {
    const t = markerTs[i]; // 按真实日期比例站位（已按最小间距错开）
    const p = curve.getPointAt(t);
    const side = sideVectorAt(t);
    if (side.z > 0) side.negate(); // 标志放在路的远侧，面向相机
    const dist = 2.2 + (i % 2) * 1.15; // 左右远近交替错落，密集段减少重叠
    const pos = p.clone().add(side.multiplyScalar(dist));

    const group = new THREE.Group();
    group.position.copy(pos);

    const prop = buildBadge(ev); // 徽章内部已处理照片加载
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

    scene.add(group);
    billboards.push(group); // 扁平物件，始终面向相机
    markers.push({ t, event: ev, group, orb, orbMat, haloMat, frame, orbY: prop.topY, triggered: false, index: i });
});

// ---------- 博客文章：每个事件一篇，插在 #story 里 #finale 之前 ----------
const storyEl = document.getElementById('story');
const finaleEl = document.getElementById('finale');
const articles = [];
{
    let prevDate = null;
    for (const ev of EVENTS) {
        const d = new Date(`${ev.date}T00:00:00`);
        const days = prevDate
            ? Math.round((d - prevDate) / 86400000)
            : Math.round((d - new Date('2026-01-01T00:00:00')) / 86400000);
        // spacer：高度体现自然时间间隔；跨月份时中央放一个大号淡淡的月份标签
        const spacer = document.createElement('div');
        spacer.className = 'spacer';
        spacer.style.height = `${Math.min(130, Math.max(35, 35 + days * 2))}vh`;
        if (!prevDate || d.getMonth() !== prevDate.getMonth()) {
            const label = document.createElement('div');
            label.className = 'month-label';
            label.textContent = `${d.getMonth() + 1} 月`;
            spacer.appendChild(label);
        }
        storyEl.insertBefore(spacer, finaleEl);

        const article = document.createElement('article');
        article.className = 'event-article card';

        const head = document.createElement('header');
        head.className = 'card-head';
        const dateEl = document.createElement('p');
        dateEl.className = 'card-date';
        dateEl.textContent = ev.label || ev.date || '';
        head.appendChild(dateEl);
        const tp = EVENT_TYPES[ev.type];
        if (tp) {
            const chip = document.createElement('span');
            chip.className = 'card-type';
            chip.textContent = `${tp.icon} ${tp.label}`; // 图标进博客，一眼看出类别
            chip.style.background = tp.color;
            head.appendChild(chip);
        }
        const titleEl = document.createElement('h2');
        titleEl.className = 'card-title';
        titleEl.textContent = ev.title || '';
        head.appendChild(titleEl);
        article.appendChild(head);

        const desc = document.createElement('p');
        desc.className = 'card-desc';
        desc.textContent = ev.description || '';
        article.appendChild(desc);

        // 媒体区：照片/视频依次排开；为空时放虚线占位
        const mediaEl = document.createElement('div');
        mediaEl.className = 'card-media';
        const media = ev.media || [];
        if (media.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'media-empty';
            empty.textContent = '照片 / 视频待添加';
            mediaEl.appendChild(empty);
        } else {
            for (const src of media) {
                if (isVideo(src)) {
                    const v = document.createElement('video');
                    v.src = src;
                    v.controls = true;
                    v.playsInline = true;
                    v.preload = 'metadata';
                    mediaEl.appendChild(v);
                } else {
                    const img = document.createElement('img');
                    img.src = src;
                    img.alt = ev.title || '';
                    img.loading = 'lazy';
                    mediaEl.appendChild(img);
                }
            }
        }
        article.appendChild(mediaEl);

        storyEl.insertBefore(article, finaleEl);
        articles.push(article);
        prevDate = d;
    }
}

// ---------- 滚动 ↔ 小路进度：每篇文章一个锚点，分段线性映射 ----------
// 文章滚到视口上 28% 处时，人物正好走到对应的标志旁；终点卡片进入下半屏时触发跨年演出
let anchors = [];
let finaleAnchor = 0;
function layoutAnchors() {
    const vh = window.innerHeight;
    anchors = articles.map((a) => a.offsetTop - vh * 0.28);
    finaleAnchor = finaleEl.offsetTop - vh * 0.6;
}
layoutAnchors();
new ResizeObserver(layoutAnchors).observe(storyEl); // 图片加载会改变文章高度

function scrollToProgress(y) {
    const n = markerTs.length;
    if (y <= anchors[0]) {
        const k = anchors[0] > 0 ? THREE.MathUtils.clamp(y / anchors[0], 0, 1) : 0;
        return k * markerTs[0];
    }
    for (let i = 0; i < n - 1; i++) {
        if (y < anchors[i + 1]) {
            const k = (y - anchors[i]) / (anchors[i + 1] - anchors[i]);
            return markerTs[i] + k * (markerTs[i + 1] - markerTs[i]);
        }
    }
    if (y < finaleAnchor) {
        const k = (y - anchors[n - 1]) / (finaleAnchor - anchors[n - 1]);
        return markerTs[n - 1] + k * (0.995 - markerTs[n - 1]);
    }
    return 0.995;
}

// 反函数：progress → scrollY（进度条拖动用）
function progressToScroll(t) {
    const n = markerTs.length;
    if (t <= markerTs[0]) {
        return markerTs[0] > 0 ? (t / markerTs[0]) * anchors[0] : 0;
    }
    for (let i = 0; i < n - 1; i++) {
        if (t < markerTs[i + 1]) {
            const k = (t - markerTs[i]) / (markerTs[i + 1] - markerTs[i]);
            return anchors[i] + k * (anchors[i + 1] - anchors[i]);
        }
    }
    if (t < 0.995) {
        const k = (t - markerTs[n - 1]) / (0.995 - markerTs[n - 1]);
        return anchors[n - 1] + k * (finaleAnchor - anchors[n - 1]);
    }
    return finaleAnchor;
}

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
let state = 'loading'; // loading → ready → finale → finished
let progress = 0;
let chaseSpeed = 0;    // 追赶滚动目标的当前速度（t/秒），带惯性
let hasScrolled = false; // 开始滚动前，人物站在起点面向镜头挥手

// 人物转身后凝望的天空方向（VRM 视线目标）
const skyGaze = new THREE.Object3D();
scene.add(skyGaze);

const $ = (id) => document.getElementById(id);
const ui = {
    loading: $('loading'),
    loadingText: $('loading-text'),
    restartBtn: $('restart-btn'),
    progressFill: $('progress-fill'),
};

ui.restartBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

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

// ---------- 进度条：可拖动跳转（拖动 = 滚动页面），站点圆点直达 ----------
const progressBar = $('progress');
markers.forEach((m) => {
    const dot = document.createElement('div');
    dot.className = 'progress-dot';
    dot.style.left = `${m.t * 100}%`;
    dot.dataset.title = `${m.event.label || m.event.date || ''} ${m.event.title || ''}`.trim(); // 悬停气泡里显示
    const tp = EVENT_TYPES[m.event.type];
    if (tp) dot.style.borderColor = tp.color;
    dot.addEventListener('pointerdown', (e) => e.stopPropagation());
    dot.addEventListener('click', (e) => {
        e.stopPropagation();
        window.scrollTo({ top: anchors[m.index], behavior: 'smooth' });
    });
    progressBar.appendChild(dot);
    m.dot = dot;
});

let scrubbing = false;
function barT(e) {
    const r = progressBar.getBoundingClientRect();
    return THREE.MathUtils.clamp((e.clientX - r.left) / r.width, 0, 1);
}
progressBar.addEventListener('pointerdown', (e) => {
    scrubbing = true;
    window.scrollTo({ top: progressToScroll(barT(e)) }); // 立即跳转，不平滑
});
window.addEventListener('pointermove', (e) => {
    if (scrubbing) window.scrollTo({ top: progressToScroll(barT(e)) });
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
    state = 'ready'; // 加载完直接露出 intro，滚动即开始
});

// ---------- 主循环 ----------
const clock = new THREE.Clock();
const camTarget = new THREE.Vector3(0, 1.5, 0);

function tick() {
    requestAnimationFrame(tick);
    const dt = Math.min(clock.getDelta(), 0.05);
    const time = clock.elapsedTime;

    // 滚动即行走：scrollY 分段线性映射到小路进度。
    // 人物不瞬移跟随滚动——有最快速度和平滑加减速：滑快了她小跑追赶，
    // 滑停了她缓两步才站稳；只有大跳转（点圆点/拖进度条）才直接到位
    const scrollY = window.scrollY;
    if (scrollY > 2) hasScrolled = true;
    const target = scrollToProgress(scrollY);
    const gap = target - progress;
    if (Math.abs(gap) > 0.09) {
        progress = target;
        chaseSpeed = 0;
    } else {
        const maxChase = 7 / curveLength;  // 追赶最快速度 7 米/秒
        const accel = 9 / curveLength;     // 加速度 9 米/秒²
        const desired = THREE.MathUtils.clamp(gap * 1.6, -maxChase, maxChase);
        chaseSpeed += THREE.MathUtils.clamp(desired - chaseSpeed, -accel * dt, accel * dt);
        if (Math.abs(gap) < 0.0003 && Math.abs(chaseSpeed) < 0.0004) chaseSpeed = 0;
        progress += chaseSpeed * dt;
    }
    const vel = chaseSpeed;
    const moving = Math.abs(vel) > 0.0006;
    moveSpeed = Math.min(Math.abs(vel) * curveLength, 8);
    ui.progressFill.style.width = `${Math.round(progress * 100)}%`;

    // 终点演出由滚动触发；往回滑离终点区域则天亮复原
    if (state === 'ready' && scrollY >= finaleAnchor) {
        finish();
    } else if ((state === 'finale' || state === 'finished') && scrollY < finaleAnchor - 40) {
        state = 'ready';
        nightTarget = 0;
        finale.fireworksStarted = false;
        if (vrm && vrm.lookAt) vrm.lookAt.target = camera;
    }

    // 人物位置与朝向
    const t = Math.min(progress, 1);
    const p = curve.getPointAt(t);
    const tan = curve.getTangentAt(t);
    character.position.x = p.x;
    character.position.z = p.z;
    // 还没滚动过时站在起点面向镜头挥手；走起来以后平滑转向运动方向（往上滑 = 转身朝后走），停顿保持朝向
    const waving = !hasScrolled && progress < 0.001 && state === 'ready';
    if (state !== 'finale' && state !== 'finished') {
        const turnK = 1 - Math.exp(-7 * dt); // 平滑转身，不瞬间掉头
        if (waving) {
            character.rotation.y = lerpAngle(character.rotation.y, 0, turnK);
        } else if (moving) {
            const dir = vel > 0 ? 1 : -1;
            character.rotation.y = lerpAngle(character.rotation.y, Math.atan2(tan.x * dir, tan.z * dir), turnK);
        }
    }
    animateCharacter(dt, moving, time);
    if (waving && bones) {
        // 自然的挥手：上臂抬到侧上方（手在头的旁边，不会插进头发），
        // 靠前臂左右摆动打招呼；头轻轻歪一点
        const wave = Math.sin(time * 4.5);
        if (bones.rightUpperArm) {
            bones.rightUpperArm.rotation.x = 0;
            bones.rightUpperArm.rotation.z = -1.3 + wave * 0.06;
        }
        if (bones.rightLowerArm) {
            // 扭转前臂让手掌面向观众，再左右摆动打招呼
            bones.rightLowerArm.rotation.x = -1.5;
            bones.rightLowerArm.rotation.z = -0.35 + wave * 0.4;
        }
        if (bones.head) bones.head.rotation.z = 0.08;
    } else if (bones && bones.head) {
        bones.head.rotation.z = 0;
    }
    if (vrm) vrm.update(dt);

    // 终点演出：停下 → 转身背对屏幕 → 天黑 → 放礼花
    if (state === 'finale') {
        finale.time += dt;
        const k = THREE.MathUtils.clamp((finale.time - 0.5) / 1.5, 0, 1);
        character.rotation.y = lerpAngle(finale.turnFrom, finale.turnTo, k * k * (3 - 2 * k));
        if (finale.time > 1.0) nightTarget = 1;
        if (finale.time > 2.3) finale.fireworksStarted = true;
        if (finale.time > 5.4) state = 'finished';
    }
    if (state === 'finale' || state === 'finished') {
        skyGaze.position.copy(character.position).addScaledVector(finale.away, 10);
        skyGaze.position.y = 5.5;
    }

    // 昼夜渐变（滑离终点区域时会重新天亮）
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

    // 侧视角相机：固定在路的 +z 一侧，平移跟随人物
    let lookGoal;
    if (state === 'finale' || state === 'finished') {
        // 视线随她转向夜空，入夜后稍微抬高看礼花
        lookGoal = p.clone().addScaledVector(finale.away, 4).setY(1.4 + night * 2.4);
    } else if (!moving) {
        // 停顿时若正好在某站旁边，视线转向那个标志
        let near = null;
        for (const m of markers) {
            if (Math.abs(m.t - progress) < 0.004) { near = m; break; }
        }
        lookGoal = near
            ? near.group.position.clone().setY(1.3)
            : p.clone().add(tan.clone().multiplyScalar(2)).setY(1.4);
    } else {
        lookGoal = p.clone().add(tan.clone().multiplyScalar(2)).setY(1.4);
    }
    const camGoal = p.clone()
        .add(new THREE.Vector3(0, 3.3 + (camDist - 1) * 2.2 + Math.sin(time * 0.7) * 0.08, 15.5 * camDist));
    const k = 1 - Math.exp(-3 * dt);
    camera.position.lerp(camGoal, k);
    camTarget.lerp(lookGoal, k);
    camera.lookAt(camTarget);

    // 纸片景物面向相机；云缓慢漂移（飘到终点前就回到起点重飘，月亮周围保持无云）
    for (const b of billboards) {
        b.rotation.y = Math.atan2(camera.position.x - b.position.x, camera.position.z - b.position.z);
    }
    for (const c of clouds) {
        c.position.x += c.userData.speed * dt;
        if (c.position.x > END_POS.x - 30) c.position.x = -100 - Math.random() * 40;
    }

    // 氛围动画：雪花；发光球脉冲浮动（走过的站熄灭、不再浮动，圆点变淡）
    updateSnow(dt);
    for (const m of markers) {
        const trig = progress >= m.t;
        if (trig !== m.triggered) {
            m.triggered = trig;
            m.orbMat.opacity = trig ? 0.25 : 0.95;
            m.haloMat.opacity = trig ? 0.15 : 0.55;
            m.dot.classList.toggle('passed', trig);
            if (trig) {
                // 触发瞬间可能正处在脉冲中途，复位到静止姿态
                m.orb.scale.setScalar(1);
                m.orb.position.y = m.orbY;
                m.frame.position.y = 0;
            }
        }
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
    applyViewFit();
    renderer.setSize(window.innerWidth, window.innerHeight);
    layoutAnchors(); // 视口高度变了，锚点偏移也要重算
});
