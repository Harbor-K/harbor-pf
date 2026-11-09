import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

// "BUILT FOR [mark] CLARITY" — grey type brightens to white as it scrolls into view.
export function BuiltFor() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] })
  const color = useTransform(scrollYProgress, [0, 1], ['#3a3a3a', '#ececec'])
  const markColor = useTransform(scrollYProgress, [0, 1], ['#221b5e', '#6F5CEF'])
  const y = useTransform(scrollYProgress, [0, 1], [80, 0])

  return (
    <section ref={ref} className="overflow-hidden px-4 py-24 md:py-36">
      <motion.div style={{ y }} className="mx-auto flex max-w-[1250px] items-stretch justify-center gap-[1.2vw]">
        <div className="flex flex-col justify-between">
          <motion.span style={{ color }} className="font-display block origin-top text-[clamp(36px,8vw,128px)] leading-[0.8]">
            <span className="inline-block" style={{ transform: 'scaleY(0.62)', transformOrigin: 'top' }}>
              Built
            </span>
          </motion.span>
          <div className="flex items-end gap-[1.2vw]">
            <motion.span style={{ color }} className="font-warp text-[clamp(70px,14vw,230px)] leading-[0.8]">
              For
            </motion.span>
            <motion.svg viewBox="0 0 120 170" className="h-[clamp(70px,14vw,230px)] w-auto" style={{ color: markColor }}>
              <motion.path
                d="M38 0H120L92 58L112 98L80 170H0L26 112L8 72Z"
                fill="currentColor"
              />
              <circle cx="60" cy="86" r="22" fill="#000" />
              <circle cx="60" cy="86" r="8" fill="currentColor" />
            </motion.svg>
          </div>
        </div>
        <motion.span
          style={{ color }}
          className="font-warp text-[clamp(120px,24vw,400px)] leading-[0.78]"
        >
          <span className="inline-block" style={{ transform: 'scaleX(0.86)', transformOrigin: 'left' }}>
            Clarity
          </span>
        </motion.span>
      </motion.div>
    </section>
  )
}
