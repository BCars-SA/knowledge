# Setup script for VPS deployment - RUN on VPS itself
#!/bin/bash

# VPS Basic Setup Script
# 
# This script configures a VPS for secure deployment of the simple project using Docker.
# It sets up firewall rules, installs Docker, and configures system requirements.
#
# ⚠️  SECURITY WARNING: 
# This script will configure UFW firewall and may block SSH access!
# Always provide your admin IP addresses to maintain access to the server.
#

# Usage: ./setup-vps.sh [SSH_IPS]
# Example: ./setup-vps.sh "192.168.1.100,203.0.113.0/24"

set -euo pipefail

# Function to show usage
show_usage() {
    echo "Usage: $0 [SSH_IP1,SSH_IP2,...]"
    echo ""
    echo "Examples:"
    echo "  $0 192.168.1.100"
    echo "  $0 192.168.1.100,10.0.0.5"
    echo "  $0 203.0.113.0/24"
    echo ""
    echo "SSH_IPS: Comma or space-separated list of IP addresses or CIDR blocks"
    echo "         that should have SSH access to this server."
    echo ""
    exit 1
}

# Parse command line arguments
if [ $# -eq 0 ]; then
    echo "⚠️  WARNING: No admin IP addresses provided!"
    echo "⚠️  SSH access will be BLOCKED for ALL IP addresses by default."
    echo "⚠️  This may lock you out of the server!"
    echo ""
    read -p "Do you want to block SSH port 22 for all IPs? (type 'y' to block, 'n' to leave open): " block_ssh
    if [ "$block_ssh" = "y" ]; then
        SSH_IPS=""
        BLOCK_SSH_PORT=true
    else
        SSH_IPS=""
        BLOCK_SSH_PORT=false
    fi
elif [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    show_usage
else
    SSH_IPS="$1"
    BLOCK_SSH_PORT=true
fi

# Normalize separators (commas -> spaces)
SSH_IPS="${SSH_IPS//,/ }"

# Set sane defaults
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Configure SSH access
if [ -n "$SSH_IPS" ]; then
    echo "🔐 Configuring SSH access for admin IPs: $SSH_IPS"
    # Allow SSH only from each admin IP/CIDR
    for ip in $SSH_IPS; do
        # Basic validation: IPv4, IPv4/CIDR, or IPv6/CIDR-ish. Skip obviously invalid tokens.
        if [[ "$ip" =~ ^([0-9]{1,3}\.){3}[0-9]{1,3}(/([0-9]{1,2}))?$ ]] || [[ "$ip" =~ ^[0-9a-fA-F:]+(/([0-9]{1,3}))?$ ]]; then
            echo "  ✅ Allowing SSH from: $ip"
            sudo ufw allow from "$ip" to any port 22 proto tcp
        else
            echo "  ⚠️  Warning: skipping invalid IP/CIDR: $ip" >&2
        fi
    done
    # Explicitly deny SSH from all other sources
    if [ "$BLOCK_SSH_PORT" = true ]; then
        sudo ufw deny 22/tcp
    fi
else
    if [ "$BLOCK_SSH_PORT" = true ]; then
        echo "🔐 No admin IPs provided - SSH will be BLOCKED for all addresses"
        echo "⚠️  Make sure you have alternative access (console, etc.) to manage this server"
        sudo ufw deny 22/tcp
    else
        echo "🔓 SSH port 22 will remain open for all IPs (not recommended for production)"
    fi
fi

# Enable UFW non-interactively (safe for automation)
sudo ufw --force enable

# Show firewall status for verification
echo ""
echo "🔥 Firewall Configuration Summary:"
sudo ufw status verbose

echo ""
echo "📋 SSH Access Summary:"
if [ -n "$SSH_IPS" ]; then
    echo "  ✅ SSH allowed from: $SSH_IPS"
    if [ "$BLOCK_SSH_PORT" = true ]; then
        echo "  🚫 SSH blocked for all other IP addresses"
    fi
else
    if [ "$BLOCK_SSH_PORT" = true ]; then
        echo "  🚫 SSH BLOCKED for all IP addresses"
        echo "  ⚠️  Ensure you have console/alternative access to manage this server"
    else
        echo "  ⚠️  SSH port 22 is OPEN for all IPs (not recommended for production)"
    fi
fi

# Install Docker and Docker Compose
echo "\n🐳 Installing Docker and Docker Compose..."
curl -fsSL https://get.docker.com -o get-docker.sh
if sudo sh get-docker.sh; then
    echo "  ✅ Docker installed successfully."
else
    echo "  ❌ Docker installation failed!" >&2
    exit 1
fi
sudo usermod -aG docker $USER

# Mount additional volume for data persistence
echo "\n💾 Mounting additional volume for data persistence..."
sudo mkdir -p /mnt/data
if sudo mount /dev/sdb /mnt/data; then
    echo "  ✅ Volume /dev/sdb mounted to /mnt/data."
else
    echo "  ❌ Failed to mount /dev/sdb to /mnt/data!" >&2
    exit 1
fi
echo '/dev/sdb /mnt/data ext4 defaults 0 2' | sudo tee -a /etc/fstab > /dev/null

# Create SSH keys for GitHub Actions deployment
echo "\n🔑 GitHub Actions SSH Key Setup:"
read -p "Do you want to create SSH keys for GitHub Actions deployment? (y/n): " create_gha_keys
if [ "$create_gha_keys" = "y" ]; then
    if [ ! -f ./create-ssh-keys.sh ]; then
        echo "  ⬇️  Downloading create-ssh-keys.sh from repository..."
        curl -fsSL https://raw.githubusercontent.com/BCars-SA/knowledge/main/vps/setup-ubuntu/create-ssh-keys.sh -o create-ssh-keys.sh
        chmod +x create-ssh-keys.sh
    fi
    echo "  🔐 Running create-ssh-keys.sh..."
    ./create-ssh-keys.sh
    if [ $? -eq 0 ]; then
        echo "  ✅ SSH keys created for GitHub Actions deployment."
    else
        echo "  ❌ Failed to create SSH keys!" >&2
        exit 1
    fi
else
    echo "  🚫 Skipping SSH key creation for GitHub Actions."
fi