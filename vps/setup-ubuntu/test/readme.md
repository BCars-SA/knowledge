# Testing Ansible Playbook with Docker Compose

This setup allows you to test the Ansible playbook locally using Docker containers.

## Setup

1. **Start the test environment:**
   ```bash
   docker-compose up -d
   ```

2. **Wait for containers to be ready (about 30-60 seconds)**

3. **Test SSH connection:**
   ```bash
   docker exec ansible-controller ssh -o StrictHostKeyChecking=no testuser@ansible-vps-test "echo 'SSH works'"
   ```

4. **Run the Ansible playbook:**
   ```bash
   docker exec ansible-controller ansible-playbook -i test-inventory.ini ./../ansible-playbook.yml --extra-vars "SSH_ADMIN_IPS=172.16.0.0/12,192.168.0.0/16"
   ```

## Alternative: Run playbook from host

If you have Ansible installed locally:

```bash
# Start only the Ubuntu test container
docker-compose up -d ubuntu-test

# Wait for SSH to be ready
sleep 30

# Run playbook from host
ansible-playbook -i test-inventory.ini ./../ansible-playbook.yml --extra-vars "SSH_ADMIN_IPS=172.16.0.0/12,192.168.0.0/16"
```

## Container Details

- **ubuntu-test**: Ubuntu container with SSH server and systemd
  - User: testuser / Password: testpass
  - SSH Port: 2222 (mapped from container port 22)
  - Sudo access without password

- **ansible-controller**: Pre-configured Ansible environment
  - Has access to your playbook files
  - SSH host key checking disabled for testing

## Cleanup

```bash
docker-compose down -v
```

## Troubleshooting

- **SSH connection issues**: Wait longer for containers to start up
- **Permission issues**: The container runs with privileged mode for systemd support
- **Playbook errors**: Check logs with `docker-compose logs ubuntu-test`
