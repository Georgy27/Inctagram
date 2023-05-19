import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../../user/repositories/user.repository';
import { google, Auth } from 'googleapis';
import { googleOauthConfig } from '../../config/google-oauth.config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class GoogleAuthAdaptor {
  oauthClient: Auth.OAuth2Client;

  constructor(
    @Inject(googleOauthConfig.KEY)
    private readonly oauthConfig: ConfigType<typeof googleOauthConfig>,
    private userRepository: UserRepository,
  ) {
    this.oauthClient = new google.auth.OAuth2(
      this.oauthConfig.clientId,
      this.oauthConfig.clientSecret,
    );
  }

  async validateUser(code: string) {
    const { tokens } = await this.oauthClient.getToken(code);

    if (!tokens || !tokens.access_token)
      throw new UnauthorizedException('code provided is not valid');

    const googleUserData = await this.getUserData(tokens.access_token);
    const { name, given_name, family_name, email, id } = googleUserData;

    if (!name || !email || !id) throw new UnauthorizedException();

    return { name, given_name, family_name, email, id };
  }

  // private async getGoogleAccessToken(code: string) {
  //   const responseFromGoogleTokenUrl = await fetch(
  //     `${this.oauthConfig.tokenUrl}?client_id=${this.oauthConfig.clientId}&client_secret=${this.oauthConfig.clientSecret}&code=${code}`,
  //     {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Accept: 'application/json',
  //       },
  //     },
  //   );
  //
  //   if (!responseFromGoogleTokenUrl.ok) {
  //     throw new UnauthorizedException();
  //   }
  //
  //   const { access_token } = await responseFromGoogleTokenUrl.json();
  //
  //   return access_token;
  // }

  private async getUserData(token: string) {
    const userInfoClient = google.oauth2('v2').userinfo;

    this.oauthClient.setCredentials({
      access_token: token,
    });

    const userInfoResponse = await userInfoClient.get({
      auth: this.oauthClient,
    });

    return userInfoResponse.data;
  }
}
