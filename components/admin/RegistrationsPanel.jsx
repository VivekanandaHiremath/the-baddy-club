'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, Search, Link2, BadgeCheck, X, CreditCard, RefreshCw } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { PinkButton, GhostButton } from '@/components/ui/buttons'
import { apiGet, apiPost } from '@/lib/adminApi'
import { PINK, formatDate, inr } from '@/lib/format'
import { toast } from 'sonner'
import { StatusBadge, Empty, PanelHead } from './ui'

const STATUSES = ['pending', 'shortlisted', 'paid', 'rejected']
const SKILLS = ['beginner', 'intermediate', 'advanced']
const ALL = '__all__'

export default function RegistrationsPanel() {
  const [events, setEvents] = useState([])
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [sel, setSel] = useState(new Set())
  const [filters, setFilters] = useState({ event: ALL, status: ALL, skill: ALL, q: '' })

  useEffect(() => { apiGet('admin/events').then(d => setEvents(d.events || [])).catch(() => {}) }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const qs = new URLSearchParams()
      if (filters.event !== ALL) qs.set('event', filters.event)
      if (filters.status !== ALL) qs.set('status', filters.status)
      if (filters.skill !== ALL) qs.set('skill', filters.skill)
      if (filters.q.trim()) qs.set('q', filters.q.trim())
      const d = await apiGet(`admin/registrations?${qs.toString()}`)
      setRows(d.registrations || [])
      setSel(new Set())
    } catch (e) { toast.error(e.message) } finally { setLoading(false) }
  }, [filters])

  useEffect(() => {
    const t = setTimeout(load, filters.q ? 300 : 0)
    return () => clearTimeout(t)
  }, [load, filters.q])

  const eventName = useMemo(() => Object.fromEntries(events.map(e => [e.id, e.title])), [events])

  const payLink = (token) => `${typeof window !== 'undefined' ? window.location.origin : ''}/pay/${token}`
  const copyLink = async (token) => {
    try { await navigator.clipboard.writeText(payLink(token)); toast.success('Payment link copied to clipboard') }
    catch { window.prompt('Copy payment link:', payLink(token)) }
  }

  const act = async (id, action) => {
    try {
      const d = await apiPost(`admin/registrations/${id}/${action}`, {})
      if (action === 'shortlist') { toast.success('Shortlisted — payment link ready'); if (d.payment_token) copyLink(d.payment_token) }
      else if (action === 'reject') toast.success('Application rejected')
      else if (action === 'mark-paid') toast.success('Marked as paid')
      load()
    } catch (e) { toast.error(e.message) }
  }

  const bulk = async (action) => {
    const ids = [...sel]
    if (!ids.length) return
    try { const d = await apiPost('admin/registrations/bulk', { ids, action }); toast.success(`${action === 'shortlist' ? 'Shortlisted' : 'Rejected'} ${d.updated} application(s)`); load() }
    catch (e) { toast.error(e.message) }
  }

  const toggle = (id) => setSel(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  const allChecked = rows.length > 0 && sel.size === rows.length
  const toggleAll = () => setSel(allChecked ? new Set() : new Set(rows.map(r => r.id)))

  return (
    <div>
      <PanelHead
        title="Registrations"
        subtitle="Filter applicants, shortlist a balanced mix, then share their payment links."
        action={<GhostButton onClick={load} className="px-4 py-2 text-sm"><RefreshCw className="w-4 h-4" /> Refresh</GhostButton>}
      />

      <div className="bg-card rounded-2xl border border-border shadow-soft p-4 mb-5 grid md:grid-cols-[1fr_1fr_1fr_1.4fr] gap-3">
        <Select value={filters.event} onValueChange={(v) => setFilters(f => ({ ...f, event: v }))}>
          <SelectTrigger className="rounded-xl"><SelectValue placeholder="Event" /></SelectTrigger>
          <SelectContent><SelectItem value={ALL}>All events</SelectItem>{events.map(e => <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={filters.status} onValueChange={(v) => setFilters(f => ({ ...f, status: v }))}>
          <SelectTrigger className="rounded-xl"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent><SelectItem value={ALL}>All statuses</SelectItem>{STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={filters.skill} onValueChange={(v) => setFilters(f => ({ ...f, skill: v }))}>
          <SelectTrigger className="rounded-xl"><SelectValue placeholder="Skill" /></SelectTrigger>
          <SelectContent><SelectItem value={ALL}>All skills</SelectItem>{SKILLS.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
        </Select>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={filters.q} onChange={e => setFilters(f => ({ ...f, q: e.target.value }))} className="rounded-xl pl-9" placeholder="Search name or email" />
        </div>
      </div>

      {sel.size > 0 && (
        <div className="flex items-center gap-3 mb-4 rounded-xl bg-[#E65C9C]/8 border border-[#E65C9C]/20 px-4 py-2.5">
          <span className="text-sm font-semibold text-[#C13C7E]">{sel.size} selected</span>
          <PinkButton onClick={() => bulk('shortlist')} className="text-xs px-4 py-2"><BadgeCheck className="w-4 h-4" /> Shortlist</PinkButton>
          <GhostButton onClick={() => bulk('reject')} className="text-xs px-4 py-2"><X className="w-4 h-4" /> Reject</GhostButton>
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
        {loading ? <div className="py-16 flex justify-center"><Loader2 className="w-6 h-6 animate-spin" style={{ color: PINK }} /></div>
          : rows.length === 0 ? <Empty>No registrations match these filters.</Empty>
            : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"><Checkbox checked={allChecked} onCheckedChange={toggleAll} aria-label="Select all" /></TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Skill</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map(r => (
                    <TableRow key={r.id} data-state={sel.has(r.id) ? 'selected' : undefined}>
                      <TableCell><Checkbox checked={sel.has(r.id)} onCheckedChange={() => toggle(r.id)} aria-label="Select row" /></TableCell>
                      <TableCell>
                        <div className="font-semibold">{r.full_name}</div>
                        <div className="text-xs text-muted-foreground">{r.email}{r.phone ? ` · ${r.phone}` : ''}</div>
                      </TableCell>
                      <TableCell className="text-sm">{r.event_title || eventName[r.event_id] || '—'}<div className="text-xs text-muted-foreground">{inr(r.amount)}</div></TableCell>
                      <TableCell className="text-sm capitalize">{r.skill_level}</TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{formatDate(r.created_at)}</TableCell>
                      <TableCell><StatusBadge status={r.status} /></TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1.5">
                          {r.status === 'pending' && (
                            <>
                              <button onClick={() => act(r.id, 'shortlist')} className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-white shadow-glow" style={{ background: 'linear-gradient(135deg,#F472B6,#DB2777)' }} title="Shortlist">Shortlist</button>
                              <button onClick={() => act(r.id, 'reject')} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-red-50 hover:text-red-600 hover:border-red-200" title="Reject"><X className="w-3.5 h-3.5" /></button>
                            </>
                          )}
                          {r.status === 'shortlisted' && r.payment_token && (
                            <>
                              <button onClick={() => copyLink(r.payment_token)} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border border-[#E65C9C]/30 text-[#C13C7E] hover:bg-[#E65C9C]/10" title="Copy payment link"><Link2 className="w-3.5 h-3.5" /> Copy link</button>
                              <button onClick={() => act(r.id, 'mark-paid')} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200" title="Mark paid"><CreditCard className="w-3.5 h-3.5" /></button>
                            </>
                          )}
                          {r.status === 'paid' && <span className="text-xs font-mono text-muted-foreground">{r.qr_code_token}</span>}
                          {r.status === 'rejected' && <span className="text-xs text-muted-foreground">—</span>}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
      </div>
    </div>
  )
}
