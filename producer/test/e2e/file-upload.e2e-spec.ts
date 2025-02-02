import { HttpStatus, INestApplication } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import request from 'supertest';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { KafkaProducerService } from 'src/irys-kafka/irys-kafka-producer.service';
import { FileUploadController } from 'src/file-upload/file-upload.controller';

describe('FileUploadController (e2e)', () => {
  let app: INestApplication;

  const mockKafkaProducerService = {
    produceMessage: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [FileUploadController],
      providers: [
        FileUploadService,
        { provide: KafkaProducerService, useValue: mockKafkaProducerService },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });

  it('/file/upload/single (POST) - File Missing', async () => {
    const response = await request(app.getHttpServer())
      .post('/file/upload/single')
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body.message).toEqual('File is required');
    expect(mockKafkaProducerService.produceMessage).not.toHaveBeenCalled();
  });

  it('/file/upload/single (POST) - Valid JSON File', async () => {
    const validFile = Buffer.from(JSON.stringify({ key: 'value' }));

    const response = await request(app.getHttpServer())
      .post('/file/upload/single')
      .attach('file', validFile, {
        filename: 'valid.json',
        contentType: 'application/json',
      })
      .expect(HttpStatus.CREATED);

    expect(response.body).toEqual({
      message: 'Single JSON file processed and sent to Kafka successfully',
      fileName: 'valid.json',
    });
  });

  it('/file/upload/multiple (POST) - Valid JSON Files', async () => {
    const file1 = Buffer.from(JSON.stringify({ key: 'value1' }));
    const file2 = Buffer.from(JSON.stringify({ key: 'value2' }));

    const response = await request(app.getHttpServer())
      .post('/file/upload/multiple')
      .attach('files', file1, {
        filename: 'file1.json',
        contentType: 'application/json',
      })
      .attach('files', file2, {
        filename: 'file2.json',
        contentType: 'application/json',
      })
      .expect(HttpStatus.CREATED);

    expect(response.body).toEqual({
      message: 'Multiple JSON files processed and sent to Kafka successfully',
      files: ['file1.json', 'file2.json'],
    });

    expect(mockKafkaProducerService.produceMessage).toHaveBeenCalledTimes(2);
  });

  it('/file/upload/multiple (POST) - No Files Uploaded', async () => {
    const response = await request(app.getHttpServer())
      .post('/file/upload/multiple')
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body.message).toEqual('At least one file is required');
    expect(mockKafkaProducerService.produceMessage).not.toHaveBeenCalled();
  });

  it('/file/upload/single (POST) - Invalid file format', async () => {
    const file = Buffer.from(JSON.stringify({ key: 'value' }));

    const response = await request(app.getHttpServer())
      .post('/file/upload/single')
      .attach('file', file, {
        filename: 'file.csv',
        contentType: 'application/json',
      })
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body.message).toBe(
      'Only JSON files are allowed! Ensure file extension is .json and MIME type is application/json.',
    );
  });

  it('/file/upload/single (POST) - Kafka error', async () => {
    const file = Buffer.from(JSON.stringify({ key: 'value' }));

    mockKafkaProducerService.produceMessage.mockRejectedValue(
      new Error('Kafka error'),
    );

    const response = await request(app.getHttpServer())
      .post('/file/upload/single')
      .attach('file', file, {
        filename: 'file.json',
        contentType: 'application/json',
      })
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body.message).toBe('Failed to process file');
    expect(mockKafkaProducerService.produceMessage).toHaveBeenCalledWith(
      JSON.stringify({ key: 'value' }),
    );
  });

  it('/file/upload/multiple (POST) - Partial failures', async () => {
    const file1 = Buffer.from(JSON.stringify({ key: 'file1' }));
    const file2 = Buffer.from(JSON.stringify({ key: 'file2' }));

    mockKafkaProducerService.produceMessage
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('Kafka error'));

    const response = await request(app.getHttpServer())
      .post('/file/upload/multiple')
      .attach('files', file1, {
        filename: 'file1.json',
        contentType: 'application/json',
      })
      .attach('files', file2, {
        filename: 'file2.json',
        contentType: 'application/json',
      })
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body.message).toBe('Failed to process files');
    expect(mockKafkaProducerService.produceMessage).toHaveBeenCalledTimes(2);
    expect(mockKafkaProducerService.produceMessage).toHaveBeenCalledWith(
      JSON.stringify({ key: 'file1' }),
    );
    expect(mockKafkaProducerService.produceMessage).toHaveBeenCalledWith(
      JSON.stringify({ key: 'file2' }),
    );
  });
});
