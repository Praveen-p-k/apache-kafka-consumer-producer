import { Injectable } from '@nestjs/common';
import { config } from 'src/config';
import { GlExtract } from 'src/accounting/interfaces/gl-extract.interface';
import { QueryBuilderService } from 'src/shared-kernel/utils/query-builder.service';
import { TransformService } from 'src/shared-kernel/utils/transform.service';
import { ACCOUNTING_TABLES } from '../accounting.constants';
import { SxTHelperService } from 'src/shared-kernel/utils/sxt-helper.service';

@Injectable()
export class GLExtractService {
  constructor(
    private readonly sxtHelperService: SxTHelperService,
    private readonly transformService: TransformService,
    private readonly queryBuilderService: QueryBuilderService,
  ) {}

  public insert(glExtract: GlExtract): Promise<any> {
    const insertData = this.transformService.transformKeysToUpperCase(
      glExtract,
      ACCOUNTING_TABLES.GL_EXTRACT_COLUMNS,
    );

    const sqlQuery = this.queryBuilderService.buildInsertQuery(
      config.GL_EXTRACT_RESOURCE_ID,
      insertData,
    );

    return this.sxtHelperService.insert(
      config.GL_EXTRACT_RESOURCE_ID,
      sqlQuery,
      [config.GL_EXTRACT_BISCUIT_TOKEN],
    );
  }

  public findAll(): Promise<GlExtract[]> {
    return this.sxtHelperService.findAll(config.GL_EXTRACT_RESOURCE_ID, [
      config.GL_EXTRACT_BISCUIT_TOKEN,
    ]);
  }

  public findById(id: string): Promise<GlExtract[]> {
    return this.sxtHelperService.findById(id, config.GL_EXTRACT_RESOURCE_ID, [
      config.GL_EXTRACT_BISCUIT_TOKEN,
    ]);
  }

  public deleteById(id: string) {
    return this.sxtHelperService.deleteById(id, config.GL_EXTRACT_RESOURCE_ID, [
      config.GL_EXTRACT_BISCUIT_TOKEN,
    ]);
  }

  public getAccountingJournalDataByQuery(sqlQuery: string) {
    return this.sxtHelperService.getDataByCustomQuery(
      config.GL_EXTRACT_RESOURCE_ID,
      sqlQuery,
      [config.GL_EXTRACT_BISCUIT_TOKEN],
    );
  }
}
