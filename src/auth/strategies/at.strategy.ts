import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ActiveUserData } from '../../user/types';
import { JwtAdaptor } from '../../adaptors/jwt/jwt.adaptor';
import { Request as RequestType } from 'express';

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService, private readonly jwtAdaptor: JwtAdaptor) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('AT_SECRET'),
      passReqToCallback: true,
    });
  }
  async validate(request: RequestType, payload: ActiveUserData) {
    const accessToken = request
      ?.get('authorization')
      ?.replace('Bearer', '')
      .trim();

    if (!accessToken) throw new ForbiddenException('Access token malformed');
    if (!payload) {
      throw new BadRequestException('invalid jwt token');
    }
    await this.jwtAdaptor.validateAtToken(accessToken, payload.deviceId);
    return payload;
  }
}
