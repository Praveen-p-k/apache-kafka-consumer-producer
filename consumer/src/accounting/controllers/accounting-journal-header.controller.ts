import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
} from '@nestjs/common';
import { AccountingJournalHeaderService } from 'src/accounting/services/accounting-journal-header.service';

@Controller('accounting-journal-header')
export class AccountingJournalHeaderController {
  private readonly logger = new Logger(AccountingJournalHeaderController.name);

  constructor(
    private readonly accountingJournalHeaderService: AccountingJournalHeaderService,
  ) {}

  @Get()
  async getAllAccountingJournalHeaders() {
    try {
      this.logger.log('Fetching all accounting journal records...');
      return await this.accountingJournalHeaderService.findAll();
    } catch (error) {
      this.logger.error(
        'Error fetching all accounting journal records:',
        error,
      );
      throw error;
    }
  }

  @Get('/:id')
  async getAccountingJournalHeaderById(@Param('id') id: string) {
    try {
      this.logger.log(`Fetching accounting journal record with ID: ${id}`);
      return this.accountingJournalHeaderService.findById(id);
    } catch (error) {
      this.logger.error(
        `Error fetching accounting journal record with ID ${id}:`,
        error,
      );
      throw error;
    }
  }

  @Delete('/:id')
  async deleteAccountingJournalHeaderById(@Param('id') id: string) {
    try {
      this.logger.log(`Deleting accounting journal record with ID: ${id}`);
      return this.accountingJournalHeaderService.deleteById(id);
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
    return this.accountingJournalHeaderService.getAccountingJournalDataByQuery(
      sqlQuery,
    );
  }
}
