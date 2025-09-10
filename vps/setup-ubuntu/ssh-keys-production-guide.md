# SSH Key Setup for Production Servers

This guide explains how to set up SSH keys for production servers, contrasting the automated Docker test environment with real-world scenarios.

## Docker Test Environment vs Production

### In Your Docker Test Environment (`docker-compose.yml`)
```yaml
# Keys are generated automatically on container startup
command:
  - sh
  - -c
  - |
    mkdir -p /root/.ssh &&
    ssh-keygen -t rsa -b 2048 -f /root/.ssh/id_rsa -N '' &&
    chmod 600 /root/.ssh/id_rsa &&
    chmod 644 /root/.ssh/id_rsa.pub &&
    cp /root/.ssh/id_rsa.pub /shared/authorized_keys &&
    sleep infinity
```

**Pros of Docker approach:**
- Fully automated for testing
- No manual intervention needed
- Keys are ephemeral (destroyed with container)

**Cons for production:**
- Security risk (keys generated in container)
- No key persistence
- Not suitable for real servers

## Production SSH Key Setup Options

### Option 1: Pre-generate Keys on Your Local Machine (Recommended)

#### Step 1: Generate SSH Key Pair Locally
```bash
# On your local development machine
ssh-keygen -t ed25519 -C "production-server-$(date +%Y-%m-%d)" -f ~/.ssh/production_server_key

# Or if ed25519 isn't supported, use RSA
ssh-keygen -t rsa -b 4096 -C "production-server-$(date +%Y-%m-%d)" -f ~/.ssh/production_server_key
```

#### Step 2: Copy Public Key to Server
```bash
# Method 1: Using ssh-copy-id (if password auth is enabled)
ssh-copy-id -i ~/.ssh/production_server_key.pub user@your-server-ip

# Method 2: Manual copy via SCP
scp ~/.ssh/production_server_key.pub user@your-server-ip:~/temp_key.pub

# Method 3: Manual entry (copy public key content)
cat ~/.ssh/production_server_key.pub
# Then paste into server's ~/.ssh/authorized_keys
```

#### Step 3: Set Up Authorized Keys on Server
```bash
# On the server
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# If you used scp method
cat ~/temp_key.pub >> ~/.ssh/authorized_keys
rm ~/temp_key.pub

# Set correct permissions
chmod 600 ~/.ssh/authorized_keys
```

### Option 2: Use Your Existing Script for Production

Your `create-ssh-keys.sh` script can be adapted for production:

#### Modified Production Version
```bash
#!/bin/bash

# Production SSH Key Setup Script
# Run this ON THE PRODUCTION SERVER

KEY_PATH="$HOME/.ssh/production_deploy_key"
AUTHORIZED_KEYS_PATH="$HOME/.ssh/authorized_keys"
KEY_COMMENT="production-deploy-$(date +%Y-%m-%d)"

echo "🔐 Setting up SSH keys for production server..."

# Ensure .ssh directory exists
mkdir -p "$HOME/.ssh"
chmod 700 "$HOME/.ssh"

# Generate key pair
ssh-keygen -t ed25519 -C "$KEY_COMMENT" -N "" -f "$KEY_PATH" <<< y >/dev/null 2>&1

# Add public key to authorized_keys
cat "${KEY_PATH}.pub" >> "$AUTHORIZED_KEYS_PATH"

# Set permissions
chmod 600 "$AUTHORIZED_KEYS_PATH"
chmod 600 "$KEY_PATH"
chmod 644 "${KEY_PATH}.pub"

echo "✅ Keys generated and configured!"
echo "🔑 Private key (keep secure):"
echo "----------------------------------------"
cat "$KEY_PATH"
echo "----------------------------------------"
echo ""
echo "🔓 Public key (can share):"
echo "----------------------------------------"
cat "${KEY_PATH}.pub"
echo "----------------------------------------"

# Secure cleanup
echo ""
echo "⚠️  SECURITY: The private key above should be:"
echo "   1. Copied to your local machine securely"
echo "   2. Added to GitHub secrets (SSH_PRIVATE_KEY)"
echo "   3. Removed from this server's bash history"
echo ""
echo "Run: history -c && history -w"
```

### Option 3: Cloud Provider Key Management

