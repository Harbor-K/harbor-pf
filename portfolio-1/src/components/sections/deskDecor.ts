/**
 * Desk objects that carry Harbor's real work on them (drawn in the browser onto the keyed photos):
 *  - the yellow sticky pad: its scribble is erased and a real HMW question from the Trust Bank project is written on it;
 *  - the clipboard: its notes are erased and low-fi wireframe sketches are drawn on the paper.
 * Both are drawn in the photo's own perspective: text and drawings are mapped onto the paper's corners.
 * Coordinates are measured on the 1024x1024 source photos. `flipped` = the photo was mirrored first (so the
 * writing still reads the right way on the mirrored desk object).
 */

type Pt = [number, number];
/** corners in reading order: top-left, top-right, bottom-right, bottom-left */
type Quad = [Pt, Pt, Pt, Pt];
export type Decorator = (ctx: CanvasRenderingContext2D, flipped: boolean) => Promise<void> | void;

const INK_STICKY = 'rgba(38, 36, 44, 0.9)';
const INK_PEN = '#27306E';
const HAND = 'Caveat, "Kalam", "Comic Sans MS", cursive';

let seed = 11;
const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

const scaleQuad = (q: Quad, s: number): Quad => q.map((p) => [p[0] * s, p[1] * s]) as Quad;
const mirrorQuad = (q: Quad, W: number): Quad => {
  const m = (p: Pt): Pt => [W - p[0], p[1]];
  return [m(q[1]), m(q[0]), m(q[3]), m(q[2])];
};
const len = (a: Pt, b: Pt) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const lerpPt = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const shrink = (q: Quad, k: number): Quad => {
  const c: Pt = [(q[0][0] + q[1][0] + q[2][0] + q[3][0]) / 4, (q[0][1] + q[1][1] + q[2][1] + q[3][1]) / 4];
  return q.map((p) => lerpPt(p, c, k)) as Quad;
};

/** map a uw x uh drawing box onto the quad (affine: top-left, top-right and bottom-left corners) */
function toQuad(ctx: CanvasRenderingContext2D, q: Quad, uw: number, uh: number) {
  const [tl, tr, , bl] = q;
  ctx.setTransform((tr[0] - tl[0]) / uw, (tr[1] - tl[1]) / uw, (bl[0] - tl[0]) / uh, (bl[1] - tl[1]) / uh, tl[0], tl[1]);
}

/**
 * Erase dark ink inside a polygon: a pixel much darker than the lightest pixel around it (and not too colourful,
 * so paper shading and folds stay) is ink; ink (grown by 2px) is refilled with the average paper colour around it.
 */
