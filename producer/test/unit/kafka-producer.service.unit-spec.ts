import { Test, TestingModule } from '@nestjs/testing';
import { ClientKafka } from '@nestjs/microservices';
import { KafkaProducerService } from 'src/irys-kafka/irys-kafka-producer.service';
import { config } from 'src/config';
import { of } from 'rxjs';

jest.mock('@nestjs/microservices', () => ({
  ClientKafka: jest.fn().mockImplementation(() => ({
    subscribeToResponseOf: jest.fn(),
    connect: jest.fn(),
    emit: jest.fn(),
  })),
  ...jest.requireActual('@nestjs/microservices'),
  Transport: {
    KAFKA: 'kafka',
  },
}));

describe('KafkaProducerService', () => {
  let service: KafkaProducerService;
  let kafkaClientMock: jest.Mocked<ClientKafka>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KafkaProducerService],
    }).compile();

    service = module.get<KafkaProducerService>(KafkaProducerService);

    kafkaClientMock = {
      subscribeToResponseOf: jest.fn(),
      connect: jest.fn(),
      emit: jest.fn(),
    } as any;

    (service as any).kafkaClient = kafkaClientMock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should subscribe to Kafka topic and connect to Kafka client', async () => {
      kafkaClientMock.connect.mockResolvedValueOnce(null);
      kafkaClientMock.subscribeToResponseOf.mockImplementationOnce(() => {});

      await service.onModuleInit();

      expect(kafkaClientMock.subscribeToResponseOf).toHaveBeenCalledWith(
        config.KAFKA_TOPIC,
      );
      expect(kafkaClientMock.connect).toHaveBeenCalled();
    });
  });

  describe('produceMessage', () => {
    it('should emit a message to the Kafka topic', (done) => {
      const mockMessage = { key: 'value' };

      kafkaClientMock.emit.mockReturnValueOnce(of(null));

      service.produceMessage(mockMessage).then(() => {
        expect(kafkaClientMock.emit).toHaveBeenCalledWith(
          config.KAFKA_TOPIC,
          JSON.stringify(mockMessage),
        );
        done();
      });
    });
  });
});
