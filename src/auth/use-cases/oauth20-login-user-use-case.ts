import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeviceSessionsRepository } from '../../deviceSessions/repositories/device-sessions.repository';
import { UserRepository } from '../../user/repositories/user.repository';
import { JwtAdaptor } from '../../adaptors/jwt/jwt.adaptor';
import {
  CreateUserWithOauthAccountData,
  Oauth20UserData,
} from '../../user/types';
import { GoogleAuthAdaptor } from '../../adaptors/google/google-auth.adaptor';
import { randomUUID } from 'crypto';
import { OauthCommandData } from '../types';
import Joi from 'joi';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { add } from 'date-fns';
import { OauthProvider } from '../../common/constants';
import { MailService } from '../../mail/mail.service';
import { User } from '@prisma/client';
import { DevicesSessionsService } from '../services/devices.service';

export class SignInWithGoogleCommand {
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
@CommandHandler(SignInWithGoogleCommand)
export class SignInUserWithGoogleUseCase
  implements ICommandHandler<SignInWithGoogleCommand>
{
  constructor(
    private readonly deviceSessionsRepository: DeviceSessionsRepository,
    private readonly userRepository: UserRepository,

    private readonly jwtAdaptor: JwtAdaptor,
    private readonly googleAuthAdaptor: GoogleAuthAdaptor,
    private readonly emailService: MailService,
    private readonly devicesSessionsService: DevicesSessionsService,
  ) {}

  private readonly type = OauthProvider.GOOGLE;
  async execute(command: SignInWithGoogleCommand) {
    try {
      const { code, ip, userAgent } = command.data;

      const { name, given_name, family_name, email, id } =
        await this.googleAuthAdaptor.validateUser(code);

      let user: Pick<User, 'username' | 'id' | 'email'> | null =
        await this.userRepository.findUserByEmail(email);

      if (!user) {
        const isUsernameInUse = await this.userRepository.findUserByUserName(
          name,
        );

        let uniqueUsername = name;

        if (isUsernameInUse) {
          uniqueUsername = await this.userRepository.createUniqueUsername(name);
        }

        const createUserData: CreateUserWithOauthAccountData = {
          email,
          clientId: id,
          name: given_name,
          surname: family_name,
          username: uniqueUsername,
          type: this.type,
        };

        user = await this.userRepository.createUserWithOauthAccount(
          createUserData,
        );
      } else {
        // if user exists already
        const existingOauthAccount =
          await this.userRepository.findOauthAccountByQuery({
            clientId: id,
            type: this.type,
          });

        if (!existingOauthAccount || !existingOauthAccount.linked) {
          const mergeCode = randomUUID();

          await this.userRepository.updateOrCreateOauthAccount({
            userId: user.id,
            mergeCode,
            clientId: id,
            type: this.type,
            mergeCodeExpDate: add(new Date(), { minutes: 10 }),
          });

          return this.emailService.sendAccountsMerge(user, code);
        }
      }
      // create tokens and session
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
