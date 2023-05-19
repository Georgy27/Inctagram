import { DeviceSession, Token } from '@prisma/client';
import { Injectable } from '@nestjs/common';

import { DeviceSessionsRepository } from 'src/deviceSessions/repositories/device-sessions.repository';

@Injectable()
export class DevicesSessionsService {
  public constructor(
    private readonly deviceSessionsRepository: DeviceSessionsRepository,
  ) {}

  public async manageDeviceSession(
    deviceId: string,
    payload: Pick<DeviceSession, 'ip' | 'deviceName'> &
      Pick<Token, 'accessTokenHash' | 'refreshTokenHash'> & { userId: string },
  ) {
    const { ip, accessTokenHash, refreshTokenHash, userId, deviceName } =
      payload;

    if (deviceId) {
      const isDeviceSession =
        await this.deviceSessionsRepository.findSessionByDeviceId(deviceId);

      if (isDeviceSession && isDeviceSession.userId === userId) {
        await this.deviceSessionsRepository.updateTokensByDeviceSessionId(
          deviceId,
          {
            accessTokenHash,
            refreshTokenHash,
          },
        );

        return;
      }
    }

    await this.deviceSessionsRepository.createNewDeviceSession(
      deviceId,
      userId,
      ip,
      deviceName,
      {
        accessTokenHash,
        refreshTokenHash,
      },
    );
  }
}
