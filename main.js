import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { categories } from './stories.js';
import { openReader, isReaderOpen } from './reader.js';

// ---------- 可调常量 ----------
const ROOM_SIZE = 10;          // 房间模型归一化后的最长边
const BOOKCASE_HEIGHT = 1.3;   // 书架归一化后的高度（和其他家具比例协调）

// 书架材质名 -> 卡通配色（源模型缺 mtl，按名字上色）
const BOOKCASE_COLORS = [
    [/kuning_gelap/i, 0xcf9535],
    [/kuning/i, 0xf4c542],
    [/merah/i, 0xd94a3a],
    [/besi/i, 0x7a828e],
    [/material/i, 0x9c6b3f],
    [/wood|kayu/i, 0x9c6b3f],
];
const BOOKCASE_DEFAULT_COLOR = 0xb98a55;

// 窗玻璃网格名 -> 涂成晴空蓝（源模型导出时丢了窗外蓝天）
const WINDOW_GLASS_MESHES = ['meshblinn12SG'];  // 玻璃 -> 晴空蓝
const WINDOW_SHEER_MESHES = ['meshlambert19SG']; // 窗框+白纱 -> 半透明白
const SKY_COLOR = 0x1e90d8;
const SHEER_OPACITY = 0.7;

// ---------- 渲染基础 ----------
const container = document.getElementById('scene-container');
// preserveDrawingBuffer 仅供 ?debug 时截图调试读取像素
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: location.search.includes('debug') });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xfdf3d8);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);

// 视角固定：相机在开放面（-x，没有的那面墙）的正中央，视线垂直墙面正对房间。
// 窄屏（手机竖屏）拉宽视野并抬高拉远相机
const CAMERA_TARGET = new THREE.Vector3(0.5, 1.5, 0);

function fitCameraToViewport() {
    const aspect = window.innerWidth / window.innerHeight;
    camera.fov = aspect < 0.8 ? 92 : aspect < 1.2 ? 62 : 52;
    camera.aspect = aspect;
    if (aspect < 0.8) {
        camera.position.set(-7.6, 2.3, 0);
        camera.lookAt(0.3, 1.0, 0); // 压低头，少看天花板、补上地面缺口
    } else {
        camera.position.set(-6.0, 2.1, 0);
        camera.lookAt(CAMERA_TARGET);
    }
    camera.updateProjectionMatrix();
}
fitCameraToViewport();

scene.add(new THREE.HemisphereLight(0xfff6e0, 0x9a7a55, 1.1));
const sun = new THREE.DirectionalLight(0xffe8c0, 1.6);
sun.position.set(4, 6, 3);
scene.add(sun);
scene.add(new THREE.AmbientLight(0xffffff, 0.35));

// ---------- 加载 ----------
const manager = new THREE.LoadingManager();
const progressEl = document.getElementById('loading-progress');
manager.onProgress = (_url, loaded, total) => {
    progressEl.style.width = `${Math.round((loaded / total) * 100)}%`;
};

const loader = new GLTFLoader(manager);
loader.setMeshoptDecoder(MeshoptDecoder);

function loadGlb(url) {
    return new Promise((resolve, reject) => loader.load(url, resolve, undefined, reject));
}

// ---------- 工具 ----------
function bboxOf(object) {
    return new THREE.Box3().setFromObject(object);
}

// 缩放 object 使其包围盒达到 target（axis='y' 时按高度，否则按最长边），
// 返回缩放后、未旋转平移前的包围盒
function normalize(object, target, axis) {
    const box = bboxOf(object);
    const size = box.getSize(new THREE.Vector3());
    const current = axis === 'y' ? size.y : Math.max(size.x, size.y, size.z);
    object.scale.multiplyScalar(target / current);
    return bboxOf(object);
}

function recolorBookcase(root) {
    root.traverse((node) => {
        if (!node.isMesh) return;
        const materials = Array.isArray(node.material) ? node.material : [node.material];
        const recolored = materials.map((mat) => {
            const hit = BOOKCASE_COLORS.find(([pattern]) => pattern.test(mat.name || ''));
            const color = hit ? hit[1] : BOOKCASE_DEFAULT_COLOR;
            return new THREE.MeshStandardMaterial({ color, roughness: 0.75, metalness: 0.05 });
        });
        node.material = Array.isArray(node.material) ? recolored : recolored[0];
    });
}

