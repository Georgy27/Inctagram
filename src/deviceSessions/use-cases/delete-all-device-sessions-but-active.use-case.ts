import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtAdaptor } from '../../adaptors/jwt/jwt.adaptor';
import { DeviceSessionsRepository } from '../repositories/device-sessions.repository';
import { RtPayload } from '../../auth/strategies/types';

export class DeleteAllDeviceSessionsButActiveCommand {
  constructor(public rtPayload: RtPayload, public refreshToken: string) {}
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
    // validate
    await this.jwtAdaptor.validateTokens(
      command.refreshToken,
      command.rtPayload.deviceId,
    );
    return this.deviceSessionsRepository.deleteAllSessionsExceptCurrent(
      command.rtPayload.userId,
      command.rtPayload.deviceId,
    );
  }
}
