import React, { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Placeholder } from './Placeholder'
import { Reveal } from './Reveal'
import { PROCESS } from '../data'

// "Get started"-style section: centered headline + horizontally scrolling cards with thick colour frames.
export function Process() {
  const track = useRef<HTMLDivElement>(null)
  const go = (dir: number) => track.current?.scrollBy({ left: dir * 640, behavior: 'smooth' })

  return (
    <section id="process" className="relative py-28">
      <Reveal className="px-6 text-center">
        <h2 className="font-display text-[clamp(44px,7.4vw,112px)]">
          How I<br />work
        </h2>
        <p className="mx-auto mt-6 max-w-[480px] text-[19px] leading-[1.3] text-white/85">
          A data-driven process from first interview to shipped, localised UI.
        </p>
      </Reveal>

      <div className="relative mt-14">
        <div ref={track} className="no-scrollbar flex snap-x snap-mandatory gap-8 overflow-x-auto px-[8vw] pb-4">
          {PROCESS.map((s, i) => (
            <div key={s.t} className="relative w-[min(600px,82vw)] shrink-0 snap-center rounded-[26px] p-[16px]" style={{ background: s.c }}>
              <Placeholder
                gradient="linear-gradient(160deg,#2a2a2a,#0d0d0d)"
                className="aspect-[16/10] rounded-[14px]"
              >
                <span className="absolute bottom-3 right-4 text-[12px] text-white/50">(Image)</span>
              </Placeholder>
              <div className="flex items-end justify-between gap-4 px-2 pb-1 pt-4 text-black">
                <div>
                  <p className="text-[12px] font-semibold opacity-60">0{i + 1}</p>
                  <h3 className="font-display text-[26px]">{s.t}</h3>
                </div>
                <p className="max-w-[230px] text-right text-[14px] leading-snug opacity-80">{s.d}</p>
              </div>
              {i === 0 && (
                <a href="#work" className="btn-white absolute right-6 top-6 h-[38px] px-4 text-[13px]">
                  See case studies
                </a>
              )}
            </div>
          ))}
        </div>
        <button
          aria-label="Previous"
          onClick={() => go(-1)}
          className="absolute left-0 top-1/2 grid h-[48px] w-[48px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/40 bg-black/70 pl-5 transition hover:bg-white/10"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          aria-label="Next"
          onClick={() => go(1)}
          className="absolute right-0 top-1/2 grid h-[48px] w-[48px] -translate-y-1/2 translate-x-1/2 place-items-center rounded-full border border-white/40 bg-black/70 pr-5 transition hover:bg-white/10"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  )
}
