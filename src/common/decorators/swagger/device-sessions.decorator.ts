import { applyDecorators } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { DeviceViewModel } from '../../../deviceSessions/types';

export function GetAllDevicesSwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Returns all devices with active sessions for the current user',
    }),
    ApiResponse({
      status: 200,
      description: 'Success',
      type: [DeviceViewModel],
    }),
    ApiUnauthorizedResponse({
      description:
        'JWT refreshToken inside cookie is missing, expired or incorrect',
    }),
    ApiCookieAuth(),
  );
}

export function DeleteAllDevicesSessionsButActiveSwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: "Terminate all other (except current) device's sessions",
    }),
    ApiResponse({
      status: 204,
      description: 'No Content',
    }),
    ApiUnauthorizedResponse({
      description:
        'JWT refreshToken inside cookie is missing, expired or incorrect',
    }),
    ApiCookieAuth(),
  );
}

export function DeleteDeviceSessionSwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Terminate specified device session',
    }),
    ApiResponse({
      status: 204,
      description: 'No Content',
    }),
    ApiUnauthorizedResponse({
      description:
        'JWT refreshToken inside cookie is missing, expired or incorrect',
    }),
    ApiForbiddenResponse({
      description: 'If try to delete the deviceId of other user',
    }),
    ApiNotFoundResponse({
      description: 'If the device session for the given deviceId not found',
    }),
    ApiCookieAuth(),
  );
}
