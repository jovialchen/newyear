import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { EVENTS } from './events.js';

const ASSETS = './assets';
const NATURE_DIR = `${ASSETS}/nature-pack`;
const TREES_OBJ = `${ASSETS}/trees/stylized-low-poly-trees-pack-01.quads.obj`;
const PALETTE_TEX = `${ASSETS}/trees/textures/CT_Pallete.png`;
const FLOWERS_OBJ = `${ASSETS}/flowers/stylized-low-poly-flowers-pack-01.quads.obj`;
const VRM_URL = `${ASSETS}/hazel-pink.vrm`;
const WALK_SPEED = 2.4; // 米/秒

// ---------- 渲染器与场景 ----------
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const maxAniso = renderer.capabilities.getMaxAnisotropy();

const scene = new THREE.Scene();
const SKY_COLOR = new THREE.Color(0x9ed3f0);
scene.background = SKY_COLOR;
scene.fog = new THREE.Fog(SKY_COLOR, 45, 160);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 400);
camera.position.set(0, 3, 16);

scene.add(new THREE.HemisphereLight(0xffffff, 0x9ab884, 1.25));
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

// 树木染色（乘在模型原本颜色上）
const TREE_TINTS = {
    spring: [0xffffff, 0xffffff, 0xffd7e2, 0xffe4ec], // 偶尔出现"樱花树"
    summer: [0xffffff, 0xeeffdd],
    autumn: [0xffc98a, 0xffa07a, 0xffdf96],
    winter: [0xe8f0f6],
};

// 地面颜色：按月份渐变的关键帧 [月份, 颜色]
const GROUND_STOPS = [
    [1, 0xd8e4d4], [2.5, 0xe3eadf],
    [3.2, 0x93d06f], [5.5, 0x7fc465],
    [6.2, 0x6ab04f], [8.5, 0x53963f],
    [9.2, 0xbfb45e], [11.4, 0xb09a4a],
    [12, 0xd8e4d4],
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

// ---------- 小路（蜿蜒的样条曲线） ----------
const curvePoints = [new THREE.Vector3(0, 0, 10)];
const SEG_LEN = 20;
const SEGMENTS = Math.max(14, Math.round(EVENTS.length * 0.75));
for (let i = 0; i < SEGMENTS; i++) {
    curvePoints.push(new THREE.Vector3(
        Math.sin(i * 1.1) * 8 + Math.sin(i * 0.45) * 5,
        0,
        -12 - i * SEG_LEN,
    ));
}
const last = curvePoints[curvePoints.length - 1];
curvePoints.push(new THREE.Vector3(last.x * 0.3, 0, last.z - 24));
const curve = new THREE.CatmullRomCurve3(curvePoints, false, 'catmullrom', 0.5);
const curveLength = curve.getLength();
const END_POS = curve.getPointAt(1);

function sideVectorAt(t) {
    const tan = curve.getTangentAt(t);
    return new THREE.Vector3(-tan.z, 0, tan.x).normalize();
}
// 用 z 坐标反推大致的路进度（给地面顶点着色用）
function tAtZ(z) {
    return THREE.MathUtils.clamp((10 - z) / (10 - END_POS.z + 24), 0, 1);
}

// ---------- 地面（颜色随月份渐变） ----------
{
    const geo = new THREE.PlaneGeometry(500, 500, 48, 48);
    geo.rotateX(-Math.PI / 2);
    const colors = [];
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i) - 140;
        const month = monthAt(tAtZ(z));
        const base = groundColorAt(month);
        const n = Math.sin(x * 0.11) * Math.cos(z * 0.09) * 0.5 + 0.5;
        const shade = 0.9 + n * 0.15;
        colors.push(base.r * shade, base.g * shade, base.b * shade);
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const ground = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, map: makeGrassTexture() }));
    ground.position.z = -140;
    scene.add(ground);
}

