import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
} from '@nestjs/common';
import { GLExtractService } from 'src/accounting/services/gl-extract.service';

@Controller('gl-extract')
export class GlExtractController {
  private readonly logger = new Logger(GlExtractController.name);

  constructor(private readonly glExtractService: GLExtractService) {}

  @Get()
  async getAllGlExtracts() {
    try {
      this.logger.log('Fetching all accounting journal records...');
      return await this.glExtractService.findAll();
    } catch (error) {
      this.logger.error(
        'Error fetching all accounting journal records:',
        error,
      );
      throw error;
    }
  }

  @Get('/:id')
  async getGlExtractById(@Param('id') id: string) {
    try {
      this.logger.log(`Fetching accounting journal record with ID: ${id}`);
      return this.glExtractService.findById(id);
    } catch (error) {
      this.logger.error(
        `Error fetching accounting journal record with ID ${id}:`,
        error,
      );
      throw error;
    }
  }

  @Delete('/:id')
  async deleteGlExtractById(@Param('id') id: string) {
    try {
      this.logger.log(`Deleting accounting journal record with ID: ${id}`);
      return this.glExtractService.deleteById(id);
    } catch (error) {
      this.logger.error(
        `Error deleting accounting journal record with ID ${id}:`,
        error,
      );
      throw error;
    }
  }

  @Post('/custom-query')
  async fetchGlExtractDataByQuery(@Body() { sqlQuery }: { sqlQuery: string }) {
    return this.glExtractService.getAccountingJournalDataByQuery(sqlQuery);
  }
}
