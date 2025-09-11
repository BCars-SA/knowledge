# Ubuntu VPS Server Setup

This directory contains Ansible playbooks and GitHub Actions workflows for setting up Ubuntu VPS servers with Docker and security best practices.

## Files

- **ansible-playbook.yml**: Main Ansible playbook for VPS setup
- **setup-vps-ansible.yml**: GitHub Actions workflow (located in `.github/workflows/`)
- **create-sudo-user.sh**: Script to create a sudo user
- **create-ssh-keys.sh**: Script to generate SSH keys

## Setup Steps

Follow these steps to set up a new Ubuntu VPS server:

### Step 1: Login as Root
```bash
ssh root@your-vps-ip
```

### Step 2: Create Sudo User
Run the provided script:
```bash
curl -o create-sudo-user https://raw.githubusercontent.com/BCars-SA/knowledge/main/vps/setup-ubuntu/create-sudo-user.sh
./create-sudo-user.sh
```
This creates a new user in sudoers group and provides credentials.
You will be prompt for a user name.
But you can also run it like this:
```bash
./create-sudo-user.sh myadminuser
```

### Step 3: Login with New User
```bash
ssh admin@your-vps-ip
```
Use the password from Step 2.

### Step 4: Create SSH Keys
Run the provided script (normally download automatically in the Step 2):
```bash
# Run curl if the script was not downloaded automatically before:
#curl -o create-sudo-user https://raw.githubusercontent.com/BCars-SA/knowledge/main/vps/setup-ubuntu/create-ssh-keys.sh
./create-ssh-keys.sh
```
This generates SSH keys for GitHub Actions.

### Step 5: Setup GitHub Actions
1. Copy `setup-vps-ansible.yml` to `.github/workflows/` in your project
2. Copy `ansible-playbook.yml` to your project root
3. Add the private key (from Step 4) to GitHub Secrets as `VPS_SSH_PRIVATE_KEY`
4. Run the GitHub Action with your VPS details

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

## GitHub Action Parameters

When running the workflow, provide:
- **VPS Host**: Your server IP address
- **SSH Admin IPs**: Comma-separated admin IPs (e.g., `203.0.113.42,198.51.100.0/24`)
- **SSH User**: `admin` (from create-sudo-user.sh script)

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
