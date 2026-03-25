variable "resource_group_name" {
  description = "Name of the Azure resource group"
  type        = string
  default     = "exam-prep-group"
}

variable "location" {
  description = "Azure region for all resources"
  type        = string
  default     = "South Africa North" # Closest Azure region to East Africa
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
