import { Module } from '@nestjs/common';
import { TestingController } from './api/testing.controller';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [TestingController],
})
export class TestingModule {}
