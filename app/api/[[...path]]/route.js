import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { getDb } from '@/lib/db'
import { cookies } from 'next/headers'

const SESSION_COOKIE = 'baddy_session'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map(s => s.trim().toLowerCase())
  .filter(Boolean)

function isAdmin(user) {
  return !!user && ADMIN_EMAILS.includes(String(user.email || '').toLowerCase())
}

async function getCurrentUser() {
  const jar = await cookies()
  const token = jar.get(SESSION_COOKIE)?.value
  if (!token) return null
  const db = await getDb()
  const user = await db.collection('profiles').findOne({ session_token: token })
  return user
}

// Returns { user } when the caller is an admin, otherwise { error } (a 403 response).
async function requireAdmin() {
  const user = await getCurrentUser()
  if (!isAdmin(user)) return { error: json({ error: 'Forbidden — admin only' }, 403) }
  return { user }
}

function json(data, status = 200) {
  return NextResponse.json(data, { status })
}

function newToken() {
  return uuidv4().replace(/-/g, '').slice(0, 16).toUpperCase()
}

function enrichSession(s) {
  return {
    id: s.id,
    title: s.title,
    tagline: s.tagline,
    date_time: s.date_time,
    location_name: s.location_name,
    venue_id: s.venue_id || null,
    total_slots: s.total_slots,
    slots_booked: s.slots_booked,
    slots_left: Math.max(0, s.total_slots - s.slots_booked),
    price: s.price,
    status: s.slots_booked >= s.total_slots ? 'sold_out' : (s.status || 'open'),
    badge: s.badge,
    poster_url: s.poster_url || null,
  }
}

