import React from 'react'
import { motion } from 'framer-motion'

// Leonardo-style fade-in-from-blur as a section enters the viewport (and fades back when it leaves).
export function Reveal({
  children,
  className = '',
  delay = 0,
  y = 28,
  once = false,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  y?: number
  once?: boolean
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: 'blur(14px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once, amount: 0.35 }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
