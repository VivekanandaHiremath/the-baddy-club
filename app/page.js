'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Menu, X, MapPin, Calendar, Users, Trophy, Zap, Droplets, ArrowRight,
  Mail, Instagram, CheckCircle2, Sparkles, Ticket, LogOut, Download,
  History, ShieldCheck, Loader2, ChevronRight, Star, Clock, Heart,
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
import { toast } from 'sonner'

const PINK = '#E65C9C'

/* Optimize the supplied Unsplash / Pexels URLs on the fly */
const opt = (url, w = 1200) =>
  url.includes('pexels.com')
    ? `${url}?auto=compress&cs=tinysrgb&w=${w}`
    : `${url}?q=80&w=${w}&auto=format&fit=crop`

const HERO_IMAGES = [
  opt('https://images.unsplash.com/photo-1626224583764-f87db24ac4ea', 1400),
  opt('https://images.unsplash.com/photo-1722087642932-9b070e9a066e', 1200),
  opt('https://images.pexels.com/photos/19902436/pexels-photo-19902436.jpeg', 1200),
]
const ABOUT_IMAGE = opt('https://images.pexels.com/photos/8007484/pexels-photo-8007484.jpeg', 1200)
const GALLERY_IMAGES = [
  opt('https://images.pexels.com/photos/8007484/pexels-photo-8007484.jpeg', 900),
  opt('https://images.pexels.com/photos/8007165/pexels-photo-8007165.jpeg', 900),
  opt('https://images.unsplash.com/photo-1729166241032-5b339506a0d7', 900),
  opt('https://images.pexels.com/photos/26238648/pexels-photo-26238648.jpeg', 900),
  opt('https://images.unsplash.com/photo-1708312604109-16c0be9326cd', 900),
  opt('https://images.pexels.com/photos/36774618/pexels-photo-36774618.jpeg', 900),
  opt('https://images.unsplash.com/photo-1626224583764-f87db24ac4ea', 900),
  opt('https://images.unsplash.com/photo-1722087642932-9b070e9a066e', 900),
]

function formatDate(dt) {
  const d = new Date(dt)
  return d.toLocaleString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}
function formatDateLong(dt) {
  const d = new Date(dt)
  return d.toLocaleString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}
function formatTime(dt) {
  const d = new Date(dt)
  return d.toLocaleString('en-IN', { hour: 'numeric', minute: '2-digit' })
}

/* ---------- Primitives ---------- */
function PinkButton({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`group inline-flex items-center justify-center gap-2 text-white font-semibold rounded-full px-6 py-3 shadow-glow transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 ${className}`}
      style={{ background: 'linear-gradient(135deg, #F472B6 0%, #E65C9C 55%, #DB2777 100%)' }}
    >
      {children}
    </button>
  )
}
function GhostButton({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 bg-white text-foreground font-semibold rounded-full px-6 py-3 border border-border shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-[#E65C9C]/40 ${className}`}
    >
      {children}
    </button>
  )
}
function Pill({ children, className = '' }) {
  return (
    <div className={`inline-flex items-center gap-2 rounded-full border border-[#E65C9C]/25 bg-[#E65C9C]/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#C13C7E] ${className}`}>
      {children}
    </div>
  )
}
function StarRow({ n = 5 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: n }).map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-[#E65C9C] text-[#E65C9C]" />
      ))}
    </div>
  )
}
function Initials({ name, className = '' }) {
  const txt = (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div className={`flex items-center justify-center rounded-full text-white font-bold ${className}`}
      style={{ background: 'linear-gradient(135deg, #F472B6, #DB2777)' }}>
      {txt}
    </div>
  )
}