const DEFAULT_CONFIG = {
  key: 'main',
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

function publicConfig(cfg) {
  const c = { ...DEFAULT_CONFIG, ...(cfg || {}) }
  delete c._id
  return c
}

function receiptHtml({ title, tagline, player, email, dt, venue, txn, id, status, amount, label = 'Booking Receipt' }) {
  return `<!doctype html><html><head><meta charset="utf-8"/><title>Receipt ${id}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;}
body{font-family:'Inter',sans-serif;background:#FCFAF6;color:#18161A;margin:0;padding:48px 24px;}
.card{max-width:640px;margin:auto;background:#fff;border:1px solid #efe7df;border-radius:24px;box-shadow:0 30px 70px -18px rgba(24,22,30,0.22),0 10px 28px -12px rgba(24,22,30,0.12);padding:40px;overflow:hidden;}
.top{display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;}
.brand{font-family:'Inter',sans-serif;font-weight:700;font-size:24px;letter-spacing:-0.03em;display:flex;align-items:center;gap:10px;}
.logo{width:38px;height:38px;border-radius:11px;background:linear-gradient(135deg,#F472B6,#DB2777);color:#fff;display:flex;align-items:center;justify-content:center;font-family:'Inter',sans-serif;font-weight:700;font-size:20px;}
.pink{color:#E65C9C;}
.badge{display:inline-block;background:rgba(230,92,156,0.1);color:#C13C7E;padding:6px 14px;border-radius:999px;font-weight:700;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;}
.row{display:flex;justify-content:space-between;padding:13px 0;border-bottom:1px solid #f0eae3;font-size:15px;}
.row span{color:#7a7480;}
h1{font-family:'Inter',sans-serif;font-size:38px;margin:16px 0 4px;letter-spacing:-0.04em;}
.total{font-size:30px;font-weight:800;font-family:'Inter',sans-serif;background:linear-gradient(135deg,#F472B6,#DB2777);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;}
.btn{display:inline-block;margin-top:28px;background:linear-gradient(135deg,#F472B6,#DB2777);color:#fff;border:none;border-radius:999px;padding:13px 28px;font-weight:600;text-decoration:none;box-shadow:0 14px 36px -10px rgba(230,92,156,0.5);}
@media print { .btn{display:none;} body{background:#fff;padding:0;} .card{box-shadow:none;border:1px solid #e5e5e5;} }
</style></head><body>
<div class="card">
<div class="top">
<div class="brand"><span class="logo">B</span> THE BADDY CLUB<span class="pink">.</span></div>
<div class="badge">${label}</div>
</div>
<h1>${title}</h1>
<div style="color:#7a7480;margin-bottom:24px;">${tagline || ''}</div>
<div class="row"><span>Player</span><b>${player}</b></div>
<div class="row"><span>Email</span><b>${email}</b></div>
<div class="row"><span>Date &amp; Time</span><b>${dt.toLocaleString('en-IN',{weekday:'long',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}</b></div>
<div class="row"><span>Venue</span><b>${venue}</b></div>
<div class="row"><span>Transaction ID</span><b>${txn}</b></div>
<div class="row"><span>Reference</span><b>${id}</b></div>
<div class="row"><span>Payment Status</span><b style="text-transform:uppercase;color:#E65C9C">${status}</b></div>
<div class="row"><span>Amount Paid</span><span class="total">₹${amount}</span></div>
<p style="margin-top:24px;font-size:13px;color:#555;">Show your QR code at the venue for entry. Rackets &amp; non-marking indoor shoes mandatory.</p>
<a class="btn" href="javascript:window.print()">Print / Save as PDF</a>
</div></body></html>`
}

async function seedIfEmpty() {
  const db = await getDb()

  // --- site config (single doc) ---
  await db.collection('site_config').updateOne(
    { key: 'main' },
    { $setOnInsert: { ...DEFAULT_CONFIG, created_at: new Date() } },
    { upsert: true }
  )

  // --- venues ---
  const venueCount = await db.collection('venues').countDocuments()
  if (venueCount === 0) {
    await db.collection('venues').createIndex({ seed_slug: 1 }, { unique: true, sparse: true })
    const venues = [
      { id: uuidv4(), seed_slug: 'jump-smash-mahadevpura', name: 'Jump & Smash, Mahadevpura', address: 'Mahadevpura, Bengaluru', map_url: 'https://www.openstreetmap.org/export/embed.html?bbox=77.68%2C12.98%2C77.71%2C13.00&layer=mapnik', image_url: 'https://images.pexels.com/photos/8007484/pexels-photo-8007484.jpeg?auto=compress&cs=tinysrgb&w=900', created_at: new Date() },
      { id: uuidv4(), seed_slug: 'smash-arena-indiranagar', name: 'Smash Arena, Indiranagar', address: 'Indiranagar, Bengaluru', map_url: 'https://www.openstreetmap.org/export/embed.html?bbox=77.63%2C12.96%2C77.65%2C12.98&layer=mapnik', image_url: 'https://images.pexels.com/photos/8007165/pexels-photo-8007165.jpeg?auto=compress&cs=tinysrgb&w=900', created_at: new Date() },
    ]
    for (const v of venues) {
      await db.collection('venues').updateOne({ seed_slug: v.seed_slug }, { $setOnInsert: v }, { upsert: true })
    }
  }

  // --- sessions / events ---
  const count = await db.collection('sessions').countDocuments()
  if (count > 0) return
  const now = new Date()
  const nextSunday = new Date(now)
  nextSunday.setDate(now.getDate() + ((7 - now.getDay()) % 7 || 7))
  nextSunday.setHours(9, 45, 0, 0)
  const followingSunday = new Date(nextSunday)
  followingSunday.setDate(nextSunday.getDate() + 7)
  const saturday = new Date(nextSunday)
  saturday.setDate(nextSunday.getDate() - 1)
  saturday.setHours(18, 30, 0, 0)
  const sessions = [
    {
      id: uuidv4(),
      seed_slug: 'baddyclub-x-hndrd',
      title: 'BaddyClub x HNDRD',
      tagline: 'Jump & Smash',
      date_time: nextSunday,
      location_name: 'Jump & Smash, Mahadevpura',
      total_slots: 20,
      slots_booked: 16,
      price: 400,
      status: 'open',
      badge: 'Hydration Partner: Hydrasalt',
      created_at: new Date(),
    },
    {
      id: uuidv4(),
      seed_slug: 'saturday-social-mixer',
      title: 'Saturday Social Mixer',
      tagline: 'Rally & Vibes',
      date_time: saturday,
      location_name: 'Smash Arena, Indiranagar',
      total_slots: 16,
      slots_booked: 8,
      price: 350,
      status: 'open',
      badge: 'Beginner Friendly',
      created_at: new Date(),
    },
    {
      id: uuidv4(),
      seed_slug: 'baddyclub-sunday-long',
      title: 'BaddyClub Sunday Long',
      tagline: 'Three Hour Burner',
      date_time: followingSunday,
      location_name: 'Jump & Smash, Mahadevpura',
      total_slots: 24,
      slots_booked: 5,
      price: 500,
      status: 'open',
      badge: 'Hydration Partner: Hydrasalt',
      created_at: new Date(),
    },
  ]
  // Idempotent seed: a unique index + upsert-by-slug makes concurrent
  // first-requests safe (the count check alone races and double-seeds).
  await db.collection('sessions').createIndex({ seed_slug: 1 }, { unique: true, sparse: true })
  for (const s of sessions) {
    await db.collection('sessions').updateOne(
      { seed_slug: s.seed_slug },
      { $setOnInsert: s },
      { upsert: true }
    )
  }
}

// Capture a payment for a registration: atomically claim a slot, then mark paid + issue QR.
// Shared by the mock webhook and the admin "mark paid" action.
async function captureRegistration(db, registration) {
  if (registration.payment_status === 'paid') {
    return { ok: true, already: true, qr_code_token: registration.qr_code_token, transaction_id: registration.transaction_id }
  }
  const updated = await db.collection('sessions').findOneAndUpdate(
    { id: registration.event_id, $expr: { $lt: ['$slots_booked', '$total_slots'] } },
    { $inc: { slots_booked: 1 } },
    { returnDocument: 'after' }
  )
  const session = updated?.value || updated
  if (!session) {
    return { soldOut: true }
  }
  const qr_code_token = newToken()
  const transaction_id = 'pay_' + Math.random().toString(36).slice(2, 14)
  await db.collection('registrations').updateOne(
    { id: registration.id },
    { $set: { status: 'paid', payment_status: 'paid', qr_code_token, transaction_id, paid_at: new Date() } }
  )
  return {
    ok: true,
    qr_code_token,
    transaction_id,
    slots_left: Math.max(0, session.total_slots - session.slots_booked),
    sold_out: session.slots_booked >= session.total_slots,
  }
}

export async function GET(request, { params }) {
  const p = (await params).path || []
  const route = '/' + p.join('/')
  try {
    await seedIfEmpty()
    const db = await getDb()

    if (route === '/' || route === '/health') {
      return json({ ok: true, app: 'The Baddy Club' })
    }

    if (route === '/config') {
      const cfg = await db.collection('site_config').findOne({ key: 'main' })
      return json({ config: publicConfig(cfg) })
    }

    if (route === '/venues') {
      const venues = await db.collection('venues').find({}).sort({ created_at: 1 }).toArray()
      return json({ venues: venues.map(({ _id, seed_slug, ...v }) => v) })
    }

    if (route === '/gallery') {
      const items = await db.collection('gallery').find({}).sort({ sort: 1, created_at: 1 }).toArray()
      return json({ gallery: items.map(({ _id, ...g }) => g) })
    }

    if (route === '/sessions') {
      const list = await db.collection('sessions').find({}).sort({ date_time: 1 }).toArray()
      return json({ sessions: list.map(enrichSession) })
    }

    if (route === '/auth/me') {
      const user = await getCurrentUser()
      if (!user) return json({ user: null })
      return json({
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          skill_level: user.skill_level,
          punch_card_remaining: user.punch_card_remaining || 0,
          is_admin: isAdmin(user),
        }
      })
    }

    // Player's own applications/registrations
    if (route === '/registrations/me') {
      const user = await getCurrentUser()
      if (!user) return json({ error: 'Not authenticated' }, 401)
      const regs = await db.collection('registrations').find({ user_id: user.id }).sort({ created_at: -1 }).toArray()
      const eventIds = regs.map(r => r.event_id)
      const events = await db.collection('sessions').find({ id: { $in: eventIds } }).toArray()
      const map = Object.fromEntries(events.map(e => [e.id, e]))
      const out = regs.map(r => ({
        id: r.id,
        event: map[r.event_id] ? {
          id: map[r.event_id].id,
          title: map[r.event_id].title,
          date_time: map[r.event_id].date_time,
          location_name: map[r.event_id].location_name,
          price: map[r.event_id].price,
        } : null,
        status: r.status,
        payment_status: r.payment_status,
        payment_token: r.payment_token || null,
        qr_code_token: r.qr_code_token || null,
        transaction_id: r.transaction_id || null,
        amount: r.amount,
        created_at: r.created_at,
      }))
      return json({ registrations: out })
    }

    // Public payment page data (token is the secret — no login required)
    if (route.startsWith('/pay/')) {
      const token = route.split('/')[2]
      const reg = await db.collection('registrations').findOne({ payment_token: token })
      if (!reg) return json({ error: 'Invalid or expired payment link' }, 404)
      const event = await db.collection('sessions').findOne({ id: reg.event_id })
      return json({
        registration: {
          id: reg.id,
          full_name: reg.full_name,
          status: reg.status,
          payment_status: reg.payment_status,
          amount: reg.amount,
          qr_code_token: reg.qr_code_token || null,
          transaction_id: reg.transaction_id || null,
        },
        event: event ? {
          id: event.id, title: event.title, tagline: event.tagline,
          date_time: event.date_time, location_name: event.location_name, price: event.price,
        } : null,
      })
    }

    // Receipt for a paid registration
    if (route.startsWith('/registrations/') && route.endsWith('/receipt')) {
      const id = route.split('/')[2]
      const reg = await db.collection('registrations').findOne({ id })
      if (!reg) return json({ error: 'Not found' }, 404)
      const event = await db.collection('sessions').findOne({ id: reg.event_id })
      const html = receiptHtml({
        title: event?.title || 'Session', tagline: event?.tagline, player: reg.full_name, email: reg.email,
        dt: new Date(event?.date_time || Date.now()), venue: event?.location_name || '-',
        txn: reg.transaction_id || '-', id: reg.id, status: reg.payment_status, amount: reg.amount,
      })
      return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
    }

    // Legacy booking receipt (kept for backward compatibility)
    if (route.startsWith('/bookings/') && route.endsWith('/receipt')) {
      const id = route.split('/')[2]
      const booking = await db.collection('bookings').findOne({ id })
      if (!booking) return json({ error: 'Not found' }, 404)
      const session = await db.collection('sessions').findOne({ id: booking.session_id })
      const user = await db.collection('profiles').findOne({ id: booking.user_id })
      const html = receiptHtml({
        title: session.title, tagline: session.tagline, player: user.full_name, email: user.email,
        dt: new Date(session.date_time), venue: session.location_name,
        txn: booking.transaction_id, id: booking.id, status: booking.payment_status, amount: booking.amount,
      })
      return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
    }

    // ---------------- Admin (guarded) ----------------
    if (route === '/admin/events') {
      const { error } = await requireAdmin(); if (error) return error
      const list = await db.collection('sessions').find({}).sort({ date_time: 1 }).toArray()
      return json({ events: list.map(({ _id, seed_slug, ...s }) => s) })
    }

    if (route === '/admin/venues') {
      const { error } = await requireAdmin(); if (error) return error
      const venues = await db.collection('venues').find({}).sort({ created_at: 1 }).toArray()
      return json({ venues: venues.map(({ _id, seed_slug, ...v }) => v) })
    }

    if (route === '/admin/gallery') {
      const { error } = await requireAdmin(); if (error) return error
      const items = await db.collection('gallery').find({}).sort({ sort: 1, created_at: 1 }).toArray()
      return json({ gallery: items.map(({ _id, ...g }) => g) })
    }

    if (route === '/admin/config') {
      const { error } = await requireAdmin(); if (error) return error
      const cfg = await db.collection('site_config').findOne({ key: 'main' })
      return json({ config: publicConfig(cfg) })
    }

    if (route === '/admin/registrations') {
      const { error } = await requireAdmin(); if (error) return error
      const sp = request.nextUrl.searchParams
      const q = {}
      if (sp.get('event')) q.event_id = sp.get('event')
      if (sp.get('status')) q.status = sp.get('status')
      if (sp.get('skill')) q.skill_level = sp.get('skill')
      const search = (sp.get('q') || '').trim()
      if (search) {
        const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
        q.$or = [{ full_name: rx }, { email: rx }]
      }
      const regs = await db.collection('registrations').find(q).sort({ created_at: -1 }).limit(500).toArray()
      const events = await db.collection('sessions').find({}).toArray()
      const map = Object.fromEntries(events.map(e => [e.id, e.title]))
      return json({
        registrations: regs.map(({ _id, ...r }) => ({ ...r, event_title: map[r.event_id] || '—' })),
      })
    }

    if (route === '/admin/analytics') {
      const { error } = await requireAdmin(); if (error) return error
      const [regs, events, venues, players] = await Promise.all([
        db.collection('registrations').find({}).toArray(),
        db.collection('sessions').find({}).toArray(),
        db.collection('venues').countDocuments(),
        db.collection('profiles').countDocuments(),
      ])
      const paid = regs.filter(r => r.payment_status === 'paid')
      const revenue = paid.reduce((sum, r) => sum + (r.amount || 0), 0)

      const statusOrder = ['pending', 'shortlisted', 'paid', 'rejected']
      const statusFunnel = statusOrder.map(s => ({ status: s, count: regs.filter(r => r.status === s).length }))

      const skills = ['beginner', 'intermediate', 'advanced']
      const skillSplit = skills.map(s => ({ skill: s, count: regs.filter(r => (r.skill_level || 'intermediate') === s).length }))

      // last 14 days of registrations + revenue
      const days = []
      const today = new Date()
      for (let i = 13; i >= 0; i--) {
        const d = new Date(today)
        d.setDate(today.getDate() - i)
        const key = d.toISOString().slice(0, 10)
        days.push({
          date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
          key,
          registrations: regs.filter(r => new Date(r.created_at).toISOString().slice(0, 10) === key).length,
          revenue: paid.filter(r => r.paid_at && new Date(r.paid_at).toISOString().slice(0, 10) === key).reduce((s, r) => s + (r.amount || 0), 0),
        })
      }

      const perEventFill = events
        .slice()
        .sort((a, b) => new Date(a.date_time) - new Date(b.date_time))
        .map(e => ({
          title: e.title,
          booked: e.slots_booked,
          total: e.total_slots,
          fill: e.total_slots ? Math.round((e.slots_booked / e.total_slots) * 100) : 0,
        }))

      const topEvents = events
        .map(e => ({ title: e.title, registrations: regs.filter(r => r.event_id === e.id).length }))
        .sort((a, b) => b.registrations - a.registrations)
        .slice(0, 5)

      return json({
        kpis: {
          revenue,
          total_registrations: regs.length,
          shortlisted: regs.filter(r => r.status === 'shortlisted').length,
          paid: paid.length,
          pending: regs.filter(r => r.status === 'pending').length,
          events: events.length,
          venues,
          players,
        },
        timeseries: days,
        statusFunnel,
        skillSplit,
        perEventFill,
        topEvents,
      })
    }

    return json({ error: 'Not found', route }, 404)
  } catch (e) {
    console.error('GET error', e)
    return json({ error: e.message }, 500)
  }
}

