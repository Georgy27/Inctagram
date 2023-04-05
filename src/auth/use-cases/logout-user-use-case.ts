import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '../../user/repositories/user.repository';

import { JwtAdaptor } from '../../adaptors/jwt/jwt.adaptor';

export class LogoutUserCommand {
  constructor(
    public userId: string,
    public refreshToken: { refreshToken: string },
  ) {}
}
@CommandHandler(LogoutUserCommand)
export class LogoutUserUseCase implements ICommandHandler<LogoutUserCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtAdaptor: JwtAdaptor,
  ) {}
  async execute(command: LogoutUserCommand) {
    await this.jwtAdaptor.validateTokens(
      command.refreshToken.refreshToken,
      command.userId,
    );

    return this.userRepository.logout(command.userId);
  }
}
