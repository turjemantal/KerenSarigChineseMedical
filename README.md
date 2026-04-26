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
- [License](#license)

---

## Features

### Client-Facing
- **Lead capture** — contact form sends enquiries directly to the admin dashboard
- **WhatsApp OTP login** — passwordless authentication via a one-time code sent to the client's phone
- **Appointment booking** — real-time slot availability check before confirming a booking
- **Client portal** — authenticated clients view and cancel their own appointments

### Admin
- **Dashboard** — view and manage all leads and appointments
- **Lead pipeline** — status lifecycle: `new → contacted → booked → closed`
- **Appointment management** — approve, reschedule, or cancel with a single action
- **Automated reminders** — cron job fires at 09:00 every morning and sends WhatsApp reminders for the following day's appointments

### Backend Architecture
- **REST API** with a global `/api` prefix; all routes follow resource-oriented naming
- **Event-driven side-effects** via a Manager layer — booking an appointment triggers a WhatsApp confirmation without coupling the controller to the messaging service
- **Scheduled tasks** — NestJS `@Cron` decorator drives the daily reminder job independently of the request lifecycle
- **JWT authentication** — stateless, phone-scoped tokens (30 d) for clients; short-lived admin tokens (12 h)
- **Joi validation pipeline** — every incoming DTO is validated at the controller boundary before it reaches business logic

---

## Tech Stack

| Layer | Technology |
|---|---|
| **API server** | NestJS 10, Node.js 22 |
| **Language** | TypeScript 5 (server), TypeScript 6 (client) |
| **Database** | MongoDB 8 + Mongoose 8 |
| **Auth** | Passport-JWT, @nestjs/jwt |
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
│       └── ci.yml              # Lint → test → build on every push/PR
├── client/                     # React + Vite frontend
│   ├── src/
│   │   ├── components/         # Landing, BookingModal, Dashboard, …
│   │   ├── auth.ts             # Token storage + API helpers
│   │   └── App.tsx
│   ├── nginx.conf              # Proxies /api → server:3001 in Docker
│   └── Dockerfile
├── server/                     # NestJS backend
│   ├── src/
│   │   ├── config/             # Centralised env-var config
│   │   ├── auth/               # OTP flow, JWT strategy, guards, DTOs
│   │   ├── appointments/       # Booking, availability, reminders
│   │   ├── leads/              # Enquiry capture and pipeline
│   │   ├── clients/            # Client profiles (findOrCreate)
│   │   └── integrations/
│   │       └── whatsapp/       # WhatsApp Cloud API service
│   ├── tests/                  # Jest unit tests
│   ├── .env.example
│   └── Dockerfile
├── docker-compose.yml
├── LICENSE
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 20 (LTS)
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
# From the repo root
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

---

## Environment Variables

All configuration lives in `server/src/config/index.ts` which reads from `server/.env`. Copy the example file and fill in the blanks:

```bash
cp server/.env.example server/.env
```

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `3001` | Port the NestJS server listens on |
| `CLIENT_URL` | No | `http://localhost:5173` | CORS origin for the React client |
| `MONGODB_URI` | No | `mongodb://localhost:27017/keren-clinic` | MongoDB connection string |
| `JWT_SECRET` | **Yes** | — | Secret used to sign client JWTs |
| `ADMIN_PASSWORD` | **Yes** | — | Password for the admin dashboard |
| `WHATSAPP_ACCESS_TOKEN` | No | — | Meta system-user token (WhatsApp Cloud API) |
| `WHATSAPP_PHONE_NUMBER_ID` | No | — | WhatsApp Business phone number ID |

> WhatsApp credentials are optional in development. When absent the server logs the message to the console instead of sending it.

---

## API Reference

Base URL: `http://localhost:3001/api`

### Authentication

#### `POST /auth/request-otp`
Send a one-time code to a client's WhatsApp number.

**Body**
```json
{ "phone": "0501234567" }
```

**Response** `200`
```json
{ "message": "OTP sent" }
```

---

#### `POST /auth/verify-otp`
Verify the OTP and receive a JWT. Creates the client record on first login.

**Body**
```json
{ "phone": "0501234567", "code": "123456", "name": "Dana Cohen" }
```

**Response** `200`
```json
{
  "token": "<jwt>",
  "client": { "_id": "…", "phone": "0501234567", "name": "Dana Cohen", "email": null }
}
```

---

#### `PATCH /auth/me/name` — requires JWT

Update the authenticated client's display name and receive a refreshed token.

**Headers** `Authorization: Bearer <token>`

**Body**
```json
{ "name": "Dana Levi" }
```

**Response** `200`
```json
{ "token": "<jwt>", "client": { … } }
```

---

#### `POST /auth/admin`
Authenticate as admin and receive a short-lived token (12 h).

**Body**
```json
{ "password": "<ADMIN_PASSWORD>" }
```

**Response** `200`
```json
{ "token": "<jwt>" }
```

---

### Appointments

#### `GET /appointments/availability/:date`
Returns booked time slots for a given date (no auth required).

**Example** `GET /appointments/availability/2026-05-10`

**Response** `200`
```json
["09:00", "11:30"]
```

---

#### `POST /appointments` — requires JWT

Book an appointment. Sends a WhatsApp confirmation to the client.

**Headers** `Authorization: Bearer <token>`

**Body**
```json
{
  "date": "2026-05-10",
  "time": "10:00",
  "treatment": "Acupuncture",
  "concern": "Back pain",
  "notes": "First visit"
}
```

`name` and `phone` default to the authenticated client's values if omitted.

**Response** `201`
```json
{
  "_id": "…",
  "phone": "0501234567",
  "name": "Dana Cohen",
  "date": "2026-05-10",
  "time": "10:00",
  "status": "pending",
  "reminderSent": false,
  "createdAt": "…"
}
```

---

#### `GET /appointments/mine` — requires JWT

List all appointments belonging to the authenticated client.

**Headers** `Authorization: Bearer <token>`

**Response** `200` — array of appointment objects.

---

#### `GET /appointments`
List all appointments (admin use).

---

#### `GET /appointments/:id`
Fetch a single appointment by ID.

---

#### `PATCH /appointments/:id`
Update status or notes (admin use).

**Body**
```json
{ "status": "scheduled", "notes": "Confirmed by phone" }
```

`status` values: `pending` | `scheduled` | `completed` | `cancelled` | `noshow`

---

#### `PATCH /appointments/:id/approve`
Shortcut to mark an appointment as `scheduled`.

---

#### `PATCH /appointments/:id/cancel` — requires JWT

Cancel the authenticated client's own appointment. Returns `403` if the caller is not the owner.

---

#### `DELETE /appointments/:id`
Hard-delete an appointment (admin use).

---

### Leads

#### `POST /leads`
Submit a patient enquiry form (no auth required).

**Body**
```json
{
  "name": "Oren Ben-David",
  "phone": "0521234567",
  "email": "oren@example.com",
  "concern": "Chronic fatigue",
  "treatment": "Acupuncture",
  "preferredDate": "2026-05-15",
  "preferredTime": "Morning"
}
```

**Response** `201` — lead object with `"status": "new"`.

---

#### `GET /leads`
List all leads (admin use).

---

#### `GET /leads/:id`
Fetch a single lead by ID.

---

#### `PATCH /leads/:id`
Update lead status or notes.

**Body**
```json
{ "status": "contacted", "notes": "Left a voicemail" }
```

`status` values: `new` | `contacted` | `booked` | `closed`

---

#### `DELETE /leads/:id`
Hard-delete a lead.

---

## Running Tests

Tests live in `server/tests/` and cover authentication, appointments, leads, clients, and input validation.

```bash
cd server

# Single run
npm test

# Watch mode (re-runs on file save)
npm run test:watch

# Coverage report
npm run test:cov
```

### Linting

```bash
# Server (NestJS / TypeScript)
cd server && npm run lint

# Client (React / TypeScript)
cd client && npm run lint
```

---

## CI/CD

Every push and pull request triggers the **GitHub Actions** workflow (`.github/workflows/ci.yml`).

| Job | Steps |
|---|---|
| **Server** | Install deps → Lint → Test → Build |
| **Client** | Install deps → Lint → Build |

Both jobs run in parallel on `ubuntu-latest` with **Node.js 20 LTS**.

---

## Docker

Start the full stack (MongoDB + server + client) with a single command:

```bash
docker compose up --build
```

| Service | Port | Description |
|---|---|---|
| `mongo` | 27017 | MongoDB 7 with persistent volume |
| `server` | 3001 | NestJS API |
| `client` | 80 | React app served via Nginx |

The client's Nginx configuration proxies all `/api/*` requests to the server container, so the frontend always talks to a single origin.

To stop and remove containers:

```bash
docker compose down
```

---

## License

[MIT](LICENSE) © 2026 Keren Sarig Chinese Medical Clinic