/* ---------- Header ---------- */
function Header({ user, onLogin, onLogout, onNav, onPortal }) {
  const [open, setOpen] = useState(false)
  const links = [
    { id: 'sessions', label: 'Sessions' },
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
            <span className="font-black text-xl text-white" style={{ fontFamily: 'var(--font-inter)' }}>B</span>
          </div>
          <span className="font-black text-lg md:text-xl tracking-tight" style={{ fontFamily: 'var(--font-inter)' }}>
            THE BADDY CLUB<span style={{ color: PINK }}>.</span>
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
function Hero({ onBook, onAbout }) {
  return (
    <section id="top" className="relative overflow-hidden hero-glow">
      <div className="absolute inset-0 grid-pattern opacity-60" />
      <div className="relative max-w-7xl mx-auto px-4 md:px-8 pt-14 md:pt-24 pb-20 md:pb-28 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 animate-fade-up">
          <Pill>
            <Sparkles className="w-3.5 h-3.5" /> Weekend Social Badminton · Bengaluru
          </Pill>
          <h1 className="mt-6 font-black text-6xl sm:text-7xl lg:text-8xl leading-[0.9] tracking-tighter" style={{ fontFamily: 'var(--font-inter)' }}>
            We Jump<br />
            <span className="text-gradient">& Smash.</span>
          </h1>
          <p className="mt-7 text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
            A weekend-driven social badminton club for players who want sweat, smashes and a circle that shows up. Pay-per-session. No memberships. Just show up.
          </p>
          <div className="mt-8 flex flex-wrap gap-3.5">
            <PinkButton onClick={onBook} className="text-base px-7 py-4">
              Book Next Sunday <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
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
              <div className="font-black text-xl leading-tight mt-0.5" style={{ fontFamily: 'var(--font-inter)' }}>SUN 9:45 AM</div>
              <div className="text-xs font-bold mt-1.5 flex items-center gap-1" style={{ color: PINK }}>
                <Zap className="w-3.5 h-3.5 fill-[#E65C9C]" /> Only 4 slots left
              </div>
            </div>
            <div className="absolute -top-3 -right-3 md:-right-5 glass-card rounded-xl shadow-soft border border-border px-4 py-3 animate-float" style={{ animationDelay: '1.5s' }}>
              <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: PINK }}>Hydration Partner</div>
              <div className="font-black text-sm" style={{ fontFamily: 'var(--font-inter)' }}>HYDRASALT</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- Stats ---------- */
function Stats() {
  const stats = [
    { icon: Users, value: '50+', label: 'Weekly Players' },
    { icon: Trophy, value: '4', label: 'Dedicated Courts' },
    { icon: Star, value: '4.9', label: 'Avg Rating' },
    { icon: Droplets, value: '∞', label: 'Hydration Provided' },
  ]
  return (
    <section className="border-y border-border bg-white/60">
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-2 lg:grid-cols-4 gap-6 py-10 md:py-12">
        {stats.map((s, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E65C9C]/10 border border-[#E65C9C]/20 flex items-center justify-center flex-shrink-0">
              <s.icon className="w-6 h-6" style={{ color: PINK }} />
            </div>
            <div>
              <div className="font-black text-3xl tracking-tight" style={{ fontFamily: 'var(--font-inter)' }}>{s.value}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ---------- Section heading ---------- */
function SectionHead({ pill, title, accent, copy, center }) {
  return (
    <div className={`mb-12 ${center ? 'text-center max-w-2xl mx-auto' : 'flex flex-col md:flex-row md:items-end justify-between gap-5'}`}>
      <div>
        <Pill>{pill}</Pill>
        <h2 className="mt-4 font-black text-4xl md:text-6xl tracking-tighter leading-[0.95]" style={{ fontFamily: 'var(--font-inter)' }}>
          {title} {accent && <span className="text-gradient">{accent}</span>}
        </h2>
      </div>
      {copy && <p className={`text-muted-foreground text-lg leading-relaxed ${center ? 'mt-4' : 'max-w-md'}`}>{copy}</p>}
    </div>
  )
}

/* ---------- Sessions ---------- */
function SessionCard({ s, onBook, img }) {
  const slotsLeft = s.slots_left
  const soldOut = s.status === 'sold_out' || slotsLeft <= 0
  const scarce = slotsLeft > 0 && slotsLeft <= 5
  const pct = Math.min(100, Math.round((s.slots_booked / s.total_slots) * 100))
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group bg-card rounded-2xl border border-border shadow-soft lift overflow-hidden flex flex-col"
    >
      <div className="relative h-48 overflow-hidden">
        <img src={img} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(24,22,30,0.45), transparent 60%)' }} />
        <div className="absolute top-3 left-3 glass-card rounded-full border border-border px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
          {s.badge}
        </div>
        {scarce && !soldOut && (
          <div className="absolute top-3 right-3 rounded-full px-3 py-1 text-[10px] font-black uppercase text-white shadow-glow animate-pulse-glow" style={{ backgroundColor: PINK }}>
            Only {slotsLeft} left
          </div>
        )}
        {soldOut && (
          <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px] flex items-center justify-center">
            <div className="font-black text-2xl text-white tracking-widest border-2 border-white rounded-xl px-6 py-2" style={{ fontFamily: 'var(--font-inter)' }}>
              SOLD OUT
            </div>
          </div>
        )}
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="text-xs font-bold uppercase tracking-wider" style={{ color: PINK }}>{s.tagline}</div>
        <h3 className="font-black text-2xl tracking-tight mt-1 leading-tight" style={{ fontFamily: 'var(--font-inter)' }}>{s.title}</h3>
        <div className="mt-4 space-y-2.5 text-sm">
          <div className="flex items-center gap-2.5"><MapPin className="w-4 h-4" style={{ color: PINK }} /> <span className="text-muted-foreground">{s.location_name}</span></div>
          <div className="flex items-center gap-2.5"><Calendar className="w-4 h-4" style={{ color: PINK }} /> <span className="text-muted-foreground">{formatDate(s.date_time)}</span></div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-muted-foreground font-medium">{s.slots_booked}/{s.total_slots} booked</span>
            <span className="font-bold" style={{ color: PINK }}>{soldOut ? 'Full' : `${slotsLeft} left`}</span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #F472B6, #DB2777)' }} />
          </div>
        </div>
        <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Per Session</div>
            <div className="font-black text-2xl" style={{ fontFamily: 'var(--font-inter)' }}>₹{s.price}</div>
          </div>
          <PinkButton onClick={() => onBook(s)} disabled={soldOut} className="text-sm px-5 py-2.5">
            {soldOut ? 'Sold Out' : <>Book Slot <ChevronRight className="w-4 h-4" /></>}
          </PinkButton>
        </div>
      </div>
    </motion.div>
  )
}

function SessionsSection({ sessions, onBook, loading }) {
  return (
    <section id="sessions" className="relative py-20 md:py-28 section-glow">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <SectionHead
          pill="Upcoming"
          title="This Weekend's"
          accent="Matchups."
          copy="Pay per session. No memberships. Slots fill fast — and we promise zero awkward intros, just rallies."
        />
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" style={{ color: PINK }} /></div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((s, i) => <SessionCard key={s.id} s={s} onBook={onBook} img={HERO_IMAGES[(i + 1) % HERO_IMAGES.length]} />)}
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
    { icon: Heart, title: 'Pay-Per-Session', text: 'No lock-ins, no memberships. Book the weekends that work for you.' },
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
          <h2 className="mt-4 font-black text-4xl md:text-6xl tracking-tighter leading-[0.95]" style={{ fontFamily: 'var(--font-inter)' }}>
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
                <div className="font-black text-lg mt-3" style={{ fontFamily: 'var(--font-inter)' }}>{f.title}</div>
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
function GallerySection() {
  return (
    <section id="gallery" className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <SectionHead
          pill="Gallery"
          title="Smashes,"
          accent="Smiles, Sweat."
          copy="A slice of how our weekends look — community mixers, social hangouts, and on-court rallies."
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {GALLERY_IMAGES.map((src, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className={`group relative overflow-hidden rounded-2xl border border-border shadow-soft ${i % 5 === 0 ? 'row-span-2 aspect-[3/4]' : 'aspect-square'}`}
            >
              <img src={src} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(to top, rgba(230,92,156,0.45), transparent 60%)' }} />
            </motion.div>
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
    { name: 'Priya S.', role: 'Member · 4 months', text: 'Insanely well organized. Show up, get teams, play hard, hydrate. The format is everything.' },
    { name: 'Rohan M.', role: 'Member · 1 year', text: 'The smashes are real, but the people are the actual reason I keep coming back week after week.' },
    { name: 'Neha T.', role: 'Member · 6 months', text: 'Beginner-friendly without being slow. They balance teams so well — every game feels like a final.' },
    { name: 'Dev S.', role: 'Member · 3 months', text: 'Found my weekend tribe here. Great rallies, better people. The vibe is unmatched in the city.' },
    { name: 'Ira M.', role: 'Member · 5 months', text: 'Booking is one tap, the QR check-in is slick, and hydration is sorted. Just turn up and play.' },
  ]
  return (
    <section id="testimonials" className="py-20 md:py-28 bg-white/60 border-y border-border">
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
function FAQContact() {
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
    { q: 'Do I need to bring my own racket?', a: 'Yes. Bring your own racket. We do keep one backup for emergencies — but rallies feel better with your own gear.' },
    { q: 'Are indoor shoes mandatory?', a: 'Strictly yes. Non-marking indoor shoes only. Outdoor shoes will be politely refused at the court.' },
    { q: 'Cancellation & refund policy?', a: 'Full refund up to 24h before the session. Within 24h, slot is non-refundable but transferable — bring a friend in your place.' },
    { q: 'Beginner-friendly?', a: '100%. We rotate teams to balance skill levels every game — you will always have a fair, fun match.' },
    { q: 'Punch cards / multi-session passes?', a: 'Yes — your remaining pass count shows in the Player Portal. Use any active pass at checkout.' },
  ]
  return (
    <section id="faq" className="py-20 md:py-28 section-glow">
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid lg:grid-cols-2 gap-14">
        <div>
          <Pill>FAQ</Pill>
          <h2 className="mt-4 font-black text-4xl md:text-5xl tracking-tighter leading-[0.95]" style={{ fontFamily: 'var(--font-inter)' }}>
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
          <h2 className="mt-4 font-black text-4xl md:text-5xl tracking-tighter leading-[0.95]" style={{ fontFamily: 'var(--font-inter)' }}>
            Say <span className="text-gradient">hello.</span>
          </h2>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="mailto:thebaddyclub@gmail.com" className="inline-flex items-center gap-2 bg-card rounded-full border border-border shadow-soft px-4 py-2.5 text-sm font-semibold hover:border-[#E65C9C]/40 transition-colors">
              <Mail className="w-4 h-4" style={{ color: PINK }} /> thebaddyclub@gmail.com
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
function Footer() {
  return (
    <footer className="bg-foreground text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-14 grid md:grid-cols-3 gap-10 items-start">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #F472B6, #DB2777)' }}>
              <span className="font-black text-white" style={{ fontFamily: 'var(--font-inter)' }}>B</span>
            </div>
            <div className="font-black text-xl" style={{ fontFamily: 'var(--font-inter)' }}>
              THE BADDY CLUB<span style={{ color: PINK }}>.</span>
            </div>
          </div>
          <p className="text-sm text-white/50 mt-3 max-w-xs leading-relaxed">We Jump & Smash. A weekend-driven social badminton club in Bengaluru.</p>
        </div>
        <div className="md:text-center text-sm text-white/50">
          © {new Date().getFullYear()} The Baddy Club<br />Made with smashes in Bengaluru
        </div>
        <div className="flex md:justify-end gap-3">
          <a href="mailto:thebaddyclub@gmail.com" className="w-11 h-11 rounded-xl border border-white/15 flex items-center justify-center text-white/80 hover:text-white hover:border-[#E65C9C] hover:bg-[#E65C9C]/20 transition-colors"><Mail className="w-4 h-4" /></a>
          <a href="#" className="w-11 h-11 rounded-xl border border-white/15 flex items-center justify-center text-white/80 hover:text-white hover:border-[#E65C9C] hover:bg-[#E65C9C]/20 transition-colors"><Instagram className="w-4 h-4" /></a>
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
            <DialogTitle className="font-black text-3xl tracking-tight" style={{ fontFamily: 'var(--font-inter)' }}>
              Join the <span className="text-gradient">Club.</span>
            </DialogTitle>
            <DialogDescription>One-tap sign in. We just need your email to lock your slots.</DialogDescription>
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

/* ---------- Booking ---------- */
function BookingDrawer({ session, open, onClose, user, onLogin, onPaid }) {
  const [stage, setStage] = useState('confirm')
  const [bookingId, setBookingId] = useState(null)
  const [result, setResult] = useState(null)

  useEffect(() => {
    if (open) { setStage('confirm'); setBookingId(null); setResult(null) }
  }, [open])

  if (!session) return null
  const soldOut = session.status === 'sold_out' || session.slots_left <= 0

  const pay = async () => {
    if (!user) { onLogin(); return }
    setStage('paying')
    try {
      const r1 = await fetch('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: session.id }) })
      const d1 = await r1.json()
      if (!r1.ok) throw new Error(d1.error || 'Could not create booking')
      setBookingId(d1.booking_id)
      await new Promise(res => setTimeout(res, 1400))
      const r2 = await fetch('/api/webhooks/payment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'payment.captured', booking_id: d1.booking_id }) })
      const d2 = await r2.json()
      if (!r2.ok) throw new Error(d2.error || 'Payment failed')
      setResult(d2)
      setStage('success')
      onPaid && onPaid()
      toast.success('Booked! See you on court.')
    } catch (e) {
      toast.error(e.message)
      setStage('confirm')
    }
  }

  const qrUrl = result?.qr_code_token
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=BADDY-${result.qr_code_token}&bgcolor=ffffff&color=000000&margin=10`
    : null

  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
      <DrawerContent className="border-t border-border">
        <div className="max-w-2xl mx-auto w-full px-5 pb-8">
          <DrawerHeader className="px-0">
            <DrawerTitle className="font-black text-3xl tracking-tight" style={{ fontFamily: 'var(--font-inter)' }}>
              {stage === 'success' ? <>Slot <span className="text-gradient">Locked.</span></> : <>Confirm <span className="text-gradient">Booking.</span></>}
            </DrawerTitle>
            <DrawerDescription>
              {stage === 'success' ? 'Your QR is your ticket. Save it. Show it at the door.' : soldOut ? 'This session is sold out. Try another upcoming matchup.' : 'Review your session details, then pay to lock the slot.'}
            </DrawerDescription>
          </DrawerHeader>

          {stage !== 'success' && (
            <div className="bg-card rounded-2xl border border-border shadow-soft p-5 mt-2">
              <div className="text-xs font-bold uppercase tracking-wider" style={{ color: PINK }}>{session.tagline}</div>
              <h3 className="font-black text-2xl mt-1" style={{ fontFamily: 'var(--font-inter)' }}>{session.title}</h3>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4" style={{ color: PINK }} /><b>{formatDateLong(session.date_time)}</b></div>
                <div className="flex items-center gap-2"><Clock className="w-4 h-4" style={{ color: PINK }} /><b>{formatTime(session.date_time)}</b></div>
                <div className="flex items-center gap-2 col-span-2"><MapPin className="w-4 h-4" style={{ color: PINK }} /><b>{session.location_name}</b></div>
              </div>
              <div className="border-t border-border mt-5 pt-5 flex items-end justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total</div>
                  <div className="font-black text-3xl" style={{ fontFamily: 'var(--font-inter)' }}>₹{session.price}</div>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">via Razorpay (Mock)</div>
              </div>
              <PinkButton onClick={pay} disabled={stage === 'paying' || soldOut} className="w-full mt-5">
                {soldOut ? 'Sold Out' : stage === 'paying' ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing Payment...</> : <>Pay ₹{session.price} & Lock Slot <ArrowRight className="w-4 h-4" /></>}
              </PinkButton>
              <p className="text-[10px] text-muted-foreground mt-3 text-center uppercase tracking-wider">Mock payment · Webhook simulator fires payment.captured</p>
            </div>
          )}

          {stage === 'success' && (
            <div className="bg-card rounded-2xl border border-border shadow-soft p-6 mt-2 text-center">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-white text-xs font-bold uppercase tracking-wider shadow-glow" style={{ backgroundColor: PINK }}>
                <CheckCircle2 className="w-4 h-4" /> Payment Captured
              </div>
              <div className="mt-5 inline-block p-3 bg-white rounded-2xl border border-border shadow-soft">
                {qrUrl && <img src={qrUrl} alt="QR" className="w-56 h-56" />}
              </div>
              <div className="mt-4 font-mono text-xs text-muted-foreground">{result?.qr_code_token}</div>
              <div className="mt-5 text-sm space-y-1">
                <div><b>{session.title}</b></div>
                <div className="text-muted-foreground">{formatDateLong(session.date_time)} · {formatTime(session.date_time)}</div>
                <div className="text-muted-foreground">{session.location_name}</div>
                <div className="text-xs text-muted-foreground mt-2">Txn: {result?.transaction_id}</div>
              </div>
              <div className="mt-5 flex gap-3">
                <GhostButton onClick={() => bookingId && window.open(`/api/bookings/${bookingId}/receipt`, '_blank')} className="flex-1">
                  <Download className="w-4 h-4" /> Receipt
                </GhostButton>
                <PinkButton onClick={onClose} className="flex-1">Done</PinkButton>
              </div>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

/* ---------- Portal ---------- */
function PortalDialog({ open, onClose, user }) {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/bookings/me')
      const d = await r.json()
      setBookings(d.bookings || [])
    } finally { setLoading(false) }
  }
  useEffect(() => { if (open) load() }, [open])

  const upcoming = useMemo(() => bookings.filter(b => b.session && new Date(b.session.date_time) >= new Date() && b.payment_status === 'paid'), [bookings])
  const history = useMemo(() => bookings.filter(b => !b.session || new Date(b.session.date_time) < new Date() || b.payment_status !== 'paid'), [bookings])

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl rounded-2xl border border-border shadow-soft-lg p-0 max-h-[90vh] overflow-y-auto scrollbar-thin">
        <div className="p-6">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <DialogTitle className="font-black text-3xl tracking-tight" style={{ fontFamily: 'var(--font-inter)' }}>
                  Player <span className="text-gradient">Portal.</span>
                </DialogTitle>
                <DialogDescription className="mt-1">{user?.full_name} · {user?.email}</DialogDescription>
              </div>
              <div className="rounded-2xl border border-[#E65C9C]/20 bg-[#E65C9C]/5 p-3.5 text-center min-w-[120px]">
                <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: PINK }}>Punch Card</div>
                <div className="font-black text-2xl" style={{ fontFamily: 'var(--font-inter)' }}>{user?.punch_card_remaining ?? 0}</div>
                <div className="text-[9px] uppercase tracking-wider text-muted-foreground">sessions left</div>
              </div>
            </div>
          </DialogHeader>

          <Tabs defaultValue="upcoming" className="mt-5">
            <TabsList>
              <TabsTrigger value="upcoming"><Ticket className="w-4 h-4 mr-1.5" /> Upcoming ({upcoming.length})</TabsTrigger>
              <TabsTrigger value="history"><History className="w-4 h-4 mr-1.5" /> History ({history.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="mt-4 space-y-4">
              {loading && <div className="py-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin" style={{ color: PINK }} /></div>}
              {!loading && upcoming.length === 0 && (
                <div className="text-center py-12 rounded-2xl border border-dashed border-border bg-secondary/40">
                  <p className="text-muted-foreground">No upcoming bookings. Book a session and your QR code lives here.</p>
                </div>
              )}
              {upcoming.map(b => (
                <div key={b.id} className="bg-card rounded-2xl border border-border shadow-soft p-5 flex flex-col md:flex-row gap-5">
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#E65C9C]/10 text-[#C13C7E]">
                      <CheckCircle2 className="w-3 h-3" /> Confirmed
                    </div>
                    <h4 className="font-black text-xl mt-2" style={{ fontFamily: 'var(--font-inter)' }}>{b.session.title}</h4>
                    <div className="mt-3 text-sm space-y-1.5">
                      <div className="flex items-center gap-2"><Calendar className="w-4 h-4" style={{ color: PINK }} /> <b>{formatDateLong(b.session.date_time)} · {formatTime(b.session.date_time)}</b></div>
                      <div className="flex items-center gap-2"><MapPin className="w-4 h-4" style={{ color: PINK }} /> <span className="text-muted-foreground">{b.session.location_name}</span></div>
                    </div>
                    <div className="mt-3 text-xs font-mono text-muted-foreground">Token: {b.qr_code_token}</div>
                    <button onClick={() => window.open(`/api/bookings/${b.id}/receipt`, '_blank')} className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C13C7E] hover:text-[#E65C9C]">
                      <Download className="w-3.5 h-3.5" /> Receipt PDF
                    </button>
                  </div>
                  <div className="bg-white rounded-2xl border border-border p-2.5 shadow-soft self-start">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=BADDY-${b.qr_code_token}&bgcolor=ffffff&color=000000&margin=10`}
                      alt="QR"
                      className="w-32 h-32 md:w-36 md:h-36 rounded-lg"
                    />
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="history" className="mt-4 space-y-3">
              {!loading && history.length === 0 && (
                <div className="text-center py-12 rounded-2xl border border-dashed border-border bg-secondary/40">
                  <p className="text-muted-foreground">No past sessions yet.</p>
                </div>
              )}
              {history.map(b => (
                <div key={b.id} className="bg-card rounded-2xl border border-border shadow-soft p-4 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-black truncate" style={{ fontFamily: 'var(--font-inter)' }}>{b.session?.title || 'Session'}</div>
                    <div className="text-xs text-muted-foreground">{b.session && formatDateLong(b.session.date_time)} · ₹{b.amount}</div>
                    <Badge variant="outline" className="mt-1.5 text-[10px] rounded-full uppercase font-bold">{b.payment_status}</Badge>
                  </div>
                  <button onClick={() => window.open(`/api/bookings/${b.id}/receipt`, '_blank')} className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider rounded-full border border-border px-3.5 py-2 shadow-soft bg-white hover:border-[#E65C9C]/40 transition-colors">
                    <Download className="w-3.5 h-3.5" /> PDF
                  </button>
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
  const [sessions, setSessions] = useState([])
  const [loadingSessions, setLoadingSessions] = useState(true)
  const [authOpen, setAuthOpen] = useState(false)
  const [portalOpen, setPortalOpen] = useState(false)
  const [bookSession, setBookSession] = useState(null)
  const [pendingBookAfterAuth, setPendingBookAfterAuth] = useState(null)

  const loadSessions = async () => {
    setLoadingSessions(true)
    try {
      const r = await fetch('/api/sessions')
      const d = await r.json()
      setSessions(d.sessions || [])
    } finally { setLoadingSessions(false) }
  }
  const loadUser = async () => {
    try {
      const r = await fetch('/api/auth/me')
      const d = await r.json()
      setUser(d.user)
    } catch {}
  }

  useEffect(() => { loadSessions(); loadUser() }, [])

  const onNav = (id) => {
    if (id === 'top') { window.scrollTo({ top: 0, behavior: 'smooth' }); return }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }
  const handleBookClick = (s) => {
    if (!user) { setPendingBookAfterAuth(s); setAuthOpen(true); return }
    setBookSession(s)
  }
  const handleAuthSuccess = (u) => {
    setUser(u); setAuthOpen(false)
    if (pendingBookAfterAuth) { setBookSession(pendingBookAfterAuth); setPendingBookAfterAuth(null) }
  }
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null); setPortalOpen(false)
    toast.success('Logged out')
  }
  const onPaid = () => { loadSessions(); loadUser() }

  const nextSession = useMemo(() => sessions.find(s => s.status !== 'sold_out'), [sessions])

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FCFAF6' }}>
      <Header
        user={user}
        onLogin={() => setAuthOpen(true)}
        onLogout={handleLogout}
        onNav={onNav}
        onPortal={() => setPortalOpen(true)}
      />
      <Hero
        onBook={() => nextSession ? handleBookClick(nextSession) : onNav('sessions')}
        onAbout={() => onNav('about')}
      />
      <Stats />
      <SessionsSection sessions={sessions} onBook={handleBookClick} loading={loadingSessions} />
      <AboutSection />
      <GallerySection />
      <TestimonialsSection />
      <FAQContact />
      <Footer />

      <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} onSuccess={handleAuthSuccess} />
      <BookingDrawer
        open={!!bookSession}
        session={bookSession}
        onClose={() => setBookSession(null)}
        user={user}
        onLogin={() => setAuthOpen(true)}
        onPaid={onPaid}
      />
      <PortalDialog open={portalOpen} onClose={() => setPortalOpen(false)} user={user} />
    </div>
  )
}

export default App
