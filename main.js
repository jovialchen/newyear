import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { categories } from './stories.js';
import { openReader, isReaderOpen } from './reader.js';

// ---------- 可调常量 ----------
const ROOM_SIZE = 10;          // 房间模型归一化后的最长边
const BOOKCASE_HEIGHT = 2.6;   // 书架归一化后的高度
const BOOK_HEIGHT = 0.6;       // 书的世界高度

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
    camera.fov = aspect < 0.8 ? 80 : aspect < 1.2 ? 62 : 52;
    camera.aspect = aspect;
    if (aspect < 0.8) {
        camera.position.set(-7.2, 2.2, 0);
        camera.lookAt(0.5, 1.0, 0); // 压低头，少看天花板、补上地面缺口
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
const clickableBooks = [];

// localHeight: 在书架局部坐标里的书高（书架缩放会把它放大到 BOOK_HEIGHT）
function makeBook(category, localHeight) {
    const group = new THREE.Group();
    const color = new THREE.Color(category.color);

    const coverMat = new THREE.MeshStandardMaterial({
        color, roughness: 0.5, metalness: 0.05,
        emissive: color, emissiveIntensity: 0,
    });
    const paperMat = new THREE.MeshStandardMaterial({ color: 0xfffaf0, roughness: 0.9 });

    const h = localHeight;
    const w = h * 0.27; // 书脊宽
    const d = h * 0.72; // 书厚
    const cover = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), coverMat);
    const pages = new THREE.Mesh(new THREE.BoxGeometry(w * 0.86, h * 0.94, d * 0.9), paperMat);
    pages.position.x = w * 0.08;
    group.add(cover, pages);

    group.userData.category = category;
    group.userData.coverMat = coverMat;
    group.traverse((node) => { node.userData.bookRoot = group; });
    clickableBooks.push(group);
    return group;
}

// 把一个类别的书摆上书架（bookcase 已定位完毕）
// 两个书架造型不同，摆放方式分开配置：
const SHELF_LAYOUT = [
    { layFlat: false, x: [0.28, 0.52], y: 0.16, z: 0.80 }, // A：斜书堆造型，书立在底座平台前沿
    { layFlat: false, x: [0.25, 0.85], y: 0.42, z: 0.88 }, // B：立式书架，书竖立在隔层里
];

function placeBook(category, bookcase, localBox, layout, indexOnShelf, totalOnShelf) {
    const scale = bookcase.scale.x;
    const book = makeBook(category, BOOK_HEIGHT / scale);
    const size = localBox.getSize(new THREE.Vector3());

    const t = totalOnShelf === 1 ? 0.5 : indexOnShelf / (totalOnShelf - 1);
    const x = localBox.min.x + size.x * (layout.x[0] + (layout.x[1] - layout.x[0]) * t);
    const z = localBox.min.z + size.z * layout.z;

    if (layout.layFlat) {
        book.rotation.x = -Math.PI / 2; // 躺倒，封面朝上
        book.position.set(x, localBox.min.y + size.y * layout.y, z);
    } else {
        book.rotation.y = (Math.random() - 0.5) * 0.12;
        book.position.set(x, localBox.min.y + size.y * layout.y + BOOK_HEIGHT / scale / 2, z);
    }
    bookcase.add(book);
}

// ---------- 交互 ----------
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const tooltip = document.getElementById('book-tooltip');
let hoveredBook = null;
let downPosition = null;

function setHovered(book, event) {
    if (hoveredBook !== book) {
        if (hoveredBook) {
            hoveredBook.userData.coverMat.emissiveIntensity = 0;
            hoveredBook.scale.setScalar(1);
        }
        hoveredBook = book;
        if (book) {
            book.userData.coverMat.emissiveIntensity = 0.45;
            book.scale.setScalar(1.12);
            tooltip.textContent = book.userData.category.title;
            tooltip.classList.remove('hidden');
            renderer.domElement.style.cursor = 'pointer';
        } else {
            tooltip.classList.add('hidden');
            renderer.domElement.style.cursor = '';
        }
    }
    if (book && event) {
        tooltip.style.left = `${event.clientX}px`;
        tooltip.style.top = `${event.clientY}px`;
    }
}

