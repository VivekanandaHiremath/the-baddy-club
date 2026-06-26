'use client'

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint && <span className="text-[11px] text-muted-foreground mt-1 block">{hint}</span>}
    </label>
  )
}

const STATUS = {
  pending: 'bg-amber-100 text-amber-700',
  shortlisted: 'bg-[#E65C9C]/12 text-[#C13C7E]',
  paid: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-gray-100 text-gray-500',
}

export function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${STATUS[status] || STATUS.pending}`}>
      {status}
    </span>
  )
}

export function Empty({ children }) {
  return (
    <div className="text-center py-14 rounded-2xl border border-dashed border-border bg-secondary/40 text-muted-foreground text-sm">
      {children}
    </div>
  )
}

export function PanelHead({ title, subtitle, action }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6">
      <div>
        <h2 className="font-black text-2xl tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
