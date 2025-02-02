import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client, ClientKafka } from '@nestjs/microservices';
import { config } from 'src/config';
import { irysKafkaConfig } from './irys.kafka-config';

@Injectable()
export class IrysKafkaProducerService implements OnModuleInit {
  @Client(irysKafkaConfig())
  private readonly kafkaClient: ClientKafka;

  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  async produceMessage(message: any) {
    return this.kafkaClient.emit(
      config.IRYS_KAFKA_TOPIC,
      JSON.stringify(message),
    );
  }
}
