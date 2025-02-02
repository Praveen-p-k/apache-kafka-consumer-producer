import {
  BadRequestException,
  Controller,
  Logger,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import { FileUploadService } from 'src/file-upload/file-upload.service';

@Controller('file')
export class FileUploadController {
  private readonly logger = new Logger(FileUploadController.name);

  constructor(private readonly fileProcessingService: FileUploadService) {}

  private static jsonFileFilter(
    _: any,
    file: { originalname: string; mimetype: string },
    callback: (arg0: BadRequestException, arg1: boolean) => void,
  ) {
    console.log(
      `File Details - Original Name: ${file.originalname}, MIME Type: ${file.mimetype}`,
    );

    const isJsonMime = file.mimetype === 'application/json';
    const isJsonExt = path.extname(file.originalname).toLowerCase() === '.json';

    if (!isJsonMime || !isJsonExt) {
      return callback(
        new BadRequestException(
          'Only JSON files are allowed! Ensure file extension is .json and MIME type is application/json.',
        ),
        false,
      );
    }
    callback(null, true);
  }

  @Post('upload/single')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: FileUploadController.jsonFileFilter,
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    try {
      await this.fileProcessingService.processSingleFile(file);
    } catch (error) {
      this.logger.error('Error processing file:', error);
      throw new BadRequestException('Failed to process file');
    }

    return {
      message: 'Single JSON file processed and sent to Kafka successfully',
      fileName: file.originalname,
    };
  }

  @Post('upload/multiple')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      fileFilter: FileUploadController.jsonFileFilter,
    }),
  )
  async multipleFilesUpload(
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one file is required');
    }

    try {
      await this.fileProcessingService.processMultipleFiles(files);
    } catch (error) {
      this.logger.error('Error processing files:', error);
      throw new BadRequestException('Failed to process files');
    }

    return {
      message: 'Multiple JSON files processed and sent to Kafka successfully',
      files: files.map((file) => file.originalname),
    };
  }
}
