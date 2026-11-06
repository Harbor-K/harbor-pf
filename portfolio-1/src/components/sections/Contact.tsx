import React, { useEffect, useRef, useState } from 'react';
import { EMAIL, INSTAGRAM_URL, BOOK_CALL_URL } from '../../data/content';
import { CV_URL, WHATSAPP_URL } from '../../data/links';
import { KimLLM } from '../KimLLM';
import { OBJECT_URLS, keyCutout } from './deskScene';

/**
 * Site footer, laid out after Harbor's Relume footer reference:
 *  - centred top: small cobalt eyebrow, a big two-line headline, one supporting line;
 *  - in the middle, in a soft grey frame: Kim LLM (the "ask me anything" chat) instead of the reference's image;
 *  - beside it (like her Givingli reference): the desk objects from the hero come down again, SMALL, and are set
 *    down on both sides one after another as the footer scrolls into view — kept off the middle so they never
 *    cover the chat. Standing: laptop, mug. Lying flat: sticky notes, headphones, clipboard, phone.
 *  - four link columns, then a bottom bar: wordmark, copyright, "South Korea" with the live local time, icons.
 * Copy is PLACEHOLDER until Harbor signs it off.
 * On the About page (which already opens with Kim LLM) the chat is replaced by a Book a call button.
 * `dark` is accepted for older callers and ignored.
 */

const COBALT = '#2238D0';
const INK = '#1C1C1E';
const BG = '#F2F1EF';
const LINKEDIN_URL = '[URL]'; // TODO: Harbor's LinkedIn profile URL
const FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';

const COLUMNS: { title: string; links: { label: string; href: string; ext?: boolean }[] }[] = [
  {
    title: 'Work',
    links: [
      { label: 'Trust Bank', href: '#/trust-bank' },
      { label: 'GameCove', href: '#/gamecove' },
      { label: 'UTrada', href: '#/utrada' },
    ],
  },
  {
    title: 'About',
    links: [
      { label: 'About me', href: '#/about' },
      { label: 'CV', href: CV_URL, ext: true },
    ],
  },
  {
    title: 'Contact',
    links: [
      { label: 'Email', href: `mailto:${EMAIL}` },
      { label: 'Book a call', href: BOOK_CALL_URL, ext: true },
      { label: 'WhatsApp', href: WHATSAPP_URL, ext: true },
    ],
  },
  {
    title: 'Elsewhere',
    links: [
      { label: 'LinkedIn', href: LINKEDIN_URL, ext: true },
      { label: 'Instagram', href: INSTAGRAM_URL, ext: true },
    ],
  },
];

// round social icons in the bottom bar (simple line icons, LinkedIn filled)
const SOCIALS: { label: string; href: string; d: string; stroke?: boolean }[] = [
  { label: 'LinkedIn', href: LINKEDIN_URL, d: 'M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.1c0-1.22-.02-2.78-1.7-2.78-1.7 0-1.95 1.32-1.95 2.69V21h-4z' },
  { label: 'Instagram', href: INSTAGRAM_URL, d: 'M7.5 3.5h9a4 4 0 0 1 4 4v9a4 4 0 0 1-4 4h-9a4 4 0 0 1-4-4v-9a4 4 0 0 1 4-4zM12 8.6a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8zM17.3 6.7h.01', stroke: true },
  { label: 'Email', href: `mailto:${EMAIL}`, d: 'M3.5 5.5h17v13h-17zM3.8 6 12 12.2 20.2 6', stroke: true },
  { label: 'Book a call', href: BOOK_CALL_URL, d: 'M4 6h16v14H4zM4 10h16M8 3.5v4M16 3.5v4', stroke: true },
];

/**
 * The objects beside the chat (desktop only). w = picture width in px (small on purpose), tilt in degrees,
 * flat = vertical squash for objects lying down (omit for standing ones).
 */
const DECOR: { kind: string; w: number; tilt: number; flat?: number; style: React.CSSProperties }[] = [
  { kind: 'laptop', w: 200, tilt: -4, style: { left: '6%', top: '12%' } },
  { kind: 'mug', w: 104, tilt: 0, style: { left: '15%', top: '50%' } },
  { kind: 'stickyYellow', w: 118, tilt: -8, flat: 0.88, style: { left: '4%', top: '72%' } },
  { kind: 'headphones', w: 150, tilt: 80, flat: 0.8, style: { right: '8%', top: '10%' } },
  { kind: 'clipboard', w: 120, tilt: -74, flat: 0.62, style: { right: '12%', top: '44%' } },
  { kind: 'phone', w: 92, tilt: -70, flat: 0.68, style: { right: '5%', top: '72%' } },
];

function useSeoulTime() {
  const fmt = () =>
    new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Seoul', hour: 'numeric', minute: '2-digit' }).format(new Date());
  const [t, setT] = useState(fmt);
  useEffect(() => {
    const id = window.setInterval(() => setT(fmt()), 15000);
    return () => window.clearInterval(id);
  }, []);
  return t;
}

