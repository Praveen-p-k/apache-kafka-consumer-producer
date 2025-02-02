import { Test, TestingModule } from '@nestjs/testing';
import { Consumer, EachMessagePayload, Kafka } from 'kafkajs';
import { Logger } from '@nestjs/common';
import { config } from 'src/config';
import { KafkaConsumerService } from 'src/kafka/kafka-consumer.service';
import { irysKafkaConsumerConfig } from 'src/kafka/kafka.config';

jest.mock('kafkajs', () => ({
  Kafka: jest.fn().mockImplementation(() => ({
    consumer: jest.fn().mockReturnValue({
      connect: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn().mockResolvedValue(undefined),
      subscribe: jest.fn().mockResolvedValue(undefined),
      run: jest.fn().mockResolvedValue(undefined),
    }),
  })),
  Consumer: jest.fn(),
}));

describe('KafkaConsumerService', () => {
  let service: KafkaConsumerService;
  let consumerMock: Consumer;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KafkaConsumerService],
    }).compile();

    service = module.get<KafkaConsumerService>(KafkaConsumerService);

    consumerMock = new Kafka({
      clientId: config.LISTENER_CONSUMER_CLIENT_ID,
      brokers: [config.IRYS_KAFKA_BROKER],
    }).consumer({
      ...irysKafkaConsumerConfig(),
      groupId: config.LISTENER_CONSUMER_GROUP_ID,
    });

    jest.spyOn(consumerMock, 'connect').mockResolvedValue(undefined);
    jest.spyOn(consumerMock, 'subscribe').mockResolvedValue(undefined);
    jest.spyOn(consumerMock, 'run').mockResolvedValue(undefined);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should initialize and connect the consumer on module init', async () => {
    jest.spyOn(consumerMock, 'connect').mockResolvedValue(undefined);
    jest.spyOn(consumerMock, 'subscribe').mockResolvedValue(undefined);
    jest.spyOn(consumerMock, 'run').mockResolvedValue(undefined);

    await service.onModuleInit();
  });

  it('should handle errors during initialization gracefully', async () => {
    jest.spyOn(Logger.prototype, 'error');

    jest
      .spyOn(consumerMock, 'connect')
      .mockRejectedValue(new Error('Connection failed'));

    await service.onModuleInit();
  });

  it('should process valid messages correctly', async () => {
    const logSpy = jest.spyOn(Logger.prototype, 'log');
    const warnSpy = jest.spyOn(Logger.prototype, 'warn');

    const mockMessage: EachMessagePayload = {
      message: {
        value: Buffer.from(JSON.stringify({ key: 'value' })),
        key: Buffer.from('key'),
        timestamp: 'timestamp',
        attributes: 0,
        offset: 'offset',
        headers: null,
      },
      topic: '',
      partition: 0,
      heartbeat: async () => {},
      pause: function (): () => void {
        throw new Error('Function not implemented.');
      },
    };

    await service['processMessage'](mockMessage);

    expect(logSpy).toHaveBeenCalledWith('Message consumed successfully', {
      key: 'value',
    });
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('should log a warning for empty message values', async () => {
    const warnSpy = jest.spyOn(Logger.prototype, 'warn');
    const mockMessage: EachMessagePayload = {
      message: {
        value: Buffer.from(''),
        key: Buffer.from('key'),
        timestamp: 'timestamp',
        attributes: 0,
        offset: 'offset',
        headers: null,
      },
      topic: '',
      partition: 0,
      heartbeat: async () => {},
      pause: () => undefined,
    };

    await service['processMessage'](mockMessage);

    expect(warnSpy).toHaveBeenCalledWith('Received empty message value');
  });

  it('should skip invalid messages and log a warning', async () => {
    const warnSpy = jest.spyOn(Logger.prototype, 'warn');
    const mockMessage: EachMessagePayload = {
      message: {
        value: Buffer.from('Invalid Message'),
        key: Buffer.from('key'),
        timestamp: 'timestamp',
        attributes: 0,
        offset: 'offset',
        headers: null,
      },
      topic: '',
      partition: 0,
      heartbeat: async () => {},
      pause: () => undefined,
    };

    const parseSpy = jest
      .spyOn(service as any, 'parseMessage')
      .mockReturnValueOnce(null);

    await service['processMessage'](mockMessage);

    expect(parseSpy).toHaveBeenCalledWith('Invalid Message');
    expect(warnSpy).toHaveBeenCalledWith(
      'Skipped processing - invalid message',
    );
  });

  it('should handle errors during message processing gracefully', async () => {
    const errorSpy = jest.spyOn(Logger.prototype, 'error');
    const mockMessage: EachMessagePayload = {
      message: {
        value: Buffer.from('{"key": "value"}'),
        key: Buffer.from('key'),
        timestamp: 'timestamp',
        attributes: 0,
        offset: 'offset',
        headers: null,
      },
      topic: '',
      partition: 0,
      heartbeat: async () => {},
      pause: () => undefined,
    };

    jest.spyOn(service as any, 'parseMessage').mockImplementationOnce(() => {
      throw new Error('Parse error');
    });

    await service['processMessage'](mockMessage);

    expect(errorSpy).toHaveBeenCalledWith(
      'Error processing message',
      expect.any(Error),
    );
  });
});
