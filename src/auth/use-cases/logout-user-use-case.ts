import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeviceSessionsRepository } from '../../deviceSessions/repositories/device-sessions.repository';

export class LogoutUserCommand {
  constructor(public deviceId: string) {}
}
@CommandHandler(LogoutUserCommand)
export class LogoutUserUseCase implements ICommandHandler<LogoutUserCommand> {
  constructor(
    private readonly deviceSessionsRepository: DeviceSessionsRepository,
  ) {}
  async execute(command: LogoutUserCommand) {
    return this.deviceSessionsRepository.deleteSessionByDeviceId(
      command.deviceId,
    );
  }
}
