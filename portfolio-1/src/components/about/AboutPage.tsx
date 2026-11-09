import React, { useEffect, useRef, useState } from 'react';
import { BOOK_CALL_URL } from '../../data/content';
import { HomeDock } from '../HomeDock';
import { Contact } from '../sections/Contact';

const INK = '#0A0A0A';
const MUTED = '#6B6B70';
const HAIRLINE = 'rgba(10,10,10,0.12)';
// Harbor's own photos from her Figma ("44기 김지현 4차 PF", About frames), hosted in Harbor-K/harbor-pf (pinned to the commit
// that added them, so they never point at a cached older copy)
const PHOTOS = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/6a56c6411f5a62474ed739e5fb9b361e0733428b/assets/about/v2/';

// Layout numbers are in a 1512px-wide canvas, scaled down below 1512 like the reference (creative.inc).
const CANVAS_W = 1512;
const DESKTOP_MIN = 1200;
const PIN_LEN = 1600;
const HEADER_CLEAR = 64; // keeps pinned content under the fixed HomeDock

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutQuint = (t: number) => (t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2);
const canvasScale = () => {
  const w = document.documentElement.clientWidth;
  return w >= CANVAS_W ? 1 : w / CANVAS_W;
};
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function useCompact() {
  const [compact, setCompact] = useState(() => document.documentElement.clientWidth < DESKTOP_MIN);
  useEffect(() => {
    const on = () => setCompact(document.documentElement.clientWidth < DESKTOP_MIN);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return compact;
}

function useFrame(run: () => void, dep: unknown) {
  const latest = useRef(run);
  latest.current = run;
  useEffect(() => {
    let raf = 0;
    const on = () => {
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0;
          latest.current();
        });
      }
    };
    latest.current();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => {
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [dep]);
}

// --- Section 1: statement with a collage that assembles around it ---
// (the About me + Kim LLM section that sat above this was removed at Harbor's request; Kim LLM lives in the footer)
// (the "ABOUT ME" title was removed at Harbor's request; the header already shows "About me" as active)

const STATEMENT = "I'm an AI-native product designer who owns the work end to end, from finding the problem to shipping the fix.";
const WORDS = STATEMENT.split(' ');
// Harbor's note (Figma, in red): she loves travelling and drawing the places she goes. PLACEHOLDER wording for her review.
const STATEMENT_AFTER = 'Off the clock, I travel and sketch the places I visit.';

// With nothing above this section, starting at p = 0 would open on an empty page,
// so a short load-in plays up to this point and scrolling covers the rest at the reference's speed.
const INTRO_P = 0.28;
const INTRO_MS = 1400;

/**
 * The collage: Harbor's travel photos and on-the-spot sketches (her Figma frame), balanced around the statement.
 * Sizes come in three steps (large ~240, medium ~200, small ~152 on the long side) instead of nine different sizes,
 * so the collage reads as one calm set; the left and right sides carry about the same weight, the cafe photo
 * crowns the statement and the sketch held up on site sits right under the line about sketching (they belong together).
 * Positions are in the 1512 canvas; `top` is measured against COLLAGE_CENTER (the statement's centre).
 */
const COLLAGE_CENTER = 1749;
const COLLAGE_REACH = 425;
const C = COLLAGE_CENTER;
const COLLAGE = [
  { src: 'cafe-laptop.jpg', w: 270, h: 180, left: 621, top: C - 340, pos: '50% 45%', strip: 0, alt: 'Harbor working on her laptop in a cafe' },
  { src: 'trafalgar-fountain.jpg', w: 150, h: 200, left: 140, top: C - 300, pos: '50% 60%', strip: 0, alt: 'Harbor at the Trafalgar Square fountains at dusk' },
  { src: 'seven-sisters.jpg', w: 152, h: 114, left: 1040, top: C - 340, pos: '50% 50%', strip: 0, alt: 'Harbor on the cliffs by the sea' },
  { src: 'trafalgar-night.jpg', w: 114, h: 152, left: 1290, top: C - 390, pos: '50% 50%', strip: 0, alt: "Harbor under Nelson's Column at night" },
  { src: 'sydney-harbour.jpg', w: 200, h: 150, left: 1160, top: C - 150, pos: '50% 50%', strip: 0, alt: 'Harbor by Sydney Harbour with the Opera House behind' },
  { src: 'afternoon-tea.jpg', w: 180, h: 240, left: 260, top: C + 10, pos: '50% 40%', strip: 1, alt: 'Harbor at afternoon tea' },
  { src: 'garden.jpg', w: 114, h: 152, left: 100, top: C + 150, pos: '50% 60%', strip: 1, alt: 'Harbor in a flower garden' },
  { src: 'sketch-on-site.jpg', w: 200, h: 150, left: 656, top: C + 140, pos: '50% 50%', strip: 1, alt: 'A sketch of a tree, held up where it was drawn' },
  { src: 'red-panda-drawing.jpg', w: 220, h: 220, left: 1100, top: C + 100, pos: '50% 50%', strip: 1, alt: "Harbor's drawing of two red pandas cuddling" },
];

function CollageSection() {
  const compact = useCompact();
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const statementRef = useRef<HTMLDivElement>(null);
  const afterRef = useRef<HTMLParagraphElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const photoRefs = useRef<(HTMLImageElement | null)[]>([]);
  const startedAt = useRef(performance.now());
  const reduce = useRef(prefersReducedMotion());

  const update = () => {
    const section = sectionRef.current;
    if (!section) return;
    const vh = window.innerHeight;
    const s = compact ? 1 : canvasScale();
    const len = reduce.current ? 0 : PIN_LEN * (1 - INTRO_P) * s;
    section.style.height = `${vh + len}px`;

    const scrolled = len ? clamp(-section.getBoundingClientRect().top / len, 0, 1) : 1;
    const intro = easeOutCubic(clamp((performance.now() - startedAt.current) / INTRO_MS, 0, 1));
    const p = reduce.current ? 1 : INTRO_P * intro + (1 - INTRO_P) * scrolled;

    const reveal = clamp((p - 0.02) / 0.42, 0, 1);
    wordRefs.current.forEach((w, i) => {
      if (w) w.style.opacity = String(0.4 + 0.6 * clamp(reveal * WORDS.length - i, 0, 1));
    });
    // the travel line lights up right after the statement has
    if (afterRef.current) afterRef.current.style.opacity = String(0.4 + 0.6 * clamp((reveal - 0.85) / 0.15, 0, 1));

    const canvas = canvasRef.current;
    let centerY = 0;
    let squeeze = 1;
    if (canvas && !compact) {
      const vw = document.documentElement.clientWidth;
      centerY = vh / (2 * s);
      squeeze = Math.min(1, (centerY - HEADER_CLEAR / s) / COLLAGE_REACH);
      canvas.style.left = `${(vw - CANVAS_W * s) / 2}px`;
      canvas.style.transform = `scale(${s})`;
      if (statementRef.current) statementRef.current.style.top = `${centerY}px`;
    }

    photoRefs.current.forEach((img, i) => {
      if (!img) return;
      const e = easeOutCubic(clamp((p - (0.1 + 0.05 * i)) / 0.28, 0, 1));
      img.style.opacity = String(e);
      img.style.transform = `translateY(${(1 - e) * 60}px) scale(${0.92 + 0.08 * e})`;
      if (!compact) img.style.top = `${centerY + (COLLAGE[i].top - COLLAGE_CENTER) * squeeze}px`;
    });
  };

  useFrame(update, compact);

  const latest = useRef(update);
  latest.current = update;
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      latest.current();
      if (performance.now() - startedAt.current < INTRO_MS) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const statementText = WORDS.map((word, i) => (
    <React.Fragment key={i}>
      <span
        ref={(el) => {
          wordRefs.current[i] = el;
        }}
        style={{ opacity: 0.4 }}
      >
        {word}
      </span>{' '}
    </React.Fragment>
  ));
  const afterLine = (cls: string) => (
    <p ref={afterRef} className={`mt-[20px] leading-[1.4] ${cls}`} style={{ color: MUTED, opacity: 0.4 }}>
      {STATEMENT_AFTER}
    </p>
  );

  const photo = (ph: (typeof COLLAGE)[number], i: number, scale: number, absolute: boolean) => (
    <img
      key={ph.src}
      ref={(el) => {
        photoRefs.current[i] = el;
      }}
      src={`${PHOTOS}${ph.src}`}
      alt={ph.alt}
      decoding="async"
      className="block rounded-[8px] object-cover will-change-transform"
      style={{
        width: ph.w * scale,
        height: ph.h * scale,
        objectPosition: ph.pos,
        opacity: 0,
        ...(absolute ? { position: 'absolute' as const, left: ph.left } : {}),
      }}
    />
  );

  return (
    <section ref={sectionRef} className="relative bg-white" style={{ height: '100vh' }} aria-label="About me">
      <div className="sticky top-0 h-screen overflow-hidden bg-white">
        {compact ? (
          <div className="flex h-full flex-col items-center justify-center gap-[24px] px-[16px] pb-[16px] pt-[120px]">
            <div className="flex flex-wrap items-end justify-center gap-[10px]">
              {COLLAGE.map((ph, i) => (ph.strip === 0 ? photo(ph, i, 0.5, false) : null))}
            </div>
            <div className="max-w-[520px] text-center">
              <p className="font-inter-tight display-tight text-[28px] leading-[1.15]">{statementText}</p>
              {afterLine('text-[18px]')}
            </div>
            <div className="flex flex-wrap items-start justify-center gap-[10px]">
              {COLLAGE.map((ph, i) => (ph.strip === 1 ? photo(ph, i, 0.5, false) : null))}
            </div>
          </div>
        ) : (
          <div ref={canvasRef} className="absolute top-0" style={{ width: CANVAS_W, transformOrigin: '0 0' }}>
            {COLLAGE.map((ph, i) => photo(ph, i, 1, true))}
            <div ref={statementRef} className="absolute z-[1] text-center" style={{ left: 496, width: 520, transform: 'translateY(-50%)' }}>
              <p className="font-inter-tight display-tight text-[32px] leading-[1.15]">{statementText}</p>
              {afterLine('text-[20px]')}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// --- Section 2: one photo grows, hands over to a second, captions change with it ---

// Captions are PLACEHOLDER wording for Harbor's review. The first note follows her Figma note (in red):
// she loved art, but wanted to make things more people can use, which is what brought her to UX.
const WINDOW_COPY = {
  label: 'A window into my work',
  first: { credit: 'Where I started', note: 'I started in Fine Art, painting what I saw. I loved it, but I wanted to make things everyone can use. That brought me to UX.' },
  second: { credit: 'What I do now', note: 'Now I design fintech products, end to end. I test everything with real people.' },
  statement: "I've spent 3+ years on fintech and e-learning: trading platforms, digital banking, crypto wallets and data dashboards.",
};

const BASE_W = 122;
const BASE_H = 176;
const FINAL_W = 480;
const FINAL_H = 695;
const SCENE_W = 1006;
const SCENE_LEFT = 354;
const SCENE_CX = 402;
const MAX_IMAGE_H = 1034;
const COMPACT_SCENE_TOP = 40;
const COMPACT_NOTES_H = 160;

function place(el: HTMLElement | null, left: number, top: number, width: number, height: number) {
  if (!el) return;
  el.style.left = `${left}px`;
  el.style.top = `${top}px`;
  el.style.width = `${width}px`;
  el.style.height = `${height}px`;
}

function fade(el: HTMLElement | null, amount: number, dist: number, max: number) {
  if (!el) return;
  const e = easeOutCubic(amount);
  el.style.opacity = String(e * max);
  el.style.transform = `translateY(${(1 - e) * dist}px)`;
}

function WindowSection() {
  const compact = useCompact();
  const pinRef = useRef<HTMLElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const sideRef = useRef<HTMLDivElement>(null);
  const tallRef = useRef<HTMLDivElement>(null);
  const sideImgRef = useRef<HTMLImageElement>(null);
  const tallImgRef = useRef<HTMLImageElement>(null);
  const credit1Ref = useRef<HTMLParagraphElement>(null);
  const note1Ref = useRef<HTMLParagraphElement>(null);
  const credit2Ref = useRef<HTMLParagraphElement>(null);
  const note2Ref = useRef<HTMLParagraphElement>(null);
  const statementRef = useRef<HTMLParagraphElement>(null);
  const reduce = useRef(prefersReducedMotion());

  useFrame(() => {
    const pin = pinRef.current;
    const wrap = wrapRef.current;
    const scene = sceneRef.current;
    if (!pin || !wrap || !scene) return;

    const vh = window.innerHeight;
    const vw = document.documentElement.clientWidth;
    const s = compact ? 1 : canvasScale();
    const len = reduce.current ? 0 : PIN_LEN * s;
    pin.style.height = `${vh + len}px`;
    const e = len ? clamp(-pin.getBoundingClientRect().top / len, 0, 1) : 1;

    const sceneW = compact ? vw - 32 : SCENE_W;
    const cx = compact ? sceneW / 2 : SCENE_CX;
    const a = compact
      ? Math.min(vh - HEADER_CLEAR - COMPACT_SCENE_TOP - COMPACT_NOTES_H, sceneW * 1.3)
      : Math.min((vh - HEADER_CLEAR - 20) / s, MAX_IMAGE_H);

    const canvasLeft = (vw - CANVAS_W * s) / 2;
    wrap.style.left = compact ? '16px' : `${canvasLeft}px`;
    wrap.style.transform = compact ? '' : `scale(${s})`;
    wrap.style.width = compact ? `${sceneW}px` : `${CANVAS_W}px`;
    if (labelRef.current) {
      labelRef.current.style.left = compact ? '0' : '20px';
      labelRef.current.style.fontSize = compact ? '17px' : `${Math.max(17, 16 / s)}px`;
    }
    scene.style.left = compact ? '0' : `${SCENE_LEFT}px`;
    scene.style.top = compact ? `${COMPACT_SCENE_TOP}px` : '0';
    scene.style.width = `${sceneW}px`;
    scene.style.height = compact ? `${a + COMPACT_NOTES_H}px` : `${a}px`;
    scene.style.overflow = compact ? 'hidden' : 'visible';
    if (sideRef.current) sideRef.current.style.zIndex = compact ? '1' : '2';
    if (tallRef.current) tallRef.current.style.zIndex = compact ? '2' : '1';

    const t = a / BASE_H;
    const n = a / FINAL_H;
    const grow = easeInOutQuint(clamp(e / 0.4, 0, 1));
    const swap = easeInOutQuint(clamp((e - 0.58) / 0.28, 0, 1));
    const l = 1 + (t - 1) * grow;
    const sideW = BASE_W * l;
    const sideH = BASE_H * l;
    const sideX = cx - (BASE_W / 2) * l;
    const finalW = FINAL_W * n;
    const finalX = cx - finalW / 2;
    const sideEndX = compact ? finalX : finalX - 142;

    place(sideRef.current, sideX + (sideEndX - sideX) * swap, (a - sideH) * (1 - swap), sideW + (BASE_W - sideW) * swap, sideH + (BASE_H - sideH) * swap);
    const u = easeInOutQuint(clamp(e / 0.44, 0, 1));
    if (sideImgRef.current) sideImgRef.current.style.transform = `scale(${1 + 0.35 * (1 - u)}) translateY(${-10 * (1 - u)}%)`;

    const pop = easeOutCubic(clamp((e - 0.16) / 0.24, 0, 1));
    const tallW = BASE_W * pop;
    const tallH = BASE_H * pop;
    const tallX = sideX + BASE_W * l + 20 + (BASE_W - tallW) / 2;
    if (tallRef.current) tallRef.current.style.opacity = String(Math.min(1, 4 * pop));
    place(tallRef.current, tallX + (finalX - tallX) * swap, (a - tallH) * (1 - swap), tallW + (finalW - tallW) * swap, tallH + (a - tallH) * swap);
    if (tallImgRef.current) tallImgRef.current.style.transform = `scale(${1 + 0.3 * (1 - swap)}) translateY(${-8 * (1 - swap)}%)`;

    const noteLeft = compact ? 0 : Math.max(SCENE_CX + (BASE_W / 2) * t, finalX + finalW) + 20;
    const noteWidth = compact ? sceneW : Math.max(0, Math.min(324, SCENE_W - noteLeft));
    const creditTop = compact ? a + 16 : 298;
    const noteSize = compact ? 18 : Math.max(18, 18 / s);
    const creditSize = compact ? 16 : Math.max(16, 16 / s);
    ([[credit1Ref.current, note1Ref.current], [credit2Ref.current, note2Ref.current]] as const).forEach(([credit, note]) => {
      if (!credit || !note) return;
      credit.style.left = note.style.left = `${noteLeft}px`;
      credit.style.width = note.style.width = `${noteWidth}px`;
      credit.style.fontSize = `${creditSize}px`;
      note.style.fontSize = `${noteSize}px`;
      credit.style.top = `${creditTop}px`;
      note.style.top = `${creditTop + Math.max(26, credit.offsetHeight + 8)}px`;
    });

    const first = clamp((e - 0.44) / 0.08, 0, 1) * (1 - clamp((e - 0.56) / 0.06, 0, 1));
    fade(credit1Ref.current, first, 16, 0.5);
    fade(note1Ref.current, first, 16, 1);
    const second = clamp((e - 0.86) / 0.12, 0, 1);
    fade(credit2Ref.current, second, 16, 0.5);
    fade(note2Ref.current, second, 16, 1);

    const statement = statementRef.current;
    if (statement) {
      statement.style.marginLeft = compact ? '16px' : `${canvasLeft + (SCENE_LEFT + finalX) * s}px`;
      statement.style.width = compact ? `${sceneW}px` : `${825 * s}px`;
      statement.style.fontSize = compact ? '28px' : `${Math.max(24, 32 * s)}px`;
    }
  }, compact);

  const caption = (ref: React.RefObject<HTMLParagraphElement>, text: string) => (
    <p ref={ref} className="absolute leading-[1.4]" style={{ opacity: 0 }}>
      {text}
    </p>
  );

  return (
    <>
      <section ref={pinRef} className="relative bg-white" style={{ height: '100vh' }}>
        <div className="sticky top-0 h-screen overflow-hidden bg-white">
          <div ref={wrapRef} className="absolute" style={{ top: HEADER_CLEAR, transformOrigin: '0 0' }}>
            <p ref={labelRef} className="absolute top-0 whitespace-nowrap leading-[24px] tracking-[-0.01em]">
              {WINDOW_COPY.label}
            </p>
            <div ref={sceneRef} className="absolute">
              {/* what she does now: the research wall (its frame is 0.69 wide, so the crop keeps her face and the notes) */}
              <div ref={tallRef} className="absolute overflow-hidden rounded-[8px]" style={{ opacity: 0 }}>
                <img
                  ref={tallImgRef}
                  src={`${PHOTOS}sticky-wall.jpg`}
                  alt="Harbor sorting sticky notes on a research wall"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover will-change-transform"
                  style={{ objectPosition: '30% 45%' }}
                />
              </div>
              {/* where she started: her Fine Art show (the photo has the frame's own 0.69 shape, so nothing is cut off) */}
              <div ref={sideRef} className="absolute overflow-hidden rounded-[8px]">
                <img
                  ref={sideImgRef}
                  src={`${PHOTOS}fineart-exhibition.jpg`}
                  alt="Harbor at her Fine Art exhibition, in front of her watercolour paintings"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover will-change-transform"
                  style={{ objectPosition: '50% 35%' }}
                />
              </div>
              {caption(credit1Ref, WINDOW_COPY.first.credit)}
              {caption(note1Ref, WINDOW_COPY.first.note)}
              {caption(credit2Ref, WINDOW_COPY.second.credit)}
              {caption(note2Ref, WINDOW_COPY.second.note)}
            </div>
          </div>
        </div>
      </section>

      <div className="bg-white pt-[44px] pb-[40px]">
        <p ref={statementRef} className="font-inter-tight display-tight leading-[1.15]">
          {WINDOW_COPY.statement}
        </p>
      </div>
    </>
  );
}

// --- Book a call ---

declare global {
  interface Window {
    Cal?: any;
  }
}

function loadCal() {
  const w = window as any;
  if (w.Cal) return;
  (function (C: any, A: string, L: string) {
    const p = function (a: any, ar: any) {
      a.q.push(ar);
    };
    const d = C.document;
    C.Cal =
      C.Cal ||
      function (...args: any[]) {
        const cal = C.Cal;
        const ar = args;
        if (!cal.loaded) {
          cal.ns = {};
          cal.q = cal.q || [];
          d.head.appendChild(d.createElement('script')).src = A;
          cal.loaded = true;
        }
        if (ar[0] === L) {
          const api: any = function (...a2: any[]) {
            p(api, a2);
          };
          const namespace = ar[1];
          api.q = api.q || [];
          if (typeof namespace === 'string') {
            cal.ns[namespace] = cal.ns[namespace] || api;
            p(cal.ns[namespace], ar);
            p(cal, ['initNamespace', namespace]);
          } else p(cal, ar);
          return;
        }
        p(cal, ar);
      };
  })(window, 'https://app.cal.com/embed/embed.js', 'init');
}

/**
 * The booking calendar, always on the page (the "Open the booking page" link was removed at Harbor's request).
 * Cal.com's inline embed draws it; if the embed has not put its calendar in within a few seconds (script blocked,
 * slow network, coming back to this page), the same booking page is shown in a plain frame instead, so the
 * calendar is always there.
 */
function CalEmbed() {
  const boxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const box = boxRef.current;
    try {
      loadCal();
      const Cal = (window as any).Cal;
      if (!Cal.ns?.['30min']) Cal('init', '30min', { origin: 'https://cal.com' });
      Cal.ns['30min']('inline', {
        elementOrSelector: '#harbor-cal-inline',
        config: { layout: 'month_view', theme: 'light' },
        calLink: BOOK_CALL_URL.replace('https://cal.com/', ''),
      });
      Cal.ns['30min']('ui', { hideEventTypeDetails: false, layout: 'month_view', theme: 'light' });
    } catch {
      /* the fallback below takes over */
    }
    const t = window.setTimeout(() => {
      if (!box || box.querySelector('iframe')) return;
      const f = document.createElement('iframe');
      f.src = `${BOOK_CALL_URL}?embed=true&layout=month_view&theme=light`;
      f.title = 'Book a 30-minute call with Harbor';
      f.style.cssText = 'display:block;width:100%;height:640px;border:0;';
      box.appendChild(f);
    }, 5000);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="mx-auto max-w-[1000px] px-6">
      <h2 className="text-[26px] md:text-[30px] leading-[1.2] font-bold">Want to talk? Book a call with me</h2>
      <p className="mt-[16px] text-[18px] leading-[1.6] text-[#333]">Pick a time for a 30-minute chat.</p>
      <div ref={boxRef} id="harbor-cal-inline" className="mt-[30px] w-full overflow-hidden rounded-[20px]" style={{ minHeight: 480 }} />
    </div>
  );
}

export function AboutPage(_props: { onClose?: () => void }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white" style={{ color: INK }}>
      <HomeDock />
      <CollageSection />
      <div style={{ height: 1, background: HAIRLINE, marginInline: 'max(20px, calc(50% - 736px))' }} aria-hidden />
      <WindowSection />
      <section className="bg-white pt-[120px] pb-[120px]">
        <CalEmbed />
      </section>
      <Contact />
    </div>
  );
}
