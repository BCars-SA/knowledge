# Ansible VPS Setup

This directory contains Ansible playbooks and GitHub Actions workflows for setting up Ubuntu VPS servers with Docker and security best practices.

## Files

- **ansible-playbook.yml**: Main Ansible playbook for VPS setup
- **setup-vps-ansible.yml**: GitHub Actions workflow (located in `.github/workflows/`)

## Features

### Security
- UFW firewall with restrictive rules
- SSH hardening with conditional password authentication
- Fail2ban for SSH brute force protection
- Automatic security updates
- Non-root user setup

### Docker Setup
- Docker CE and Docker Compose installation
- User added to docker group
- Docker logging configuration
- Additional volume mounting (/dev/sdb to /mnt/data) for persistent storage

### System Hardening
- Essential security packages
- Timezone configuration
- Log rotation setup
- Data directory creation (/opt/docker-data)
- Additional volume setup (/mnt/data) for container persistent storage

## Usage

### Prerequisites

1. **SSH Access**: You need SSH key access to your VPS
2. **GitHub Secrets**: Add `VPS_SSH_PRIVATE_KEY` to your repository secrets

### Running via GitHub Actions

1. Go to **Actions** tab in your GitHub repository
2. Select **Deploy VPS Setup with Ansible** workflow
3. Click **Run workflow** and provide:
   - **VPS Host**: IP address or hostname of your server
   - **SSH Admin IPs**: Comma-separated list (e.g., `203.0.113.0/24,198.51.100.42`)
   - **SSH User**: Username for SSH connection (default: `ubuntu`)

### Running Locally

```bash
# Install Ansible
pip install ansible

# Create inventory file
cat > inventory.ini << EOF
[vps]
YOUR_VPS_IP ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/your_key
EOF

# Set environment variable
export SSH_ADMIN_IPS="203.0.113.0/24,198.51.100.42"

# Run playbook
ansible-playbook -i inventory.ini ansible-playbook.yml
```

## SSH Access Configuration

The playbook configures **conditional SSH authentication**:

- **From Admin IPs**: Both password and key authentication allowed
- **From Other IPs**: Only SSH key authentication allowed
- **Password authentication** is restricted to specified admin IPs only

## Environment Variables

- `SSH_ADMIN_IPS`: Comma-separated list of IP addresses/CIDR blocks for SSH password access

## Security Notes

- Always use specific IP ranges instead of allowing global access
- Keep your SSH private keys secure
- Regularly update the allowed IP list
- Monitor fail2ban logs for suspicious activity

## Post-Setup

After running the playbook:

1. **Verify firewall**: `sudo ufw status`
2. **Check Docker**: `docker --version && docker compose version`  
3. **Test SSH**: Try connecting from allowed/blocked IPs
4. **Review logs**: Check `/var/log/fail2ban.log` and `/var/log/auth.log`
5. **Verify volumes**: 
   - Check `/opt/docker-data` directory exists
   - If `/dev/sdb` was available: `df -h | grep /mnt/data` to verify mounting
   - Test volume permissions for Docker containers
