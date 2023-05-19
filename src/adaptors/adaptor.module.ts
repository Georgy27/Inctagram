import { Module } from '@nestjs/common';
import { JwtAdaptor } from './jwt/jwt.adaptor';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { BcryptAdaptor } from './bcrypt/bcrypt.adaptor';
import { DeviceSessionsModule } from '../deviceSessions/device-sessions.module';
import { GoogleAuthAdaptor } from './google/google-auth.adaptor';

@Module({
  imports: [UserModule, DeviceSessionsModule, JwtModule.register({})],
  controllers: [],
  providers: [JwtAdaptor, BcryptAdaptor, GoogleAuthAdaptor],
  exports: [JwtAdaptor, BcryptAdaptor, GoogleAuthAdaptor],
})
export class AdaptorModule {}
