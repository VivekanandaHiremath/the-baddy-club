'use client'

import { useEffect, useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { PinkButton } from '@/components/ui/buttons'
import { apiGet, apiPut } from '@/lib/adminApi'
import { PINK } from '@/lib/format'
import { toast } from 'sonner'
import { Field, PanelHead } from './ui'

export default function SettingsPanel() {
  const [cfg, setCfg] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    apiGet('admin/config').then(d => setCfg(d.config)).catch(e => toast.error(e.message)).finally(() => setLoading(false))
  }, [])

  const setField = (k, v) => setCfg(c => ({ ...c, [k]: v }))
  const setStat = (i, k, v) => setCfg(c => {
    const stats = [...(c.stats || [])]
    stats[i] = { ...stats[i], [k]: v }
    return { ...c, stats }
  })

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try { await apiPut('admin/config', cfg); toast.success('Site settings saved') }
    catch (err) { toast.error(err.message) } finally { setSaving(false) }
  }

  if (loading) return <div className="py-16 flex justify-center"><Loader2 className="w-6 h-6 animate-spin" style={{ color: PINK }} /></div>
  if (!cfg) return null

  return (
    <div className="max-w-2xl">
      <PanelHead title="Site settings" subtitle="Configure the public Baddy Club page — these power the hero, stats, and footer." />
      <form onSubmit={save} className="space-y-5 bg-card rounded-2xl border border-border shadow-soft p-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Club name"><Input value={cfg.club_name || ''} onChange={e => setField('club_name', e.target.value)} className="rounded-xl" /></Field>
          <Field label="Tagline"><Input value={cfg.tagline || ''} onChange={e => setField('tagline', e.target.value)} className="rounded-xl" /></Field>
        </div>
        <Field label="Hero kicker" hint="Small pill above the headline."><Input value={cfg.hero_kicker || ''} onChange={e => setField('hero_kicker', e.target.value)} className="rounded-xl" /></Field>
        <Field label="Hero copy"><Textarea value={cfg.hero_copy || ''} onChange={e => setField('hero_copy', e.target.value)} className="rounded-xl min-h-[90px]" /></Field>
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Contact email"><Input type="email" value={cfg.contact_email || ''} onChange={e => setField('contact_email', e.target.value)} className="rounded-xl" /></Field>
          <Field label="Instagram URL"><Input value={cfg.instagram_url || ''} onChange={e => setField('instagram_url', e.target.value)} className="rounded-xl" /></Field>
          <Field label="Hydration partner"><Input value={cfg.hydration_partner || ''} onChange={e => setField('hydration_partner', e.target.value)} className="rounded-xl" /></Field>
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Stats strip</span>
          <div className="mt-2 grid sm:grid-cols-2 gap-3">
            {(cfg.stats || []).map((s, i) => (
              <div key={i} className="grid grid-cols-[90px_1fr] gap-2">
                <Input value={s.value} onChange={e => setStat(i, 'value', e.target.value)} className="rounded-xl" placeholder="50+" />
                <Input value={s.label} onChange={e => setStat(i, 'label', e.target.value)} className="rounded-xl" placeholder="Weekly Players" />
              </div>
            ))}
          </div>
        </div>

        <PinkButton type="submit" disabled={saving}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save settings</>}</PinkButton>
      </form>
    </div>
  )
}