// ---------- 可点击的书 ----------
// 用书架模型里已有的书：每个书架最大体积的网格是书架框，其余网格都是书。
// 每个网格（同色书簇）依次映射到该书架的类别。
const clickableMeshes = [];

function collectBookMeshes(bookcase) {
    const meshes = [];
    bookcase.traverse((node) => { if (node.isMesh) meshes.push(node); });
    const volume = (mesh) => {
        const s = bboxOf(mesh).getSize(new THREE.Vector3());
        return s.x * s.y * s.z;
    };
    meshes.sort((a, b) => volume(b) - volume(a));
    return meshes.slice(1); // 第一个是书架框
}

// categories 按 shelf 分到两个书架，依次绑到书网格上；书比类别多就循环
function assignBooks(bookcase, shelfCategories) {
    const books = collectBookMeshes(bookcase);
    books.forEach((mesh, i) => {
        if (!shelfCategories.length) return;
        mesh.userData.category = shelfCategories[i % shelfCategories.length];
        clickableMeshes.push(mesh);
    });
}

// ---------- 交互 ----------
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const tooltip = document.getElementById('book-tooltip');
let hoveredMesh = null;
let downPosition = null;

function setHovered(mesh, event) {
    if (hoveredMesh !== mesh) {
        if (hoveredMesh) hoveredMesh.material.emissive.setHex(0x000000);
        hoveredMesh = mesh;
        if (mesh) {
            mesh.material.emissive.setHex(0x664422); // 暖色发光高亮
            tooltip.textContent = mesh.userData.category.title;
            tooltip.classList.remove('hidden');
            renderer.domElement.style.cursor = 'pointer';
        } else {
            tooltip.classList.add('hidden');
            renderer.domElement.style.cursor = '';
        }
    }
    if (mesh && event) {
        tooltip.style.left = `${event.clientX}px`;
        tooltip.style.top = `${event.clientY}px`;
    }
}

function pickBook(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(clickableMeshes, false);
    return hits.length ? hits[0].object : null;
}

renderer.domElement.addEventListener('pointermove', (event) => {
    if (isReaderOpen()) return;
    setHovered(pickBook(event), event);
});

renderer.domElement.addEventListener('pointerdown', (event) => {
    downPosition = [event.clientX, event.clientY];
});

renderer.domElement.addEventListener('pointerup', (event) => {
    if (!downPosition || isReaderOpen()) return;
    const [dx, dy] = [event.clientX - downPosition[0], event.clientY - downPosition[1]];
    downPosition = null;
    if (dx * dx + dy * dy > 25) return; // 拖拽视角不算点击
    const mesh = pickBook(event);
    if (mesh) openReader(mesh.userData.category);
});

