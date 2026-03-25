terraform {
  required_version = ">= 1.3.7"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.43.0"
    }
  }

  cloud {
    organization = "darlington-org"
    workspaces {
      name = "exam_prep"
    }
  }
}

provider "azurerm" {
  features {}
  # Default behaviour: auto-registers Azure resource providers as needed.
  # The service principal requires Contributor role (includes provider registration).
}

# Resource Group

resource "azurerm_resource_group" "rg" {
  name     = var.resource_group_name
  location = var.location
}

# Virtual Network & Subnets

resource "azurerm_virtual_network" "vnet" {
  name                = "exam-vnet"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  address_space       = ["10.0.0.0/16"]
}

# Public subnet — Bastion host lives here
resource "azurerm_subnet" "public" {
  name                 = "public-subnet"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["10.0.1.0/24"]
}

# Private subnet — App VM lives here (no direct internet access)
resource "azurerm_subnet" "private" {
  name                 = "private-subnet"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["10.0.2.0/24"]

  # Required for the CosmosDB virtual network rule below.
  # Enables private, subnet-level access to the CosmosDB data plane.
  service_endpoints = ["Microsoft.AzureCosmosDB"]
}

# Network Security Groups

# Bastion NSG — allows SSH and HTTP from the internet.
# SSH must be open to all because GitHub Actions runners use dynamic IPs.
resource "azurerm_network_security_group" "bastion_nsg" {
  name                = "bastion-nsg"
  location            = var.location
  resource_group_name = azurerm_resource_group.rg.name
}

# tfsec:ignore:azure-network-ssh-blocked-from-internet
# tfsec:ignore:azure-network-no-public-ingress
resource "azurerm_network_security_rule" "bastion_allow_ssh" {
  name                        = "Allow-SSH"
  priority                    = 100
  direction                   = "Inbound"
  access                      = "Allow"
  protocol                    = "Tcp"
  destination_port_range      = "22"
  source_port_range           = "*"
  source_address_prefix       = "*" # Intentional: GitHub Actions uses dynamic IPs
  destination_address_prefix  = "*"
  resource_group_name         = azurerm_resource_group.rg.name
  network_security_group_name = azurerm_network_security_group.bastion_nsg.name
}

# tfsec:ignore:azure-network-no-public-ingress
resource "azurerm_network_security_rule" "bastion_allow_http" {
  name                        = "Allow-HTTP"
  priority                    = 110
  direction                   = "Inbound"
  access                      = "Allow"
  protocol                    = "Tcp"
  destination_port_range      = "80"
  source_port_range           = "*"
  source_address_prefix       = "*" # Intentional: users access the app over the internet
  destination_address_prefix  = "*"
  resource_group_name         = azurerm_resource_group.rg.name
  network_security_group_name = azurerm_network_security_group.bastion_nsg.name
}

# App NSG — only the bastion subnet can SSH or send app traffic here
resource "azurerm_network_security_group" "app_nsg" {
  name                = "app-nsg"
  location            = var.location
  resource_group_name = azurerm_resource_group.rg.name
}

resource "azurerm_network_security_rule" "app_allow_ssh" {
  name                        = "Allow-SSH-From-Bastion"
  priority                    = 100
  direction                   = "Inbound"
  access                      = "Allow"
  protocol                    = "Tcp"
  destination_port_range      = "22"
  source_port_range           = "*"
  source_address_prefix       = "10.0.1.0/24" # Bastion subnet only
  destination_address_prefix  = "*"
  resource_group_name         = azurerm_resource_group.rg.name
  network_security_group_name = azurerm_network_security_group.app_nsg.name
}

resource "azurerm_network_security_rule" "app_allow_traffic" {
  name                        = "Allow-App-Traffic-From-Bastion"
  priority                    = 110
  direction                   = "Inbound"
  access                      = "Allow"
  protocol                    = "Tcp"
  destination_port_ranges     = ["80", "3000", "5001"] # nginx, frontend, backend
  source_port_range           = "*"
  source_address_prefix       = "10.0.1.0/24" # Bastion subnet only
  destination_address_prefix  = "*"
  resource_group_name         = azurerm_resource_group.rg.name
  network_security_group_name = azurerm_network_security_group.app_nsg.name
}

