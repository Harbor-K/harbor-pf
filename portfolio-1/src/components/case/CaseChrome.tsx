import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion';
import { XIcon } from 'lucide-react';
import { CASE_ORDER } from './CaseNav';

/**
 * Case-study header and footer, the same as the "UX Case Study Page" design (its tb/scroll.tsx FloatingHeader
 * and PageA NextProject), so every Trust Bank page looks alike.
 * Header: at the very top the close button and Next · GameCove sit on the 1440 container edges;
 * once you scroll they slide out to the screen edges with a 20px margin and stay there.
 * Scrolling down tucks the whole header up out of view; scrolling up (or reaching the top) brings it back.
 * "Next · GameCove" scrolls down to the next-project panel.
 * Font: Helvetica Neue (the font-inter class is kept from the UX page but has no Inter here).
 * Dark sections: anything under the header inside an element with data-tone="dark" switches the header to
 * light-on-dark (white × on a translucent white circle, white Next pill), so it stays readable on dark heroes.
 *
 * Project to project (after alvinn.design's project pages, Harbor's reference clip), both ways, with no card:
 * the panel that comes in IS the other project's page (a live, non-interactive view of it).
 *  - Down, at the end of a case: the next project's page (its top) rises from below. The page above shrinks a
 *    little toward its bottom edge, gets rounded bottom corners and darkens. The panel grows to fill the screen;
 *    a little more scrolling and the site is on the next project, at its top.
 *  - Up, at the top of a case: keep scrolling up (or pull down on touch) and the previous project's page (its
 *    end) comes down from above while this page slides down, shrinks and darkens. Pull far enough and the site
 *    is on the previous project, at the same spot the view showed. Let go early and everything springs back.
 *  Hand-off without any pop (like Figma's smart animate): the live view stays on top of the new page, scrolling
 *  along with it, while the new page settles underneath (its own entrance animations, slideshows, images);
 *  then the view dissolves into it, so any small difference melts across instead of jumping.
 *  The live views are this site in iframes with ?embed=1, kept at body level (outside React) so the same view
 *  survives the page change. The embedded copy shows everything at once and loads no views of its own.
 *  The current header fades out as a panel reaches the top, since the panel shows the other page's header.
 *  Reduced motion: a plain next-project card, no auto-open, no pull.
 */

const HEADER_H = 82;
const CONTAINER = 1440;
const EDGE = 20;
const SPRING = { type: 'spring' as const, stiffness: 260, damping: 34 };
const HELV = '"Helvetica Neue", Helvetica, Arial, sans-serif';

