output "bastion_public_ip" {
  description = "Public IP of the bastion host. Use this as BASTION_IP in GitHub Secrets."
  value       = azurerm_public_ip.bastion_ip.ip_address
}

output "app_vm_private_ip" {
  description = "Private IP of the app VM. Use this as VM_PRIVATE_IP in GitHub Secrets."
  value       = azurerm_network_interface.vm_nic.private_ip_address
}

output "acr_login_server" {
  description = "ACR login server URL (e.g. examprepregistry.azurecr.io)"
  value       = azurerm_container_registry.acr.login_server
}

output "cosmosdb_connection_string" {
  description = "Primary MongoDB connection string for CosmosDB. Use this as MONGO_URI in GitHub Secrets."
  value       = azurerm_cosmosdb_account.db.connection_strings[0]
  sensitive   = true
}
