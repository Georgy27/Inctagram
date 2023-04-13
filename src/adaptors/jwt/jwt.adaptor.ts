import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon from 'argon2';
import { RtPayload } from '../../auth/strategies/types';
import { UserRepository } from '../../user/repositories/user.repository';
import { DeviceSessionsRepository } from '../../deviceSessions/repositories/device-sessions.repository';
@Injectable()
export class JwtAdaptor {
  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
    private userRepository: UserRepository,
    private deviceSessionsRepository: DeviceSessionsRepository,
  ) {}

  async getTokens(userId: string, userName: string, deviceId: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { userId, userName, deviceId },
        {
          secret: this.config.get<string>('AT_SECRET'),
          expiresIn: '1h',
        },
      ),
      this.jwtService.signAsync(
        { userId, userName, deviceId },
        {
          secret: this.config.get<string>('RT_SECRET'),
          expiresIn: '2h',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async updateTokensHash(tokens: {
    accessToken: string;
    refreshToken: string;
  }) {
    const accessTokenHash = await argon.hash(tokens.accessToken);
    const refreshTokenHash = await argon.hash(tokens.refreshToken);
    return {
      accessTokenHash,
      refreshTokenHash,
    };
  }
  async refreshToken(rtPayload: RtPayload, rt: { refreshToken: string }) {
    // // check if the token is valid
    await this.validateTokens(rt.refreshToken, rtPayload.deviceId);
    //  create new pair of tokens
    const tokens = await this.getTokens(
      rtPayload.userId,
      rtPayload.userName,
      rtPayload.deviceId,
    );
    const hashedTokens = await this.updateTokensHash(tokens);
    await this.deviceSessionsRepository.updateTokensByDeviceSessionId(
      rtPayload.deviceId,
      hashedTokens,
    );
    return tokens;
  }
  async validateTokens(refreshToken: string, deviceId: string) {
    const isJwt =
      await this.deviceSessionsRepository.findTokensByDeviceSessionId(deviceId);
    if (!isJwt)
      throw new UnauthorizedException(
        'token has expired or is no longer valid',
      );

    const rtMatches = await argon.verify(isJwt.refreshTokenHash, refreshToken);
    if (!rtMatches) throw new UnauthorizedException('Access denied');
    return true;
  }
}
