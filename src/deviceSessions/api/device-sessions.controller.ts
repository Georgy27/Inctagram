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

@Controller('/api/sessions/devices')
export class DeviceSessionsController {
  constructor(private commandBus: CommandBus) {}
  @UseGuards(AuthGuard('jwt-refresh'))
  @Get()
  async getAllDevicesForUserId(
    @GetRtPayloadDecorator() rtPayload: RtPayload,
    @GetRtFromCookieDecorator() refreshToken: { refreshToken: string },
  ) {}

  @UseGuards(AuthGuard('jwt-refresh'))
  @Delete()
  @HttpCode(204)
  async deleteAllDevicesSessionsButActive(
    @GetRtPayloadDecorator() rtPayload: RtPayload,
    @GetRtFromCookieDecorator() refreshToken: { refreshToken: string },
  ) {}

  @UseGuards(AuthGuard('jwt-refresh'))
  @Delete(':deviceId')
  @HttpCode(204)
  async deleteDeviceSessionById(
    @Param('deviceId') deviceId: string,
    @GetRtPayloadDecorator() rtPayload: RtPayload,
    @GetRtFromCookieDecorator() refreshToken: { refreshToken: string },
  ) {}
}
