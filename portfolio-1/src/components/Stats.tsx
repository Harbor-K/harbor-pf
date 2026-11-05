import React from 'react'
import { motion } from 'framer-motion'
import { STATS } from '../data'

// Giant perspective numbers — left & right columns lean inward like Leonardo's "4B+ / 16 / 235".
export function Stats() {
  return (
    <section id="about" className="relative overflow-hidden py-24 md:py-32" style={{ perspective: 1100 }}>
      <div className="mx-auto grid max-w-[1500px] grid-cols-3 items-end gap-2 px-4 md:px-8">
        {STATS.map((s, i) => (
          <motion.div
            key={s.n + i}
            className="text-center"
            style={{ color: s.color, transformOrigin: 'bottom center' }}
            initial={{ opacity: 0, scaleY: 0.35, filter: 'blur(18px)' }}
            whileInView={{ opacity: 1, scaleY: 1, filter: 'blur(0px)' }}
            viewport={{ amount: 0.4 }}
            transition={{ duration: 1.1, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            <div style={{ transform: `rotateY(${s.tilt}deg)`, transformStyle: 'preserve-3d' }}>
              <div className="font-warp text-[clamp(96px,19vw,320px)] leading-[0.8]" style={{ transform: 'scaleY(1.22)' }}>
                {s.n}
              </div>
              <div className="font-warp mt-6 text-[clamp(22px,4.2vw,70px)] leading-[0.86]">
                {s.label[0]}
                <br />
                {s.label[1]}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
