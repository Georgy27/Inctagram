import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtAdaptor } from '../../adaptors/jwt/jwt.adaptor';
import { DeviceSessionsRepository } from '../repositories/device-sessions.repository';
import { DeviceViewModel } from '../types';
import { ActiveUserData } from '../../user/types';

export class AllUserDevicesWithActiveSessionsCommand {
  constructor(public user: ActiveUserData) {}
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
    return this.deviceSessionsRepository.findAllActiveSessions(
      command.user.userId,
      command.user.deviceId,
    );
  }
}
