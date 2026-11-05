import React from 'react'

type Props = {
  gradient: string
  label?: string
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

// Image placeholder — swap the gradient div for an <img> when real visuals are ready.
export function Placeholder({ gradient, label, className = '', style, children }: Props) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: gradient, ...style }}>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.16] mix-blend-overlay"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,.7) 1px, transparent 1px)',
          backgroundSize: '3px 3px',
        }}
      />
      {label && (
        <span className="absolute left-3 top-3 text-[11px] font-medium tracking-wide text-white/75">{label}</span>
      )}
      {children}
    </div>
  )
}
