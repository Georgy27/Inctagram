import { Module } from '@nestjs/common';
import { DeviceSessionsRepository } from './repositories/device-sessions.repository';
import { DeviceSessionsController } from './api/device-sessions.controller';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [CqrsModule],
  controllers: [DeviceSessionsController],
  providers: [DeviceSessionsRepository],
  exports: [DeviceSessionsRepository],
})
export class DeviceSessionsModule {}
