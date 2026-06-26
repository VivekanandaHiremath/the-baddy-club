'use client'

import { useEffect, useState } from 'react'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { PinkButton } from '@/components/ui/buttons'
import { apiGet, apiPost, apiDel } from '@/lib/adminApi'
import { PINK } from '@/lib/format'
import { toast } from 'sonner'
import { Field, Empty, PanelHead } from './ui'

export default function GalleryPanel() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ image_url: '', caption: '', sort: 0 })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try { setItems((await apiGet('admin/gallery')).gallery || []) }
    catch (e) { toast.error(e.message) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const add = async (e) => {
    e.preventDefault()
    if (!form.image_url) return
    setSaving(true)
    try {
      await apiPost('admin/gallery', { ...form, sort: Number(form.sort) || 0 })
      toast.success('Photo added'); setForm({ image_url: '', caption: '', sort: 0 }); load()
    } catch (err) { toast.error(err.message) } finally { setSaving(false) }
  }
  const del = async (g) => {
    try { await apiDel(`admin/gallery/${g.id}`); toast.success('Photo removed'); load() }
    catch (err) { toast.error(err.message) }
  }

  return (
    <div>
      <PanelHead title="Gallery" subtitle="Photos shown in the public gallery. Add hosted image URLs." />

      <form onSubmit={add} className="bg-card rounded-2xl border border-border shadow-soft p-5 mb-6 grid md:grid-cols-[1fr_200px_90px_auto] gap-3 items-end">
        <Field label="Image URL"><Input required value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} className="rounded-xl" placeholder="https://images.pexels.com/..." /></Field>
        <Field label="Caption"><Input value={form.caption} onChange={e => setForm({ ...form, caption: e.target.value })} className="rounded-xl" placeholder="Optional" /></Field>
        <Field label="Sort"><Input type="number" value={form.sort} onChange={e => setForm({ ...form, sort: e.target.value })} className="rounded-xl" /></Field>
        <PinkButton type="submit" disabled={saving}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Add</>}</PinkButton>
      </form>

      {loading ? <div className="py-16 flex justify-center"><Loader2 className="w-6 h-6 animate-spin" style={{ color: PINK }} /></div>
        : items.length === 0 ? <Empty>No photos yet — the public site falls back to default imagery until you add some.</Empty>
          : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {items.map(g => (
                <div key={g.id} className="group relative aspect-square rounded-2xl overflow-hidden border border-border shadow-soft">
                  <img src={g.image_url} alt={g.caption || ''} className="w-full h-full object-cover" />
                  <button onClick={() => del(g)} className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-white/90 border border-border flex items-center justify-center text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" title="Remove"><Trash2 className="w-4 h-4" /></button>
                  {g.caption && <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2 text-white text-xs">{g.caption}</div>}
                </div>
              ))}
            </div>
          )}
    </div>
  )
}
