# VPS Deployment Example

This directory contains a complete Docker-based deployment setup for a Node.js/Bun API service with PostgreSQL, Redis, and Nginx reverse proxy, designed for VPS deployment via GitHub Actions.

## 🗂️ Files

- **docker-compose-vps.yml**: Multi-service Docker Compose configuration
- **nginx.conf**: Nginx reverse proxy configuration  
- **deploy-to-vps.yml**: GitHub Actions workflow for automated deployment
- **readme.md**: This documentation

## 🏗️ Architecture

```
Internet → Nginx (Port 80) → API Service (Port 3000)
                           ↓
                    PostgreSQL + Redis
```

### Services Stack

- **API Service**: Node.js/Bun application (port 3000)
- **PostgreSQL**: Database with pgvector extension
- **Redis**: Caching and session storage
- **Nginx**: Reverse proxy and load balancer

## ⚡ Quick Start

### Prerequisites

1. **VPS Setup**: Use the VPS setup scripts from `../setup-ubuntu/`
2. **GitHub Secrets**: Configure required secrets in your repository
3. **Docker Registry**: GitHub Container Registry (GHCR) access

### Required GitHub Secrets

```bash
# VPS Connection
HETZNER_HOST=your-vps-ip
HETZNER_SSH_PORT=4122  # Optional, defaults to 22
HETZNER_USER=admin     # Optional, defaults to admin
HETZNER_SSH_KEY=your-private-ssh-key

# Application Configuration
API_KEY=your-production-api-key
CORS_ORIGIN=https://yourdomain.com

# Database Credentials
POSTGRES_PASSWORD=secure-postgres-password
REDIS_PASSWORD=secure-redis-password

# Optional API Keys (example for AI services)
LLM_EMBEDDINGS_API_KEY=your-embeddings-api-key
LLM_EXTRACTION_API_KEY=your-extraction-api-key
LLM_SUMMARIZATION_API_KEY=your-summarization-api-key
LLM_COMMON_API_KEY=your-common-api-key
PORTFOLIO_API_KEY=your-portfolio-api-key
```

### Deployment Steps

1. **Copy Files**: Add these files to your project repository
   ```bash
   mkdir -p deploy .github/workflows
   cp docker-compose-vps.yml deploy/
   cp nginx.conf deploy/
   cp deploy-to-vps.yml .github/workflows/
   ```

2. **Configure Repository**: Set up GitHub secrets in repository settings

3. **Deploy**: Run the GitHub Action workflow manually or via workflow_call

## 🚀 GitHub Actions Workflow

The deployment workflow (`deploy-to-vps.yml`) performs:

1. **Build & Push**: Creates Docker image and pushes to GHCR
2. **Deploy**: SSH to VPS and deploy via Docker Compose
3. **Health Check**: Verifies all services are running

### Workflow Features

- Automatic image building and registry push
- Environment file generation on VPS
- Health checks with `--wait` flag
- Docker cleanup after deployment
- Supports both manual trigger and workflow_call

## 🐳 Docker Compose Configuration

### Resource Limits

Optimized for small VPS instances:

```yaml
API Service:  512M-1G RAM, 0.25-0.5 CPU
PostgreSQL:   1G-2G RAM, 0.5-1.0 CPU  
Redis:        128M-256M RAM
Nginx:        128M-512M RAM, 0.5-1.0 CPU
```

### Volume Mounts

- **PostgreSQL**: `/mnt/data/postgres` (persistent database)
- **Redis**: `/mnt/data/redis` (persistent cache)
- **Nginx**: `./nginx.conf` (configuration)

### Health Checks

All services include comprehensive health checks:
- **API**: HTTP health endpoint test
- **PostgreSQL**: `pg_isready` check
- **Redis**: Connection ping test
- **Nginx**: Health endpoint proxy test

## 🔧 Nginx Configuration

### Routing

