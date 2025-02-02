resource "google_service_account" "kafka_sa" {
  account_id   = "kafka-sa"
  display_name = "Kafka Service Account"
}

output "service_account_email" {
  value = google_service_account.kafka_sa.email
}
