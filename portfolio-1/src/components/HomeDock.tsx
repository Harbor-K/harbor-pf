import React, { useEffect, useState } from 'react';
import { EMAIL } from '../data/content';
import { CV_URL, CV_LABEL } from '../data/links';

const ITEMS = [
  { id: 'experience', label: 'Experience' },
  { id: 'work', label: 'Projects' },
  { id: 'about', label: 'About me' },
];
const TRACKED = ['home', 'experience', 'work'];
const COBALT = '#2238D0';
const EXTRUDE = '#1A2BA6';
const EXTRUDE_DEEP = '#121C78';
const SOFT_BLACK = '#1C1C1E';
const HEADER_H = 56;
const textExtrude = (steps: number) =>
  Array.from({ length: steps }, (_, i) => `0 ${i + 1}px 0 ${i === steps - 1 ? EXTRUDE_DEEP : EXTRUDE}`).join(', ');

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

const navOffset = (el: HTMLElement) => ((Number(el.dataset.navOffsetVh) || 0) * window.innerHeight) / 100;
const onAboutPage = () => window.location.hash === '#/about';

export function HomeDock() {
  const [active, setActive] = useState(() => onAboutPage() ? 'about' : 'home');
  const [light, setLight] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [hoverCv, setHoverCv] = useState(false);

  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      if (onAboutPage()) {
        setActive('about');
      } else {
        const mid = window.innerHeight * 0.5;
        let cur = 'home';
        TRACKED.forEach((id) => {
          const el = document.getElementById(id);
          if (el && el.getBoundingClientRect().top + navOffset(el) <= mid) cur = id;
        });
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

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (id === 'about') {
      if (onAboutPage()) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.location.hash = '#/about';
      }
      return;
    }
    if (id === 'home') {
      if (onAboutPage()) {
        window.location.hash = '';
        requestAnimationFrame(() => window.scrollTo(0, 0));
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + navOffset(el), behavior: 'smooth' });
    } else if (onAboutPage()) {
      window.location.hash = `#${id}`;
      let tries = 0;
      const tick = () => {
        const target = document.getElementById(id);
        if (target) target.scrollIntoView({ block: 'start' });
        else if (tries++ < 40) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
  };

  const fg = light ? SOFT_BLACK : '#FFFFFF';
  const depth = pressed ? 0 : hoverCv ? 2 : 4;
  const keyFace = light ? SOFT_BLACK : '#FFFFFF';
  const keyText = light ? '#FFFFFF' : COBALT;
  const keySide = light ? '#3A3A3D' : EXTRUDE;

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
          style={{ color: fg, textShadow: light ? 'none' : textExtrude(3) }}
        >
          harbor
        </a>

        <nav aria-label="Primary" className="hidden items-center justify-center gap-[40px] md:flex">
          {ITEMS.map((it) => {
            const on = active === it.id;
            return (
              <a
                key={it.id}
                href={it.id === 'about' ? '#/about' : `#${it.id}`}
                onClick={go(it.id)}
                aria-current={on ? 'true' : undefined}
                className="whitespace-nowrap text-[16px] font-bold leading-none transition-all duration-200 hover:opacity-100"
                style={{
                  color: fg,
                  opacity: on ? 1 : light ? 0.55 : 0.66,
                  textShadow: on && !light ? textExtrude(2) : 'none',
                  transform: on && !light ? 'translateY(-1px)' : 'none',
                }}
              >
                {it.label}
              </a>
            );
          })}
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
            onMouseEnter={() => setHoverCv(true)}
            onMouseLeave={() => {
              setHoverCv(false);
              setPressed(false);
            }}
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            className="inline-flex h-[36px] items-center rounded-[8px] px-[18px] text-[16px] font-bold"
            style={{
              background: keyFace,
              color: keyText,
              transform: `translateY(${2 - depth}px)`,
              boxShadow: `0 ${depth}px 0 ${keySide}, 0 ${depth + 6}px 14px rgba(5,8,38,${light ? 0.12 : 0.25})`,
              transition: 'transform .12s ease, box-shadow .12s ease, background-color .3s ease, color .3s ease',
            }}
          >
            {CV_LABEL}
          </a>
        </div>
      </div>
    </header>
  );
}
