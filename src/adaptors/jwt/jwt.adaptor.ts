import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAdaptor {
  constructor(private jwtService: JwtService, private config: ConfigService) {}

  async getTokens(userId: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { userId },
        {
          secret: this.config.get<string>('JWT_AT_SECRET'),
          expiresIn: '1h',
        },
      ),
      this.jwtService.signAsync(
        { userId },
        {
          secret: this.config.get<string>('JWT_RT_SECRET'),
          expiresIn: '2h',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async getIssuedAtFromRefreshToken(refreshToken: string) {
    const decodedToken: any = await this.jwtService.decode(refreshToken);
    const issuedAt = new Date(decodedToken.iat * 1000).toISOString();
    return issuedAt;
  }
}
