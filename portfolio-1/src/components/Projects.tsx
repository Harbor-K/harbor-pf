import React from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { Placeholder } from './Placeholder'
import { Reveal } from './Reveal'
import { PROJECTS } from '../data'

// Feature blocks: text bottom-left, big media on the right — like Leonardo's "Create images without limits" sections.
export function Projects() {
  return (
    <section id="work">
      {PROJECTS.map((p, i) => (
        <div
          key={p.id}
          id={p.id}
          className="relative flex min-h-[105vh] flex-col gap-10 px-5 py-24 md:justify-end md:px-7"
        >
          <motion.div
            className="h-[52vh] w-full md:absolute md:bottom-24 md:right-7 md:top-28 md:h-auto md:w-[56%]"
            initial={{ opacity: 0, scale: 0.95, filter: 'blur(16px)' }}
            whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            viewport={{ amount: 0.3 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <Placeholder gradient={p.gradient} className="h-full w-full rounded-[22px]">
              <div className="absolute inset-0 grid place-items-center">
                <span className="font-display text-[clamp(28px,5vw,80px)] text-white/15">{p.client.split(' · ')[0]}</span>
              </div>
              <span className="absolute bottom-4 right-5 text-[12px] text-white/60">(Image / Video)</span>
            </Placeholder>
          </motion.div>

          <Reveal className="relative z-10 max-w-[520px] md:max-w-[38%] lg:max-w-[520px]">
            <p className="mb-5 text-[13px] tracking-wide text-white/50">
              0{i + 1} — {p.client}
            </p>
            <h2 className="font-display text-[clamp(32px,3.6vw,46px)]">
              {p.title[0]}
              <br />
              {p.title[1]}
            </h2>
            <p className="mt-6 text-[18px] leading-[1.35] text-white/85 md:text-[19px]">{p.body}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {p.tags.map((t) => (
                <span key={t} className="rounded-full border border-white/15 px-3 py-1 text-[12px] text-white/70">
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-10 flex gap-4">
              <a href={`#${p.id}`} className="btn-white h-[40px] px-5 text-[14px]">
                View case study
              </a>
              <a href="#" className="btn-outline h-[40px] px-5 text-[14px]">
                Prototype <ArrowUpRight size={14} />
              </a>
            </div>
          </Reveal>
        </div>
      ))}
    </section>
  )
}
