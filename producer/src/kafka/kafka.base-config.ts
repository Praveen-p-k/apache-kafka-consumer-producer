import { KafkaOptions, Transport } from '@nestjs/microservices';
import { KafkaConfig } from 'kafkajs';

// Base Kafka configuration generator
export const createKafkaConfig = (
  clientId: string,
  brokers: string[],
  callback: (clientId: string, brokers: string[]) => KafkaConfig,
): KafkaOptions => ({
  transport: Transport.KAFKA,
  options: {
    client: callback(clientId, brokers),
  },
});
