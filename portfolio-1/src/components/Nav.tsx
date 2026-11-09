import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { LINKS } from '../data'

// Center nav items — id must match a section id on the page.
const NAV = [
  { label: 'Intro', id: 'top' },
  { label: 'Work', id: 'work' },
  { label: 'Process', id: 'process' },
  { label: 'Experience', id: 'experience' },
  { label: 'Contact', id: 'contact' },
]

const SPRING = { type: 'spring', stiffness: 420, damping: 36, mass: 0.8 } as const

// Scroll-spy: the active item is the last section whose top has passed 40% of the viewport.
function useActiveSection() {
  const [active, setActive] = useState(NAV[0].id)
  useEffect(() => {
    const onScroll = () => {
      const line = window.innerHeight * 0.4
      let current = NAV[0].id
      for (const n of NAV) {
        const el = document.getElementById(n.id)
        if (el && el.getBoundingClientRect().top <= line) current = n.id
      }
      setActive(current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])
  return [active, setActive] as const
}

// Glass capsule with a white pill that slides to the active section and a soft ghost pill that follows hover.
function PillNav() {
  const [active, setActive] = useActiveSection()
  const [hover, setHover] = useState<string | null>(null)

  return (
    <nav
      onMouseLeave={() => setHover(null)}
      className="relative flex items-center gap-[2px] rounded-full p-[5px]"
      style={{
        background: 'rgba(28, 28, 30, 0.55)',
        backdropFilter: 'blur(18px) saturate(1.2)',
        WebkitBackdropFilter: 'blur(18px) saturate(1.2)',
      }}
    >
      {NAV.map((n) => {
        const isActive = active === n.id
        const isHover = hover === n.id && !isActive
        return (
          <a
            key={n.id}
            href={`#${n.id}`}
            onMouseEnter={() => setHover(n.id)}
            onFocus={() => setHover(n.id)}
            onBlur={() => setHover(null)}
            onClick={() => setActive(n.id)}
            aria-current={isActive ? 'true' : undefined}
            className="relative rounded-full px-[15px] py-[8px] text-[14px] leading-[1.2] outline-none"
          >
            <AnimatePresence>
              {isHover && (
                <motion.span
                  key="ghost"
                  layoutId="nav-ghost"
                  className="absolute inset-0 rounded-full bg-white/[0.12]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={SPRING}
                />
              )}
            </AnimatePresence>
            {isActive && (
              <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-white" transition={SPRING} />
            )}
            <span
              className={`relative z-10 transition-[color,opacity] duration-300 ${
                isActive ? 'text-[#0b0b0b]' : 'text-white'
              } ${isHover ? 'opacity-60' : 'opacity-100'}`}
            >
              {n.label}
            </span>
          </a>
        )
      })}
    </nav>
  )
}

export function Nav() {
  const [open, setOpen] = useState(false)
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="progressive-blur pointer-events-none absolute inset-x-0 top-0 h-[104px]" />
      <div className="relative flex h-[84px] items-center justify-between px-5 md:px-7">
        <a href="#top" className="font-display text-[22px] text-white md:text-[26px]">
          HARBOR.KIM
        </a>

        <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block">
          <PillNav />
        </div>

        <div className="flex items-center gap-2.5">
          <a href={LINKS.resume} className="btn-outline hidden h-[34px] px-5 text-[15px] lg:inline-flex">
            Résumé
          </a>
          <a href={LINKS.cal} target="_blank" rel="noreferrer" className="btn-white h-[34px] px-5 text-[15px]">
            Book a call
          </a>
          <button
            aria-label="Menu"
            onClick={() => setOpen(!open)}
            className="ml-1 grid h-[34px] w-[34px] place-items-center rounded-full border border-white/25 md:hidden"
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="relative mx-4 rounded-2xl border border-white/10 bg-black/90 p-5 backdrop-blur-xl md:hidden">
          {NAV.map((n) => (
            <a key={n.id} href={`#${n.id}`} onClick={() => setOpen(false)} className="block py-2.5 text-[17px]">
              {n.label}
            </a>
          ))}
        </div>
      )}
    </header>
  )
}
