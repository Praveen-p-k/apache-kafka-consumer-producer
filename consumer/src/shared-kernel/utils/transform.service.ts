import { Injectable } from '@nestjs/common';

@Injectable()
export class TransformService {
  public transformKeysToUpperCase(
    inputRecord: Record<string, any>,
    columnsToInclude: string[],
  ): Record<string, any> {
    const transformedObj: Record<string, any> = {};
    const validKeys = new Set(columnsToInclude);

    for (const key in inputRecord) {
      if (inputRecord.hasOwnProperty(key) && validKeys.has(key)) {
        transformedObj[key.toUpperCase()] = inputRecord[key] ?? null;
      }
    }
    return transformedObj;
  }
}
