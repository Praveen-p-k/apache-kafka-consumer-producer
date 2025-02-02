resource "google_compute_instance" "bastion" {
  name         = var.bastion_name
  machine_type = var.machine_type
  zone         = var.zone
  project      = var.project_id
  boot_disk {
    initialize_params {
      image = var.boot_image
    }
  }
  network_interface {
    subnetwork = var.subnet_id
    access_config {}
  }
  metadata = {
    startup-script   = file("modules/services/bastion/bastion_startup_script.sh")
    repo_url         = var.repo_url
    kafka_broker_url = var.kafka_broker_url
    worksapce_name   = terraform.workspace
  }

  service_account {
    email  = var.service_account
    scopes = ["cloud-platform"]
  }
  tags = var.tags
}
