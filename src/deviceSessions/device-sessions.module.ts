import { forwardRef, Module } from '@nestjs/common';
import { DeviceSessionsRepository } from './repositories/device-sessions.repository';
import { DeviceSessionsController } from './api/device-sessions.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { AllUserDevicesWithActiveSessionsUseCase } from './use-cases/all-user-devices-with-active-sessions.use-case';
import { AdaptorModule } from '../adaptors/adaptor.module';

const useCases = [AllUserDevicesWithActiveSessionsUseCase];
@Module({
  imports: [CqrsModule, forwardRef(() => AdaptorModule)],
  controllers: [DeviceSessionsController],
  providers: [DeviceSessionsRepository, ...useCases],
  exports: [DeviceSessionsRepository, ...useCases],
})
export class DeviceSessionsModule {}
