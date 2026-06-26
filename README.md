# The Baddy Club 🏸

> **We Jump & Smash.** A weekend-driven social badminton club — apply, get shortlisted, pay, show up, smash.

A full-stack Next.js app for a pay-per-session social badminton club. Players browse upcoming
events and **apply** for a spot; an **admin** reviews applications, **shortlists** a balanced
mix, and sends each shortlisted player a **payment link**; paying confirms the slot and issues
a QR ticket. The admin dashboard also manages events, venues, and gallery photos (which the
public page reflects) and shows an **analytics** view with charts.

The UI is a **light-luxe** design — warm off-white canvas, soft elevated glass cards,
gradients, and generous rounding — with pink (`#E65C9C`) as the brand accent, in **Inter**.

---

## Tech stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router) + React 18
- **Database:** MongoDB (official `mongodb` driver)
- **Styling:** Tailwind CSS 3 + [shadcn/ui](https://ui.shadcn.com/) components (Radix primitives)
- **Charts:** Recharts · **Animation:** Framer Motion · **Icons:** lucide-react · **Toasts:** Sonner
- **Font:** Inter

---

## Prerequisites

- **Node.js** 18.18+ (or 20+)
- **MongoDB** at `mongodb://localhost:27017` — local install or Docker (below)

---

## Getting started

### 1. Install dependencies
```bash
npm install
```

### 2. Start MongoDB
```bash
docker run -d --name baddy-mongo -p 27017:27017 mongo:7
```
Restart it later with `docker start baddy-mongo`.

### 3. Configure environment
A `.env` is included for local development (see `.env.example` for all keys):
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=baddy_club
NEXT_PUBLIC_BASE_URL=http://localhost:3000
CORS_ORIGINS=*
ADMIN_EMAILS=admin@baddy.com      # comma-separated emails granted /admin access
```

### 4. Run the dev server
```bash
npm run dev
```
Open **http://localhost:3000**. The database **auto-seeds** site config, two venues, and three
sample events on the first API request — no manual seeding needed.

### 5. Become an admin
Sign in (top-right) with an email listed in `ADMIN_EMAILS` (default `admin@baddy.com`). An
**Admin** link appears in the header → opens the dashboard at **/admin**. Auth is passwordless;
any email signs in as a player, and matching the allowlist unlocks admin powers.

### 6. Build for production
```bash
npm run build
npm run start
```

---

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Dev server on port 3000 (cross-platform via `cross-env`) |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |

---

## How it works — the apply → shortlist → pay flow

1. **Apply** — a logged-in player taps *Request a Spot* on an event → creates a `pending`
   registration (free).
2. **Shortlist** — an admin filters applicants (by event/status/skill/search) and shortlists a
   balanced mix. Shortlisting generates a unique **payment token**.
3. **Send link** — the admin copies the player's payment link (`/pay/<token>`) and shares it
   (manual copy in this version; email delivery is a later phase).
4. **Pay** — the player opens the link and pays (mock gateway). The event slot is decremented
   **atomically** (guarding against oversell), the registration flips to `paid`, and a **QR
   ticket** + transaction id are issued.
5. **Confirmed** — the QR ticket and a printable receipt appear in the player's **Portal**.

> The admin can also **mark paid** directly, or **reject** applications. Bulk shortlist/reject
> is supported from the registrations table.

---

## Admin dashboard (`/admin`)

Gated by the `ADMIN_EMAILS` allowlist. Six sections:

- **Overview** — KPI cards (revenue, registrations, paid, pending, shortlisted, events, venues,
  players) plus charts: registrations & revenue over the last 14 days, application funnel, skill
  distribution, and per-event fill rate (Recharts).
- **Events** — create / edit / delete events (title, tagline, date, venue, slots, price, badge).
- **Venues** — manage courts shown in the public *Where We Play* section (image via URL).
- **Gallery** — add/remove public gallery photos (image URLs; falls back to default imagery when empty).
- **Registrations** — filter applicants, single & bulk shortlist/reject, copy payment links, mark paid.
- **Settings** — edit the public page content (club name, tagline, hero copy/kicker, contact,
  Instagram, hydration partner, and the stats strip).

---

## Project structure

```
the-baddy-club/
├── app/
│   ├── globals.css                 # Design system: theme tokens, glass, gradients, animations
│   ├── layout.js                   # Root layout, Inter font, Toaster
│   ├── page.js                     # Public site (apply flow, config-driven content, portal)
│   ├── admin/page.js               # Admin dashboard shell (allowlist gate + tabs)
│   ├── pay/[token]/page.js         # Public payment page for a shortlisted registration
│   └── api/[[...path]]/route.js    # Catch-all API (GET/POST/PUT/DELETE)
├── components/
│   ├── ui/                         # shadcn/ui primitives + buttons/table/checkbox
│   └── admin/                      # Analytics, Events, Venues, Gallery, Registrations, Settings panels
├── lib/
│   ├── db.js                       # MongoDB connection helper (cached client)
│   ├── utils.js                    # cn() class-merge helper
│   ├── format.js                   # PINK, image opt(), date/₹ formatters
│   └── adminApi.js                 # apiGet/apiPost/apiPut/apiDel helpers
├── next.config.js                  # Remote image hosts (Unsplash, Pexels, QR API)
├── tailwind.config.js              # Theme tokens → Tailwind colors, fonts, animations
└── .env(.example)                  # Environment variables
```

### MongoDB collections
`profiles` (users) · `sessions` (events) · `registrations` (applications + payments) ·
`venues` · `gallery` · `site_config` · `contact_messages` · `bookings` (legacy).

---

## API reference

All routes are served by the catch-all handler at `app/api/[[...path]]/route.js`.
Auth uses an HTTP-only `baddy_session` cookie. Admin routes require the caller's email to be in
`ADMIN_EMAILS` (otherwise `403`).

### Public / player
| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Health check |
| `GET` | `/api/config` | Public site config (hero, stats, contact, …) |
| `GET` | `/api/sessions` | List events (auto-seeds if empty) |
| `GET` | `/api/venues` · `/api/gallery` | Public venues / gallery photos |
| `POST` | `/api/auth/login` · `/api/auth/logout` | Passwordless sign in / out |
| `GET` | `/api/auth/me` | Current user (includes `is_admin`) |
| `POST` | `/api/registrations` | Apply to an event (auth) |
| `GET` | `/api/registrations/me` | Current user's applications + statuses |
| `GET` | `/api/pay/:token` | Payment-page data for a shortlisted registration |
| `POST` | `/api/webhooks/payment` | Mock capture — accepts `payment_token` (registrations) or `booking_id` (legacy) |
| `GET` | `/api/registrations/:id/receipt` | Printable HTML receipt |
| `POST` | `/api/contact` | Submit a contact message |

### Admin (allowlist-gated)
| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/api/admin/analytics` | KPIs, time series, funnel, skill split, fill rates |
| `GET POST` | `/api/admin/events` | List / create events |
| `PUT DELETE` | `/api/admin/events/:id` | Update / delete event |
| `GET POST` | `/api/admin/venues` · `PUT DELETE /api/admin/venues/:id` | Venue CRUD |
| `GET POST` | `/api/admin/gallery` · `DELETE /api/admin/gallery/:id` | Gallery add / list / delete |
| `GET` | `/api/admin/config` · `PUT /api/admin/config` | Read / update site config |
| `GET` | `/api/admin/registrations?event=&status=&skill=&q=` | Filter registrations |
| `POST` | `/api/admin/registrations/:id/shortlist` \| `/reject` \| `/mark-paid` | Per-row actions |
| `POST` | `/api/admin/registrations/bulk` | `{ ids, action: 'shortlist' \| 'reject' }` |

---

## Deployment

Recommended: **MongoDB Atlas** (managed DB) + **Vercel** (app) — no Docker in production; point
`MONGO_URL` at the managed database and set `ADMIN_EMAILS`. See **[DEPLOYMENT.md](DEPLOYMENT.md)**
for the step-by-step guide and alternatives (Docker Compose on a VPS, container hosts, bare Node).

---

## Notes

- **Admin access** is an email allowlist (`ADMIN_EMAILS`) over the passwordless login — simple,
  but add a real auth mechanism before exposing sensitive data publicly.
- **Mock payments:** the webhook simulator stands in for a Razorpay/Stripe `payment.captured`
  event; payment links are shared manually. Real gateway + email delivery are deferred.
- **Image uploads are deferred** — events, venues, and gallery photos use hosted image **URLs**
  for now (binary upload to Cloudinary/S3/GridFS is a later phase).
- **Idempotent seeding:** config, venues, and events seed via unique index + upsert, so
  concurrent first requests can't create duplicates.
- **Images** load from Unsplash / Pexels; QR codes render via `api.qrserver.com`.
