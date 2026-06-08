# Deployment Guide — Keren Clinic

This document covers the full production deployment setup:
- Amazon ECR (container registry)
- Amazon EC2 (server)
- MongoDB Atlas (database)
- Twilio SMS (messaging)

---

## Architecture Overview

```
Your Mac
   │
   ├── make deploy
   │      │
   │      └──► Amazon ECR (stores Docker images)
   │                  │
   │                  └──► EC2 pulls images and runs them
   │
   └── .env (secrets, never committed to git)

EC2 (Ubuntu 24.04, t3.small)
   ├── keren-server (NestJS API on port 3001)
   └── keren-client (React/Nginx on port 80)
          │
          └──► MongoDB Atlas (cloud database, eu-central-1)
          └──► Twilio (sends SMS messages)
```

---

## 1. Amazon ECR — Container Registry

**What it is:** Amazon Elastic Container Registry. Stores your Docker images in the cloud so EC2 can pull them.

**Why we use it:** Instead of building images on EC2 (slow on a small server), we build locally on Mac and push the compiled image. EC2 just pulls and runs it.

**Repositories created:**
- `keren-server` — NestJS backend image
- `keren-client` — React/Nginx frontend image

**Region:** `eu-central-1` (Frankfurt)

**How to deploy a new version:**
```bash
make deploy
```
This builds both images for `linux/amd64` (EC2 architecture) and pushes to ECR.

**How to update EC2 after pushing:**
```bash
make pull-prod EC2=ubuntu@<ip> KEY=~/.ssh/keren-clinic.pem
```

---

## 2. Amazon EC2 — Server

**What it is:** A virtual Linux server in the cloud that runs your Docker containers.

**Instance details:**
- **Type:** t3.small
- **OS:** Ubuntu 24.04 LTS
- **Region:** eu-central-1 (Frankfurt)
- **Public IP:** 16.16.200.144 *(may change on restart — get a static IP via Elastic IP later)*
- **Current URL:** http://16.16.200.144

**Security group rules:**
| Port | Source | Purpose |
|------|--------|---------|
| 22 | Your IP only | SSH access |
| 80 | Anywhere | Website (HTTP) |

**Installed software:**
- Docker Engine 29
- Docker Compose plugin
- AWS CLI v2 (via snap)

**Files on the server:**
```
/home/ubuntu/
├── .env                      # Production secrets (never in git)
└── docker-compose.prod.yml   # Uses ECR images + MongoDB Atlas
```

**Useful commands on EC2:**
```bash
# Check running containers
docker compose -f docker-compose.prod.yml ps

# View server logs
docker compose -f docker-compose.prod.yml logs server

# Restart everything
docker compose -f docker-compose.prod.yml up -d

# Pull latest images and restart
docker compose -f docker-compose.prod.yml pull && docker compose -f docker-compose.prod.yml up -d
```

---

## 3. MongoDB Atlas — Database

**What it is:** MongoDB's managed cloud database. No need to run MongoDB yourself.

**Why we use it:** Free tier (M0), automatic backups, accessible from EC2, no maintenance required.

**Cluster details:**
- **Cluster name:** keren-clinic
- **Provider:** AWS eu-central-1 (Frankfurt)
- **Tier:** M0 (free forever)
- **Database:** keren-clinic
- **User:** keren

**Connection string (in EC2 .env):**
```
MONGODB_URI=mongodb+srv://keren:<password>@keren-clinic.gd0uzyf.mongodb.net/keren-clinic?appName=keren-clinic
```

**Network access:** `0.0.0.0/0` (open to all IPs — restrict to EC2 IP for better security later)

**View data:** MongoDB Atlas → your cluster → Browse Collections

---

## 4. Twilio SMS — Messaging

**What it is:** SMS delivery service. Sends OTP codes, booking confirmations, and appointment reminders to clients.

**Why we switched from WhatsApp:** WhatsApp requires pre-approved message templates which take days/weeks to approve. Twilio SMS sends plain text immediately, no approval needed.

**Account details:**
- **From number:** +12675505952 (US number — works for sending to Israel)
- **Pricing:** ~$0.15 per SMS to Israel
- **Trial:** Free $100 credits, ~180 days

**Important — Trial restriction:**
During free trial, SMS can only be sent to **verified numbers**. To verify:
1. Twilio Console → Phone Numbers → Verified Caller IDs
2. Add your Israeli number in `+972XXXXXXXXX` format

**To remove trial restriction:** Add a payment method in Twilio Console.

---

## 5. Environment Variables

The `.env` file on EC2 contains all production secrets. **Never commit this file to git.**

```env
APP_ENV=PROD
PORT=3001
CLIENT_URL=http://16.16.200.144   # update when you get a domain

MONGODB_URI=mongodb+srv://...

JWT_SECRET=<strong random secret>
ADMIN_PASSWORD=<your admin password>

MESSAGING_PROVIDER=sms
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_FROM_NUMBER=+12675505952

ECR_SERVER_IMAGE=<account>.dkr.ecr.eu-central-1.amazonaws.com/keren-server:latest
ECR_CLIENT_IMAGE=<account>.dkr.ecr.eu-central-1.amazonaws.com/keren-client:latest
```

---

## 6. Messaging Provider Switch

The app supports two messaging providers, switchable via config:

| `MESSAGING_PROVIDER` | Provider | Notes |
|---|---|---|
| `sms` | Twilio | Plain text, no approval needed ✅ |
| `whatsapp` | WhatsApp Cloud API | Requires pre-approved templates |

To switch back to WhatsApp when templates are approved:
1. Update `MESSAGING_PROVIDER=whatsapp` in EC2 `.env`
2. Add all `WHATSAPP_*` variables
3. Restart: `docker compose -f docker-compose.prod.yml up -d`

---

## 7. Standard Deploy Flow

Every time you make code changes:

**Step 1 — On your Mac:**
```bash
make deploy
```

**Step 2 — On EC2:**
```bash
make pull-prod EC2=ubuntu@16.16.200.144 KEY=~/Downloads/keren-clinic.pem
```

Or SSH in manually:
```bash
ssh -i ~/Downloads/keren-clinic.pem ubuntu@16.16.200.144
docker compose -f docker-compose.prod.yml pull && docker compose -f docker-compose.prod.yml up -d
```

---

## 8. Next Steps

- [ ] **Buy a domain** — `.co.il` from [Internet-il.co.il](https://www.internet.co.il) or `.com` from AWS Route 53
- [ ] **Point DNS** — Add an `A record` pointing your domain to `16.16.200.144`
- [ ] **Add HTTPS** — Install Certbot + Let's Encrypt on EC2
- [ ] **Update `CLIENT_URL`** in EC2 `.env` to your domain
- [ ] **Elastic IP** — Assign a static IP to EC2 so it doesn't change on restart
- [ ] **Restrict MongoDB Atlas** — Change Network Access from `0.0.0.0/0` to EC2's IP only
- [ ] **Upgrade Twilio** — Add payment method to remove verified-numbers restriction
- [ ] **WhatsApp templates** — Submit and get approved when ready to switch back

---

## 9. AWS Costs

| Service | Cost |
|---|---|
| EC2 t3.small | ~$15/month (covered by $100 credits) |
| ECR storage | ~$0.10/month |
| MongoDB Atlas M0 | Free forever |
| Twilio SMS | ~$0.15/SMS to Israel |

Credits balance: ~$100 USD, valid until Dec 2026.
