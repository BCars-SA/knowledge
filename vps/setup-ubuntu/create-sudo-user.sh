#!/bin/bash
#
# Creates a new user with passwordless sudo privileges for automation.
#
# Usage:
#   sudo ./create_admin_user.sh [username]
#
# If no username is provided, it defaults to 'admin'.

# --- Configuration ---
DEFAULT_USERNAME="admin"

# --- Script Logic ---

# 1. Check if running as root
if [ "$(id -u)" -ne 0 ]; then
  echo "❌ This script must be run as root. Please use sudo." >&2
  exit 1
fi

# 2. Determine the username
if [ -z "$1" ]; then
  echo "👤 Enter username for the new sudo user (default: $DEFAULT_USERNAME):"
  read -p "Username: " INPUT_USERNAME
  USERNAME="${INPUT_USERNAME:-$DEFAULT_USERNAME}"
else
  USERNAME="$1"
fi

# 3. Check if the user already exists
if id "$USERNAME" &>/dev/null; then
  echo "⚠️ User '$USERNAME' already exists. Exiting."
  exit 0
fi

# 4. Generate a strong random password
# We use /dev/urandom for cryptographically secure randomness.
PASSWORD=$(tr -dc 'A-Za-z0-9!?*#+&' < /dev/urandom | head -c 24)

# 5. Create the user
echo "✨ Creating user '$USERNAME'..."
useradd -m -s /bin/bash "$USERNAME"

# 6. Set the new password for the user
echo "$USERNAME:$PASSWORD" | chpasswd
echo "✓ User account created and password set."

# 7. Grant passwordless sudo privileges
# The best practice is to add a file to /etc/sudoers.d/
echo "🛡️ Granting passwordless sudo privileges..."
SUDOERS_FILE="/etc/sudoers.d/90-$USERNAME"
echo "$USERNAME ALL=(ALL) NOPASSWD: ALL" > "$SUDOERS_FILE"
chmod 0440 "$SUDOERS_FILE"
echo "✓ Sudo privileges configured."

SERVER_IP=$(hostname -I | awk '{print $1}')

# 8. Display the credentials
echo ""
echo "✅ All done!"
echo "============================================================"
echo " User credentials for '$USERNAME':"
echo ""
echo "   Username: $USERNAME"
echo "   Password: $PASSWORD"
echo ""
echo "👉 Please copy the password and store it in a secure place."
echo ""
echo "📋 Next Steps:"
echo "1. Login with: ssh $USERNAME@$SERVER_IP"
echo "2. Use the password provided by the setup script"
echo "3. Run the SSH key setup script:"
echo "   curl -o create-ssh-keys.sh https://raw.githubusercontent.com/BCars-SA/knowledge/refs/heads/main/vps/setup-ubuntu/create-ssh-keys.sh"
echo "   chmod +x create-ssh-keys.sh"
echo "   ./create-ssh-keys.sh"
echo "============================================================"

USER_HOME="/home/$USERNAME"

# 9. Additional step
# Ask if user wants to download the SSH keys script
echo ""
echo "📥 Download SSH Keys Setup Script to the new user's home directory?"
echo "This will allow you to run it immediately after login to set up SSH keys."
read -p "Download create-ssh-keys.sh script? (Y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$|^$ ]]; then
    echo -e "Downloading create-ssh-keys.sh script..."
    
    # URL to your create-ssh-keys.sh script (adjust this URL to your repository)
    SCRIPT_URL="https://raw.githubusercontent.com/BCars-SA/knowledge/main/vps/setup-ubuntu/create-ssh-keys.sh"
    SCRIPT_PATH="$USER_HOME/create-ssh-keys.sh"
    
    # Download the script
    if curl -s -L -o "$SCRIPT_PATH" "$SCRIPT_URL"; then
        # Set ownership and permissions
        chown "$USERNAME:$USERNAME" "$SCRIPT_PATH"
        chmod +x "$SCRIPT_PATH"
        echo "✅ SSH keys script downloaded to: $SCRIPT_PATH"
        echo "   You can run it after login with: ./create-ssh-keys.sh"        
    else
        echo "❌ Failed to download SSH keys script"
        echo "   You can manually download it later with:"
        echo "   curl -o create-ssh-keys.sh $SCRIPT_URL"
        echo "   chmod +x create-ssh-keys.sh"
    fi
else
    echo "⏭️  Skipping script download"
fi

echo "============================================================"
echo "👉 Please copy the username and password and store them in a secure place."
echo "   Username: $USERNAME"
echo "   Password: $PASSWORD"
echo ""
