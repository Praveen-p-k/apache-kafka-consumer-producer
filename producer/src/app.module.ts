import { Module } from '@nestjs/common';
import { AppController } from 'src/app.controller';
import { AppService } from 'src/app.service';
import { FileUploadModule } from 'src/file-upload/file-upload.module';
import { KafkaModule } from 'src/kafka/kafka.module';

@Module({
  imports: [FileUploadModule, KafkaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
