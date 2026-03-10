# Dozzle Monitoring Guide

This guide shows a generic setup for monitoring Docker container logs on a VPS with:

- Dozzle web UI for real-time logs
- VPS authentication logs (`/var/log/auth.log`) tailed in a container
- VPS system logs (`/var/log/syslog`) tailed in a container

## Overview

Dozzle provides a lightweight log viewer for Docker. By adding small sidecar containers that tail host log files, you can inspect app logs and key VPS logs in one place.

## 1. Docker Compose Services

Add these services to your `docker-compose-vps.yml`.

```yaml
services:
  # Dozzle for Docker logs viewing
  dozzle:
    image: amir20/dozzle:latest
    container_name: my-super-service-dozzle
    restart: unless-stopped
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./dozzle-users.yml:/data/users.yml:ro
    environment:
      # Keep this path aligned with your Nginx location block.
      DOZZLE_BASE: /my-super-service/monitor
      DOZZLE_NO_ANALYTICS: "true"
      DOZZLE_ENABLE_ACTIONS: "false"
      DOZZLE_AUTH_PROVIDER: simple
    healthcheck:
      test: ["CMD", "/dozzle", "healthcheck"]
      interval: 1m
      timeout: 30s
      retries: 3
      start_period: 30s
    networks:
      - my-super-service-network
    deploy:
      resources:
        limits:
          memory: 64M
          cpus: "0.1"
        reservations:
          memory: 32M
          cpus: "0.05"

  # Container to tail VPS auth logs
  vps-auth-logs:
    image: alpine:latest
    container_name: my-super-service-vps-auth-logs
    restart: unless-stopped
    volumes:
      - /var/log/auth.log:/var/log/auth.log:ro
    command: ["sh", "-c", "tail -F /var/log/auth.log"]
    networks:
      - my-super-service-network

  # Container to tail VPS syslogs
  vps-sys-logs:
    image: alpine:latest
    container_name: my-super-service-vps-sys-logs
    restart: unless-stopped
    volumes:
      - /var/log/syslog:/var/log/syslog:ro
    command: ["sh", "-c", "tail -F /var/log/syslog"]
    networks:
      - my-super-service-network
```

Notes:
- Use `tail -F` to survive log rotation.
- Mounting `/var/run/docker.sock` is powerful; keep Dozzle private and authenticated.

## 2. Nginx Reverse Proxy

Add an upstream and location block to your `nginx.conf`.

```nginx
upstream dozzle {
    server my-super-service-dozzle:8080;
}

server {
    listen 80;
    server_name _;

    # Dozzle Docker logs viewer - map /my-super-service/monitor to Dozzle
    location /my-super-service/monitor/ {
        proxy_pass http://dozzle;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support for Dozzle real-time logs
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # Disable buffering for real-time log streaming
        proxy_buffering off;
        proxy_cache off;
    }
}
```

Access URL example:

- `http://your-vps-ip/my-super-service/monitor`

## 3. Dozzle Authentication

Dozzle supports simple file-based auth with bcrypt password hashes.

### 3.1 Generate bcrypt hashes

One option is to use an online bcrypt generator and set rounds to 10.

### 3.2 Create `dozzle-users.yml`

```yaml
users:
  admin:
    name: "Administrator"
    password: "$2a$10$N9qo8uLOickgx2ZMRZoMye1IgTwKFXRAqP9d2XRWX5Zd1cNT5Hnpm"
```

Replace the sample hash with your own generated hash.

### 3.3 Keep credentials out of git

Recommended options:

- Store `dozzle-users.yml` directly on the VPS and never commit it.
- Or store full file content in CI/CD secrets and write it during deployment.

If using secrets, a common name is:

- `DOZZLE_USERS_YML`: full YAML content for `dozzle-users.yml`

## 4. Log Access in Dozzle

After deployment, open Dozzle and inspect:

- Application containers (API, nginx, redis, postgres)
- `my-super-service-vps-auth-logs` for SSH/authentication events
- `my-super-service-vps-sys-logs` for system-level events

## 5. Security Recommendations

- Restrict Dozzle route access by IP allowlist or basic auth in Nginx.
- Keep Dozzle behind a private network or VPN where possible.
- Disable unused Dozzle features (`DOZZLE_ENABLE_ACTIONS=false`).
- Monitor failed login attempts in auth logs.
