import React from 'react'
import { Reveal } from './Reveal'
import { LINKS, TEAMS } from '../data'

const STYLES = [
  'font-display text-[34px]',
  'text-[38px] font-bold italic tracking-tight',
  'text-[36px] font-semibold lowercase tracking-[-0.04em]',
]

// "Trusted by leading brands" — headline + infinite wordmark strip.
export function Teams() {
  const row = [...TEAMS, ...TEAMS, ...TEAMS, ...TEAMS]
  return (
    <section id="contact" className="py-24">
      <Reveal className="px-6 text-center">
        <h2 className="font-display text-[clamp(36px,5.6vw,86px)]">Where I’ve designed</h2>
        <p className="mx-auto mt-5 max-w-[600px] text-[19px] leading-[1.3] text-white/85">
          Fintech and e-learning teams across Australia and Korea. Open to new roles and freelance work.
        </p>
        <a href={LINKS.cal} target="_blank" rel="noreferrer" className="btn-outline mt-8 h-[44px] px-6 text-[15px]">
          Book a call
        </a>
      </Reveal>
      <div className="mt-16 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
        <div className="marquee-slow flex w-max items-center gap-24 pr-24 text-white/85">
          {[...row, ...row].map((t, i) => (
            <span key={i} className={STYLES[i % STYLES.length]}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
