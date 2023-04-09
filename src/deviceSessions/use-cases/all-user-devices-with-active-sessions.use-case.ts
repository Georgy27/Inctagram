import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtAdaptor } from '../../adaptors/jwt/jwt.adaptor';
import { RtPayload } from '../../auth/strategies/types';
import { DeviceSessionsRepository } from '../repositories/device-sessions.repository';
import { DeviceViewModel } from '../types';

export class AllUserDevicesWithActiveSessionsCommand {
  constructor(public rtPayload: RtPayload, public refreshToken: string) {}
}

@CommandHandler(AllUserDevicesWithActiveSessionsCommand)
export class AllUserDevicesWithActiveSessionsUseCase
  implements ICommandHandler<AllUserDevicesWithActiveSessionsCommand>
{
  public constructor(
    private readonly jwtAdaptor: JwtAdaptor,
    private readonly deviceSessionsRepository: DeviceSessionsRepository,
  ) {}

  public async execute(
    command: AllUserDevicesWithActiveSessionsCommand,
  ): Promise<DeviceViewModel[] | null> {
    // validate
    await this.jwtAdaptor.validateTokens(
      command.refreshToken,
      command.rtPayload.deviceId,
    );
    return this.deviceSessionsRepository.findAllActiveSessions(
      command.rtPayload.userId,
    );
  }
}
