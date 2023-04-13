import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtAdaptor } from '../../adaptors/jwt/jwt.adaptor';
import { DeviceSessionsRepository } from '../../deviceSessions/repositories/device-sessions.repository';

export class LogoutUserCommand {
  constructor(
    public deviceId: string,
    public refreshToken: { refreshToken: string },
  ) {}
}
@CommandHandler(LogoutUserCommand)
export class LogoutUserUseCase implements ICommandHandler<LogoutUserCommand> {
  constructor(
    private readonly deviceSessionsRepository: DeviceSessionsRepository,
    private readonly jwtAdaptor: JwtAdaptor,
  ) {}
  async execute(command: LogoutUserCommand) {
    await this.jwtAdaptor.validateTokens(
      command.refreshToken.refreshToken,
      command.deviceId,
    );

    return this.deviceSessionsRepository.deleteSessionByDeviceId(
      command.deviceId,
    );
  }
}
