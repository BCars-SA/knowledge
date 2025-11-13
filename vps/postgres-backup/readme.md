# PostgreSQL Offsite Backup Setup

Automated PostgreSQL backup solution for Docker containers with offsite storage on Synology NAS via rsync over SSH.

## Overview

This setup provides:
- **Automated daily backups** of PostgreSQL database from Docker container
- **Compressed backups** using xz (maximum compression)
- **Rotation strategy**: keeps current and previous backup locally
- **Offsite storage** on Synology NAS via rsync
- **Detailed logging** for monitoring and troubleshooting

## Architecture

```
┌─────────────────────────┐
│   Hetzner Server        │
│  ┌──────────────────┐   │     SSH + rsync      ┌──────────────────┐
│  │ Docker Container │   │ ─────────────────────>│  Synology NAS    │
│  │   PostgreSQL     │   │                       │                  │
│  └──────────────────┘   │                       │ /volume1/        │
│          │              │                       │  NetBackup/      │
│     pg_dump + xz        │                       │   Hetzner/       │
│          │              │                       └──────────────────┘
│   /srv/backups/         │
│   ├─ current.dump.xz    │
│   └─ previous.dump.xz   │
└─────────────────────────┘
```

## Prerequisites

- **Hetzner Server**: Linux server with Docker and PostgreSQL container
- **Synology NAS**: DSM-based NAS with SSH access enabled
- **Network**: SSH connectivity between servers (port 22)
- **Software**: rsync, xz-utils, openssh-client

---

## Setup Instructions

### Step 1: Create Backup User on Synology

Create a dedicated SSH user for receiving backups:

1. **Login to Synology DSM** → Control Panel → User & Group
2. **Create user**: `backup_hetzner`
   - Description: "SSH user for backups from Hetzner server"
   - Home directory: `/volume1/homes/backup_hetzner`
   - Enable SSH access
3. **Assign permissions** to `/volume1/NetBackup/Hetzner/` directory

**Verification:**
```bash
# On Synology (via SSH as admin)
grep backup_hetzner /etc/passwd
```

**Expected output:**
```
backup_hetzner:x:<uid>:<gid>:SSH user for backups from Hetzner server:/volume1/homes/backup_hetzner:/sbin/nologin
```

---

### Step 2: Configure SSH Keys

#### On Hetzner Server

Generate ED25519 SSH key pair:

```bash
ssh-keygen -t ed25519 -f /root/.ssh/deltafile01 -N ""
```

**Expected result:**
- Private key: `/root/.ssh/deltafile01`
- Public key: `/root/.ssh/deltafile01.pub`

**Set correct permissions:**
```bash
chmod 600 /root/.ssh/deltafile01
```

#### On Synology NAS

Copy the public key to Synology:

```bash
# From Hetzner, copy the public key content
cat /root/.ssh/deltafile01.pub
```

Then on Synology:
```bash
# Create .ssh directory if it doesn't exist
mkdir -p /volume1/homes/backup_hetzner/.ssh

# Add the public key to authorized_keys
echo "ssh-ed25519 AAAAC3... root@hetzner" >> /volume1/homes/backup_hetzner/.ssh/authorized_keys

# Set correct permissions
chmod 700 /volume1/homes/backup_hetzner/.ssh
chmod 600 /volume1/homes/backup_hetzner/.ssh/authorized_keys
chown -R backup_hetzner:backup_hetzner /volume1/homes/backup_hetzner/.ssh
```

**Verification:**
```bash
# Check directory permissions
ls -ld /volume1/homes/backup_hetzner/.ssh
# Expected: drwx------ backup_hetzner backup_hetzner

# Check file permissions
ls -l /volume1/homes/backup_hetzner/.ssh/authorized_keys
# Expected: -rw------- backup_hetzner backup_hetzner
```

#### Test SSH Connection

From Hetzner, test the connection:

```bash
ssh -i /root/.ssh/deltafile01 -p 22 backup_hetzner@XX.X.XX.XXX
```

Expected: Connection succeeds without password prompt.

---

### Step 3: Create Backup Directories on Hetzner

Create directories for backups and logs:

```bash
mkdir -p /srv/backups /var/log/postgres-backups
```

**Verification:**
```bash
# Check directories exist
ls -ld /srv/backups /var/log/postgres-backups

# Test write access
touch /srv/backups/test_file && rm /srv/backups/test_file
touch /var/log/postgres-backups/test_file && rm /var/log/postgres-backups/test_file
# Expected: No errors
```

