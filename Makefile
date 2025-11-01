.PHONY: help build up down logs shell migrate seed clean restart

# Default target
help:
	@echo "TaskFlow Docker Commands"
	@echo "========================"
	@echo ""
	@echo "Available commands:"
	@echo "  make build         - Build Docker images"
	@echo "  make up            - Start all services"
	@echo "  make down          - Stop all services"
	@echo "  make restart       - Restart all services"
	@echo "  make logs          - View logs from all services"
	@echo "  make logs-backend  - View backend logs only"
	@echo "  make logs-frontend - View frontend logs only"
	@echo "  make logs-db       - View database logs only"
	@echo "  make shell-backend - Open shell in backend container"
	@echo "  make shell-db      - Open shell in database container"
	@echo "  make migrate       - Run database migrations"
	@echo "  make seed          - Seed database with test data"
	@echo "  make clean         - Remove all containers and volumes"
	@echo "  make ps            - Show running containers"
	@echo ""

# Build images
build:
	@echo "Building Docker images..."
	docker-compose build

# Start services
up:
	@echo "Starting services..."
	docker-compose up -d
	@echo ""
	@echo "TaskFlow is now running!"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend:  http://localhost:5000"
	@echo "API Docs: http://localhost:5000/api-docs"
	@echo ""

# Stop services
down:
	@echo "Stopping services..."
	docker-compose down

# Restart services
restart: down up

# View logs
logs:
	docker-compose logs -f

logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

logs-db:
	docker-compose logs -f postgres

# Shell access
shell-backend:
	docker-compose exec backend sh

shell-db:
	docker-compose exec postgres psql -U taskflow -d taskflow

# Database operations
migrate:
	docker-compose exec backend yarn prisma:migrate

seed:
	docker-compose exec backend yarn db:seed

# Show container status
ps:
	docker-compose ps

# Clean up everything
clean:
	@echo "Cleaning up Docker resources..."
	docker-compose down -v
	@echo "Cleaned!"

# Development mode with logs
dev: up logs

# Production build
prod-build:
	@echo "Building production images..."
	docker-compose -f docker-compose.yml build --no-cache

# Health check
health:
	@echo "Checking service health..."
	@docker-compose exec backend wget --quiet --tries=1 --spider http://localhost:5000/api-docs && echo "✓ Backend is healthy" || echo "✗ Backend is not responding"
	@docker-compose exec frontend wget --quiet --tries=1 --spider http://localhost/health && echo "✓ Frontend is healthy" || echo "✗ Frontend is not responding"
	@docker-compose exec postgres pg_isready -U taskflow && echo "✓ Database is healthy" || echo "✗ Database is not responding"
