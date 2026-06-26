'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Menu, X, MapPin, Calendar, Users, Trophy, Zap, Droplets, ArrowRight,
  Mail, Instagram, CheckCircle2, Sparkles, Ticket, LogOut, Download,
  History, ShieldCheck, Loader2, ChevronRight, Star, Clock, Heart,
  LayoutDashboard, Hourglass, BadgeCheck, CreditCard,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PinkButton, GhostButton, Pill, StarRow, Initials } from '@/components/ui/buttons'
import { PINK, opt, formatDate, formatDateLong, formatTime } from '@/lib/format'
import { toast } from 'sonner'

const HERO_IMAGES = [
  opt('https://images.unsplash.com/photo-1626224583764-f87db24ac4ea', 1400),
  opt('https://images.unsplash.com/photo-1722087642932-9b070e9a066e', 1200),
  opt('https://images.pexels.com/photos/19902436/pexels-photo-19902436.jpeg', 1200),
]
const ABOUT_IMAGE = opt('https://images.pexels.com/photos/8007484/pexels-photo-8007484.jpeg', 1200)
const GALLERY_FALLBACK = [
  opt('https://images.pexels.com/photos/8007484/pexels-photo-8007484.jpeg', 900),
  opt('https://images.pexels.com/photos/8007165/pexels-photo-8007165.jpeg', 900),
  opt('https://images.unsplash.com/photo-1729166241032-5b339506a0d7', 900),
  opt('https://images.pexels.com/photos/26238648/pexels-photo-26238648.jpeg', 900),
  opt('https://images.unsplash.com/photo-1708312604109-16c0be9326cd', 900),
  opt('https://images.pexels.com/photos/36774618/pexels-photo-36774618.jpeg', 900),
  opt('https://images.unsplash.com/photo-1626224583764-f87db24ac4ea', 900),
  opt('https://images.unsplash.com/photo-1722087642932-9b070e9a066e', 900),
].map(src => ({ image_url: src, caption: '' }))

const DEFAULT_CONFIG = {
  club_name: 'The Baddy Club',
  tagline: 'We Jump & Smash.',
  hero_kicker: 'Weekend Social Badminton · Bengaluru',
  hero_copy: 'A weekend-driven social badminton club for players who want sweat, smashes and a circle that shows up. Pay-per-session. No memberships. Just show up.',
  contact_email: 'thebaddyclub@gmail.com',
  instagram_url: '#',
  hydration_partner: 'HYDRASALT',
  stats: [
    { value: '50+', label: 'Weekly Players' },
    { value: '4', label: 'Dedicated Courts' },
    { value: '4.9', label: 'Avg Rating' },
    { value: '∞', label: 'Hydration Provided' },
  ],
}

const STAT_ICONS = [Users, Trophy, Star, Droplets]

/* ---------- Header ---------- */
function Header({ user, config, onLogin, onLogout, onNav, onPortal }) {
  const [open, setOpen] = useState(false)
  const links = [
    { id: 'events', label: 'Events' },
    { id: 'about', label: 'About' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'testimonials', label: 'Players' },
    { id: 'faq', label: 'FAQ' },
  ]
  return (
    <header className="sticky top-0 z-40 glass border-b border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
        <button onClick={() => onNav('top')} className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-glow transition-transform group-hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #F472B6, #DB2777)' }}>
            <span className="font-black text-xl text-white">B</span>
          </div>
          <span className="font-black text-lg md:text-xl tracking-tight">
            {(config.club_name || 'The Baddy Club').toUpperCase()}<span style={{ color: PINK }}>.</span>
          </span>
        </button>
        <nav className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <button key={l.id} onClick={() => onNav(l.id)} className="px-3.5 py-2 text-sm font-medium text-muted-foreground hover:text-[#E65C9C] transition-colors">
              {l.label}
            </button>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-2.5">
          {user?.is_admin && (
            <a href="/admin" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-[#E65C9C] transition-colors px-2">
              <LayoutDashboard className="w-4 h-4" /> Admin
            </a>
          )}
          {user ? (
            <>
              <GhostButton onClick={onPortal} className="px-4 py-2 text-sm">
                <Ticket className="w-4 h-4" /> My Portal
              </GhostButton>
              <button onClick={onLogout} className="w-10 h-10 rounded-full border border-border bg-white flex items-center justify-center text-muted-foreground hover:text-[#E65C9C] shadow-soft transition-colors" title="Logout">
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <PinkButton onClick={onLogin} className="px-5 py-2.5 text-sm">
              Sign In <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </PinkButton>
          )}
        </div>
        <button className="md:hidden w-10 h-10 rounded-xl border border-border bg-white flex items-center justify-center shadow-soft" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-border glass px-4 py-4 flex flex-col gap-2">
          {links.map(l => (
            <button key={l.id} onClick={() => { onNav(l.id); setOpen(false) }} className="text-left text-sm font-semibold py-2.5 px-2 rounded-lg hover:bg-secondary transition-colors">
              {l.label}
            </button>
          ))}
          {user?.is_admin && (
            <a href="/admin" className="text-left text-sm font-semibold py-2.5 px-2 rounded-lg hover:bg-secondary transition-colors flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
            </a>
          )}
          <div className="h-px bg-border my-1" />
          {user ? (
            <>
              <GhostButton onClick={() => { onPortal(); setOpen(false) }} className="w-full"><Ticket className="w-4 h-4" /> My Portal</GhostButton>
              <GhostButton onClick={onLogout} className="w-full"><LogOut className="w-4 h-4" /> Logout</GhostButton>
            </>
          ) : (
            <PinkButton onClick={() => { onLogin(); setOpen(false) }} className="w-full">Sign In</PinkButton>
          )}
        </div>
      )}
    </header>
  )
}

