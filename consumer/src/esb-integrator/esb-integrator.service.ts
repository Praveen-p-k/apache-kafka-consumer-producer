import { Injectable, Logger } from '@nestjs/common';
import { config } from 'src/config';
import { v4 as uuid } from 'uuid';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { WebSocketClientService } from 'src/socket-client/socket-client.service';
import {
  RagAiMessageDto,
  RootMessageDto,
} from 'src/esb-integrator/dto/esb-integrator-message.dto';
import { SxTHelperService } from 'src/shared-kernel/utils/sxt-helper.service';
import { QueryBuilderService } from 'src/shared-kernel/utils/query-builder.service';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class ESBIntegratorService {
  private readonly logger: Logger = new Logger(ESBIntegratorService.name);

  constructor(
    private readonly sxtHelperService: SxTHelperService,
    private readonly queryBuilderService: QueryBuilderService,
    private readonly webSocketClientService: WebSocketClientService,
    private readonly httpService: HttpService,
  ) {}

  public async insertRecord(integratorId: string, eventRecord: any) {
    const currentTimestamp = new Date()
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');
    const eventId = uuid();

    const baseRecordProps = {
      START_DATE: currentTimestamp,
      END_DATE: currentTimestamp,
      IS_CURRENT: true,
      CREATED_AT: currentTimestamp,
      LAST_MODIFIED_AT: null,
      LAST_MODIFIED_BY_ID: null,
    };

    const createRecord = (
      id: string,
      additionalProps: Record<string, any>,
    ) => ({
      ID: id,
      CREATED_BY_ID: id,
      ...baseRecordProps,
      ...additionalProps,
    });

    // Prepare Event Data
    const eventData = createRecord(eventId, {
      INTEGRATOR_ID: integratorId,
      EVENT_VERSION: eventRecord.eventVersion,
      EVENT_SOURCE: eventRecord.eventSource,
      EVENT_TIME: new Date(eventRecord.eventTime)
        .toISOString()
        .slice(0, 19)
        .replace('T', ' '),
      EVENT_NAME: eventRecord.eventName,
      EVENT_TYPE: eventRecord.eventType,
    });

    // Prepare Event Message Data
    const eventMessageId = uuid();
    const {
      eventMessage: {
        info: {
          data: { referenceId, documentId, namespaceName },
        },
      },
    } = eventRecord;

    const eventMessageData = createRecord(eventMessageId, {
      EVENT_ID: eventId,
      REFERENCE_ID: referenceId,
      DOCUMENT_ID: documentId,
      NAMESPACE_NAME: namespaceName,
    });

    // Prepare Event Metadata
    const eventMetadataId = uuid();
    const {
      eventMessage: {
        info: {
          metadata: { dataSize, retryCount, activityType, trackingId },
        },
      },
    } = eventRecord;

    const eventMetadata = createRecord(eventMetadataId, {
      EVENT_ID: eventId,
      DATA_SIZE: dataSize,
      RETRY_COUNT: retryCount,
      ACTIVITY_TYPE: activityType,
      TRACKING_ID: trackingId,
    });

    const resourceDataList = [
      {
        resourceId: config.ESB_EVENTS_RESOURCE_ID,
        data: eventData,
        biscuit: config.ESB_EVENTS_BISCUIT_TOKEN,
      },
      {
        resourceId: config.ESB_EVENT_MESSAGES_RESOURCE_ID,
        data: eventMessageData,
        biscuit: config.ESB_EVENT_MESSAGES_BISCUIT_TOKEN,
      },
      {
        resourceId: config.ESB_EVENT_METADATA_RESOURCE_ID,
        data: eventMetadata,
        biscuit: config.ESB_EVENT_METADATA_BISCUIT_TOKEN,
      },
    ];

    await Promise.all(
      resourceDataList.map(({ resourceId, data, biscuit }) => {
        const sqlQuery = this.queryBuilderService.buildInsertQuery(
          resourceId,
          data,
        );
        return this.sxtHelperService.insert(resourceId, sqlQuery, [biscuit]);
      }),
    );

    const { eventError: { errorDetail } = {} } = eventRecord;

    if (errorDetail) {
      const eventErrorId = uuid();

      // Prepare Event Error Data
      const eventErrorData = createRecord(eventErrorId, {
        EVENT_ID: eventId,
        ERROR_DETAIL: errorDetail ?? '',
      });

      const sqlQuery = this.queryBuilderService.buildInsertQuery(
        config.ESB_EVENT_ERRORS_RESOURCE_ID,
        eventErrorData,
      );

      await this.sxtHelperService.insert(
        config.ESB_EVENT_ERRORS_RESOURCE_ID,
        sqlQuery,
        [config.ESB_EVENT_ERRORS_BISCUIT_TOKEN],
      );
    }

    this.logger.log('Records inserted successfully');
  }

  public async processMessage(receivedData: any): Promise<void> {
    try {
      const {
        payload: {
          metadata,
          payload: { records },
          sourceNumber,
        },
      } = receivedData;

      if (this.isBackendOperation(metadata.eventType)) {
        try {
          const ragAiResponse = await this.httpService.axiosRef.post(
            config.ESB_RAG_AI_BACKEND_URL,
            receivedData.payload,
          );

          // Log the response status and any other relevant fields instead of the entire response
          this.logger.debug(`RAG AI: Response Status: ${ragAiResponse.status}`);
          this.logger.debug(`RAG AI: Response Data:`, ragAiResponse.data);

          // Send the processed message via WebSocket
          this.webSocketClientService.sendMessage({
            metadata: { ...metadata, trackingId: receivedData.trackingId },
            payload: ragAiResponse.data,
          });
        } catch (error: any) {
          this.logger.error(
            'Error occurred while processing RAG AI Backend Operation',
            error.message,
          );
          throw error;
        }
        return;
      }

      const validationErrors = await this.validatePayload(receivedData.payload);
      if (validationErrors.length > 0) {
        this.logValidationErrors(validationErrors);
        return;
      }

      const integratorId = await this.fetchIntegratorId(sourceNumber);
      if (!integratorId) {
        this.logger.error('Invalid source number provided.');
        return;
      }

      await this.processRecords(records, integratorId);

      this.webSocketClientService.sendMessage({
        metadata: { ...metadata, trackingId: receivedData.trackingId },
        payload: receivedData.payload,
      });
    } catch (error) {
      this.logger.error('Error occurred while processing the message:', error);
    }
  }

  private isBackendOperation(eventType: string): boolean {
    return eventType.toLowerCase().includes('backend_operation');
  }

  private async validatePayload(payload: any): Promise<any[]> {
    const messageInstance = plainToInstance(RootMessageDto, payload);
    return await validate(messageInstance);
  }

  private logValidationErrors(errors: any[]): void {
    this.logger.warn(
      'Validation failed for the received message:',
      JSON.stringify(errors),
    );
  }

  private async fetchIntegratorId(
    sourceNumber: string,
  ): Promise<string | undefined> {
    const sqlQuery = `SELECT ID FROM ${config.ESB_INTEGRATORS_RESOURCE_ID} WHERE INTEGRATOR_NUMBER=${sourceNumber}`;
    const result = await this.sxtHelperService.getDataByCustomQuery(
      config.ESB_INTEGRATORS_RESOURCE_ID,
      sqlQuery,
      [config.ESB_INTEGRATORS_BISCUIT_TOKEN],
    );
    return result[0]?.ID;
  }

  private async processRecords(
    records: RagAiMessageDto[],
    integratorId: string,
  ): Promise<void> {
    const tasks = records.map((record) => {
      if (record.eventType.includes('SpaceTimeDB_Interaction')) {
        return this.insertRecord(integratorId, record);
      }
      return undefined;
    });

    await Promise.all(tasks);
  }
}
