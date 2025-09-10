#!/bin/bash

# This script generates a dedicated SSH key pair for GitHub Actions deployment.
# It creates the keys, adds the public key to the authorized_keys file,
# sets the correct permissions, and then displays the keys for you.

# --- Configuration ---
KEY_PATH="$HOME/.ssh/github_action_deploy_key"
AUTHORIZED_KEYS_PATH="$HOME/.ssh/authorized_keys"
KEY_COMMENT="github-action-$(date +%Y-%m-%d)"

# --- Color Codes for Output ---
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting SSH key setup for GitHub Actions...${NC}"

# --- Step 1: Ensure the .ssh directory exists and has correct permissions ---
mkdir -p "$HOME/.ssh"
chmod 700 "$HOME/.ssh"
echo "✅ Ensured ~/.ssh directory exists with correct permissions."

# --- Step 2: Generate the SSH key pair without a passphrase ---
# The -N "" flag creates a key with no passphrase, which is necessary for automation.
# The -f flag specifies the file path, preventing any interactive prompts.
ssh-keygen -t ed25519 -C "$KEY_COMMENT" -N "" -f "$KEY_PATH" <<< y >/dev/null 2>&1
echo "✅ Generated new ED25519 SSH key pair at $KEY_PATH."

# --- Step 3: Add the new public key to authorized_keys ---
# This allows the key to be used for logging into this server.
cat "${KEY_PATH}.pub" >> "$AUTHORIZED_KEYS_PATH"
echo "✅ Added public key to $AUTHORIZED_KEYS_PATH."

# --- Step 4: Set correct permissions for security ---
# SSH will not work if permissions are too open.
chmod 600 "$AUTHORIZED_KEYS_PATH"
chmod 600 "$KEY_PATH"
chmod 644 "${KEY_PATH}.pub"
echo "✅ Set correct file permissions for keys."

# --- Step 5: Display the keys and instructions ---
echo -e "\n\n${GREEN}🎉 Setup Complete! 🎉${NC}"
echo -e "You now need to add the following as secrets to your GitHub repository."
echo -e "Go to: ${YELLOW}Your Repo > Settings > Secrets and variables > Actions${NC}"

echo -e "\n\n${BLUE}--- Private Key (for SSH_PRIVATE_KEY secret) ---${NC}"
echo -e "Copy the entire block below, including the BEGIN and END lines:"
echo -e "${YELLOW}----------------------------------------------------------------"
cat "$KEY_PATH"
echo -e "${YELLOW}----------------------------------------------------------------${NC}"


echo -e "\n\n${BLUE}--- Public Key (for SSH_PUBLIC_KEY secret - Optional but recommended) ---${NC}"
echo -e "Copy the entire line below:"
echo -e "${YELLOW}----------------------------------------------------------------"
cat "${KEY_PATH}.pub"
echo -e "${YELLOW}----------------------------------------------------------------${NC}"

echo -e "\nScript finished successfully.\n"