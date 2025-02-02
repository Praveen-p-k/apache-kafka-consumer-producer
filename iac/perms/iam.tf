resource "google_project_iam_member" "consumer_service_account" {
  project = var.project_id
  role    = "roles/compute.instanceAdmin.v1"
  member  = "serviceAccount:${google_service_account.consumer.email}"
}

resource "google_service_account" "consumer" {
  account_id   = "consumer-sa"
  display_name = "Consumer Service Account"
  project      = var.project_id
}

resource "google_service_account" "producer" {
  account_id   = "producer-sa"
  display_name = "Producer Service Account"
  project      = var.project_id
}

resource "google_project_iam_binding" "consumer_permissions" {
  project = var.project_id
  role    = "roles/pubsub.subscriber"

  members = [
    "serviceAccount:${google_service_account.consumer.email}"
  ]
}

resource "google_project_iam_binding" "producer_permissions" {
  project = var.project_id
  role    = "roles/pubsub.publisher"

  members = [
    "serviceAccount:${google_service_account.producer.email}"
  ]
}

resource "google_project_iam_binding" "bastion_permissions" {
  project = var.project_id
  role    = "roles/compute.instanceAdmin.v1"

  members = [
    "serviceAccount:${google_service_account.producer.email}",
    "serviceAccount:${google_service_account.consumer.email}"
  ]
}
