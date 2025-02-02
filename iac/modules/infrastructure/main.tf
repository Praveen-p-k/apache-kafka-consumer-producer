resource "google_compute_network" "vpc" {
  name                    = var.vpc_name
  project                 = var.project_id
  auto_create_subnetworks = false
  provider                = google-beta
  routing_mode            = "GLOBAL"
}

resource "google_compute_subnetwork" "public" {
  name                     = "${var.vpc_name}-subnet-public"
  region                   = var.region
  network                  = google_compute_network.vpc.id
  ip_cidr_range            = var.public_subnet_cidr
  private_ip_google_access = true
}

resource "google_compute_subnetwork" "private" {
  name                     = "${var.vpc_name}-subnet-private"
  region                   = var.region
  network                  = google_compute_network.vpc.id
  ip_cidr_range            = var.private_subnet_cidr
  private_ip_google_access = true
}