// ---------- 程序化纹理 ----------
// 泥土纹理：浅色底 + 色斑 + 小石子
function makeDirtTexture() {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 36; i++) {
        ctx.fillStyle = `rgba(${170 + Math.random() * 40 | 0}, ${150 + Math.random() * 30 | 0}, ${110 + Math.random() * 25 | 0}, 0.18)`;
        ctx.beginPath();
        ctx.ellipse(Math.random() * 256, Math.random() * 256, 12 + Math.random() * 30, 8 + Math.random() * 20, Math.random() * 3, 0, 7);
        ctx.fill();
    }
    for (let i = 0; i < 320; i++) {
        const g = 120 + Math.random() * 110 | 0;
        ctx.fillStyle = `rgba(${g}, ${g - 15}, ${g - 40}, 0.55)`;
        ctx.beginPath();
        ctx.arc(Math.random() * 256, Math.random() * 256, 0.8 + Math.random() * 2.2, 0, 7);
        ctx.fill();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = maxAniso;
    return tex;
}

// 草地纹理：接近中性的明暗噪点，乘在顶点色上不干扰季节变色
function makeGrassTexture() {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#f4f4f4';
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 24; i++) {
        const g = 210 + Math.random() * 40 | 0;
        ctx.fillStyle = `rgba(${g}, ${g}, ${g}, 0.35)`;
        ctx.beginPath();
        ctx.ellipse(Math.random() * 256, Math.random() * 256, 20 + Math.random() * 45, 14 + Math.random() * 30, Math.random() * 3, 0, 7);
        ctx.fill();
    }
    for (let i = 0; i < 2600; i++) {
        const g = 130 + Math.random() * 120 | 0;
        ctx.fillStyle = `rgba(${g - 20}, ${g}, ${g - 30}, 0.3)`;
        ctx.fillRect(Math.random() * 256, Math.random() * 256, 1.5, 1.5 + Math.random() * 2);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(90, 90);
    tex.anisotropy = maxAniso;
    return tex;
}

// ---------- 路面（沿曲线的条带） ----------
function buildRibbon(width, y, color) {
    const segments = 700;
    const positions = [];
    const uvs = [];
    const indices = [];
    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const p = curve.getPointAt(t);
        const s = sideVectorAt(t).multiplyScalar(width / 2);
        positions.push(p.x - s.x, y, p.z - s.z, p.x + s.x, y, p.z + s.z);
        const v = (t * curveLength) / 3; // 每 3 米重复一次纹理
        uvs.push(0, v, 1, v);
        if (i < segments) {
            const a = i * 2;
            indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
        }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: 1, map: makeDirtTexture() }));
}
scene.add(buildRibbon(3.4, 0.015, 0xa8895e)); // 深色路缘
scene.add(buildRibbon(2.6, 0.03, 0xe6cfa0));  // 浅色路面

// ---------- 模板工具 ----------
// 把 OBJ 里的每个命名对象归零（中心移到原点、底部贴地），包一层 Group 当模板
function templatize(root, filter) {
    const templates = [];
    for (const child of root.children) {
        if (filter && !filter.test(child.name || '')) continue;
        const box = new THREE.Box3().setFromObject(child);
        const size = box.getSize(new THREE.Vector3());
        if (size.y < 0.01) continue;
        const center = box.getCenter(new THREE.Vector3());
        child.position.sub(new THREE.Vector3(center.x, box.min.y, center.z));
        const wrapper = new THREE.Group();
        wrapper.add(child);
        wrapper.userData.height = size.y;
        wrapper.userData.maxDim = Math.max(size.x, size.y, size.z);
        templates.push(wrapper);
    }
    return templates;
}

// 染色：克隆材质并按季节乘上颜色
function tintInstance(inst, colorHex) {
    inst.traverse((o) => {
        if (!o.isMesh) return;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        const cloned = mats.map((m) => {
            const c = m.clone();
            c.color.multiply(new THREE.Color(colorHex));
            return c;
        });
        o.material = Array.isArray(o.material) ? cloned : cloned[0];
    });
}