---

### Step 4: Install Backup Script

Create the backup script at `/usr/local/bin/backup-postgres.sh`:

```bash
#!/bin/bash
set -euo pipefail  # Exit on error, undefined variables, pipe failures

# Configuration
BACKUP_DIR="/srv/backups"
LOG_DIR="/var/log/postgres-backups"
CONTAINER_NAME="threecx-api-postgres"
DB_USER="DB_USER"
DB_NAME="DB_NAME"

CURRENT="$BACKUP_DIR/postgres_current.dump.xz"
PREVIOUS="$BACKUP_DIR/postgres_previous.dump.xz"
TEMP_BACKUP="$BACKUP_DIR/postgres_temp.dump.xz"
LOG_FILE="$LOG_DIR/backup.log"

RSYNC_DEST="backup_hetzner@XX.X.XX.XXX:/volume1/NetBackup/Hetzner/"
SSH_KEY="/root/.ssh/deltafile01"

# Ensure PATH is set (important for cron)
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

# Create directories
mkdir -p "$BACKUP_DIR" "$LOG_DIR" || {
    echo "$(date '+%F %T') - ERROR: Failed to create directories" >> "$LOG_FILE"
    exit 1
}

# Check if container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "$(date '+%F %T') - ERROR: Container $CONTAINER_NAME is not running" >> "$LOG_FILE"
    exit 1
fi

# Create new compressed backup to temp file first
echo "$(date '+%F %T') - Starting backup..." >> "$LOG_FILE"
if docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" "$DB_NAME" | xz -z -9 -c > "$TEMP_BACKUP" 2>> "$LOG_FILE"; then
    # Only rotate if new backup succeeded
    [ -f "$CURRENT" ] && mv -f "$CURRENT" "$PREVIOUS"
    mv -f "$TEMP_BACKUP" "$CURRENT"
    echo "$(date '+%F %T') - Backup successful: $CURRENT ($(du -h "$CURRENT" | cut -f1))" >> "$LOG_FILE"
else
    echo "$(date '+%F %T') - ERROR: Backup FAILED" >> "$LOG_FILE"
    [ -f "$TEMP_BACKUP" ] && rm -f "$TEMP_BACKUP"
    exit 1
fi

# Send backup to Synology
echo "$(date '+%F %T') - Starting rsync to Synology..." >> "$LOG_FILE"
if rsync -av --no-perms --no-owner --no-group -e "ssh -i $SSH_KEY -p 22" "$BACKUP_DIR/" "$RSYNC_DEST" >> "$LOG_FILE" 2>&1; then
    echo "$(date '+%F %T') - Backup successfully sent to Synology" >> "$LOG_FILE"
else
    echo "$(date '+%F %T') - ERROR: Failed to send backup to Synology" >> "$LOG_FILE"
    exit 1
fi

echo "$(date '+%F %T') - Backup process completed successfully" >> "$LOG_FILE"

#Send file size to zabbix

# Use the stat command to obtain file information and store it in variables
arc_file_size=$(stat -c "%s" "$CURRENT")  # Compressed file size in bytes

# zabbix sender
zbx_server="XX.X.XX.XXX"
zbx_port="10051"
zbx_hostname="3CX API"
zbx_key="PG_DB_backup_size"
zbx_value=$arc_file_size
zbx_DATA='{"request":"sender data","data":[{"host":"'${zbx_hostname}'","key":"'${zbx_key}'","value":"'${zbx_value}'"}]}'
printf -v LENGTH '%016x' "${#zbx_DATA}"
PACK=""
for (( i=14; i>=0; i-=2 )); do PACK="$PACK\\x${LENGTH:$i:2}"; done

#zabbix send
printf "ZBXD\1$PACK%s" "$zbx_DATA" > /dev/tcp/${zbx_server}/${zbx_port}
```

**Make the script executable:**
```bash
chmod +x /usr/local/bin/backup-postgres.sh
```

**Configuration Variables:**

Edit these variables in the script to match your environment:

| Variable | Description | Example |
|----------|-------------|---------|
| `CONTAINER_NAME` | Docker container name | `threecx-api-postgres` |
| `DB_USER` | PostgreSQL user | `postgres` |
| `DB_NAME` | Database name | `postgres` |
| `RSYNC_DEST` | Synology destination | `backup_hetzner@IP:/path/` |
| `SSH_KEY` | Path to SSH private key | `/root/.ssh/deltafile01` |

