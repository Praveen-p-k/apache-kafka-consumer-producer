#!/bin/bash

workspace=$(terraform workspace show)

case "$workspace" in
  "dev")
    backend_config="backend/dev-config.gcs.tfbackend"
    ;;
  "test")
    backend_config="backend/test-config.gcs.tfbackend"
    ;;
  "qa")
    backend_config="backend/qa-config.gcs.tfbackend"
    ;;
  *)
    echo "Unknown workspace: $workspace"
    exit 1
    ;;
esac

terraform init -backend-config="$backend_config" || exit 1
terraform plan -var-file="vars/${workspace}.tfvars" || exit 1
terraform apply -var-file="vars/${workspace}.tfvars" -auto-approve || exit 1
