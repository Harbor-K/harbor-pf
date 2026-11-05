import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { NAV_ITEMS } from '../data/content';
import { CV_URL, CV_LABEL } from '../data/links';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { useHideOnScroll } from '../hooks/useHideOnScroll';

/**
 * Header (used on the About page; the home page uses the hero header + HomeDock instead):
 * a full-width bar with the "harbor" wordmark (name only, no mark) on the left and plain text links
 * on the right (Experience, Projects, About me), ending in a solid pill for the CV.
 *
 * - At the very top it is clear; once you scroll it turns into frosted glass with a hairline under it
 *   and gets a little shorter.
 * - Links are soft grey; hovering darkens them and slides a pale pill in behind them. The section you are in stays dark.
 * - It reads the page under it: over dark sections it switches to a dark glass with white text and a white CV pill,
 *   over light sections it is light glass with a black CV pill.
 * - Scrolling down tucks the bar up out of view; scrolling up brings it back.
 */
const TRAY_DELAY = 0.1;
const ITEM_DELAY = 0.2;
const ITEM_STAGGER = 0.06;

export function FixedNav() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const hidden = useHideOnScroll();
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(false);
  const [hoverId, setHoverId] = useState<string | null>(null);

  // frosted once scrolled; light or dark depending on what is under the bar
  useEffect(() => {
    let raf = 0;
    const lum = (c: string) => {
      const m = c.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const [r, g, b, a = '1'] = m[1].split(',').map((x) => x.trim());
      if (parseFloat(a) < 0.5) return null;
      return (0.2126 * +r + 0.7152 * +g + 0.0722 * +b) / 255;
    };
    const check = () => {
      raf = 0;
      setScrolled(window.scrollY > 8);
      const els = document.elementsFromPoint(window.innerWidth / 2, 40);
      for (const el of els) {
        if (el.closest('[data-site-header]')) continue;
        let node: Element | null = el;
        while (node) {
          const l = lum(getComputedStyle(node).backgroundColor);
          if (l !== null) {
            setDark(l < 0.35);
            return;
          }
          node = node.parentElement;
        }
      }
      setDark(false);
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    const t = window.setInterval(check, 800);
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

  useEffect(() => {
    if (window.location.hash === '#/about') {
      setActiveId('about');
      return;
    }
    const sections = NAV_ITEMS.map((item) => document.getElementById(item.id)).filter((el): el is HTMLElement => !!el);
    if (sections.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const onAboutPage = () => window.location.hash === '#/about';

  const goHomeTo = (id?: string) => {
    window.location.hash = id ? `#${id}` : '';
    let tries = 0;
    const tick = () => {
      const el = id ? document.getElementById(id) : null;
      if (!id) window.scrollTo(0, 0);
      else if (el) el.scrollIntoView({ block: 'start' });
      else if (tries++ < 40) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const handleClick = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (id === 'about') {
      if (onAboutPage()) window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      else window.location.hash = '#/about';
      return;
    }
    if (onAboutPage()) {
      goHomeTo(id);
      return;
    }
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
  };

  const scrollTop = () => (onAboutPage() ? goHomeTo() : window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' }));

  const itemMotion = (i: number) =>
    prefersReducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: -8 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay: ITEM_DELAY + i * ITEM_STAGGER, ease: [0.22, 1, 0.36, 1] },
        };

  const ink = dark ? '#FFFFFF' : '#0A0A0A';
  const soft = dark ? 'rgba(255,255,255,0.62)' : '#6B6B70';
  const pillBg = dark ? 'rgba(255,255,255,0.10)' : 'rgba(10,10,10,0.06)';

  return (
    <div
      data-site-header
      className="fixed inset-x-0 top-0 z-50"
      style={{ transform: `translateY(${hidden ? '-100%' : '0'})`, transition: 'transform 420ms cubic-bezier(0.22, 1, 0.36, 1)', willChange: 'transform' }}
    >
      <motion.header
        initial={prefersReducedMotion ? false : { y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: TRAY_DELAY, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: scrolled ? (dark ? 'rgba(10,10,10,0.62)' : 'rgba(255,255,255,0.72)') : 'transparent',
          backdropFilter: scrolled ? 'saturate(160%) blur(16px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'saturate(160%) blur(16px)' : 'none',
          borderBottom: `1px solid ${scrolled ? (dark ? 'rgba(255,255,255,0.08)' : 'rgba(10,10,10,0.08)') : 'transparent'}`,
          transition: 'background-color .35s ease, border-color .35s ease, backdrop-filter .35s ease',
        }}
      >
        <nav
          aria-label="Primary"
          className="mx-auto flex max-w-[1440px] items-center justify-between gap-[10px] px-4 sm:px-5 md:px-10"
          style={{ height: scrolled ? 64 : 80, transition: 'height .35s cubic-bezier(.22,1,.36,1)' }}
        >
          {/* wordmark: name only */}
          <motion.button
            type="button"
            onClick={scrollTop}
            aria-label="harbor, back to top"
            className="text-[22px] md:text-[24px] font-bold tracking-[-0.03em] select-none"
            style={{ color: ink, transition: 'color .35s ease' }}
            {...itemMotion(0)}
          >
            harbor
          </motion.button>

          <div className="flex items-center gap-[2px] md:gap-[6px] overflow-x-auto no-scrollbar">
            {NAV_ITEMS.map((item, i) => {
              const isActive = activeId === item.id;
              const isHover = hoverId === item.id;
              return (
                <motion.a
                  key={item.id}
                  href={item.id === 'about' ? '#/about' : `#${item.id}`}
                  onClick={handleClick(item.id)}
                  onMouseEnter={() => setHoverId(item.id)}
                  onMouseLeave={() => setHoverId(null)}
                  aria-current={isActive ? 'true' : undefined}
                  className="relative whitespace-nowrap rounded-full px-[8px] sm:px-[12px] md:px-[16px] py-[8px] text-[16px] font-medium tracking-[-0.01em]"
                  style={{ color: isActive || isHover ? ink : soft, transition: 'color .2s ease' }}
                  {...itemMotion(i + 1)}
                >
                  {(isHover || isActive) && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 -z-0 rounded-full"
                      style={{ background: pillBg }}
                      transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                    />
                  )}
                  <span className="relative">{item.label}</span>
                </motion.a>
              );
            })}
            <motion.a
              href={CV_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open CV in a new tab"
              className="ml-[4px] sm:ml-[6px] whitespace-nowrap rounded-full px-[14px] sm:px-[18px] py-[9px] text-[16px] font-semibold tracking-[-0.01em] transition-[background-color,color,transform] duration-200 hover:scale-[1.04] active:scale-[0.98]"
              style={{ background: dark ? '#FFFFFF' : '#0A0A0A', color: dark ? '#0A0A0A' : '#FFFFFF' }}
              {...itemMotion(NAV_ITEMS.length + 1)}
            >
              {CV_LABEL}
            </motion.a>
          </div>
        </nav>
      </motion.header>
    </div>
  );
}
