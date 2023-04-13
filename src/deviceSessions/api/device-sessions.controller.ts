import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { AuthGuard } from '@nestjs/passport';
import { GetRtPayloadDecorator } from '../../common/decorators/jwt/getRtPayload.decorator';
import { RtPayload } from '../../auth/strategies/types';
import { GetRtFromCookieDecorator } from '../../common/decorators/jwt/getRtFromCookie.decorator';
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

@ApiTags('DeviceSessions')
@Controller('/api/sessions/devices')
export class DeviceSessionsController {
  constructor(private commandBus: CommandBus) {}
  @UseGuards(AuthGuard('jwt-refresh'))
  @Get()
  @GetAllDevicesSwaggerDecorator()
  async getAllDevicesForUserId(
    @GetRtPayloadDecorator() rtPayload: RtPayload,
    @GetRtFromCookieDecorator() refreshToken: { refreshToken: string },
  ) {
    return this.commandBus.execute<
      AllUserDevicesWithActiveSessionsCommand,
      Promise<DeviceViewModel[] | null>
    >(
      new AllUserDevicesWithActiveSessionsCommand(
        rtPayload,
        refreshToken.refreshToken,
      ),
    );
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Delete()
  @DeleteAllDevicesSessionsButActiveSwaggerDecorator()
  @HttpCode(204)
  async deleteAllDevicesSessionsButActive(
    @GetRtPayloadDecorator() rtPayload: RtPayload,
    @GetRtFromCookieDecorator() refreshToken: { refreshToken: string },
  ) {
    return this.commandBus.execute(
      new DeleteAllDeviceSessionsButActiveCommand(
        rtPayload,
        refreshToken.refreshToken,
      ),
    );
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Delete(':deviceId')
  @DeleteDeviceSessionSwaggerDecorator()
  @HttpCode(204)
  async deleteDeviceSessionById(
    @Param('deviceId') deviceId: string,
    @GetRtPayloadDecorator() rtPayload: RtPayload,
    @GetRtFromCookieDecorator() refreshToken: { refreshToken: string },
  ) {
    return this.commandBus.execute(
      new DeleteDeviceSessionCommand(
        rtPayload,
        refreshToken.refreshToken,
        deviceId,
      ),
    );
  }
}
