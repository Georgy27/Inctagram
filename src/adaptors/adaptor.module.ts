import { Module } from '@nestjs/common';
import { JwtAdaptor } from './jwt/jwt.adaptor';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule, JwtModule.register({})],
  controllers: [],
  providers: [JwtAdaptor],
  exports: [JwtAdaptor],
})
export class AdaptorModule {}
