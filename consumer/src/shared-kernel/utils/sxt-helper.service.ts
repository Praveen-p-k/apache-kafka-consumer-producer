import { Injectable } from '@nestjs/common';
import { AuthTokenService } from './auth-token.service';
import { config } from 'src/config';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class SxTHelperService {
  constructor(
    private readonly httpService: HttpService,
    private readonly authTokenService: AuthTokenService,
  ) {}

  public async insert(
    resource: string,
    sqlQuery: string,
    biscuits: string[],
  ): Promise<any> {
    const bearerToken = await this.authTokenService.getAccessToken();
    const payload = {
      resources: [`[${resource}]`],
      sqlText: sqlQuery,
      biscuits,
    };

    return this.sendRequest(payload, config.SXT_API_DML_PATH, bearerToken);
  }

  public async findById(
    id: string,
    resource: string,
    biscuits: string[],
  ): Promise<any> {
    const sqlQuery = `SELECT * FROM ${resource} WHERE ID='${id}'`;
    const payload = {
      resources: [`[${resource}]`],
      sqlText: sqlQuery,
      biscuits,
    };

    const bearerToken = await this.authTokenService.getAccessToken();
    const { data } = await this.sendRequest(
      payload,
      config.SXT_API_DQL_PATH,
      bearerToken,
    );
    return data;
  }

  public async findAll(resource: string, biscuits: string[]): Promise<any> {
    const sqlQuery = `SELECT * FROM ${resource}`;
    const payload = {
      resources: [`[${resource}]`],
      sqlText: sqlQuery,
      biscuits,
    };

    const bearerToken = await this.authTokenService.getAccessToken();
    const { data } = await this.sendRequest(
      payload,
      config.SXT_API_DQL_PATH,
      bearerToken,
    );
    return data;
  }

  public async deleteById(
    id: string,
    resource: string,
    biscuits: string[],
  ): Promise<any> {
    const sqlQuery = `DELETE FROM ${resource} WHERE ID='${id}'`;
    const payload = {
      sqlText: sqlQuery,
      biscuits,
      queryType: config.QUERY_TYPE,
      validate: true,
    };

    const bearerToken = await this.authTokenService.getAccessToken();
    const { data } = await this.sendRequest(
      payload,
      config.SXT_API_DDL_PATH,
      bearerToken,
    );
    return data;
  }

  public async getDataByCustomQuery(
    resource: string,
    sqlQuery: string,
    biscuits: string[],
  ): Promise<any> {
    const payload = {
      resources: [`[${resource}]`],
      sqlText: sqlQuery,
      biscuits,
    };

    const bearerToken = await this.authTokenService.getAccessToken();
    const { data } = await this.sendRequest(
      payload,
      config.SXT_API_DQL_PATH,
      bearerToken,
    );
    return data;
  }

  private sendRequest(payload: any, path: string, bearerToken: string) {
    return this.httpService.axiosRef.post(
      `${config.SXT_API_BASE_URL}${path}`,
      payload,
      {
        headers: {
          Accept: 'application/json',
          Authorization: bearerToken,
          'Content-Type': 'application/json',
        },
      },
    );
  }
}