export async function POST(request, { params }) {
  const p = (await params).path || []
  const route = '/' + p.join('/')
  try {
    await seedIfEmpty()
    const db = await getDb()
    const body = await request.json().catch(() => ({}))

    if (route === '/auth/login') {
      const { email, full_name, phone, skill_level } = body
      if (!email) return json({ error: 'email required' }, 400)
      const norm = String(email).trim().toLowerCase()
      let user = await db.collection('profiles').findOne({ email: norm })
      const token = uuidv4()
      if (!user) {
        user = {
          id: uuidv4(),
          email: norm,
          full_name: full_name || norm.split('@')[0],
          phone: phone || '',
          skill_level: skill_level || 'intermediate',
          punch_card_remaining: 0,
          session_token: token,
          created_at: new Date(),
        }
        await db.collection('profiles').insertOne(user)
      } else {
        await db.collection('profiles').updateOne(
          { id: user.id },
          { $set: { session_token: token, ...(full_name ? { full_name } : {}), ...(phone ? { phone } : {}), ...(skill_level ? { skill_level } : {}) } }
        )
        user = await db.collection('profiles').findOne({ id: user.id })
      }
      const res = json({
        user: {
          id: user.id, email: user.email, full_name: full_name || user.full_name,
          phone: phone || user.phone, skill_level: skill_level || user.skill_level,
          punch_card_remaining: user.punch_card_remaining || 0,
          is_admin: isAdmin(user),
        }
      })
      res.cookies.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30 })
      return res
    }

    if (route === '/auth/logout') {
      const res = json({ ok: true })
      res.cookies.set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 })
      return res
    }

    // Player applies to an event (free; admin shortlists later)
    if (route === '/registrations') {
      const user = await getCurrentUser()
      if (!user) return json({ error: 'Not authenticated' }, 401)
      const { event_id, note } = body
      const event = await db.collection('sessions').findOne({ id: event_id })
      if (!event) return json({ error: 'Event not found' }, 404)
      const existing = await db.collection('registrations').findOne({
        user_id: user.id, event_id, status: { $ne: 'rejected' },
      })
      if (existing) return json({ error: 'You already applied to this event', registration_id: existing.id }, 409)
      const reg = {
        id: uuidv4(),
        event_id,
        user_id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone || '',
        skill_level: user.skill_level || 'intermediate',
        note: note || '',
        status: 'pending',
        payment_status: 'unpaid',
        payment_token: null,
        qr_code_token: null,
        transaction_id: null,
        amount: event.price,
        created_at: new Date(),
      }
      await db.collection('registrations').insertOne(reg)
      return json({ ok: true, registration_id: reg.id })
    }

    // Mock payment webhook — supports legacy bookings AND registration payment tokens.
    if (route === '/webhooks/payment') {
      const { event, booking_id, payment_token } = body
      if (event !== 'payment.captured') return json({ ok: true, ignored: true })

      if (payment_token) {
        const reg = await db.collection('registrations').findOne({ payment_token })
        if (!reg) return json({ error: 'Registration not found' }, 404)
        const r = await captureRegistration(db, reg)
        if (r.soldOut) return json({ error: 'Event sold out' }, 409)
        return json({ ok: true, registration_id: reg.id, ...r })
      }

      const booking = await db.collection('bookings').findOne({ id: booking_id })
      if (!booking) return json({ error: 'Booking not found' }, 404)
      if (booking.payment_status === 'paid') {
        return json({ ok: true, already: true, qr_code_token: booking.qr_code_token })
      }
      const result = await db.collection('sessions').findOneAndUpdate(
        { id: booking.session_id, $expr: { $lt: ['$slots_booked', '$total_slots'] } },
        { $inc: { slots_booked: 1 } },
        { returnDocument: 'after' }
      )
      const updatedSession = result?.value || result
      if (!updatedSession) {
        await db.collection('bookings').updateOne({ id: booking_id }, { $set: { payment_status: 'refunded' } })
        return json({ error: 'Session sold out -- payment refunded' }, 409)
      }
      const qr_token = newToken()
      const txn_id = 'pay_' + Math.random().toString(36).slice(2, 14)
      await db.collection('bookings').updateOne(
        { id: booking_id },
        { $set: { payment_status: 'paid', transaction_id: txn_id, qr_code_token: qr_token, paid_at: new Date() } }
      )
      const final = await db.collection('sessions').findOne({ id: booking.session_id })
      return json({
        ok: true, booking_id, transaction_id: txn_id, qr_code_token: qr_token,
        session: { id: final.id, slots_left: Math.max(0, final.total_slots - final.slots_booked), sold_out: final.slots_booked >= final.total_slots },
      })
    }

    if (route === '/contact') {
      const { name, email, message } = body
      if (!email || !message) return json({ error: 'email and message required' }, 400)
      await db.collection('contact_messages').insertOne({
        id: uuidv4(), name: name || '', email, message, created_at: new Date(),
      })
      return json({ ok: true })
    }

    // ---------------- Admin (guarded) ----------------
    if (route === '/admin/events') {
      const { error } = await requireAdmin(); if (error) return error
      const b = body
      if (!b.title || !b.date_time) return json({ error: 'title and date_time required' }, 400)
      const ev = {
        id: uuidv4(),
        title: b.title,
        tagline: b.tagline || '',
        date_time: new Date(b.date_time),
        location_name: b.location_name || '',
        venue_id: b.venue_id || null,
        total_slots: Number(b.total_slots) || 0,
        slots_booked: Number(b.slots_booked) || 0,
        price: Number(b.price) || 0,
        status: b.status || 'open',
        badge: b.badge || '',
        poster_url: b.poster_url || '',
        created_at: new Date(),
      }
      await db.collection('sessions').insertOne(ev)
      return json({ ok: true, event: { ...ev, _id: undefined } })
    }

    if (route === '/admin/venues') {
      const { error } = await requireAdmin(); if (error) return error
      if (!body.name) return json({ error: 'name required' }, 400)
      const v = {
        id: uuidv4(), name: body.name, address: body.address || '',
        map_url: body.map_url || '', image_url: body.image_url || '', created_at: new Date(),
      }
      await db.collection('venues').insertOne(v)
      return json({ ok: true, venue: { ...v, _id: undefined } })
    }

    if (route === '/admin/gallery') {
      const { error } = await requireAdmin(); if (error) return error
      if (!body.image_url) return json({ error: 'image_url required' }, 400)
      const g = {
        id: uuidv4(), image_url: body.image_url, caption: body.caption || '',
        sort: Number(body.sort) || 0, created_at: new Date(),
      }
      await db.collection('gallery').insertOne(g)
      return json({ ok: true, item: { ...g, _id: undefined } })
    }

    // Registration actions
    const action = route.match(/^\/admin\/registrations\/([^/]+)\/(shortlist|reject|mark-paid)$/)
    if (action) {
      const { error } = await requireAdmin(); if (error) return error
      const [, id, act] = action
      const reg = await db.collection('registrations').findOne({ id })
      if (!reg) return json({ error: 'Registration not found' }, 404)

      if (act === 'shortlist') {
        const payment_token = reg.payment_token || newToken()
        await db.collection('registrations').updateOne(
          { id }, { $set: { status: 'shortlisted', payment_token, shortlisted_at: new Date() } }
        )
        return json({ ok: true, payment_token })
      }
      if (act === 'reject') {
        await db.collection('registrations').updateOne({ id }, { $set: { status: 'rejected' } })
        return json({ ok: true })
      }
      if (act === 'mark-paid') {
        const r = await captureRegistration(db, reg)
        if (r.soldOut) return json({ error: 'Event sold out' }, 409)
        return json({ ok: true, ...r })
      }
    }

    if (route === '/admin/registrations/bulk') {
      const { error } = await requireAdmin(); if (error) return error
      const { ids, action: act } = body
      if (!Array.isArray(ids) || !ids.length) return json({ error: 'ids required' }, 400)
      if (act === 'shortlist') {
        let updated = 0
        for (const id of ids) {
          const reg = await db.collection('registrations').findOne({ id })
          if (!reg) continue
          const payment_token = reg.payment_token || newToken()
          await db.collection('registrations').updateOne(
            { id }, { $set: { status: 'shortlisted', payment_token, shortlisted_at: new Date() } }
          )
          updated++
        }
        return json({ ok: true, updated })
      }
      if (act === 'reject') {
        const res = await db.collection('registrations').updateMany({ id: { $in: ids } }, { $set: { status: 'rejected' } })
        return json({ ok: true, updated: res.modifiedCount })
      }
      return json({ error: 'unknown action' }, 400)
    }

    return json({ error: 'Not found', route }, 404)
  } catch (e) {
    console.error('POST error', e)
    return json({ error: e.message }, 500)
  }
}

