import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtAdaptor } from '../../adaptors/jwt/jwt.adaptor';
import { DeviceSessionsRepository } from '../repositories/device-sessions.repository';
import { ActiveUserData } from '../../user/types';

export class DeleteAllDeviceSessionsButActiveCommand {
  constructor(public user: ActiveUserData) {}
}
@CommandHandler(DeleteAllDeviceSessionsButActiveCommand)
export class DeleteAllDeviceSessionsButActiveUseCase
  implements ICommandHandler<DeleteAllDeviceSessionsButActiveCommand>
{
  constructor(
    private readonly jwtAdaptor: JwtAdaptor,
    private readonly deviceSessionsRepository: DeviceSessionsRepository,
  ) {}
  async execute(command: DeleteAllDeviceSessionsButActiveCommand) {
    return this.deviceSessionsRepository.deleteAllSessionsExceptCurrent(
      command.user.userId,
      command.user.deviceId,
    );
  }
}
