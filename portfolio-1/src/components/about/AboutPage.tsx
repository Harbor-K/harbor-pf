import React, { useEffect, useRef, useState } from 'react';
import { BOOK_CALL_URL } from '../../data/content';
import { HomeDock } from '../HomeDock';
import { Contact } from '../sections/Contact';
import { WhatIDo } from '../sections/WhatIDo';

const INK = '#0A0A0A';
const HAIRLINE = 'rgba(10,10,10,0.12)';
const BASE = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/';

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

// --- Section 2: statement with a collage that assembles around it ---
// (section 1 is now the About me + Kim LLM section, moved here from the home page; WhatIDo.tsx)
// (the "ABOUT ME" title was removed at Harbor's request; the header already shows "About me" as active)

const STATEMENT = "I'm an AI-native product designer who owns the work end to end, from finding the problem to shipping the fix.";
const WORDS = STATEMENT.split(' ');

// A short load-in plays up to this point and scrolling covers the rest at the reference's speed.
const INTRO_P = 0.28;
const INTRO_MS = 1400;

const COLLAGE_CENTER = 1749;
const COLLAGE_REACH = 425;
const COLLAGE = [
  { src: 'trust-bank/workshop-2.jpg', w: 129, h: 96, left: 532, top: 1465, pos: '40% 50%', strip: 0 },
  { src: 'about/drawing-9.jpg', w: 62, h: 52, left: 99, top: 1737, pos: '50% 50%', strip: 1 },
  { src: 'about/drawing-3.jpg', w: 72, h: 62, left: 570, top: 1914, pos: '50% 50%', strip: 1 },
  { src: 'about/drawing-8.jpg', w: 97, h: 103, left: 1149, top: 1375, pos: '50% 50%', strip: 0 },
  { src: 'about/film-places.jpg', w: 72, h: 52, left: 1472, top: 1324, pos: '50% 50%', strip: 0 },
  { src: 'portrait/harbor-portrait-bw.webp', w: 153, h: 173, left: 1353, top: 1515, pos: '50% 30%', strip: 1 },
  { src: 'trust-bank/takeaway.jpg', w: 141, h: 128, left: 629, top: 1365, pos: '58% 40%', strip: 0 },
  { src: 'about/film-fineart.jpg', w: 110, h: 140, left: -23, top: 1514, pos: '47% 50%', strip: 1 },
  { src: 'main-v2/desk-coin-poster.jpg', w: 125, h: 114, left: 195, top: 1914, pos: '50% 50%', strip: 1 },
  { src: 'trust-bank/define-photo.jpg', w: 183, h: 159, left: 1250, top: 1955, pos: '50% 50%', strip: 1 },
  { src: 'about/film-fintech.jpg', w: 108, h: 130, left: 1056, top: 2030, pos: '50% 40%', strip: 1 },
];

function CollageSection() {
  const compact = useCompact();
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const statementRef = useRef<HTMLParagraphElement>(null);
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
      const e = easeOutCubic(clamp((p - (0.1 + 0.06 * i)) / 0.28, 0, 1));
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

  const photo = (ph: (typeof COLLAGE)[number], i: number, scale: number, absolute: boolean) => (
    <img
      key={ph.src}
      ref={(el) => {
        photoRefs.current[i] = el;
      }}
      src={`${BASE}${ph.src}`}
      alt=""
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
              {COLLAGE.map((ph, i) => (ph.strip === 0 ? photo(ph, i, 0.62, false) : null))}
            </div>
            <p className="font-inter-tight display-tight max-w-[520px] text-center text-[28px] leading-[1.15]">{statementText}</p>
            <div className="flex flex-wrap items-start justify-center gap-[10px]">
              {COLLAGE.map((ph, i) => (ph.strip === 1 ? photo(ph, i, 0.62, false) : null))}
            </div>
          </div>
        ) : (
          <div ref={canvasRef} className="absolute top-0" style={{ width: CANVAS_W, transformOrigin: '0 0' }}>
            {COLLAGE.map((ph, i) => photo(ph, i, 1, true))}
            <p
              ref={statementRef}
              className="font-inter-tight display-tight absolute z-[1] text-center text-[32px] leading-[1.15]"
              style={{ left: 496, width: 520, transform: 'translateY(-50%)' }}
            >
              {statementText}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

// --- Section 3: one photo grows, hands over to a second, captions change with it ---

const WINDOW_COPY = {
  label: 'A window into my work',
  first: { credit: 'Where I started', note: 'I started in Fine Art, drawing what I saw.' },
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
const COMPACT_NOTES_H = 140;

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
              <div ref={tallRef} className="absolute overflow-hidden rounded-[8px]" style={{ opacity: 0 }}>
                <img
                  ref={tallImgRef}
                  src={`${BASE}main-v2/about-photo.webp`}
                  alt="Harbor Kim sorting sticky notes on a research wall"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover will-change-transform"
                  style={{ objectPosition: '40% 40%' }}
                />
              </div>
              <div ref={sideRef} className="absolute overflow-hidden rounded-[8px]">
                <img
                  ref={sideImgRef}
                  src={`${BASE}about/drawing-1.jpg`}
                  alt="Harbor's pencil drawing of a winged statue, held up outdoors"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover will-change-transform"
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

function CalEmbed() {
  useEffect(() => {
    loadCal();
    const Cal = (window as any).Cal;
    Cal('init', '30min', { origin: 'https://cal.com' });
    Cal.ns['30min']('inline', {
      elementOrSelector: '#harbor-cal-inline',
      config: { layout: 'month_view', theme: 'light' },
      calLink: BOOK_CALL_URL.replace('https://cal.com/', ''),
    });
    Cal.ns['30min']('ui', { hideEventTypeDetails: false, layout: 'month_view', theme: 'light' });
  }, []);

  return (
    <div className="mx-auto max-w-[1000px] px-6">
      <h2 className="text-[26px] md:text-[30px] leading-[1.2] font-bold">Want to talk? Book a call with me</h2>
      <p className="mt-[16px] text-[18px] leading-[1.6] text-[#333]">Pick a time for a 30-minute chat.</p>
      <div id="harbor-cal-inline" className="mt-[30px] w-full overflow-hidden rounded-[20px]" style={{ minHeight: 480 }} />
      <div className="mt-[20px] flex justify-end">
        <a href={BOOK_CALL_URL} target="_blank" rel="noopener noreferrer" className="inline-block text-[16px] underline underline-offset-4">
          Open the booking page
        </a>
      </div>
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
      {/* section 1: About me + Kim LLM (moved here from the home page) */}
      <WhatIDo />
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
