import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { User } from '@prisma/client';
import { randomUUID } from 'crypto';
import {
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import Joi from 'joi';

import { OauthCommandData } from '../types';
import { OauthProvider } from 'src/common/constants';
import { JwtAdaptor } from '../../adaptors/jwt/jwt.adaptor';
import { DevicesSessionsService } from '../services/devices.service';
import { GithubUsersService } from '../services/github-users.service';
import { UserRepository } from '../../user/repositories/user.repository';

export class SignInWithGithubCommand {
  public constructor(public readonly data: OauthCommandData) {
    const schema = Joi.object({
      code: Joi.string().required(),
    });

    const { error } = schema.validate({ code: this.data.code });

    if (error) {
      throw new BadRequestException({ cause: error });
    }
  }
}

@CommandHandler(SignInWithGithubCommand)
export class SignInUserWithGithubUseCase
  implements ICommandHandler<SignInWithGithubCommand>
{
  public constructor(
    private readonly devicesSessionsService: DevicesSessionsService,
    private readonly githubUserService: GithubUsersService,
    private readonly userRepository: UserRepository,
    private readonly jwtAdaptor: JwtAdaptor,
  ) {}

  private readonly type = OauthProvider.GITHUB;

  public async execute(command: SignInWithGithubCommand) {
    try {
      const { code, ip, userAgent } = command.data;

      const githubUserData = await this.githubUserService.getGithubUserData(
        code,
      );

      const { email } = githubUserData;

      const user: Pick<User, 'username' | 'id' | 'email'> | null =
        await this.userRepository.findUserByEmail(email);

      const { id: clientId } = githubUserData;

      const oauthAccount = await this.userRepository.findOauthAccountByQuery({
        clientId,
        type: this.type,
      });

      if (!user || !oauthAccount || oauthAccount.userId !== user.id) {
        throw new ForbiddenException();
      }

      const deviceId = command.data.deviceId || randomUUID();

      const { id: userId, username } = user;

      const tokens = await this.jwtAdaptor.getTokens(
        userId,
        username,
        deviceId,
      );

      const { accessTokenHash, refreshTokenHash } =
        await this.jwtAdaptor.updateTokensHash(tokens);

      await this.devicesSessionsService.manageDeviceSession(deviceId, {
        ip,
        deviceName: userAgent,
        accessTokenHash,
        refreshTokenHash,
        userId,
      });

      return tokens;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
