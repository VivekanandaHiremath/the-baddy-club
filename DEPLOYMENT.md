# Deployment — MongoDB Atlas + Vercel

This is the recommended production setup for The Baddy Club: a **managed database**
(MongoDB Atlas) and a **managed app host** (Vercel). Both have free tiers, and the app
code is already written for this model — the only thing that changes between local and
production is the `MONGO_URL` environment variable.

> **Mental model:** the app (Next.js on Node) and the database (MongoDB) are two separate,
> always-on services that talk over the network via `MONGO_URL`. The local Docker MongoDB
> was only a dev convenience — it is **not** used in production.

---

## 1. Database — MongoDB Atlas

1. Create a free account at <https://www.mongodb.com/cloud/atlas> and create a project.
2. **Build a cluster** → choose the free **M0** tier and a region near your app host.
3. **Database Access** → create a database user (username + password). Save the password.
4. **Network Access** → add an IP allowlist entry:
   - For Vercel (dynamic IPs), allow `0.0.0.0/0` (open, relying on user/password + TLS), **or**
   - use [Atlas + Vercel network peering](https://www.mongodb.com/docs/atlas/reference/partner-integrations/vercel/) for a locked-down setup.
5. **Connect → Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   Substitute your real user and password.

No schema setup or seeding is needed — the app seeds three sample sessions automatically on
the first request (idempotently).

---

## 2. App — Vercel

1. Push this repo to GitHub/GitLab/Bitbucket.
2. At <https://vercel.com>, **Add New → Project** and import the repo. Vercel auto-detects
   Next.js — no build config needed (`next build`).
3. Under **Settings → Environment Variables**, add (for Production, and Preview if you want):

   | Key | Value |
   | --- | --- |
   | `MONGO_URL` | your Atlas `mongodb+srv://…` string |
   | `DB_NAME` | `baddy_club` |
   | `NEXT_PUBLIC_BASE_URL` | `https://<your-app>.vercel.app` |
   | `CORS_ORIGINS` | `*` (or your domain) |

4. **Deploy.** Vercel runs `next build`, serves the pages, and turns the catch-all
   `app/api/[[...path]]/route.js` into serverless functions automatically.

After the first deploy, update `NEXT_PUBLIC_BASE_URL` to the real domain Vercel assigns (or
your custom domain) and redeploy if you reference it.

---

## Why this works without code changes

- **`lib/db.js`** caches the Mongo client on `global._mongoClientPromise`, so serverless
  function invocations reuse one connection instead of opening a new one per request — the
  correct pattern for Vercel.
- The API route uses the default **Node.js runtime** (required by the `mongodb` driver — do
  not switch it to the Edge runtime).
- Secrets live in the host's environment variables, never in the repo (`.env` is
  gitignored; see `.env.example` for the required keys).

---

## Alternatives (if not using Vercel)

- **Single VPS with Docker Compose** — run the app container + a `mongo` container with a
  named volume for persistence. Most control; you own uptime, patching, and backups. Be sure
  to enable MongoDB authentication and firewall the database port.
- **Container hosts** (Render, Railway, Fly.io) — deploy the app as a container and use their
  managed Mongo add-on or Atlas. A middle ground between Vercel and a raw VPS.
- **Bare Node** — `npm run build && npm run start` behind a process manager (PM2/systemd)
  and a reverse proxy (nginx), pointing `MONGO_URL` at a managed or self-hosted database.

Whatever the host: the database is a long-lived managed service reached via `MONGO_URL` —
never a per-request or per-laptop Docker container.
