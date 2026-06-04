# Keren Sarig — Chinese Medicine Clinic

A full-stack clinic management platform for Keren Sarig's Chinese Medicine practice. Clients can submit enquiries and book appointments online; practitioners manage everything through an admin dashboard. Appointment reminders are sent automatically via WhatsApp the morning before each visit.

[![CI](https://github.com/turjemantal/KerenSarigChineseMedical/actions/workflows/ci.yml/badge.svg)](https://github.com/turjemantal/KerenSarigChineseMedical/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Running Tests](#running-tests)
- [CI/CD](#cicd)
- [Docker](#docker)
- [Deployment](#deployment)
- [License](#license)

---

## Features

### Client-Facing
- **Lead capture** — contact form sends enquiries directly to the admin dashboard
- **WhatsApp OTP login** — passwordless authentication via a one-time code sent to the client's phone
- **Appointment booking** — real-time slot availability check before confirming a booking
- **Client portal** — authenticated clients view and cancel their own upcoming appointments

### Admin
- **Dashboard** — accessible at `/manager`; protected by a password-issued admin JWT
- **Lead pipeline** — status lifecycle: `new → contacted → booked → closed`
- **Appointment management** — approve, update notes, or cancel with a single action
- **Automated reminders** — cron job fires at 09:00 every morning and sends WhatsApp reminders for the following day's appointments

### Backend Architecture
- **REST API** with a global `/api` prefix; all routes follow resource-oriented naming
- **Role-based auth** — client JWTs (30 d) and admin JWTs (12 h) carry distinct roles; `AdminAuthGuard` rejects non-admin tokens on all management routes
- **Rate limiting** — global 60 req/min per IP via `@nestjs/throttler`; OTP send capped at 5/min, OTP verify and admin login at 10/min
- **Event-driven side-effects** via a Manager layer — booking triggers a WhatsApp confirmation without coupling the controller to the messaging service
- **Scheduled tasks** — NestJS `@Cron` decorator drives the daily reminder job independently of the request lifecycle
- **Joi validation pipeline** — every incoming DTO is validated at the controller boundary before it reaches business logic
- **Startup env validation** — server refuses to start if required environment variables are missing

---

## Tech Stack

| Layer | Technology |
|---|---|
| **API server** | NestJS 10, Node.js 22 |
| **Language** | TypeScript 5 (server), TypeScript 6 (client) |
| **Database** | MongoDB 7 + Mongoose 8 |
| **Auth** | Passport-JWT, @nestjs/jwt |
| **Rate limiting** | @nestjs/throttler |
| **Scheduling** | @nestjs/schedule (cron) |
| **Messaging** | WhatsApp Business Cloud API (Meta, v21.0) |
| **Validation** | Joi 18 + custom NestJS pipe |
| **Frontend** | React 19, Vite 8 |
| **Styling** | Tailwind CSS 4 |
| **Containerisation** | Docker (multi-stage), Docker Compose |
| **CI** | GitHub Actions |
| **Linting** | ESLint 9 + typescript-eslint 8 |
| **Testing** | Jest 30 + ts-jest |

---

## Project Structure

```
kerenWebsite/
├── .github/
│   └── workflows/
│       └── ci.yml                 # Lint → test → build on every push/PR
├── client/                        # React + Vite frontend
│   ├── src/
│   │   ├── components/            # Landing, BookingModal, Dashboard, …
│   │   ├── auth.ts                # Token storage + authHeader / adminAuthHeader helpers
│   │   └── App.tsx                # React Router: / · /portal · /manager
│   ├── nginx.conf                 # Proxies /api → server:3001 in Docker
│   └── Dockerfile
├── server/                        # NestJS backend
│   ├── src/
│   │   ├── config/                # Centralised env-var config + Joi startup validation
│   │   ├── auth/                  # OTP flow, JWT strategy, JwtAuthGuard, AdminAuthGuard
│   │   ├── appointments/          # Booking, availability, reminders
│   │   ├── leads/                 # Enquiry capture and pipeline
│   │   ├── clients/               # Client profiles (findOrCreate)
│   │   └── integrations/
│   │       └── whatsapp/          # WhatsApp Cloud API service (TEST/PROD modes)
│   ├── tests/                     # Jest unit tests (96 tests)
│   ├── .env.example
│   └── Dockerfile
├── docker-compose.yml
├── .env.example                   # Root-level template for docker-compose
├── LICENSE
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 22
- **npm** ≥ 10
- **MongoDB** running locally on port 27017 — or use Docker (see [Docker](#docker))

### 1. Clone the repository

```bash
git clone https://github.com/turjemantal/KerenSarigChineseMedical.git
cd KerenSarigChineseMedical
```

### 2. Configure the server

```bash
cd server
cp .env.example .env
```

Open `server/.env` and fill in the required values (see [Environment Variables](#environment-variables)).

### 3. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 4. Start the development servers

**Terminal 1 — API server** (port 3001):

```bash
cd server
npm run start:dev
```

**Terminal 2 — React client** (port 5173):

```bash
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.
Admin dashboard: [http://localhost:5173/manager](http://localhost:5173/manager)

---

## Environment Variables

All configuration is read at startup via `server/src/config/index.ts`. The server **will not start** if any required variable is missing. Copy the example and fill in the blanks:

```bash
cp server/.env.example server/.env
```

| Variable | Required | Description |
|---|---|---|
| `APP_ENV` | **Yes** | `TEST` (skip WhatsApp) or `PROD` (send real messages) |
| `PORT` | No (default `3001`) | Port the NestJS server listens on |
| `CLIENT_URL` | **Yes** | CORS origin — e.g. `https://yourdomain.com` |
| `MONGODB_URI` | No (default local) | MongoDB connection string |
| `JWT_SECRET` | **Yes** | Secret used to sign client JWTs (use a long random string) |
| `ADMIN_PASSWORD` | **Yes** | Password for the `/manager` admin dashboard |
| `WHATSAPP_ACCESS_TOKEN` | Yes in PROD | Meta system-user access token |
| `WHATSAPP_PHONE_NUMBER_ID` | Yes in PROD | WhatsApp Business phone number ID |
| `WHATSAPP_TEMPLATE_LANGUAGE` | Yes in PROD | Template language code — e.g. `he` |
| `WHATSAPP_TEMPLATE_OTP` | Yes in PROD | Approved template name for OTP messages |
| `WHATSAPP_TEMPLATE_BOOKING_CONFIRMATION` | Yes in PROD | Approved template name for booking confirmations |
| `WHATSAPP_TEMPLATE_APPOINTMENT_REMINDER` | Yes in PROD | Approved template name for daily reminders |

> In `APP_ENV=TEST` mode the server logs WhatsApp messages to the console instead of sending them. All WhatsApp variables are optional in TEST mode and required in PROD mode — the Joi startup check enforces this.

---

## API Reference

Base URL: `http://localhost:3001/api`

Auth notation:
- **Client JWT** — `Authorization: Bearer <token>` issued by `POST /auth/verify-otp`
- **Admin JWT** — `Authorization: Bearer <token>` issued by `POST /auth/admin`

### Authentication

#### `POST /auth/request-otp` — rate-limited 5/min
Send a one-time code to a client's WhatsApp number.

```json
{ "phone": "0501234567" }
```

Response `200`: `{ "message": "OTP sent" }`

---

#### `POST /auth/verify-otp` — rate-limited 10/min
Verify the OTP and receive a JWT. Creates the client record on first login.

```json
{ "phone": "0501234567", "code": "123456", "name": "Dana Cohen" }
```

Response `200`:
```json
{ "token": "<jwt>", "client": { "_id": "…", "phone": "0501234567", "name": "Dana Cohen" } }
```

---

#### `PATCH /auth/me/name` — requires Client JWT
Update the authenticated client's display name and receive a refreshed token.

```json
{ "name": "Dana Levi" }
```

---

#### `POST /auth/admin` — rate-limited 10/min
Authenticate as admin and receive a short-lived admin JWT (12 h).

```json
{ "password": "<ADMIN_PASSWORD>" }
```

Response `200`: `{ "token": "<jwt>" }`

---

### Appointments

#### `GET /appointments/availability/:date` — public
Returns booked time slots for a given date.

Response `200`: `["09:00", "11:30"]`

---

#### `POST /appointments` — requires Client JWT
Book an appointment. Fires a WhatsApp booking confirmation to the client.

```json
{ "date": "2026-05-10", "time": "10:00", "concern": "Back pain", "notes": "First visit" }
```

---

#### `GET /appointments/mine` — requires Client JWT
List all appointments belonging to the authenticated client.

---

#### `PATCH /appointments/:id/cancel` — requires Client JWT
Cancel the client's own appointment. Returns `403` if the caller is not the owner.

---

#### `GET /appointments` — requires Admin JWT
List all appointments.

---

#### `GET /appointments/:id` — requires Admin JWT
Fetch a single appointment by ID.

---

#### `PATCH /appointments/:id` — requires Admin JWT
Update status or notes.

```json
{ "status": "scheduled", "notes": "Confirmed by phone" }
```

`status` values: `pending` | `scheduled` | `completed` | `cancelled` | `noshow`

---

#### `PATCH /appointments/:id/approve` — requires Admin JWT
Shortcut to mark an appointment as `scheduled`.

---

#### `DELETE /appointments/:id` — requires Admin JWT
Hard-delete an appointment.

---

### Leads

#### `POST /leads` — public
Submit a patient enquiry form.

```json
{
  "name": "Oren Ben-David",
  "phone": "0521234567",
  "email": "oren@example.com",
  "concern": "Chronic fatigue"
}
```

Response `201` — lead object with `"status": "new"`.

---

#### `GET /leads` — requires Admin JWT
List all leads.

---

#### `GET /leads/:id` — requires Admin JWT
Fetch a single lead by ID.

---

#### `PATCH /leads/:id` — requires Admin JWT
Update lead status or notes.

```json
{ "status": "contacted", "notes": "Left a voicemail" }
```

`status` values: `new` | `contacted` | `booked` | `closed`

---

#### `DELETE /leads/:id` — requires Admin JWT
Hard-delete a lead.

---

## Running Tests

Tests live in `server/tests/` and cover authentication, appointments, leads, clients, WhatsApp service, and input validation (96 tests total).

```bash
cd server

# Single run
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov
```

### Linting

```bash
cd server && npm run lint
cd client && npm run lint
```

---

## CI/CD

Every push and pull request triggers the GitHub Actions workflow (`.github/workflows/ci.yml`).

| Job | Steps |
|---|---|
| **Server** | Install deps → Lint → Test → Build |
| **Client** | Install deps → Lint → Build |

Both jobs run in parallel on `ubuntu-latest` with **Node.js 22**.

---

## Docker

Start the full stack (MongoDB + server + client) with a single command:

```bash
cp .env.example .env   # fill in your values
docker compose up --build
```

| Service | Exposed port | Description |
|---|---|---|
| `mongo` | none (internal only) | MongoDB 7 with persistent named volume |
| `server` | 3001 (internal) | NestJS API |
| `client` | **80** | React app served via Nginx; proxies `/api/*` to server |

The client's Nginx configuration proxies all `/api/*` requests to the server container, so the browser always talks to a single origin on port 80.

Data is stored in a named Docker volume (`mongo_data`) and survives container restarts and `docker compose down`. Only `docker compose down -v` removes the volume — never run that in production.

---

## Deployment

The recommended setup is a single EC2 instance (e.g. `t3.small`) running Docker Compose.

```bash
# On the EC2 instance
git clone https://github.com/turjemantal/KerenSarigChineseMedical.git
cd KerenSarigChineseMedical
cp .env.example .env   # fill in production values
docker compose up -d --build
```

### Production checklist

- [ ] `APP_ENV=PROD` in `.env`
- [ ] Strong random `JWT_SECRET` — `openssl rand -base64 32`
- [ ] Strong `ADMIN_PASSWORD` — `openssl rand -base64 16`
- [ ] `CLIENT_URL` set to your public domain
- [ ] WhatsApp templates approved in Meta Business Manager
- [ ] EC2 termination protection enabled (protects the MongoDB volume)
- [ ] Point your domain to the EC2 public IP and configure HTTPS (e.g. via Nginx + Certbot on the host, or a load balancer)

To redeploy after a code change:

```bash
git pull
docker compose up -d --build
```

---

## License

[MIT](LICENSE) © 2026 Keren Sarig Chinese Medical Clinic
