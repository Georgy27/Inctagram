import { AuthGuard } from '@nestjs/passport';

export class JwtAtGuard extends AuthGuard('jwt') {}
export class JwtRtGuard extends AuthGuard('jwt-refresh') {}
