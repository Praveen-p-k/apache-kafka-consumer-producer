import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client, ClientKafka } from '@nestjs/microservices';
import { config } from 'src/config';
import { fastPostKafkaConfig } from './fast-post.kafka-config';

@Injectable()
export class FastPostKafkaProducerService implements OnModuleInit {
  @Client(fastPostKafkaConfig())
  private readonly kafkaClient: ClientKafka;

  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  async sendToFastPostCluster(message: any) {
    return this.kafkaClient.emit(
      config.FAST_POST_KAFKA_TOPIC,
      JSON.stringify(message),
    );
  }
}
