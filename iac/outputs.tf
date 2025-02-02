output "bastion_instance_ip" {
  description = "The public IP address of the bastion instance."
  value       = module.bastion.bastion_instance_ip
}

# output "consumer_instance_ip" {
#   description = "The private IP address of the consumer instance."
#   value       = module.consumer.consumer_instance_ip
# }

# output "producer_instance_ip" {
#   description = "The private IP address of the producer instance."
#   value       = module.producer.producer_instance_ip
# }

output "private_subnet_id" {
  description = "The ID of the private subnet."
  value       = module.network.private_subnet_id
}

output "public_subnet_id" {
  description = "The ID of the public subnet."
  value       = module.network.public_subnet_id
}

output "kafka_cluster_id" {
  description = "The Kafka cluster ID."
  value       = google_managed_kafka_cluster.kafka_cluster.id
}

output "vpc_name" {
  value = var.vpc_name
}
