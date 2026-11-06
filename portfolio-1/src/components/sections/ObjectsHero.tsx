import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import {
  DESK_EDGE, DESK_TOP, DESK_TOP_NEAR, DESK_EDGE_SHADE, SIDE_WALL, WALL_FILL, DESK_CAM, DESK_LOOK_Y, LAND_DIST,
  SLOTS_DESKTOP, SLOTS_MOBILE, type DeskSlot,
} from './deskScene';

/**
 * Home hero, rebuilt from agentcard.com's main section (same scene and motion, Harbor's content and colours).
 * Background: the site's cobalt, brightest in the middle and falling off to near-black at the edges (vignette).
 * Headline: big white 3D letters (74% of the screen width) with a deep cobalt extrusion.
 * The header (harbor, page links, Let's talk) is the fixed site header in HomeDock, drawn over this hero.
 *
 * INTRO (after Jitter's "Morph: Shape To Text", Harbor's reference clip), played on this same 3D headline so
 * the last frame of the intro is exactly the hero (same letters, font, size, place). About 2.4s:
 *  1. Light in, once: the navy/purple field and the flat pale headline fade up; a big "harbor" wordmark sits above.
 *  2. Snap: a single ring of light closes in on the headline, accelerating, and "clicks" at the centre.
 *  3. On the snap the field drops to black and the extrusion punches out long (pink at the letters, periwinkle at
 *     the back), the type tips back so it runs down toward a vanishing point; the wordmark flies to the header.
 *  4. Hand-off: depth, tilt and colours ease back to the hero's own values while the cobalt background fades in,
 *     the rest of the header fades in, the objects pop in and the mouse swing fades back.
 *     Click / key / wheel skips to the hand-off. prefers-reduced-motion: no intro.
 *
 * Objects: photoreal cut-outs of a UX designer's kit, generated on a green screen and keyed out in the browser,
 * saturated and then dimmed (blue multiply + navy fog) like agentcard's objects.
 *
 * Scroll — "the desk", laid out like Harbor's ClassPass reference (gift-card hero): same frame, same copy spot
 * and amount (a two-line headline + one button, top-left), same desk shape (back edge from the left side up to a
 * corner near the right, darker side wall past it), props spread centre-right. Tuning lives in ./deskScene.ts.
 *  1. The headline falls back into the scene and disappears.
 *  2. The background flattens into the plain blue wall and the desk slides up into place.
 *  3. Seven of the floating objects drop onto the desk, one after another, where the reference has its props,
 *     and settle with soft shadows in full colour; the rest drift out of frame.
 *  4. The copy fades in (PLACEHOLDER copy for now). Then the page moves on.
 *
 *  - Mouse move: the camera swings around the headline. Drag: rotates the whole world.
 */

/** Kept for Work.tsx (the old Experience coin section, no longer on the home page). */
export const HERO_OVERLAP_VH = 80;
/** Scroll length (vh) the pinned hero uses for its story. */
const STORY_VH = 230;

const BG_FILL = 'radial-gradient(ellipse 75% 70% at 50% 48%, #3653F0 0%, #2238D0 38%, #152391 66%, #0A1050 86%, #050826 100%)';
const FG = '#FFFFFF';
const FONT_URL = 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/fonts/helvetiker_bold.typeface.json';
const TEXT_FIT = 0.74;
const TEXT_FIT_MOBILE = 0.92;
const TEXT_DEPTH = 0.95;
const TEXT_FRONT = TEXT_DEPTH / 2 + 0.05; // local z of the letter faces (half depth + bevel)
const SIDE_COLOR = '#1A2BA6';
const SPREAD = 0.44;
const GRID = { desktop: { cols: 8, rows: 5, clearX: 0.85, clearY: 0.36 }, mobile: { cols: 3, rows: 7, clearX: 2, clearY: 0.45 } };
const SURROUND = { desktop: 31, mobile: 15 };
const SHELL = { x: 13.5, y: 8.5, z: 12 };
const DESK_CAM_V = new THREE.Vector3(DESK_CAM.x, DESK_CAM.y, DESK_CAM.z);

// intro
const INTRO_BG = 'radial-gradient(ellipse 70% 75% at 50% 50%, #05061A 0%, #0B1258 42%, #2A1B78 72%, #4A2390 88%, #1A0B33 100%)';
const INTRO_FACE = '#F1EEFF';
const EXT_NEAR = '#FF5FBF'; // pink at the letters
const EXT_FAR = '#6F7CFF'; // periwinkle at the back
const INTRO_DEEP = 9; // extrusion length at its longest, in multiples of the hero depth
const INTRO_TILT = 0.3; // radians the type tips back while extruded
const I_LIGHT = 0.35; // light comes in, once
const I_RING_START = 0.25; // the single ring starts closing in
const I_START_GROW = 0.75; // snap: the ring reaches the centre and the extrusion punches out
const I_BLACK = 0.25;
const I_GROW = 0.6;
const I_HOLD = 0.25;
const I_HAND = 0.8;
const I_START_HAND = I_START_GROW + I_GROW + I_HOLD;
const I_END = I_START_HAND + I_HAND;
// the "harbor" wordmark above the headline: size at the start (x the header's 26px) and gap to the headline
const LOGO_SCALE = 2.4;
const LOGO_SCALE_MOBILE = 1.7;
const LOGO_GAP = 26;

const SATURATION = 1.55;
const CONTRAST = 1.12;
const DIM_TINT = '#B9BEEA';
const FOG = { color: '#0B1258', near: 22, far: 46 };
const SIZE_BOOST = 1.0;

