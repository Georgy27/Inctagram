import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from '../../auth/dto/login.dto';
import { Token } from '@prisma/client';
import { DeviceViewModel } from '../types';

@Injectable()
export class DeviceSessionsRepository {
  constructor(private prisma: PrismaService) {}
  async createNewDeviceSession(
    deviceId: string,
    userId: string,
    ip: string,
    userAgent: string,
    hashedTokens: { accessTokenHash: string; refreshTokenHash: string },
  ) {
    try {
      await this.prisma.deviceSession.create({
        data: {
          ip,
          deviceName: userAgent,
          deviceId,
          userId,
          token: {
            create: {
              accessTokenHash: hashedTokens.accessTokenHash,
              refreshTokenHash: hashedTokens.refreshTokenHash,
            },
          },
        },
      });
    } catch (error) {
      console.log(error);
    }
  }
  async findTokensByDeviceSessionId(
    deviceSessionId: string,
  ): Promise<Token | null> {
    return this.prisma.token.findUnique({ where: { deviceSessionId } });
  }
  async updateTokensByDeviceSessionId(
    deviceSessionId: string,
    hashedTokens: { accessTokenHash: string; refreshTokenHash: string },
  ) {
    try {
      await this.prisma.token.update({
        where: { deviceSessionId },
        data: {
          accessTokenHash: hashedTokens.accessTokenHash,
          refreshTokenHash: hashedTokens.refreshTokenHash,
        },
      });
    } catch (error) {
      console.log(error);
    }
  }
  async deleteSessionByDeviceId(deviceId: string) {
    try {
      await this.prisma.deviceSession.delete({ where: { deviceId } });
    } catch (error) {
      console.log(error);
    }
  }
  async findAllActiveSessions(
    userId: string,
  ): Promise<DeviceViewModel[] | null> {
    return this.prisma.deviceSession.findMany({
      where: { userId },
      select: {
        ip: true,
        deviceName: true,
        lastActiveDate: true,
        deviceId: true,
      },
    });
  }
  async deleteAllSessionsExceptCurrent(userId: string, deviceId: string) {
    try {
      await this.prisma.deviceSession.deleteMany({
        where: { userId, NOT: [{ deviceId }] },
      });
    } catch (error) {
      console.log(error);
    }
  }
}
