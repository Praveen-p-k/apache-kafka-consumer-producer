variable "region" {
  description = "The GCP region"
  type        = string
  default     = "us-central1"
}

variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "vpc_name" {
  description = "The name of the VPC"
  type        = string
}

variable "service_account" {
  description = "The name of the service_account"
  type        = string
}

variable "private_subnet_cidr" {
  description = "CIDR block for private subnet"
  type        = string
  default     = "10.128.0.0/24"
}

variable "public_subnet_cidr" {
  description = "CIDR block for public subnet"
  type        = string
  default     = "10.128.20.0/24"
}

variable "bastion_machine_type" {
  description = "The machine type for the bastion host"
  type        = string
  default     = "e2-medium"
}

variable "bastion_zone" {
  description = "The zone to deploy the bastion host"
  type        = string
  default     = "us-central1-c"
}

variable "consumer_instance_type" {
  description = "Machine type for the consumer instance"
  type        = string
  default     = "e2-medium"
}

variable "producer_instance_type" {
  description = "Machine type for the producer instance"
  type        = string
  default     = "e2-medium"
}

variable "consumer_zone" {
  description = "Zone to deploy the consumer instance"
  type        = string
  default     = "us-central1-a"
}

variable "producer_zone" {
  description = "Zone to deploy the producer instance"
  type        = string
  default     = "us-central1-b"
}

variable "bastion_startup_script" {
  description = "Startup script for bastion"
  type        = string
  default     = "file('./services/bastion/bastion_startup_script.sh')"
}

variable "consumer_startup_script" {
  description = "Startup script for consumer"
  type        = string
  default     = "" # Empty string if no startup script is required
}

variable "producer_startup_script" {
  description = "Startup script for producer"
  type        = string
  default     = "" # Empty string if no startup script is required
}

variable "kafka_cluster_name" {
  description = "The name of the Kafka cluster"
  type        = string
  default     = "kafka-dev-cluster"
}

variable "bastion_name" {
  description = "The name of the bastion instance"
  type        = string
}

variable "producer_name" {
  description = "The name of the producer instance"
  type        = string
}

variable "consumer_name" {
  description = "The name of the consumer instance"
  type        = string
}

variable "repo_url" {
  description = "Repository URL for codebase"
  type        = string
  default     = "https://github.com/irys-cloud/irys-kafka"
}

variable "cluster_id" {
  description = "The name of the cluster"
  type        = string
  default     = "kafka-dev-cluster"
}

variable "vcpu_count" {
  description = "The name of the vcpu_count"
  type        = number
  default     = 3
}

variable "memory_bytes" {
  description = "The name of the memory_bytes"
  type        = number
  default     = 3221225472
}
