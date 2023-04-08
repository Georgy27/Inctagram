import { Module } from '@nestjs/common';
import { JwtAdaptor } from './jwt/jwt.adaptor';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { BcryptAdaptor } from './bcrypt/bcrypt.adaptor';

@Module({
  imports: [UserModule, JwtModule.register({})],
  controllers: [],
  providers: [JwtAdaptor, BcryptAdaptor],
  exports: [JwtAdaptor, BcryptAdaptor],
})
export class AdaptorModule {}
