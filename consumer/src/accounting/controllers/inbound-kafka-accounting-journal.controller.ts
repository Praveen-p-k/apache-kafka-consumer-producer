import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
} from '@nestjs/common';
import { InboundKafkaAccountingJournalService } from 'src/accounting/services/inbound-kafka-accounting-journal.service';

@Controller('inbound-kafka-accounting-journal')
export class InboundKafkaAccountingJournalController {
  private readonly logger = new Logger(
    InboundKafkaAccountingJournalController.name,
  );

  constructor(
    private readonly inboundKafkaAccountingJournalService: InboundKafkaAccountingJournalService,
  ) {}

  @Get()
  async getAllAccountingJournals() {
    try {
      this.logger.log('Fetching all accounting journal records...');
      return await this.inboundKafkaAccountingJournalService.findAll();
    } catch (error) {
      this.logger.error(
        'Error fetching all accounting journal records:',
        error,
      );
      throw error;
    }
  }

  @Get('/:id')
  async getAccountingJournalById(@Param('id') id: string) {
    try {
      this.logger.log(`Fetching accounting journal record with ID: ${id}`);
      return this.inboundKafkaAccountingJournalService.findById(id);
    } catch (error) {
      this.logger.error(
        `Error fetching accounting journal record with ID ${id}:`,
        error,
      );
      throw error;
    }
  }

  @Delete('/:id')
  async deleteAccountingJournalById(@Param('id') id: string) {
    try {
      this.logger.log(`Deleting accounting journal record with ID: ${id}`);
      return await this.inboundKafkaAccountingJournalService.deleteById(id);
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
    return this.inboundKafkaAccountingJournalService.getAccountingJournalDataByQuery(
      sqlQuery,
    );
  }
}
