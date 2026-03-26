variable "resource_group_name" {
  description = "Name of the Azure resource group"
  type        = string
  default     = "exam-prep-group"
}

variable "location" {
  description = <<-EOT
    Azure region for all resources. Default is South Africa North (closest to East Africa).

    Fallback regions (in order of preference) if South Africa North has capacity issues:
      1. "Canada Central"    — consistently available; DS/D-series VMs confirmed available
      2. "West Europe"       — high capacity; good for testing

    To switch region: update this variable in Terraform Cloud -> Workspace -> Variables,
    then trigger a new run. All resources (VNet, VMs, CosmosDB, ACR) move together.

    Note: B-series VM sizes (Standard_B*) are unavailable in South Africa North.
    DS/D-series (Standard_DS1_v2, Standard_D2s_v3) are used instead and are
    available in all three regions listed above.
  EOT
  type        = string
  default     = "South Africa North"

  validation {
    condition = contains([
      "South Africa North",
      "Canada Central",
      "West Europe",
    ], var.location)
    error_message = "Location must be one of the approved fallback regions: 'South Africa North', 'Canada Central', or 'West Europe'."
  }
}

variable "admin_username" {
  description = "Admin username for the Linux VMs"
  type        = string
  default     = "azureuser"
}

variable "ssh_public_key" {
  description = "SSH public key string (not a file path - paste the full key content). Set this as a sensitive variable in Terraform Cloud."
  type        = string
  sensitive   = true
}

variable "acr_name" {
  description = "Azure Container Registry name (must be globally unique, alphanumeric only)"
  type        = string
}

variable "cosmosdb_account_name" {
  description = "CosmosDB account name (must be globally unique, lowercase letters and hyphens only)"
  type        = string
}
