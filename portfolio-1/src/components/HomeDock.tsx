import React, { useEffect, useRef, useState } from 'react';
import { EMAIL } from '../data/content';
import { CV_URL, CV_LABEL } from '../data/links';
import { PROJECT_ICONS } from './case/projectIcons';

/**
 * Site header (home page, About page): exactly 56px, flush with the top edge, never any background.
 * Menu: "Projects" with a down arrow, and "About me" (#/about).
 * Projects menu (after Harbor's reference clip of a two-pane mega menu): hovering "Projects" opens a dark panel.
 * Left: the three case studies (name + one line). Right: the case's main (hero) video, muted and looping.
 * Pointing at another case cross-fades to its video. Click a name or the video to open that case.
 * UTrada has no video yet, so it shows its icon. The panel is about 2/3 of its first size (Harbor's note).
 * Closes on Esc, a click outside, scrolling, a route change, or moving the pointer away.
 * Colour: white over dark/blue areas, black over white/light ones.
 */
const RAW = 'https://raw.githubusercontent.com/Harbor-K/';
const WORK_LIST = [
  {
    name: 'Trust Bank',
    sub: 'Rewards UX revamp',
    href: '#/trust-bank',
    icon: PROJECT_ICONS.trust,
    video: `${RAW}harbor-pf/main/assets/trust-bank/hero-sfx-v2.mp4`,
    poster: `${RAW}harbor-pf/main/assets/trust-bank/hero-sfx-v2-poster.jpg`,
  },
  {
    name: 'GameCove',
    sub: 'AI analytics dashboard',
    href: '#/gamecove',
    icon: PROJECT_ICONS.gamecove,
    video: `${RAW}landing_page/main/gamecove/assets/v4/hero-ad.mp4`,
    poster: `${RAW}landing_page/main/gamecove/assets/v4/hero-ad-poster.jpg`,
  },
  { name: 'UTrada', sub: 'Trading platform design system', href: '#/utrada', icon: PROJECT_ICONS.utrada, video: '', poster: '' },
];
const BLACK = '#000000';
const HEADER_H = 56;

// mega menu (about 2/3 of the first 820px version)
const PANEL_W = 560;
const LIST_W = 200;
const PREVIEW_W = PANEL_W - LIST_W - 6 * 3; // 342
const EASE = 'cubic-bezier(.22,1,.36,1)';

const lum = (c: string) => {
  const m = c.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const [r, g, b, a = '1'] = m[1].split(',').map((x) => x.trim());
  if (parseFloat(a) < 0.5) return null;
  return (0.2126 * +r + 0.7152 * +g + 0.0722 * +b) / 255;
};
const bgLum = (el: Element | null): number | null => {
  let node: Element | null = el;
  while (node) {
    const cs = getComputedStyle(node);
    const l = lum(cs.backgroundColor);
    if (l !== null) return l;
    if (cs.backgroundImage && cs.backgroundImage !== 'none' && /gradient/.test(cs.backgroundImage)) {
      const first = cs.backgroundImage.match(/rgba?\([^)]+\)/);
      if (first) {
        const fl = lum(first[0]);
        if (fl !== null) return fl;
      }
    }
    node = node.parentElement;
  }
  return null;
};

const onAboutPage = () => window.location.hash === '#/about';

/** the right-hand pane: each case's main video (muted, looping); only the shown one plays */
function ProjectPreview({ open, active }: { open: boolean; active: number }) {
  const vids = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    vids.current.forEach((v, i) => {
      if (!v) return;
      if (open && i === active) {
        v.muted = true;
        v.play().catch(() => {});
      } else v.pause();
    });
  }, [open, active]);

  return (
    <a
      href={WORK_LIST[active].href}
      tabIndex={-1}
      aria-hidden
      className="relative block shrink-0 self-stretch overflow-hidden rounded-[10px]"
      style={{ width: PREVIEW_W, minHeight: 200, background: '#18181B' }}
    >
      {WORK_LIST.map((p, i) => {
        const on = i === active;
        return (
          <div
            key={p.href}
            className="absolute inset-0"
            style={{
              opacity: on ? 1 : 0,
              transform: on ? 'scale(1)' : 'scale(1.04)',
              filter: on ? 'blur(0px)' : 'blur(6px)',
              transition: `opacity .45s ease, transform .6s ${EASE}, filter .45s ease`,
            }}
          >
            {p.video ? (
              <video
                ref={(el) => {
                  vids.current[i] = el;
                }}
                src={p.video}
                poster={p.poster}
                muted
                loop
                playsInline
                preload={i === 0 ? 'auto' : 'metadata'}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-[10px]">
                <img src={p.icon} alt="" className="h-12 w-12 rounded-[8px]" />
                <span className="text-[16px] font-bold text-white/70">{p.name}</span>
              </div>
            )}
          </div>
        );
      })}
    </a>
  );
}

