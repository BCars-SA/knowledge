# Ubuntu VPS Server Setup

This directory contains Ansible playbooks and GitHub Actions workflows for setting up Ubuntu VPS servers with Docker and security best practices.

## 🗂️ Files

- **ansible-playbook.yml**: Main Ansible playbook for VPS setup
- **setup-vps-ansible.yml**: GitHub Actions workflow (located in `.github/workflows/`)
- **create-sudo-user.sh**: Script to create a sudo user
- **create-ssh-keys.sh**: Script to generate SSH keys

## ⚡ Setup Steps

Follow these steps to set up a new Ubuntu VPS server:

### Step 1️⃣: 🧑‍💻 Login as Root
```bash
ssh root@your-vps-ip
```

### Step 2️⃣: ➕ Create Sudo User
Run the provided script:
```bash
curl -o create-sudo-user.sh https://raw.githubusercontent.com/BCars-SA/knowledge/main/vps/setup-ubuntu/create-sudo-user.sh
```
And then run the script (you will be prompt for a user name, default is **admin**"**):
```
bash ./create-sudo-user.sh
```
OR
```bash
bash ./create-sudo-user.sh myadminuser
```
This creates a new user in sudoers group and provides credentials.
Copy the new user's password.

### Step 3️⃣: 🔄 Logout and Login with New User
```bash
logout
```
```bash
ssh admin@your-vps-ip
```
Use the user name (replace **admin** if other used) and the password copied from **Step 2**.

### Step 4️⃣: 🔑 Create SSH Keys (under the new user)
Run the provided script (normally downloaded automatically in the **Step 2**):
```bash
bash ./create-ssh-keys.sh
```
or download it manually before
```
curl -o create-ssh-keys.sh https://raw.githubusercontent.com/BCars-SA/knowledge/main/vps/setup-ubuntu/create-ssh-keys.sh
```
This generates SSH keys for GitHub Actions.

### Step 5️⃣: 🐙 Setup GitHub Actions
1. Copy `setup-vps-ansible.yml` to `.github/workflows/` in your new project.
2. Copy `ansible-playbook.yml` to your new project root.
3. Add the private key copied from **Step 4** to GitHub Secrets as `VPS_SSH_PRIVATE_KEY` actions secret.
4. Run the GitHub Action with your VPS details (IP, SSH authorized IPs, user from **Step 2**).

## 🚀 Features

### 🛡️ Security
- UFW firewall with restrictive rules:
   - IPv6 disabled
   - Conditional SSH access (login/password from whitelisted IPs, otherwise SSH key only)
   - HTTP(S) access from whitelisted IPs (for your Nginx Gateway Server f.e.)
- SSH hardening with conditional password authentication
- SSH custom port
- Fail2ban for SSH brute force protection
- Automatic security updates
- Non-root user setup

### 🐳 Docker Setup
- Docker CE and Docker Compose installation
- User added to docker group
- Docker logging configuration
- Additional volume mounting (/dev/sdb to /mnt/data) for persistent storage

### 🏗️ System Hardening
- Essential security packages
- UTC Timezone configuration
- Log rotation setup
- Data directory creation (/opt/docker-data)
- Additional volume setup (/mnt/data) for container persistent storage

### ☁️ Cloud/telemetry services removed/disabled

The following background or telemetry-related services are removed or disabled by the playbook:

- `cloud-init` (cloud VM initialization)
- `snapd` (Snap package manager)
- `popularity-contest` (package usage reporting)
- `canonical-livepatch` (kernel patching telemetry)
- `apport` (crash reporting)
- `whoopsie` (crash report submission)
- `motd-news` (login news/messages)
- Ubuntu Pro/Advantage APT news (cloud notifications)

## ⚙️ GitHub Action Parameters

When running the workflow, provide:
- **VPS Host**: Your server IP address.
- **New SSH Port**: Your new SSH port, default is 22, but it's better to use a custom one.
- **Current SSH Port**: Current VPS SSH port (normally 22).
- **HTTP IPs**: Comma-separated IPs for authorized HTTP(S) access (80-85 and 443 port).
- **SSH Admin IPs**: Comma-separated admin IPs (e.g., `203.0.113.42,198.51.100.0/24`).
- **SSH User**: `admin` (from create-sudo-user.sh script).

## 🔑 SSH Access Configuration

The playbook configures **conditional SSH authentication**:

- **From Admin IPs**: Both password and key authentication allowed
- **From Other IPs**: Only SSH key authentication allowed
- **Password authentication** is restricted to specified admin IPs only

## 🌐 Environment Variables

- `ALLOWED_SSH_ADMIN_IPS`: Comma-separated list of IP addresses/CIDR blocks for SSH password access
- `SSH_PORT`: Custom SSH port if you want to change the default 22
- `ALLOWED_HTTP_IPS`: Comma-separated list of IP addresses/CIDR blocks for authorized IPs for HTTP(S) incoming traffic

## 🔒 Security Notes

- Always use specific IP ranges instead of allowing global access (for SSH and HTTP(S))
- Keep your SSH private keys secure
- Use different from default SSH port 22 for "security through obscurity"
- Regularly update the allowed IP list
- Monitor fail2ban logs for suspicious activity

## Idempotent Behavior of the Playbook
You can run `setup-vps-ansible` GitHub Action multiple times in order to change SSH and UFW settings for example:
- It resets UFW to the defaults on every run and applies the rules again
- It removes conditional SSH config and creates it again
- Other steps are idempotent also

## ✅ Post-Setup

After running the playbook:

1. **Verify firewall**: `sudo ufw status`
2. **Check Docker**: `docker --version && docker compose version`  
3. **Test SSH**: Try connecting from allowed/blocked IPs
4. **Review logs**: Check `/var/log/fail2ban.log` and `/var/log/auth.log`
5. **Verify volumes**: 
   - Check `/opt/docker-data` directory exists
   - If `/dev/sdb` was available: `df -h | grep /mnt/data` to verify mounting
   - Test volume permissions for Docker containers
6. **Setup VPS provider firewall**: Duplicate your VPS firewall rules on higher level: VPS provider Firewall (if available)
