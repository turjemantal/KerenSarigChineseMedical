.PHONY: up down restart rebuild rebuild-server rebuild-client logs ps

# Start all services (no rebuild)
up:
	docker compose up -d

# Stop all services
down:
	docker compose down

# Restart all services
restart:
	docker compose restart

# Full rebuild and start (use after git pull)
rebuild:
	docker compose up -d --build

# Rebuild and restart server only
rebuild-server:
	docker compose up -d --build server

# Rebuild and restart client only
rebuild-client:
	docker compose up -d --build client

# Follow logs for all services
logs:
	docker compose logs -f

# Follow logs for server only
logs-server:
	docker compose logs -f server

# Follow logs for client only
logs-client:
	docker compose logs -f client

# Show running containers
ps:
	docker compose ps
