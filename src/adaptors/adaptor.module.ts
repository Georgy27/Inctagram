import { Module } from '@nestjs/common';
import { JwtAdaptor } from './jwt/jwt.adaptor';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule.register({})],
  controllers: [],
  providers: [JwtAdaptor],
  exports: [JwtAdaptor],
})
export class AdaptorModule {}