#### AWS EC2
```bash
# Use AWS key pairs
aws ec2 create-key-pair --key-name production-server-key --query 'KeyMaterial' --output text > production-server-key.pem
chmod 400 production-server-key.pem
```

#### DigitalOcean
```bash
# Add SSH key via CLI
doctl compute ssh-key create production-key --public-key-file ~/.ssh/production_server_key.pub
```

#### Hetzner Cloud
```bash
# Add key via CLI
hcloud ssh-key create --name production-server --public-key-from-file ~/.ssh/production_server_key.pub
```

## GitHub Actions Integration for Production

### Repository Secrets Setup

1. **SSH_PRIVATE_KEY**: Your private key content
2. **SSH_HOST**: Server IP/hostname  
3. **SSH_USER**: Username (e.g., `ubuntu`, `root`)
4. **SSH_PORT**: SSH port (default: 22)

### Example GitHub Actions Workflow
```yaml
name: Deploy to Production

on:
  workflow_dispatch:
    inputs:
      target_server:
        description: 'Target server IP'
        required: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup SSH
      run: |
        mkdir -p ~/.ssh
        echo "${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/id_rsa
        chmod 600 ~/.ssh/id_rsa
        ssh-keyscan -H ${{ github.event.inputs.target_server }} >> ~/.ssh/known_hosts
    
    - name: Run Ansible Playbook
      run: |
        ansible-playbook -i '${{ github.event.inputs.target_server }},' \
          -u ${{ secrets.SSH_USER }} \
          --private-key ~/.ssh/id_rsa \
          ansible-playbook.yml
      env:
        SSH_ADMIN_IPS: ${{ secrets.SSH_ADMIN_IPS }}
```

## Security Best Practices

### 1. Key Generation
```bash
# Use Ed25519 (preferred) or RSA 4096-bit minimum
ssh-keygen -t ed25519 -a 100  # More rounds for better security
ssh-keygen -t rsa -b 4096     # If Ed25519 not supported
```

### 2. Key Management
- **Rotate keys regularly** (every 90-180 days)
- **Use different keys** for different servers/environments
- **Secure private key storage** (encrypted disk, key managers)
- **Remove unused keys** from authorized_keys

### 3. Server Configuration
Your Ansible playbook already implements these:

```yaml
# SSH hardening in your playbook
PermitRootLogin no
PasswordAuthentication yes  # Only from admin IPs
PubkeyAuthentication yes
AuthenticationMethods publickey,password
MaxAuthTries 3
```

### 4. Monitoring and Auditing
```bash
# Monitor SSH access
sudo tail -f /var/log/auth.log

# Check current authorized keys
cat ~/.ssh/authorized_keys

# List active SSH sessions
who
w
```

## Production Deployment Workflow

### Initial Server Setup
1. **Cloud Provider**: Create server with initial SSH key
2. **Manual Setup**: Use password auth initially, then add keys
3. **Ansible Bootstrap**: Use your playbook to harden security

### Ongoing Management
```bash
# Add new team member's key
echo "ssh-ed25519 AAAAC3... user@hostname" >> ~/.ssh/authorized_keys

# Remove user's key (remove specific line)
sed -i '/user@hostname/d' ~/.ssh/authorized_keys

# Rotate deployment keys (update GitHub secrets)
# 1. Generate new key
# 2. Add to server
# 3. Update GitHub secrets
# 4. Remove old key
```

## Comparison Summary

| Aspect | Docker Test | Production |
|--------|-------------|------------|
| **Key Generation** | Container startup | Pre-generated locally |
| **Key Storage** | Ephemeral volumes | Secure local storage |
| **Key Distribution** | Automatic sharing | Manual/scripted setup |
| **Security** | Test-only security | Production hardening |
| **Persistence** | Lost on container restart | Permanent |
| **Rotation** | New keys per container | Scheduled rotation |
| **Monitoring** | Not needed | Essential |

## Troubleshooting SSH Issues

```bash
# Test SSH connection with verbose output
ssh -v -i ~/.ssh/production_server_key user@server-ip

# Check SSH server configuration
sudo sshd -T

# Verify key permissions
ls -la ~/.ssh/

# Check server logs
sudo journalctl -u sshd -f
```

The key difference is that production requires **persistent, secure key management** while your Docker test environment prioritizes **automation and disposability**.