// ---------- 主流程 ----------
async function init() {
    const [roomGltf, bookcaseAGltf, bookcaseBGltf] = await Promise.all([
        loadGlb('assets/room.glb'),
        loadGlb('assets/bookcase_a.glb'),
        loadGlb('assets/bookcase_b.glb'),
    ]);

    // 房间：双面渲染（避免从某些角度看墙面背面一片黑）、归一化到 ROOM_SIZE、中心移到原点、地面贴 y=0
    roomGltf.scene.traverse((node) => {
        if (!node.isMesh) return;
        const materials = Array.isArray(node.material) ? node.material : [node.material];
        for (const mat of materials) {
            mat.side = THREE.DoubleSide;
            if ('metalness' in mat) mat.metalness = 0;
            // 源 MTL 里贴图材质的 Kd 是黑色（Maya 里贴图会覆盖 Kd），
            // 转到 glTF 后变成 颜色×贴图=黑，这里把带贴图的材质颜色重置为白
            if (mat.map) mat.color.set(0xffffff);
        }
    });
    const room = roomGltf.scene;
    const roomBox0 = normalize(room, ROOM_SIZE);
    const roomCenter = roomBox0.getCenter(new THREE.Vector3());
    room.position.sub(new THREE.Vector3(roomCenter.x, roomBox0.min.y, roomCenter.z));
    scene.add(room);
    const roomBox = bboxOf(room);

    // 地板延伸：拆掉的那面墙到相机之间补一块地板，避免画面底部露出背景色。
    // 用 canvas 画上和房间地板相近的板缝纹理，让接缝不明显
    const floorTex = (() => {
        const cv = document.createElement('canvas');
        cv.width = 256; cv.height = 256;
        const ctx = cv.getContext('2d');
        ctx.fillStyle = '#eccd85';
        ctx.fillRect(0, 0, 256, 256);
        ctx.strokeStyle = '#c9a35f';
        ctx.lineWidth = 3;
        for (let i = 0; i <= 256; i += 32) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(256, i);
            ctx.stroke();
        }
        const tex = new THREE.CanvasTexture(cv);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(3, 4);
        tex.colorSpace = THREE.SRGBColorSpace;
        return tex;
    })();
    const floorExt = new THREE.Mesh(
        new THREE.PlaneGeometry(10, 12),
        new THREE.MeshStandardMaterial({ map: floorTex, roughness: 1, metalness: 0 }),
    );
    floorExt.rotation.x = -Math.PI / 2;
    floorExt.position.set(roomBox.min.x - 5 + 0.05, 0.34, 0);
    scene.add(floorExt);

    // 窗户涂成晴空蓝（源模型导出时丢了窗外蓝天）：
    // blinn12SG 是玻璃，涂成无光照晴空蓝；lambert19SG 是窗框+白纱层，纱层变半透明让蓝天透出来
    room.traverse((node) => {
        if (!node.isMesh) return;
        if (WINDOW_GLASS_MESHES.includes(node.name)) {
            node.material = new THREE.MeshBasicMaterial({ color: SKY_COLOR, side: THREE.DoubleSide });
        } else if (WINDOW_SHEER_MESHES.includes(node.name)) {
            node.material = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: SHEER_OPACITY,
                roughness: 0.9,
                metalness: 0,
                side: THREE.DoubleSide,
            });
        }
    });

    // 门：贴图里深色门板重绘成浅色木纹（tools/repaint_door.py）

    // 书架：归一化高度、上色，摆到前景（开放面一侧）左右两翼，面向相机
    const bookcaseA = bookcaseAGltf.scene;
    const bookcaseB = bookcaseBGltf.scene;
    recolorBookcase(bookcaseA);
    recolorBookcase(bookcaseB);
    const localBoxA = normalize(bookcaseA, BOOKCASE_HEIGHT, 'y');
    const localBoxB = normalize(bookcaseB, BOOKCASE_HEIGHT, 'y');

    const SINK = 0.08; // 归一化后包围盒底部略低于支脚，往下沉一点贴住地板
    bookcaseA.rotation.y = Math.PI / 2 - 0.25;  // 面向相机，微微转向房间中央
    bookcaseB.rotation.y = Math.PI / 2 + 0.25;
    bookcaseA.position.set(-2.6, -localBoxA.min.y - SINK, 2.3);
    bookcaseB.position.set(-2.6, -localBoxB.min.y - SINK, -2.3);
    scene.add(bookcaseA, bookcaseB);

    // 书架上已有的书变成可交互：每簇书绑一个类别
    const perShelf = [0, 1].map((i) => categories.filter((c) => (c.shelf ?? 0) === i));
    assignBooks(bookcaseA, perShelf[0]);
    assignBooks(bookcaseB, perShelf[1]);

    document.getElementById('loading').classList.add('done');

    // 调试钩子：截图/调机位用
    window.__app = { scene, camera, room, bookcaseA, bookcaseB, clickableMeshes, THREE };
}

init().catch((error) => {
    console.error(error);
    document.querySelector('.loading-tip').textContent = '加载失败，请刷新重试';
});

// ---------- 渲染循环 ----------
window.addEventListener('resize', () => {
    fitCameraToViewport();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
});
