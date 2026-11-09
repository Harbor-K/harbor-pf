import React, { useEffect, useRef, useState } from 'react';

/**
 * Intro before the home hero, after Jitter's "Morph: Shape To Text" (played in the order of Harbor's reference clip).
 *  1. Flat: "I observe objectively / to design clearly." glows on a navy/purple radial background while light
 *     rings pulse out from the centre.
 *  2. The background drops to black and the type grows a long 3D extrusion (pink near the letters, periwinkle
 *     at the back, narrowing toward a vanishing point below).
 *  3. Hand-off: the extrusion shortens and turns the hero's cobalt while the overlay fades, so the type lands
 *     on the hero's own 3D headline (same lines, same width, same centre). `intro:done` fires at that moment and
 *     the hero answers with a small camera settle and its objects popping in around the title.
 * Click, key or wheel skips to the hand-off. prefers-reduced-motion: no intro.
 */

const FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';
const FACE = '#F1EEFF';
const EXT_NEAR = [255, 95, 191]; // pink
const EXT_FAR = [111, 124, 255]; // periwinkle
const HERO_NEAR = [26, 43, 166]; // hero headline side #1A2BA6
const HERO_FAR = [18, 28, 120]; // #121C78
const BG = 'radial-gradient(ellipse 70% 75% at 50% 50%, #05061A 0%, #0B1258 42%, #2A1B78 72%, #4A2390 88%, #1A0B33 100%)';
const DEPTH = 44;

// timeline (seconds)
const T_FLAT = 1.35; // flat glowing type with ring pulses
const T_BLACK = 0.4; // background drops to black
const T_GROW = 0.75; // extrusion grows
const T_HOLD = 0.35;
const T_HAND = 0.7; // settles onto the hero and fades
const T_START_GROW = T_FLAT + 0.2;
const T_START_HAND = T_START_GROW + T_GROW + T_HOLD;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const outCubic = (t: number) => 1 - (1 - t) ** 3;
const inOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const backOut = (t: number, s = 1.4) => (t <= 0 ? 0 : t >= 1 ? 1 : 1 + (s + 1) * (t - 1) ** 3 + s * (t - 1) ** 2);
const mixRGB = (a: number[], b: number[], t: number) => a.map((v, i) => v + (b[i] - v) * t);
const css = (c: number[]) => `rgb(${c.map((v) => Math.round(v)).join(',')})`;

