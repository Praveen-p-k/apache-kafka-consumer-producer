import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
} from '@nestjs/common';
import { AccountingJournalLineService } from 'src/accounting/services/accounting-journal-line.service';

@Controller('accounting-journal-line')
export class AccountingJournalLineController {
  private readonly logger = new Logger(AccountingJournalLineController.name);

  constructor(
    private readonly accountingJournalLineService: AccountingJournalLineService,
  ) {}

  @Get()
  async getAllAccountingJournalLines() {
    try {
      this.logger.log('Fetching all accounting journal records...');
      return await this.accountingJournalLineService.findAll();
    } catch (error) {
      this.logger.error(
        'Error fetching all accounting journal records:',
        error,
      );
      throw error;
    }
  }

  @Get('/:id')
  async getAccountingJournalLineById(@Param('id') id: string) {
    try {
      this.logger.log(`Fetching accounting journal record with ID: ${id}`);
      return this.accountingJournalLineService.findById(id);
    } catch (error) {
      this.logger.error(
        `Error fetching accounting journal record with ID ${id}:`,
        error,
      );
      throw error;
    }
  }

  @Delete('/:id')
  async deleteAccountingJournalLineById(@Param('id') id: string) {
    try {
      this.logger.log(`Deleting accounting journal record with ID: ${id}`);
      return this.accountingJournalLineService.deleteById(id);
    } catch (error) {
      this.logger.error(
        `Error deleting accounting journal record with ID ${id}:`,
        error,
      );
      throw error;
    }
  }

  @Post('/custom-query')
  async fetchAccountingJournalDataByQuery(
    @Body() { sqlQuery }: { sqlQuery: string },
  ) {
    return this.accountingJournalLineService.getAccountingJournalDataByQuery(
      sqlQuery,
    );
  }
}