function eraseInk(ctx: CanvasRenderingContext2D, poly: Pt[], r: number, minDrop: number, maxSat: number) {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  const xs = poly.map((p) => p[0]);
  const ys = poly.map((p) => p[1]);
  const x0 = Math.max(0, Math.floor(Math.min(...xs)) - r);
  const y0 = Math.max(0, Math.floor(Math.min(...ys)) - r);
  const x1 = Math.min(W, Math.ceil(Math.max(...xs)) + r);
  const y1 = Math.min(H, Math.ceil(Math.max(...ys)) + r);
  const w = x1 - x0;
  const h = y1 - y0;
  if (w <= 0 || h <= 0) return;
  const img = ctx.getImageData(x0, y0, w, h);
  const d = img.data;
  const n = w * h;
  const L = new Float32Array(n);
  for (let i = 0; i < n; i++) L[i] = d[i * 4 + 3] < 200 ? 0 : 0.3 * d[i * 4] + 0.59 * d[i * 4 + 1] + 0.11 * d[i * 4 + 2];
  // lightest pixel nearby (separable: rows, then columns)
  const hIdx = new Int32Array(n);
  for (let y = 0; y < h; y++) {
    const row = y * w;
    for (let x = 0; x < w; x++) {
      let best = row + x;
      let bl = -1;
      const a = Math.max(0, x - r);
      const b = Math.min(w - 1, x + r);
      for (let k = a; k <= b; k++) {
        const v = L[row + k];
        if (v > bl) {
          bl = v;
          best = row + k;
        }
      }
      hIdx[row + x] = best;
    }
  }
  const vIdx = new Int32Array(n);
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      let best = hIdx[y * w + x];
      let bl = -1;
      const a = Math.max(0, y - r);
      const b = Math.min(h - 1, y + r);
      for (let k = a; k <= b; k++) {
        const j = hIdx[k * w + x];
        if (L[j] > bl) {
          bl = L[j];
          best = j;
        }
      }
      vIdx[y * w + x] = best;
    }
  }
  const mc = document.createElement('canvas');
  mc.width = w;
  mc.height = h;
  const mx = mc.getContext('2d')!;
  mx.beginPath();
  poly.forEach((p, i) => (i ? mx.lineTo(p[0] - x0, p[1] - y0) : mx.moveTo(p[0] - x0, p[1] - y0)));
  mx.closePath();
  mx.fill();
  const m = mx.getImageData(0, 0, w, h).data;
  // 1. ink = inside the polygon, clearly darker than the lightest pixel nearby, not too colourful
  const ink = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    if (m[i * 4 + 3] < 128 || d[i * 4 + 3] < 200) continue;
    if (L[vIdx[i]] - L[i] < minDrop) continue;
    const r0 = d[i * 4];
    const g0 = d[i * 4 + 1];
    const b0 = d[i * 4 + 2];
    if (Math.max(r0, g0, b0) - Math.min(r0, g0, b0) > maxSat) continue;
    ink[i] = 1;
  }
  // 2. grow it by 2px so the soft edges of the strokes go too
  const grown = new Uint8Array(n);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!ink[y * w + x]) continue;
      for (let dy = -2; dy <= 2; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= h) continue;
        for (let dx = -2; dx <= 2; dx++) {
          const xx = x + dx;
          if (xx >= 0 && xx < w && m[(yy * w + xx) * 4 + 3] >= 128) grown[yy * w + xx] = 1;
        }
      }
    }
  }
  // 3. fill each ink pixel with the average of the paper around it (summed-area tables of the non-ink pixels)
  const W1 = w + 1;
  const sR = new Float64Array(W1 * (h + 1));
  const sG = new Float64Array(W1 * (h + 1));
  const sB = new Float64Array(W1 * (h + 1));
  const sC = new Float64Array(W1 * (h + 1));
  for (let y = 0; y < h; y++) {
    let rR = 0;
    let rG = 0;
    let rB = 0;
    let rC = 0;
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (!grown[i] && d[i * 4 + 3] >= 200) {
        rR += d[i * 4];
        rG += d[i * 4 + 1];
        rB += d[i * 4 + 2];
        rC += 1;
      }
      const o = (y + 1) * W1 + x + 1;
      sR[o] = sR[o - W1] + rR;
      sG[o] = sG[o - W1] + rG;
      sB[o] = sB[o - W1] + rB;
      sC[o] = sC[o - W1] + rC;
    }
  }
  const R = Math.round(r * 1.6);
  const area = (s: Float64Array, ax: number, ay: number, bx: number, by: number) => s[by * W1 + bx] - s[ay * W1 + bx] - s[by * W1 + ax] + s[ay * W1 + ax];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (!grown[i]) continue;
      const ax = Math.max(0, x - R);
      const ay = Math.max(0, y - R);
      const bx = Math.min(w, x + R + 1);
      const by = Math.min(h, y + R + 1);
      const c = area(sC, ax, ay, bx, by);
      if (c < 4) continue;
      d[i * 4] = area(sR, ax, ay, bx, by) / c;
      d[i * 4 + 1] = area(sG, ax, ay, bx, by) / c;
      d[i * 4 + 2] = area(sB, ax, ay, bx, by) / c;
    }
  }
  ctx.putImageData(img, x0, y0);
}

async function fontsReady() {
  try {
    await Promise.race([document.fonts.load('500 100px Caveat'), new Promise((r) => setTimeout(r, 1500))]);
  } catch {
    /* fall back to the next font in the stack */
  }
}

/* ---------- hand-drawn strokes ---------- */
function rough(ctx: CanvasRenderingContext2D, pts: Pt[], wob: number, passes = 2) {
  for (let p = 0; p < passes; p++) {
    ctx.beginPath();
    pts.forEach((pt, i) => {
      const x = pt[0] + (rnd() - 0.5) * wob;
      const y = pt[1] + (rnd() - 0.5) * wob;
      if (i) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
    });
    ctx.stroke();
  }
}
function line(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, wob = 6) {
  rough(ctx, [[x1, y1], [(x1 + x2) / 2 + (rnd() - 0.5) * wob, (y1 + y2) / 2 + (rnd() - 0.5) * wob], [x2, y2]], wob);
}
function box(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, wob = 6) {
  rough(ctx, [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y + 2]], wob);
}
function rbox(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  for (let p = 0; p < 2; p++) {
    const j = (rnd() - 0.5) * 6;
    ctx.beginPath();
    ctx.roundRect(x + j, y - j, w, h, r);
    ctx.stroke();
  }
}
function circle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 0.95, rnd() * 0.5, 0.15, Math.PI * 2 + 0.3);
  ctx.stroke();
}
function arrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
  line(ctx, x1, y1, x2, y2, 5);
  const a = Math.atan2(y2 - y1, x2 - x1);
  line(ctx, x2, y2, x2 - 34 * Math.cos(a - 0.5), y2 - 34 * Math.sin(a - 0.5), 3);
  line(ctx, x2, y2, x2 - 34 * Math.cos(a + 0.5), y2 - 34 * Math.sin(a + 0.5), 3);
}

