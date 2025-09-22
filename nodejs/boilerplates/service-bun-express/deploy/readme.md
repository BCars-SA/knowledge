# Deployment Guide

This guide covers the complete deployment process on a VPS using Docker, nginx reverse proxy, and monitoring with Dozzle.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [VPS Initial Setup](#vps-initial-setup)
3. [GitHub Secrets Configuration](#github-secrets-configuration)
4. [Dozzle Authentication Setup](#dozzle-authentication-setup)
5. [Deployment Process](#deployment-process)
6. [Container Architecture](#container-architecture)
7. [Accessing Services](#accessing-services)
8. [Troubleshooting](#troubleshooting)
9. [Maintenance](#maintenance)

## 🚀 Prerequisites

- Ubuntu VPS (20.04 LTS or newer)
- Domain name or public IP address
- SSH access to the VPS
- GitHub repository with Actions enabled

## 🔧 VPS Initial Setup

For the complete VPS setup process, follow the detailed guide:

**👉 [VPS Ubuntu Setup Guide](https://github.com/BCars-SA/knowledge/blob/main/vps/setup-ubuntu/readme.md)**

Once you created the dedicated user and SSH keys, you can proceed: 

1. **Run the Setup Workflow**:
   - Go to GitHub Actions → "1. Setup Ubuntu VPS with Ansible"
   - Click "Run workflow"
   - Fill in the required parameters:
     - **VPS Host**: Your server IP address
     - **Current SSH Port**: 22 (for first run)
     - **New SSH Port**: Custom port (e.g., 41222)
     - **SSH Admin IPs**: Comma-separated list of IPs for admin access
     - **SSH User**: Username for SSH access from **VPS Initial Setup**

2. **Required Secrets** (for Ansible setup):
   - `VPS_SSH_PRIVATE_KEY`: Private SSH key for server access

## 🔐 GitHub Secrets Configuration

Configure the following secrets in your GitHub repository (Settings → Secrets and variables → Actions):

### Core Application Secrets

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `API_KEY` | Main API authentication key | `prod-api-key-xyz123` |
| `POSTGRES_PASSWORD` | PostgreSQL database password | `secure_postgres_password` |
| `REDIS_PASSWORD` | Redis cache password | `secure_redis_password` |
| `CORS_ORIGIN` | Allowed CORS origin | `https://yourdomain.com` |

### LLM API Keys

| Secret Name | Description |
|-------------|-------------|
| `LLM_COMMON_API_KEY` | LLM API key for common tasks (if other than Google used) |
| `GOOGLE_APPLICATION_CREDENTIALS` | Google credentials json content when using VertexAI |

### VPS Connection Secrets

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `HETZNER_HOST` | VPS IP address or hostname | `91.99.204.214` |
| `HETZNER_SSH_PORT` | Custom SSH port | `41222` |
| `HETZNER_USER` | SSH username | `admin` |
| `HETZNER_SSH_KEY` | Private SSH key for deployment | `-----BEGIN OPENSSH PRIVATE KEY-----...` |

### Dozzle Authentication

| Secret Name | Description |
|-------------|-------------|
| `DOZZLE_USERS_YML` | Complete users.yml file content (see below) |

## 🔒 Dozzle Authentication Setup

Dozzle uses file-based authentication with bcrypt-hashed passwords.

### 1. Generate Password Hashes

**You can go here, for example**
- Visit https://bcrypt-generator.com/
- Set rounds to 10
- Enter your password and copy the hash


### 2. Create users.yml Content

Create a `users.yml` file with this structure:

```yaml
users:
  admin:
    name: "Administrator"
    password: "$2a$10$N9qo8uLOickgx2ZMRZoMye1IgTwKFXRAqP9d2XRWX5Zd1cNT5Hnpm"
```

### 3. Add to GitHub Secrets

- Name: `DOZZLE_USERS_YML`
- Value: The complete YAML content above (with your own password hashes)

## 🚀 Deployment Process

### 1. Initial Deployment

After VPS setup, run the deployment workflow:

1. Go to GitHub Actions → "2. Deploy to VPS"
2. Click "Run workflow"
3. The workflow will:
   - Build and push Docker image to GitHub Container Registry
   - Create environment file from secrets
   - Deploy all containers using docker-compose
   - Wait for health checks to pass

### 2. Subsequent Deployments

For updates, simply:
- Push changes to the main branch, or
- Manually run the "Deploy to VPS" workflow

The deployment process automatically:
- Pulls latest image versions
- Removes orphaned containers
- Performs rolling updates
- Validates health checks

## 🏗️ Container Architecture

### Core Services

#### 1. My Super Service API (`my-super-service-api`)
- **Image**: `ghcr.io/company-name/image-name:latest`
- **Port**: `3000`
- **Purpose**: Main application API
- **Resources**: 1GB memory, 0.5 CPU
- **Health Check**: `/api/health` endpoint

#### 2. PostgreSQL with pgvector (`my-super-service-postgres`)
- **Image**: `pgvector/pgvector:0.8.0-pg17-trixie`
- **Port**: `5432`
- **Purpose**: Vector database for embeddings
- **Resources**: 2GB memory, 1.0 CPU
- **Volume**: `/mnt/data/postgres` (persistent storage)

#### 3. Redis Cache (`my-super-service-redis`)
- **Image**: `redis:latest`
- **Port**: `6379`
- **Purpose**: Caching layer
- **Resources**: 256MB memory
- **Volume**: `/mnt/data/redis` (persistent storage)
- **Configuration**: Password auth, AOF persistence, LRU eviction

### Monitoring & Proxy

#### 4. Dozzle Log Viewer (`my-super-service-dozzle`)
- **Image**: `amir20/dozzle:latest`
- **Port**: `8080`
- **Purpose**: Real-time Docker container logs
- **Authentication**: File-based with bcrypt passwords
- **Access**: `/my-super-service/monitor/`
- **Resources**: 64MB memory, 0.1 CPU

#### 5. Nginx Reverse Proxy (`my-super-service-nginx`)
- **Image**: `nginx:alpine`
- **Port**: `80`
- **Purpose**: Reverse proxy and load balancer
- **Configuration**: Custom nginx.conf
- **Resources**: 64MB memory, 0.1 CPU

### Network Architecture

```
Public Nginx Gateway (f.e. https://some-address.your-domain.com) → my-super-service-nginx:80 → {
  /my-super-service/api/ → my-super-service-api:3000
  /my-super-service/monitor/ → my-super-service-dozzle:8080
}
```

### Data Persistence

- **PostgreSQL**: `/mnt/data/postgres`
- **Redis**: `/mnt/data/redis` (cache data)
- **Dozzle**: `./dozzle-users.yml` (authentication file)

## 🌐 Accessing Services

### Public Endpoints

| Service | URL | Authentication |
|---------|-----|----------------|
| **My Super Service API** | `http://your-vps-ip/my-super-service/api/` | Bearer token (`API_KEY`) |
| **Health Check** | `http://your-vps-ip/my-super-service/api/health` | None |
| **Dozzle Logs** | `http://your-vps-ip/my-super-service/monitor/` | Username/password |

### API Usage Examples

**Health Check**:
```bash
curl http://your-vps-ip/my-super-service/api/health
```

**Authenticated Request**:
```bash
curl -H "Authorization: Bearer your-api-key" \
     http://your-vps-ip/my-super-service/api/search
```

### Dozzle Access

1. Navigate to `http://your-vps-ip/my-super-service/monitor/`
2. Login with credentials from your `users.yml`
3. View real-time logs from all containers

## 🔧 Troubleshooting

### Common Issues

#### 1. Container Health Check Failures

```bash
# Check container status
docker compose ps

# View container logs
docker compose logs my-super-service-api

# Check specific health
docker compose exec my-super-service-api curl http://localhost:3000/api/health
```

#### 2. nginx Configuration Issues

```bash
# Test nginx configuration
docker compose exec my-super-service-nginx nginx -t

# Reload nginx
docker compose exec my-super-service-nginx nginx -s reload
```

#### 3. Database Connection Issues

```bash
# Check PostgreSQL status
docker compose exec my-super-service-postgres pg_isready -U postgres

# Check Redis connection
docker compose exec my-super-service-redis redis-cli ping
```

#### 4. Dozzle Authentication Issues

```bash
# Verify users.yml file
docker compose exec my-super-service-dozzle cat /data/users.yml

# Check Dozzle logs
docker compose logs my-super-service-dozzle
```

### Log Access

**Real-time monitoring**:
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f my-super-service-api

# Last 100 lines
docker compose logs --tail 100 my-super-service-api
```

### Resource Monitoring

```bash
# Container resource usage
docker stats

# Disk usage
df -h /mnt/data

# Memory usage
free -h
```

## 🔄 Maintenance

### Regular Tasks

#### 1. Update Docker Images
```bash
# Pull latest images
docker compose pull

# Restart with new images
docker compose up -d
```

#### 2. Database Maintenance
```bash
# PostgreSQL vacuum
docker compose exec my-super-service-postgres psql -U postgres -d my_super_service -c "VACUUM ANALYZE;"

# Redis memory info
docker compose exec my-super-service-redis redis-cli info memory
```

#### 3. Log Rotation
- Container logs are automatically rotated by Docker via first VPS setup

#### 4. Cleanup Unused Resources
```bash
# Remove unused images
docker image prune -f

# Remove unused containers
docker container prune -f

# Remove unused volumes (be careful!)
docker volume prune -f
```

### Backup Procedures

#### Database Backup
```bash
# PostgreSQL backup
docker compose exec my-super-service-postgres pg_dump -U postgres my_super_service > backup.sql

# Redis backup (automatic via AOF)
docker compose exec my-super-service-redis redis-cli BGSAVE
```

#### Configuration Backup
- Environment files: `.env.production`
- Docker compose: `docker-compose.yml`
- Nginx config: `nginx.conf`
- Dozzle users: `dozzle-users.yml`

### Security Updates

1. **VPS System Updates**:
   - Handled automatically by daily checks

2. **Container Updates**:
   - Handled automatically by deployment workflow
   - Manual update: `docker compose pull && docker compose up -d`

### Monitoring & Alerts

- **Health Checks**: Built into docker-compose configuration
- **Log Monitoring**: Available via Dozzle web interface
- **Resource Monitoring**: Use `docker stats` and system monitoring tools
- **External Monitoring**: Configure external services to monitor endpoints

## 📞 Support

For issues and questions:
- Check the [troubleshooting section](#troubleshooting)
- Review container logs via Dozzle or CLI
- Check GitHub Actions workflow logs
- Verify all required secrets are configured

## 🔄 Updates

This deployment configuration supports:
- ✅ Zero-downtime deployments
- ✅ Automatic health checks
- ✅ Rolling updates
- ✅ Orphaned container cleanup
- ✅ Real-time log monitoring
- ✅ Secure authentication
- ✅ Resource constraints
- ✅ Data persistence
