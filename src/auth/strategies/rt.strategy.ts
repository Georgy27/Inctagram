import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { RtPayload } from './types';
import { Request as RequestType } from 'express';
import { JwtAdaptor } from '../../adaptors/jwt/jwt.adaptor';
@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService, private jwtAdaptor: JwtAdaptor) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        RtStrategy.extractJWT,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('RT_SECRET'),
    });
  }
  async validate(payload: RtPayload) {
    return payload;
  }

  private static extractJWT(req: RequestType): string | null {
    let token = null;
    if (req.cookies && req.cookies.refreshToken) {
      token = req.cookies['refreshToken'];
    }

    return token;
  }
}