export function HomeDock() {
  const [active, setActive] = useState(() => (onAboutPage() ? 'about' : 'home'));
  const [light, setLight] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [open, setOpen] = useState(false);
  const [everOpen, setEverOpen] = useState(false); // the videos load on the first open and stay
  const [hot, setHot] = useState(0); // which project the preview shows
  const workRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef(0);

  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      if (onAboutPage()) setActive('about');
      else {
        const mid = window.innerHeight * 0.5;
        const work = document.getElementById('work');
        const about = document.getElementById('about');
        let cur = 'home';
        if (work && work.getBoundingClientRect().top <= mid) cur = 'work';
        if (about && about.getBoundingClientRect().top <= mid) cur = 'home';
        setActive(cur);
      }
      const under = document.elementsFromPoint(window.innerWidth / 2, HEADER_H / 2).find((el) => !el.closest('[data-home-header]'));
      const l = bgLum(under ?? null);
      setLight(l !== null && l > 0.55);
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    const t = window.setInterval(check, 700);
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    window.addEventListener('hashchange', on);
    return () => {
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
      window.removeEventListener('hashchange', on);
      window.clearInterval(t);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // the Projects menu closes on Esc, a click outside it, scrolling, or a route change
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onDown = (e: PointerEvent) => {
      if (!workRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const close = () => setOpen(false);
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('scroll', close, { passive: true });
    window.addEventListener('hashchange', close);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('scroll', close);
      window.removeEventListener('hashchange', close);
    };
  }, [open]);

  const openNow = () => {
    window.clearTimeout(closeTimer.current);
    setEverOpen(true);
    setOpen(true);
  };
  const closeSoon = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), 180);
  };

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (id === 'about') {
      if (onAboutPage()) window.scrollTo({ top: 0, behavior: 'smooth' });
      else window.location.hash = '#/about';
      return;
    }
    if (onAboutPage()) {
      window.location.hash = '';
      requestAnimationFrame(() => window.scrollTo(0, 0));
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const fg = light ? BLACK : '#FFFFFF';
  const keyFace = light ? BLACK : '#FFFFFF';
  const keyText = light ? '#FFFFFF' : BLACK;
  const linkStyle = (on: boolean): React.CSSProperties => ({
    color: fg,
    opacity: on ? 1 : 0.6,
  });
  const workOn = active === 'work' || open;

  return (
    <header
      data-home-header
      className="fixed inset-x-0 top-0 z-[90]"
      style={{ height: HEADER_H, background: 'transparent', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
    >
      <div className="grid h-full grid-cols-[1fr_auto] items-center px-[16px] md:grid-cols-[1fr_auto_1fr] md:px-[30px]">
        <a
          href="#home"
          onClick={go('home')}
          className="justify-self-start text-[26px] font-bold leading-none tracking-[-0.03em] transition-colors duration-300"
          style={{ color: fg }}
        >
          harbor
        </a>

        <nav aria-label="Primary" className="hidden items-center justify-center gap-[40px] md:flex">
          <div ref={workRef} className="relative" onMouseEnter={openNow} onMouseLeave={closeSoon}>
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={open}
              onClick={() => (open ? setOpen(false) : openNow())}
              onFocus={openNow}
              className="flex items-center gap-[6px] whitespace-nowrap text-[16px] font-bold leading-none transition-all duration-200 hover:opacity-100"
              style={linkStyle(workOn)}
            >
              Projects
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden
                style={{ transform: open ? 'rotate(180deg)' : 'none', transition: `transform .25s ${EASE}` }}
              >
                <path d="M3 5.25L7 9.25L11 5.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* the panel: fixed to the screen centre under the header; its top padding bridges the hover gap */}
            <div
              className="fixed left-1/2 pt-[12px]"
              style={{
                top: HEADER_H - 14,
                width: `min(${PANEL_W}px, calc(100vw - 32px))`,
                transform: `translateX(-50%) translateY(${open ? 0 : -8}px) scale(${open ? 1 : 0.985})`,
                transformOrigin: '50% 0',
                opacity: open ? 1 : 0,
                visibility: open ? 'visible' : 'hidden',
                pointerEvents: open ? 'auto' : 'none',
                transition: open
                  ? `opacity .22s ease, transform .35s ${EASE}, visibility 0s`
                  : `opacity .18s ease, transform .25s ${EASE}, visibility 0s .25s`,
              }}
            >
              <div
                className="flex gap-[6px] overflow-hidden rounded-[14px] p-[6px]"
                style={{
                  background: '#111113',
                  boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 20px 48px rgba(0,0,0,0.35)',
                }}
              >
                <ul role="menu" aria-label="Projects" className="flex shrink-0 flex-col gap-[2px]" style={{ width: LIST_W }}>
                  {WORK_LIST.map((p, i) => {
                    const on = hot === i;
                    return (
                      <li key={p.href} role="none">
                        <a
                          role="menuitem"
                          href={p.href}
                          onMouseEnter={() => setHot(i)}
                          onFocus={() => setHot(i)}
                          onClick={() => setOpen(false)}
                          tabIndex={open ? 0 : -1}
                          className="block rounded-[8px] px-[12px] py-[10px] focus-visible:outline-none"
                          style={{
                            background: on ? 'rgba(255,255,255,0.07)' : 'transparent',
                            opacity: open ? 1 : 0,
                            transform: open ? 'none' : 'translateY(-4px)',
                            transition: `background-color .2s ease, opacity .3s ease ${open ? 0.05 + 0.04 * i : 0}s, transform .35s ${EASE} ${
                              open ? 0.05 + 0.04 * i : 0
                            }s`,
                          }}
                        >
                          <span className="block text-[16px] font-bold leading-[20px]" style={{ color: on ? '#FFFFFF' : 'rgba(255,255,255,0.86)', transition: 'color .2s ease' }}>
                            {p.name}
                          </span>
                          <span className="mt-[2px] block text-[16px] leading-[20px]" style={{ color: on ? '#A1A1AA' : '#71717A', transition: 'color .2s ease' }}>
                            {p.sub}
                          </span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
                {everOpen && <ProjectPreview open={open} active={hot} />}
              </div>
            </div>
          </div>

          <a
            href="#/about"
            onClick={go('about')}
            aria-current={active === 'about' ? 'true' : undefined}
            className="whitespace-nowrap text-[16px] font-bold leading-none transition-all duration-200 hover:opacity-100"
            style={linkStyle(active === 'about')}
          >
            About me
          </a>
        </nav>

        <div className="flex items-center gap-[22px] justify-self-end">
          <a
            href={`mailto:${EMAIL}`}
            className="group hidden items-center gap-[6px] text-[16px] font-bold opacity-80 transition-opacity duration-200 hover:opacity-100 sm:inline-flex"
            style={{ color: fg }}
          >
            Let&apos;s talk
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="transition-transform duration-200 group-hover:-translate-y-[1px] group-hover:translate-x-[1px]">
              <path d="M5 11L11 5M6 5h5v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <a
            href={CV_URL}
            target="_blank"
            rel="noopener noreferrer"
            onMouseLeave={() => setPressed(false)}
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            className="inline-flex h-[36px] items-center rounded-[8px] px-[18px] text-[16px] font-bold hover:opacity-90"
            style={{
              background: keyFace,
              color: keyText,
              transform: pressed ? 'scale(0.96)' : 'none',
              transition: 'transform .12s ease, opacity .2s ease, background-color .3s ease, color .3s ease',
            }}
          >
            {CV_LABEL}
          </a>
        </div>
      </div>
    </header>
  );
}
