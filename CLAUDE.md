# Keren Sarig Clinic — Project Instructions

Always-on rules for working in this repo. (For a step-by-step procedure to add a
new server module, the `server-module` skill expands on the layering below.)

## Server architecture — strict layering

Every server module follows **controller → manager → service → DAO**. Keep each
layer to its job:

- **Controller** — routing and delegation ONLY. No business logic, no validation
  `if`s, no data shaping. A handler is one line that calls a manager method.
  Allowed: route decorators, guards, `@Body`/`@Param`/`@Query`, Joi validation
  pipes, extracting fields off the authenticated user, and returning the manager
  call. If you write an `if`, a `throw`, a `.map`, or reach into two services —
  it does not belong here.
- **Manager** — orchestration. Cross-module data (injects other managers),
  combining sources, input validation that belongs to the use-case, messaging,
  logging. This is where "fetch from elsewhere and decide" lives.
- **Service** — module-specific business logic and the single entry point to its
  own DAO. Validates ids, throws domain errors, enforces module rules.
- **DAO** — Mongoose queries only. No business logic.

When something needs data from another module, the **manager** injects that
module's **manager** (never its service/DAO). Services stay within their module.

Constants, enums, and user-facing strings live in `server/src/common/constants`
and `server/src/common/enums` — never inline literals or magic numbers. Error
messages go in `errors.constants.ts`.

## Verify changes in BOTH run modes

A change is not done until it works **locally (vite/`npm run dev`) AND via
Docker**. Before saying something works:
- `cd server && npm test` (Jest) and `npx tsc --noEmit`
- `npm --prefix client run build`
- `make rebuild` (local Docker) and check the running container, not just vite

## Docker parity

Any change to env vars, build args, or services must be reflected in EVERY Docker
path in the same change: `docker-compose.yml` (local), `docker-compose.prod.yml`,
both `Dockerfile`s, and the `Makefile`. Client-side `VITE_*` build vars need
plumbing in three places: `client/Dockerfile` (ARG/ENV), `Makefile` push-images
(`--build-arg`), and `docker-compose.yml` client build args.

## Secrets

Never commit secrets. Real values live only in the gitignored `.env`;
`.env.example` holds placeholders. `docs/` is local-only (gitignored).

## Deploy

`make deploy` builds + pushes images and restarts EC2. Config files mounted on
EC2 (`nginx.conf`, `docker-compose.prod.yml`, `vector.yaml`) are NOT in the image
— `scp` them when they change. The EC2 public IP changes on restart; find it with
`make prod-ip`.
