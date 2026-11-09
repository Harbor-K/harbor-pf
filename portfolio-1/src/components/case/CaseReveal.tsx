import React, { useLayoutEffect, useRef } from 'react';
import { isCaseSwap, isEmbedView } from './CaseChrome';

/**
 * Calm scroll-reveal for case-study pages.
 * Every block inside a section's content column (eyebrow, heading, paragraph, image, card…)
 * fades up a little as it enters the screen, one after another with a short stagger,
 * so each section settles in piece by piece without anything flying around.
 * Set up before the first paint (layout effect), so nothing shows and then hides again.
 * When the case was opened from a neighbour's live view (CaseChrome), whatever is on screen is shown
 * at once, exactly as the view showed it, so the hand-off has no blink.
 * Inside a live view itself everything is simply shown (it is a still preview of the page).
 * Respects "reduce motion": everything is simply shown.
 */
export function CaseReveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const swap = isCaseSwap();

    // the content column of each section is the 1440px container; reveal its direct children
    const columns = Array.from(root.querySelectorAll<HTMLElement>('main .max-w-\\[1440px\\]'));
    const items: HTMLElement[] = [];
    columns.forEach((col) => {
      Array.from(col.children).forEach((child, i) => {
        const el = child as HTMLElement;
        el.classList.add('reveal');
        el.style.setProperty('--reveal-delay', `${Math.min(i, 4) * 120}ms`);
        items.push(el);
      });
    });

    // added in the same frame as .reveal, so they appear without any fade
    if (reduce || isEmbedView() || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-in'));
      return;
    }

    // things already on screen when the page opens come in right away
    // (no animation at all when the page takes over from a live view)
    const vh = window.innerHeight;
    const still: HTMLElement[] = [];
    items.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (swap) {
        if (r.top < vh && r.bottom > 0) {
          el.style.transition = 'none';
          el.querySelectorAll('img').forEach((img) => ((img as HTMLElement).style.transition = 'none'));
          still.push(el);
          el.classList.add('is-in');
        }
      } else if (r.top < vh * 0.92) el.classList.add('is-in');
    });
    let raf = 0;
    if (still.length) {
      raf = requestAnimationFrame(() => {
        raf = requestAnimationFrame(() => {
          still.forEach((el) => {
            el.style.transition = '';
            el.querySelectorAll('img').forEach((img) => ((img as HTMLElement).style.transition = ''));
          });
        });
      });
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.08 }
    );
    items.filter((el) => !el.classList.contains('is-in')).forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return <div ref={ref}>{children}</div>;
}
