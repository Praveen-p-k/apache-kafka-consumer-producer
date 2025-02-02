import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AccountingJournalHeaderService } from 'src/accounting/services/accounting-journal-header.service';
import { AccountingJournalLineService } from 'src/accounting/services/accounting-journal-line.service';
import { CommonAccountingService } from 'src/accounting/services/common-accounting.service';
import { GLExtractService } from 'src/accounting/services/gl-extract.service';
import { InboundKafkaAccountingJournalService } from 'src/accounting/services/inbound-kafka-accounting-journal.service';
import { KafkaConsumerService } from 'src/kafka/kafka-consumer.service';
import { ESBIntegratorService } from 'src/esb-integrator/esb-integrator.service';
import { WebSocketClientService } from 'src/socket-client/socket-client.service';

@Module({
  imports: [HttpModule],
  providers: [
    ESBIntegratorService,
    GLExtractService,
    KafkaConsumerService,
    WebSocketClientService,
    CommonAccountingService,
    AccountingJournalLineService,
    AccountingJournalHeaderService,
    InboundKafkaAccountingJournalService,
  ],
})
export class KafkaModule {}