// 沿路散布。opts.seasons 限定出现的季节；opts.tintBySeason 给树染色
function scatter(templates, count, minDist, maxDist, targetHeight, opts = {}) {
    if (templates.length === 0) return;
    let placed = 0;
    let attempts = 0;
    while (placed < count && attempts < count * 20) {
        attempts++;
        const t = Math.random();
        const season = seasonAt(t);
        if (opts.seasons && !opts.seasons.includes(season)) continue;
        const p = curve.getPointAt(t);
        const side = sideVectorAt(t);
        const sign = Math.random() < 0.5 ? -1 : 1;
        const dist = minDist + Math.random() * (maxDist - minDist);
        const tpl = templates[Math.floor(Math.random() * templates.length)];
        const inst = tpl.clone(true);
        const h = targetHeight[0] + Math.random() * (targetHeight[1] - targetHeight[0]);
        // fit: 'max' 时按最大边归一化，避免扁平模型（睡莲、兰花）被拉成巨大薄片
        const dim = opts.fit === 'max' ? tpl.userData.maxDim : tpl.userData.height;
        inst.scale.setScalar(h / dim);
        inst.rotation.y = Math.random() * Math.PI * 2;
        inst.position.set(p.x + side.x * sign * dist, 0, p.z + side.z * sign * dist);
        if (opts.tintBySeason) {
            const tints = TREE_TINTS[season];
            const hex = tints[Math.floor(Math.random() * tints.length)];
            if (hex !== 0xffffff) tintInstance(inst, hex);
        }
        scene.add(inst);
        placed++;
    }
}

function proceduralTree() {
    const g = new THREE.Group();
    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.26, 1.4, 6),
        new THREE.MeshStandardMaterial({ color: 0x7a5230, roughness: 1 }),
    );
    trunk.position.y = 0.7;
    g.add(trunk);
    const greens = [0x5d8f4e, 0x6fa35a, 0x548244];
    for (let i = 0; i < 3; i++) {
        const cone = new THREE.Mesh(
            new THREE.ConeGeometry(1.5 - i * 0.4, 1.6, 7),
            new THREE.MeshStandardMaterial({ color: greens[i % 3], roughness: 1, flatShading: true }),
        );
        cone.position.y = 1.6 + i * 1.0;
        g.add(cone);
    }
    g.userData.height = 4.4;
    return g;
}

// ---------- 加载：低模自然包（树/石头/草/蘑菇/花） ----------
async function loadNaturePack(manager) {
    try {
        const mtl = await new MTLLoader(manager).loadAsync(`${NATURE_DIR}/NaturePack_AllModels.mtl`);
        mtl.preload();
        // 材质整体提亮、加饱和
        for (const mat of Object.values(mtl.materials)) {
            if (mat.color) mat.color.offsetHSL(0, 0.14, 0.09);
        }
        const objLoader = new OBJLoader(manager);
        objLoader.setMaterials(mtl);
        const pack = await objLoader.loadAsync(`${NATURE_DIR}/NaturePack_AllModels.obj`);
        const trees = templatize(pack, /^Tree/i);
        const rocks = templatize(pack, /^Rock/i);
        const grasses = templatize(pack, /^Grass|^Reeds/i);
        const decos = templatize(pack, /^Flower|^Mushroom/i);
        const hedges = templatize(pack, /^Hedge/i);
        if (trees.length === 0) throw new Error('no trees found');
        scatter(trees, 130, 3.6, 46, [4.5, 9], { tintBySeason: true });
        scatter(rocks, 40, 2.9, 22, [0.4, 1.3]);
        scatter(grasses, 170, 2.7, 15, [0.4, 0.9], { seasons: ['spring', 'summer', 'autumn'] });
        scatter(decos, 45, 2.8, 12, [0.25, 0.6], { seasons: ['summer', 'autumn'] });
        scatter(hedges, 50, 3, 14, [0.6, 1.6], { seasons: ['spring', 'summer', 'autumn'] });
    } catch (e) {
        console.warn('自然包加载失败，使用程序化树木代替：', e);
        scatter([proceduralTree()], 160, 3.6, 46, [4.5, 9], { tintBySeason: true });
    }
}

// ---------- 加载：风格化树木包（调色板贴图） ----------
async function loadStylizedTrees(manager) {
    const tex = await new THREE.TextureLoader(manager).loadAsync(PALETTE_TEX);
    tex.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.MeshStandardMaterial({ map: tex, roughness: 1 });
    material.color.setRGB(1.28, 1.28, 1.22); // 乘大于 1 的颜色，让贴图更明亮
    const pack = await new OBJLoader(manager).loadAsync(TREES_OBJ);
    pack.traverse((o) => {
        if (o.isMesh) o.material = material;
    });
    return templatize(pack, /^Tree/i);
}

