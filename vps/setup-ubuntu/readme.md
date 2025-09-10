# Ubuntu VPS Server Setup

This directory contains Ansible playbooks and GitHub Actions workflows for setting up Ubuntu VPS servers with Docker and security best practices.

## Files

- **ansible-playbook.yml**: Main Ansible playbook for VPS setup
- **setup-vps-ansible.yml**: GitHub Actions workflow (located in `.github/workflows/`)
- **create-sudo-user.sh**: Script to create a sudo user
- **create-ssh-keys.sh**: Script to generate SSH keys

## Complete Setup Process

Follow these steps to set up a new Ubuntu VPS server from scratch:

### Step 1: Initial Login as Root

1. **Login to your VPS as root** using the credentials provided by your hosting provider:
   ```bash
   ssh root@your-vps-ip
   ```

### Step 2: Create Sudo User

2. **Create a non-root sudo user** for security best practices:
   ```bash
   # Run the create-sudo-user script or manually:
   adduser admin
   usermod -aG sudo admin
   
   # Test sudo access
   su - admin
   sudo whoami  # Should return 'root'
   ```

### Step 3: Login with New User

3. **Login with your new sudo user**:
   ```bash
   # Exit root session and login as admin user
   exit
   ssh admin@your-vps-ip
   ```

### Step 4: Create SSH Keys

4. **Generate SSH keys** for secure authentication:
   ```bash
   # On your local machine, generate SSH key pair
   ssh-keygen -t rsa -b 4096 -f ~/.ssh/vps_deploy_key -C "your-email@example.com"
   
   # Copy public key to VPS
   ssh-copy-id -i ~/.ssh/vps_deploy_key.pub admin@your-vps-ip
   
   # Test key-based authentication
   ssh -i ~/.ssh/vps_deploy_key admin@your-vps-ip
   ```

### Step 5: Setup GitHub Actions

5. **Copy files to your project repository**:
   - Copy `setup-vps-ansible.yml` to `.github/workflows/` directory in your project
   - Copy `ansible-playbook.yml` to your project root directory

6. **Add SSH private key to GitHub Secrets**:
   - Go to your repository → Settings → Secrets and variables → Actions
   - Add new secret named `VPS_SSH_PRIVATE_KEY`
   - Copy the content of your private key (`~/.ssh/vps_deploy_key`) as the value

7. **Run the GitHub Action**:
   - Go to Actions tab in your repository
   - Select "Setup Ubuntu VPS with Ansible" workflow
   - Click "Run workflow" and provide:
     - **VPS Host**: Your VPS IP address
     - **SSH Admin IPs**: Your admin IP addresses (comma-separated)
     - **SSH User**: `admin` (or your created username)

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

## Alternative Usage (Direct Ansible)

If you prefer to run Ansible directly instead of using GitHub Actions:

### Prerequisites

1. **SSH Access**: You need SSH key access to your VPS
2. **Ansible installed**: `pip install ansible`

### Running Ansible Directly

```bash
# Create inventory file
cat > inventory.ini << EOF
[vps]
YOUR_VPS_IP ansible_user=admin ansible_ssh_private_key_file=~/.ssh/vps_deploy_key
EOF

# Set environment variable
export SSH_ADMIN_IPS="203.0.113.0/24,198.51.100.42"

# Run playbook
ansible-playbook -i inventory.ini ansible-playbook.yml
```

## Important Security Notes

⚠️ **Critical Security Steps:**

1. **Never skip the sudo user creation** - Always create a non-root user before running the playbook
2. **Use strong passwords** for the sudo user account
3. **Generate unique SSH keys** for each VPS deployment
4. **Restrict SSH admin IPs** to your actual admin networks only
5. **Test SSH key authentication** before disabling password auth
6. **Keep your SSH private keys secure** and never commit them to version control

## Troubleshooting

### Common Issues

- **SSH Connection Failed**: Verify your VPS IP, username, and SSH key path
- **Permission Denied**: Ensure your user has sudo privileges and SSH key is properly configured
- **GitHub Action Fails**: Check that `VPS_SSH_PRIVATE_KEY` secret contains the complete private key content
- **Firewall Blocks Connection**: Make sure your IP is included in `SSH_ADMIN_IPS`

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
