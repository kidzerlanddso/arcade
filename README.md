# Rototuna Alumni Platform

Alumni management and digital archive platform for **Rototuna Senior High School** (Alumni Connect).

Graduates can stay connected with the school community: browse news and events, find classmates, view teacher profiles, and support the school through donations.

## Features

- **Authentication** — email/password and Google sign-in
- **Dashboard** — featured events carousel, latest announcements, featured teachers, Facebook/Instagram links
- **Alumni directory** — search profiles, connections, employment & education history
- **Events** — list/calendar views, event details, join events
- **News** — newsletter-style announcements with images
- **Teacher profiles** — pastoral/department teams; featured teachers on the dashboard
- **Donations** — link out to the school’s [Kindo shop](https://shop.kindo.co.nz/app/community-shop/Rototuna%20High%20Schools)
- **Admin** — membership requests, content management, stats

## Tech stack

| Layer | Technology |
|--------|------------|
| Frontend | React, Vite, React Router, Sass |
| Backend | Node.js, Express |
| Database | PostgreSQL (Supabase) |
| Storage | Supabase Storage (profile & teacher images) |
| Deploy | Frontend: Vercel · Backend: Render |

## Repository layout

```
rototuna-alumni-platform/
├── clientside/     # React frontend
├── serverside/     # Express API
└── README.md
```

## Local setup

### Prerequisites

- Node.js 18+ (Node 22 supported)
- npm
- Supabase project (Postgres + Storage) or equivalent Postgres connection

### 1. Backend

```bash
cd serverside
cp .env.example .env
npm install
npm start
```

API runs on **http://localhost:3001** (or `PORT` from `.env`).

### 2. Frontend

```bash
cd clientside
cp .env.example .env
npm install
npm run dev
```

App runs on **http://localhost:3000** (Vite may pick another port if 3000 is busy).  
Dev proxy: `/api` → `http://localhost:3001`.

## Environment variables

### `clientside/.env`

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | API base URL (local: `http://localhost:3001`) |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Web Client ID |

### `serverside/.env`

| Variable | Purpose |
|----------|---------|
| `GOOGLE_CLIENT_ID` | Same Google client ID as the frontend |
| `FRONTEND_URL` | Deployed frontend origin (CORS), e.g. Vercel URL |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SECRET_KEY` | Supabase service role key (server only) |
| `SUPABASE_STORAGE_BUCKET` | Profile/event/news images bucket (default: `profile-images`) |
| `SUPABASE_TEACHER_AVATAR_BUCKET` | Teacher avatars bucket (default: `teacher_avator`) |
| `PORT` | Optional; defaults to `3001` |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | Optional; membership emails |

> Never commit real `.env` files. Use the `.env.example` files as templates.

## Google OAuth

1. Create an OAuth **Web** client in Google Cloud Console.
2. Add authorized JavaScript origins for local and production frontends (e.g. `http://localhost:3000`, your Vercel URL).
3. Set the same client ID in both `VITE_GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_ID`.

## Keepalive (Render + Supabase)

Free Render services sleep after inactivity; Supabase free tiers may pause without DB activity.

- Backend exposes **`GET /keepalive`** (runs a simple DB check).
- Point an external cron (e.g. [cron-job.org](https://cron-job.org) or UptimeRobot) at:

  `https://<your-render-host>/keepalive`

  every **10–14 minutes**.

## Production notes

- **Frontend (Vercel):** set `VITE_API_URL` to the Render API URL; build from `clientside/`.
- **Backend (Render):** set all `serverside` env vars; set `FRONTEND_URL` to the Vercel origin.
- Ensure Supabase Storage buckets exist and are public (or otherwise readable) for image URLs.

## API overview

| Prefix | Area |
|--------|------|
| `/auth` | Register, login, Google, membership requests |
| `/profile` | Alumni profiles & images |
| `/events` | Events, join, attendees |
| `/content` | News & teachers |
| `/connection` | Alumni connections |
| `/employment`, `/education` | Profile history |
| `/admin`, `/data` | Admin tools |
| `/keepalive` | Health / DB ping |

## Scripts

| Location | Command | Description |
|----------|---------|-------------|
| `clientside` | `npm run dev` | Local frontend |
| `clientside` | `npm run build` | Production build |
| `serverside` | `npm start` | Start API |
| `serverside` | `npm run import:events` | Import local events (optional) |

## Licence / ownership

Delivered for Rototuna Senior High School — RHS Alumni / Alumni Connect project.
