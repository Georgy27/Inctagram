import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import {
  DeleteAllDevicesSessionsButActiveSwaggerDecorator,
  DeleteDeviceSessionSwaggerDecorator,
  GetAllDevicesSwaggerDecorator,
} from '../../common/decorators/swagger/device-sessions.decorator';
import { ApiTags } from '@nestjs/swagger';
import { AllUserDevicesWithActiveSessionsCommand } from '../use-cases/all-user-devices-with-active-sessions.use-case';
import { DeviceViewModel } from '../types';
import { DeleteAllDeviceSessionsButActiveCommand } from '../use-cases/delete-all-device-sessions-but-active.use-case';
import { DeleteDeviceSessionCommand } from '../use-cases/delete-device-session.use-case';
import { ActiveUser } from '../../common/decorators/active-user.decorator';
import { ActiveUserData } from '../../user/types';
import { JwtRtGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('DeviceSessions')
@Controller('/api/sessions/devices')
export class DeviceSessionsController {
  constructor(private commandBus: CommandBus) {}
  @UseGuards(JwtRtGuard)
  @Get()
  @GetAllDevicesSwaggerDecorator()
  async getAllDevicesForUserId(@ActiveUser() user: ActiveUserData) {
    return this.commandBus.execute<
      AllUserDevicesWithActiveSessionsCommand,
      Promise<DeviceViewModel[] | null>
    >(new AllUserDevicesWithActiveSessionsCommand(user));
  }

  @UseGuards(JwtRtGuard)
  @Delete()
  @DeleteAllDevicesSessionsButActiveSwaggerDecorator()
  @HttpCode(204)
  async deleteAllDevicesSessionsButActive(@ActiveUser() user: ActiveUserData) {
    return this.commandBus.execute(
      new DeleteAllDeviceSessionsButActiveCommand(user),
    );
  }

  @UseGuards(JwtRtGuard)
  @Delete(':deviceId')
  @DeleteDeviceSessionSwaggerDecorator()
  @HttpCode(204)
  async deleteDeviceSessionById(
    @Param('deviceId') deviceId: string,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.commandBus.execute(
      new DeleteDeviceSessionCommand(user, deviceId),
    );
  }
}
