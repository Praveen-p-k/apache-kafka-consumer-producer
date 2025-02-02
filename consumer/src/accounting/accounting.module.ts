import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AccountingJournalHeaderController } from 'src/accounting/controllers/accounting-journal-header.controller';
import { AccountingJournalLineController } from 'src/accounting/controllers/accounting-journal-line.controller';
import { GlExtractController } from 'src/accounting/controllers/gl-extract.controller';
import { InboundKafkaAccountingJournalController } from 'src/accounting/controllers/inbound-kafka-accounting-journal.controller';
import { AccountingJournalHeaderService } from 'src/accounting/services/accounting-journal-header.service';
import { AccountingJournalLineService } from 'src/accounting/services/accounting-journal-line.service';
import { CommonAccountingService } from 'src/accounting/services/common-accounting.service';
import { GLExtractService } from 'src/accounting/services/gl-extract.service';
import { InboundKafkaAccountingJournalService } from 'src/accounting/services/inbound-kafka-accounting-journal.service';

@Module({
  imports: [HttpModule],
  controllers: [
    GlExtractController,
    AccountingJournalLineController,
    AccountingJournalHeaderController,
    InboundKafkaAccountingJournalController,
  ],
  providers: [
    GLExtractService,
    CommonAccountingService,
    AccountingJournalLineService,
    AccountingJournalHeaderService,
    InboundKafkaAccountingJournalService,
  ],
})
export class AccountingModule {}
