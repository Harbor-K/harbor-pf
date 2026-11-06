import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion';
import { XIcon } from 'lucide-react';
import { CASE_ORDER } from './CaseNav';

/**
 * Case-study header and footer, the same as the "UX Case Study Page" design (its tb/scroll.tsx FloatingHeader
 * and PageA NextProject), so every Trust Bank page looks alike.
 * Header: at the very top the close button and Next · GameCove sit on the 1440 container edges;
 * once you scroll they slide out to the screen edges with a 20px margin and stay there.
 * Scrolling down tucks the whole header up out of view; scrolling up (or reaching the top) brings it back.
 * "Next · GameCove" scrolls down to the next-project card; the card opens the next case study.
 * Font: Helvetica Neue (the font-inter class is kept from the UX page but has no Inter here).
 * Dark sections: anything under the header inside an element with data-tone="dark" switches the header to
 * light-on-dark (white × on a translucent white circle, white Next pill), so it stays readable on dark heroes.
 * Pages without data-tone look exactly as before.
 *
 * Project to project (after alvinn.design's project pages, Harbor's reference clip), both ways:
 *  - Down, at the end of a case: the next project's dark card rises from below. The page above shrinks a little
 *    toward its bottom edge, gets rounded bottom corners and darkens, with black around it. The card grows to
 *    fill the screen, stays pinned for a moment, and the next case opens.
 *  - Up, at the top of a case: keep scrolling up (or pull down on touch) and the previous project's card comes
 *    down from the top while the page slides down, shrinks and darkens. Pull far enough and the previous case
 *    opens at its end (just above its own next-project card); let go early and everything springs back.
 *  The hand-off has no blink: a copy of the full-screen card is laid over everything (outside React, so it
 *  survives the page swap), the new case is put in place underneath, and then the card slides away in the
 *  direction you were going (up when going down, down when going up) to uncover it.
 *  Clicking a card opens it the same way (the card first grows to fill the screen).
 *  Reduced motion: a plain next card, no auto-open, no pull, no slide.
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

const CARD_BG = '#111114';
const PAGE_GAP = '#050506'; // what shows around the shrinking page
// one line + meta for each project's card (Trust Bank's from its hero; GameCove / UTrada are PLACEHOLDER copy)
const CARD_COPY: Record<string, { line: string; meta: string[] }> = {
  'Trust Bank': { line: 'Turning hidden rewards into everyday loyalty', meta: ['8 weeks · 2026', 'Planning', 'UI Design', 'Usability test'] },
  GameCove: { line: 'An AI analytics dashboard for game teams', meta: ['Team project', 'UX case study'] },
  UTrada: { line: 'UX case study', meta: ['Fintech', 'Trading'] },
};
const PULL_WHEEL = 650; // wheel distance (px) at the top that opens the previous project
const PULL_TOUCH = 320; // finger distance (px) that opens it on touch
const FILL_MS = 450; // a clicked card growing to full screen
const SLIDE_MS = 900; // the card sliding away to uncover the new case
const EASE_SLIDE = 'cubic-bezier(0.76, 0, 0.24, 1)';

// set right before another case opens, read by CaseEnterFade on the new page
let enterFrom: '' | 'next' | 'prev' = '';
let switching = false;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const nextFrame = () => new Promise<void>((res) => requestAnimationFrame(() => res()));
const wait = (ms: number) => new Promise<void>((res) => window.setTimeout(res, ms));

/**
 * The hand-off between two cases without a blink: lay a copy of the card over everything, make it fill the
 * screen, swap the page underneath, then slide the copy away (up when going to the next case, down when going back).
 */