# Associate NSGs with their respective subnets to enforce the rules.
resource "azurerm_subnet_network_security_group_association" "public_nsg_assoc" {
  subnet_id                 = azurerm_subnet.public.id
  network_security_group_id = azurerm_network_security_group.bastion_nsg.id
}

resource "azurerm_subnet_network_security_group_association" "private_nsg_assoc" {
  subnet_id                 = azurerm_subnet.private.id
  network_security_group_id = azurerm_network_security_group.app_nsg.id
}

# Bastion Host (Public Subnet)
# Acts as SSH jump host and nginx reverse proxy for public access

resource "azurerm_public_ip" "bastion_ip" {
  name                = "bastion-ip"
  location            = var.location
  resource_group_name = azurerm_resource_group.rg.name
  allocation_method   = "Static"
  sku                 = "Standard"
}

resource "azurerm_network_interface" "bastion_nic" {
  name                = "bastion-nic"
  location            = var.location
  resource_group_name = azurerm_resource_group.rg.name

  ip_configuration {
    name                          = "bastion-ip-config"
    subnet_id                     = azurerm_subnet.public.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.bastion_ip.id
  }
}

resource "azurerm_linux_virtual_machine" "bastion" {
  name                = "exam-bastion"
  resource_group_name = azurerm_resource_group.rg.name
  location            = var.location
  size                = "Standard_B1s" # Only runs nginx
  admin_username      = var.admin_username

  network_interface_ids = [azurerm_network_interface.bastion_nic.id]

  admin_ssh_key {
    username   = var.admin_username
    public_key = var.ssh_public_key # Direct string as file() does not work in Terraform Cloud
  }

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  source_image_reference {
    # Ubuntu 22.04 LTS (Jammy).
    # 22.04+ requires the "0001-com-ubuntu-server-jammy" offer name.
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts"
    version   = "latest"
  }
}

# App VM (Private Subnet)
# Runs Docker containers — only reachable via bastion

resource "azurerm_network_interface" "vm_nic" {
  name                = "vm-nic"
  location            = var.location
  resource_group_name = azurerm_resource_group.rg.name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = azurerm_subnet.private.id
    private_ip_address_allocation = "Dynamic"
    # No public_ip_address_id — this VM is private
  }
}

resource "azurerm_linux_virtual_machine" "vm" {
  name                = "exam-vm"
  resource_group_name = azurerm_resource_group.rg.name
  location            = var.location
  size                = "Standard_B2ms" # 2 vCPU / 8 GiB
  admin_username      = var.admin_username

  network_interface_ids = [azurerm_network_interface.vm_nic.id]

  admin_ssh_key {
    username   = var.admin_username
    public_key = var.ssh_public_key
  }

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  source_image_reference {
    # Ubuntu 22.04 LTS (Jammy).
    # 22.04+ requires the "0001-com-ubuntu-server-jammy" offer name.
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts"
    version   = "latest"
  }
}

# Azure Container Registry (ACR)
# Stores Docker images built by the CD pipeline

resource "azurerm_container_registry" "acr" {
  name                = var.acr_name
  location            = var.location
  resource_group_name = azurerm_resource_group.rg.name
  sku                 = "Basic"
  admin_enabled       = true
}

# Azure CosmosDB (MongoDB API) — Managed Database
# Replaces the Docker MongoDB container for production.
# The app connects to this via the standard MongoDB URI.

resource "azurerm_cosmosdb_account" "db" {
  name                = var.cosmosdb_account_name
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  offer_type          = "Standard"
  kind                = "MongoDB"

  # MongoDB API compatibility
  capabilities {
    name = "EnableMongo"
  }

  consistency_policy {
    consistency_level = "Session"
  }

  geo_location {
    location          = azurerm_resource_group.rg.location
    failover_priority = 0
  }

  mongo_server_version = "4.2"

  # Restrict CosmosDB data-plane access to the private subnet only.
  # Only the app VM (in the private subnet) can connect to the database.
  # The public internet is blocked. The service_endpoints on the private
  # subnet must be set to "Microsoft.AzureCosmosDB" for this to work.
  is_virtual_network_filter_enabled = true

  virtual_network_rule {
    id = azurerm_subnet.private.id
  }
}

# The MongoDB database inside the CosmosDB account complete
resource "azurerm_cosmosdb_mongo_database" "db" {
  name                = "exam_prep_db"
  resource_group_name = azurerm_resource_group.rg.name
  account_name        = azurerm_cosmosdb_account.db.name
}