- **API Proxy**: `/my-super-service/api/` → `http://api_upstream:3000/api/`
- **Health Check**: `/my-super-service/api/health` (no logging)
- **Default**: Returns 444 (connection closed) for all other paths

### Security Headers

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
```

### Performance Settings

- Connection timeout: 30s
- Proxy buffering enabled
- Buffer size: 4k x 8 buffers

## 🛡️ Security Features

### Network Isolation
- All services in isolated Docker network
- Only Nginx exposed to internet (port 80)
- Database ports accessible only internally

### Access Control
- Redis password authentication
- PostgreSQL user authentication
- API key authentication for service access

### Resource Limits
- Memory and CPU limits prevent resource exhaustion
- Health checks ensure service availability

## 🔧 Customization

### For Your Project

1. **Update Image Path**: Replace `YOUR_PATH_TO_IMAGE` in docker-compose-vps.yml
2. **Service Names**: Update container and service names as needed
3. **API Routes**: Modify nginx.conf proxy paths
4. **Environment Variables**: Adjust environment configuration
5. **Resource Limits**: Tune based on your VPS size

### Database Configuration

PostgreSQL includes pgvector extension for AI/ML workloads:
```yaml
image: pgvector/pgvector:0.8.0-pg17-trixie
```

Redis optimized for caching with LRU eviction:
```bash
--maxmemory 256mb --maxmemory-policy allkeys-lru
```

## 📝 Environment Variables

### API Service Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | API server port | 3000 |
| `API_KEY` | Production API key | Required |
| `CORS_ORIGIN` | Allowed CORS origins | localhost:3000 |
| `LOG_LEVEL` | Logging level | info |

### Database Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_USER` | Database username | postgres |
| `POSTGRES_PASSWORD` | Database password | Required |
| `POSTGRES_DB` | Database name | my_super_service_db |
| `REDIS_PASSWORD` | Redis password | Required |

## 🚨 Troubleshooting

### Common Issues

1. **Service Health Check Failures**
   ```bash
   docker compose logs [service-name]
   docker compose ps
   ```

2. **Volume Permission Issues**
   ```bash
   sudo chown -R 999:999 /mnt/data/postgres
   sudo chown -R 999:999 /mnt/data/redis
   ```

3. **Network Connectivity**
   ```bash
   docker network ls
   docker network inspect [network-name]
   ```

4. **Resource Constraints**
   ```bash
   docker stats
   free -h
   df -h
   ```

### Service Logs

```bash
# View all logs
docker compose logs

# Follow specific service
docker compose logs -f my-super-service

# View with timestamps
docker compose logs -t
```

## 📊 Monitoring

### Health Endpoints

- **API**: `http://your-vps/my-super-service/api/health`
- **Nginx**: Built-in health checks via Docker
- **Database**: Internal health checks

### Performance Monitoring

```bash
# Container resource usage
docker stats

# Service status
docker compose ps

# Network usage
docker network inspect my-super-service-network
```

## 🔄 Updates and Maintenance

### Updating Services

```bash
# Pull latest images
docker compose pull

# Restart with new images
docker compose up -d

# Remove old images
docker image prune -f
```

### Backup Strategy

```bash
# Database backup
docker exec my-super-service-postgres pg_dump -U postgres my_super_service_db > backup.sql

# Redis backup (AOF/RDB files in /mnt/data/redis)
cp /mnt/data/redis/appendonly.aof backup/
```

## ⚠️ Important Notes

- **Resource Monitoring**: Keep an eye on memory usage, especially PostgreSQL
- **Security Updates**: Regularly update base images
- **SSL/TLS**: Consider adding HTTPS termination to Nginx
- **Backup Strategy**: Implement regular database backups
- **Log Rotation**: Configure log rotation for long-running services
- **Monitoring**: Consider adding monitoring tools (Prometheus, Grafana)

## 📚 Related Documentation

- [VPS Setup Guide](../setup-ubuntu/readme.md)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
