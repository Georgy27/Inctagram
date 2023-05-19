import { ConfigType } from '@nestjs/config';
import {
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { ImageMetadataType } from 'src/common/types';
import { ImageService } from 'src/common/services/image.service';
import { githubOauthConfig } from 'src/config/github-oauth.config';

interface GithubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string;
}

interface UserData {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  firstName: string | null;
  lastName: string | null;
}

@Injectable()
export class GithubUsersService {
  public constructor(
    @Inject(githubOauthConfig.KEY)
    private readonly oauthConfig: ConfigType<typeof githubOauthConfig>,
    private readonly imagesService: ImageService,
  ) {}
  private async getGithubAccessToken(code: string) {
    const responseFromGithubTokenUrl = await fetch(
      `${this.oauthConfig.tokenUrl}?client_id=${this.oauthConfig.clientId}&client_secret=${this.oauthConfig.clientSecret}&code=${code}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
    );

    if (!responseFromGithubTokenUrl.ok) {
      throw new UnauthorizedException();
    }

    const { access_token } = await responseFromGithubTokenUrl.json();

    return access_token;
  }

  public async getGithubUserData(code: string): Promise<UserData> {
    const token = await this.getGithubAccessToken(code);

    const responseFromGithubUserUrl = await fetch(
      `${this.oauthConfig.userUrl}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        credentials: 'include',
      },
    );

    if (!responseFromGithubUserUrl.ok) {
      throw new UnauthorizedException();
    }

    const profile = <GithubUser>await responseFromGithubUserUrl.json();
    const { login, avatar_url: avatarUrl, name, id } = profile;

    const responseFromGithubUserEmailsUrl = await fetch(
      `${this.oauthConfig.userEmailsUrl}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        credentials: 'include',
      },
    );

    if (!responseFromGithubUserEmailsUrl.ok) {
      throw new UnauthorizedException();
    }

    const { email } = (await responseFromGithubUserEmailsUrl.json())[0];

    if (!email) throw new ForbiddenException('Email required');

    const [firstName = null, lastName = null] = name?.split(' ') || [];

    return {
      id: id.toString(),
      email,
      username: <string>login,
      avatarUrl: avatarUrl || null,
      firstName,
      lastName,
    };
  }

  public async getGithubUserAvatarMetadata(
    url: string,
  ): Promise<ImageMetadataType> {
    const response = await fetch(url);

    if (!response.ok) return { width: null, height: null, size: null };

    return this.imagesService.getMetadata(
      Buffer.from(await response.arrayBuffer()),
    );
  }
}
