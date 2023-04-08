import { Module } from '@nestjs/common';
import { DeviceSessionsRepository } from './repositories/device-sessions.repository';

@Module({
  imports: [],
  controllers: [],
  providers: [DeviceSessionsRepository],
  exports: [DeviceSessionsRepository],
})
export class DeviceSessionsModule {}
