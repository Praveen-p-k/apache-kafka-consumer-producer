provider "google" {
  project     = var.project_id
  region      = var.region
  credentials = file("./backend/kafka-${terraform.workspace}-service-account-key.json")
}


provider "google-beta" {
  project     = var.project_id
  region      = var.region
  credentials = file("./backend/kafka-${terraform.workspace}-service-account-key.json")
}

data "google_project" "project" {
  provider = google-beta
}

# VPC Network
module "network" {
  source              = "./modules/infrastructure"
  project_id          = var.project_id
  private_subnet_cidr = var.private_subnet_cidr
  public_subnet_cidr  = var.public_subnet_cidr
  vpc_name            = var.vpc_name
}

resource "google_managed_kafka_cluster" "kafka_cluster" {
  cluster_id = var.cluster_id
  location   = var.region

  capacity_config {
    vcpu_count   = var.vcpu_count
    memory_bytes = var.memory_bytes
  }

  gcp_config {
    access_config {
      network_configs {
        subnet = module.network.private_subnet_id
      }
    }
  }

  rebalance_config {
    mode = "NO_REBALANCE"
  }

  labels = {
    key = "value"
  }

  provider = google-beta
}

# Bastion
module "bastion" {
  source           = "./modules/services/bastion"
  bastion_name     = var.bastion_name
  machine_type     = var.bastion_machine_type
  zone             = var.bastion_zone
  service_account  = var.service_account
  subnet_id        = module.network.private_subnet_id
  project_id       = var.project_id
  repo_url         = var.repo_url
  kafka_broker_url = "bootstrap.${var.cluster_id}.${var.region}.managedkafka.${var.project_id}.cloud.goog:9092"
  tags             = ["bastion", "kafka"]
  startup_script   = var.bastion_startup_script

  # Explicitly set dependency on the Kafka cluster
  depends_on = [google_managed_kafka_cluster.kafka_cluster]
}
# bootstrap.kafka-dev-cluster.us-central1.managedkafka.kafka-dev-440919.cloud.goog:9092
# Firewall Rules
resource "google_compute_firewall" "allow_ssh" {
  name    = "allow-ssh"
  network = module.network.vpc_name
  allow {
    protocol = "tcp"
    ports    = ["22"]
  }
  source_ranges = ["0.0.0.0/0"]

  lifecycle {
    ignore_changes = [name] # or other properties that might be causing conflict
  }
}

resource "google_compute_firewall" "allow_kafka" {
  name    = "allow-kafka"
  network = module.network.vpc_name
  allow {
    protocol = "tcp"
    ports    = ["9092"]
  }
  source_ranges = [module.bastion.bastion_public_ip]

  lifecycle {
    ignore_changes = [name] # or other properties that might be causing conflict
  }
}
