# Infrastructure as Code (IaC) for Irys Kafka

## Structure

- `backend/`: Terraform backend configurations.
- `modules/`: Reusable Terraform modules.
- `perms/`: IAM roles and service accounts.
- `vars/`: Environment-specific variable files.

## Usage

1. Initialize Terraform: `terraform init`
2. Switch workspace: `terraform workspace select dev`
3. Apply changes: `./apply.sh`

## Pipeline

Configure the Azure Pipeline in `azure-pipelines.yml`.
