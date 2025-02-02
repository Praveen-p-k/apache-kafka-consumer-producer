import { Injectable } from '@nestjs/common';
import { config } from 'src/config';
import { AccountingJournalHeader } from 'src/accounting/interfaces/accounting-journal-header.interface';
import { TransformService } from 'src/shared-kernel/utils/transform.service';
import { QueryBuilderService } from 'src/shared-kernel/utils/query-builder.service';
import { ACCOUNTING_TABLES } from '../accounting.constants';
import { SxTHelperService } from 'src/shared-kernel/utils/sxt-helper.service';

@Injectable()
export class AccountingJournalHeaderService {
  constructor(
    private readonly sxtHelperService: SxTHelperService,
    private readonly transformService: TransformService,
    private readonly queryBuilderService: QueryBuilderService,
  ) {}

  public insert(
    accountingJournalHeader: AccountingJournalHeader,
  ): Promise<any> {
    const insertData = this.transformService.transformKeysToUpperCase(
      accountingJournalHeader,
      ACCOUNTING_TABLES.ACCOUNTING_JOURNAL_HEADER_COLUMNS,
    );

    const sqlQuery = this.queryBuilderService.buildInsertQuery(
      config.ACCOUNTING_JOURNAL_HEADER_RESOURCE_ID,
      insertData,
    );

    return this.sxtHelperService.insert(
      config.ACCOUNTING_JOURNAL_HEADER_RESOURCE_ID,
      sqlQuery,
      [config.ACCOUNTING_JOURNAL_HEADER_BISCUIT_TOKEN],
    );
  }

  public findAll(): Promise<AccountingJournalHeader[]> {
    return this.sxtHelperService.findAll(
      config.ACCOUNTING_JOURNAL_HEADER_RESOURCE_ID,
      [config.ACCOUNTING_JOURNAL_HEADER_BISCUIT_TOKEN],
    );
  }

  public findById(id: string): Promise<AccountingJournalHeader[]> {
    return this.sxtHelperService.findById(
      id,
      config.ACCOUNTING_JOURNAL_HEADER_RESOURCE_ID,
      [config.ACCOUNTING_JOURNAL_HEADER_BISCUIT_TOKEN],
    );
  }

  public deleteById(id: string) {
    return this.sxtHelperService.deleteById(
      id,
      config.ACCOUNTING_JOURNAL_HEADER_RESOURCE_ID,
      [config.ACCOUNTING_JOURNAL_HEADER_BISCUIT_TOKEN],
    );
  }

  public getAccountingJournalDataByQuery(sqlQuery: string) {
    return this.sxtHelperService.getDataByCustomQuery(
      config.ACCOUNTING_JOURNAL_HEADER_RESOURCE_ID,
      sqlQuery,
      [config.ACCOUNTING_JOURNAL_HEADER_BISCUIT_TOKEN],
    );
  }
}