function pickBook(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(clickableBooks, true);
    return hits.length ? hits[0].object.userData.bookRoot : null;
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
    const book = pickBook(event);
    if (book) openReader(book.userData.category);
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

    // 地板延伸：拆掉的那面墙到相机之间补一块同色地板，避免画面底部露出背景色
    const floorExt = new THREE.Mesh(
        new THREE.PlaneGeometry(10, 12),
        new THREE.MeshStandardMaterial({ color: 0xeccd85, roughness: 1, metalness: 0 }),
    );
    floorExt.rotation.x = -Math.PI / 2;
    floorExt.position.set(roomBox.min.x - 5 + 0.05, 0.005, 0);
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

    // 门已改窗：落地玻璃门自带白色格框。贴图里深色门板填成玻璃蓝（tools/door_to_window.py），
    // 再在每个窗格内垫一片无光照蓝玻璃（藏在格框后面 2mm），亮度和其他窗户一致
    const PANE_COLS = [-3.01, -2.10];                    // 两列窗格中心 x（屏幕反投影实测）
    const PANE_ROWS = [0.63, 1.355, 2.135, 2.945];       // 四行窗格中心 y
    const paneGlassMat = new THREE.MeshBasicMaterial({ color: SKY_COLOR });
    for (const colX of PANE_COLS) {
        for (const rowY of PANE_ROWS) {
            const pane = new THREE.Mesh(new THREE.PlaneGeometry(0.74, 0.51), paneGlassMat);
            pane.position.set(colX, rowY, -3.431);
            scene.add(pane);
        }
    }

    // 书架：归一化高度、上色，靠在沙发墙（-z）两侧、面向房间中央（+z）
    const bookcaseA = bookcaseAGltf.scene;
    const bookcaseB = bookcaseBGltf.scene;
    recolorBookcase(bookcaseA);
    recolorBookcase(bookcaseB);
    const localBoxA = normalize(bookcaseA, BOOKCASE_HEIGHT, 'y');
    const localBoxB = normalize(bookcaseB, BOOKCASE_HEIGHT, 'y');
    const depthA = localBoxA.max.z - localBoxA.min.z;
    const depthB = localBoxB.max.z - localBoxB.min.z;

    const wallZ = roomBox.min.z;
    const SINK = 0.14; // 源模型包围盒底部低于支脚，往下沉一点贴住地板
    bookcaseA.rotation.y = -Math.PI / 2;  // +x 墙（窗墙靠门侧的空白段），面向房间中央
    bookcaseB.rotation.y = -0.18;         // 沙发墙右侧，微微转向房间中央
    bookcaseA.position.set(roomBox.max.x - depthA / 2 - 0.1, -localBoxA.min.y - SINK, -2.0);
    bookcaseB.position.set(3.1, -localBoxB.min.y - SINK, wallZ + depthB / 2 + 0.1);
    scene.add(bookcaseA, bookcaseB);

    // 把每个类别的书摆上对应书架
    const shelves = [
        { bookcase: bookcaseA, localBox: localBoxA },
        { bookcase: bookcaseB, localBox: localBoxB },
    ];
    const perShelf = [0, 1].map((i) => categories.filter((c) => (c.shelf ?? 0) === i));
    perShelf.forEach((shelfCategories, shelfIndex) => {
        const { bookcase, localBox } = shelves[shelfIndex];
        shelfCategories.forEach((category, i) => {
            placeBook(category, bookcase, localBox, SHELF_LAYOUT[shelfIndex], i, shelfCategories.length);
        });
    });

    document.getElementById('loading').classList.add('done');

    // 调试钩子：截图/调机位用
    window.__app = { scene, camera, room, bookcaseA, bookcaseB, clickableBooks, THREE };
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
