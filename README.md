# Keren Sarig — Chinese Medicine Clinic

A full-stack clinic management platform. Clients submit enquiries and book appointments online; the practitioner manages everything through an admin dashboard. Appointment reminders are sent automatically via SMS or WhatsApp the morning before each visit.

[![CI](https://github.com/turjemantal/KerenSarigChineseMedical/actions/workflows/ci.yml/badge.svg)](https://github.com/turjemantal/KerenSarigChineseMedical/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Messaging Providers](#messaging-providers)
- [Running Tests](#running-tests)
- [Docker](#docker)
- [Deployment](#deployment)

---

## Features

- **Lead capture** — contact form sends enquiries to the admin dashboard and alerts the clinic owner (SMS/WhatsApp) on every new lead
- **OTP login** — passwordless auth via SMS or WhatsApp one-time code
- **Appointment booking** — real-time slot availability; only future slots on working days (enforced server-side on the clinic's timezone), within a configurable booking horizon (default ~6 months ahead)
- **No double-booking (DB-enforced)** — beyond the server-side availability check, a partial **unique index** on `{date, time}` (scoped to active pending/scheduled appointments) makes it physically impossible for two appointments to occupy the same slot, even under two simultaneous requests — the loser gets a clean "slot not available". A cancelled/rejected slot is freed and can be re-booked. Created/repaired by the on-demand script `scripts/v4/build-unique-slot-index.ts`
- **Editable weekly schedule** — the base bookable hours per weekday live in the DB and are edited from the admin dashboard (no hardcoded schedule); provisioned by initDB on a fresh DB (`server/migrations/init/`) or the on-demand script `scripts/v2/seed-weekly-schedule.ts`
- **Clinic settings** — admin-configurable booking horizon (days ahead) and daily-reminder hour, stored in the DB and editable from the dashboard (no redeploy needed); read DB-only (the app never seeds defaults — see `server/migrations/`)
- **Approval flow** — bookings start as *pending*; the client gets a "request received" message, and the confirmation SMS is sent only when the admin approves (from the dashboard home, appointments list, or detail drawer). The admin can also **reject** a pending request (distinct `rejected` status) — the client is notified it couldn't be accommodated
- **Admin-created clients & appointments** — the admin can add a client directly (name required, unique phone) and book a confirmed appointment for an existing client, found via a name/phone search; the slot still passes the server's availability check and the client gets a confirmation SMS
- **Schedule blocks** — admin can close hours, full days, or vacation ranges from the calendar; blocked slots are hidden in booking and rejected by the API
- **Client portal** — authenticated clients view, cancel, reschedule, and **book new appointments directly from the portal** (opens the booking calendar in place — no navigation away); reschedule allowed only within the free window, ≥24h before; enforced server-side; after a successful reschedule the card refreshes in place
- **Admin reschedule** — the admin can move any active appointment to a new slot from its detail drawer, sharing the client's slot-picker and reschedule logic; the admin bypasses the ownership + 24h free-window limits, but the server still re-checks the new slot is genuinely free (no double-booking). Rescheduling a *pending* request auto-approves it (choosing the new time = accepting it)
- **Session handling** — both admin and client sessions detect an expired/invalid JWT (proactively on load and on any 401) and return to the login screen with a "session expired" notice instead of a stuck view
- **Admin dashboard** — lead pipeline, appointment management, calendar (week view on desktop, day agenda on mobile), fully usable from a phone
- **Automated reminders** — an hourly cron (clinic time, Asia/Jerusalem) sends reminders for the *next day's* confirmed appointments at the admin-configured hour (default 09:00); a failed send is left unmarked, and the admin can re-send a reminder for any appointment from its detail drawer
- **Health check** — public `GET /api/health` reports app + DB status (the sanctioned read-only way to verify production)
- **Google Calendar sync** — when configured (service account), appointments are automatically created/updated/deleted in Keren's Google Calendar on approve, reschedule, and cancel; existing appointments backfilled via the on-demand script `scripts/v3/backfill-google-calendar.ts`; separately, clients get a client-side "Add to Google Calendar" link on the booking confirmation screen and in the portal next to every upcoming appointment (pending or scheduled) — no longer sent via SMS
- **OTP autofill** — SMS one-time codes autofill on iOS Safari (`autocomplete="one-time-code"`), Chrome Android and Samsung Internet (Web OTP API + SMS origin-binding footer)
- **Abuse protection** — per-IP + per-phone rate limits on OTP/SMS (cost protection)
- **Structured logging** — pino JSON logs shipped to Better Stack via a Vector sidecar; masked PII, request IDs, Docker log rotation; one structured line per request with string `level` ("info"/"error") and `fn`/method/url/status
- **Legal pages** — accessibility statement (`/accessibility`) and privacy policy (`/privacy`) per Israeli law (תקנה 35; חוק הגנת הפרטיות incl. Amendment 13)

---

## Tech Stack

| Layer | Technology |
|---|---|
| **API server** | NestJS 10, Node.js 22 |
| **Language** | TypeScript 5 |
| **Database** | MongoDB (local via Docker or MongoDB Atlas) |
| **Auth** | Passport-JWT, @nestjs/jwt |
| **Messaging** | 019sms.co.il SMS or WhatsApp Cloud API (switchable via config) |
| **Validation** | Joi + custom NestJS pipe |
| **Frontend** | React 19, Vite, Tailwind CSS 4 |
| **Containerisation** | Docker (multi-stage), Docker Compose |
| **Registry** | Amazon ECR |
| **Hosting** | AWS EC2 |
| **CI** | GitHub Actions |
| **Testing** | Jest + ts-jest (280 tests) |

---

## Project Structure

```
kerenWebsite/
├── client/                        # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Landing.tsx        # Public site (nav, hero, areas, testimonials…)
│   │   │   ├── BookingModal.tsx   # OTP login + 4-step booking flow
│   │   │   ├── ContactModal.tsx   # Lead capture form
│   │   │   ├── ClientPortal.tsx   # Client appointments + cancel/reschedule
│   │   │   ├── Dashboard.tsx      # Admin: today, calendar, blocks, appointments…
│   │   │   ├── AdminLogin.tsx     # Admin password login
│   │   │   ├── Legal.tsx          # Accessibility statement + privacy policy pages
│   │   │   ├── icons.tsx          # Shared SVG icon set
│   │   │   └── shared.tsx         # Button (incl. pill), Enso, Avatar, form helpers
│   │   ├── constants.ts           # Statuses, labels, slots, contact, UI errors, media URL
│   │   ├── data.ts                # Treatment areas content + testimonial videos
│   │   ├── auth.ts                # Token storage helpers
│   │   └── vite-env.d.ts          # Typed VITE_* env vars
│   ├── nginx.conf                 # Proxies /api → server:3001 in Docker
│   └── Dockerfile                 # Accepts VITE_* build args
├── server/                        # NestJS backend (controller → manager → service → DAO)
│   ├── src/
│   │   ├── config/                # Env config, Joi validation, pino logger config
│   │   ├── common/
│   │   │   ├── constants/         # Messages, errors, validation, clinic defaults
│   │   │   ├── enums/             # AppEnv, statuses, UserRole, Weekday…
│   │   │   ├── pipes/             # Joi validation pipe
│   │   │   ├── guards/            # Logging throttler (rate-limit + logs)
│   │   │   └── utils/             # Clinic-timezone dates, phone normalisation
│   │   ├── auth/                  # OTP flow, JWT strategy, admin guard
│   │   ├── appointments/          # Booking rules, approval flow, availability, reminders, reschedule
│   │   ├── schedule-blocks/       # Closed hours / days / vacations
│   │   ├── weekly-schedule/       # Editable base weekly hours (DB-backed)
│   │   ├── clinic-settings/       # Configurable booking horizon + reminder hour (DB-backed)
│   │   ├── leads/                 # Enquiry capture and pipeline
│   │   ├── clients/               # Registered clients (+ admin listing)
│   │   └── integrations/
│   │       ├── messaging/         # IMessagingProvider interface + DI token
│   │       ├── sms/               # 019sms.co.il (token auth) implementation
│   │       └── whatsapp/          # WhatsApp Cloud API implementation
│   ├── migrations/                # init/ — initDB baseline seed for a fresh local Mongo volume (mounted at container init)
│   ├── scripts/                   # on-demand maintenance (run via ts-node): _with-db.ts + v2/ (seed settings+schedule), v3/ (calendar backfill), v4/ (unique-slot index); plus validate-env, test-sms
│   ├── tests/                     # Jest unit tests
│   └── Dockerfile
├── scripts/                       # Local DB: clean / seed / backup / restore
├── docker-compose.yml             # Local development (includes MongoDB)
├── docker-compose.prod.yml        # Production (ECR images + Atlas + certbot)
├── nginx.conf                     # Production HTTPS reverse-proxy config
├── vector.yaml                    # Log shipping config (Docker → Better Stack)
├── Makefile                       # make deploy, prod-ip, prod-logs, db-*…
└── .env.example                   # Template for environment variables
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 22
- Docker Desktop

### 1. Clone and configure

```bash
git clone https://github.com/turjemantal/KerenSarigChineseMedical.git
cd KerenSarigChineseMedical
cp .env.example .env
```

Fill in `.env` — see [Environment Variables](#environment-variables).

### 2. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 3. Run locally

**Via Docker (recommended):**
```bash
make up
```
Opens at [http://localhost](http://localhost) — API at [http://localhost:3001/api](http://localhost:3001/api)

**Without Docker:**

Terminal 1:
```bash
cd server && npm run start:dev
```
Terminal 2:
```bash
cd client && npm run dev
```
Opens at [http://localhost:5173](http://localhost:5173)

---

## Environment Variables

Copy `.env.example` to `.env` and fill in values. The server **will not start** if required variables are missing.

### Modes

| `APP_ENV` | Behaviour |
|---|---|
| `DEV` | Real messages sent — use for local development with real SMS/WhatsApp |
| `PROD` | Real messages sent — use in production |
| `TEST` | All messaging skipped (logged to console only) — use for automated tests |

### Core (always required)

| Variable | Description |
|---|---|
| `APP_ENV` | `DEV` / `TEST` / `PROD` |
| `JWT_SECRET` | Secret for signing JWTs — use `openssl rand -hex 32` |
| `ADMIN_PASSWORD` | Password for the `/manager` admin dashboard |
| `ADMIN_PHONE` | *(optional)* clinic owner's phone — gets an alert on every new booking and new lead |

### Messaging

| Variable | Description |
|---|---|
| `MESSAGING_PROVIDER` | `sms` (019sms.co.il) or `whatsapp` — default: `whatsapp` |

### Media

| Variable | Description |
|---|---|
| `VITE_MEDIA_BASE_URL` | Public S3 media bucket URL (testimonial videos). Baked into the client at **build time** |

See [Messaging Providers](#messaging-providers) for provider-specific variables.

---

## Messaging Providers

The messaging system is abstracted behind `IMessagingProvider`. Switch provider by changing `MESSAGING_PROVIDER` in `.env` — no code changes needed.

### 019sms.co.il SMS (`MESSAGING_PROVIDER=sms`)

Required in `DEV` / `PROD`:

| Variable | Description |
|---|---|
| `SMS_019_USERNAME` | Account username at 019sms.co.il |
| `SMS_019_TOKEN` | API token — generated in the 019 web UI (Settings → API token management), shown only once |
| `SMS_019_SENDER` | Sender name shown on the recipient's phone (`KerenSarig` — max 11 chars, English letters/digits, one-way only) |

019 requires their **authorized-IP restriction** for API access — register the server's public IP in their Settings (prod: the EC2 Elastic IP).

### WhatsApp Cloud API (`MESSAGING_PROVIDER=whatsapp`)

Required in `DEV` / `PROD`:

| Variable | Description |
|---|---|
| `WHATSAPP_ACCESS_TOKEN` | Meta system-user access token |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp Business phone number ID |
| `WHATSAPP_TEMPLATE_LANGUAGE` | Template language code (e.g. `he`) |
| `WHATSAPP_TEMPLATE_OTP` | Approved template name for OTP |
| `WHATSAPP_TEMPLATE_BOOKING_CONFIRMATION` | Approved template name for booking confirmation |
| `WHATSAPP_TEMPLATE_APPOINTMENT_REMINDER` | Approved template name for reminders |
| `WHATSAPP_TEMPLATE_BOOKING_REJECTED` | *(optional)* template for the "request declined" notice — no fallback; the WhatsApp notice is skipped until this is approved + set (SMS sends regardless) |
| `WHATSAPP_TEMPLATE_LEAD_ALERT` | *(optional)* template for new-lead owner alerts (falls back to booking confirmation) |
| `WHATSAPP_API_VERSION` | API version — default: `v21.0` |

---

## Running Tests

```bash
cd server
npm test
```

280 server-side Jest tests covering auth, appointments (incl. admin-created, client + admin reschedule, reschedule-auto-approve, reject, configurable reminders + manual resend), weekly schedule, clinic settings, leads (incl. owner alerts), clients, SMS provider, WhatsApp provider, health, and validation.

---

## Docker

```bash
make up          # Start all services
make down        # Stop all services
make rebuild     # Rebuild images and start
make logs        # Tail all logs
make deploy      # Build for linux/amd64 and push to ECR
```

### Database scripts

```bash
make db-clean    # Drop the keren-clinic DB (keeps the volume → re-run the scripts/v2 seed scripts to re-provision)
make db-reset    # Wipe the Mongo volume + rebuild → initDB re-seeds the baseline (settings + weekly schedule)
make db-seed     # Insert sample clients, appointments, leads
make db-backup   # Export to ./backups/<timestamp>/
make db-restore ARCHIVE=backups/.../keren-clinic.archive
```

---

## Deployment

### Architecture

```
Push to main → GitHub Actions (CI → deploy) → Amazon ECR → EC2 pulls → serves on port 80
                                              MongoDB Atlas (cloud database)
```

### Continuous deployment (default)

Every push to `main` runs CI (lint/test/build) and, if it passes, the `deploy` job
in `.github/workflows/ci.yml` automatically builds + pushes images, ships the
config files and prod `.env`, and restarts EC2. **A merge to `main` is a deploy.**

- Prod runtime config lives in the **`PROD_ENV_FILE`** GitHub secret — edit it to
  change a prod value (your local `.env` only affects local dev). A pre-flight step
  validates the rendered prod `.env` before anything ships, so a missing required
  var fails the deploy instead of breaking prod.
- One-time setup + day-to-day ops are documented in `docs/cd-pipeline-setup.md`
  (local-only). `make deploy` remains available as a manual fallback.

> **One-time migration — run before the DB-only deploy.** The weekly schedule and the
> clinic settings (booking horizon + reminder hour) are read **DB-only** — the app never
> seeds them. Before the first deploy that includes this change, provision them on prod
> Atlas from an allowlisted host (e.g. the EC2 instance) so the clinic isn't fail-closed
> (zero availability, no reminders):
> ```bash
> cd server
> P="APP_ENV=PROD MONGODB_URI='<prod-atlas-uri>'"
> eval $P npx ts-node --transpile-only scripts/v2/seed-clinic-settings.ts
> eval $P npx ts-node --transpile-only scripts/v2/seed-weekly-schedule.ts
> ```
> There is **no migration framework** — each script under `scripts/v<N>/` is an explicit,
> idempotent one-off you run by hand only when needed (the same remote-DB safety guard as
> `main.ts` applies: a non-PROD run refuses a remote DB). The scripts are idempotent
> (schedule fills only weekdays missing a row, never overwriting the admin's edits;
> settings insert only if absent), so re-running is safe. Other on-demand scripts:
> `scripts/v4/build-unique-slot-index.ts` (build the no-double-booking unique index, after
> a deploy that introduces it) and `scripts/v3/backfill-google-calendar.ts` (one-time
> Google Calendar backfill). Verify with admin `GET /api/weekly-schedule`
> (7 days) and `GET /api/clinic-settings`. Fresh **local** DBs are provisioned
> automatically by the initDB seed (`server/migrations/init/seed.js`); initDB never runs
> against prod (Atlas has no Mongo container).
>
> **Migration layout & versioning.** `server/migrations/` separates the two concerns:
> `init/` is the fresh-volume baseline (local only); versioned folders (`v2/`, `v3/`, …)
> hold the migrations the runner applies to existing/prod DBs. **To add a migration:**
> drop a file in `migrations/v<N>/` that exports `export async function up()` — the runner
> auto-discovers it. No `package.json` change.

### First-time EC2 setup

1. Launch Ubuntu 24.04 EC2 instance (t3.small recommended)
2. Open ports 22 (SSH), 80 (HTTP) in the security group
3. SSH in and install Docker:
```bash
curl -fsSL https://get.docker.com | sh && sudo usermod -aG docker ubuntu
```
4. Install AWS CLI: `sudo snap install aws-cli --classic`
5. Authenticate to ECR: `aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin <ECR_URL>`
6. Create `.env` with production values (see `.env.example`)
7. Create `docker-compose.prod.yml` (see local copy in repo)
8. Start: `docker compose -f docker-compose.prod.yml pull && docker compose -f docker-compose.prod.yml up -d`

### Deploying updates

Normally you just **merge to `main`** and the pipeline deploys (see above). For a
manual deploy from your laptop, one command builds the images, pushes to ECR, and
restarts the EC2 stack:
```bash
make deploy
```

The EC2 host is a stable **Elastic IP** (`16.170.30.20`), so it does not change on
restart. Confirm it any time with `make prod-ip`; override only if it ever changes:
```bash
make deploy EC2=ubuntu@<new-ip>
```

Other prod helpers: `make restart-prod` (skip rebuild), `make prod-logs` (tail server logs).

### Production checklist

- [ ] `APP_ENV=PROD` in `.env`
- [ ] Strong `JWT_SECRET` — `openssl rand -hex 32`
- [ ] Strong `ADMIN_PASSWORD`
- [ ] `CLIENT_URL` set to your public domain or IP
- [ ] `SMS_019_USERNAME` + `SMS_019_TOKEN` set (token from the 019 web UI, shown once)
- [ ] `SMS_019_SENDER` — sender name (e.g. `KerenSarig`, max 11 chars, English letters/digits)
- [ ] Server's public IP registered in 019's authorized-IP settings (prod: the EC2 Elastic IP)
- [ ] MongoDB Atlas cluster running and IP whitelisted

---

## License

[MIT](LICENSE) © 2026 Keren Sarig Chinese Medical Clinic