// 花包没有自己的贴图，按高度涂色：下半截是茎（绿），上半截是花瓣（每模板随机亮色）
const PETAL_COLORS = [0xff8fb3, 0xffd166, 0xff6b6b, 0xc58fff, 0xff9f5a, 0xfff3f0];

function colorizeFlower(root, petalHex) {
    const petal = new THREE.Color(petalHex);
    const stem = new THREE.Color(0x5cb84d);
    root.traverse((o) => {
        if (!o.isMesh) return;
        let geo = o.geometry;
        if (geo.index) geo = o.geometry = geo.toNonIndexed();
        const pos = geo.attributes.position;
        geo.computeBoundingBox();
        const minY = geo.boundingBox.min.y;
        const rangeY = geo.boundingBox.max.y - minY;
        const colors = new Float32Array(pos.count * 3);
        for (let i = 0; i < pos.count; i += 3) {
            const cy = (pos.getY(i) + pos.getY(i + 1) + pos.getY(i + 2)) / 3;
            const h = rangeY > 0 ? (cy - minY) / rangeY : 1;
            const base = h < 0.45 ? stem : petal;
            const shade = 0.9 + Math.random() * 0.15;
            for (let j = 0; j < 3; j++) {
                colors[(i + j) * 3] = base.r * shade;
                colors[(i + j) * 3 + 1] = base.g * shade;
                colors[(i + j) * 3 + 2] = base.b * shade;
            }
        }
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        o.material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 });
    });
}

async function loadFlowers(manager) {
    const pack = await new OBJLoader(manager).loadAsync(FLOWERS_OBJ);
    const templates = templatize(pack, /^Flower/i);
    for (const tpl of templates) {
        colorizeFlower(tpl, PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)]);
    }
    return templates;
}

async function loadStylized(manager) {
    try {
        const trees = await loadStylizedTrees(manager);
        scatter(trees, 70, 4, 42, [5, 10], { tintBySeason: true });
    } catch (e) {
        console.warn('风格化树木包加载失败：', e);
    }
    try {
        const flowers = await loadFlowers(manager);
        scatter(flowers, 120, 2.7, 10, [0.35, 0.8], { seasons: ['spring', 'summer'], fit: 'max' });
    } catch (e) {
        console.warn('花包加载失败：', e);
    }
}

