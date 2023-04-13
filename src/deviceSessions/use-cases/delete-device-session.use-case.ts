import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { JwtAdaptor } from '../../adaptors/jwt/jwt.adaptor';
import { DeviceSessionsRepository } from '../repositories/device-sessions.repository';
import { ActiveUserData } from '../../user/types';

export class DeleteDeviceSessionCommand {
  constructor(public user: ActiveUserData, public deviceId: string) {}
}
@CommandHandler(DeleteDeviceSessionCommand)
export class DeleteDeviceSessionUseCase
  implements ICommandHandler<DeleteDeviceSessionCommand>
{
  constructor(
    private readonly jwtAdaptor: JwtAdaptor,
    private readonly deviceSessionsRepository: DeviceSessionsRepository,
  ) {}
  async execute(command: DeleteDeviceSessionCommand) {
    const isSession = await this.deviceSessionsRepository.findSessionByDeviceId(
      command.deviceId,
    );
    if (!isSession) throw new NotFoundException('Device is not found');

    if (isSession.userId !== command.user.userId)
      throw new ForbiddenException();

    await this.deviceSessionsRepository.deleteSessionByDeviceId(
      command.deviceId,
    );
  }
}
