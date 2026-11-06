import React, { useEffect, useState } from 'react';
import { PAGES } from '../sections/Experience';
import { ASSETS } from '../../data/content';
import { Contact } from '../sections/Contact';
import { DARK, SECTION_BG, extrude } from '../theme';

/**
 * Work page (#/work): every case study as a card, on the home hero's blue-dark tone.
 * Big white 3D "Work" heading (the hero headline's cobalt extrusion), then one card per project with
 * its picture, name, title, year and one line — the same wording as the Projects section on the home page.
 * Cards lift on hover like the header's CV key and open the case study. The site footer closes the page.
 */
const IMAGES: Record<string, { src: string; fit: 'cover' | 'contain'; bg: string }> = {
  'TRUST BANK': { src: ASSETS.trustBank, fit: 'cover', bg: DARK.mid },
  GAMECOVE: { src: ASSETS.gamecove, fit: 'cover', bg: DARK.mid },
  UTRADA: { src: ASSETS.utrada, fit: 'contain', bg: '#8301D5' },
};

function Card({ i }: { i: number }) {
  const pg = PAGES[i];
  const img = IMAGES[pg.name];
  const [on, setOn] = useState(false);
  return (
    <a
      href={pg.href}
      onMouseEnter={() => setOn(true)}
      onMouseLeave={() => setOn(false)}
      onFocus={() => setOn(true)}
      onBlur={() => setOn(false)}
      className="group flex flex-col overflow-hidden rounded-[24px] text-white outline-none"
      style={{
        background: pg.bg,
        transform: on ? 'translateY(-6px)' : 'none',
        boxShadow: on ? `0 10px 0 ${DARK.side}, 0 30px 60px rgba(5,8,38,0.5)` : `0 6px 0 ${DARK.side}, 0 18px 40px rgba(5,8,38,0.35)`,
        transition: 'transform .35s cubic-bezier(.22,1,.36,1), box-shadow .35s ease',
        animation: `work-card-in .8s cubic-bezier(.22,1,.36,1) ${0.15 + i * 0.12}s both`,
      }}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden" style={{ background: img?.bg ?? DARK.mid }}>
        {img && (
          <img
            src={img.src}
            alt={pg.name}
            loading={i === 0 ? 'eager' : 'lazy'}
            className={`absolute inset-0 h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.04] ${img.fit === 'cover' ? 'object-cover' : 'object-contain p-[18%]'}`}
          />
        )}
      </div>
      <div className="flex flex-1 flex-col p-6 md:p-8">
        <p className="text-[16px] font-bold tracking-[0.08em]" style={{ color: DARK.lav }}>
          {pg.name} · {pg.year}
        </p>
        <h2
          className="mt-3 font-bold tracking-[-0.03em] leading-[1.02] whitespace-pre-line text-[32px] md:text-[40px]"
          style={{ textShadow: extrude(4), textWrap: 'balance' } as React.CSSProperties}
        >
          {pg.title}
        </h2>
        <p className="mt-4 text-[18px] leading-snug" style={{ color: DARK.mute, textWrap: 'balance' } as React.CSSProperties}>
          {pg.sub}
        </p>
        <span className="mt-auto pt-8 inline-flex items-center gap-2 text-[16px] font-bold">
          View case study
          <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">
            →
          </span>
        </span>
      </div>
    </a>
  );
}

export function WorkPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="home-min16 relative min-h-screen w-full overflow-x-clip text-white" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', background: DARK.navy }}>
      <style>{`@keyframes work-card-in { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: none; } }
        @media (prefers-reduced-motion: reduce) { [style*="work-card-in"] { animation: none !important; } }`}</style>
      <main data-tone="dark" className="relative px-6 pb-[120px] pt-[120px] md:pt-[150px]" style={{ backgroundImage: SECTION_BG }}>
        <div className="mx-auto max-w-[1800px]">
          <h1 className="font-bold leading-[0.9] tracking-[-0.04em]" style={{ fontSize: 'clamp(72px, 12vw, 200px)', textShadow: extrude(10) }}>
            Work
          </h1>
          <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {PAGES.map((_, i) => (
              <Card key={PAGES[i].name} i={i} />
            ))}
          </div>
        </div>
      </main>
      <Contact />
    </div>
  );
}
