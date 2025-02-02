import { HttpService } from '@nestjs/axios';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { config } from 'src/config';

@Injectable()
export class AuthTokenService implements OnModuleInit {
  private readonly tokens: {
    accessToken: string | null;
    refreshToken: string | null;
    accessTokenExpiry: number;
    refreshTokenExpiry: number;
  } = {
    accessToken: null,
    refreshToken: null,
    accessTokenExpiry: 0,
    refreshTokenExpiry: 0,
  };

  constructor(private readonly httpService: HttpService) {}

  public async onModuleInit(): Promise<void> {
    await this.generateNewAccessToken();
  }

  /**
   * Checks whether the current access token is valid based on its expiry time.
   */
  public isAccessTokenValid(): boolean {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    return currentTimestamp < this.tokens.accessTokenExpiry;
  }

  /**
   * Checks whether the refresh token is valid based on its expiry time.
   */
  public isRefreshTokenValid(): boolean {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    return currentTimestamp < this.tokens.refreshTokenExpiry;
  }

  /**
   * Refreshes the access token using the refresh token.
   */
  public async refreshAccessToken(): Promise<void> {
    const response = await this.httpService.axiosRef.post(
      config.SXT_API_TOKEN_REFRESH_URL,
      { refreshToken: this.tokens.refreshToken },
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${this.tokens.refreshToken}`,
        },
      },
    );

    this.updateTokenData(response.data);
  }

  /**
   * Generates a new access token using the API key.
   */
  private async generateNewAccessToken(): Promise<void> {
    const response = await this.httpService.axiosRef.post(
      config.SXT_AUTH_BASE_URL,
      {},
      {
        headers: {
          apikey: config.SXT_API_KEY,
        },
      },
    );

    this.updateTokenData(response.data);
  }

  /**
   * Updates the token data and sets the expiration timestamps.
   */
  private updateTokenData(tokenData: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    refreshTokenExpiresIn: number;
  }): void {
    const currentTimestamp = Math.floor(Date.now() / 1000);

    this.tokens.accessToken = tokenData.accessToken;
    this.tokens.refreshToken = tokenData.refreshToken;
    this.tokens.accessTokenExpiry = currentTimestamp + tokenData.expiresIn;
    this.tokens.refreshTokenExpiry =
      currentTimestamp + tokenData.refreshTokenExpiresIn;
  }

  /**
   * Provides a valid access token. Generates or refreshes the token if necessary.
   */
  public async getAccessToken(): Promise<string> {
    if (this.isAccessTokenValid()) {
      return `Bearer ${this.tokens.accessToken}`;
    }

    if (this.isRefreshTokenValid()) {
      await this.refreshAccessToken();
    } else {
      await this.generateNewAccessToken();
    }

    return `Bearer ${this.tokens.accessToken}`;
  }
}
