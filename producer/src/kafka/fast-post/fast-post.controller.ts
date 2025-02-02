import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { FastPostKafkaProducerService } from './fast-post-producer.service';

@Controller('bpms/message')
export class FastPostController {
  constructor(
    private readonly fastPostKafkaProducerService: FastPostKafkaProducerService,
  ) {}

  @Post('/publish')
  @HttpCode(HttpStatus.CREATED)
  public async publishBPMSMessage(@Body() data: any) {
    await this.fastPostKafkaProducerService.sendToFastPostCluster(data);

    return {
      message: 'BPMS message successfully published to FastPost Kafka cluster',
    };
  }
}
