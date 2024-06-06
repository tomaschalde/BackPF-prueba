import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class Auth0Service {
  private auth0Token: string = null;
  private tokenExpiryTime: number = null;

  private async fetchToken(): Promise<void> {
    const response = await axios.post(`https://dev-r34ulqlg6mkaafee.us.auth0.com/oauth/token`, {
      client_id: 'Tt1y2DI6R5aNCzY7wRrodth6msACmGBz',
      client_secret: 'o4QCuqVfAf0PqqpkWtOrxFHOlPthXUtTkcvZ-WiPQemK855_6U-tUTeZfrmwvc2O',
      audience: 'https://dev-r34ulqlg6mkaafee.us.auth0.com/api/v2/',
      grant_type: 'client_credentials'
    });

    const currentTime = Math.floor(Date.now() / 1000);
    this.auth0Token = response.data.access_token;
    this.tokenExpiryTime = currentTime + response.data.expires_in;
  }

  public async getToken(): Promise<string> {
    const currentTime = Math.floor(Date.now() / 1000);

    if (!this.auth0Token || !this.tokenExpiryTime || currentTime >= this.tokenExpiryTime) {
      await this.fetchToken();
    }

    return this.auth0Token;
  }
}
