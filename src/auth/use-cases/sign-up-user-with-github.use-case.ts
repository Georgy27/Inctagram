import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { User } from '@prisma/client';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';
import Joi from 'joi';

import type { OauthCommandData } from '../types';
import { MailService } from 'src/mail/mail.service';
import { OauthProvider } from 'src/common/constants';
import { JwtAdaptor } from '../../adaptors/jwt/jwt.adaptor';
import { DevicesSessionsService } from '../services/devices.service';
import { GithubUsersService } from '../services/github-users.service';
import { UserRepository } from '../../user/repositories/user.repository';
import { AvatarPayload, CreateUserWithOauthAccountData } from 'src/user/types';

export class SignUpWithGithubCommand {
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

@CommandHandler(SignUpWithGithubCommand)
export class SignUpUserWithGithubUseCase
  implements ICommandHandler<SignUpWithGithubCommand>
{
  public constructor(
    private readonly devicesSessionsService: DevicesSessionsService,
    private readonly githubUserService: GithubUsersService,
    private readonly userRepository: UserRepository,
    private readonly emailService: MailService,
    private readonly jwtAdaptor: JwtAdaptor,
  ) {}

  private readonly type = OauthProvider.GITHUB;

  public async execute(command: SignUpWithGithubCommand) {
    try {
      const { code, ip, userAgent } = command.data;

      const githubUserData = await this.githubUserService.getGithubUserData(
        code,
      );

      const { email } = githubUserData;

      let user: Pick<User, 'username' | 'id' | 'email'> | null =
        await this.userRepository.findUserByEmail(email);

      const { id: clientId } = githubUserData;

      if (!user) {
        const { username, avatarUrl, firstName, lastName } = githubUserData;

        const isUsernameInUse = await this.userRepository.findUserByUserName(
          username,
        );

        let uniqueUsername = username;

        if (isUsernameInUse) {
          uniqueUsername = await this.userRepository.createUniqueUsername(
            username,
          );
        }

        let avatarPayload: AvatarPayload | null = null;

        if (avatarUrl) {
          const avatarMetdata =
            await this.githubUserService.getGithubUserAvatarMetadata(avatarUrl);

          avatarPayload = {
            url: avatarUrl,
            previewUrl: avatarUrl,
            ...avatarMetdata,
          };
        }

        const createUserData: CreateUserWithOauthAccountData = {
          email,
          clientId,
          name: firstName,
          surname: lastName,
          username: uniqueUsername,
          type: this.type,
        };

        if (avatarPayload) {
          createUserData.avatarPayload = avatarPayload;
        }

        user = await this.userRepository.createUserWithOauthAccount(
          createUserData,
        );
      } else {
        const existingOauthAccount =
          await this.userRepository.findOauthAccountByQuery({
            clientId,
            type: this.type,
          });

        if (!existingOauthAccount || !existingOauthAccount.linked) {
          const mergeCode = randomUUID();

          await this.userRepository.updateOrCreateOauthAccount({
            userId: user.id,
            mergeCode,
            clientId,
            type: this.type,
            mergeCodeExpDate: add(new Date(), { minutes: 10 }),
          });

          return this.emailService.sendAccountsMerge(user, code);
        }
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
