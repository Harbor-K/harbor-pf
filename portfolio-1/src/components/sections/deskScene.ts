/**
 * Tuning for the hero's scroll "desk" scene (ObjectsHero), matched to Harbor's ClassPass reference
 * (gift-card hero). Kept in its own small file so the look and the setting-down motion can be adjusted
 * without touching the scene code.
 *
 * The desk is drawn flat (SVG) like the reference: a white desk whose back edge runs from the left side at 74%
 * down the frame up to a corner at 91.7% across / 18% down, with a darker side wall past that corner.
 * All positions below are fractions of the hero frame (0 = left/top, 1 = right/bottom).
 */

export const DESK_EDGE = { leftY: 0.74, cornerX: 0.917, cornerY: 0.18, rightY: 0.185 };
export const DESK_TOP = '#EEF0F5'; // desk surface
export const DESK_TOP_NEAR = '#F8F9FB'; // lighter toward the front-left
export const DESK_EDGE_SHADE = '#DDE1EC'; // soft shade along the back edge
export const SIDE_WALL = '#1B2FA8'; // the darker wall right of the corner
/** the main wall behind the desk */
export const WALL_FILL = 'linear-gradient(180deg, #3A5CF0 0%, #2C49DE 55%, #2440D6 100%)';

/** camera for the desk shot (three.js units) and how far in front of it the landed objects stand */
export const DESK_CAM = { x: 0, y: 6.2, z: 20.5 };
export const DESK_LOOK_Y = -0.6;
export const LAND_DIST = 17;
/** objects further down the frame (nearer the viewer) stand a little closer, so they overlap the ones behind */
export const slotDist = (y: number) => LAND_DIST - (y - 0.6) * 4;

/**
 * The objects on the desk (Harbor's pick: no purple notebook), placed the way you would really leave them:
 *  - standing: the laptop (open) and the mug;
 *  - lying flat ("가로로"): the phone, the clipboard, the sticky-note pad and the headphones (on their side).
 *    A lying object is turned to its resting angle and squashed vertically (`flat`) so it reads as seen from
 *    above on the desk, and its shadow is a low, tight footprint right under it.
 * x = centre across; y = where it touches the desk (standing) or its centre (lying); h = picture height;
 * tilt = resting angle (radians); flat = vertical squash for lying objects (1 = standing).
 */
export type DeskSlot = { kind: string; x: number; y: number; h: number; tilt: number; flat?: number };
export const SLOTS_DESKTOP: DeskSlot[] = [
  { kind: 'laptop', x: 0.62, y: 0.66, h: 0.38, tilt: 0 },
  { kind: 'headphones', x: 0.855, y: 0.47, h: 0.25, tilt: 1.42, flat: 0.78 },
  { kind: 'mug', x: 0.4, y: 0.8, h: 0.21, tilt: 0 },
  { kind: 'stickyYellow', x: 0.925, y: 0.73, h: 0.15, tilt: -0.08, flat: 0.88 },
  { kind: 'clipboard', x: 0.795, y: 0.84, h: 0.33, tilt: -1.3, flat: 0.6 },
  { kind: 'phone', x: 0.585, y: 0.89, h: 0.23, tilt: -1.25, flat: 0.66 },
];
export const SLOTS_MOBILE: DeskSlot[] = [
  { kind: 'laptop', x: 0.58, y: 0.68, h: 0.19, tilt: 0 },
  { kind: 'headphones', x: 0.85, y: 0.53, h: 0.12, tilt: 1.42, flat: 0.78 },
  { kind: 'mug', x: 0.27, y: 0.8, h: 0.11, tilt: 0 },
  { kind: 'stickyYellow', x: 0.88, y: 0.72, h: 0.08, tilt: -0.08, flat: 0.88 },
  { kind: 'clipboard', x: 0.76, y: 0.86, h: 0.16, tilt: -1.3, flat: 0.6 },
  { kind: 'phone', x: 0.48, y: 0.9, h: 0.12, tilt: -1.25, flat: 0.66 },
];

/**
 * Putting one object down, like a hand would, for g = 0..1 of its own turn:
 *  - carry (0 -> CARRY_END): from where it floated to a spot just above its place, turning to its resting
 *    angle (lying objects tip down flat as they come);
 *  - lower (CARRY_END -> 1): straight down, slowing to a soft touch at TOUCH; on contact it squashes a hair,
 *    rocks back level with a small damped wobble, and rests. The contact shadow grows from wide and faint to
 *    tight and dark as it nears the desk.
 * Objects take their turns one after another (STAGGER), like being set down one at a time.
 */
