#!/bin/bash

# Set up the environment
cd /home
sudo apt-get update -y || {
  echo "Failed to update system"
  exit 1
}
sudo apt-get upgrade -y || {
  echo "Failed to upgrade system"
  exit 1
}
sudo apt install git-all -y
# Install necessary software packages
sudo apt install -y curl vim git kafkacat || {
  echo "Failed to install packages"
  exit 1
}

# Install Docker
echo "Installing Docker..."
sudo rm /etc/apt/sources.list.d/docker.list
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable" -y
sudo apt install -y docker-ce

# Start and enable Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Check Docker and Docker Compose versions
docker --version

# Fetch repo credentials from GCP Secret Manager
REPO_USERNAME=$(gcloud secrets versions access latest --secret="IRYS_KAFKA_AUTH_USERNAME")
echo "REPO_USERNAME: $REPO_USERNAME"
REPO_PASSWORD=$(gcloud secrets versions access latest --secret="IRYS_KAFKA_AUTH_PASSWORD")
echo "REPO_PASSWORD: $REPO_PASSWORD"

# Fetch repo URL and Kafka broker URL from metadata
REPO_URL=$(curl -H "Metadata-Flavor: Google" http://169.254.169.254/computeMetadata/v1/instance/attributes/repo_url) || {
  echo "Failed to fetch repo_url"
  exit 1
}
STRIPPED_REPO_URL=${REPO_URL#https://}
KAFKA_BROKER_URL=$(curl -H "Metadata-Flavor: Google" http://169.254.169.254/computeMetadata/v1/instance/attributes/kafka_broker_url) || {
  echo "Failed to fetch kafka_broker_url"
  exit 1
}

AUTH_REPO_URL="https://${REPO_USERNAME}:${REPO_PASSWORD}@${STRIPPED_REPO_URL}"

echo "AUTH URL: $AUTH_REPO_URL"
echo "Kafka Broker URL: $KAFKA_BROKER_URL"

# Clone the repository
echo "Cloning repository..."
git clone $AUTH_REPO_URL
cd irys-kafka

# Pull .env files from GCS bucket
WORKSPACE=$(curl -H "Metadata-Flavor: Google" http://169.254.169.254/computeMetadata/v1/instance/attributes/worksapce_name)
BUCKET_NAME="irys-app-${WORKSPACE}-utils"
echo "Using bucket: $BUCKET_NAME"

echo "Fetching .env files from GCS bucket..."
gcloud storage cp gs://$BUCKET_NAME/consumer/.env ./consumer/.env
gcloud storage cp gs://$BUCKET_NAME/producer/.env ./producer/.env

# Update KAFKA_BROKER in the .env files
echo "Updating KAFKA_BROKER in the .env files..."
sed -i "s|^IRYS_KAFKA_BROKER=.*|IRYS_KAFKA_BROKER=$KAFKA_BROKER_URL|g" ./consumer/.env
sed -i "s|^KAFKA_BROKER=.*|KAFKA_BROKER=$KAFKA_BROKER_URL|g" ./producer/.env
echo ".env files updated successfully."

# Create Kafka topic if it doesn't exist
TOPIC_NAME="blockchain-event-topic"
PARTITIONS=3
REPLICATION_FACTOR=1

echo "Checking if the topic $TOPIC_NAME exists..."
kafkacat -b $KAFKA_BROKER_URL -L 2>/dev/null | grep -x ".*Topic: $TOPIC_NAME .*" >/dev/null

if [ $? -eq 0 ]; then
  echo "Topic $TOPIC_NAME already exists."
else
  echo "Creating topic $TOPIC_NAME..."
  kafkacat -b $KAFKA_BROKER_URL -P -t $TOPIC_NAME -p $PARTITIONS -r $REPLICATION_FACTOR <<<"test message"
  echo "Topic $TOPIC_NAME created."
fi

# Fetch workspace name from metadata
WORKSPACE=$(curl -H "Metadata-Flavor: Google" http://169.254.169.254/computeMetadata/v1/instance/attributes/worksapce_name)

# Select Docker Compose file based on workspace
case "$WORKSPACE" in
"local")
  COMPOSE_FILE="docker-compose.local.yml"
  ;;
"dev")
  COMPOSE_FILE="docker-compose.dev.yml"
  ;;
"test")
  COMPOSE_FILE="docker-compose.test.yml"
  ;;
"qa")
  COMPOSE_FILE="docker-compose.qa.yml"
  ;;
*)
  echo "Unknown workspace: $WORKSPACE"
  exit 1
  ;;
esac

# Build and start the application
echo "Building and starting the application..."
sudo docker compose -f $COMPOSE_FILE build
sudo docker compose -f $COMPOSE_FILE up -d