/* ---------- Hero ---------- */
function Hero({ config, onApply, onAbout }) {
  return (
    <section id="top" className="relative overflow-hidden hero-glow">
      <div className="absolute inset-0 grid-pattern opacity-60" />
      <div className="relative max-w-7xl mx-auto px-4 md:px-8 pt-14 md:pt-24 pb-20 md:pb-28 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 animate-fade-up">
          <Pill>
            <Sparkles className="w-3.5 h-3.5" /> {config.hero_kicker}
          </Pill>
          <h1 className="mt-6 font-black text-6xl sm:text-7xl lg:text-8xl leading-[0.9] tracking-tighter">
            We Jump<br />
            <span className="text-gradient">& Smash.</span>
          </h1>
          <p className="mt-7 text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
            {config.hero_copy}
          </p>
          <div className="mt-8 flex flex-wrap gap-3.5">
            <PinkButton onClick={onApply} className="text-base px-7 py-4">
              Request a Spot <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
            </PinkButton>
            <GhostButton onClick={onAbout} className="text-base px-7 py-4">
              Our Story
            </GhostButton>
          </div>
          <div className="mt-10 flex items-center gap-5">
            <div className="flex -space-x-3">
              {['AK', 'PS', 'RM', 'NT'].map((t, i) => (
                <Initials key={i} name={t} className="w-10 h-10 text-xs border-2 border-[#FCFAF6]" />
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1.5"><StarRow /><span className="text-sm font-bold">4.9</span></div>
              <div className="text-xs text-muted-foreground">Loved by 50+ weekend regulars</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 relative animate-fade-up" style={{ animationDelay: '0.15s' }}>
          <div className="relative aspect-[4/5] w-full max-w-md mx-auto">
            <div className="absolute -inset-5 rounded-[2rem] blur-3xl" style={{ background: 'radial-gradient(circle at 60% 30%, rgba(230,92,156,0.35), transparent 70%)' }} />
            <div className="relative h-full w-full rounded-[1.75rem] overflow-hidden border border-border shadow-soft-lg">
              <img src={HERO_IMAGES[0]} alt="Badminton smash" className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(24,22,30,0.55), transparent 55%)' }} />
            </div>
            <div className="absolute -bottom-5 -left-4 md:-left-6 glass-card rounded-2xl shadow-soft-lg border border-border p-4 w-52 animate-float">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Next Session</div>
              <div className="font-black text-xl leading-tight mt-0.5">SUN 9:45 AM</div>
              <div className="text-xs font-bold mt-1.5 flex items-center gap-1" style={{ color: PINK }}>
                <Zap className="w-3.5 h-3.5 fill-[#E65C9C]" /> Apply to grab a spot
              </div>
            </div>
            <div className="absolute -top-3 -right-3 md:-right-5 glass-card rounded-xl shadow-soft border border-border px-4 py-3 animate-float" style={{ animationDelay: '1.5s' }}>
              <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: PINK }}>Hydration Partner</div>
              <div className="font-black text-sm">{config.hydration_partner}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- Stats ---------- */
function Stats({ config }) {
  const stats = (config.stats && config.stats.length ? config.stats : DEFAULT_CONFIG.stats)
  return (
    <section className="border-y border-border bg-white/60">
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-2 lg:grid-cols-4 gap-6 py-10 md:py-12">
        {stats.map((s, i) => {
          const Icon = STAT_ICONS[i % STAT_ICONS.length]
          return (
            <div key={i} className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E65C9C]/10 border border-[#E65C9C]/20 flex items-center justify-center flex-shrink-0">
                <Icon className="w-6 h-6" style={{ color: PINK }} />
              </div>
              <div>
                <div className="font-black text-3xl tracking-tight">{s.value}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{s.label}</div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function SectionHead({ pill, title, accent, copy, center }) {
  return (
    <div className={`mb-12 ${center ? 'text-center max-w-2xl mx-auto' : 'flex flex-col md:flex-row md:items-end justify-between gap-5'}`}>
      <div>
        <Pill>{pill}</Pill>
        <h2 className="mt-4 font-black text-4xl md:text-6xl tracking-tighter leading-[0.95]">
          {title} {accent && <span className="text-gradient">{accent}</span>}
        </h2>
      </div>
      {copy && <p className={`text-muted-foreground text-lg leading-relaxed ${center ? 'mt-4' : 'max-w-md'}`}>{copy}</p>}
    </div>
  )
}

/* ---------- Events ---------- */
function EventCard({ s, onApply, img }) {
  const slotsLeft = s.slots_left
  const soldOut = s.status === 'sold_out' || slotsLeft <= 0
  const scarce = slotsLeft > 0 && slotsLeft <= 5
  const pct = Math.min(100, Math.round((s.slots_booked / s.total_slots) * 100))
  const poster = s.poster_url || img
  const hasPoster = !!s.poster_url
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group bg-card rounded-2xl border border-border shadow-soft lift overflow-hidden flex flex-col"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
        {hasPoster && (
          <img src={poster} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-40" />
        )}
        <img
          src={poster}
          alt={`${s.title} poster`}
          className={`relative w-full h-full transition-transform duration-700 group-hover:scale-[1.03] ${hasPoster ? 'object-contain' : 'object-cover'}`}
        />
        {!hasPoster && <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(24,22,30,0.45), transparent 60%)' }} />}
        {s.badge && (
          <div className="absolute top-3 left-3 z-10 glass-card rounded-full border border-border px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
            {s.badge}
          </div>
        )}
        {scarce && !soldOut && (
          <div className="absolute top-3 right-3 z-10 rounded-full px-3 py-1 text-[10px] font-black uppercase text-white shadow-glow animate-pulse-glow" style={{ backgroundColor: PINK }}>
            Only {slotsLeft} left
          </div>
        )}
        {soldOut && (
          <div className="absolute inset-0 z-10 bg-black/55 backdrop-blur-[2px] flex items-center justify-center">
            <div className="font-black text-2xl text-white tracking-widest border-2 border-white rounded-xl px-6 py-2">SOLD OUT</div>
          </div>
        )}
      </div>
      <div className="p-5 flex-1 flex flex-col">
        {!hasPoster && (
          <>
            <div className="text-xs font-bold uppercase tracking-wider" style={{ color: PINK }}>{s.tagline}</div>
            <h3 className="font-black text-2xl tracking-tight mt-1 leading-tight">{s.title}</h3>
            <div className="mt-4 space-y-2.5 text-sm">
              <div className="flex items-center gap-2.5"><MapPin className="w-4 h-4" style={{ color: PINK }} /> <span className="text-muted-foreground">{s.location_name}</span></div>
              <div className="flex items-center gap-2.5"><Calendar className="w-4 h-4" style={{ color: PINK }} /> <span className="text-muted-foreground">{formatDate(s.date_time)}</span></div>
            </div>
          </>
        )}
        <div className={hasPoster ? '' : 'mt-4'}>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-muted-foreground font-medium">{s.slots_booked}/{s.total_slots} confirmed</span>
            <span className="font-bold" style={{ color: PINK }}>{soldOut ? 'Full' : `${slotsLeft} left`}</span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #F472B6, #DB2777)' }} />
          </div>
        </div>
        <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Per Session</div>
            <div className="font-black text-2xl">₹{s.price}</div>
          </div>
          <PinkButton onClick={() => onApply(s)} disabled={soldOut} className="text-sm px-5 py-2.5">
            {soldOut ? 'Sold Out' : <>Request a Spot <ChevronRight className="w-4 h-4" /></>}
          </PinkButton>
        </div>
      </div>
    </motion.div>
  )
}

function EventsSection({ events, onApply, loading }) {
  return (
    <section id="events" className="relative py-20 md:py-28 section-glow">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <SectionHead
          pill="Upcoming"
          title="This Weekend's"
          accent="Matchups."
          copy="Apply for a spot — we shortlist a balanced mix and send you a payment link to lock it in. No memberships, just rallies."
        />
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" style={{ color: PINK }} /></div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dashed border-border bg-secondary/40 text-muted-foreground">No upcoming events right now — check back soon.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((s, i) => <EventCard key={s.id} s={s} onApply={onApply} img={HERO_IMAGES[(i + 1) % HERO_IMAGES.length]} />)}
          </div>
        )}
      </div>
    </section>
  )
}

/* ---------- About ---------- */
function AboutSection() {
  const features = [
    { icon: Users, title: 'Social First', text: 'Mixed-skill rotations. You will play with new people every session.' },
    { icon: Zap, title: 'High Energy', text: 'Jump shots. Drop shots. Smash games. We come to rally, not to watch.' },
    { icon: ShieldCheck, title: 'Inclusive Vibes', text: 'Beginner or advanced — we balance teams so every game is fair.' },
    { icon: Heart, title: 'Pay-Per-Session', text: 'No lock-ins, no memberships. Apply for the weekends that work for you.' },
  ]
  return (
    <section id="about" className="py-20 md:py-28 bg-white/60 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid lg:grid-cols-2 gap-14 items-center">
        <div className="relative order-2 lg:order-1">
          <div className="absolute -top-6 -left-6 w-28 h-28 rounded-full blur-2xl" style={{ background: 'rgba(230,92,156,0.25)' }} />
          <img src={ABOUT_IMAGE} alt="The Baddy Club community" className="relative rounded-3xl border border-border shadow-soft-lg w-full aspect-[5/4] object-cover" />
          <div className="absolute -bottom-6 -right-4 md:-right-6 glass-card rounded-2xl border border-border shadow-soft-lg p-5 max-w-xs hidden sm:block">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#E65C9C]/10 border border-[#E65C9C]/20 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-6 h-6" style={{ color: PINK }} />
              </div>
              <div>
                <div className="font-bold">Balanced Teams</div>
                <div className="text-xs text-muted-foreground">Every game a fair fight</div>
              </div>
            </div>
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <Pill>The Club</Pill>
          <h2 className="mt-4 font-black text-4xl md:text-6xl tracking-tighter leading-[0.95]">
            Weekends belong<br />on the <span className="text-gradient">court.</span>
          </h2>
          <p className="mt-6 text-muted-foreground text-lg leading-relaxed max-w-md">
            The Baddy Club is a community of weekend warriors who chose badminton over brunch. Inclusive, social, weekend-driven sessions designed to keep you active and connected. Bring a racket, leave with a circle.
          </p>
          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            {features.map((f, i) => (
              <div key={i} className="bg-card rounded-2xl border border-border shadow-soft p-5 lift">
                <div className="w-10 h-10 rounded-xl bg-[#E65C9C]/10 border border-[#E65C9C]/20 flex items-center justify-center">
                  <f.icon className="w-5 h-5" style={{ color: PINK }} />
                </div>
                <div className="font-black text-lg mt-3">{f.title}</div>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- Gallery ---------- */
function GallerySection({ images }) {
  return (
    <section id="gallery" className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <SectionHead pill="Gallery" title="Smashes," accent="Smiles, Sweat." copy="A slice of how our weekends look — community mixers, social hangouts, and on-court rallies." />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {images.map((g, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 8) * 0.05 }}
              className={`group relative overflow-hidden rounded-2xl border border-border shadow-soft ${i % 5 === 0 ? 'row-span-2 aspect-[3/4]' : 'aspect-square'}`}
            >
              <img src={g.image_url} alt={g.caption || ''} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(to top, rgba(230,92,156,0.45), transparent 60%)' }} />
              {g.caption && <div className="absolute bottom-2 left-3 right-3 text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">{g.caption}</div>}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- Venues ---------- */
function VenuesSection({ venues }) {
  if (!venues.length) return null
  return (
    <section id="venues" className="py-20 md:py-28 bg-white/60 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <SectionHead pill="Where We Play" title="Our" accent="courts." copy="Premium indoor courts across Bengaluru. Non-marking shoes mandatory." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map((v) => (
            <div key={v.id} className="group bg-card rounded-2xl border border-border shadow-soft lift overflow-hidden">
              {v.image_url && (
                <div className="h-40 overflow-hidden">
                  <img src={v.image_url} alt={v.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
              )}
              <div className="p-5">
                <div className="font-black text-lg">{v.name}</div>
                {v.address && <div className="mt-1 text-sm text-muted-foreground flex items-center gap-2"><MapPin className="w-4 h-4" style={{ color: PINK }} /> {v.address}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- Testimonials ---------- */
function TestimonialsSection() {
  const items = [
    { name: 'Aarav K.', role: 'Member · 8 months', text: 'Started solo. Now I have a Sunday crew, a half-decent backhand and zero excuses to skip exercise.' },
    { name: 'Priya S.', role: 'Member · 4 months', text: 'Insanely well organized. Apply, get shortlisted, play hard, hydrate. The format is everything.' },
    { name: 'Rohan M.', role: 'Member · 1 year', text: 'The smashes are real, but the people are the actual reason I keep coming back week after week.' },
    { name: 'Neha T.', role: 'Member · 6 months', text: 'Beginner-friendly without being slow. They balance teams so well — every game feels like a final.' },
    { name: 'Dev S.', role: 'Member · 3 months', text: 'Found my weekend tribe here. Great rallies, better people. The vibe is unmatched in the city.' },
    { name: 'Ira M.', role: 'Member · 5 months', text: 'The payment link + QR check-in is slick. Just apply, pay when shortlisted, and turn up.' },
  ]
  return (
    <section id="testimonials" className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <SectionHead center pill="Player Stories" title="Built on" accent="consistency." copy="Real stories from our weekend regulars — 4.9 average from the people who keep showing up." />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 3) * 0.08 }}
              className="bg-card rounded-2xl border border-border shadow-soft p-6 lift"
            >
              <StarRow />
              <p className="mt-4 text-[15px] leading-relaxed text-foreground/80">“{t.text}”</p>
              <div className="mt-5 pt-5 border-t border-border flex items-center gap-3">
                <Initials name={t.name} className="w-10 h-10 text-xs" />
                <div>
                  <div className="font-bold text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- FAQ + Contact ---------- */
function FAQContact({ config }) {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sending, setSending] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    setSending(true)
    try {
      const r = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (r.ok) {
        toast.success("Message received. We'll reply soon!")
        setForm({ name: '', email: '', message: '' })
      } else toast.error('Could not send.')
    } finally { setSending(false) }
  }
  const faqs = [
    { q: 'How does applying work?', a: 'Tap “Request a Spot” on any event. Our team shortlists a balanced mix of players and sends you a payment link — pay to lock your slot and get your QR ticket.' },
    { q: 'Do I need to bring my own racket?', a: 'Yes. Bring your own racket. We keep one backup for emergencies — but rallies feel better with your own gear.' },
    { q: 'Are indoor shoes mandatory?', a: 'Strictly yes. Non-marking indoor shoes only. Outdoor shoes will be politely refused at the court.' },
    { q: 'Cancellation & refund policy?', a: 'Full refund up to 24h before the session. Within 24h, slot is non-refundable but transferable — bring a friend in your place.' },
    { q: 'Beginner-friendly?', a: '100%. We rotate teams to balance skill levels every game — you will always have a fair, fun match.' },
  ]
  return (
    <section id="faq" className="py-20 md:py-28 section-glow">
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid lg:grid-cols-2 gap-14">
        <div>
          <Pill>FAQ</Pill>
          <h2 className="mt-4 font-black text-4xl md:text-5xl tracking-tighter leading-[0.95]">
            Questions,<br /><span className="text-gradient">answered.</span>
          </h2>
          <Accordion type="single" collapsible className="mt-8 space-y-3">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`i${i}`} className="border border-border rounded-2xl bg-card shadow-soft px-5 overflow-hidden">
                <AccordionTrigger className="font-semibold text-[15px] hover:no-underline">{f.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        <div>
          <Pill>Contact</Pill>
          <h2 className="mt-4 font-black text-4xl md:text-5xl tracking-tighter leading-[0.95]">
            Say <span className="text-gradient">hello.</span>
          </h2>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={`mailto:${config.contact_email}`} className="inline-flex items-center gap-2 bg-card rounded-full border border-border shadow-soft px-4 py-2.5 text-sm font-semibold hover:border-[#E65C9C]/40 transition-colors">
              <Mail className="w-4 h-4" style={{ color: PINK }} /> {config.contact_email}
            </a>
            <span className="inline-flex items-center gap-2 bg-card rounded-full border border-border shadow-soft px-4 py-2.5 text-sm font-semibold">
              <MapPin className="w-4 h-4" style={{ color: PINK }} /> Mahadevpura, Bengaluru
            </span>
          </div>
          <form onSubmit={submit} className="mt-7 space-y-4 bg-card rounded-2xl border border-border shadow-soft p-6">
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Name</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-1.5 rounded-xl" placeholder="Your name" />
            </div>
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</Label>
              <Input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="mt-1.5 rounded-xl" placeholder="you@email.com" />
            </div>
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Message</Label>
              <Textarea required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="mt-1.5 rounded-xl min-h-[110px]" placeholder="What's up?" />
            </div>
            <PinkButton type="submit" disabled={sending} className="w-full">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Send Message <ArrowRight className="w-4 h-4" /></>}
            </PinkButton>
          </form>
        </div>
      </div>
    </section>
  )
}

/* ---------- Footer ---------- */
function Footer({ config }) {
  return (
    <footer className="bg-foreground text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-14 grid md:grid-cols-3 gap-10 items-start">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #F472B6, #DB2777)' }}>
              <span className="font-black text-white">B</span>
            </div>
            <div className="font-black text-xl">
              {(config.club_name || 'The Baddy Club').toUpperCase()}<span style={{ color: PINK }}>.</span>
            </div>
          </div>
          <p className="text-sm text-white/50 mt-3 max-w-xs leading-relaxed">We Jump & Smash. A weekend-driven social badminton club in Bengaluru.</p>
        </div>
        <div className="md:text-center text-sm text-white/50">
          © {new Date().getFullYear()} {config.club_name || 'The Baddy Club'}<br />Made with smashes in Bengaluru
        </div>
        <div className="flex md:justify-end gap-3">
          <a href={`mailto:${config.contact_email}`} className="w-11 h-11 rounded-xl border border-white/15 flex items-center justify-center text-white/80 hover:text-white hover:border-[#E65C9C] hover:bg-[#E65C9C]/20 transition-colors"><Mail className="w-4 h-4" /></a>
          <a href={config.instagram_url || '#'} className="w-11 h-11 rounded-xl border border-white/15 flex items-center justify-center text-white/80 hover:text-white hover:border-[#E65C9C] hover:bg-[#E65C9C]/20 transition-colors"><Instagram className="w-4 h-4" /></a>
        </div>
      </div>
    </footer>
  )
}

/* ---------- Auth ---------- */
function AuthDialog({ open, onClose, onSuccess }) {
  const [form, setForm] = useState({ email: '', full_name: '', phone: '', skill_level: 'intermediate' })
  const [loading, setLoading] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const r = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Login failed')
      toast.success(`Welcome ${d.user.full_name}!`)
      onSuccess(d.user)
    } catch (e) {
      toast.error(e.message)
    } finally { setLoading(false) }
  }
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md rounded-2xl border border-border shadow-soft-lg p-0 overflow-hidden">
        <div className="p-6">
          <DialogHeader>
            <DialogTitle className="font-black text-3xl tracking-tight">
              Join the <span className="text-gradient">Club.</span>
            </DialogTitle>
            <DialogDescription>One-tap sign in. We just need your email to lock your spots.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="mt-5 space-y-4">
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email *</Label>
              <Input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="mt-1.5 rounded-xl" placeholder="you@email.com" />
            </div>
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</Label>
              <Input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="mt-1.5 rounded-xl" placeholder="Your name" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone</Label>
                <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="mt-1.5 rounded-xl" placeholder="+91..." />
              </div>
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Skill</Label>
                <Select value={form.skill_level} onValueChange={(v) => setForm({ ...form, skill_level: v })}>
                  <SelectTrigger className="mt-1.5 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <PinkButton type="submit" disabled={loading} className="w-full">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Continue <ArrowRight className="w-4 h-4" /></>}
            </PinkButton>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ---------- Apply Drawer ---------- */
function ApplyDrawer({ event, open, onClose, user, onLogin, onApplied }) {
  const [stage, setStage] = useState('form')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) { setStage('form'); setNote('') }
  }, [open])

  if (!event) return null
  const soldOut = event.status === 'sold_out' || event.slots_left <= 0

  const apply = async () => {
    if (!user) { onLogin(); return }
    setSubmitting(true)
    try {
      const r = await fetch('/api/registrations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event_id: event.id, note }) })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Could not submit application')
      setStage('done')
      onApplied && onApplied()
      toast.success('Application submitted!')
    } catch (e) {
      toast.error(e.message)
    } finally { setSubmitting(false) }
  }

  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
      <DrawerContent className="border-t border-border">
        <div className="max-w-2xl mx-auto w-full px-5 pb-8">
          <DrawerHeader className="px-0">
            <DrawerTitle className="font-black text-3xl tracking-tight">
              {stage === 'done' ? <>Application <span className="text-gradient">in.</span></> : <>Request a <span className="text-gradient">Spot.</span></>}
            </DrawerTitle>
            <DrawerDescription>
              {stage === 'done'
                ? "You're on the list. If shortlisted, we'll send a payment link to lock your slot — track it in My Portal."
                : 'Apply for this session. Our team shortlists a balanced mix and sends a payment link to confirm.'}
            </DrawerDescription>
          </DrawerHeader>

          {stage === 'form' && (
            <div className="bg-card rounded-2xl border border-border shadow-soft p-5 mt-2">
              <div className="text-xs font-bold uppercase tracking-wider" style={{ color: PINK }}>{event.tagline}</div>
              <h3 className="font-black text-2xl mt-1">{event.title}</h3>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4" style={{ color: PINK }} /><b>{formatDateLong(event.date_time)}</b></div>
                <div className="flex items-center gap-2"><Clock className="w-4 h-4" style={{ color: PINK }} /><b>{formatTime(event.date_time)}</b></div>
                <div className="flex items-center gap-2 col-span-2"><MapPin className="w-4 h-4" style={{ color: PINK }} /><b>{event.location_name}</b></div>
              </div>
              <div className="mt-4">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Anything we should know? (optional)</Label>
                <Textarea value={note} onChange={e => setNote(e.target.value)} className="mt-1.5 rounded-xl min-h-[80px]" placeholder="Skill level, plus-ones, preferences..." />
              </div>
              <div className="border-t border-border mt-5 pt-5 flex items-end justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Per session (paid if shortlisted)</div>
                  <div className="font-black text-3xl">₹{event.price}</div>
                </div>
              </div>
              <PinkButton onClick={apply} disabled={submitting || soldOut} className="w-full mt-5">
                {soldOut ? 'Sold Out' : submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <>Submit Application <ArrowRight className="w-4 h-4" /></>}
              </PinkButton>
              <p className="text-[10px] text-muted-foreground mt-3 text-center uppercase tracking-wider">Free to apply · You only pay if shortlisted</p>
            </div>
          )}

          {stage === 'done' && (
            <div className="bg-card rounded-2xl border border-border shadow-soft p-6 mt-2 text-center">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-white text-xs font-bold uppercase tracking-wider shadow-glow" style={{ backgroundColor: PINK }}>
                <CheckCircle2 className="w-4 h-4" /> Application Received
              </div>
              <h3 className="font-black text-2xl mt-5">{event.title}</h3>
              <p className="text-muted-foreground text-sm mt-2 max-w-sm mx-auto">
                We review applications and shortlist a balanced mix of players. Watch <b>My Portal</b> for your payment link.
              </p>
              <PinkButton onClick={onClose} className="mt-6">Done</PinkButton>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

/* ---------- Portal ---------- */
const STATUS_STYLES = {
  pending: { label: 'Under Review', cls: 'bg-amber-100 text-amber-700', icon: Hourglass },
  shortlisted: { label: 'Shortlisted', cls: 'bg-[#E65C9C]/10 text-[#C13C7E]', icon: BadgeCheck },
  paid: { label: 'Confirmed', cls: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  rejected: { label: 'Not selected', cls: 'bg-gray-100 text-gray-500', icon: X },
}

function PortalDialog({ open, onClose, user }) {
  const [regs, setRegs] = useState([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/registrations/me')
      const d = await r.json()
      setRegs(d.registrations || [])
    } finally { setLoading(false) }
  }
  useEffect(() => { if (open) load() }, [open])

  const confirmed = useMemo(() => regs.filter(r => r.payment_status === 'paid'), [regs])
  const applications = useMemo(() => regs.filter(r => r.payment_status !== 'paid'), [regs])

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl rounded-2xl border border-border shadow-soft-lg p-0 max-h-[90vh] overflow-y-auto scrollbar-thin">
        <div className="p-6">
          <DialogHeader>
            <DialogTitle className="font-black text-3xl tracking-tight">
              Player <span className="text-gradient">Portal.</span>
            </DialogTitle>
            <DialogDescription className="mt-1">{user?.full_name} · {user?.email}</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="applications" className="mt-5">
            <TabsList>
              <TabsTrigger value="applications"><Ticket className="w-4 h-4 mr-1.5" /> Applications ({applications.length})</TabsTrigger>
              <TabsTrigger value="confirmed"><BadgeCheck className="w-4 h-4 mr-1.5" /> Confirmed ({confirmed.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="applications" className="mt-4 space-y-3">
              {loading && <div className="py-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin" style={{ color: PINK }} /></div>}
              {!loading && applications.length === 0 && (
                <div className="text-center py-12 rounded-2xl border border-dashed border-border bg-secondary/40">
                  <p className="text-muted-foreground">No applications yet. Request a spot on an event and track it here.</p>
                </div>
              )}
              {applications.map(r => {
                const st = STATUS_STYLES[r.status] || STATUS_STYLES.pending
                const StIcon = st.icon
                return (
                  <div key={r.id} className="bg-card rounded-2xl border border-border shadow-soft p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-black text-xl">{r.event?.title || 'Event'}</h4>
                        {r.event && <div className="mt-1.5 text-sm text-muted-foreground flex items-center gap-2"><Calendar className="w-4 h-4" style={{ color: PINK }} /> {formatDateLong(r.event.date_time)} · {formatTime(r.event.date_time)}</div>}
                      </div>
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${st.cls}`}>
                        <StIcon className="w-3 h-3" /> {st.label}
                      </span>
                    </div>
                    {r.status === 'shortlisted' && r.payment_status !== 'paid' && (
                      <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-[#E65C9C]/8 border border-[#E65C9C]/20 p-3">
                        <div className="text-sm">
                          <div className="font-bold text-[#C13C7E]">You're shortlisted! 🎉</div>
                          <div className="text-muted-foreground text-xs">Pay ₹{r.amount} to lock your slot.</div>
                        </div>
                        <PinkButton onClick={() => window.open(`/pay/${r.payment_token}`, '_self')} className="text-sm px-5 py-2.5">
                          <CreditCard className="w-4 h-4" /> Pay now
                        </PinkButton>
                      </div>
                    )}
                  </div>
                )
              })}
            </TabsContent>

            <TabsContent value="confirmed" className="mt-4 space-y-4">
              {!loading && confirmed.length === 0 && (
                <div className="text-center py-12 rounded-2xl border border-dashed border-border bg-secondary/40">
                  <p className="text-muted-foreground">No confirmed sessions yet. Your QR ticket appears here after payment.</p>
                </div>
              )}
              {confirmed.map(r => (
                <div key={r.id} className="bg-card rounded-2xl border border-border shadow-soft p-5 flex flex-col md:flex-row gap-5">
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                      <CheckCircle2 className="w-3 h-3" /> Confirmed
                    </div>
                    <h4 className="font-black text-xl mt-2">{r.event?.title || 'Event'}</h4>
                    {r.event && (
                      <div className="mt-3 text-sm space-y-1.5">
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4" style={{ color: PINK }} /> <b>{formatDateLong(r.event.date_time)} · {formatTime(r.event.date_time)}</b></div>
                        <div className="flex items-center gap-2"><MapPin className="w-4 h-4" style={{ color: PINK }} /> <span className="text-muted-foreground">{r.event.location_name}</span></div>
                      </div>
                    )}
                    <div className="mt-3 text-xs font-mono text-muted-foreground">Token: {r.qr_code_token}</div>
                    <button onClick={() => window.open(`/api/registrations/${r.id}/receipt`, '_blank')} className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C13C7E] hover:text-[#E65C9C]">
                      <Download className="w-3.5 h-3.5" /> Receipt PDF
                    </button>
                  </div>
                  <div className="bg-white rounded-2xl border border-border p-2.5 shadow-soft self-start">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=BADDY-${r.qr_code_token}&bgcolor=ffffff&color=000000&margin=10`}
                      alt="QR" className="w-32 h-32 md:w-36 md:h-36 rounded-lg"
                    />
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ---------- App ---------- */
function App() {
  const [user, setUser] = useState(null)
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const [events, setEvents] = useState([])
  const [gallery, setGallery] = useState(GALLERY_FALLBACK)
  const [venues, setVenues] = useState([])
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [authOpen, setAuthOpen] = useState(false)
  const [portalOpen, setPortalOpen] = useState(false)
  const [applyEvent, setApplyEvent] = useState(null)
  const [pendingApplyAfterAuth, setPendingApplyAfterAuth] = useState(null)

  const loadEvents = async () => {
    setLoadingEvents(true)
    try {
      const r = await fetch('/api/sessions')
      const d = await r.json()
      setEvents(d.sessions || [])
    } finally { setLoadingEvents(false) }
  }
  const loadContent = async () => {
    try {
      const [cRes, gRes, vRes] = await Promise.all([
        fetch('/api/config'), fetch('/api/gallery'), fetch('/api/venues'),
      ])
      const c = await cRes.json(); if (c.config) setConfig({ ...DEFAULT_CONFIG, ...c.config })
      const g = await gRes.json(); if (g.gallery && g.gallery.length) setGallery(g.gallery)
      const v = await vRes.json(); if (v.venues) setVenues(v.venues)
    } catch {}
  }
  const loadUser = async () => {
    try {
      const r = await fetch('/api/auth/me')
      const d = await r.json()
      setUser(d.user)
    } catch {}
  }

  useEffect(() => { loadEvents(); loadContent(); loadUser() }, [])

  const onNav = (id) => {
    if (id === 'top') { window.scrollTo({ top: 0, behavior: 'smooth' }); return }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }
  const handleApply = (s) => {
    if (!user) { setPendingApplyAfterAuth(s); setAuthOpen(true); return }
    setApplyEvent(s)
  }
  const handleAuthSuccess = (u) => {
    setUser(u); setAuthOpen(false)
    if (pendingApplyAfterAuth) { setApplyEvent(pendingApplyAfterAuth); setPendingApplyAfterAuth(null) }
  }
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null); setPortalOpen(false)
    toast.success('Logged out')
  }

  const nextEvent = useMemo(() => events.find(s => s.status !== 'sold_out'), [events])

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FCFAF6' }}>
      <Header user={user} config={config} onLogin={() => setAuthOpen(true)} onLogout={handleLogout} onNav={onNav} onPortal={() => setPortalOpen(true)} />
      <Hero config={config} onApply={() => nextEvent ? handleApply(nextEvent) : onNav('events')} onAbout={() => onNav('about')} />
      <Stats config={config} />
      <EventsSection events={events} onApply={handleApply} loading={loadingEvents} />
      <AboutSection />
      <GallerySection images={gallery} />
      <VenuesSection venues={venues} />
      <TestimonialsSection />
      <FAQContact config={config} />
      <Footer config={config} />

      <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} onSuccess={handleAuthSuccess} />
      <ApplyDrawer
        open={!!applyEvent}
        event={applyEvent}
        onClose={() => setApplyEvent(null)}
        user={user}
        onLogin={() => setAuthOpen(true)}
        onApplied={() => {}}
      />
      <PortalDialog open={portalOpen} onClose={() => setPortalOpen(false)} user={user} />
    </div>
  )
}

export default App
