variable "bastion_name" {
  description = "The name of the bastion instance"
  type        = string
}

variable "machine_type" {
  description = "The machine type for the bastion instance"
  type        = string
}

variable "zone" {
  description = "The GCP zone where the bastion instance will be created"
  type        = string
}

variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "boot_image" {
  description = "The image used to initialize the boot disk"
  type        = string
  default     = "ubuntu-os-cloud/ubuntu-2004-lts"
}

variable "subnet_id" {
  description = "The subnet ID where the bastion instance will be deployed"
  type        = string
}

variable "startup_script" {
  description = "The startup script to configure the bastion instance"
  type        = string
}

variable "tags" {
  description = "Network tags to associate with the bastion instance"
  type        = list(string)
  default     = ["bastion", "kafka"]
}

variable "repo_url" {
  description = "Repository URL for codebase"
  type        = string
}

variable "kafka_broker_url" {
  description = "Kafka broker URL"
  type        = string
}

variable "service_account" {
  description = "The name of the service_account"
  type        = string
}
