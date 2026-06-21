# 💅 The Nail Hubs

**A production booking platform with a database-level concurrency guarantee, an on-device computer-vision AR feature, and a zero-marginal-cost architecture — built and deployed for a real, currently-operating business.**

[![CI](https://github.com/abhieq31/the-nail-hubs-receptionist/actions/workflows/ci.yml/badge.svg)](https://github.com/abhieq31/the-nail-hubs-receptionist/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://vercel.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**[🔗 Live site](https://thenailhubs.vercel.app)** · **[✨ Try the AR nail studio](https://thenailhubs.vercel.app/try-on)** (branded "AI Try-On Studio" for customers; under the hood it's computer vision, not generative AI)

---

This started as a website for a real Ankleshwar, India nail salon — it now runs the salon's actual booking calendar in production. The interesting engineering is in three places: a booking engine that's *provably* free of double-bookings under concurrent writes, a hand-tracking AR effect that runs entirely in the visitor's browser at zero server cost, and a UI that degrades gracefully instead of breaking whenever a dependency (database, Instagram API, Google Places) isn't configured or is unreachable.

## Status

Live and serving a real, single-location business — not a portfolio demo. The original prototype shipped January 2026; the current architecture (the Supabase-backed booking engine with the concurrency guarantee, the AR try-on studio, the test suite, CI) replaced it on **June 11, 2026**, after the original booking logic was identified as having a race-condition risk under concurrent requests.

There's no analytics dashboard wired up for appointment volume, so rather than invent a number, here's the actual claim: the no-double-booking guarantee is enforced by a database constraint, not by application code that depends on enough traffic "happening to" exercise the race condition correctly. It's correct by construction from the first booking onward — that's a stronger property than an error count with no incidents in it, and it doesn't need a few months of production traffic to become true.

## Engineering highlights

**Concurrency-safe booking, enforced by the database — not application code.**
The naive way to prevent double bookings is "check for a conflict, then insert" in your API handler — which is a textbook race condition under concurrent requests. Instead, [`supabase/schema.sql`](supabase/schema.sql) defines a Postgres `EXCLUDE` constraint over a GiST index on `(date, time-range)`: two overlapping confirmed appointments on the same day *cannot* exist in the table, full stop, even if two requests hit the insert at the same instant. The application-level [availability engine](lib/availability.js) computes slots for a snappy UI, but the database is the actual source of truth — a `23P01` constraint violation on insert is caught and turned into a clean "that slot was just taken" response ([`app/api/book/route.js`](app/api/book/route.js)).

**On-device computer vision, not a server-side ML pipeline.**
The [Try-On Studio](components/TryOnStudio.js) — customer-facing branding calls it "AI," but it's specifically computer vision, not a generative model — runs MediaPipe's hand-landmark detection (21 points/hand) client-side via WASM, tracks fingertips through `getUserMedia`, and procedurally renders 4 nail shapes × 5 finishes (16 colours) onto a `<canvas>` every frame — chrome's multi-band metallic gradient, glitter with deterministically-seeded sparkle positions (so it doesn't strobe), and an exponential-moving-average smoothing pass over the landmarks (raw model output flickers slightly frame-to-frame, which reads as the whole overlay vibrating). The model and WASM runtime are **self-hosted** in [`public/mediapipe/`](public/mediapipe) rather than pulled from a third-party CDN, after diagnosing that CDN latency/blocking on mobile networks was the #1 cause of load failures in production. No frame ever leaves the device — zero inference cost, full privacy, scales to any traffic for free.

**Resilience by default, not by exception handling.**
Every external dependency degrades instead of breaking the page: no Supabase configured → booking API returns 503 and the chat receptionist hands off to a pre-filled WhatsApp message instead of dead-ending; no Instagram token → the live feed falls back to the official profile embed; no Google Places key → curated 5-star testimonials stand in for live reviews. The site is designed to never show a broken feature, only a gracefully simpler one.

**Security hardening done as a real pass, not an afterthought.**
A production audit of this codebase found and fixed a real stored-XSS-shaped bug (chat messages were rendered via `dangerouslySetInnerHTML` with no escaping — see [`components/ChatWidget.js`](components/ChatWidget.js)), added best-effort per-IP rate limiting on every write endpoint and the confirmation-ID lookup (mitigating both spam bookings and ID enumeration — [`lib/rateLimit.js`](lib/rateLimit.js)), and added baseline security headers (`next.config.mjs`).

**SEO and growth mechanics, not just a landing page.** `NailSalon` JSON-LD structured data (hours, geo-coordinates, services) so Google can render the business directly in search results; a sitemap/robots pair; and an Open Graph card generated at *build time* via `@vercel/og` ([`app/opengraph-image.js`](app/opengraph-image.js)) so every WhatsApp/Instagram share looks designed instead of showing a blank link preview.

**Tested where it actually matters.** The booking math, time/timezone handling, rate limiter, and the two external-API integration layers have **49 unit tests at ~85% line coverage** (`npm test`) — see [Testing](#testing) below. UI components are intentionally left untested in favor of testing the logic that would actually cause an incorrect booking or a security bug if it broke.

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 15 (App Router) | UI + API routes in one deploy, no CORS, generous free tier on Vercel |
| UI | React 19 | — |
| Database | Supabase (Postgres) | Free tier, `EXCLUDE` constraint support for real concurrency guarantees |
| Computer Vision | MediaPipe Tasks Vision (self-hosted) | On-device hand tracking — free at any scale, fully private |
| Testing | Vitest | Fast, ESM-native, zero-config with Next.js |
| CI | GitHub Actions | Lint + test + build on every push |
| Analytics | Vercel Analytics | Free tier |
| Hosting | Vercel | Zero-config Next.js deploys, free tier |

## Architecture

```
app/
├── page.js               # Home (hero, try-on teaser, services, gallery, reviews, about, contact)
├── try-on/page.js        # Computer-vision AR nail Try-On Studio
├── layout.js             # Root layout, metadata, global chat receptionist
└── api/                  # Booking + integrations API (Next.js route handlers)
    ├── services/  available-dates/  availability/
    ├── book/  reschedule/  cancel/  appointment/[id]/
    ├── instagram/feed/  instagram/stories/
    └── google/reviews/

components/               # Navbar, Hero, Services, Gallery, Reviews, About,
                          # Contact, Footer, ChatWidget, ChatProvider, BookingFlow,
                          # InstagramFeed, GoogleReviews, TryOnStudio, TryOnTeaser
lib/                      # businessRules, availability engine, time (IST),
                          # supabase client, integrations, rate limiter, client API helpers
                          # — *.test.js files sit next to the module they cover
styles/                   # globals, chat, feeds, tryon (consistent gold/dark theme)
supabase/schema.sql       # One-paste database setup, incl. the no-overlap constraint
.github/workflows/ci.yml  # Lint, test, build on every push/PR
SETUP.md                  # 15-minute launch guide
```

## API

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/services` | GET | Service menu with durations |
| `/api/available-dates?days=7` | GET | Next open days (IST) |
| `/api/availability` | POST | Open slots for a service + date |
| `/api/book` | POST | Create appointment (409 on conflict, rate-limited) |
| `/api/appointment/{id}` | GET | Lookup by confirmation ID (rate-limited) |
| `/api/reschedule` | POST | Move an appointment (rate-limited) |
| `/api/cancel` | POST | Cancel an appointment (rate-limited) |
| `/api/instagram/feed` · `/api/instagram/stories` | GET | Live IG content (optional token) |
| `/api/google/reviews` | GET | Live Google reviews (optional key) |

## Testing

```bash
npm test              # run the suite once
npm run test:watch    # watch mode
npm run test:coverage # coverage report
```

49 tests across the business-logic layer (`lib/*.test.js`):

- **`availability.test.js`** — slot generation packs back-to-back with the configured buffer, never overruns closing time, excludes conflicting slots, and rejects bookings outside the working hours / advance-booking window / same-day lead time.
- **`time.test.js`** — minute/time conversions round-trip correctly; date math is anchored at UTC noon specifically to avoid the off-by-one-day bug that timezone-naive date arithmetic produces.
- **`businessRules.test.js`** — sanity-checks the single source of truth every other layer (UI, chat, API) reads from.
- **`rateLimit.test.js`** — per-IP, per-scope windows that block over the limit and reset after the window, verified with mocked time.
- **`clientApi.test.js` / `integrations.test.js`** — the fetch wrapper surfaces HTTP status + server error detail correctly, and the Instagram/Google integrations cache responses and degrade to `configured: false` instead of throwing when unset.

## Business Rules

All in [`lib/businessRules.js`](lib/businessRules.js) — change once, applies to the website, the chat receptionist, the booking engine, and the test suite:

- **Hours**: open all 7 days, 11:00 AM – 6:00 PM (Asia/Kolkata)
- **Buffer**: 10 minutes between appointments
- **Window**: bookings up to 30 days ahead; same-day needs 30 min lead
- **Services**: 7 services with realistic per-service durations

## Local Development

```bash
npm install
cp .env.example .env.local   # optional — site runs without it
npm run dev                  # http://localhost:3000
npm test                     # run the test suite
npm run lint                 # ESLint (next/core-web-vitals)
```

Without Supabase configured, booking endpoints return 503 and the chat offers WhatsApp booking instead; everything else works. Full launch guide for a fresh deploy: [SETUP.md](SETUP.md).

## License

[MIT](LICENSE) © Abhi Patel

---

Made with 💅 in Ankleshwar · Women-owned business · [@thenailhubs](https://www.instagram.com/thenailhubs/)
