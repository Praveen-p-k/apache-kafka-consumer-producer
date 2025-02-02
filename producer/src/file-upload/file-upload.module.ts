import { Module } from '@nestjs/common';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { FileUploadController } from 'src/file-upload/file-upload.controller';
import { IrysKafkaProducerService } from 'src/kafka/irys/irys-producer.service';

@Module({
  controllers: [FileUploadController],
  providers: [FileUploadService, IrysKafkaProducerService],
})
export class FileUploadModule {}
