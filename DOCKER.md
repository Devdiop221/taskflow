# TaskFlow Docker Guide

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Git

### Start the Application

```bash
# Clone repository
git clone https://github.com/devdiop221/taskflow.git
cd taskflow

# Copy environment variables
cp .env.example .env

# Build and start services
docker-compose up --build

# Or use Makefile
make build
make up
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **API Docs**: http://localhost:5000/api-docs
- **Database**: postgresql://taskflow:taskflow_dev@localhost:5432/taskflow

### Using the Makefile

```bash
# View all available commands
make help

# Start services
make up

# View logs
make logs

# Run database migrations
make migrate

# Seed database
make seed

# Stop services
make down

# Check service health
make health
```

## Service Details

### PostgreSQL Database
- **Container**: `taskflow-postgres`
- **Port**: 5432
- **User**: taskflow
- **Password**: taskflow_dev
- **Database**: taskflow
- **Volume**: `postgres_data` (persistent)

### Backend API
- **Container**: `taskflow-backend`
- **Port**: 5000
- **Environment**: Node.js 20 Alpine
- **Health Check**: Checks `/api-docs` endpoint
- **Hot Reload**: Enabled in development (volume mount)

### Frontend
- **Container**: `taskflow-frontend`
- **Port**: 3000 (Nginx)
- **Environment**: Nginx Alpine
- **Health Check**: Checks `/health` endpoint

## Environment Configuration

Edit `.env` file to customize:

```env
# Database
DB_USER=taskflow
DB_PASSWORD=taskflow_dev
DB_NAME=taskflow
DB_PORT=5432

# Backend
NODE_ENV=development
BACKEND_PORT=5000
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000

# Frontend
FRONTEND_PORT=3000
VITE_API_URL=http://localhost:5000/api
```

## Common Tasks

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Database Operations
```bash
# Run migrations
docker-compose exec backend yarn prisma:migrate

# Seed database
docker-compose exec backend yarn db:seed

# Open database shell
docker-compose exec postgres psql -U taskflow -d taskflow

# Open Prisma Studio
docker-compose exec backend yarn prisma:studio
```

### Debugging

#### Access Backend Shell
```bash
docker-compose exec backend sh

# Inside container, you can run:
yarn build
yarn prisma:generate
node dist/server.js
```

#### Access Database Shell
```bash
docker-compose exec postgres psql -U taskflow -d taskflow

# Inside psql, you can run:
\dt              # List tables
\d tasks         # Describe table
SELECT * FROM users;
```

#### View Backend Logs
```bash
# Real-time logs
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend
```

## Production Deployment

### Build for Production

```bash
# Build production images
docker-compose -f docker-compose.yml build --no-cache

# Or use Makefile
make prod-build
```

### Environment Variables for Production

```env
NODE_ENV=production
JWT_SECRET=<generate-secure-random-string>
CORS_ORIGIN=https://your-frontend-domain.com
VITE_API_URL=https://your-backend-domain.com/api
```

### Generate Secure JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Troubleshooting

### Services Won't Start

```bash
# Check if ports are in use
lsof -i :3000    # Frontend
lsof -i :5000    # Backend
lsof -i :5432    # Database

# Or change ports in .env file
```

### Database Connection Issues

```bash
# Check database is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Verify connection string in backend logs
docker-compose logs backend | grep DATABASE_URL
```

### Frontend Can't Connect to Backend

```bash
# Verify CORS_ORIGIN in backend
docker-compose logs backend | grep CORS

# Check VITE_API_URL in frontend
docker-compose exec frontend cat /usr/share/nginx/html/index.html | grep VITE
```

### Clean Up and Restart

```bash
# Remove all containers, volumes, and networks
docker-compose down -v

# Rebuild everything from scratch
docker-compose up --build
```

## Performance Tips

1. **Use named volumes** - Already configured in docker-compose.yml
2. **Enable buildkit** - Faster builds: `export DOCKER_BUILDKIT=1`
3. **Use multi-stage builds** - Smaller images (already in Dockerfiles)
4. **Optimize layer caching** - Build images rarely change

## Security Best Practices

1. **Change default passwords** - Update `DB_PASSWORD` in .env
2. **Use strong JWT_SECRET** - Generate with `openssl rand -base64 32`
3. **Set NODE_ENV=production** - In production environments
4. **Restrict CORS_ORIGIN** - Only allow your frontend domain
5. **Use environment files** - Never commit sensitive values to git

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Dockerfile Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
