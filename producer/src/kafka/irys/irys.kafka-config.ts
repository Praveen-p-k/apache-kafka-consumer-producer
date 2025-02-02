import { KafkaConfig } from 'kafkajs';
import { config } from 'src/config';
import { createKafkaConfig } from 'src/kafka/kafka.base-config';
import { KafkaOptions } from '@nestjs/microservices';

const createKafkaClientConfig = (
  clientId: string,
  brokers: string[],
): KafkaConfig => {
  const sasl: KafkaConfig['sasl'] = {
    mechanism: 'plain',
    username: config.SASL_USERNAME,
    password: config.SASL_PASSWORD,
  };

  return {
    clientId,
    brokers,
    sasl,
    ssl: true,
  };
};

/**
 * Kafka Consumer Configuration for Listener Service
 */
export const irysKafkaConfig = (): KafkaOptions =>
  createKafkaConfig(
    config.LISTENER_CONSUMER_CLIENT_ID,
    config.IRYS_KAFKA_BROKER.split(','),
    createKafkaClientConfig,
  );
