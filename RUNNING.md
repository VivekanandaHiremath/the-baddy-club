# Running The Baddy Club locally

Step-by-step to get the app running on your machine. For what the app does and how it's built,
see [README.md](README.md). For production hosting, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Prerequisites

- **Node.js** 18.18+ (or 20+)
- **MongoDB** reachable at `mongodb://localhost:27017` — a local install or via Docker (below)

## 1. Install dependencies
```bash
npm install
```

## 2. Start MongoDB
If you don't have a local MongoDB, run one with Docker:
```bash
docker run -d --name baddy-mongo -p 27017:27017 mongo:7
```
Restart it later with `docker start baddy-mongo`.

## 3. Configure environment
A `.env` is included for local development (copy from `.env.example` if missing):
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=baddy_club
NEXT_PUBLIC_BASE_URL=http://localhost:3000
CORS_ORIGINS=*
ADMIN_EMAILS=admin@baddy.com      # comma-separated emails granted /admin access
```

## 4. Run the dev server
```bash
npm run dev
```
Open **http://localhost:3000**. The database **auto-seeds** site config, two venues, and three
sample events on the first request — no manual seeding needed.

## 5. Sign in as admin
Sign in (top-right) with an email listed in `ADMIN_EMAILS` (default `admin@baddy.com`). An
**Admin** link then appears in the header → opens the dashboard at **/admin**. Auth is
passwordless: any email signs in as a player, and matching the allowlist unlocks admin powers.

## 6. Build for production
```bash
npm run build
npm run start
```

## Scripts
| Script | Description |
| --- | --- |
| `npm run dev` | Dev server on port 3000 (cross-platform via `cross-env`) |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |

## Troubleshooting
- **`ECONNREFUSED ... 27017`** — MongoDB isn't running. Start it (`docker start baddy-mongo`).
- **`__webpack_modules__[moduleId] is not a function`** — stale dev cache, usually from running
  `next build` while `next dev` is live. Fix: stop the dev server, delete `.next`, run `npm run dev`.
- **Admin link missing / `403` on admin pages** — your signed-in email isn't in `ADMIN_EMAILS`;
  update `.env` and restart the dev server.
