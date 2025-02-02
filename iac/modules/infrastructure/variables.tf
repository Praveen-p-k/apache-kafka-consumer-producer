variable "vpc_name" {
  description = "The name of the VPC to create or manage"
  type        = string
}

variable "private_subnet_cidr" {
  description = "CIDR range for the private subnet"
  type        = string
}

variable "public_subnet_cidr" {
  description = "CIDR range for the public subnet"
  type        = string
}

variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The GCP region"
  type        = string
  default     = "us-central1"
}
