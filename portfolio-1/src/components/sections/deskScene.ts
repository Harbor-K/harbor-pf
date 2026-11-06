/**
 * Tuning for the hero's scroll "desk" scene (ObjectsHero), matched to Harbor's ClassPass reference
 * (gift-card hero). Kept in its own small file so the look and the setting-down motion can be adjusted
 * without touching the scene code.
 *
 * The desk is drawn flat (SVG) like the reference: a white desk whose back edge runs from the left side at 74%
 * down the frame up to a corner at 91.7% across / 18% down, with a darker side wall past that corner.
 * All positions below are fractions of the hero frame (0 = left/top, 1 = right/bottom).
 */

/** desk top colour — the same tone as the footer background (Harbor: match the top to the bottom) */
export const DESK_TOP = '#EEF0F5';
export const DESK_TOP_NEAR = '#EEF0F5'; // front of the desk: same tone, so it flows straight into the footer
export const DESK_EDGE_SHADE = '#E2E5EE'; // a soft shade toward the back edge
export const DESK_EDGE = { leftY: 0.74, cornerX: 0.917, cornerY: 0.18, rightY: 0.185 };
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
 * The objects on the desk (no purple notebook), as their natural photos.
 * Perspective: the desk recedes UP to the right (its back edge rises toward the right corner), so its right side
 * is farther away. Photos shot the other way round (right side nearer: the laptop, the sticky-note pad, the
 * phone) are mirrored (`mirror`) so they turn the same way as the desk; the phone is also laid along the desk's
 * direction (tilt).
 * x = centre across; y = where it touches the desk; h = picture height; tilt = resting angle (radians,
 * + = counter-clockwise); flat = optional vertical squash for a lying object (not used now);
 * label = the short line shown when you hover the object (PLACEHOLDER copy).
 */
export type DeskSlot = {
  kind: string;
  x: number;
  y: number;
  h: number;
  tilt: number;
  mirror?: boolean;
  flat?: number;
  label: string;
};
export const SLOTS_DESKTOP: DeskSlot[] = [
  { kind: 'laptop', x: 0.62, y: 0.66, h: 0.38, tilt: 0, mirror: true, label: 'Figma & Magic Patterns — where the screens get made' },
  { kind: 'headphones', x: 0.855, y: 0.5, h: 0.26, tilt: 0.04, label: 'Focus mode for deep design work' },
  { kind: 'mug', x: 0.4, y: 0.8, h: 0.21, tilt: 0, label: 'Fuel for long research days' },
  { kind: 'stickyYellow', x: 0.925, y: 0.75, h: 0.15, tilt: 0.04, mirror: true, label: 'Affinity mapping, one note at a time' },
  { kind: 'clipboard', x: 0.8, y: 0.94, h: 0.34, tilt: 0.1, label: 'Usability test notes' },
  { kind: 'phone', x: 0.585, y: 0.95, h: 0.22, tilt: 0.18, mirror: true, label: 'Testing on real devices' },
];
export const SLOTS_MOBILE: DeskSlot[] = [
  { kind: 'laptop', x: 0.58, y: 0.68, h: 0.19, tilt: 0, mirror: true, label: 'Figma & Magic Patterns — where the screens get made' },
  { kind: 'headphones', x: 0.85, y: 0.55, h: 0.13, tilt: 0.04, label: 'Focus mode for deep design work' },
  { kind: 'mug', x: 0.27, y: 0.8, h: 0.11, tilt: 0, label: 'Fuel for long research days' },
  { kind: 'stickyYellow', x: 0.88, y: 0.74, h: 0.08, tilt: 0.04, mirror: true, label: 'Affinity mapping, one note at a time' },
  { kind: 'clipboard', x: 0.78, y: 0.9, h: 0.17, tilt: 0.1, label: 'Usability test notes' },
  { kind: 'phone', x: 0.5, y: 0.92, h: 0.12, tilt: 0.18, mirror: true, label: 'Testing on real devices' },
];

/**
 * Putting one object down, like a hand would, for g = 0..1 of its own turn:
 *  - carry (0 -> CARRY_END): from where it floated to a spot just above its place, turning to its resting angle;
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
 * Shadow under a standing object: mostly hidden under its footprint, so only a thin rim shows around the base
 * and the object's bottom edge sinks into the dark core; soft falloff leaning away from the light (top-left).
 */
export const SHADOW_CSS =
  'position:absolute;border-radius:50%;opacity:0;pointer-events:none;transform:translate(-46%,-92%);' +
  'background:radial-gradient(closest-side, rgba(6,12,60,0.62), rgba(6,12,60,0.34) 50%, rgba(6,12,60,0) 100%) 46% 78% / 84% 34% no-repeat,' +
  'radial-gradient(closest-side, rgba(12,22,90,0.24), rgba(12,22,90,0.09) 60%, rgba(12,22,90,0) 100%) 58% 52% / 100% 100% no-repeat;';
/** standing shadow size from the object's on-screen width */
export const shadowSize = (objW: number, scale: number) => ({ w: objW * 1.16 * scale, h: objW * 0.34 * scale });

/** shadow for a lying object (only used if a slot sets `flat`) */
export const SHADOW_FLAT_CSS =
  'position:absolute;border-radius:40%;opacity:0;pointer-events:none;transform:translate(-44%,-40%);' +
  'background:rgba(8,16,70,0.26);filter:blur(5px);';
export function flatShadowSize(objW: number, objH: number, tilt: number, flat: number, scale: number) {
  const c = Math.abs(Math.cos(tilt));
  const s = Math.abs(Math.sin(tilt));
  return { w: (objW * c + objH * s) * 0.74 * scale, h: (objW * s + objH * c) * flat * 0.7 * scale };
}
