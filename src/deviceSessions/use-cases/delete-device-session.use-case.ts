import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { RtPayload } from '../../auth/strategies/types';
import { JwtAdaptor } from '../../adaptors/jwt/jwt.adaptor';
import { DeviceSessionsRepository } from '../repositories/device-sessions.repository';

export class DeleteDeviceSessionCommand {
  constructor(
    public rtPayload: RtPayload,
    public refreshToken: string,
    public deviceId: string,
  ) {}
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
    // validate token
    await this.jwtAdaptor.validateTokens(
      command.refreshToken,
      command.deviceId,
    );

    const isSession = await this.deviceSessionsRepository.findSessionByDeviceId(
      command.deviceId,
    );
    if (!isSession) throw new NotFoundException('Device is not found');

    if (isSession.userId !== command.rtPayload.userId)
      throw new ForbiddenException();

    await this.deviceSessionsRepository.deleteSessionByDeviceId(
      command.deviceId,
    );
  }
}
