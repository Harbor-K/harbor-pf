import React, { useEffect, useRef, useState } from 'react';
import { EMAIL } from '../data/content';
import { CV_URL, CV_LABEL } from '../data/links';
import { PROJECT_ICONS } from './case/projectIcons';

/**
 * Site header (home page, About page): exactly 56px, flush with the top edge, never any background.
 * Menu: "Work" with a down arrow opens a list of the three case studies (hover or click; Esc / click outside
 * closes it), and "About me" (#/about).
 * Colour: white over dark/blue areas, black over white/light ones. No blue extrusion under the wordmark,
 * menu items or the CV button (removed at Harbor's request).
 */
const WORK_LIST = [
  { name: 'Trust Bank', sub: 'Rewards UX revamp', href: '#/trust-bank', icon: PROJECT_ICONS.trust },
  { name: 'GameCove', sub: 'AI analytics dashboard', href: '#/gamecove', icon: PROJECT_ICONS.gamecove },
  { name: 'UTrada', sub: 'Trading platform design system', href: '#/utrada', icon: PROJECT_ICONS.utrada },
];
const BLACK = '#000000';
const HEADER_H = 56;

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

export function HomeDock() {
  const [active, setActive] = useState(() => (onAboutPage() ? 'about' : 'home'));
  const [light, setLight] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [open, setOpen] = useState(false);
  const workRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef(0);

  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      if (onAboutPage()) setActive('about');
      else {
        // on the home page "Work" lights up over the Projects section
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

  // the Work list closes on Esc, a click outside it, scrolling, or a route change
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
    setOpen(true);
  };
  const closeSoon = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), 160);
  };

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (id === 'about') {
      if (onAboutPage()) window.scrollTo({ top: 0, behavior: 'smooth' });
      else window.location.hash = '#/about';
      return;
    }
    // home
    if (onAboutPage()) {
      window.location.hash = '';
      requestAnimationFrame(() => window.scrollTo(0, 0));
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const fg = light ? BLACK : '#FFFFFF';
  // CV button: white on dark areas, black on light ones; flat (no coloured side)
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
          {/* Work: arrow + list of the three case studies */}
          <div ref={workRef} className="relative" onMouseEnter={openNow} onMouseLeave={closeSoon}>
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-[6px] whitespace-nowrap text-[16px] font-bold leading-none transition-all duration-200 hover:opacity-100"
              style={linkStyle(workOn)}
            >
              Work
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden
                style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .25s cubic-bezier(.22,1,.36,1)' }}
              >
                <path d="M3 5.25L7 9.25L11 5.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* the list (padding-top bridges the gap so the hover doesn't drop on the way down) */}
            <div
              className="absolute left-1/2 top-full pt-[14px]"
              style={{
                transform: `translateX(-50%) translateY(${open ? 0 : -6}px)`,
                opacity: open ? 1 : 0,
                pointerEvents: open ? 'auto' : 'none',
                transition: 'opacity .2s ease, transform .25s cubic-bezier(.22,1,.36,1)',
              }}
            >
              <ul
                role="menu"
                aria-label="Work"
                className="w-[380px] rounded-[16px] bg-white p-[8px]"
                style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.06), 0 18px 40px rgba(0,0,0,0.18)' }}
              >
                {WORK_LIST.map((p, i) => (
                  <li key={p.href} role="none">
                    <a
                      role="menuitem"
                      href={p.href}
                      onClick={() => setOpen(false)}
                      tabIndex={open ? 0 : -1}
                      className="group flex items-center gap-[14px] rounded-[10px] px-[10px] py-[10px] transition-colors duration-150 hover:bg-[#F2F2F2] focus-visible:bg-[#F2F2F2] focus-visible:outline-none"
                      style={{
                        opacity: open ? 1 : 0,
                        transform: open ? 'none' : 'translateY(-4px)',
                        transition: `opacity .25s ease ${open ? 0.04 * i : 0}s, transform .3s cubic-bezier(.22,1,.36,1) ${open ? 0.04 * i : 0}s, background-color .15s ease`,
                      }}
                    >
                      <img src={p.icon} alt="" className="h-10 w-10 shrink-0 rounded-[6px] object-cover" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[16px] font-bold leading-[20px] text-black">{p.name}</span>
                        <span className="block truncate text-[16px] leading-[20px] text-[#6B6B70]">{p.sub}</span>
                      </span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        aria-hidden
                        className="shrink-0 text-black opacity-0 transition-all duration-200 group-hover:translate-x-[2px] group-hover:opacity-100 group-focus-visible:opacity-100"
                      >
                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </a>
                  </li>
                ))}
              </ul>
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
