import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

jest.mock('kafkajs', () => ({
  Kafka: jest.fn().mockImplementation(() => ({
    consumer: jest.fn().mockReturnValue({
      connect: jest.fn(),
      disconnect: jest.fn(),
      subscribe: jest.fn(),
      run: jest.fn(),
    }),
    producer: jest.fn().mockReturnValue({
      connect: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn(),
      send: jest.fn(),
      emit: jest.fn().mockResolvedValue({}),
    }),
  })),
}));

jest.mock('src/kafka/kafka-consumer.service', () => ({
  KafkaConsumerService: jest.fn().mockImplementation(() => ({
    onModuleInit: jest.fn(),
    createKafkaConfig: jest.fn(),
    initializeConsumer: jest.fn(),
    subscribeToTopic: jest.fn(),
    runConsumer: jest.fn(),
    processMessage: jest.fn().mockResolvedValue({}),
  })),
}));

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect({ status: 'Ok' });
  });
});
