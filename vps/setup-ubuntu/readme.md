# VPS Setup Scripts

This folder contains scripts for securely configuring a VPS with **Ubuntu** for Docker-based deployments, with a focus on automation, security, and GitHub Actions integration.

## Files

- **setup-vps.sh**: Main setup script for preparing a new VPS. Handles firewall configuration, Docker installation, volume mounting, and (optionally) SSH key generation for GitHub Actions deployments.
- **create-ssh-keys.sh**: Helper script (downloaded automatically if missing) to generate SSH keys for GitHub Actions deployment.

## Usage

### 1. Upload or download `setup-vps.sh` to your VPS

### 2. Run the script (as your regular user, not root):

```bash
chmod +x setup-vps.sh
./setup-vps.sh [SSH_IPS]
```
- `[SSH_IPS]` is a comma- or space-separated list of IP addresses or CIDR blocks allowed SSH access (e.g., `192.168.1.100,203.0.113.0/24`).
- If omitted, the script will prompt you to confirm if you want to block SSH for all IPs (not recommended unless you have console access).

### 3. Script Actions
- **Firewall (UFW) Configuration**: Sets default deny/allow rules, restricts SSH to provided IPs, and enables UFW.
- **Docker & Docker Compose Installation**: Installs Docker using the official script and adds your user to the `docker` group.
- **Volume Mounting**: Mounts `/dev/sdb` to `/mnt/data` for persistent storage and updates `/etc/fstab`.
- **GitHub Actions SSH Key Setup**: Prompts to generate SSH keys for GitHub Actions deployment. If accepted, downloads and runs `create-ssh-keys.sh` if not present.

### 4. Output
- The script echoes status and results for each step, including warnings and errors.

## Security Notes
- The script configures a strict firewall and may block SSH if not used carefully. Always provide your admin IPs or ensure you have console access.
- SSH keys for GitHub Actions are generated in the current user's home directory (not as root).

## Example
```bash
./setup-vps.sh "203.0.113.0/24,198.51.100.42"
```

---

For more details, see comments in `setup-vps.sh`.
