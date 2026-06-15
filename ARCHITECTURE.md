# keepingthem.net — Architecture

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), Tailwind v4 |
| Hosting | Netlify (manual deploys) |
| Database | Supabase (self-hosted) |
| Domain / CDN | Cloudflare |
| Email | Resend (via droptools.net sender domain) |

## Infrastructure

```
Browser
  └── https://keepingthem.net        Cloudflare → Netlify
  └── https://api.keepingthem.net    Cloudflare Tunnel → App server (172.16.20.9)
                                       └── cloudflared → DB server (172.16.20.11:8000)
                                                           └── Kong (Supabase API gateway)
                                                           └── PostgreSQL
```

### Servers
- **App server**: 172.16.20.9 — runs `cloudflared` tunnel daemon
- **DB server**: 172.16.20.11 — runs self-hosted Supabase (Kong on :8000, PostgreSQL on :5432)

### Cloudflare Tunnel
- Tunnel runs on app server (172.16.20.9)
- Public hostname `api.keepingthem.net` → `http://172.16.20.11:8000`
- SSL mode for `keepingthem.net`: Full (main site)
- The tunnel handles public TLS — no SSL needed on the internal hop

### CORS (self-hosted Supabase)
CORS is configured in `kong.yml` on the DB server — **not** in Studio UI.
To allow the production frontend, `https://keepingthem.net` must be in the Kong CORS allowed origins.

Typical location: `/etc/supabase/kong.yml` or wherever Docker Compose mounts it.
After editing, restart Kong: `docker compose restart kong`

## Database

- **Schema**: `public` (Kong strips `Content-Profile` header, blocking custom schemas)
- **Table**: `public.keepingthem_rsvps` (prefixed to namespace without custom schema)
- **RLS**: anon can INSERT, authenticated can SELECT
- **Migrations**: `supabase/migrations/` — run manually in Supabase Studio SQL Editor

## Netlify Functions

- `netlify/functions/rsvp-notify.ts` — triggered by Supabase webhook on INSERT to `keepingthem_rsvps`
- Sends email via Resend to recipients in `RSVP_NOTIFY_EMAILS`
- Authenticated via `x-webhook-secret` header matched against `RSVP_WEBHOOK_SECRET`

## Environment Variables

### Netlify (set in dashboard)
| Variable | Secret | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | No | Supabase API URL (bundled into client JS) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Supabase anon key (bundled into client JS) |
| `RESEND_API_KEY` | Yes | Resend API key for sending email |
| `RSVP_NOTIFY_EMAILS` | Yes | Comma-separated notification recipients |
| `RSVP_WEBHOOK_SECRET` | Yes | Shared secret to authenticate Supabase webhook |

### Local (`.env.local` — never commit)
Same variables as above for local development.

## Supabase Webhook

- Trigger: INSERT on `public.keepingthem_rsvps`
- Target: `https://keepingthem.net/.netlify/functions/rsvp-notify`
- Header: `x-webhook-secret: <RSVP_WEBHOOK_SECRET value>`

## Deploy Strategy

- **No auto-deploy** — Netlify GitHub sync is intentionally disabled during development
- Trigger manually: Netlify dashboard → Deploys → Trigger deploy
- Reason: conserve Netlify free-tier build minutes
