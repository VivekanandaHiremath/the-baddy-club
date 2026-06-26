'use client'

import { useEffect, useState } from 'react'
import { Loader2, Plus, Pencil, Trash2, MapPin } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { PinkButton, GhostButton } from '@/components/ui/buttons'
import { apiGet, apiPost, apiPut, apiDel } from '@/lib/adminApi'
import { PINK } from '@/lib/format'
import { toast } from 'sonner'
import { Field, Empty, PanelHead } from './ui'

const BLANK = { name: '', address: '', map_url: '', image_url: '' }

export default function VenuesPanel() {
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(BLANK)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try { setVenues((await apiGet('admin/venues')).venues || []) }
    catch (e) { toast.error(e.message) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(BLANK); setOpen(true) }
  const openEdit = (v) => { setEditing(v); setForm({ ...BLANK, ...v }); setOpen(true) }

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) { await apiPut(`admin/venues/${editing.id}`, form); toast.success('Venue updated') }
      else { await apiPost('admin/venues', form); toast.success('Venue added') }
      setOpen(false); load()
    } catch (err) { toast.error(err.message) } finally { setSaving(false) }
  }
  const del = async (v) => {
    if (!window.confirm(`Delete "${v.name}"?`)) return
    try { await apiDel(`admin/venues/${v.id}`); toast.success('Venue deleted'); load() }
    catch (err) { toast.error(err.message) }
  }

  return (
    <div>
      <PanelHead title="Venues" subtitle="Courts shown in the “Where We Play” section." action={<PinkButton onClick={openCreate}><Plus className="w-4 h-4" /> New Venue</PinkButton>} />

      {loading ? <div className="py-16 flex justify-center"><Loader2 className="w-6 h-6 animate-spin" style={{ color: PINK }} /></div>
        : venues.length === 0 ? <Empty>No venues yet.</Empty>
          : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {venues.map(v => (
                <div key={v.id} className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
                  {v.image_url && <div className="h-32 overflow-hidden"><img src={v.image_url} alt={v.name} className="w-full h-full object-cover" /></div>}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-black">{v.name}</div>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(v)} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-secondary"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => del(v)} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-red-50 hover:text-red-600 hover:border-red-200"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    {v.address && <div className="mt-1 text-sm text-muted-foreground flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" style={{ color: PINK }} /> {v.address}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg rounded-2xl border border-border shadow-soft-lg">
          <DialogHeader>
            <DialogTitle className="font-black text-2xl tracking-tight">{editing ? 'Edit venue' : 'New venue'}</DialogTitle>
            <DialogDescription>Image is a hosted URL (uploads come later).</DialogDescription>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4 mt-2">
            <Field label="Name"><Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="rounded-xl" placeholder="Jump & Smash, Mahadevpura" /></Field>
            <Field label="Address"><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="rounded-xl" placeholder="Mahadevpura, Bengaluru" /></Field>
            <Field label="Image URL"><Input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} className="rounded-xl" placeholder="https://images.unsplash.com/..." /></Field>
            <Field label="Map embed URL" hint="Optional OpenStreetMap/Google embed URL."><Input value={form.map_url} onChange={e => setForm({ ...form, map_url: e.target.value })} className="rounded-xl" placeholder="https://www.openstreetmap.org/export/embed.html?..." /></Field>
            <div className="flex gap-3 pt-2">
              <GhostButton type="button" onClick={() => setOpen(false)} className="flex-1">Cancel</GhostButton>
              <PinkButton type="submit" disabled={saving} className="flex-1">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (editing ? 'Save changes' : 'Add venue')}</PinkButton>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