// ---------- 萤火虫 ----------
let fireflies;
{
    const count = 130;
    const positions = [];
    for (let i = 0; i < count; i++) {
        const t = Math.random();
        const p = curve.getPointAt(t);
        const side = sideVectorAt(t);
        const d = 3 + Math.random() * 20;
        const sign = Math.random() < 0.5 ? -1 : 1;
        positions.push(p.x + side.x * sign * d, 0.4 + Math.random() * 3, p.z + side.z * sign * d);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    fireflies = new THREE.Points(geo, new THREE.PointsMaterial({
        color: 0xffe9a3, size: 0.2, transparent: true, opacity: 0.8,
        depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    scene.add(fireflies);
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

// ---------- 事件节点（发光球 + 相框） ----------
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

const markers = [];
EVENTS.forEach((ev, i) => {
    const t = (i + 1) / (EVENTS.length + 1);
    const p = curve.getPointAt(t);
    const side = sideVectorAt(t).multiplyScalar(i % 2 === 0 ? 2.6 : -2.6);
    const pos = p.clone().add(side);

    const group = new THREE.Group();
    group.position.copy(pos);

    // 发光球：核心小球 + 光晕贴片
    const orbMat = new THREE.MeshBasicMaterial({
        color: 0xffd98a, transparent: true, opacity: 0.95,
        depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.26, 16, 12), orbMat);
    orb.position.y = 2.7;
    group.add(orb);
    const haloMat = new THREE.SpriteMaterial({
        map: glowTex, transparent: true, opacity: 0.85,
        depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const halo = new THREE.Sprite(haloMat);
    halo.scale.setScalar(2.2);
    halo.position.y = 2.7;
    group.add(halo);

    // 相框（背板 + 照片）
    const frame = new THREE.Group();
    frame.position.y = 1.9;
    const back = new THREE.Mesh(
        new THREE.PlaneGeometry(1.9, 1.48),
        new THREE.MeshStandardMaterial({ color: 0x5a4232, roughness: 0.9 }),
    );
    back.position.z = -0.015;
    frame.add(back);
    const photoMat = new THREE.MeshBasicMaterial({ map: placeholderTexture(i) });
    const photo = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.28), photoMat);
    frame.add(photo);
    frame.lookAt(p.x, 1.9, p.z);
    group.add(frame);

    // 有真实照片时替换贴图
    if (ev.photo) {
        new THREE.TextureLoader().load(ev.photo, (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            photoMat.map = tex;
            photoMat.needsUpdate = true;
        });
    }

    scene.add(group);
    markers.push({ t, event: ev, group, orb, orbMat, haloMat, frame, triggered: false, index: i });
});

// ---------- 终点门 ----------
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
    const sign = new THREE.Mesh(
        new THREE.PlaneGeometry(10, 2.5),
        new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }),
    );
    const endTan = curve.getTangentAt(1);
    sign.position.set(END_POS.x, 3.6, END_POS.z);
    sign.rotation.y = Math.atan2(endTan.x, endTan.z) + Math.PI;
    scene.add(sign);
}

// ---------- 烟花 ----------
const fireworks = [];
let fireworkTimer = 0;
function spawnBurst() {
    const count = 90;
    const positions = new Float32Array(count * 3);
    const velocities = [];
    const center = new THREE.Vector3(
        END_POS.x + (Math.random() - 0.5) * 18,
        6 + Math.random() * 7,
        END_POS.z + (Math.random() - 0.5) * 14,
    );
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

// ---------- 状态机与 UI ----------
let state = 'loading'; // loading → ready → walking ⇄ paused → finished
let progress = 0;

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
    ui.cardTitle.textContent = ev.title || '';
    ui.cardDesc.textContent = ev.description || '';
    ui.cardCounter.textContent = `第 ${marker.index + 1} 站 · 共 ${markers.length} 站`;
    ui.eventCard.classList.remove('hidden');
}

function finish() {
    state = 'finished';
    setTimeout(() => ui.endScreen.classList.remove('hidden'), 1600);
}

// ---------- 加载 ----------
const manager = new THREE.LoadingManager();
manager.onProgress = (url, loaded, total) => {
    ui.loadingText.textContent = `正在走进森林… ${Math.round((loaded / total) * 100)}%`;
};

Promise.all([
    loadNaturePack(manager),
    loadStylized(manager),
    loadCharacter(manager),
]).then(() => {
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
    character.rotation.y = Math.atan2(tan.x, tan.z);
    animateCharacter(dt, walking, time);
    if (vrm) vrm.update(dt);

    // 相机跟随（停顿时转向相框）
    let lookGoal;
    if (state === 'paused') {
        const m = markers.find((mk) => mk.triggered && mk.t === progress);
        lookGoal = m ? m.group.position.clone().setY(1.9) : p.clone().add(tan.clone().multiplyScalar(3)).setY(1.3);
    } else {
        lookGoal = p.clone().add(tan.clone().multiplyScalar(3)).setY(1.3);
    }
    const camGoal = p.clone()
        .add(tan.clone().multiplyScalar(-4.4))
        .add(new THREE.Vector3(0, 2.4 + Math.sin(time * 0.7) * 0.08, 0));
    const k = 1 - Math.exp(-3 * dt);
    camera.position.lerp(camGoal, k);
    camTarget.lerp(lookGoal, k);
    camera.lookAt(camTarget);

    // 氛围动画
    fireflies.material.opacity = 0.45 + 0.4 * Math.sin(time * 2);
    for (const m of markers) {
        if (!m.triggered) {
            const pulse = 1 + 0.18 * Math.sin(time * 2.5 + m.index);
            m.orb.scale.setScalar(pulse);
            m.haloMat.opacity = 0.6 + 0.3 * Math.sin(time * 2.5 + m.index);
            m.orb.position.y = 2.7 + Math.sin(time * 1.6 + m.index * 1.3) * 0.12;
            m.frame.position.y = 1.9 + Math.sin(time * 1.6 + m.index * 1.3) * 0.08;
        }
    }

    if (state === 'finished') {
        fireworkTimer -= dt;
        if (fireworkTimer <= 0) {
            spawnBurst();
            fireworkTimer = 1.0 + Math.random() * 0.5;
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
