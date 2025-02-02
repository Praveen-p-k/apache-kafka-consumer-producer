import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsObject,
  IsUUID,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EsbIntegratorEventTypes } from '../constants';

// DTO for Event Data
class EventDataDto {
  @IsString()
  @IsNotEmpty()
  referenceId: string;

  @IsUUID()
  @IsNotEmpty()
  documentId: string;

  @IsString()
  @IsNotEmpty()
  namespaceName: string;
}

// DTO for Metadata
class MetadataDto {
  @IsString()
  @IsOptional()
  dataSize?: string;

  @IsString()
  @IsOptional()
  retryCount?: string;

  @IsString()
  @IsNotEmpty()
  activityType: string;

  @IsUUID()
  @IsNotEmpty()
  trackingId: string;
}

// DTO for Event Message
class EventMessageDto {
  @ValidateNested()
  @Type(() => EventDataDto)
  @IsObject()
  @IsOptional()
  data?: EventDataDto;

  @ValidateNested()
  @Type(() => MetadataDto)
  @IsObject()
  @IsOptional()
  metadata?: MetadataDto;
}

// DTO for Event Error
class EventErrorDto {
  @IsString()
  @IsOptional()
  errorDetail?: string;
}

// DTO for each Event Record
export class RagAiMessageDto {
  @IsString()
  @IsNotEmpty()
  eventVersion: string;

  @IsString()
  @IsNotEmpty()
  eventSource: string;

  @IsString()
  @IsNotEmpty()
  eventTime: string;

  @IsString()
  @IsNotEmpty()
  eventName: string;

  @IsString()
  @IsNotEmpty()
  eventType: string;

  @ValidateNested()
  @Type(() => EventMessageDto)
  @IsObject()
  @IsOptional()
  eventMessage?: EventMessageDto;

  @ValidateNested()
  @Type(() => EventErrorDto)
  @IsObject()
  @IsOptional()
  eventError?: EventErrorDto;
}

class RootMetadata {
  @IsEnum(EsbIntegratorEventTypes)
  @IsNotEmpty()
  eventType: EsbIntegratorEventTypes;
}

// DTO for Payload containing the records
class RagAiPayloadDto {
  @IsArray({ message: 'records must be an array' })
  @ValidateNested({ each: true })
  @Type(() => RagAiMessageDto) // Assuming RagAiMessageDto defines each record structure
  records: RagAiMessageDto[];
}

// Root DTO for the received message
export class RootMessageDto {
  @IsNumber()
  @Min(1)
  sourceNumber: number;

  @ValidateNested()
  @Type(() => RootMetadata)
  metadata: RootMetadata;

  @ValidateNested()
  @Type(() => RagAiPayloadDto)
  payload: RagAiPayloadDto;
}
