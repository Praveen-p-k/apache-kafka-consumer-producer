import { Module } from '@nestjs/common';
import { ESBIntegratorService } from 'src/esb-integrator/esb-integrator.service';

@Module({
  providers: [ESBIntegratorService],
})
export class ESBIntegratorModule {}
