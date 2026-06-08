.PHONY: up down rebuild logs deploy db-clean db-seed db-backup db-restore

ECR=$(shell aws sts get-caller-identity --query Account --output text).dkr.ecr.eu-central-1.amazonaws.com

# ── Local ─────────────────────────────────────────────────────────────────────

up:
	docker compose up -d

down:
	docker compose down

rebuild:
	docker compose up -d --build

logs:
	docker compose logs -f

# ── Deploy to ECR + update EC2 ────────────────────────────────────────────────

# Build for linux/amd64 and push to ECR
deploy:
	aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin $(ECR)
	docker buildx build --platform linux/amd64 -t $(ECR)/keren-server:latest --push ./server
	docker buildx build --platform linux/amd64 -t $(ECR)/keren-client:latest --push ./client

# Pull latest images and restart on EC2 — usage: make pull-prod EC2=ubuntu@<ip> KEY=~/.ssh/keren-clinic.pem
pull-prod:
	ssh -i $(KEY) $(EC2) "docker compose -f docker-compose.prod.yml pull && docker compose -f docker-compose.prod.yml up -d"

# ── Database ──────────────────────────────────────────────────────────────────

db-clean:
	@./scripts/clean-db.sh

db-seed:
	@./scripts/seed-db.sh

db-backup:
	@./scripts/backup-db.sh

# Usage: make db-restore ARCHIVE=backups/.../keren-clinic.archive
db-restore:
	@./scripts/restore-db.sh $(ARCHIVE)