const CDN = 'https://cdn.magicpatterns.com/patterns/generated-images/';
const ASSETS = {
  laptop: { url: `${CDN}a2d4e410-5b56-4a38-96f3-1ba61bc00c23.jpg`, size: 2.0 },
  stickyYellow: { url: `${CDN}8ca457f9-75b9-45f0-8bbe-541e02ef4485.jpg`, size: 1.25 },
  phone: { url: `${CDN}b7474bd0-8ee1-452c-ba1d-ff822645cdcf.jpg`, size: 1.4 },
  pen: { url: `${CDN}de5da569-b6f6-4033-be70-aee2a37fea52.jpg`, size: 1.35 },
  clipboard: { url: `${CDN}393e0b37-9a88-49f5-85cd-3e2d8cfc8158.jpg`, size: 1.6 },
  mouse: { url: `${CDN}183482be-06ae-40e0-9d86-81d8930df3f3.jpg`, size: 1.0 },
  sketchbook: { url: `${CDN}8c6dfa4c-6910-444e-8bb8-36261c0628a1.jpg`, size: 1.6 },
  tablet: { url: `${CDN}35ea7724-8d31-427b-a158-9dd388552596.jpg`, size: 1.8 },
  highlighter: { url: `${CDN}dfb749c7-c44e-4a4a-bd61-e5d27cd20dce.jpg`, size: 1.15 },
  cards: { url: `${CDN}052f754e-df24-4190-8afa-899d7fd8931e.jpg`, size: 1.45 },
  headphones: { url: `${CDN}af6d59a6-a5d1-4a5d-90d1-f83c6b22b233.jpg`, size: 1.5 },
  mug: { url: `${CDN}5a5dcd76-f344-4d11-954d-e34a0b905d5d.jpg`, size: 1.2 },
  marker: { url: `${CDN}b6231f46-3b45-46e7-859b-c73ef7d98a87.jpg`, size: 1.3 },
  stickyPink: { url: `${CDN}f888f762-6978-4aad-aef7-4d563db4c4cf.jpg`, size: 1.25 },
  stickyBlue: { url: `${CDN}a82214a4-de69-43a0-a923-594eb040190e.jpg`, size: 1.25 },
} as const;
type Kind = keyof typeof ASSETS;
const TYPES: Kind[] = [
  'laptop', 'stickyYellow', 'phone', 'pen', 'clipboard', 'mouse', 'stickyPink', 'sketchbook', 'tablet',
  'highlighter', 'cards', 'headphones', 'stickyBlue', 'mug', 'marker', 'phone', 'stickyYellow', 'mouse',
];

const FACE_VERT = 'varying vec3 n; void main(){ n = normalize(normalMatrix*normal); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }';
const FACE_FRAG = `uniform vec3 sky; uniform vec3 base; uniform vec3 paper; uniform vec3 hi; uniform vec3 flatCol; uniform float flatMix; varying vec3 n;
void main(){
  vec3 N = normalize(n);
  float light = dot(N, normalize(vec3(-.5,.8,1.)))*.5+.5;
  vec3 c = mix(base, sky, smoothstep(.12,.7,light));
  c = mix(c, hi, smoothstep(.6,.9,light)*.9);
  c = mix(c, paper, pow(max(0., dot(N, normalize(vec3(-.6,.9,.9)))), 6.)*.4);
  c *= .84+.16*light;
  c = mix(c, flatCol, flatMix);
  gl_FragColor = vec4(c,1.);
  #include <colorspace_fragment>
}`;

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const clamp01 = (v: number) => clamp(v, 0, 1);
const c255 = (v: number) => (v < 0 ? 0 : v > 255 ? 255 : v);
const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const outCubic = (t: number) => 1 - (1 - t) ** 3;
const inOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const backOut = (t: number, s = 1.6) => (t <= 0 ? 0 : t >= 1 ? 1 : 1 + (s + 1) * (t - 1) ** 3 + s * (t - 1) ** 2);