/* ---------- sticky pad: a real HMW question (Trust Bank, HMW 1) ---------- */
// top face of the pad on the 1024px photo: back, right, front, left corners
const STICKY_TOP: Quad = [
  [435, 212],
  [950, 379],
  [624, 667],
  [71, 495],
];
export const stickyHMW: Decorator = async (ctx, flipped) => {
  const W = ctx.canvas.width;
  let q = scaleQuad(STICKY_TOP, W / 1024);
  if (flipped) q = mirrorQuad(q, W);
  eraseInk(ctx, shrink(q, 0.02), Math.round((10 * W) / 1024), 26, 80);
  await fontsReady();
  const uh = (1000 * len(q[0], q[3])) / len(q[0], q[1]);
  ctx.save();
  toQuad(ctx, q, 1000, uh);
  ctx.fillStyle = INK_STICKY;
  ctx.font = `500 132px ${HAND}`;
  ctx.textBaseline = 'alphabetic';
  // three lines on the flat part of the sheet, clear of the curled corner
  const lines = ['HMW show the', 'right reward just', 'before they buy?'];
  lines.forEach((t, i) => {
    ctx.save();
    ctx.translate(80 + i * 6, 160 + i * 138);
    ctx.rotate(-0.015 + i * 0.01);
    ctx.fillText(t, 0, 0, 820);
    ctx.restore();
  });
  // a quick underline under "HMW"
  ctx.strokeStyle = INK_STICKY;
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  line(ctx, 82, 182, 272, 178, 4);
  ctx.restore();
};

/* ---------- clipboard: low-fi wireframe sketches ---------- */
// the paper on the 1024px photo: top-left, top-right, bottom-right, bottom-left
const CLIP_PAPER: Quad = [
  [326, 192],
  [694, 184],
  [703, 812],
  [326, 840],
];
const CLIP_TOP = 0.085; // the metal clip covers the paper above this fraction

function phoneA(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  rbox(ctx, x, y, w, h, 46);
  line(ctx, x + w * 0.36, y + 34, x + w * 0.64, y + 34, 3); // notch
  box(ctx, x + 34, y + 78, w - 68, 64); // header bar
  circle(ctx, x + 70, y + 110, 18);
  box(ctx, x + 34, y + 176, w - 68, 190); // image card
  line(ctx, x + 34, y + 176, x + w - 34, y + 366, 5);
  line(ctx, x + w - 34, y + 176, x + 34, y + 366, 5);
  line(ctx, x + 34, y + 410, x + w - 60, y + 410);
  line(ctx, x + 34, y + 452, x + w - 120, y + 452);
  line(ctx, x + 34, y + 494, x + w - 90, y + 494);
  rbox(ctx, x + 56, y + h - 120, w - 112, 66, 33); // button
}
function phoneB(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  rbox(ctx, x, y, w, h, 46);
  line(ctx, x + w * 0.36, y + 34, x + w * 0.64, y + 34, 3);
  line(ctx, x + 34, y + 104, x + w * 0.62, y + 104); // title
  for (let i = 0; i < 4; i++) {
    const ry = y + 160 + i * 112;
    box(ctx, x + 34, ry, 74, 74);
    line(ctx, x + 132, ry + 20, x + w - 40, ry + 20);
    line(ctx, x + 132, ry + 56, x + w - 110, ry + 56);
  }
  line(ctx, x + 20, y + h - 96, x + w - 20, y + h - 96, 4); // tab bar
  for (let i = 0; i < 4; i++) circle(ctx, x + 64 + i * ((w - 128) / 3), y + h - 50, 14);
}

export const clipboardLowFi: Decorator = async (ctx, flipped) => {
  const W = ctx.canvas.width;
  let q = scaleQuad(CLIP_PAPER, W / 1024);
  if (flipped) q = mirrorQuad(q, W);
  const below: Quad = [lerpPt(q[0], q[3], CLIP_TOP), lerpPt(q[1], q[2], CLIP_TOP), q[2], q[3]];
  eraseInk(ctx, shrink(below, 0.015), Math.round((10 * W) / 1024), 34, 255);
  await fontsReady();
  const uh = (1000 * len(q[0], q[3])) / len(q[0], q[1]);
  ctx.save();
  toQuad(ctx, q, 1000, uh);
  ctx.strokeStyle = INK_PEN;
  ctx.fillStyle = INK_PEN;
  ctx.lineWidth = 11;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.font = `500 112px ${HAND}`;
  ctx.fillText('Low-fi  ·  Rewards', 80, 290, 840);
  line(ctx, 80, 318, 560, 312, 4);
  phoneA(ctx, 80, 400, 370, 700);
  phoneB(ctx, 550, 400, 370, 700);
  arrow(ctx, 462, 760, 540, 760);
  // flow
  ctx.font = `500 84px ${HAND}`;
  const flow = ['Home', 'Rewards', 'Coupon'];
  flow.forEach((t, i) => {
    const bx = 60 + i * 316;
    box(ctx, bx, 1230, 250, 130);
    ctx.fillText(t, bx + 26, 1320, 200);
    if (i < 2) arrow(ctx, bx + 262, 1295, bx + 308, 1295);
  });
  ctx.font = `500 96px ${HAND}`;
  ctx.fillText('test with 6 users ✓', 90, 1520, 820);
  ctx.restore();
};

export const DESK_DECOR: Record<string, Decorator> = {
  stickyYellow: stickyHMW,
  clipboard: clipboardLowFi,
};
