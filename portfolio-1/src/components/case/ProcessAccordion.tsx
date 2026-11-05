import React, { useState } from 'react';
import { BLUE, HELV, INK, SAND, Slot } from './gcKit';

/**
 * Process accordion from Figma "Process accordion" (Active = Empathize … Test).
 * Same behaviour as the Figma prototype: hovering (or clicking / focusing) a card opens it (480 wide)
 * and the others fold to 220, with a 0.35s ease. Open card: stage, step, items, picture.
 * Folded cards: stage and step only. Small screens: all cards open, stacked.
 */

export type Stage = {
  stage: string;
  no: string;
  title: string;
  items: string[];
  img?: string;
  imgRatio?: string;
  slot?: string;
  alt?: string;
};

function Visual({ s }: { s: Stage }) {
  return s.img ? (
    <img src={s.img} alt={s.alt ?? ''} loading="lazy" decoding="async" className="block w-full rounded-[10px]" style={{ aspectRatio: s.imgRatio, objectFit: 'cover', objectPosition: 'top left' }} />
  ) : (
    <Slot label={s.slot ?? ''} ratio={s.imgRatio ?? '420 / 217'} />
  );
}

function Step({ s, wide }: { s: Stage; wide: boolean }) {
  return (
    <p className="flex gap-2 text-[18px] font-bold leading-[26px]" style={{ color: INK }}>
      <span className="pt-[1px] text-[16px]" style={{ color: BLUE }}>
        {s.no}
      </span>
      <span className={wide ? '' : 'max-w-[140px]'}>{s.title}</span>
    </p>
  );
}

export function ProcessAccordion({ stages }: { stages: Stage[] }) {
  const [active, setActive] = useState(0);
  return (
    <div style={{ fontFamily: HELV }}>
      {/* lg and up: the accordion */}
      <div className="hidden h-[520px] gap-5 lg:flex">
        {stages.map((s, i) => {
          const on = i === active;
          return (
            <button
              key={s.stage}
              type="button"
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              aria-expanded={on}
              className="relative flex min-w-0 flex-col items-start justify-start overflow-hidden rounded-[16px] p-[30px] text-left outline-none focus-visible:ring-2 focus-visible:ring-[#2e5bd6]"
              style={{
                flex: on ? '480 1 0' : '220 1 0',
                background: on ? '#ffffff' : SAND,
                boxShadow: on ? '0 20px 40px rgba(0,0,0,0.08)' : 'none',
                transition: 'flex 0.35s cubic-bezier(0.22, 1, 0.36, 1), background-color 0.35s ease, box-shadow 0.35s ease',
              }}
            >
              <p className="text-[24px] font-bold leading-[1.2]" style={{ color: INK }}>
                {s.stage}
              </p>
              <div className="mt-5 w-[420px] max-w-full">
                <Step s={s} wide={on} />
              </div>
              {/* open-card content: fades in once there is room */}
              <div
                className="absolute left-[30px] top-[125px] w-[420px]"
                style={{ maxWidth: on ? 'calc(100% - 60px)' : undefined, opacity: on ? 1 : 0, transition: on ? 'opacity 0.3s ease 0.15s' : 'opacity 0.12s ease', pointerEvents: on ? 'auto' : 'none' }}
                aria-hidden={!on}
              >
                <ul className="flex flex-col gap-2 text-[16px] leading-[24px]" style={{ color: INK }}>
                  {s.items.map((t) => (
                    <li key={t}>· {t}</li>
                  ))}
                </ul>
                <div className="mt-5">
                  <Visual s={s} />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* small screens: every stage open */}
      <div className="flex flex-col gap-4 lg:hidden">
        {stages.map((s) => (
          <div key={s.stage} className="rounded-[16px] bg-white p-6">
            <p className="text-[24px] font-bold leading-[1.2]" style={{ color: INK }}>
              {s.stage}
            </p>
            <div className="mt-4">
              <Step s={s} wide />
            </div>
            <ul className="mt-5 flex flex-col gap-2 text-[16px] leading-[24px]" style={{ color: INK }}>
              {s.items.map((t) => (
                <li key={t}>· {t}</li>
              ))}
            </ul>
            <div className="mt-5">
              <Visual s={s} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