export async function PUT(request, { params }) {
  const p = (await params).path || []
  const route = '/' + p.join('/')
  try {
    const db = await getDb()
    const body = await request.json().catch(() => ({}))

    const evMatch = route.match(/^\/admin\/events\/([^/]+)$/)
    if (evMatch) {
      const { error } = await requireAdmin(); if (error) return error
      const id = evMatch[1]
      const allowed = ['title', 'tagline', 'location_name', 'venue_id', 'total_slots', 'slots_booked', 'price', 'status', 'badge', 'poster_url']
      const set = {}
      for (const k of allowed) if (k in body) set[k] = ['total_slots', 'slots_booked', 'price'].includes(k) ? Number(body[k]) : body[k]
      if ('date_time' in body) set.date_time = new Date(body.date_time)
      await db.collection('sessions').updateOne({ id }, { $set: set })
      return json({ ok: true })
    }

    const vMatch = route.match(/^\/admin\/venues\/([^/]+)$/)
    if (vMatch) {
      const { error } = await requireAdmin(); if (error) return error
      const id = vMatch[1]
      const allowed = ['name', 'address', 'map_url', 'image_url']
      const set = {}
      for (const k of allowed) if (k in body) set[k] = body[k]
      await db.collection('venues').updateOne({ id }, { $set: set })
      return json({ ok: true })
    }

    if (route === '/admin/config') {
      const { error } = await requireAdmin(); if (error) return error
      const { _id, key, ...rest } = body
      await db.collection('site_config').updateOne({ key: 'main' }, { $set: { ...rest, updated_at: new Date() } }, { upsert: true })
      return json({ ok: true })
    }

    return json({ error: 'Not found', route }, 404)
  } catch (e) {
    console.error('PUT error', e)
    return json({ error: e.message }, 500)
  }
}

export async function DELETE(request, { params }) {
  const p = (await params).path || []
  const route = '/' + p.join('/')
  try {
    const db = await getDb()

    const evMatch = route.match(/^\/admin\/events\/([^/]+)$/)
    if (evMatch) {
      const { error } = await requireAdmin(); if (error) return error
      await db.collection('sessions').deleteOne({ id: evMatch[1] })
      return json({ ok: true })
    }

    const vMatch = route.match(/^\/admin\/venues\/([^/]+)$/)
    if (vMatch) {
      const { error } = await requireAdmin(); if (error) return error
      await db.collection('venues').deleteOne({ id: vMatch[1] })
      return json({ ok: true })
    }

    const gMatch = route.match(/^\/admin\/gallery\/([^/]+)$/)
    if (gMatch) {
      const { error } = await requireAdmin(); if (error) return error
      await db.collection('gallery').deleteOne({ id: gMatch[1] })
      return json({ ok: true })
    }

    return json({ error: 'Not found', route }, 404)
  } catch (e) {
    console.error('DELETE error', e)
    return json({ error: e.message }, 500)
  }
}