export function Contact(_props: { dark?: boolean }) {
  const topRef = useRef<HTMLDivElement>(null);
  const pieceRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [cutouts, setCutouts] = useState<Record<string, string>>({});
  const time = useSeoulTime();
  const onAbout = typeof window !== 'undefined' && window.location.hash === '#/about';

  // key the green-screen photos once (same objects as the hero desk)
  useEffect(() => {
    let alive = true;
    DECOR.forEach((d) => {
      keyCutout(OBJECT_URLS[d.kind]).then((url) => {
        if (alive && url) setCutouts((c) => ({ ...c, [d.kind]: url }));
      });
    });
    return () => {
      alive = false;
    };
  }, []);

  // the objects come down and are set beside the chat, one after another, as the footer comes into view
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    const run = () => {
      raf = 0;
      const el = topRef.current;
      if (!el) return;
      const vh = window.innerHeight;
      const p = reduce ? 1 : Math.min(1, Math.max(0, (vh - el.getBoundingClientRect().top) / (vh * 0.9)));
      pieceRefs.current.forEach((node, i) => {
        if (!node) return;
        const t = Math.min(1, Math.max(0, (p - 0.09 * i) / 0.45));
        // lowered straight down, slowing to a soft touch, then a tiny settle
        const down = t < 0.85 ? 1 - (1 - t / 0.85) ** 2.2 : 1 - 0.02 * Math.sin((Math.PI * (t - 0.85)) / 0.15);
        const rock = t < 0.85 ? 6 * (1 - t) : 2.5 * Math.exp(-5 * (t - 0.85) / 0.15) * Math.cos((2.5 * Math.PI * (t - 0.85)) / 0.15);
        node.style.opacity = String(Math.min(1, t * 3));
        node.style.transform = `translate3d(0, ${(-(1 - down) * 200).toFixed(1)}px, 0) rotate(${(i % 2 ? rock : -rock).toFixed(2)}deg)`;
      });
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(run);
    };
    run();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => {
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const eyebrow = 'text-[16px] font-bold uppercase tracking-[0.08em]';

  return (
    <footer id="contact" className="relative overflow-hidden" style={{ background: BG, color: INK, fontFamily: FONT }}>
      {/* top: headline + Kim LLM, with the desk objects set down on both sides */}
      <div ref={topRef} className="relative px-[16px] pt-[120px] pb-[72px] md:px-6">
        <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden="true">
          {DECOR.map((d, i) => (
            <div
              key={d.kind}
              ref={(el) => {
                pieceRefs.current[i] = el;
              }}
              className="absolute will-change-transform"
              style={{ ...d.style, opacity: 0 }}
            >
              {/* the shadow is drawn on this middle layer so it always falls straight down onto the surface */}
              <div style={{ filter: d.flat ? 'drop-shadow(0 4px 5px rgba(20,22,40,0.22))' : 'drop-shadow(0 12px 10px rgba(20,22,40,0.18)) drop-shadow(0 3px 3px rgba(20,22,40,0.2))' }}>
                {cutouts[d.kind] && (
                  <img
                    src={cutouts[d.kind]}
                    alt=""
                    draggable={false}
                    style={{ width: d.w, height: 'auto', display: 'block', transform: `scaleY(${d.flat ?? 1}) rotate(${d.tilt}deg)` }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="relative z-[1] mx-auto max-w-[760px] text-center">
          <p className={eyebrow} style={{ color: COBALT }}>
            Let&apos;s talk
          </p>
          <h2 className="mt-[14px] font-medium tracking-[-0.035em] text-[40px] leading-[1.06] md:text-[64px]">
            Got a question?
            <br />
            Ask me anything.
          </h2>
          <p className="mt-[20px] text-[18px] leading-[1.5] md:text-[20px]">
            Kim LLM answers from my work on this site. For anything else, book a call.
          </p>
        </div>

        {onAbout ? (
          <div className="relative z-[1] mt-[32px] flex justify-center">
            <a
              href={BOOK_CALL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-[48px] items-center rounded-[8px] bg-[#1C1C1E] px-[22px] text-[16px] font-bold text-white transition-opacity hover:opacity-90"
            >
              Book a call
            </a>
          </div>
        ) : (
          <div className="relative z-[1] mx-auto mt-[32px] max-w-[720px] rounded-[24px] bg-[#E5E4E0] p-[12px] text-left">
            <KimLLM />
          </div>
        )}
      </div>

      {/* link columns */}
      <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-x-6 gap-y-10 px-[16px] py-[48px] md:grid-cols-4 md:px-6">
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className={eyebrow} style={{ color: COBALT }}>
              {col.title}
            </p>
            <ul className="mt-[16px] space-y-[10px]">
              {col.links.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    {...(l.ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="text-[16px] leading-[1.4] transition-colors duration-150 hover:text-[#2238D0]"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* bottom bar */}
      <div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-[16px] pb-[48px] pt-[24px] md:flex-row md:items-center md:justify-between md:px-6">
        <div className="flex flex-wrap items-center gap-x-[18px] gap-y-2">
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              window.location.hash = '';
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-[26px] font-bold leading-none tracking-[-0.03em]"
          >
            harbor
          </a>
          <span className="text-[16px] text-[#6B6B70]">© 2026 Harbor (Jihyun) Kim</span>
          {/* place + live local time (Korea) */}
          <span className="inline-flex items-center gap-[8px] text-[16px] text-[#6B6B70]">
            <span className="h-[6px] w-[6px] rounded-full bg-[#22C55E]" aria-hidden="true" />
            South Korea · <time>{time}</time>
          </span>
        </div>
        <div className="flex items-center">
          {SOCIALS.map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 && <span className="mx-[14px] h-[16px] w-px bg-[rgba(28,28,30,0.18)]" aria-hidden="true" />}
              <a
                href={s.href}
                {...(s.href.startsWith('mailto:') ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
                aria-label={s.label}
                className="flex h-[32px] w-[32px] items-center justify-center rounded-full transition-colors duration-150 hover:bg-white hover:text-[#2238D0]"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  fill={s.stroke ? 'none' : 'currentColor'}
                  stroke={s.stroke ? 'currentColor' : 'none'}
                  strokeWidth={s.stroke ? 1.8 : 0}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                >
                  <path d={s.d} />
                </svg>
              </a>
            </React.Fragment>
          ))}
        </div>
      </div>
    </footer>
  );
}
