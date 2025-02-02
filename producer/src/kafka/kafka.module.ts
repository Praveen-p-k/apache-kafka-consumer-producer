import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { IrysKafkaProducerService } from './irys/irys-producer.service';
import { FastPostController } from './fast-post/fast-post.controller';
import { FastPostKafkaProducerService } from './fast-post/fast-post-producer.service';

@Module({
  controllers: [FastPostController],
  imports: [HttpModule],
  providers: [IrysKafkaProducerService, FastPostKafkaProducerService],
})
export class KafkaModule {}