---

### Step 5: Test the Backup Script

Run the script manually to verify it works:

```bash
/usr/local/bin/backup-postgres.sh
```

**Check for success:**
```bash
# View the log
tail -f /var/log/postgres-backups/backup.log

# Check backup files
ls -lh /srv/backups/
# Expected: postgres_current.dump.xz (and postgres_previous.dump.xz after second run)

# Verify files on Synology
ssh -i /root/.ssh/deltafile01 backup_hetzner@XX.X.XX.XXX "ls -lh /volume1/NetBackup/Hetzner/"
```

---

### Step 6: Schedule with Cron

Add the backup script to root's crontab for daily execution at 03:00:

```bash
sudo crontab -e
```

**Add this line:**
```cron
0 3 * * * /usr/local/bin/backup-postgres.sh
```

**Verify the crontab:**
```bash
sudo crontab -l
```

**Expected output:**
```
0 3 * * * /usr/local/bin/backup-postgres.sh
```

---

## How It Works

### Backup Process Flow

1. **Pre-flight checks**: Verifies directories exist and Docker container is running
2. **Database dump**: Executes `pg_dump` inside the Docker container
3. **Compression**: Pipes output through `xz -9` (maximum compression)
4. **Safe rotation**:
   - Creates backup in temporary file first
   - Only rotates (current → previous) if new backup succeeds
   - Moves temp file to current
5. **Offsite transfer**: Syncs backup directory to Synology via rsync over SSH
6. **Logging**: Records all operations with timestamps

### Backup Rotation Strategy

- **Local storage**: Keeps 2 versions (current + previous)
- **Offsite storage**: All backups are synced to Synology (no automatic deletion)

```
/srv/backups/
├── postgres_current.dump.xz   # Today's backup
└── postgres_previous.dump.xz  # Yesterday's backup
```

### Compression Details

- Uses **xz -9** (LZMA2 algorithm) for maximum compression
- Typical compression ratio: 80-90% for SQL dumps
- No additional compression during rsync (data already compressed)

---

## Monitoring and Maintenance

### Check Backup Status

```bash
# View recent log entries
tail -n 50 /var/log/postgres-backups/backup.log

# Check for errors
grep ERROR /var/log/postgres-backups/backup.log

# View backup sizes
ls -lh /srv/backups/
```

### Log Format

```
2025-11-13 03:00:01 - Starting backup...
2025-11-13 03:00:45 - Backup successful: /srv/backups/postgres_current.dump.xz (15M)
2025-11-13 03:00:46 - Starting rsync to Synology...
2025-11-13 03:01:12 - Backup successfully sent to Synology
2025-11-13 03:01:12 - Backup process completed successfully
```

### Log Rotation

The script appends to a single log file. To prevent unlimited growth, set up logrotate:

```bash
# Create /etc/logrotate.d/postgres-backups
cat > /etc/logrotate.d/postgres-backups <<EOF
/var/log/postgres-backups/backup.log {
    weekly
    rotate 8
    compress
    delaycompress
    missingok
    notifempty
}
EOF
```

---

## Restore Procedure

### Restore from Current Backup

```bash
# Decompress and restore
xz -dc /srv/backups/postgres_current.dump.xz | docker exec -i threecx-api-postgres psql -U postgres postgres
```

### Restore from Previous Backup

```bash
xz -dc /srv/backups/postgres_previous.dump.xz | docker exec -i threecx-api-postgres psql -U postgres postgres
```

### Restore from Synology

```bash
# Download backup from Synology
rsync -av -e "ssh -i /root/.ssh/deltafile01 -p 22" \
  backup_hetzner@XX.X.XX.XXX:/volume1/NetBackup/Hetzner/postgres_current.dump.xz \
  /tmp/

# Decompress and restore
xz -dc /tmp/postgres_current.dump.xz | docker exec -i threecx-api-postgres psql -U postgres postgres
```

**⚠️ Warning:** Restoring will overwrite existing database data. Always test restores in a non-production environment first.

---

## Troubleshooting

### Backup Script Fails

**Check container is running:**
```bash
docker ps | grep threecx-api-postgres
```

**Test pg_dump manually:**
```bash
docker exec threecx-api-postgres pg_dump -U postgres postgres | head
```

**Check disk space:**
```bash
df -h /srv/backups
```

### Rsync Fails

