import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UserRepository } from './repositories/user.repository';

@Module({
  imports: [CqrsModule],
  controllers: [],
  providers: [UserRepository],
  exports: [UserRepository],
})
export class UserModule {}
