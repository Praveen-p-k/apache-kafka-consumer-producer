import { Module } from '@nestjs/common';
import { AppController } from 'src/app.controller';
import { AppService } from 'src/app.service';
import { KafkaModule } from 'src/kafka/kafka.module';
import { SharedModule } from 'src/shared-kernel/utils/shared.module';
import { AccountingModule } from 'src/accounting/accounting.module';
import { SocketClientModule } from 'src/socket-client/socket-client.module';

@Module({
  imports: [KafkaModule, SharedModule, AccountingModule, SocketClientModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
