import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { getDb } from '@/lib/db'
import { cookies } from 'next/headers'

const SESSION_COOKIE = 'baddy_session'

async function getCurrentUser() {
  const jar = await cookies()
  const token = jar.get(SESSION_COOKIE)?.value
  if (!token) return null
  const db = await getDb()
  const user = await db.collection('profiles').findOne({ session_token: token })
  return user
}

function json(data, status = 200) {
  return NextResponse.json(data, { status })
}

async function seedIfEmpty() {
  const db = await getDb()
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

export async function GET(request, { params }) {
  const p = (await params).path || []
  const route = '/' + p.join('/')
  try {
    await seedIfEmpty()
    const db = await getDb()

    if (route === '/' || route === '/health') {
      return json({ ok: true, app: 'The Baddy Club' })
    }

    if (route === '/sessions') {
      const list = await db.collection('sessions').find({}).sort({ date_time: 1 }).toArray()
      const enriched = list.map(s => ({
        id: s.id,
        title: s.title,
        tagline: s.tagline,
        date_time: s.date_time,
        location_name: s.location_name,
        total_slots: s.total_slots,
        slots_booked: s.slots_booked,
        slots_left: Math.max(0, s.total_slots - s.slots_booked),
        price: s.price,
        status: s.slots_booked >= s.total_slots ? 'sold_out' : s.status,
        badge: s.badge,
      }))
      return json({ sessions: enriched })
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
        }
      })
    }

    if (route === '/bookings/me') {
      const user = await getCurrentUser()
      if (!user) return json({ error: 'Not authenticated' }, 401)
      const bookings = await db.collection('bookings').find({ user_id: user.id }).sort({ created_at: -1 }).toArray()
      const sessionIds = bookings.map(b => b.session_id)
      const sess = await db.collection('sessions').find({ id: { $in: sessionIds } }).toArray()
      const sessMap = Object.fromEntries(sess.map(s => [s.id, s]))
      const out = bookings.map(b => ({
        id: b.id,
        session: sessMap[b.session_id] ? {
          id: sessMap[b.session_id].id,
          title: sessMap[b.session_id].title,
          date_time: sessMap[b.session_id].date_time,
          location_name: sessMap[b.session_id].location_name,
          price: sessMap[b.session_id].price,
        } : null,
        payment_status: b.payment_status,
        transaction_id: b.transaction_id,
        qr_code_token: b.qr_code_token,
        amount: b.amount,
        created_at: b.created_at,
      }))
      return json({ bookings: out })
    }

    if (route.startsWith('/bookings/') && route.endsWith('/receipt')) {
      const id = route.split('/')[2]
      const booking = await db.collection('bookings').findOne({ id })
      if (!booking) return json({ error: 'Not found' }, 404)
      const session = await db.collection('sessions').findOne({ id: booking.session_id })
      const user = await db.collection('profiles').findOne({ id: booking.user_id })
      const dt = new Date(session.date_time)
      const html = `<!doctype html><html><head><meta charset="utf-8"/><title>Receipt ${booking.id}</title>
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
<div class="badge">Booking Receipt</div>
</div>
<h1>${session.title}</h1>
<div style="color:#7a7480;margin-bottom:24px;">${session.tagline}</div>
<div class="row"><span>Player</span><b>${user.full_name}</b></div>
<div class="row"><span>Email</span><b>${user.email}</b></div>
<div class="row"><span>Date &amp; Time</span><b>${dt.toLocaleString('en-IN',{weekday:'long',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}</b></div>
<div class="row"><span>Venue</span><b>${session.location_name}</b></div>
<div class="row"><span>Transaction ID</span><b>${booking.transaction_id}</b></div>
<div class="row"><span>Booking ID</span><b>${booking.id}</b></div>
<div class="row"><span>Payment Status</span><b style="text-transform:uppercase;color:#E65C9C">${booking.payment_status}</b></div>
<div class="row"><span>Amount Paid</span><span class="total">₹${booking.amount}</span></div>
<p style="margin-top:24px;font-size:13px;color:#555;">Show your QR code at the venue for entry. Rackets &amp; non-marking indoor shoes mandatory. Hydration provided by Hydrasalt.</p>
<a class="btn" href="javascript:window.print()">Print / Save as PDF</a>
</div></body></html>`
      return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
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
      }
      const res = json({
        user: {
          id: user.id, email: user.email, full_name: full_name || user.full_name,
          phone: phone || user.phone, skill_level: skill_level || user.skill_level,
          punch_card_remaining: user.punch_card_remaining || 0,
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

    if (route === '/bookings') {
      const user = await getCurrentUser()
      if (!user) return json({ error: 'Not authenticated' }, 401)
      const { session_id } = body
      const session = await db.collection('sessions').findOne({ id: session_id })
      if (!session) return json({ error: 'Session not found' }, 404)
      if (session.slots_booked >= session.total_slots) {
        return json({ error: 'Sold out' }, 409)
      }
      const existing = await db.collection('bookings').findOne({ user_id: user.id, session_id, payment_status: { $in: ['paid', 'pending'] } })
      if (existing) return json({ error: 'You already booked this session', booking_id: existing.id }, 409)
      const booking = {
        id: uuidv4(),
        user_id: user.id,
        session_id,
        payment_status: 'pending',
        transaction_id: null,
        qr_code_token: null,
        amount: session.price,
        created_at: new Date(),
      }
      await db.collection('bookings').insertOne(booking)
      // Generate mock razorpay order id
      const order_id = 'order_' + Math.random().toString(36).slice(2, 12)
      return json({ booking_id: booking.id, order_id, amount: session.price, currency: 'INR' })
    }

    // Mock Razorpay/Stripe webhook simulator -- payment.captured
    if (route === '/webhooks/payment') {
      const { event, booking_id } = body
      if (event !== 'payment.captured') return json({ ok: true, ignored: true })
      const booking = await db.collection('bookings').findOne({ id: booking_id })
      if (!booking) return json({ error: 'Booking not found' }, 404)
      if (booking.payment_status === 'paid') {
        return json({ ok: true, already: true, qr_code_token: booking.qr_code_token })
      }
      // Atomic slot decrement: only succeed if slots are available
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
      const qr_token = uuidv4().replace(/-/g, '').slice(0, 16).toUpperCase()
      const txn_id = 'pay_' + Math.random().toString(36).slice(2, 14)
      await db.collection('bookings').updateOne(
        { id: booking_id },
        { $set: { payment_status: 'paid', transaction_id: txn_id, qr_code_token: qr_token, paid_at: new Date() } }
      )
      const final = await db.collection('sessions').findOne({ id: booking.session_id })
      return json({
        ok: true,
        booking_id,
        transaction_id: txn_id,
        qr_code_token: qr_token,
        session: {
          id: final.id,
          slots_left: Math.max(0, final.total_slots - final.slots_booked),
          sold_out: final.slots_booked >= final.total_slots,
        }
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

    return json({ error: 'Not found', route }, 404)
  } catch (e) {
    console.error('POST error', e)
    return json({ error: e.message }, 500)
  }
}