function loadCutout(url: string): Promise<{ canvas: HTMLCanvasElement; aspect: number } | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const W = img.naturalWidth;
        const H = img.naturalHeight;
        const src = document.createElement('canvas');
        src.width = W;
        src.height = H;
        const sx = src.getContext('2d', { willReadFrequently: true })!;
        sx.drawImage(img, 0, 0);
        const im = sx.getImageData(0, 0, W, H);
        const d = im.data;
        let minX = W;
        let minY = H;
        let maxX = 0;
        let maxY = 0;
        for (let y = 0; y < H; y++) {
          for (let x = 0; x < W; x++) {
            const i = (y * W + x) * 4;
            let r = d[i];
            let g = d[i + 1];
            let b = d[i + 2];
            const m = Math.max(r, b);
            const green = g - m;
            const a = green <= 26 ? 1 : green >= 96 ? 0 : 1 - (green - 26) / 70;
            if (green > 8) g = m + 8;
            const lum = 0.3 * r + 0.59 * g + 0.11 * b;
            r = lum + (r - lum) * SATURATION;
            g = lum + (g - lum) * SATURATION;
            b = lum + (b - lum) * SATURATION;
            d[i] = c255((r - 128) * CONTRAST + 128);
            d[i + 1] = c255((g - 128) * CONTRAST + 128);
            d[i + 2] = c255((b - 128) * CONTRAST + 128);
            d[i + 3] = a * 255;
            if (a > 0.2) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }
        sx.putImageData(im, 0, 0);
        if (maxX <= minX || maxY <= minY) return resolve(null);
        const pad = 6;
        minX = Math.max(0, minX - pad);
        minY = Math.max(0, minY - pad);
        maxX = Math.min(W - 1, maxX + pad);
        maxY = Math.min(H - 1, maxY + pad);
        const cw = maxX - minX + 1;
        const ch = maxY - minY + 1;
        const k = Math.min(1, 640 / Math.max(cw, ch));
        const out = document.createElement('canvas');
        out.width = Math.round(cw * k);
        out.height = Math.round(ch * k);
        out.getContext('2d')!.drawImage(src, minX, minY, cw, ch, 0, 0, out.width, out.height);
        resolve({ canvas: out, aspect: cw / ch });
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export function ObjectsHero() {
  const outerRef = useRef<HTMLElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const wallRef = useRef<HTMLDivElement>(null);
  const deskRef = useRef<HTMLDivElement>(null);
  const shadowsRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const introBlackRef = useRef<HTMLDivElement>(null);
  const introBgRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const flyRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = sectionRef.current;
    const outer = outerRef.current;
    const bg = bgRef.current;
    const wall = wallRef.current;
    const deskEl = deskRef.current;
    const shadowsEl = shadowsRef.current;
    const copy = copyRef.current;
    const iBlack = introBlackRef.current;
    const iBg = introBgRef.current;
    const ringEl = ringRef.current;
    const fly = flyRef.current;
    if (!canvas || !host || !outer || !bg || !wall || !deskEl || !shadowsEl || !copy || !iBlack || !iBg || !ringEl || !fly) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const html = document.documentElement;
    // HomeDock: <header data-home-header><div grid>[wordmark, nav, right]</div></header>
    const headerParts = () => {
      const h = document.querySelector('[data-home-header]') as HTMLElement | null;
      const grid = h?.firstElementChild as HTMLElement | null;
      return {
        h,
        logo: (grid?.children[0] as HTMLElement | undefined) ?? null,
        rest: [grid?.children[1], grid?.children[2]].filter(Boolean) as HTMLElement[],
      };
    };

    // ---------- intro state ----------
    let introOn = !reduce.matches;
    let introStart = 0; // set when the font has loaded and the headline exists
    let logoLanded = false;
    let logoFrom: { x: number; y: number } | null = null; // start centre of the flying wordmark
    const iv = { depth: 1, tilt: 0, flat: 0, scale: 1, obj: 1 };
    const prevOverflow = html.style.overflow;
    const hideIntroLayers = () => {
      iBlack.style.display = 'none';
      iBg.style.display = 'none';
      ringEl.style.display = 'none';
      fly.style.display = 'none';
    };
    const landLogo = () => {
      if (logoLanded) return;
      logoLanded = true;
      const { logo } = headerParts();
      if (logo) logo.style.visibility = '';
      fly.style.display = 'none';
    };
    const showHeader = () => {
      landLogo();
      const { h, rest } = headerParts();
      if (h) h.style.pointerEvents = '';
      rest.forEach((el) => {
        el.style.transition = 'opacity .7s ease';
        el.style.opacity = '1';
      });
    };
    if (introOn) {
      html.style.overflow = 'hidden';
      window.scrollTo(0, 0);
      iv.depth = 0.02;
      iv.flat = 1;
      iv.obj = 0;
      // start in the dark: the light comes in once when the headline is ready
      iBg.style.opacity = '0';
      canvas.style.opacity = '0';
      // the header stays in place; its wordmark waits for the flying one, the rest is hidden until the hand-off
      const { h, logo, rest } = headerParts();
      if (h) h.style.pointerEvents = 'none';
      if (logo) logo.style.visibility = 'hidden';
      rest.forEach((el) => (el.style.opacity = '0'));
    } else hideIntroLayers();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      setFailed(true);
      hideIntroLayers();
      canvas.style.opacity = '';
      html.style.overflow = prevOverflow;
      showHeader();
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0, 0);
    renderer.toneMapping = THREE.NoToneMapping;

    const R = 23 / 900;
    const I = -60 * Math.log(0.965);
    const LOOK_X = 0;
    const FOV_HALF = THREE.MathUtils.degToRad(17.5);
    const frustumH = (z: number) => 2 * Math.tan(FOV_HALF) * (23 - z);
    const landFrustumH = 2 * Math.tan(FOV_HALF) * LAND_DIST; // frame height in world units where objects land
    const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());

    let disposed = false;
    let inView = true;
    let raf = 0;
    let last = 0;
    let U = 0;
    let W = 0;
    let D = 0;
    let F = reduce.matches || introOn ? 0 : -15000 * R;
    let Y = 0;
    let X = 0;
    let H = 0;
    let mouseGain = introOn ? 0 : 1; // held at 0 through the intro, then eases back to 1 over ~1.8s
    let textW = 0;
    let baseTextScale = 1;
    let drag: { x: number; y: number; yaw: number; pitch: number; id: number } | null = null;
    let viewW = 1;
    let viewH = 1;
    // scroll story
    let prog = 0;
    let sp = 0;
    const story = { s1: 0, d: 0, desk: 0, land: 0, out: 0, copy: 0 };

    const scene = new THREE.Scene();
    const fog = new THREE.Fog(FOG.color, FOG.near, FOG.far);
    scene.fog = fog;
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 1200);
    camera.position.z = 23;
    // where the camera ends up for the desk shot; used to put the landed objects on exact spots of the frame
    const deskCam = new THREE.PerspectiveCamera(35, 1, 0.1, 1200);
    deskCam.position.copy(DESK_CAM_V);
    deskCam.lookAt(0, DESK_LOOK_Y, 0);
    const world = new THREE.Group();
    scene.add(world);
    const textGroup = new THREE.Group();
    world.add(textGroup);

    scene.add(new THREE.HemisphereLight(0xffffff, new THREE.Color('#15218A'), 0.8));
    const dir = new THREE.DirectionalLight(0xffffff, 1.8);
    dir.position.set(-5, 8, 12);
    scene.add(dir);

    const faceMat = new THREE.ShaderMaterial({
      uniforms: {
        base: { value: new THREE.Color('#C3C9F2') },
        sky: { value: new THREE.Color('#E6E9FB') },
        hi: { value: new THREE.Color('#FFFFFF') },
        paper: { value: new THREE.Color('#FFFFFF') },
        flatCol: { value: new THREE.Color(INTRO_FACE) },
        flatMix: { value: iv.flat },
      },
      vertexShader: FACE_VERT,
      fragmentShader: FACE_FRAG,
    });
    // extrusion: the hero's standard material, with a front-to-back colour ramp (both ends = hero cobalt at rest)
    const sideU = {
      uNear: { value: new THREE.Color(SIDE_COLOR) },
      uFar: { value: new THREE.Color(SIDE_COLOR) },
    };
    const textSideMat = new THREE.MeshStandardMaterial({ color: SIDE_COLOR, roughness: 0.32, metalness: 0.22, fog: false });
    textSideMat.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, sideU);
      sh.vertexShader = 'varying float vDz;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n  vDz = position.z;');
      sh.fragmentShader =
        'uniform vec3 uNear;\nuniform vec3 uFar;\nvarying float vDz;\n' +
        sh.fragmentShader.replace(
          'vec4 diffuseColor = vec4( diffuse, opacity );',
          `float kz = clamp((${TEXT_FRONT.toFixed(3)} - vDz) / ${(2 * TEXT_FRONT).toFixed(3)}, 0.0, 1.0);\n  vec4 diffuseColor = vec4( mix(uNear, uFar, kz), opacity );`
        );
    };
    const cNear = new THREE.Color(EXT_NEAR);
    const cFar = new THREE.Color(EXT_FAR);
    const cSide = new THREE.Color(SIDE_COLOR);
    const cDim = new THREE.Color(DIM_TINT);
    const cWhite = new THREE.Color('#FFFFFF');

    const planeGeo = new THREE.PlaneGeometry(1, 1);
    const textures: THREE.Texture[] = [];
    const mats: THREE.MeshBasicMaterial[] = [];
    const loaded = new Map<Kind, Promise<{ mat: THREE.MeshBasicMaterial; aspect: number } | null>>();
    const getKind = (kind: Kind) => {
      let p = loaded.get(kind);
      if (!p) {
        p = loadCutout(ASSETS[kind].url).then((res) => {
          if (!res || disposed) return null;
          const t = new THREE.CanvasTexture(res.canvas);
          t.colorSpace = THREE.SRGBColorSpace;
          t.anisotropy = aniso;
          textures.push(t);
          const mat = new THREE.MeshBasicMaterial({ map: t, color: DIM_TINT, transparent: true, alphaTest: 0.04, toneMapped: false, side: THREE.DoubleSide });
          mats.push(mat);
          return { mat, aspect: res.aspect };
        });
        loaded.set(kind, p);
      }
      return p;
    };

    let K = 2026;
    const Q = () => ((K = (16807 * K) % 0x7fffffff) - 1) / 0x7ffffffe;

    type Slot = DeskSlot & { P: THREE.Vector3; shadow: HTMLDivElement };
    type Piece = {
      mesh: THREE.Group;
      kind: Kind;
      layer: 'grid' | 'shell';
      x: number;
      y: number;
      z: number;
      bx: number;
      by: number;
      bz: number;
      delay: number;
      scale: number;
      radius: number;
      halfH: number;
      aspect: number; // width / height of the cut-out
      vis: number;
      f: number; // extra scale from the story (landing / leaving)
      land: number; // 0..1 how settled on the desk
      hidden: boolean;
      phase: number;
      roll: number;
      speed: number;
      slot: Slot | null;
    };
    let pieces: Piece[] = [];

    function render() {
      if (!disposed) renderer.render(scene, camera);
    }

    const tmpV = new THREE.Vector3();
    const rayV = new THREE.Vector3();
    const camPos = new THREE.Vector3();
    const tBox = new THREE.Box3();
    const tCenter = new THREE.Vector3();
    const corner = new THREE.Vector3();
    const textLocalBox = new THREE.Box3();

    /** world point LAND_DIST in front of the desk camera, at screen fraction (fx, fy) */
    function landPoint(fx: number, fy: number, out: THREE.Vector3) {
      rayV.set(fx * 2 - 1, 1 - fy * 2, 0.5).unproject(deskCam).sub(deskCam.position).normalize();
      return out.copy(deskCam.position).addScaledVector(rayV, LAND_DIST);
    }
    function placeSlots() {
      deskCam.aspect = camera.aspect;
      deskCam.updateProjectionMatrix();
      deskCam.updateMatrixWorld(true);
      for (const p of pieces) if (p.slot) landPoint(p.slot.x, p.slot.y - p.slot.h / 2, p.slot.P);
    }

    /** top edge of the headline on screen (px) */
    function headlineTop() {
      world.updateMatrixWorld(true);
      camera.updateMatrixWorld(true);
      tBox.copy(textLocalBox).applyMatrix4(textGroup.matrixWorld);
      let top = Infinity;
      for (let i = 0; i < 8; i++) {
        corner.set(i & 1 ? tBox.max.x : tBox.min.x, i & 2 ? tBox.max.y : tBox.min.y, i & 4 ? tBox.max.z : tBox.min.z).project(camera);
        top = Math.min(top, ((1 - corner.y) / 2) * viewH);
      }
      return top;
    }

    /**
     * The "harbor" wordmark: sits big just above the flat headline, then (while the headline punches into 3D)
     * shrinks and flies to the header wordmark's exact spot. Placed at the header wordmark's rect and moved
     * with a transform, so p = 1 is pixel-identical to the header's own wordmark.
     */
    function logoStep(t: number, light: number) {
      if (logoLanded) return;
      const { logo } = headerParts();
      if (!logo) return landLogo();
      const lr = logo.getBoundingClientRect();
      const w = fly.offsetWidth;
      const h = fly.offsetHeight;
      const S = viewW < 768 ? LOGO_SCALE_MOBILE : LOGO_SCALE;
      const p = inOut(clamp01((t - I_START_GROW) / (I_GROW + I_HOLD)));
      if (!logoFrom || p === 0) logoFrom = { x: viewW / 2, y: headlineTop() - LOGO_GAP - (S * h) / 2 };
      const sc = lerp(S, 1, p);
      // centre travels from above the headline to the header wordmark, with a slight upward arc
      const cx = lerp(logoFrom.x, lr.left + w / 2, p);
      const cy = lerp(logoFrom.y, lr.top + h / 2, p) - 40 * Math.sin(Math.PI * p);
      fly.style.left = `${lr.left}px`;
      fly.style.top = `${lr.top}px`;
      fly.style.transform = `translate3d(${(cx - (sc * w) / 2 - lr.left).toFixed(1)}px, ${(cy - (sc * h) / 2 - lr.top).toFixed(1)}px, 0) scale(${sc.toFixed(4)})`;
      fly.style.opacity = String(light);
      if (p >= 1) landLogo();
    }

    /** intro timeline -> iv (depth, tilt, face colour, objects), side colours and the background layers */
    function introStep(now: number) {
      if (!introOn || !introStart) return;
      const t = (now - introStart) / 1000;
      // 1. light comes in, once
      const light = outCubic(clamp01(t / I_LIGHT));
      // 2. one ring closes in on the headline, accelerating, and clicks at the centre
      const rp = clamp01((t - I_RING_START) / (I_START_GROW - I_RING_START));
      ringEl.style.transform = `translate(-50%, -50%) scale(${lerp(2.6, 0.18, rp * rp * rp).toFixed(3)})`;
      ringEl.style.opacity = rp <= 0 || rp >= 1 ? '0' : String((0.95 * Math.min(1, rp * 4)).toFixed(3));
      // 3. on the snap: black field, the extrusion punches out
      const black = outCubic(clamp01((t - I_START_GROW) / I_BLACK));
      const growLin = clamp01((t - I_START_GROW) / I_GROW);
      const grow = outCubic(growLin);
      // 4. hand-off to the hero
      const hand = inOut(clamp01((t - I_START_HAND) / I_HAND));

      canvas!.style.opacity = String(light);
      iBg.style.opacity = String(light * (1 - black));
      iBlack.style.opacity = String(1 - hand);

      iv.depth = lerp(lerp(0.02, INTRO_DEEP, grow), 1, hand);
      iv.tilt = INTRO_TILT * grow * (1 - hand);
      iv.scale = 1 + 0.06 * backOut(growLin) * (1 - hand);
      iv.flat = 1 - hand;
      iv.obj = backOut(clamp01((t - I_START_HAND - 0.2) / 0.8));
      sideU.uNear.value.copy(cNear).lerp(cSide, hand);
      sideU.uFar.value.copy(cFar).lerp(cSide, hand);

      logoStep(t, light);
      if (t >= I_START_HAND) showHeader();
      if (t >= I_END) endIntro();
    }
    function endIntro() {
      if (!introOn) return;
      introOn = false;
      iv.depth = 1;
      iv.tilt = 0;
      iv.scale = 1;
      iv.flat = 0;
      iv.obj = 1;
      sideU.uNear.value.copy(cSide);
      sideU.uFar.value.copy(cSide);
      canvas!.style.opacity = '';
      hideIntroLayers();
      html.style.overflow = prevOverflow;
      showHeader();
      window.dispatchEvent(new Event('intro:done'));
    }
    const skip = () => {
      if (!introOn || !introStart) return;
      const now = performance.now();
      if ((now - introStart) / 1000 < I_START_HAND) introStart = now - I_START_HAND * 1000;
    };

    function pose() {
      const d = story.d;
      const e = reduce.matches ? 0 : 0.3 * (1 - d) * mouseGain;
      const t = e * Math.sin(0.7 * U);
      const r = e * Math.sin(0.3 * U);
      const a = e * Math.sin(0.2 * U);
      world.rotation.set(lerp(H, 0, d) + t, lerp(X, 0, d) + r, a);
      textGroup.rotation.set(-iv.tilt, 0, t - a);
      const n = F - LOOK_X;
      const k = Math.min(1, 27 / Math.hypot(n, Y, 23));
      camPos.set(LOOK_X + n * k, Y * k, 23 * k).lerp(DESK_CAM_V, d);
      camera.position.copy(camPos);
      camera.lookAt(LOOK_X, DESK_LOOK_Y * d, 0);
    }

    const invWorldQ = new THREE.Quaternion();
    const faceQ = new THREE.Quaternion();
    const wobQ = new THREE.Quaternion();
    const wobE = new THREE.Euler();
    function orient() {
      world.updateMatrixWorld(true);
      invWorldQ.setFromRotationMatrix(world.matrixWorld).invert();
      faceQ.copy(invWorldQ).multiply(camera.quaternion);
      for (const p of pieces) {
        const a = U * p.speed + p.phase;
        const w = 1 - p.land; // settled objects stop bobbing
        wobE.set(0.22 * Math.sin(a) * w, 0.32 * Math.cos(a) * w, p.roll * lerp(1, 0.2, p.land) + 0.1 * Math.sin(a * 0.6) * w);
        wobQ.setFromEuler(wobE);
        p.mesh.quaternion.copy(faceQ).multiply(wobQ);
      }
    }

    /**
     * Scroll story: the headline falls back -> the wall flattens and the desk slides up ->
     * the chosen objects drop onto their spots one after another (the rest drift away) -> the copy fades in.
     */
    function applyStory() {
      story.s1 = smooth(0, 0.16, sp);
      story.d = smooth(0.06, 0.4, sp);
      story.desk = smooth(0.08, 0.38, sp);
      story.out = smooth(0.06, 0.36, sp);
      story.land = smooth(0.16, 0.62, sp);
      story.copy = smooth(0.5, 0.68, sp);
      const { s1, d, desk: dk, out, land, copy: cp } = story;

      faceMat.uniforms.flatMix.value = iv.flat;
      if (textW) {
        const s = baseTextScale * Math.max(0.001, 1 - s1) * iv.scale;
        textGroup.scale.set(s, s, s * iv.depth);
        // the extrusion grows backwards: the letter faces stay where the hero's faces are
        textGroup.position.z = -3 * s1 - TEXT_FRONT * s * (iv.depth - 1);
        textGroup.visible = s1 < 0.99;
      }

      // the flat desk slides up from below
      deskEl!.style.visibility = dk > 0.001 ? 'visible' : 'hidden';
      deskEl!.style.transform = `translate3d(0, ${((1 - outCubic(dk)) * 75).toFixed(2)}%, 0)`;

      // objects: brighter and out of the fog as the scene turns into the desk shot
      for (const m of mats) m.color.copy(cDim).lerp(cWhite, 0.9 * d);
      fog.near = lerp(FOG.near, 80, d);
      fog.far = lerp(FOG.far, 200, d);

      for (const p of pieces) {
        if (p.slot) {
          const gi = smooth(0, 1, land * 1.7 - p.delay * 0.7);
          p.land = gi;
          // landed size = the slot's height on screen
          const fLand = (p.slot.h * landFrustumH) / Math.max(0.001, 2 * p.halfH * p.scale);
          p.f = lerp(1, fLand, gi);
          const e = outCubic(gi);
          const wob = 0.7 * Math.sin(0.3 * U + p.phase) * (1 - gi);
          const P = p.slot.P;
          p.mesh.position.set(lerp(p.bx, P.x, e), lerp(p.by, P.y, e) + 1.6 * Math.sin(Math.PI * e) * (1 - e), lerp(p.bz + wob, P.z, e));
          // contact shadow (flat, on the desk) under the object
          const sh = p.slot.shadow;
          const wPx = p.slot.h * viewH * p.aspect;
          sh.style.width = `${(wPx * 1.05).toFixed(0)}px`;
          sh.style.height = `${(wPx * 0.2).toFixed(0)}px`;
          sh.style.opacity = String((gi * gi * dk).toFixed(3));
        } else {
          p.land = 0;
          p.f = Math.max(0.001, 1 - out);
          const wob = 0.7 * Math.sin(0.3 * U + p.phase);
          const push = 1 + 1.3 * out;
          p.mesh.position.set(p.bx * push, p.by * push + 5 * out, p.bz + wob);
        }
      }

      // wall and copy
      wall!.style.opacity = String(d);
      copy!.style.opacity = String(cp);
      copy!.style.transform = `translateY(${((1 - cp) * 28).toFixed(1)}px)`;
      copy!.style.pointerEvents = cp > 0.6 ? 'auto' : 'none';
    }

    function keepTitleClear(instant: boolean) {
      world.updateMatrixWorld(true);
      camera.updateMatrixWorld(true);
      let tr: { l: number; r: number; t: number; b: number } | null = null;
      let camToText = 0;
      if (textW && story.s1 < 0.45 && !introOn) {
        tBox.copy(textLocalBox).applyMatrix4(textGroup.matrixWorld);
        tBox.getCenter(tCenter);
        camToText = camera.position.distanceTo(tCenter);
        let l = Infinity;
        let r = -Infinity;
        let t = Infinity;
        let b = -Infinity;
        for (let i = 0; i < 8; i++) {
          corner.set(i & 1 ? tBox.max.x : tBox.min.x, i & 2 ? tBox.max.y : tBox.min.y, i & 4 ? tBox.max.z : tBox.min.z).project(camera);
          const sx = ((corner.x + 1) / 2) * viewW;
          const sy = ((1 - corner.y) / 2) * viewH;
          l = Math.min(l, sx);
          r = Math.max(r, sx);
          t = Math.min(t, sy);
          b = Math.max(b, sy);
        }
        tr = { l, r, t, b };
      }
      const k = instant ? 1 : 0.12;
      const pxPerUnit = viewH / (2 * Math.tan(FOV_HALF));
      const shrink = Math.max(0.001, iv.obj);
      for (const p of pieces) {
        if (tr && p.land < 0.05) {
          tmpV.setFromMatrixPosition(p.mesh.matrixWorld);
          const d = camera.position.distanceTo(tmpV);
          let over = false;
          if (d < camToText + 1) {
            const radPx = (p.radius * p.scale * pxPerUnit) / Math.max(d, 1) + (p.hidden ? 28 : 0);
            tmpV.project(camera);
            const sx = ((tmpV.x + 1) / 2) * viewW;
            const sy = ((1 - tmpV.y) / 2) * viewH;
            over = sx + radPx > tr.l && sx - radPx < tr.r && sy + radPx > tr.t && sy - radPx < tr.b;
          }
          p.hidden = over;
        } else if (!introOn) p.hidden = false;
        const target = p.hidden ? 0 : 1;
        p.vis += (target - p.vis) * k;
        p.mesh.scale.setScalar(p.scale * Math.max(0.001, p.vis) * p.f * shrink);
      }
    }

    function fitText(width: number) {
      if (!textW) return;
      const target = frustumH(0) * camera.aspect * (width < 768 ? TEXT_FIT_MOBILE : TEXT_FIT);
      baseTextScale = target / textW;
    }

    function placePiece(c: Piece) {
      if (c.layer === 'grid') {
        const l = frustumH(c.z);
        c.bx = c.x * l * camera.aspect * SPREAD;
        c.by = c.y * l * SPREAD;
        c.bz = c.z;
      } else {
        const stretch = clamp(camera.aspect / 1.78, 0.55, 1.4);
        c.bx = c.x * stretch;
        c.by = c.y;
        c.bz = c.z;
      }
      c.mesh.position.set(c.bx, c.by, c.bz);
    }

    function frame(instant: boolean) {
      applyStory();
      pose();
      orient();
      keepTitleClear(instant);
      render();
    }

    function layout() {
      const rect = host!.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      viewW = rect.width;
      viewH = rect.height;
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
      renderer.setSize(rect.width, rect.height, false);
      fitText(rect.width);
      pieces.forEach((c) => placePiece(c));
      placeSlots();
      logoFrom = null;
      frame(true);
    }

    {
      const mobile = host.getBoundingClientRect().width < 768;
      const g = mobile ? GRID.mobile : GRID.desktop;
      const cellW = 2 / g.cols;
      const cellH = 2 / g.rows;
      let t = 0;
      const make = (layer: Piece['layer'], x: number, y: number, z: number): Piece => {
        const kind = TYPES[t++ % TYPES.length];
        const outerG = new THREE.Group();
        const scale = 1.15 + 0.4 * Q();
        const phase = Q() * Math.PI * 2;
        const roll = (Q() - 0.5) * 0.7;
        world.add(outerG);
        const size = ASSETS[kind].size * SIZE_BOOST * (mobile ? 0.85 : 1);
        const piece: Piece = {
          mesh: outerG, kind, layer, x, y, z, bx: 0, by: 0, bz: z, delay: Q(), scale, radius: size * 0.5,
          halfH: size * 0.4, aspect: 1, vis: 1, f: 1, land: 0, hidden: false, phase, roll, speed: 0.12 + 0.15 * Q(), slot: null,
        };
        getKind(kind).then((res) => {
          if (!res || disposed) return;
          const plane = new THREE.Mesh(planeGeo, res.mat);
          const w = res.aspect >= 1 ? size : size * res.aspect;
          const h = res.aspect >= 1 ? size / res.aspect : size;
          plane.scale.set(w, h, 1);
          piece.halfH = h / 2;
          piece.aspect = res.aspect;
          outerG.add(plane);
          if (reduce.matches || !raf) frame(true);
        });
        return piece;
      };

      const list: Piece[] = [];
      let cell = 0;
      for (let r = 0; r < g.rows; r++) {
        for (let c = 0; c < g.cols; c++) {
          const cx = -1 + (c + 0.5) * cellW;
          const cy = -1 + (r + 0.5) * cellH;
          if (Math.abs(cx) < g.clearX && Math.abs(cy) < g.clearY) continue;
          const skip = [2, 5, 8].includes(cell % 10);
          cell++;
          if (skip) continue;
          const nearText = Math.abs(cx) < g.clearX;
          const jy = nearText ? Math.sign(cy) * Q() * cellH * 0.25 : (Q() - 0.5) * cellH * 0.5;
          list.push(make('grid', cx + (Q() - 0.5) * cellW * 0.5, cy + jy, -9 + 13 * Q()));
        }
      }
      const n = mobile ? SURROUND.mobile : SURROUND.desktop;
      const total = Math.round(n / 0.78);
      for (let i = 0; i < total; i++) {
        const yy = 1 - (2 * (i + 0.5)) / total;
        const rr = Math.sqrt(1 - yy * yy);
        const phi = i * 2.399963;
        const dx = Math.cos(phi) * rr;
        const dz = Math.sin(phi) * rr;
        if (dz > 0.45) continue;
        const s = 0.9 + 0.2 * Q();
        list.push(make('shell', dx * SHELL.x * s, yy * SHELL.y * s, dz * SHELL.z * s));
      }
      pieces = list;

      // one floating object of each slot's kind goes to that spot (front-most first); drop order runs back to front
      const slots = mobile ? SLOTS_MOBILE : SLOTS_DESKTOP;
      const order = [...slots].sort((a, b) => a.y - b.y);
      order.forEach((s, i) => {
        const cand = pieces
          .filter((p) => p.kind === s.kind && !p.slot)
          .sort((a, b) => (a.layer === b.layer ? b.z - a.z : a.layer === 'grid' ? -1 : 1))[0];
        if (!cand) return;
        const shadow = document.createElement('div');
        shadow.style.cssText = `position:absolute;left:${(s.x * 100).toFixed(2)}%;top:${(s.y * 100).toFixed(2)}%;transform:translate(-50%,-62%);border-radius:50%;opacity:0;pointer-events:none;background:radial-gradient(closest-side, rgba(12,22,90,0.34), rgba(12,22,90,0.16) 55%, rgba(12,22,90,0) 100%);`;
        shadowsEl.appendChild(shadow);
        cand.slot = { ...s, P: new THREE.Vector3(), shadow };
        cand.delay = (i / Math.max(1, order.length - 1)) * 0.9;
      });
    }

    new FontLoader().load(
      FONT_URL,
      (font) => {
        if (disposed) return;
        const mobile = host.getBoundingClientRect().width < 768;
        const lines = mobile ? ['I observe', 'objectively to', 'design clearly.'] : ['I observe objectively', 'to design clearly.'];
        lines.forEach((line, i) => {
          const tg = new TextGeometry(line, {
            font,
            size: 1,
            height: TEXT_DEPTH,
            depth: TEXT_DEPTH,
            curveSegments: 6,
            bevelEnabled: true,
            bevelThickness: 0.05,
            bevelSize: 0.03,
            bevelSegments: 2,
          } as any);
          tg.computeBoundingBox();
          const bb = tg.boundingBox!;
          tg.translate(-(bb.max.x + bb.min.x) / 2, -i * 1.18, -TEXT_DEPTH / 2);
          textGroup.add(new THREE.Mesh(tg, [faceMat, textSideMat]));
        });
        const box = new THREE.Box3().setFromObject(textGroup);
        const centre = box.getCenter(new THREE.Vector3());
        textGroup.children.forEach((m) => (m.position.y -= centre.y));
        textW = box.getSize(new THREE.Vector3()).x;
        textLocalBox.makeEmpty();
        textGroup.children.forEach((m) => {
          const g = (m as THREE.Mesh).geometry;
          g.computeBoundingBox();
          textLocalBox.union(g.boundingBox!.clone().translate(m.position));
        });
        host.dataset.sceneReady = 'true';
        layout();
        if (introOn) introStart = performance.now(); // the intro starts once the headline exists
      },
      undefined,
      () => {
        setFailed(true);
        endIntro();
      }
    );

    const readProgress = () => {
      const r = outer.getBoundingClientRect();
      const span = r.height - host.getBoundingClientRect().height;
      prog = span > 0 ? clamp(-r.top / span, 0, 1) : 0;
    };

    function tick(now: number) {
      raf = 0;
      if (disposed || !inView || document.hidden || reduce.matches) return;
      const dt = Math.min((now - (last || now)) / 1000, 0.04);
      last = now;
      U += dt;
      introStep(now);
      const r = 1 - Math.exp(-dt * I);
      if (introOn) {
        mouseGain = 0;
        F = 0;
        Y = 0;
      } else mouseGain = Math.min(1, mouseGain + dt / 1.8);
      const ease = mouseGain * mouseGain * (3 - 2 * mouseGain);
      const calm = (1 - story.d) * ease; // the camera settles as it moves to the desk shot
      F += (-W * R * calm - F) * r;
      Y += (D * R * calm - Y) * r;
      sp += (prog - sp) * (1 - Math.exp(-dt * 6));
      frame(false);
      raf = requestAnimationFrame(tick);
    }
    function start() {
      if (raf || disposed || !inView || document.hidden || reduce.matches) return;
      last = 0;
      raf = requestAnimationFrame(tick);
    }
    function stop() {
      cancelAnimationFrame(raf);
      raf = 0;
    }
    const sync = () => {
      if (!inView || document.hidden || reduce.matches) {
        stop();
        if (reduce.matches) {
          endIntro();
          F = Y = 0;
          sp = prog;
          frame(true);
        }
      } else start();
    };

    let canvasLeft = 0;
    let canvasTop = 0;
    const onMove = (e: PointerEvent) => {
      if (introOn) return;
      if (drag && drag.id === e.pointerId) {
        X = drag.yaw + 0.003 * (e.clientX - drag.x);
        H = clamp(drag.pitch + 0.002 * (e.clientY - drag.y), -0.65, 0.65);
        if (reduce.matches) frame(true);
      } else if (e.pointerType === 'mouse' && !reduce.matches) {
        W = 4 * clamp(e.clientX - canvasLeft - viewW / 2, -viewW / 2, viewW / 2);
        D = 4 * clamp(e.clientY - canvasTop - viewH / 2, -viewH / 2, viewH / 2);
      }
    };
    const onEnter = () => {
      const r = canvas.getBoundingClientRect();
      canvasLeft = r.left;
      canvasTop = r.top;
    };
    const onScroll = () => {
      onEnter();
      readProgress();
      if (reduce.matches) {
        sp = prog;
        frame(true);
      }
    };
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 || introOn) return;
      drag = { x: e.clientX, y: e.clientY, yaw: X, pitch: H, id: e.pointerId };
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {}
      canvas.style.cursor = 'grabbing';
    };
    const onUp = (e: PointerEvent) => {
      if (drag && drag.id === e.pointerId) {
        drag = null;
        canvas.style.cursor = 'grab';
      }
    };

    const ro = new ResizeObserver(() => {
      layout();
      onEnter();
      readProgress();
    });
    ro.observe(host);
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      onEnter();
      sync();
    });
    io.observe(host);
    host.addEventListener('pointerenter', onEnter);
    host.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointerdown', skip);
    window.addEventListener('keydown', skip);
    window.addEventListener('wheel', skip, { passive: true });
    window.addEventListener('touchmove', skip, { passive: true });
    document.addEventListener('visibilitychange', sync);
    reduce.addEventListener?.('change', sync);

    readProgress();
    sp = prog;
    layout();
    onEnter();
    sync();

    return () => {
      disposed = true;
      stop();
      ro.disconnect();
      io.disconnect();
      host.removeEventListener('pointerenter', onEnter);
      host.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointerdown', skip);
      window.removeEventListener('keydown', skip);
      window.removeEventListener('wheel', skip);
      window.removeEventListener('touchmove', skip);
      document.removeEventListener('visibilitychange', sync);
      reduce.removeEventListener?.('change', sync);
      html.style.overflow = prevOverflow;
      canvas.style.opacity = '';
      showHeader();
      shadowsEl.innerHTML = '';
      textGroup.children.forEach((m) => (m as THREE.Mesh).geometry.dispose());
      planeGeo.dispose();
      mats.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
      [faceMat, textSideMat].forEach((m) => m.dispose());
      renderer.dispose();
    };
  }, []);

  const E = DESK_EDGE;
  return (
    <section
      id="home"
      ref={outerRef}
      data-tone="dark"
      className="pointer-events-none relative z-[2] w-full"
      style={{ height: `calc(100svh + ${STORY_VH}vh)` }}
      aria-label="Intro"
    >
      <div
        ref={sectionRef}
        className="pointer-events-auto sticky top-0 h-[100svh] min-h-[620px] w-full overflow-hidden"
        style={{ backgroundColor: '#050826', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
      >
        <div ref={bgRef} className="pointer-events-none absolute inset-0" style={{ backgroundImage: BG_FILL }} aria-hidden="true" />
        {/* the desk scene's plain blue wall (fades in on scroll) */}
        <div ref={wallRef} className="pointer-events-none absolute inset-0" style={{ backgroundImage: WALL_FILL, opacity: 0 }} aria-hidden="true" />

        {/* the desk (flat, like the reference): back edge from the left side up to a corner, darker side wall past it */}
        <div ref={deskRef} className="pointer-events-none absolute inset-0 will-change-transform" style={{ visibility: 'hidden' }} aria-hidden="true">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="deskTop" x1="0" y1="1" x2="0.9" y2="0.15">
                <stop offset="0" stopColor={DESK_TOP_NEAR} />
                <stop offset="0.7" stopColor={DESK_TOP} />
                <stop offset="1" stopColor={DESK_EDGE_SHADE} />
              </linearGradient>
            </defs>
            <polygon points={`${E.cornerX * 100},0 100,0 100,${E.rightY * 100} ${E.cornerX * 100},${E.cornerY * 100}`} fill={SIDE_WALL} />
            <polygon points={`0,${E.leftY * 100} ${E.cornerX * 100},${E.cornerY * 100} 100,${E.rightY * 100} 100,100 0,100`} fill="url(#deskTop)" />
          </svg>
          {/* contact shadows of the landed objects (added by the scene) */}
          <div ref={shadowsRef} className="absolute inset-0" />
        </div>

        {/* intro field: black under a navy/purple glow, and one ring of light that closes in on the headline */}
        <div ref={introBlackRef} className="pointer-events-none absolute inset-0 bg-black" aria-hidden="true" />
        <div ref={introBgRef} className="pointer-events-none absolute inset-0" style={{ backgroundImage: INTRO_BG }} aria-hidden="true" />
        <div
          ref={ringRef}
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: '70vmax',
            height: '70vmax',
            opacity: 0,
            background: 'radial-gradient(circle, transparent 52%, rgba(150,110,255,0.55) 62%, rgba(255,95,191,0.25) 68%, transparent 74%)',
          }}
        />

        <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" style={{ cursor: 'grab', touchAction: 'pan-y' }} aria-hidden="true" />

        {/* desk scene copy: same spot and amount as the reference — two-line headline + one button (PLACEHOLDER copy) */}
        <div
          ref={copyRef}
          className="absolute z-[3] text-white"
          style={{ left: 'max(16px, 7.2vw)', top: 'max(88px, 11.8%)', opacity: 0, pointerEvents: 'none' }}
        >
          <h2
            className="font-bold tracking-[-0.035em]"
            style={{ fontSize: 'max(40px, 5.2vw)', lineHeight: 0.97, whiteSpace: 'nowrap' }}
          >
            Every project starts
            <br />
            at this desk.
          </h2>
          <a
            href="#/trust-bank"
            className="inline-flex items-center justify-center rounded-[2px] bg-white font-medium text-black transition-opacity hover:opacity-90"
            style={{ marginTop: 'max(24px, 1.95vw)', height: 'max(48px, 3.3vw)', padding: '0 max(18px, 1.2vw)', fontSize: 'max(16px, 1.15vw)' }}
          >
            See my work
          </a>
        </div>

        {/* intro wordmark: same type as the header's "harbor", flies into the header's top-left corner */}
        <div
          ref={flyRef}
          aria-hidden="true"
          className="pointer-events-none fixed left-0 top-0 whitespace-nowrap text-[26px] font-bold leading-none tracking-[-0.03em] text-white will-change-transform"
          style={{ opacity: 0, transformOrigin: '0 0' }}
        >
          harbor
        </div>

        <h1
          className={failed ? 'absolute inset-0 z-0 flex items-center justify-center px-6 text-center text-[44px] md:text-[88px] font-bold leading-[1.02] tracking-[-0.03em]' : 'sr-only'}
          style={failed ? { color: FG } : undefined}
        >
          I observe objectively to design clearly.
        </h1>
      </div>
    </section>
  );
}