export const LIFT = 0.12; // how far above its place (fraction of the frame) it is held before going down
export const CARRY_END = 0.5;
export const TOUCH = 0.78; // share of the lowering at which it touches the desk
export const HOLD_TILT = 0.12; // radians it is tipped while held
export const STAGGER = { span: 0.36, spread: 0.64 }; // each object's turn length / how far apart turns start

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export function placeMotion(g: number) {
  const c = clamp01(g / CARRY_END);
  const carry = c < 0.5 ? 4 * c * c * c : 1 - (-2 * c + 2) ** 3 / 2; // ease in-out
  const l = clamp01((g - CARRY_END) / (1 - CARRY_END));
  const pre = clamp01(l / TOUCH);
  const post = clamp01((l - TOUCH) / (1 - TOUCH));
  // straight down, decelerating into a soft touch
  const down = l < TOUCH ? 1 - (1 - pre) ** 2 : 1;
  // held tipped, then on contact rocks back level with a damped wobble
  const rock = l < TOUCH ? HOLD_TILT * carry : HOLD_TILT * Math.exp(-5 * post) * Math.cos(2.5 * Math.PI * post);
  // a hair of squash right at contact (keeps its bottom on the desk)
  const s = l < TOUCH ? 0 : Math.sin(Math.PI * Math.min(1, post * 2.2)) * (1 - post);
  const squashY = 1 - 0.04 * s;
  const squashX = 1 + 0.025 * s;
  const shadowOpacity = Math.pow(pre, 1.6);
  const shadowScale = 1.7 - 0.7 * pre;
  return { carry, down, rock, squashX, squashY, shadowOpacity, shadowScale };
}

/**
 * Shadow under a STANDING object: mostly hidden under its footprint, so only a thin rim shows around the base
 * and the object's bottom edge sinks into the dark core; soft falloff leaning away from the light (top-left).
 */
export const SHADOW_CSS =
  'position:absolute;border-radius:50%;opacity:0;pointer-events:none;transform:translate(-46%,-92%);' +
  'background:radial-gradient(closest-side, rgba(6,12,60,0.62), rgba(6,12,60,0.34) 50%, rgba(6,12,60,0) 100%) 46% 78% / 84% 34% no-repeat,' +
  'radial-gradient(closest-side, rgba(12,22,90,0.24), rgba(12,22,90,0.09) 60%, rgba(12,22,90,0) 100%) 58% 52% / 100% 100% no-repeat;';
/** standing shadow size from the object's on-screen width */
export const shadowSize = (objW: number, scale: number) => ({ w: objW * 1.16 * scale, h: objW * 0.34 * scale });

/**
 * Shadow under a LYING object: a soft rounded patch that stays INSIDE the object's outline (no halo), nudged a
 * few px down-right (away from the light), so only a thin shadow edge peeks out on that side.
 */
export const SHADOW_FLAT_CSS =
  'position:absolute;border-radius:40%;opacity:0;pointer-events:none;transform:translate(-44%,-40%);' +
  'background:rgba(8,16,70,0.26);filter:blur(5px);';
/** lying shadow size: a little smaller than the box of the turned, squashed picture */
export function flatShadowSize(objW: number, objH: number, tilt: number, flat: number, scale: number) {
  const c = Math.abs(Math.cos(tilt));
  const s = Math.abs(Math.sin(tilt));
  return { w: (objW * c + objH * s) * 0.74 * scale, h: (objW * s + objH * c) * flat * 0.7 * scale };
}

/** the same objects, for the footer (small, set down beside Kim LLM) */
const CDN = 'https://cdn.magicpatterns.com/patterns/generated-images/';
export const OBJECT_URLS: Record<string, string> = {
  laptop: `${CDN}a2d4e410-5b56-4a38-96f3-1ba61bc00c23.jpg`,
  stickyYellow: `${CDN}8ca457f9-75b9-45f0-8bbe-541e02ef4485.jpg`,
  phone: `${CDN}b7474bd0-8ee1-452c-ba1d-ff822645cdcf.jpg`,
  clipboard: `${CDN}393e0b37-9a88-49f5-85cd-3e2d8cfc8158.jpg`,
  headphones: `${CDN}af6d59a6-a5d1-4a5d-90d1-f83c6b22b233.jpg`,
  mug: `${CDN}5a5dcd76-f344-4d11-954d-e34a0b905d5d.jpg`,
};

/** green-screen cut-out -> transparent PNG data URL (same keying as the hero, without the hero's dimming) */
export function keyCutout(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const W = img.naturalWidth;
        const H = img.naturalHeight;
        const c = document.createElement('canvas');
        c.width = W;
        c.height = H;
        const x = c.getContext('2d', { willReadFrequently: true })!;
        x.drawImage(img, 0, 0);
        const im = x.getImageData(0, 0, W, H);
        const d = im.data;
        let minX = W, minY = H, maxX = 0, maxY = 0;
        for (let y = 0; y < H; y++) {
          for (let i0 = 0; i0 < W; i0++) {
            const i = (y * W + i0) * 4;
            const m = Math.max(d[i], d[i + 2]);
            const green = d[i + 1] - m;
            const a = green <= 26 ? 1 : green >= 96 ? 0 : 1 - (green - 26) / 70;
            if (green > 8) d[i + 1] = m + 8;
            d[i + 3] = a * 255;
            if (a > 0.2) {
              if (i0 < minX) minX = i0;
              if (i0 > maxX) maxX = i0;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }
        x.putImageData(im, 0, 0);
        if (maxX <= minX || maxY <= minY) return resolve(null);
        const cw = maxX - minX + 1;
        const ch = maxY - minY + 1;
        const k = Math.min(1, 420 / Math.max(cw, ch));
        const out = document.createElement('canvas');
        out.width = Math.round(cw * k);
        out.height = Math.round(ch * k);
        out.getContext('2d')!.drawImage(c, minX, minY, cw, ch, 0, 0, out.width, out.height);
        resolve(out.toDataURL('image/png'));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}
