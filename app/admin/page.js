'use client'

import { useEffect, useState } from 'react'
import {
  LayoutDashboard, CalendarDays, MapPin, Image as ImageIcon, Users, Settings as SettingsIcon,
  Loader2, LogOut, ExternalLink, ShieldAlert,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GhostButton, PinkButton } from '@/components/ui/buttons'
import { PINK } from '@/lib/format'
import AnalyticsPanel from '@/components/admin/AnalyticsPanel'
import EventsPanel from '@/components/admin/EventsPanel'
import VenuesPanel from '@/components/admin/VenuesPanel'
import GalleryPanel from '@/components/admin/GalleryPanel'
import RegistrationsPanel from '@/components/admin/RegistrationsPanel'
import SettingsPanel from '@/components/admin/SettingsPanel'

const TABS = [
  { v: 'overview', label: 'Overview', icon: LayoutDashboard, panel: AnalyticsPanel },
  { v: 'events', label: 'Events', icon: CalendarDays, panel: EventsPanel },
  { v: 'venues', label: 'Venues', icon: MapPin, panel: VenuesPanel },
  { v: 'gallery', label: 'Gallery', icon: ImageIcon, panel: GalleryPanel },
  { v: 'registrations', label: 'Registrations', icon: Users, panel: RegistrationsPanel },
  { v: 'settings', label: 'Settings', icon: SettingsIcon, panel: SettingsPanel },
]

export default function AdminPage() {
  const [state, setState] = useState('loading') // loading | denied | ok
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.user?.is_admin) { setUser(d.user); setState('ok') }
      else if (d.user) { setUser(d.user); setState('denied') }
      else { window.location.href = '/' }
    }).catch(() => setState('denied'))
  }, [])

  const logout = async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/' }

  if (state === 'loading') {
    return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FCFAF6' }}><Loader2 className="w-8 h-8 animate-spin" style={{ color: PINK }} /></div>
  }

  if (state === 'denied') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#FCFAF6' }}>
        <div className="text-center max-w-sm bg-card rounded-3xl border border-border shadow-soft-lg p-8">
          <div className="w-14 h-14 rounded-2xl bg-[#E65C9C]/10 border border-[#E65C9C]/20 flex items-center justify-center mx-auto"><ShieldAlert className="w-7 h-7" style={{ color: PINK }} /></div>
          <h1 className="font-black text-2xl mt-4 tracking-tight">Admins only</h1>
          <p className="text-muted-foreground text-sm mt-2">{user?.email ? `${user.email} isn't on the admin allowlist.` : 'You need an admin account to view this page.'}</p>
          <a href="/"><PinkButton className="mt-6 w-full">Back to site</PinkButton></a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FCFAF6' }}>
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 md:h-18 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-glow" style={{ background: 'linear-gradient(135deg, #F472B6, #DB2777)' }}>
              <span className="font-black text-lg text-white">B</span>
            </div>
            <div>
              <div className="font-black text-base md:text-lg tracking-tight leading-none">Admin<span style={{ color: PINK }}>.</span></div>
              <div className="text-[11px] text-muted-foreground leading-none mt-0.5 hidden sm:block">{user?.email}</div>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <a href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-[#E65C9C] px-2"><ExternalLink className="w-4 h-4" /> <span className="hidden sm:inline">View site</span></a>
            <button onClick={logout} className="w-10 h-10 rounded-full border border-border bg-white flex items-center justify-center text-muted-foreground hover:text-[#E65C9C] shadow-soft" title="Logout"><LogOut className="w-4 h-4" /></button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-7">
          <h1 className="font-black text-3xl md:text-4xl tracking-tight">Dashboard<span style={{ color: PINK }}>.</span></h1>
          <p className="text-muted-foreground mt-1">Manage events, venues, photos, registrations and analytics.</p>
        </div>

        <Tabs defaultValue="overview">
          <div className="overflow-x-auto pb-1 -mx-1 px-1">
            <TabsList className="h-auto p-1 flex-nowrap">
              {TABS.map(t => (
                <TabsTrigger key={t.v} value={t.v} className="gap-1.5 whitespace-nowrap"><t.icon className="w-4 h-4" /> {t.label}</TabsTrigger>
              ))}
            </TabsList>
          </div>
          {TABS.map(t => (
            <TabsContent key={t.v} value={t.v} className="mt-7">
              <t.panel />
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  )
}
