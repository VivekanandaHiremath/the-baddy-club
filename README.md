# The Baddy Club 🏸

> **We Jump & Smash.** A weekend-driven social badminton club — book a slot, show up, smash.

A full-stack Next.js app for a pay-per-session social badminton club: browse upcoming
weekend sessions, book a slot, pay (mock Razorpay flow), and get a QR ticket. Includes a
player portal with booking history and printable receipts.

The UI is a **light-luxe** design — warm off-white canvas, soft elevated glass cards,
gradients, and generous rounding — with pink (`#E65C9C`) as the brand accent.

---

## Tech stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router) + React 18
- **Database:** MongoDB (via the official `mongodb` driver)
- **Styling:** Tailwind CSS 3 + [shadcn/ui](https://ui.shadcn.com/) components (Radix primitives)
- **Animation:** Framer Motion
- **Icons:** lucide-react
- **Toasts:** Sonner
- **Fonts:** Inter (body) + Space Grotesk (display)

---

## Prerequisites

- **Node.js** 18.18+ (or 20+)
- **MongoDB** running at `mongodb://localhost:27017` — either a local install or via Docker (below)

---

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Start MongoDB

If you don't have a local MongoDB, the quickest path is Docker:

```bash
docker run -d --name baddy-mongo -p 27017:27017 mongo:7
```

To restart it later: `docker start baddy-mongo`.

### 3. Configure environment

A `.env` is already included for local development:

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=baddy_club
NEXT_PUBLIC_BASE_URL=http://localhost:3000
CORS_ORIGINS=*
```

Adjust `MONGO_URL` / `DB_NAME` if you point at a different database.

### 4. Run the dev server

```bash
npm run dev
```

Open **http://localhost:3000**. The database is **seeded automatically** with three sample
sessions on the first API request — no manual seeding needed.

### 5. Build for production

```bash
npm run build
npm run start
```

---

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the dev server on port 3000 (cross-platform via `cross-env`) |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |

---

## Project structure

```
the-baddy-club/
├── app/
│   ├── globals.css               # Design system: theme tokens, glass, gradients, animations
│   ├── layout.js                 # Root layout, fonts, Toaster
│   ├── page.js                   # Entire single-page UI (client component)
│   └── api/[[...path]]/route.js  # Catch-all API: sessions, auth, bookings, webhook, contact
├── components/ui/                # shadcn/ui primitives (dialog, drawer, select, tabs, ...)
├── lib/
│   ├── db.js                     # MongoDB connection helper
│   └── utils.js                  # cn() class-merge helper
├── next.config.js                # Remote image hosts (Unsplash, Pexels, QR API)
├── tailwind.config.js            # Theme tokens → Tailwind colors, fonts, animations
└── .env                          # Local environment variables
```

---

## API reference

All routes are served by the catch-all handler at `app/api/[[...path]]/route.js`.
Auth uses an HTTP-only `baddy_session` cookie.

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Health check |
| `GET` | `/api/sessions` | List upcoming sessions (auto-seeds if empty) |
| `POST` | `/api/auth/login` | Sign in / create a profile, sets session cookie |
| `POST` | `/api/auth/logout` | Clear the session cookie |
| `GET` | `/api/auth/me` | Current logged-in user |
| `POST` | `/api/bookings` | Create a pending booking for a session |
| `POST` | `/api/webhooks/payment` | Mock payment webhook — captures payment, atomically decrements the slot, issues a QR token |
| `GET` | `/api/bookings/me` | Current user's bookings (upcoming + history) |
| `GET` | `/api/bookings/:id/receipt` | Printable HTML receipt |
| `POST` | `/api/contact` | Submit a contact message |

### Booking flow

1. **Sign in** (`/api/auth/login`) → session cookie set.
2. **Create booking** (`/api/bookings`) → returns a `booking_id` and mock order.
3. **Capture payment** (`/api/webhooks/payment` with `event: "payment.captured"`) → the
   session slot is decremented atomically (guarding against oversell), and a QR token +
   transaction id are generated.
4. The booking appears in **`/api/bookings/me`** as `paid`, with a QR ticket shown in the
   Player Portal.

---

## Notes

- **Mock payments:** No real payment gateway is wired up — the webhook simulator stands in
  for Razorpay/Stripe `payment.captured` events.
- **Idempotent seeding:** Sessions seed via a unique index + upsert, so concurrent first
  requests can't create duplicates.
- **Images** are loaded from Unsplash and Pexels; QR codes are rendered via the
  `api.qrserver.com` service.
