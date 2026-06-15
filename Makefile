.PHONY: up down rebuild logs deploy push-images restart-prod prod-ip prod-logs db-clean db-seed db-backup db-restore

ECR=$(shell aws sts get-caller-identity --query Account --output text).dkr.ecr.eu-central-1.amazonaws.com

# EC2 connection — 16.170.30.20 is an Elastic IP (stable across restarts).
# Override only if it ever changes: make deploy EC2=ubuntu@<new-ip> (find it with: make prod-ip)
EC2 ?= ubuntu@16.170.30.20
KEY ?= ~/.ssh/keren-clinic.pem

# ── Local ─────────────────────────────────────────────────────────────────────

up:
	docker compose up -d

down:
	docker compose down

rebuild:
	docker compose up -d --build

logs:
	docker compose logs -f

# ── Production deploy ─────────────────────────────────────────────────────────
# PRIMARY PATH is now CI/CD: pushing to `main` auto-deploys via GitHub Actions
# (.github/workflows/ci.yml). `make deploy` is a MANUAL FALLBACK and does NOT
# touch the prod .env — that is owned by the PROD_ENV_FILE GitHub secret. See
# docs/cd-pipeline-setup.md.

# Full deployment: build images → push to ECR → sync config + restart the EC2 stack
deploy: push-images restart-prod
	@echo "✅ Production deploy complete — https://kerensarig.co.il"

# Step 1: build server+client for linux/amd64 and push to ECR
# (client gets build-time Vite vars from the root .env)
push-images:
	aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin $(ECR)
	docker buildx build --platform linux/amd64 -t $(ECR)/keren-server:latest --push ./server
	docker buildx build --platform linux/amd64 \
		--build-arg VITE_MEDIA_BASE_URL=$$(grep '^VITE_MEDIA_BASE_URL=' .env | cut -d= -f2-) \
		-t $(ECR)/keren-client:latest --push ./client

# Step 2: sync config files, pull the latest images on EC2, and restart the stack.
# Mirrors what the CD pipeline ships, MINUS .env (prod .env = PROD_ENV_FILE secret;
# the local .env is dev-only and must never be pushed to prod).
restart-prod:
	scp -i $(KEY) docker-compose.prod.yml nginx.conf vector.yaml $(EC2):~/
	ssh -i $(KEY) $(EC2) "aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin $(ECR) && docker compose -f docker-compose.prod.yml pull && docker compose -f docker-compose.prod.yml up -d"

# Current public IP of the production instance
prod-ip:
	aws ec2 describe-instances --region eu-north-1 --query "Reservations[].Instances[?State.Name=='running'].PublicIpAddress" --output text

# Tail the production server logs
prod-logs:
	ssh -i $(KEY) $(EC2) "docker logs keren-server --tail 50 -f"

# ── Database (local) ──────────────────────────────────────────────────────────

db-clean:
	@./scripts/clean-db.sh

db-seed:
	@./scripts/seed-db.sh

db-backup:
	@./scripts/backup-db.sh

# Usage: make db-restore ARCHIVE=backups/.../keren-clinic.archive
db-restore:
	@./scripts/restore-db.sh $(ARCHIVE)
