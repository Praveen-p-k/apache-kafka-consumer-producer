# Project and Region
project_id = "kafka-test-442316" # Your GCP project ID
region     = "us-central1"      # Your desired GCP region
zone       = "us-central1-a"    # The specific zone within the region

# KAFKA CLUSTER
cluster_id  = "kafka-test-cluster"
vcpu_count  = 3
memory_byte = 3221225472

# VPC and Subnet Configuration
vpc_name            = "kafka-test-vpc-network"
private_subnet_cidr = "10.128.0.0/24"
public_subnet_cidr  = "10.128.20.0/24"

# Service Account and IAM Roles
service_account = "1023835523673-compute@developer.gserviceaccount.com" # Email of the service account to be used
iam_role        = "Managed Kafka Admin"                                          # IAM role for the service account

# Disk and Instance Configuration
machine_type  = "e2-medium"    # Machine type for instances
disk_size     = 20             # Disk size in GB
image_project = "debian-cloud" # Project for the base image
image_family  = "debian-11"    # Image family to use

bastion_name = "kafka-test-bastion"

consumer_name = "kafka-consumer"

producer_name = "kafka-producer"

instance_type = "e2-medium"
