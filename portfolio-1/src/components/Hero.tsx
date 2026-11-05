import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { HERO, LINKS } from '../data'

const EASE = [0.22, 1, 0.36, 1] as const
const PURPLE = '#6450E2'

// ── Tunnel words — edit here. Use UPPERCASE. ──
// ceiling: near → far | floor: far → near | walls: small far word + big near word
const TUNNEL = {
  ceiling: { near: 'HARBOR', far: 'KIM' },
  floor: { far: 'BY', near: 'DESIGN' },
  left: { far: 'YOUR', near: 'DATA' },
  right: { far: 'MADE', near: 'CLEAR' },
}

const PERSPECTIVE = 600 // px — camera distance
const DEPTH = 900 // px — how deep the room goes

// SVG text stretched to exactly fill its box (gives the squashed / stretched Leonardo letterforms).
function Word({ t, box }: { t: string; box: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" className="absolute overflow-visible" style={box} aria-hidden>
      <text
        x="0"
        y="1000"
        fontSize="1400"
        textLength="1000"
        lengthAdjust="spacingAndGlyphs"
        fill="currentColor"
        style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 900, fontStretch: '125%' }}
      >
        {t}
      </text>
    </svg>
  )
}

// A real CSS-3D room: ceiling, floor and two walls receding into the screen.
function Tunnel() {
  const plane = 'absolute'
  return (
    <>
      {/* Ceiling — hinged on the top edge of the screen */}
      <div
        className={plane}
        style={{ left: 0, top: 0, width: '100%', height: DEPTH, transformOrigin: '50% 0', transform: 'rotateX(-90deg)' }}
      >
        <Word t={TUNNEL.ceiling.near} box={{ left: '1%', top: '1%', width: '98%', height: '50%' }} />
        <Word t={TUNNEL.ceiling.far} box={{ left: '33%', top: '60%', width: '34%', height: '32%' }} />
      </div>

      {/* Floor — hinged on the bottom edge */}
      <div
        className={plane}
        style={{ left: 0, bottom: 0, width: '100%', height: DEPTH, transformOrigin: '50% 100%', transform: 'rotateX(90deg)' }}
      >
        <Word t={TUNNEL.floor.far} box={{ left: '40%', top: '8%', width: '20%', height: '32%' }} />
        <Word t={TUNNEL.floor.near} box={{ left: '1%', top: '49%', width: '98%', height: '50%' }} />
      </div>

      {/* Left wall — hinged on the left edge */}
      <div
        className={plane}
        style={{ left: 0, top: 0, width: DEPTH, height: '100%', transformOrigin: '0 50%', transform: 'rotateY(90deg)' }}
      >
        <Word t={TUNNEL.left.far} box={{ left: '64%', top: '10%', width: '32%', height: '20%' }} />
        <Word t={TUNNEL.left.near} box={{ left: '1%', top: '34%', width: '92%', height: '58%' }} />
      </div>

      {/* Right wall — hinged on the right edge */}
      <div
        className={plane}
        style={{ right: 0, top: 0, width: DEPTH, height: '100%', transformOrigin: '100% 50%', transform: 'rotateY(-90deg)' }}
      >
        <Word t={TUNNEL.right.far} box={{ left: '4%', top: '10%', width: '32%', height: '20%' }} />
        <Word t={TUNNEL.right.near} box={{ left: '7%', top: '34%', width: '92%', height: '58%' }} />
      </div>
    </>
  )
}

export function Hero() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] })

  // Scroll = camera flies forward into the tunnel, words rush past and grow, then everything fades to black.
  const z = useTransform(p, [0, 1], [0, PERSPECTIVE * 0.86])
  const sceneOpacity = useTransform(p, [0, 0.72, 0.95], [1, 1, 0])
  const textOpacity = useTransform(p, [0, 0.45, 0.7], [1, 1, 0])
  const textBlur = useTransform(p, [0.45, 0.7], ['blur(0px)', 'blur(10px)'])

  return (
    <section id="top" ref={ref} className="relative h-[260vh]">
      <div className="sticky top-0 h-screen overflow-hidden bg-black">
        {/* Load-in: tunnel settles from a slight zoom */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.18 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.6, ease: EASE }}
        >
          <motion.div
            className="absolute inset-0"
            style={{ perspective: PERSPECTIVE, perspectiveOrigin: '50% 50%', opacity: sceneOpacity, color: PURPLE }}
          >
            <motion.div className="absolute inset-0" style={{ transformStyle: 'preserve-3d', z }}>
              <Tunnel />
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          style={{ opacity: textOpacity, filter: textBlur }}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center"
        >
          <motion.h1
            className="font-display text-[clamp(28px,3.4vw,50px)] text-white"
            initial={{ opacity: 0, y: 18, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 0.5, duration: 1, ease: EASE }}
          >
            {HERO.title[0]}
            <br />
            {HERO.title[1]}
          </motion.h1>
          <motion.div
            className="mt-7 flex gap-3.5"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.9, ease: EASE }}
          >
            <a href="#work" className="btn-white h-[46px] px-6 text-[15px]">
              {HERO.primary}
            </a>
            <a href={LINKS.cal} target="_blank" rel="noreferrer" className="btn-outline h-[46px] px-6 text-[15px]">
              {HERO.secondary}
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