async function coverAndGo(card: HTMLElement, to: string, dir: 'next' | 'prev') {
  if (switching) return;
  switching = true;
  const html = document.documentElement;
  const prevOverflow = html.style.overflow;
  const r = card.getBoundingClientRect();
  const cover = card.cloneNode(true) as HTMLElement;
  cover.removeAttribute('href');
  cover.removeAttribute('id');
  cover.setAttribute('aria-hidden', 'true');
  cover.querySelectorAll<HTMLElement>('[data-hint]').forEach((h) => (h.style.opacity = '0'));
  Object.assign(cover.style, {
    position: 'fixed',
    left: `${r.left}px`,
    top: `${r.top}px`,
    width: `${r.width}px`,
    height: `${r.height}px`,
    right: 'auto',
    bottom: 'auto',
    margin: '0',
    transform: 'none',
    visibility: 'visible',
    pointerEvents: 'none',
    zIndex: '60',
    borderRadius: getComputedStyle(card).borderRadius,
    transition: 'none',
    willChange: 'transform',
  });
  document.body.appendChild(cover);
  html.style.overflow = 'hidden'; // hold the scroll still through the hand-off

  // a card that is not full screen yet (clicked mid-way) grows to fill it first
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  if (r.left > 1 || r.top > 1 || r.width < vw - 1 || r.height < vh - 1) {
    await nextFrame();
    const ease = `${FILL_MS}ms cubic-bezier(0.65, 0, 0.35, 1)`;
    cover.style.transition = ['left', 'top', 'width', 'height', 'border-radius'].map((p) => `${p} ${ease}`).join(', ');
    Object.assign(cover.style, { left: '0px', top: '0px', width: `${vw}px`, height: `${vh}px`, borderRadius: '0px' });
    await wait(FILL_MS);
  } else {
    cover.style.borderRadius = '0px';
  }

  // swap the page underneath
  enterFrom = dir;
  window.location.hash = to;
  await nextFrame();
  await nextFrame();
  await wait(dir === 'prev' ? 160 : 60); // going back: the new case first moves to its end

  // uncover it
  cover.style.transition = `transform ${SLIDE_MS}ms ${EASE_SLIDE}`;
  cover.style.transform = `translate3d(0, ${dir === 'next' ? '-100%' : '100%'}, 0)`;
  await wait(SLIDE_MS + 40);
  cover.remove();
  html.style.overflow = prevOverflow;
  switching = false;
}

function prevCase() {
  const here = typeof window === 'undefined' ? '' : window.location.hash;
  const i = CASE_ORDER.findIndex((c) => c.route === here);
  return CASE_ORDER[(Math.max(i, 0) - 1 + CASE_ORDER.length) % CASE_ORDER.length];
}

