import React from 'react'
import { Placeholder } from './Placeholder'
import { Reveal } from './Reveal'
import { EXPERIENCE } from '../data'

// "Artist stories"-style ticket cards in an infinite marquee (pauses on hover).
function Ticket({ e }: { e: (typeof EXPERIENCE)[number] }) {
  return (
    <div className="group w-[300px] shrink-0 md:w-[350px]">
      <div className="overflow-hidden rounded-t-[8px]">
        <Placeholder gradient={e.g} className="aspect-square transition-transform duration-700 group-hover:scale-[1.04]">
          <span className="absolute bottom-3 right-4 text-[12px] text-white/60">(Image)</span>
        </Placeholder>
      </div>
      <div className="relative rounded-b-[8px] bg-[#2b2b2b] px-5 pb-5 pt-6">
        <span className="absolute -left-[23px] -top-[23px] h-[46px] w-[46px] rounded-full bg-black" />
        <span className="absolute -right-[23px] -top-[23px] h-[46px] w-[46px] rounded-full bg-black" />
        <h3 className="font-display text-[22px]" style={{ color: e.c }}>
          {e.n}
        </h3>
        <p className="mt-1.5 text-[12.5px]" style={{ color: e.c }}>
          {e.r}
        </p>
      </div>
    </div>
  )
}

export function Experience() {
  const loop = [...EXPERIENCE, ...EXPERIENCE]
  return (
    <section id="experience" className="overflow-hidden py-24">
      <Reveal className="px-4">
        <h2 className="font-display flex items-center justify-center gap-[1.5vw] text-[clamp(40px,8.6vw,150px)] leading-[0.85]">
          <span>Work</span>
          <svg viewBox="0 0 100 130" className="h-[0.9em] w-auto" aria-hidden>
            <path d="M30 0H100L78 50L96 84L70 130H0L22 82L6 48Z" fill="#6F5CEF" />
            <path d="M50 40l6 14 15 1-12 9 4 15-13-8-13 8 4-15-12-9 15-1z" fill="#000" />
          </svg>
          <span>Stories</span>
        </h2>
      </Reveal>

      <div className="mt-12 overflow-hidden">
        <div className="marquee flex w-max gap-[46px] px-[23px]">
          {loop.map((e, i) => (
            <Ticket key={i} e={e} />
          ))}
        </div>
      </div>
    </section>
  )
}
