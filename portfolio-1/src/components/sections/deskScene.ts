/**
 * Tuning for the hero's scroll "desk" scene (ObjectsHero), matched to Harbor's ClassPass reference
 * (gift-card hero, 1920px wide). Kept in its own small file so the look can be adjusted without touching
 * the scene code.
 *
 * The desk itself is drawn flat (SVG), exactly like the reference: a white desk whose back edge runs from the
 * left side at 74% down the frame up to a corner at 91.7% across / 18% down, with a darker side wall right of
 * that corner. All numbers below are fractions of the hero frame (0 = left/top, 1 = right/bottom).
 */

export const DESK_EDGE = { leftY: 0.74, cornerX: 0.917, cornerY: 0.18, rightY: 0.185 };
export const DESK_TOP = '#EEF0F5'; // desk surface
export const DESK_TOP_NEAR = '#F7F8FB'; // lighter toward the front-left
export const DESK_EDGE_SHADE = '#DFE3EE'; // soft shade along the back edge
export const SIDE_WALL = '#1B2FA8'; // the darker wall right of the corner
/** the main wall behind the desk */
export const WALL_FILL = 'linear-gradient(180deg, #3A5CF0 0%, #2C49DE 55%, #2440D6 100%)';

/** camera for the desk shot (three.js units) and how far in front of it the landed objects stand */
export const DESK_CAM = { x: 0, y: 6.2, z: 20.5 };
export const DESK_LOOK_Y = -0.6;
export const LAND_DIST = 17;

/**
 * The landed objects, placed where the reference has its props.
 * x = centre across, y = where the object touches the desk, h = object height; all fractions of the frame.
 */
export type DeskSlot = { kind: string; x: number; y: number; h: number };
export const SLOTS_DESKTOP: DeskSlot[] = [
  { kind: 'laptop', x: 0.63, y: 0.72, h: 0.3 }, // the gift box + card
  { kind: 'headphones', x: 0.83, y: 0.5, h: 0.27 }, // the dumbbells
  { kind: 'mug', x: 0.36, y: 0.8, h: 0.22 }, // left climbing hold
  { kind: 'clipboard', x: 0.77, y: 0.9, h: 0.26 }, // right climbing hold
  { kind: 'stickyYellow', x: 0.94, y: 0.74, h: 0.18 }, // the jump rope
  { kind: 'phone', x: 0.54, y: 0.97, h: 0.26 }, // the phone
  { kind: 'sketchbook', x: 0.41, y: 1.06, h: 0.26 }, // the strap (cut by the bottom edge)
];
export const SLOTS_MOBILE: DeskSlot[] = [
  { kind: 'laptop', x: 0.62, y: 0.66, h: 0.15 },
  { kind: 'headphones', x: 0.84, y: 0.52, h: 0.12 },
  { kind: 'mug', x: 0.28, y: 0.8, h: 0.11 },
  { kind: 'phone', x: 0.56, y: 0.9, h: 0.13 },
  { kind: 'clipboard', x: 0.86, y: 0.82, h: 0.13 },
];
