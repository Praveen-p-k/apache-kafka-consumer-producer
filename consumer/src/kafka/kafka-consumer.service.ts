import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Kafka, EachMessagePayload, Consumer } from 'kafkajs';
import { CommonAccountingService } from 'src/accounting/services/common-accounting.service';
import { config } from 'src/config';
import { SUPPORTED_KAFKA_CLIENTS } from 'src/kafka/kafka.constants';
import { ESBIntegratorService } from 'src/esb-integrator/esb-integrator.service';
import { createIrysKafkaClientConfig } from './irys/irys.kafka-config';
import { createFastPostKafkaClientConfig } from './fast-post/fast-post.kafka-config';

@Injectable()
export class KafkaConsumerService implements OnModuleInit {
  private readonly logger = new Logger(KafkaConsumerService.name);
  private readonly kafkaClients = new Map<string, Kafka>();
  private readonly consumerClients = new Map<string, Consumer>();

  constructor(
    private readonly esbIntegratorService: ESBIntegratorService,
    private readonly commonAccountingService: CommonAccountingService,
  ) {}

  async onModuleInit() {
    this.initializeKafkaClients();

    await this.initializeConsumers();
  }

  private initializeKafkaClients() {
    this.kafkaClients.set(
      SUPPORTED_KAFKA_CLIENTS.FAST_POST,
      new Kafka(
        createFastPostKafkaClientConfig(
          config.LISTENER_CONSUMER_CLIENT_ID,
          config.FAST_POST_KAFKA_BROKER.split(','),
        ),
      ),
    );

    this.kafkaClients.set(
      SUPPORTED_KAFKA_CLIENTS.IRYS,
      new Kafka(
        createIrysKafkaClientConfig(
          config.LISTENER_CONSUMER_CLIENT_ID,
          config.IRYS_KAFKA_BROKER.split(','),
        ),
      ),
    );
  }

  /**
   * Initialize Kafka consumers and subscribe to topics.
   */
  private async initializeConsumers() {
    for (const [key, kafkaClient] of this.kafkaClients) {
      const consumer = kafkaClient.consumer({
        groupId: config.LISTENER_CONSUMER_GROUP_ID,
      });

      const topic =
        key === SUPPORTED_KAFKA_CLIENTS.FAST_POST
          ? config.FAST_POST_KAFKA_TOPIC
          : config.IRYS_KAFKA_TOPIC;

      await consumer.connect();
      await consumer.subscribe({ topic, fromBeginning: true });

      this.consumerClients.set(key, consumer);
      await this.runConsumer(key, consumer);
    }

    this.logger.log('All Kafka consumers initialized and running.');
  }

  /**
   * Start the consumer and handle messages dynamically.
   */
  private async runConsumer(key: string, consumer: Consumer) {
    await consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        const message = await this.processMessage(payload);

        if (key === SUPPORTED_KAFKA_CLIENTS.FAST_POST && message) {
          this.logger.log(
            `Message received from FastPost: ${JSON.stringify(message)}`,
          );
          await this.commonAccountingService.processMessage(message);
        } else if (key === SUPPORTED_KAFKA_CLIENTS.IRYS && message) {
          this.logger.log(
            `Message received from Irys: ${JSON.stringify(message)}`,
          );
          await this.esbIntegratorService.processMessage(message);
        }
      },
    });
  }
  /**
   * Process incoming Kafka message.
   */
  private async processMessage({ message }: EachMessagePayload): Promise<any> {
    const messageValue = message.value?.toString();
    if (!messageValue) {
      this.logger.warn('Received empty message value');
      return null;
    }

    try {
      const event = this.parseMessage(messageValue);
      if (event !== null) {
        return event;
      } else {
        this.logger.warn('Invalid message format, skipping processing');
        return null;
      }
    } catch (error) {
      this.logger.error('Error processing Kafka message', error);
      return null;
    }
  }

  /**
   * Parse Kafka message as JSON or return raw string.
   */
  private parseMessage(value: string) {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
}
