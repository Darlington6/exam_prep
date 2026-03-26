# Ansible Configuration Management

This directory contains the Ansible playbook that configures the Azure VMs after Terraform provisions them.

## What the Playbook Does

`deploy.yml` has two plays:

**Play 1 — App VM** (`[app]` host group):
1. Adds the official Docker apt repository (GPG key + apt source)
2. Installs Docker CE, Docker Compose plugin, and python3-docker
3. Starts and enables the Docker service
4. Adds the admin user to the `docker` group
5. Creates `/opt/exam-prep/` application directory
6. Copies `docker-compose.prod.yml` to the VM
7. Writes a `.env` file with production secrets (MONGO_URI, JWT_SECRET, ACR credentials)
8. Logs in to Azure Container Registry
9. Runs `docker compose up -d --pull always` to start/update the application

**Play 2 — Bastion Host** (`[bastion]` host group):
1. Installs nginx, certbot, and python3-certbot-nginx
2. Configures nginx as a reverse proxy:
   - `/api` → backend container on App VM (port 5001)
   - `/` → frontend container on App VM (port 3000)
3. Enables the site and removes the default nginx config
4. Starts nginx
5. Runs certbot to obtain a Let's Encrypt TLS certificate for the sslip.io domain and configures HTTPS with automatic HTTP → HTTPS redirect

## SSH Architecture

The App VM is in a private subnet with no public IP. Ansible reaches it via **SSH ProxyJump** through the Bastion Host:

```
GitHub Actions runner
      ↓ SSH (port 22)
  Bastion Host (public IP)
      ↓ SSH ProxyJump
  App VM (private IP)
```

## Files

| File | Purpose |
|------|---------|
| `deploy.yml` | Main deployment playbook (two plays: app VM + bastion) |
| `ansible.cfg` | Ansible configuration (disables host key checking, enables pipelining) |
| `inventory.ini.example` | Template showing the inventory format with ProxyJump |
| `inventory.ini` | **Generated at runtime by CD pipeline — never committed** |

## Running Locally (for testing)

```bash
# 1. Create your inventory file from the example
cp ansible/inventory.ini.example ansible/inventory.ini
# Edit inventory.ini with real IPs from terraform output

# 2. Ensure your RSA SSH key is available
ssh-add ~/.ssh/exam_prep_rsa

# 3. Test connectivity
ansible all -i ansible/inventory.ini -m ping

# 4. Run the playbook
ansible-playbook -i ansible/inventory.ini ansible/deploy.yml \
  --extra-vars "acr_login_server=<acr>.azurecr.io \
      acr_username=<username> \
      acr_password=<password> \
      mongo_uri='<cosmosdb-connection-string>' \
      jwt_secret='<jwt-secret>' \
      vm_private_ip=<app-vm-private-ip> \
      domain=<bastion-ip>.sslip.io"
```

## CD Integration

In the CD pipeline, `inventory.ini` is generated dynamically from GitHub Secrets so that live IP addresses are never committed to the repository. The domain is constructed automatically as `${{ secrets.BASTION_IP }}.sslip.io`. See `.github/workflows/cd.yml` for the full automation.
