'use client'

import { Star } from 'lucide-react'

export function PinkButton({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`group inline-flex items-center justify-center gap-2 text-white font-semibold rounded-full px-6 py-3 shadow-glow transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 ${className}`}
      style={{ background: 'linear-gradient(135deg, #F472B6 0%, #E65C9C 55%, #DB2777 100%)', ...(props.style || {}) }}
    >
      {children}
    </button>
  )
}

export function GhostButton({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 bg-white text-foreground font-semibold rounded-full px-6 py-3 border border-border shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-[#E65C9C]/40 ${className}`}
    >
      {children}
    </button>
  )
}

export function Pill({ children, className = '' }) {
  return (
    <div className={`inline-flex items-center gap-2 rounded-full border border-[#E65C9C]/25 bg-[#E65C9C]/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#C13C7E] ${className}`}>
      {children}
    </div>
  )
}

export function StarRow({ n = 5 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: n }).map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-[#E65C9C] text-[#E65C9C]" />
      ))}
    </div>
  )
}

export function Initials({ name, className = '' }) {
  const txt = (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div className={`flex items-center justify-center rounded-full text-white font-bold ${className}`}
      style={{ background: 'linear-gradient(135deg, #F472B6, #DB2777)' }}>
      {txt}
    </div>
  )
}
