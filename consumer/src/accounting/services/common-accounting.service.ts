import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InboundKafkaAccountingJournalService } from 'src/accounting/services/inbound-kafka-accounting-journal.service';
import { InboundKafkaAccountingJournal } from 'src/accounting/interfaces/inbound-kafka-accounting-journal.interface';
import { AccountingJournalHeader } from 'src/accounting/interfaces/accounting-journal-header.interface';
import { AccountingJournalLine } from 'src/accounting/interfaces/accounting-journal-line.interface';
import { GlExtract } from 'src/accounting/interfaces/gl-extract.interface';
import { AccountingJournalHeaderService } from 'src/accounting/services/accounting-journal-header.service';
import { AccountingJournalLineService } from 'src/accounting/services/accounting-journal-line.service';
import { GLExtractService } from 'src/accounting/services/gl-extract.service';
import { ACCOUNTING_TABLES } from '../accounting.constants';

@Injectable()
export class CommonAccountingService {
  private readonly logger: Logger = new Logger(CommonAccountingService.name);

  constructor(
    @Inject(forwardRef(() => GLExtractService))
    private readonly glExtractService: GLExtractService,

    @Inject(forwardRef(() => AccountingJournalLineService))
    private readonly accountingJournalLineService: AccountingJournalLineService,

    @Inject(forwardRef(() => AccountingJournalHeaderService))
    private readonly accountingJournalHeaderService: AccountingJournalHeaderService,

    @Inject(forwardRef(() => InboundKafkaAccountingJournalService))
    private readonly inboundKafkaAccountingJournalService: InboundKafkaAccountingJournalService,
  ) {}

  private readonly messageTypes = [
    {
      service: this.inboundKafkaAccountingJournalService,
      validator: (message: InboundKafkaAccountingJournal) =>
        this.isInboundKafkaAccountingJournal(message),
    },
    {
      service: this.accountingJournalHeaderService,
      validator: (message: AccountingJournalHeader) =>
        this.isAccountingJournalHeader(message),
    },
    {
      service: this.accountingJournalLineService,
      validator: (message: AccountingJournalLine) =>
        this.isAccountingJournalLine(message),
    },
    {
      service: this.glExtractService,
      validator: (message: GlExtract) => this.isGlExtract(message),
    },
  ];

  private processMessageType(message: any, service: any) {
    this.logger.log(`Processing ${service.constructor.name} message...`);
    return service.insert(message);
  }

  private isInboundKafkaAccountingJournal(
    message: any,
  ): message is InboundKafkaAccountingJournal {
    return this.hasRequiredFields(
      message,
      ACCOUNTING_TABLES.INBOUND_KAFKA_ACCOUNTING_JOURNAL_COLUMNS,
    );
  }

  private isAccountingJournalHeader(
    message: any,
  ): message is AccountingJournalHeader {
    return this.hasRequiredFields(
      message,
      ACCOUNTING_TABLES.ACCOUNTING_JOURNAL_HEADER_COLUMNS,
    );
  }

  private isAccountingJournalLine(
    message: any,
  ): message is AccountingJournalLine {
    return this.hasRequiredFields(
      message,
      ACCOUNTING_TABLES.ACCOUNTING_JOURNAL_LINE_COLUMNS,
    );
  }

  private isGlExtract(message: any): message is GlExtract {
    return this.hasRequiredFields(
      message,
      ACCOUNTING_TABLES.GL_EXTRACT_COLUMNS,
    );
  }

  private hasRequiredFields(message: any, fields: string[]): boolean {
    return fields.every((field) => field in message);
  }

  public async processMessage(message: any): Promise<void> {
    try {
      const messageType = this.messageTypes.find(({ validator }) =>
        validator(message),
      );

      if (messageType) {
        await this.processMessageType(message, messageType.service);
        this.logger.log('Message processed successfully...');
      } else {
        this.logger.warn(
          'Received message does not match any known type:',
          JSON.stringify(message),
        );
      }
    } catch (error) {
      this.logger.error('Error processing message:', error);
    }
  }
}
