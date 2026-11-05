import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion';
import { XIcon } from 'lucide-react';

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
 */

const HEADER_H = 82;
const CONTAINER = 1440;
const EDGE = 20;
const SPRING = { type: 'spring' as const, stiffness: 260, damping: 34 };

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

export function NextProjectCard({ name, href }: { name: string; href: string }) {
  return (
    <section id="next-project" className="bg-white px-5 pb-16 pt-5 md:px-10">
      <a
        href={href}
        className="group mx-auto flex min-h-[420px] max-w-[1440px] flex-col justify-between rounded-[20px] bg-[#1a1a1a] p-8 text-white transition-colors duration-200 hover:bg-[#202020] md:p-12"
      >
        <p className="flex items-center gap-3 font-inter text-[17px] text-[#8e8e95]">
          <span className="h-4 w-4 rounded-full bg-[#9a5cf5]" aria-hidden />
          Next project
        </p>
        <p className="font-inter text-[48px] font-bold leading-none tracking-[-0.96px] transition-transform duration-300 ease-out group-hover:translate-x-2 md:text-[63px]">
          {name} →
        </p>
      </a>
    </section>
  );
}
