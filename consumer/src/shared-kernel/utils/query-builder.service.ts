import { Injectable } from '@nestjs/common';

@Injectable()
export class QueryBuilderService {
  public buildInsertQuery(
    tableName: string,
    data: Record<string, any>,
  ): string {
    const columns = Object.keys(data).join(', ');
    const values = Object.values(data)
      .map((value) => this.formatValue(value))
      .join(', ');

    return `INSERT INTO ${tableName} (${columns}) VALUES (${values});`;
  }

  private formatValue(value: any): string {
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }

    if (!value || value === null || value === undefined) {
      return 'NULL';
    }

    if (typeof value === 'string') {
      return `'${value.replace(/'/g, "''")}'`;
    }

    if (typeof value === 'object') {
      return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
    }

    return value.toString();
  }
}