/** the dark project card (used for both the next card and the previous card) */
function CardBody({ name, icon, label, hint, hintRef }: { name: string; icon?: string; label: string; hint: React.ReactNode; hintRef: React.RefObject<HTMLParagraphElement>; }) {
  const copy = CARD_COPY[name] ?? { line: 'UX case study', meta: [] };
  return (
    <>
      <div className="grid grid-cols-1 gap-8 p-8 md:grid-cols-[1fr_minmax(0,460px)] md:p-12">
        <div className="flex items-center gap-4">
          {icon && <img src={icon} alt="" className="h-14 w-14 rounded-[12px] object-cover" />}
          <p className="text-[40px] font-bold leading-none tracking-[-0.03em] md:text-[56px]">{name}</p>
        </div>
        <div>
          <p className="flex items-center gap-3 text-[16px] text-[#8e8e95]">
            <span className="h-3 w-3 rounded-full bg-[#9a5cf5]" aria-hidden />
            {label}
          </p>
          <p className="mt-4 text-[22px] font-bold leading-[1.25] md:text-[26px]">{copy.line}</p>
          {copy.meta.length > 0 && (
            <ul className="mt-5 space-y-1 text-[16px] leading-[1.45] text-[#a7a9b0]">
              {copy.meta.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <p ref={hintRef} data-hint="" className="flex items-center gap-2 p-8 text-[16px] text-[#8e8e95] md:p-12" style={{ opacity: 0 }}>
        {hint}
      </p>
    </>
  );
}

export function NextProjectCard({ name, href }: { name: string; href: string }) {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLAnchorElement>(null);
  const shadeRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const prevCardRef = useRef<HTMLAnchorElement>(null);
  const prevHintRef = useRef<HTMLParagraphElement>(null);
  const info = CASE_ORDER.find((c) => c.route === href) ?? CASE_ORDER.find((c) => c.name === name);
  const [prev] = useState(prevCase);

  const go = (to: string, dir: 'next' | 'prev') => {
    const card = dir === 'next' ? cardRef.current : prevCardRef.current;
    if (reduce || !card) {
      window.location.hash = to;
      return;
    }
    coverAndGo(card, to, dir);
  };

  useEffect(() => {
    const section = sectionRef.current;
    const card = cardRef.current;
    const shade = shadeRef.current;
    const hint = hintRef.current;
    const pCard = prevCardRef.current;
    const pHint = prevHintRef.current;
    if (!section || !card || !shade || !hint || !pCard || !pHint || reduce) return;
    const root = section.parentElement as HTMLElement | null;
    const main = root?.querySelector(':scope > main') as HTMLElement | null;
    if (!root || !main) return;

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
    // a page that has just opened still has the old scroll position until its own scroll runs,
    // so auto-open (either way) is only allowed a while after mounting (after the hand-off slide)
    let armed = false;
    const armT = window.setTimeout(() => (armed = true), SLIDE_MS + 400);

    const engage = (m: 'down' | 'up') => {
      mode = m;
      root.style.backgroundColor = PAGE_GAP;
      main.style.overflow = 'clip';
      main.style.willChange = 'transform';
      main.style.transformOrigin = m === 'down' ? '50% 100%' : '50% 0'; // shrink toward the side the card comes from
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
    };

    // ----- down: the next card rises from below -----
    const read = () => {
      raf = 0;
      const vh = window.innerHeight;
      const r = section.getBoundingClientRect();
      // p: 0 when the card's top is at the bottom of the screen, 1 when it reaches the top
      const p = clamp01((vh - r.top) / vh);
      const e = smooth(0, 1, p);
      if (p > 0 && mode !== 'up') {
        if (mode !== 'down') engage('down');
        main.style.transform = `scale(${(1 - 0.05 * e).toFixed(4)})`;
        const rad = (24 * Math.min(1, p * 4)).toFixed(1);
        main.style.borderRadius = `0 0 ${rad}px ${rad}px`;
        shade.style.opacity = (0.82 * e).toFixed(3);
      } else if (p <= 0 && mode === 'down') release();
      const g = smooth(0.55, 1, p);
      const inset = 16 * (1 - g);
      card.style.left = `${inset.toFixed(1)}px`;
      card.style.right = `${inset.toFixed(1)}px`;
      card.style.top = `${(12 * (1 - g)).toFixed(1)}px`;
      card.style.bottom = `${inset.toFixed(1)}px`;
      card.style.borderRadius = `${(24 * (1 - g)).toFixed(1)}px`;
      // pinned full-screen: after a little more scrolling the next case opens
      const held = clamp01(-r.top / (vh * 0.3));
      hint.style.opacity = String(smooth(0.6, 1, p) * (1 - held));
      if (held >= 1 && !opened && armed) {
        opened = true;
        go(href, 'next');
      }
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };

    // ----- up: at the top, pulling further up brings the previous card down from the top -----
    let pull = 0;
    let lastInput = 0;
    let touchY: number | null = null;
    let pullRaf = 0;
    const drawPull = () => {
      const e = smooth(0, 1, pull);
      if (pull > 0.001) {
        if (mode !== 'up') engage('up');
        main.style.transform = `translateY(${(e * 22).toFixed(2)}vh) scale(${(1 - 0.05 * e).toFixed(4)})`;
        const rad = (24 * Math.min(1, pull * 4)).toFixed(1);
        main.style.borderRadius = `${rad}px ${rad}px 0 0`;
        shade.style.opacity = (0.82 * e).toFixed(3);
        pCard.style.visibility = 'visible';
      } else {
        if (mode === 'up') release();
        pCard.style.visibility = 'hidden';
      }
      // the card comes down from above the screen, then grows to fill it
      const g = smooth(0.6, 1, pull);
      const inset = 16 * (1 - g);
      pCard.style.left = `${inset.toFixed(1)}px`;
      pCard.style.right = `${inset.toFixed(1)}px`;
      pCard.style.top = `${inset.toFixed(1)}px`;
      pCard.style.bottom = `${(12 * (1 - g)).toFixed(1)}px`;
      pCard.style.borderRadius = `${(24 * (1 - g)).toFixed(1)}px`;
      pCard.style.transform = `translateY(calc(${((e - 1) * 100).toFixed(2)}% - ${((1 - e) * 24).toFixed(1)}px))`;
      pHint.style.opacity = String(smooth(0.35, 0.8, pull));
    };
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
    const setPull = (v: number) => {
      pull = clamp01(v);
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
      if (opened || !armed || switching) return;
      if (pull > 0) {
        ev.preventDefault(); // while pulling, the wheel drives the pull (both ways), not the page
        setPull(pull - ev.deltaY / PULL_WHEEL);
      } else if (atTop() && ev.deltaY < 0) {
        setPull(-ev.deltaY / PULL_WHEEL);
      }
    };
    const onTouchStart = (ev: TouchEvent) => {
      touchY = atTop() && armed && !opened && !switching ? ev.touches[0].clientY : null;
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
      root.style.backgroundColor = prevStyle.rootBg;
      main.style.backgroundColor = prevStyle.mainBg;
      main.style.transform = prevStyle.transform;
      main.style.transformOrigin = prevStyle.origin;
      main.style.borderRadius = prevStyle.radius;
      main.style.overflow = prevStyle.overflow;
      main.style.willChange = prevStyle.willChange;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce, href]);

  return (
    <section
      id="next-project"
      ref={sectionRef}
      data-tone="dark"
      className="relative"
      style={{ height: reduce ? 'auto' : '160vh', background: reduce ? '#ffffff' : PAGE_GAP, fontFamily: HELV }}
    >
      {/* darkens the page while a card comes in */}
      <div ref={shadeRef} className="pointer-events-none fixed inset-0 z-[40]" style={{ background: '#000', opacity: 0, visibility: 'hidden' }} aria-hidden="true" />

      {/* previous project: comes down from the top when you keep scrolling up at the top of the page */}
      {!reduce && (
        <a
          ref={prevCardRef}
          href={prev.route}
          onClick={(e) => {
            e.preventDefault();
            go(prev.route, 'prev');
          }}
          aria-label={`Previous project: ${prev.name}`}
          tabIndex={-1}
          className="fixed z-[41] flex flex-col-reverse justify-between overflow-hidden text-white"
          style={{ background: CARD_BG, left: 16, right: 16, top: 16, bottom: 12, borderRadius: 24, visibility: 'hidden', transform: 'translateY(-110%)' }}
        >
          <CardBody
            name={prev.name}
            icon={prev.icon}
            label="Previous project"
            hintRef={prevHintRef}
            hint={
              <>
                Keep scrolling up to open <span aria-hidden>↑</span>
              </>
            }
          />
        </a>
      )}

      <div className={reduce ? 'px-5 pb-16 pt-5 md:px-10' : 'sticky top-0 z-[41] h-[100svh] overflow-hidden'}>
        <a
          ref={cardRef}
          href={href}
          onClick={(e) => {
            e.preventDefault();
            go(href, 'next');
          }}
          aria-label={`Next project: ${name}`}
          className={`group flex flex-col justify-between overflow-hidden text-white ${reduce ? 'relative mx-auto min-h-[420px] max-w-[1440px] rounded-[20px]' : 'absolute'}`}
          style={reduce ? { background: CARD_BG } : { background: CARD_BG, left: 16, right: 16, top: 12, bottom: 16, borderRadius: 24 }}
        >
          <CardBody
            name={name}
            icon={info?.icon}
            label="Next project"
            hintRef={hintRef}
            hint={
              <>
                {reduce ? `Open ${name}` : 'Keep scrolling to open'} <span aria-hidden>{reduce ? '→' : '↓'}</span>
              </>
            }
          />
        </a>
      </div>
    </section>
  );
}

/**
 * Wraps a case study. When it was opened from the previous-project pull, it starts at its end
 * (just above its own next-project card), so going back up feels like continuing upward.
 * (No fade here any more: the sliding card in coverAndGo uncovers the page.)
 */
export function CaseEnterFade({ children }: { children: React.ReactNode }) {
  const [from] = useState(() => enterFrom);
  useEffect(() => {
    enterFrom = '';
    if (from !== 'prev') return;
    // the case's own effect has just scrolled to the top; move to its end instead (again once images settle)
    let target = -1;
    const toEnd = () => {
      const s = document.getElementById('next-project');
      if (!s) return;
      if (target >= 0 && Math.abs(window.scrollY - target) > 4) return; // the visitor has already scrolled
      target = Math.max(0, s.getBoundingClientRect().top + window.scrollY - window.innerHeight);
      window.scrollTo(0, target);
    };
    toEnd();
    const timers = [window.setTimeout(toEnd, 120), window.setTimeout(toEnd, 500)];
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [from]);
  return <>{children}</>;
}
