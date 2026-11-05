import React from 'react'
import { motion } from 'framer-motion'
import { Mail, CalendarDays } from 'lucide-react'
import { BIO, LINKS, PROJECTS } from '../data'

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

const COLS = [
  { h: 'Work', items: PROJECTS.map((p) => ({ t: p.client.split(' · ')[0], href: `#${p.id}` })) },
  {
    h: 'About',
    items: [
      { t: 'Experience', href: '#experience' },
      { t: 'Process', href: '#process' },
      { t: 'Résumé', href: LINKS.resume },
    ],
  },
  {
    h: 'Contact',
    items: [
      { t: 'Email', href: LINKS.email },
      { t: 'Instagram', href: LINKS.instagram },
      { t: 'Book a 30-min call', href: LINKS.cal },
    ],
  },
]

export function Footer() {
  return (
    <footer className="px-5 pt-20 md:px-9">
      <div className="grid gap-14 md:grid-cols-[1.1fr_1fr]">
        <div>
          <div className="flex gap-8 text-white">
            <a href={LINKS.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="hover:text-white/60">
              <InstagramIcon />
            </a>
            <a href={LINKS.email} aria-label="Email" className="hover:text-white/60">
              <Mail size={20} />
            </a>
            <a href={LINKS.cal} target="_blank" rel="noreferrer" aria-label="Book a call" className="hover:text-white/60">
              <CalendarDays size={20} />
            </a>
          </div>
          <p className="mt-10 max-w-[420px] text-[13px] leading-[1.45] text-white/55">{BIO}</p>
          <a href={LINKS.email} className="mt-4 inline-block text-[13px] text-white/80 underline-offset-4 hover:underline">
            {LINKS.emailText}
          </a>
        </div>
        <div className="grid grid-cols-3 gap-6">
          {COLS.map((c) => (
            <div key={c.h}>
              <h4 className="text-[15px] font-semibold">{c.h}</h4>
              <ul className="mt-6 space-y-2.5">
                {c.items.map((it) => (
                  <li key={it.t}>
                    <a href={it.href} className="text-[13px] text-white/60 transition-colors hover:text-white">
                      {it.t}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-20 flex items-end justify-between">
        <span className="text-[13px] text-white/40">Product designer · South Korea</span>
        <span className="text-[22px] font-semibold italic text-[#6F5CEF]">by Harbor</span>
      </div>
      <motion.div
        className="font-display mt-3 select-none whitespace-nowrap text-center text-[10.4vw] leading-[0.86]"
        style={{
          backgroundImage: 'linear-gradient(90deg,#5B4BDB 0%,#3a2f99 50%,#1c1650 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
        }}
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ amount: 0.3 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      >
        Harbor.Kim
      </motion.div>
      <div className="mt-4 flex justify-between border-t border-white/10 py-6 text-[12px] text-white/45">
        <span>© 2026 Harbor Kim</span>
        <a href="#top" className="hover:text-white">Back to top ↑</a>
      </div>
    </footer>
  )
}
