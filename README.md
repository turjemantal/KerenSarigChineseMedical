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

- **Lead capture** — contact form sends enquiries to the admin dashboard
- **OTP login** — passwordless auth via SMS or WhatsApp one-time code
- **Appointment booking** — real-time slot availability; only future slots on working days (enforced server-side on the clinic's timezone)
- **Approval flow** — bookings start as *pending*; the client gets a "request received" message, and the confirmation SMS is sent only when the admin approves (from the dashboard home, appointments list, or detail drawer)
- **Schedule blocks** — admin can close hours, full days, or vacation ranges from the calendar; blocked slots are hidden in booking and rejected by the API
- **Client portal** — authenticated clients view and cancel their appointments
- **Admin dashboard** — lead pipeline, appointment management, calendar (week view on desktop, day agenda on mobile), fully usable from a phone
- **Automated reminders** — cron job at 09:00 sends reminders for next-day appointments
- **Legal pages** — accessibility statement (`/accessibility`) and privacy policy (`/privacy`) per Israeli law (תקנה 35; חוק הגנת הפרטיות incl. Amendment 13)

---

## Tech Stack

| Layer | Technology |
|---|---|
| **API server** | NestJS 10, Node.js 22 |
| **Language** | TypeScript 5 |
| **Database** | MongoDB (local via Docker or MongoDB Atlas) |
| **Auth** | Passport-JWT, @nestjs/jwt |
| **Messaging** | Twilio SMS or WhatsApp Cloud API (switchable via config) |
| **Validation** | Joi + custom NestJS pipe |
| **Frontend** | React 19, Vite, Tailwind CSS 4 |
| **Containerisation** | Docker (multi-stage), Docker Compose |
| **Registry** | Amazon ECR |
| **Hosting** | AWS EC2 |
| **CI** | GitHub Actions |
| **Testing** | Jest + ts-jest (104 tests) |

---

## Project Structure

```
kerenWebsite/
├── client/                        # React + Vite frontend
│   ├── src/
│   │   ├── components/            # Landing, BookingModal, Dashboard, ClientPortal…
│   │   └── auth.ts                # Token storage helpers
│   ├── nginx.conf                 # Proxies /api → server:3001 in Docker
│   └── Dockerfile
├── server/                        # NestJS backend
│   ├── src/
│   │   ├── config/                # Env-var config + Joi startup validation
│   │   ├── common/
│   │   │   ├── constants/         # Messages, OTP timing, clinic defaults
│   │   │   ├── enums/             # AppEnv, MessagingProvider, statuses
│   │   │   └── utils/             # Date formatting, phone normalisation
│   │   ├── auth/                  # OTP flow, JWT strategy, guards
│   │   ├── appointments/          # Booking, availability, reminders
│   │   ├── leads/                 # Enquiry capture and pipeline
│   │   ├── clients/               # Client profiles
│   │   └── integrations/
│   │       ├── messaging/         # IMessagingProvider interface + DI token
│   │       ├── sms/               # Twilio SMS implementation
│   │       └── whatsapp/          # WhatsApp Cloud API implementation
│   └── Dockerfile
├── scripts/
│   ├── clean-db.sh                # Drop database
│   ├── seed-db.sh                 # Seed sample data
│   ├── backup-db.sh               # Export to archive
│   └── restore-db.sh              # Restore from archive
├── docker-compose.yml             # Local development (includes MongoDB)
├── docker-compose.prod.yml        # Production (uses ECR images + Atlas)
├── Makefile                       # Shortcuts for common tasks
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
| `ADMIN_PHONE` | *(optional)* clinic owner's phone — gets an alert on every new booking |

### Messaging

| Variable | Description |
|---|---|
| `MESSAGING_PROVIDER` | `sms` (Twilio) or `whatsapp` — default: `whatsapp` |

See [Messaging Providers](#messaging-providers) for provider-specific variables.

---

## Messaging Providers

The messaging system is abstracted behind `IMessagingProvider`. Switch provider by changing `MESSAGING_PROVIDER` in `.env` — no code changes needed.

### Twilio SMS (`MESSAGING_PROVIDER=sms`)

Required in `DEV` / `PROD`:

| Variable | Description |
|---|---|
| `TWILIO_ACCOUNT_SID` | From Twilio Console dashboard (`AC...`) |
| `TWILIO_API_KEY_SID` | Scoped API key (`SK...`) — Console → Account → API keys & tokens |
| `TWILIO_API_KEY_SECRET` | Shown once when the API key is created |
| `TWILIO_FROM_NUMBER` | Sender: a purchased Twilio number (`+12025551234`) or an alphanumeric sender ID (`KerenSarig`, max 11 chars, one-way only) |

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
| `WHATSAPP_API_VERSION` | API version — default: `v21.0` |

---

## Running Tests

```bash
cd server
npm test
```

104 tests covering auth, appointments, leads, clients, SMS provider, WhatsApp provider, and validation.

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
make db-clean    # Drop all data
make db-seed     # Insert sample clients, appointments, leads
make db-backup   # Export to ./backups/<timestamp>/
make db-restore ARCHIVE=backups/.../keren-clinic.archive
```

---

## Deployment

### Architecture

```
Mac → make deploy → Amazon ECR → EC2 pulls → serves on port 80
                                 MongoDB Atlas (cloud database)
```

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

One command does everything — builds the images, pushes to ECR, and restarts the EC2 stack:
```bash
make deploy
```

If the EC2 IP changed (no Elastic IP yet — it changes on instance restart):
```bash
make prod-ip                          # find the current IP
make deploy EC2=ubuntu@<new-ip>       # deploy to it
```

Other prod helpers: `make restart-prod` (skip rebuild), `make prod-logs` (tail server logs).

### Production checklist

- [ ] `APP_ENV=PROD` in `.env`
- [ ] Strong `JWT_SECRET` — `openssl rand -hex 32`
- [ ] Strong `ADMIN_PASSWORD`
- [ ] `CLIENT_URL` set to your public domain or IP
- [ ] `TWILIO_API_KEY_SID` + `TWILIO_API_KEY_SECRET` set (auth token is no longer used)
- [ ] `TWILIO_FROM_NUMBER` — purchased number or alphanumeric sender ID (e.g. `KerenSarig`)
- [ ] Twilio account upgraded (trial only delivers to verified numbers)
- [ ] MongoDB Atlas cluster running and IP whitelisted

---

## License

[MIT](LICENSE) © 2026 Keren Sarig Chinese Medical Clinic
