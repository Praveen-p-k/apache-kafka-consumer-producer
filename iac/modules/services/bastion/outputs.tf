output "bastion_public_ip" {
  description = "The public IP of the bastion instance."
  value       = google_compute_instance.bastion.network_interface[0].access_config[0].nat_ip
}

output "bastion_instance_ip" {
  value = google_compute_instance.bastion.network_interface[0].access_config[0].nat_ip
}
