import React from 'react'
import { motion } from 'framer-motion'
import { Reveal } from './Reveal'
import { OUTCOMES } from '../data'

// Big green headline + dome-shaped case-study cards.
export function Outcomes() {
  return (
    <section className="px-5 py-24 md:px-7">
      <Reveal className="text-center">
        <h2 className="font-display text-[clamp(38px,7.2vw,112px)] text-[#13E35F]">
          Design that makes
          <br />
          complex feel simple
        </h2>
        <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-[1.3] text-white/85">
          Selected case studies — from research and definition to systems and prototypes.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-3 md:grid-cols-3">
        {OUTCOMES.map((o, i) => (
          <motion.a
            key={o.mark}
            href={o.href}
            className="group relative flex flex-col items-center px-8 pb-24 pt-16 text-center"
            style={{
              borderRadius: '28px 28px 50% 50% / 28px 28px 44% 44%',
              background: 'linear-gradient(180deg,#141414,#0f0f0f)',
              border: '1px solid rgba(255,255,255,.13)',
            }}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8 }}
            viewport={{ amount: 0.3 }}
            transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="font-display text-[30px] tracking-tight text-white/90">{o.mark}</span>
            <h3 className="mt-20 text-[22px] leading-[1.15] text-white/90">
              {o.h[0]}
              <br />
              {o.h[1]}
            </h3>
            <p className="mt-5 max-w-[310px] text-[14px] leading-snug text-white/50">{o.d}</p>
            <span className="btn-outline mt-16 h-[46px] px-5 text-[15px] group-hover:border-white">See case study</span>
          </motion.a>
        ))}
      </div>
    </section>
  )
}
