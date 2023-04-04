import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '../../user/repositories/user.repository';
import * as argon from 'argon2';
import { UnauthorizedException } from '@nestjs/common';
export class LogoutUserCommand {
  constructor(
    public userId: string,
    public refreshToken: { refreshToken: string },
  ) {}
}
@CommandHandler(LogoutUserCommand)
export class LogoutUserUseCase implements ICommandHandler<LogoutUserCommand> {
  constructor(private readonly userRepository: UserRepository) {}
  async execute(command: LogoutUserCommand) {
    const refreshToken = command.refreshToken.refreshToken;
    const isToken = await this.userRepository.findTokenByUserId(command.userId);
    if (!isToken || !isToken.refreshTokenHash || !isToken.accessTokenHash)
      throw new UnauthorizedException('Access denied');
    const rtMatches = await argon.verify(
      isToken.refreshTokenHash,
      refreshToken,
    );
    if (!rtMatches) throw new UnauthorizedException('Access denied');
    return this.userRepository.logout(command.userId);
  }
}
