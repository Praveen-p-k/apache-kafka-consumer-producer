import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { IrysKafkaProducerService } from 'src/kafka/irys/irys-producer.service';

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);

  constructor(
    private readonly kafkaProducerService: IrysKafkaProducerService,
  ) {}

  async processSingleFile(file: Express.Multer.File): Promise<void> {
    const fileContent = file.buffer.toString('utf8');
    this.logger.log('Processing Single File Content:', fileContent);

    try {
      await this.kafkaProducerService.produceMessage(fileContent);
    } catch (error) {
      this.logger.error('Error sending message to Kafka:', error);
      throw new BadRequestException('Failed to send file to Kafka');
    }
  }

  async processMultipleFiles(files: Array<Express.Multer.File>): Promise<void> {
    const results = await Promise.allSettled(
      files.map((file) => this.processSingleFile(file)),
    );

    const errors = results
      .filter((result) => result.status === 'rejected')
      .map((result) => (result as PromiseRejectedResult).reason);

    if (errors.length > 0) {
      this.logger.error('Errors occurred while processing files:', errors);
      throw new Error(
        `Failed to process ${errors.length} file(s). Check logs for details.`,
      );
    }
  }
}