export function MorphIntro() {
  const [gone, setGone] = useState(false);
  const [lines] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 768 ? ['I observe', 'objectively to', 'design clearly.'] : ['I observe objectively', 'to design clearly.']
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const faceRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const ring1Ref = useRef<HTMLDivElement>(null);
  const ring2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.dispatchEvent(new Event('intro:done'));
      setGone(true);
      return;
    }
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = 'hidden';
    window.scrollTo(0, 0);

    const root = rootRef.current!;
    const bg = bgRef.current!;
    const stack = stackRef.current!;
    const face = faceRef.current!;
    const r1 = ring1Ref.current!;
    const r2 = ring2Ref.current!;
    const copies = Array.from(stack.querySelectorAll('[data-copy]')) as HTMLElement[];

    // same size as the hero's 3D headline: widest line = 74% of the screen (92% on phones)
    const fit = () => {
      const m = measureRef.current!;
      const widest = Math.max(...Array.from(m.children).map((c) => (c as HTMLElement).getBoundingClientRect().width), 1);
      const target = window.innerWidth * (window.innerWidth < 768 ? 0.92 : 0.74);
      stack.style.setProperty('--fs', `${(100 * target) / widest}px`);
      return (100 * target) / widest;
    };
    let fs = fit();
    const onResize = () => (fs = fit());
    window.addEventListener('resize', onResize);

    let raf = 0;
    let t0 = performance.now();
    let fired = false;
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      html.style.overflow = prevOverflow;
      setGone(true);
    };
    const skip = () => {
      const now = performance.now();
      if ((now - t0) / 1000 < T_START_HAND) t0 = now - T_START_HAND * 1000;
    };
    const ring = (el: HTMLElement, p: number, fade: number) => {
      el.style.transform = `translate(-50%, -50%) scale(${(0.3 + 2.2 * outCubic(p)).toFixed(3)})`;
      el.style.opacity = String(p <= 0 || p >= 1 ? 0 : Math.sin(Math.PI * p) * 0.9 * fade);
    };

    const step = (now: number) => {
      const t = (now - t0) / 1000;

      // 1. flat type, glowing, rings pulsing on the navy/purple field
      const black = clamp01((t - T_FLAT) / T_BLACK);
      bg.style.opacity = String(1 - outCubic(black));
      ring(r1, clamp01(t / 1.1), 1 - black);
      ring(r2, clamp01((t - 0.55) / 1.1), 1 - black);
      const glow = 1 - black;
      face.style.textShadow = `0 0 ${(26 * glow).toFixed(1)}px rgba(190,170,255,${(0.7 * glow).toFixed(2)})`;

      // 2. extrusion grows, the type lifts and swells a little
      const grow = outCubic(clamp01((t - T_START_GROW) / T_GROW));
      // 3. hand-off: extrusion shortens and turns cobalt, type returns to the hero's size and place
      const hand = inOut(clamp01((t - T_START_HAND) / T_HAND));
      const depth = grow * (1 - 0.88 * hand);
      const lift = backOut(clamp01((t - T_START_GROW) / T_GROW)) * (1 - hand);
      stack.style.transform = `translate3d(0, ${(-fs * 0.32 * lift).toFixed(1)}px, 0) scale(${(1 + 0.12 * lift).toFixed(4)})`;
      const unit = fs * 0.017; // one layer step; the whole extrusion is about one letter-height long
      copies.forEach((el) => {
        const i = Number(el.dataset.i);
        const k = (i - 1) / (DEPTH - 1);
        el.style.transform = `translate3d(0, ${(depth * i * unit).toFixed(2)}px, 0) scale(${(1 - depth * i * 0.0045).toFixed(4)})`;
        el.style.color = css(mixRGB(mixRGB(EXT_NEAR, EXT_FAR, k), mixRGB(HERO_NEAR, HERO_FAR, k), hand));
        el.style.opacity = depth < 0.002 ? '0' : '1';
      });

      if (!fired && t >= T_START_HAND) {
        fired = true;
        window.dispatchEvent(new Event('intro:done'));
      }
      root.style.opacity = String(1 - clamp01((t - T_START_HAND - T_HAND * 0.25) / (T_HAND * 0.75)));
      if (t >= T_START_HAND + T_HAND) return finish();
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    window.addEventListener('pointerdown', skip);
    window.addEventListener('keydown', skip);
    window.addEventListener('wheel', skip, { passive: true });
    window.addEventListener('touchmove', skip, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointerdown', skip);
      window.removeEventListener('keydown', skip);
      window.removeEventListener('wheel', skip);
      window.removeEventListener('touchmove', skip);
      html.style.overflow = prevOverflow;
      if (!fired) window.dispatchEvent(new Event('intro:done'));
    };
  }, []);

  if (gone) return null;

  const type = (color: string, extra?: React.CSSProperties) => (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center text-center font-bold"
      style={{ color, fontFamily: FONT, fontSize: 'var(--fs, 72px)', lineHeight: 1.18, letterSpacing: '-0.01em', whiteSpace: 'nowrap', ...extra }}
    >
      {lines.map((l) => (
        <div key={l}>{l}</div>
      ))}
    </div>
  );

  return (
    <div ref={rootRef} className="fixed inset-0 z-[100] overflow-hidden bg-black" aria-hidden="true">
      <div ref={bgRef} className="absolute inset-0" style={{ backgroundImage: BG }} />
      {[ring1Ref, ring2Ref].map((r, i) => (
        <div
          key={i}
          ref={r}
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: '70vmax',
            height: '70vmax',
            opacity: 0,
            background: 'radial-gradient(circle, transparent 52%, rgba(150,110,255,0.5) 62%, rgba(255,95,191,0.22) 68%, transparent 74%)',
          }}
        />
      ))}

      {/* measures the lines at 100px so the type can be sized to the hero headline */}
      <div ref={measureRef} className="pointer-events-none absolute left-0 top-0 font-bold" style={{ visibility: 'hidden', fontFamily: FONT, fontSize: 100, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
        {lines.map((l) => (
          <span key={l} style={{ display: 'inline-block' }}>
            {l}
          </span>
        ))}
      </div>

      <div ref={stackRef} className="absolute inset-0 will-change-transform" style={{ transformOrigin: '50% 50%' }}>
        {/* extrusion: deepest copy first so the nearer ones sit on top */}
        {Array.from({ length: DEPTH }, (_, k) => DEPTH - k).map((i) => (
          <div key={i} data-copy data-i={i} className="absolute inset-0 will-change-transform" style={{ zIndex: DEPTH - i + 1, transformOrigin: '50% 120%', opacity: 0, color: css(EXT_NEAR) }}>
            {type('inherit')}
          </div>
        ))}
        <div ref={faceRef} className="absolute inset-0" style={{ zIndex: DEPTH + 2 }}>
          {type(FACE)}
        </div>
      </div>
      <h2 className="sr-only">I observe objectively to design clearly.</h2>
    </div>
  );
}
