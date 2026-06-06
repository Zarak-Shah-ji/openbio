# OpenBio

A free, open-source **link-in-bio** app that ships the features other tools put
behind a paywall — **analytics, custom themes, link scheduling and lead
capture** — with no premium tier.

> **Live demo:** _added after deployment_ · **Try it:** sign in with
> `demo@openbio.app` / `openbio-demo`

---

## Why this exists

Most link-in-bio products give you the page for free but charge for the parts
that actually matter. OpenBio reimplements those paid features as free,
open-source software:

| Feature | Typically paywalled | In OpenBio |
| --- | --- | --- |
| **Analytics** — views, clicks, CTR, 30-day trend, top links | 💰 | ✅ Free |
| **Custom appearance** — colors, gradients, fonts, button styles, no forced branding | 💰 | ✅ Free |
| **Link scheduling** — auto show/hide links by date | 💰 | ✅ Free |
| **Lead capture** — collect visitor emails + CSV export | 💰 | ✅ Free |
| **Featured links, thumbnails, drag-to-reorder** | partly 💰 | ✅ Free |

This is a clean-room implementation. It is **not affiliated with, endorsed by,
or derived from** any existing product, and contains no third-party branding,
trademarks, or copied code.

## Tech stack

- **[Next.js 16](https://nextjs.org)** (App Router, Server Actions, TypeScript)
- **[Supabase](https://supabase.com)** — Postgres, Auth, Storage, Row-Level Security
- **[Tailwind CSS v4](https://tailwindcss.com)** for styling
- **[Recharts](https://recharts.org)** for the analytics chart
- **[dnd-kit](https://dndkit.com)** for drag-to-reorder
- **[Vitest](https://vitest.dev)** + Testing Library for tests
- Deployed on **Vercel + Supabase**

## How it works

- **Public page** `/[username]` is server-rendered with the owner's theme and
  shows only links that are active and within their schedule window.
- **View tracking**: the public page fires a `sendBeacon` to `/api/track`.
- **Click tracking**: each link points at `/api/r/[linkId]`, which logs the
  click then 302-redirects to the destination.
- Anonymous analytics writes and lead submissions go through hardened
  `SECURITY DEFINER` Postgres functions (`record_event`, `capture_lead`), so the
  app needs only the public anon key — no service-role secret is shipped.
- Everything else (profile, links, theme) is owner-only via RLS.

## Local development

### Prerequisites

- Node.js 20+ and [pnpm](https://pnpm.io)
- A [Supabase](https://supabase.com) project (free tier is fine)

### 1. Install

```bash
git clone https://github.com/Zarak-Shah-ji/openbio.git
cd openbio
pnpm install
```

### 2. Set up the database

Run the SQL in [`supabase/migrations`](./supabase/migrations) against your
Supabase project (via the SQL editor, or `supabase db push` with the CLI). This
creates the tables, RLS policies, the public-write RPCs, and the `media` storage
bucket.

### 3. Configure environment

Copy `.env.example` to `.env.local` and fill in your project's values
(Project Settings → Data API / API keys):

```bash
cp .env.example .env.local
```

```ini
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxx
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000), sign up, claim a username,
and start adding links.

> **Email confirmation:** new Supabase projects require email confirmation by
> default. For a frictionless local demo, turn off **Authentication → Sign In /
> Providers → Confirm email** in the Supabase dashboard, or confirm users via
> the email link. The hosted demo account is pre-confirmed.

## Scripts

```bash
pnpm dev         # start the dev server
pnpm build       # production build
pnpm start       # run the production build
pnpm test        # run the test suite
pnpm lint        # eslint
pnpm typecheck   # tsc --noEmit
```

## Testing

```bash
pnpm test
```

The suite covers the pure domain logic — link scheduling/visibility, analytics
aggregation (views, clicks, CTR, daily buckets), theme coercion, CSV export —
plus integration tests for the tracking route handlers and a UI component test.

## Deployment

1. Push the repo to GitHub.
2. Import it on [Vercel](https://vercel.com) (framework auto-detected as Next.js).
3. Add the three environment variables above as Vercel project env vars, setting
   `NEXT_PUBLIC_SITE_URL` to your deployed domain.
4. In Supabase, add your Vercel domain under **Authentication → URL
   Configuration** so confirmation/redirect links resolve correctly.

## Project structure

```
src/
  app/
    [username]/         public bio page (SSR) + generateMetadata
    api/track           page-view beacon endpoint
    api/r/[linkId]      click tracker -> redirect
    auth/               sign in/up/out server actions + confirm route
    dashboard/          links, appearance, analytics, settings (+ server actions)
    onboarding/         claim username
  components/
    dashboard/          links editor, appearance editor, phone preview, charts
    public/             view beacon, lead capture
    ui/                 small Tailwind UI primitives
  lib/
    analytics.ts        summarize(), CTR, daily buckets   (unit tested)
    links.ts            isLinkVisible(), url helpers       (unit tested)
    theme.ts            theme types, presets, CSS helpers  (unit tested)
    csv.ts              leads CSV export                   (unit tested)
    supabase/           browser / server / proxy clients
supabase/migrations/    database schema + RLS + RPCs
```

## License

[MIT](./LICENSE). An independent, open-source project.
