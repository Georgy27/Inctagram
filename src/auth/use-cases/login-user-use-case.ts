import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtAdaptor } from '../../adaptors/jwt/jwt.adaptor';
import { UserRepository } from '../../user/repositories/user.repository';
import { LoginDto } from '../dto/login.dto';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { DeviceSessionsRepository } from '../../deviceSessions/repositories/device-sessions.repository';
export class LoginUserCommand {
  constructor(
    public loginDto: LoginDto,
    public ip: string,
    public userAgent: string,
  ) {}
}
@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
  constructor(
    private readonly userRepository: UserRepository,

    private readonly jwtAdaptor: JwtAdaptor,
    private readonly deviceSessionsRepository: DeviceSessionsRepository,
  ) {}
  async execute(command: LoginUserCommand) {
    // find user
    const user = await this.userRepository.findUserByEmail(
      command.loginDto.email,
    );
    if (!user)
      throw new UnauthorizedException(
        'User with the given email does not exist',
      );
    if (!user?.emailConfirmation?.isConfirmed)
      throw new UnauthorizedException(
        'Need to confirm an email in order to enter in the system',
      );
    const checkPassword = await bcrypt.compare(
      command.loginDto.password,
      user.hash,
    );
    if (!checkPassword)
      throw new UnauthorizedException('passwords do not match');
    // tokens
    const deviceId = randomUUID();
    const tokens = await this.jwtAdaptor.getTokens(
      user.id,
      user.userName,
      deviceId,
    );
    const hashedTokens = await this.jwtAdaptor.updateTokensHash(tokens);
    // create device session
    const newDeviceSession =
      await this.deviceSessionsRepository.createNewDeviceSession(
        deviceId,
        user.id,
        command.ip,
        command.userAgent,
        hashedTokens,
      );

    return tokens;
  }
}
