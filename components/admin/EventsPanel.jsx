'use client'

import { useEffect, useState } from 'react'
import { Loader2, Plus, Pencil, Trash2, Calendar, MapPin } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PinkButton, GhostButton } from '@/components/ui/buttons'
import { apiGet, apiPost, apiPut, apiDel } from '@/lib/adminApi'
import { formatDate, formatDateInput, inr, PINK } from '@/lib/format'
import { toast } from 'sonner'
import { Field, Empty, PanelHead } from './ui'

const BLANK = { title: '', tagline: '', date_time: '', location_name: '', venue_id: '', total_slots: 16, slots_booked: 0, price: 350, badge: '', status: 'open', poster_url: '' }

export default function EventsPanel() {
  const [events, setEvents] = useState([])
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(BLANK)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [e, v] = await Promise.all([apiGet('admin/events'), apiGet('admin/venues')])
      setEvents(e.events || [])
      setVenues(v.venues || [])
    } catch (err) { toast.error(err.message) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(BLANK); setOpen(true) }
  const openEdit = (ev) => {
    setEditing(ev)
    setForm({ ...BLANK, ...ev, date_time: ev.date_time ? formatDateInput(ev.date_time) : '', venue_id: ev.venue_id || '' })
    setOpen(true)
  }

  const onVenue = (id) => {
    const v = venues.find(x => x.id === id)
    setForm(f => ({ ...f, venue_id: id, location_name: v ? v.name : f.location_name }))
  }

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, total_slots: Number(form.total_slots), slots_booked: Number(form.slots_booked), price: Number(form.price) }
      if (editing) { await apiPut(`admin/events/${editing.id}`, payload); toast.success('Event updated') }
      else { await apiPost('admin/events', payload); toast.success('Event created') }
      setOpen(false); load()
    } catch (err) { toast.error(err.message) } finally { setSaving(false) }
  }

  const del = async (ev) => {
    if (!window.confirm(`Delete "${ev.title}"? This cannot be undone.`)) return
    try { await apiDel(`admin/events/${ev.id}`); toast.success('Event deleted'); load() }
    catch (err) { toast.error(err.message) }
  }

  return (
    <div>
      <PanelHead title="Events" subtitle="Create and manage sessions shown on the public site." action={<PinkButton onClick={openCreate}><Plus className="w-4 h-4" /> New Event</PinkButton>} />

      {loading ? <div className="py-16 flex justify-center"><Loader2 className="w-6 h-6 animate-spin" style={{ color: PINK }} /></div>
        : events.length === 0 ? <Empty>No events yet. Create your first one.</Empty>
          : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {events.map(ev => (
                <div key={ev.id} className="bg-card rounded-2xl border border-border shadow-soft p-5 overflow-hidden">
                  {ev.poster_url && (
                    <div className="-mx-5 -mt-5 mb-3 aspect-[16/9] bg-secondary overflow-hidden">
                      <img src={ev.poster_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-xs font-bold uppercase tracking-wider" style={{ color: PINK }}>{ev.tagline || '—'}</div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(ev)} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-secondary" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => del(ev)} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-red-50 hover:text-red-600 hover:border-red-200" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  <h3 className="font-black text-lg mt-1 leading-tight">{ev.title}</h3>
                  <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4" style={{ color: PINK }} /> {formatDate(ev.date_time)}</div>
                    <div className="flex items-center gap-2"><MapPin className="w-4 h-4" style={{ color: PINK }} /> {ev.location_name || '—'}</div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-sm">
                    <span className="font-bold">{inr(ev.price)}</span>
                    <span className="text-muted-foreground">{ev.slots_booked}/{ev.total_slots} confirmed</span>
                  </div>
                </div>
              ))}
            </div>
          )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg rounded-2xl border border-border shadow-soft-lg max-h-[90vh] overflow-y-auto scrollbar-thin">
          <DialogHeader>
            <DialogTitle className="font-black text-2xl tracking-tight">{editing ? 'Edit event' : 'New event'}</DialogTitle>
            <DialogDescription>Details here power the public event cards.</DialogDescription>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4 mt-2">
            <Field label="Title"><Input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="rounded-xl" placeholder="BaddyClub x HNDRD" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Tagline"><Input value={form.tagline} onChange={e => setForm({ ...form, tagline: e.target.value })} className="rounded-xl" placeholder="Jump & Smash" /></Field>
              <Field label="Date & time"><Input required type="datetime-local" value={form.date_time} onChange={e => setForm({ ...form, date_time: e.target.value })} className="rounded-xl" /></Field>
            </div>
            <Field label="Venue">
              <Select value={form.venue_id || undefined} onValueChange={onVenue}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Pick a venue (optional)" /></SelectTrigger>
                <SelectContent>{venues.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Location name" hint="Auto-filled from venue; editable."><Input value={form.location_name} onChange={e => setForm({ ...form, location_name: e.target.value })} className="rounded-xl" placeholder="Jump & Smash, Mahadevpura" /></Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Total slots"><Input type="number" min="0" value={form.total_slots} onChange={e => setForm({ ...form, total_slots: e.target.value })} className="rounded-xl" /></Field>
              <Field label="Confirmed"><Input type="number" min="0" value={form.slots_booked} onChange={e => setForm({ ...form, slots_booked: e.target.value })} className="rounded-xl" /></Field>
              <Field label="Price ₹"><Input type="number" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="rounded-xl" /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Badge"><Input value={form.badge} onChange={e => setForm({ ...form, badge: e.target.value })} className="rounded-xl" placeholder="Beginner Friendly" /></Field>
              <Field label="Status">
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="Poster image URL" hint="Shown as the full poster on the public event card.">
              <Input value={form.poster_url} onChange={e => setForm({ ...form, poster_url: e.target.value })} className="rounded-xl" placeholder="https://.../poster.jpg" />
            </Field>
            {form.poster_url && (
              <div className="rounded-xl border border-border overflow-hidden bg-secondary">
                <img src={form.poster_url} alt="Poster preview" className="w-full max-h-64 object-contain mx-auto" />
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <GhostButton type="button" onClick={() => setOpen(false)} className="flex-1">Cancel</GhostButton>
              <PinkButton type="submit" disabled={saving} className="flex-1">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (editing ? 'Save changes' : 'Create event')}</PinkButton>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
