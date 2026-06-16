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

## Tests and docs are part of "done"

A feature or behavior change is NOT complete until BOTH of these are updated in the
same change — do this without being asked:
- **Tests** — add/extend Jest specs in `server/tests/*.spec.ts` for new managers,
  services, and Joi schemas (validation specs live in `validation.spec.ts`). New
  endpoint or rule ⇒ new test. Re-run `npm test` and update any test-count
  references (e.g. README) so they stay accurate.
- **Docs** — reflect the change everywhere relevant: the root `README.md`
  (Features / structure), the admin user guide `docs/keren-guide.md`, the client
  guide `docs/client-guide.md`, and any topic doc under `docs/`. `docs/` is
  gitignored/local-only but still the source of truth, so keep it current.
- **Illustrated guides** (`docs/guides/manager-guide.html` + `.pdf`,
  `client-guide.html` + `.pdf`) — ALWAYS keep these current too: edit the `.html`
  source, then **regenerate the `.pdf`** in the same change (don't hand-edit the
  binary, don't leave it stale). Regenerate with headless Chrome:
  `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf=docs/guides/manager-guide.pdf file://<abs>/docs/guides/manager-guide.html`
  Each `.page` div is one A4 sheet (297mm ≈ 1123px @96dpi) — after editing, confirm
  no page overflowed (the page-div count must equal the PDF page count) and that
  footer numbers/chapter numbers stay sequential.

## Docker parity

Any change to env vars, build args, or services must be reflected in EVERY Docker
path in the same change: `docker-compose.yml` (local), `docker-compose.prod.yml`,
both `Dockerfile`s, and the `Makefile`. Client-side `VITE_*` build vars need
plumbing in BOTH build paths: local — `client/Dockerfile` (ARG/ENV), `Makefile`
push-images (`--build-arg`), `docker-compose.yml` client build args; and CI/CD —
a GitHub **Variable** plus the client `build-args:` in `.github/workflows/ci.yml`.

## Security — verify on every change

Before committing, confirm:
- **Auth guards** — every mutating or admin route has `@UseGuards(AdminAuthGuard)`
  or `@UseGuards(JwtAuthGuard)`. Public routes expose only public data.
- **Server-authoritative** — never trust the client. Re-validate on the server
  (e.g. a booking must pass the server's availability check even if the client
  sent it). Ownership checks (`cancelOwn`) live in the manager.
- **Input validation** — Joi pipe on bodies; validate path/query params in the
  manager. Validate ObjectIds before querying (return 404, not a 500/CastError).
- **Bounds** — cap public range/list endpoints (e.g. `MAX_PUBLIC_RANGE_DAYS`) so
  they can't be used to dump data; rely on the global throttler for rate limits.
- **No PII / secrets in logs** — phones masked via `maskPhone`; headers redacted;
  bodies never logged.
- **No secrets in git** — scan the diff for tokens/passwords before pushing.

## Secrets

Never commit secrets. Local values live only in the gitignored `.env`;
`.env.example` holds placeholders. `docs/` is local-only (gitignored).

**Production** secrets live as **GitHub Actions secrets** (`PROD_ENV_FILE` =
whole prod `.env`, `EC2_SSH_KEY`, `AWS_DEPLOY_ROLE_ARN`) — only a repo admin can
overwrite them, none are readable back, and `main` is branch-protected so a
malicious workflow can't be merged to exfiltrate them. The local `.env` is
dev-only and never reaches prod.

## Deploy

**Auto-deploy (default):** pushing to `main` triggers the `deploy` job in
`.github/workflows/ci.yml` — it runs only after CI passes, then builds + pushes
images to ECR, ships the config files + the prod `.env`, and restarts EC2. A merge
to `main` **is** a production deploy. Setup/ops runbook: `docs/cd-pipeline-setup.md`.

- **Prod runtime config** lives in the `PROD_ENV_FILE` GitHub secret (not in git,
  not on your laptop). To change a prod value, edit that secret — editing your
  local `.env` does NOT reach prod. A pre-flight step
  (`server/scripts/validate-env.ts`, reusing `envSchema`) validates the rendered
  prod `.env` before anything ships, so a missing/invalid required var fails the
  deploy **before** prod is touched instead of crash-looping it. Adding a new
  required env var → update `env.validation.ts`, `.env.example`, AND the
  `PROD_ENV_FILE` secret.
- **Config files** mounted on EC2 (`nginx.conf`, `docker-compose.prod.yml`,
  `vector.yaml`) are NOT in the image — the deploy scp's them every run, so just
  edit them in the repo and merge.

**Manual fallback:** `make deploy` still builds + pushes + restarts from a laptop.
The EC2 host is a stable Elastic IP (`16.170.30.20`); confirm with `make prod-ip`.
