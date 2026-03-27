# Terraform Infrastructure

This directory provisions all Azure cloud infrastructure for the Exam Prep application using Terraform, managed via **Terraform Cloud**.

## Resources Provisioned

| Resource | Name | Purpose |
|----------|------|---------|
| Resource Group | `exam-prep-group` | Container for all Azure resources |
| Virtual Network | `exam-vnet` | Isolated network (10.0.0.0/16) |
| Public Subnet | `public-subnet` | Hosts the Bastion Host (10.0.1.0/24) |
| Private Subnet | `private-subnet` | Hosts the App VM and CosmosDB (10.0.2.0/24) |
| Bastion NSG | `bastion-nsg` | Allows SSH (22), HTTP (80), and HTTPS (443) from internet |
| App NSG | `app-nsg` | Allows SSH and app ports only from bastion subnet (10.0.1.0/24) |
| Bastion Host VM | `exam-bastion` | Jump server + nginx reverse proxy with TLS (`Standard_DS1_v2`) |
| App VM | `exam-vm` | Runs Docker containers — backend and frontend (`Standard_D2s_v3`) |
| Container Registry | ACR | Private Docker image registry |
| CosmosDB Account | MongoDB API | Managed database — VNet-restricted to private subnet only |
| CosmosDB Database | `exam_prep_db` | Application database |

> **Note:** B-series VM sizes (`Standard_B1s`, `Standard_B2s`) are not available in South Africa North due to capacity restrictions. DS/D-series are used instead.

## Architecture

```
Internet → Bastion Host (public subnet, ports 80/443/22)
                ↓ nginx reverse proxy (HTTPS → HTTP internally)
                ↓ SSH ProxyJump
           App VM (private subnet, no public IP)
                ↓ MongoDB connection string
           CosmosDB (VNet-restricted — private subnet only)
```

## Variables

Set these in **Terraform Cloud → Workspace → Variables**:

| Variable | Type | Sensitive | Example |
|----------|------|-----------|---------|
| `resource_group_name` | Terraform | No | `exam-prep-group` |
| `location` | Terraform | No | `South Africa North` (default) — see fallback regions below |
| `admin_username` | Terraform | No | `azureuser` |
| `ssh_public_key` | Terraform | **Yes** | `ssh-rsa AAAA...` (RSA only — Azure does not support ed25519) |
| `acr_name` | Terraform | No | `examprepregistry` |
| `cosmosdb_account_name` | Terraform | No | `exam-prep-cosmos-db` |
| `ARM_CLIENT_ID` | Environment | **Yes** | From service principal |
| `ARM_CLIENT_SECRET` | Environment | **Yes** | From service principal |
| `ARM_TENANT_ID` | Environment | **Yes** | From service principal |
| `ARM_SUBSCRIPTION_ID` | Environment | **Yes** | From service principal |

> **SSH Key:** Must be an RSA key (`ssh-keygen -t rsa -b 4096`). Azure Linux VMs do not support ed25519 keys. Paste the full public key string — not a file path.

## Fallback Regions

`South Africa North` is the default. If VM capacity is unavailable there, change the `location` variable in Terraform Cloud to one of these tested fallbacks:

| Region | Notes |
|--------|-------|
| `South Africa North` | **Default** — Johannesburg, closest to East Africa |
| `Canada Central` | Toronto — DS/D-series VMs confirmed available |
| `West Europe` | Netherlands — high capacity |

**To switch region:** Terraform Cloud → Workspace → Variables → edit `location` → trigger a new run. All resources (VNet, VMs, CosmosDB, ACR) redeploy together in the new region.

> B-series VM sizes (`Standard_B*`) are unavailable in South Africa North. The config uses `Standard_DS1_v2` (bastion) and `Standard_D2s_v3` (app VM), which are available in all three regions above.

## Outputs

After `terraform apply`, only one value needs to be saved as a GitHub Secret:

```bash
terraform output app_vm_private_ip           # → VM_PRIVATE_IP secret
```

> **ACR credentials, CosmosDB URI, and bastion IP are fetched automatically** by the CD pipeline on every run using `az acr credential show`, `az cosmosdb keys list`, and `az network public-ip show`. You no longer need to store or manually update `ACR_USERNAME`, `ACR_PASSWORD`, `MONGO_URI`, or `BASTION_IP` as secrets after a destroy+apply cycle.

Other outputs (for reference):

```bash
terraform output bastion_public_ip           # informational — DuckDNS update is automated
terraform output acr_login_server            # informational
terraform output -raw cosmosdb_connection_string  # informational (sensitive)
```

## Deploying

Terraform runs are managed by Terraform Cloud automatically via the VCS integration:

- **Push to any branch** → TF Cloud runs a speculative plan (preview only)
- **Merge to main** → TF Cloud applies the changes (auto-apply enabled)

For manual runs:

```bash
cd terraform/
terraform init
terraform plan
terraform apply
```

## Tearing Down

```bash
terraform destroy
```

Verify all resources are removed in the Azure Portal. Check for any orphaned Public IPs or NICs that may need manual deletion.