export function CaseHeader({ onClose, nextName }: { onClose: () => void; nextName: string }) {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const [atTop, setAtTop] = useState(true);
  const [edge, setEdge] = useState(EDGE);
  const [hidden, setHidden] = useState(false);
  const [dark, setDark] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  // what sits under the header? (skip the header itself)
  const checkTone = () => {
    const hit = document
      .elementsFromPoint(window.innerWidth / 2, HEADER_H / 2)
      .find((el) => !headerRef.current?.contains(el));
    setDark(!!hit?.closest('[data-tone="dark"]'));
  };
  useMotionValueEvent(scrollY, 'change', (v) => {
    checkTone();
    setAtTop(v < 8);
    const prev = scrollY.getPrevious() ?? 0;
    if (v < 80) setHidden(false); // near the top: always shown
    else if (v > prev + 4) setHidden(true); // scrolling down: hide
    else if (v < prev - 4) setHidden(false); // scrolling up: show
  });
  useEffect(() => {
    const calc = () => setEdge(Math.max(EDGE, (window.innerWidth - CONTAINER) / 2));
    calc();
    setAtTop(window.scrollY < 8);
    checkTone();
    const t = window.setTimeout(checkTone, 300); // after the page has laid out
    window.addEventListener('resize', calc);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('resize', calc);
    };
  }, []);
  const pad = atTop ? edge : EDGE;
  const toNext = (e: React.MouseEvent) => {
    e.preventDefault(); // keep the URL as it is (the portfolio uses hash routes)
    document.getElementById('next-project')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };
  return (
    <header ref={headerRef} className="pointer-events-none fixed inset-x-0 top-0 z-50" style={{ height: HEADER_H }} onFocusCapture={() => setHidden(false)}>
      <motion.div
        className="flex h-full items-center justify-between"
        animate={{ paddingLeft: pad, paddingRight: pad, y: hidden ? -(HEADER_H + 20) : 0 }}
        transition={reduce ? { duration: 0 } : { ...SPRING, y: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close case study"
          className={`pointer-events-auto flex h-[52px] w-[52px] items-center justify-center rounded-full backdrop-blur-md transition-colors duration-300 ${
            dark ? 'bg-[rgba(255,255,255,0.12)] text-white hover:bg-[rgba(255,255,255,0.2)]' : 'bg-[rgba(0,13,16,0.06)] text-[#000d10] hover:bg-[rgba(0,13,16,0.12)]'
          }`}
        >
          <XIcon className="h-5 w-5" strokeWidth={2} />
        </button>
        <div className="pointer-events-auto flex items-center gap-6 font-inter">
          <span className={`hidden text-[20px] font-medium transition-colors duration-300 sm:inline ${dark ? 'text-[#a7a9b0]' : 'text-[#8e8e95]'}`}>Next</span>
          <a
            href="#next-project"
            onClick={toNext}
            className={`flex h-[52px] items-center gap-[14px] rounded-full pl-[22px] pr-[24px] text-[20px] font-semibold transition-[background-color,color,opacity] duration-300 hover:opacity-90 ${
              dark ? 'bg-white text-[#0a0a0c]' : 'bg-[#000d10] text-white'
            }`}
          >
            <span className="h-4 w-4 rounded-full bg-[#9a5cf5]" aria-hidden />
            {nextName}
          </a>
        </div>
      </motion.div>
    </header>
  );
}

/* ---------- project-to-project transition ---------- */

const PANEL_BG = '#111114'; // behind a live view while it loads
const PAGE_GAP = '#050506'; // what shows around the shrinking page
const PULL_WHEEL = 650; // wheel distance (px) at the top that opens the previous project
const PULL_TOUCH = 320; // finger distance (px) that opens it on touch
const ARM_MS = 900; // no auto-switch right after a page opens
const HOLD_MS = 900; // after the switch: the live view stays on top while the new page settles
const DISSOLVE_MS = 800; // then it dissolves into the page
// one line for the reduced-motion card (Trust Bank's and GameCove's from their heroes; UTrada PLACEHOLDER)
const CARD_LINE: Record<string, string> = {
  'Trust Bank': 'Turning hidden rewards into everyday loyalty',
  GameCove: 'Helping first-time game creators decide what to fix next',
  UTrada: 'UX case study',
};

const EMBED = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('embed');
/** true inside a live view (the iframe copy of a case) */
export const isEmbedView = () => EMBED;

type View = { clip: HTMLDivElement; frame: HTMLIFrameElement };

// set right before another case opens, read by CaseSwapScroll / CaseReveal on the new page
let enterFrom: '' | 'next' | 'prev' = '';
let prevFromBottom: number | null = null; // going back: how far above the page bottom the view was scrolled
let handoff: View | null = null; // the live view that stays on top of the new page until it dissolves
/** true while a case is being opened from a neighbour's live view (CaseReveal shows what is on screen at once) */
export const isCaseSwap = () => enterFrom !== '';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

function prevCase() {
  const here = typeof window === 'undefined' ? '' : window.location.hash;
  const i = CASE_ORDER.findIndex((c) => c.route === here);
  return CASE_ORDER[(Math.max(i, 0) - 1 + CASE_ORDER.length) % CASE_ORDER.length];
}
function viewUrl(route: string) {
  const u = new URL(window.location.href);
  u.searchParams.set('embed', '1');
  u.hash = route;
  return u.toString();
}
/** the scroll position that puts a document at its end: its next-project section just below the screen */
function endOf(win: Window) {
  const s = win.document.getElementById('next-project');
  if (!s) return null;
  return Math.max(0, s.getBoundingClientRect().top + win.scrollY - win.innerHeight);
}

/** a live view: a clipping box at body level with the other case inside, at the screen's own size */
function makeView(route: string, title: string): View {
  const clip = document.createElement('div');
  clip.setAttribute('aria-hidden', 'true');
  Object.assign(clip.style, {
    position: 'fixed',
    left: '0px',
    top: '0px',
    width: '0px',
    height: '0px',
    overflow: 'hidden',
    zIndex: '41', // above the darkening (40), below the header (50)
    pointerEvents: 'none',
    visibility: 'hidden',
    background: PANEL_BG,
  });
  const frame = document.createElement('iframe');
  frame.src = viewUrl(route);
  frame.title = title;
  frame.tabIndex = -1;
  Object.assign(frame.style, {
    position: 'absolute',
    left: '0px',
    top: '0px',
    width: `${window.innerWidth}px`,
    height: `${window.innerHeight}px`,
    border: '0',
    pointerEvents: 'none',
    background: 'transparent',
  });
  clip.appendChild(frame);
  document.body.appendChild(clip);
  return { clip, frame };
}
/** fit a view's clipping box to a panel; the page inside is offset so it stays at screen size */
function fitView(v: View, r: DOMRect, radius: number, frameX: number, frameY: number, visible: boolean) {
  const s = v.clip.style;
  s.left = `${r.left.toFixed(1)}px`;
  s.top = `${r.top.toFixed(1)}px`;
  s.width = `${r.width.toFixed(1)}px`;
  s.height = `${r.height.toFixed(1)}px`;
  s.borderRadius = `${radius.toFixed(1)}px`;
  s.visibility = visible ? 'visible' : 'hidden';
  v.frame.style.left = `${frameX.toFixed(1)}px`;
  v.frame.style.top = `${frameY.toFixed(1)}px`;
  v.frame.style.width = `${window.innerWidth}px`;
  v.frame.style.height = `${window.innerHeight}px`;
}

export function NextProjectCard({ name, href }: { name: string; href: string }) {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLAnchorElement>(null);
  const shadeRef = useRef<HTMLDivElement>(null);
  const prevPanelRef = useRef<HTMLAnchorElement>(null);
  const views = useRef<{ next: View | null; prev: View | null }>({ next: null, prev: null });
  const [prev] = useState(prevCase);
  const live = !reduce && !EMBED;

  /** switch to the other case; its live view (already filling the screen) is handed to the new page */
  const go = (to: string, dir: 'next' | 'prev') => {
    const v = dir === 'next' ? views.current.next : views.current.prev;
    prevFromBottom = null;
    handoff = null;
    if (v) {
      if (dir === 'prev') {
        try {
          const w = v.frame.contentWindow;
          if (w) prevFromBottom = w.document.documentElement.scrollHeight - w.scrollY;
        } catch {
          /* not reachable: the new page goes to its end instead */
        }
      }
      // make sure it covers the whole screen exactly (a click can come mid-way)
      fitView(v, new DOMRect(0, 0, window.innerWidth, window.innerHeight), 0, 0, 0, true);
      v.clip.style.zIndex = '49';
      handoff = v;
      if (dir === 'next') views.current.next = null;
      else views.current.prev = null;
      // safety: never leave it behind
      window.setTimeout(() => {
        if (handoff === v) {
          v.clip.remove();
          handoff = null;
        }
      }, 4000);
    }
    enterFrom = dir;
    window.location.hash = to;
  };

  useEffect(() => {
    const section = sectionRef.current;
    const panel = panelRef.current;
    const shade = shadeRef.current;
    const pPanel = prevPanelRef.current;
    if (!section || !panel || !shade || !pPanel || !live) return;
    const root = section.parentElement as HTMLElement | null;
    const main = root?.querySelector(':scope > main') as HTMLElement | null;
    const header = root?.querySelector(':scope > header') as HTMLElement | null;
    if (!root || !main) return;
    const v = views.current;

    // the page needs its own background so the black around it only shows at the edges
    const prevStyle = {
      rootBg: root.style.backgroundColor,
      mainBg: main.style.backgroundColor,
      transform: main.style.transform,
      origin: main.style.transformOrigin,
      radius: main.style.borderRadius,
      overflow: main.style.overflow,
      willChange: main.style.willChange,
    };
    const mainBg = getComputedStyle(main).backgroundColor;
    if (mainBg === 'rgba(0, 0, 0, 0)' || mainBg === 'transparent') main.style.backgroundColor = getComputedStyle(root).backgroundColor;

    let raf = 0;
    let opened = false;
    let mode: '' | 'down' | 'up' = ''; // which transition currently owns the page's styles
    let armed = false;
    const armT = window.setTimeout(() => (armed = true), ARM_MS);
    const setHeader = (o: number) => {
      if (header) header.style.opacity = o >= 1 ? '' : o.toFixed(3);
    };

    // the previous project's live view, scrolled to its end, ready a moment after this page opens
    const prevT = window.setTimeout(() => {
      if (v.prev) return;
      const pv = makeView(prev.route, `${prev.name} (preview)`);
      v.prev = pv;
      pv.frame.addEventListener('load', () => {
        let n = 0;
        const tick = () => {
          if (v.prev !== pv || pull > 0) return; // stop once it is in use
          try {
            const w = pv.frame.contentWindow;
            const y = w ? endOf(w) : null;
            if (w && y !== null) w.scrollTo(0, y);
          } catch {
            /* not reachable: leave it at its top */
          }
          if (++n < 12) window.setTimeout(tick, 300);
        };
        window.setTimeout(tick, 300);
      });
      drawPull();
    }, 1200);

    const engage = (m: 'down' | 'up') => {
      mode = m;
      root.style.backgroundColor = PAGE_GAP;
      main.style.overflow = 'clip';
      main.style.willChange = 'transform';
      main.style.transformOrigin = m === 'down' ? '50% 100%' : '50% 0'; // shrink toward the side the panel comes from
      shade.style.visibility = 'visible';
    };
    const release = () => {
      mode = '';
      root.style.backgroundColor = prevStyle.rootBg;
      main.style.transform = prevStyle.transform;
      main.style.borderRadius = prevStyle.radius;
      main.style.overflow = prevStyle.overflow;
      main.style.willChange = prevStyle.willChange;
      shade.style.opacity = '0';
      shade.style.visibility = 'hidden';
      setHeader(1);
    };

    // ----- down: the next project's page rises from below -----
    const read = () => {
      raf = 0;
      if (opened) return;
      const vh = window.innerHeight;
      const r = section.getBoundingClientRect();
      // load the live view when the end is getting close
      if (!v.next && r.top < vh * 3) v.next = makeView(href, `${name} (preview)`);
      // p: 0 when the panel's top is at the bottom of the screen, 1 when it reaches the top
      const p = clamp01((vh - r.top) / vh);
      const e = smooth(0, 1, p);
      if (p > 0 && mode !== 'up') {
        if (mode !== 'down') engage('down');
        main.style.transform = `scale(${(1 - 0.05 * e).toFixed(4)})`;
        const rad = (24 * Math.min(1, p * 4)).toFixed(1);
        main.style.borderRadius = `0 0 ${rad}px ${rad}px`;
        shade.style.opacity = (0.82 * e).toFixed(3);
        setHeader(1 - smooth(0.75, 0.97, p));
      } else if (p <= 0 && mode === 'down') release();
      // the panel: inset and rounded while it comes up, then fills the screen; the page inside rides with it
      const g = smooth(0.55, 1, p);
      const side = 16 * (1 - g);
      const top = 12 * (1 - g);
      const rad = 24 * (1 - g);
      panel.style.left = `${side.toFixed(1)}px`;
      panel.style.right = `${side.toFixed(1)}px`;
      panel.style.top = `${top.toFixed(1)}px`;
      panel.style.bottom = `${side.toFixed(1)}px`;
      panel.style.borderRadius = `${rad.toFixed(1)}px`;
      if (v.next) {
        const pr = panel.getBoundingClientRect();
        fitView(v.next, pr, rad, -side, -top, p > 0 && pr.top < vh);
      }
      // full screen: a little more scrolling and the site is on the next project
      const held = clamp01(-r.top / (vh * 0.25));
      if (held >= 1 && !opened && armed) {
        opened = true;
        go(href, 'next');
      }
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };

    // ----- up: at the top, pulling further up brings the previous project's page down from above -----
    let pull = 0;
    let lastInput = 0;
    let touchY: number | null = null;
    let pullRaf = 0;
    function drawPull() {
      if (opened) return;
      const vh = window.innerHeight;
      const e = smooth(0, 1, pull);
      if (pull > 0.001) {
        if (mode !== 'up') engage('up');
        main.style.transform = `translateY(${(e * 22).toFixed(2)}vh) scale(${(1 - 0.05 * e).toFixed(4)})`;
        const rad = (24 * Math.min(1, pull * 4)).toFixed(1);
        main.style.borderRadius = `${rad}px ${rad}px 0 0`;
        shade.style.opacity = (0.82 * e).toFixed(3);
        setHeader(1 - smooth(0.1, 0.4, pull));
        pPanel!.style.visibility = 'visible';
      } else {
        if (mode === 'up') release();
        pPanel!.style.visibility = 'hidden';
      }
      // the panel comes down from above the screen, then fills it; the page inside rides with it
      const g = smooth(0.6, 1, pull);
      const side = 16 * (1 - g);
      const bottom = 12 * (1 - g);
      const rad = 24 * (1 - g);
      pPanel!.style.left = `${side.toFixed(1)}px`;
      pPanel!.style.right = `${side.toFixed(1)}px`;
      pPanel!.style.top = `${side.toFixed(1)}px`;
      pPanel!.style.bottom = `${bottom.toFixed(1)}px`;
      pPanel!.style.borderRadius = `${rad.toFixed(1)}px`;
      pPanel!.style.transform = `translateY(calc(${((e - 1) * 100).toFixed(2)}% - ${((1 - e) * 24).toFixed(1)}px))`;
      if (v.prev) {
        const pr = pPanel!.getBoundingClientRect();
        fitView(v.prev, pr, rad, -side, pr.height + bottom - vh, pull > 0.001);
      }
    }
    // let go early: spring back
    const settle = () => {
      pullRaf = 0;
      if (opened) return;
      if (touchY === null && performance.now() - lastInput > 160 && pull > 0) {
        pull = Math.max(0, pull - 0.06 - pull * 0.12);
        drawPull();
      }
      if (pull > 0) pullRaf = requestAnimationFrame(settle);
    };
    const setPull = (val: number) => {
      pull = clamp01(val);
      lastInput = performance.now();
      drawPull();
      if (pull >= 1 && !opened) {
        opened = true;
        go(prev.route, 'prev');
        return;
      }
      if (!pullRaf) pullRaf = requestAnimationFrame(settle);
    };
    const atTop = () => window.scrollY <= 0;
    const onWheel = (ev: WheelEvent) => {
      if (opened || !armed) return;
      if (pull > 0) {
        ev.preventDefault(); // while pulling, the wheel drives the pull (both ways), not the page
        setPull(pull - ev.deltaY / PULL_WHEEL);
      } else if (atTop() && ev.deltaY < 0) {
        setPull(-ev.deltaY / PULL_WHEEL);
      }
    };
    const onTouchStart = (ev: TouchEvent) => {
      touchY = atTop() && armed && !opened ? ev.touches[0].clientY : null;
    };
    const onTouchMove = (ev: TouchEvent) => {
      if (touchY === null || opened) return;
      const dy = ev.touches[0].clientY - touchY;
      if (dy > 0 && atTop()) {
        ev.preventDefault();
        setPull(dy / PULL_TOUCH);
      } else if (pull > 0) setPull(0);
    };
    const onTouchEnd = () => {
      touchY = null;
      lastInput = 0;
      if (pull > 0 && !pullRaf) pullRaf = requestAnimationFrame(settle);
    };

    raf = requestAnimationFrame(read);
    drawPull();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchcancel', onTouchEnd);
    return () => {
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
      if (raf) cancelAnimationFrame(raf);
      if (pullRaf) cancelAnimationFrame(pullRaf);
      window.clearTimeout(armT);
      window.clearTimeout(prevT);
      // views not handed to the next page go away with this page
      if (v.next) v.next.clip.remove();
      if (v.prev) v.prev.clip.remove();
      v.next = null;
      v.prev = null;
      root.style.backgroundColor = prevStyle.rootBg;
      main.style.backgroundColor = prevStyle.mainBg;
      main.style.transform = prevStyle.transform;
      main.style.transformOrigin = prevStyle.origin;
      main.style.borderRadius = prevStyle.radius;
      main.style.overflow = prevStyle.overflow;
      main.style.willChange = prevStyle.willChange;
      if (header) header.style.opacity = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, href]);

  // reduced motion (or inside a live view): a plain card / a plain block of the same height
  if (!live) {
    if (EMBED) return <section id="next-project" data-tone="dark" style={{ height: '160vh', background: PAGE_GAP }} aria-hidden="true" />;
    return (
      <section id="next-project" className="bg-white px-5 pb-16 pt-5 md:px-10" style={{ fontFamily: HELV }}>
        <a
          href={href}
          className="mx-auto flex min-h-[420px] max-w-[1440px] flex-col justify-between rounded-[20px] p-8 text-white md:p-12"
          style={{ background: PANEL_BG }}
        >
          <p className="text-[16px] text-[#8e8e95]">Next project</p>
          <div>
            <p className="text-[48px] font-bold leading-none tracking-[-0.03em] md:text-[63px]">{name} →</p>
            <p className="mt-4 text-[18px] text-[#a7a9b0]">{CARD_LINE[name] ?? ''}</p>
          </div>
        </a>
      </section>
    );
  }

  // the panels mark where the live views go (the views themselves live at body level) and take the clicks
  return (
    <section id="next-project" ref={sectionRef} data-tone="dark" className="relative" style={{ height: '160vh', background: PAGE_GAP, fontFamily: HELV }}>
      {/* darkens the page while a panel comes in */}
      <div ref={shadeRef} className="pointer-events-none fixed inset-0 z-[40]" style={{ background: '#000', opacity: 0, visibility: 'hidden' }} aria-hidden="true" />

      {/* previous project's page (its end): comes down from the top when you keep scrolling up at the top */}
      <a
        ref={prevPanelRef}
        href={prev.route}
        onClick={(e) => {
          e.preventDefault();
          go(prev.route, 'prev');
        }}
        aria-label={`Previous project: ${prev.name}`}
        tabIndex={-1}
        className="fixed z-[41] block overflow-hidden"
        style={{ background: PANEL_BG, left: 16, right: 16, top: 16, bottom: 12, borderRadius: 24, visibility: 'hidden', transform: 'translateY(-110%)' }}
      />

      {/* next project's page (its top): rises from below and fills the screen */}
      <div className="sticky top-0 z-[41] h-[100svh] overflow-hidden">
        <a
          ref={panelRef}
          href={href}
          onClick={(e) => {
            e.preventDefault();
            go(href, 'next');
          }}
          aria-label={`Next project: ${name}`}
          className="absolute block overflow-hidden"
          style={{ background: PANEL_BG, left: 16, right: 16, top: 12, bottom: 16, borderRadius: 24 }}
        />
      </div>
    </section>
  );
}

/**
 * Put as the LAST child inside CaseReveal: when a case was opened from a neighbour's live view, it sets the
 * scroll to match what the view showed (the top when going forward; going back, the same distance above the
 * page bottom as the view) before the first paint, and again after the case's own scroll-to-top effect.
 * Then it keeps the handed-over view scrolling along with the page while the page settles, and dissolves it.
 */
export function CaseSwapScroll() {
  const [from] = useState(() => enterFrom);
  const [fromBottom] = useState(() => prevFromBottom);
  const backY = () => {
    if (fromBottom !== null) return Math.max(0, document.documentElement.scrollHeight - fromBottom);
    return endOf(window);
  };
  const place = () => {
    if (from === 'next') window.scrollTo(0, 0);
    else if (from === 'prev') {
      const y = backY();
      if (y !== null) window.scrollTo(0, y);
    }
  };
  useLayoutEffect(place, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    place();
    enterFrom = '';
    prevFromBottom = null;
    const timers: number[] = [];
    const cleanups: (() => void)[] = [];

    // the view stays on top, scrolling along with the page, then dissolves into it
    const v = handoff;
    handoff = null;
    if (v) {
      let fw: Window | null = null;
      let base = 0;
      try {
        fw = v.frame.contentWindow;
        base = fw ? fw.scrollY : 0;
      } catch {
        fw = null;
      }
      const real0 = window.scrollY;
      const sync = () => {
        try {
          fw?.scrollTo(0, base + window.scrollY - real0);
        } catch {
          /* ignore */
        }
      };
      window.addEventListener('scroll', sync, { passive: true });
      timers.push(
        window.setTimeout(() => {
          v.clip.style.transition = `opacity ${DISSOLVE_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`;
          v.clip.style.opacity = '0';
        }, HOLD_MS),
        window.setTimeout(() => {
          window.removeEventListener('scroll', sync);
          v.clip.remove();
        }, HOLD_MS + DISSOLVE_MS + 50)
      );
      cleanups.push(() => {
        window.removeEventListener('scroll', sync);
        v.clip.remove();
      });
    }

    if (from === 'prev') {
      // images above may still change the page height: keep the spot unless the visitor scrolls
      let target = window.scrollY;
      const keep = () => {
        if (Math.abs(window.scrollY - target) > 4) return;
        const y = backY();
        if (y !== null) {
          window.scrollTo(0, y);
          target = y;
        }
      };
      timers.push(window.setTimeout(keep, 150), window.setTimeout(keep, 500));
    }
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      cleanups.forEach((c) => c());
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
