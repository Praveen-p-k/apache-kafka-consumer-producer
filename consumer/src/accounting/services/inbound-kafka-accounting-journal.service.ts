import { Injectable } from '@nestjs/common';
import { config } from 'src/config';
import { InboundKafkaAccountingJournal } from 'src/accounting/interfaces/inbound-kafka-accounting-journal.interface';
import { QueryBuilderService } from 'src/shared-kernel/utils/query-builder.service';
import { TransformService } from 'src/shared-kernel/utils/transform.service';
import { ACCOUNTING_TABLES } from '../accounting.constants';
import { SxTHelperService } from 'src/shared-kernel/utils/sxt-helper.service';

@Injectable()
export class InboundKafkaAccountingJournalService {
  constructor(
    private readonly sxtHelperService: SxTHelperService,
    private readonly transformService: TransformService,
    private readonly queryBuilderService: QueryBuilderService,
  ) {}

  public insert(
    accountingJournal: InboundKafkaAccountingJournal,
  ): Promise<any> {
    const insertData = this.transformService.transformKeysToUpperCase(
      accountingJournal,
      ACCOUNTING_TABLES.INBOUND_KAFKA_ACCOUNTING_JOURNAL_COLUMNS,
    );

    const sqlQuery = this.queryBuilderService.buildInsertQuery(
      config.INBOUND_KAFKA_ACCOUNTING_JOURNAL_RESOURCE_ID,
      insertData,
    );

    return this.sxtHelperService.insert(
      config.INBOUND_KAFKA_ACCOUNTING_JOURNAL_RESOURCE_ID,
      sqlQuery,
      [config.INBOUND_KAFKA_ACCOUNTING_JOURNAL_BISCUIT_TOKEN],
    );
  }

  public findAll(): Promise<InboundKafkaAccountingJournal[]> {
    return this.sxtHelperService.findAll(
      config.INBOUND_KAFKA_ACCOUNTING_JOURNAL_RESOURCE_ID,
      [config.INBOUND_KAFKA_ACCOUNTING_JOURNAL_BISCUIT_TOKEN],
    );
  }

  public findById(id: string): Promise<InboundKafkaAccountingJournal[]> {
    return this.sxtHelperService.findById(
      id,
      config.INBOUND_KAFKA_ACCOUNTING_JOURNAL_RESOURCE_ID,
      [config.INBOUND_KAFKA_ACCOUNTING_JOURNAL_BISCUIT_TOKEN],
    );
  }

  public deleteById(id: string) {
    return this.sxtHelperService.deleteById(
      id,
      config.INBOUND_KAFKA_ACCOUNTING_JOURNAL_RESOURCE_ID,
      [config.INBOUND_KAFKA_ACCOUNTING_JOURNAL_BISCUIT_TOKEN],
    );
  }

  public getAccountingJournalDataByQuery(sqlQuery: string) {
    return this.sxtHelperService.getDataByCustomQuery(
      config.INBOUND_KAFKA_ACCOUNTING_JOURNAL_RESOURCE_ID,
      sqlQuery,
      [config.INBOUND_KAFKA_ACCOUNTING_JOURNAL_BISCUIT_TOKEN],
    );
  }
}