**Test SSH connection:**
```bash
ssh -i /root/.ssh/deltafile01 -p 22 backup_hetzner@XX.X.XX.XXX
```

**Check SSH key permissions:**
```bash
ls -l /root/.ssh/deltafile01
# Expected: -rw------- (600)
```

**Test rsync manually:**
```bash
rsync -av -e "ssh -i /root/.ssh/deltafile01 -p 22" \
  /srv/backups/ \
  backup_hetzner@XX.X.XX.XXX:/volume1/NetBackup/Hetzner/ --dry-run
```

### Permission Denied Errors

**On Synology, check:**
```bash
# SSH key permissions
ls -la /volume1/homes/backup_hetzner/.ssh/

# Destination directory permissions
ls -ld /volume1/NetBackup/Hetzner/
```

### Cron Not Running

**Check cron service:**
```bash
systemctl status cron
```

**View cron logs:**
```bash
grep CRON /var/log/syslog | tail -n 20
```

**Test with verbose cron entry:**
```cron
0 3 * * * /usr/local/bin/backup-postgres.sh >> /tmp/cron-debug.log 2>&1
```

---

## Security Considerations

- **SSH Key Protection**: Private key (`/root/.ssh/deltafile01`) must have 600 permissions
- **Limited Access**: Synology user `backup_hetzner` should have write access only to backup directory
- **No Password Authentication**: SSH key-based auth only (more secure for automation)
- **Encryption in Transit**: Data transmitted over SSH (encrypted)
- **Log Monitoring**: Regularly review logs for unauthorized access attempts

### Recommendations

1. **Enable SSH key passphrase** if manual intervention is acceptable
2. **Use firewall rules** to restrict SSH access to known IPs
3. **Monitor failed SSH attempts** on Synology
4. **Test restore procedures** regularly (monthly recommended)
5. **Store offsite backups** in encrypted filesystem if containing sensitive data

---

## Customization

### Change Backup Schedule

Edit crontab to run at different times:

```bash
sudo crontab -e
```

Examples:
- Every 6 hours: `0 */6 * * *`
- Twice daily: `0 3,15 * * *`
- Weekly (Sunday 3 AM): `0 3 * * 0`

### Keep More Backup Versions Locally

Modify the rotation logic in the script to keep more versions:

```bash
# Example: Keep 7 days of backups
BACKUP_FILE="$BACKUP_DIR/postgres_$(date +%Y%m%d).dump.xz"
# Then add cleanup logic to remove backups older than 7 days
find "$BACKUP_DIR" -name "postgres_*.dump.xz" -mtime +7 -delete
```

### Add Email Notifications

Install `mailutils` and add to the script:

```bash
# At the end of the script
if [ $? -eq 0 ]; then
    echo "Backup completed successfully" | mail -s "Backup Success" admin@example.com
else
    echo "Backup failed. Check logs at $LOG_FILE" | mail -s "Backup FAILED" admin@example.com
fi
```

### Backup Multiple Databases

Create separate scripts or modify to loop through databases:

```bash
for DB_NAME in db1 db2 db3; do
    docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" "$DB_NAME" | xz -z -9 -c > "$BACKUP_DIR/${DB_NAME}_current.dump.xz"
done
```

---

## FAQ

**Q: How long do backups take?**  
A: Depends on database size. Typical: 100MB DB = ~1 minute, 1GB = ~5-10 minutes.

**Q: How much disk space is needed?**  
A: Locally: 2x compressed backup size. With xz -9, expect 10-20% of original DB size.

**Q: Can I backup specific tables only?**  
A: Yes, use `pg_dump -t table_name`. Modify the script's pg_dump command.

**Q: What if Synology is offline?**  
A: Local backup still succeeds. Rsync will fail, logged as error. Next run will sync both backups.

**Q: How to backup multiple PostgreSQL containers?**  
A: Create separate scripts or modify to loop through container names.

**Q: Is the backup consistent?**  
A: Yes, `pg_dump` creates a consistent snapshot. For very large databases under heavy write load, consider `pg_basebackup`.

---

## License

This documentation and script are provided as-is for operational use.

---

## Support

For issues with:
- **PostgreSQL**: https://www.postgresql.org/docs/
- **Docker**: https://docs.docker.com/
- **rsync**: `man rsync`
- **Synology**: https://www.synology.com/support

---

**Last Updated:** 2025-11-13  
**Version:** 1.0
