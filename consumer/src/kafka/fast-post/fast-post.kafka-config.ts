import { KafkaOptions, Transport } from '@nestjs/microservices';
import { config } from 'src/config';
import { KafkaConfig } from 'kafkajs';
import { createMechanism } from '@jm18457/kafkajs-msk-iam-authentication-mechanism';

// Helper function to create Kafka Client configuration dynamically
export const createFastPostKafkaClientConfig = (
  clientId: string,
  brokers: string[],
): KafkaConfig => {
  const baseConfig: KafkaConfig = {
    clientId,
    brokers,
  };

  return {
    ...baseConfig,
    sasl: createMechanism({
      region: config.AWS_REGION,
      credentials: {
        accessKeyId: config.SASL_ACCESS_KEY_ID,
        secretAccessKey: config.SASL_SECRET_ACCESS_KEY,
      },
    }),
    ssl: true,
  };
};

// Helper function to create Kafka Consumer configuration
const createKafkaConsumerConfig = (
  groupId: string,
): KafkaOptions['options']['consumer'] => ({
  groupId,
});

const createKafkaConfig = (
  clientId: string,
  brokers: string[],
  groupId: string,
): KafkaOptions => ({
  transport: Transport.KAFKA,
  options: {
    client: createFastPostKafkaClientConfig(clientId, brokers),
    consumer: createKafkaConsumerConfig(groupId),
    subscribe: {
      fromBeginning: true,
    },
  },
});

/**
 * Kafka Consumer Configuration for Fast Post Service
 */
export const fastPostKafkaConsumerConfig = (): KafkaOptions =>
  createKafkaConfig(
    config.LISTENER_CONSUMER_CLIENT_ID,
    config.FAST_POST_KAFKA_BROKER.split(','),
    config.LISTENER_CONSUMER_GROUP_ID,
  );
