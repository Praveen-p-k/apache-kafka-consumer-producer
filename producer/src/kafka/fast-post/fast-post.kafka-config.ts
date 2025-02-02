import { KafkaConfig } from 'kafkajs';
import { config } from 'src/config';
import { createMechanism } from '@jm18457/kafkajs-msk-iam-authentication-mechanism';
import { createKafkaConfig } from 'src/kafka/kafka.base-config';
import { KafkaOptions } from '@nestjs/microservices';

const createKafkaClientConfig = (
  clientId: string,
  brokers: string[],
): KafkaConfig => {
  const sasl: KafkaConfig['sasl'] = createMechanism({
    region: config.FAST_POST_AWS_REGION,
    credentials: {
      accessKeyId: config.SASL_ACCESS_KEY_ID,
      secretAccessKey: config.SASL_SECRET_ACCESS_KEY,
    },
  });

  return {
    clientId,
    brokers,
    sasl,
    ssl: true,
  };
};

/**
 * Kafka Consumer Configuration for Fast Post Service
 */
export const fastPostKafkaConfig = (): KafkaOptions =>
  createKafkaConfig(
    config.LISTENER_CONSUMER_CLIENT_ID,
    config.FAST_POST_KAFKA_BROKER.split(','),
    createKafkaClientConfig,
  );
