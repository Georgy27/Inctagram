import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthDto } from '../dto/auth.dto';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('/api/auth')
export class AuthController {
  constructor() {}

  @Post('registration')
  @ApiBody({ type: AuthDto })
  @ApiResponse({
    status: 204,
    description:
      'Input data is accepted. Email with confirmation code will be send to passed email address',
  })
  // @ApiBadRequestResponse({
  //   description:
  //     'If the inputModel has incorrect values (in particular if the user with the given email or password already exists)',
  //   type: APIErrorResult,
  // })
  @HttpCode(204)
  async registration(@Body() authDto: AuthDto) {}
  @Post('registration-confirmation')
  @HttpCode(204)
  async registrationConfirmation() {}
  @Post('registration-email-resending')
  @HttpCode(204)
  async registrationEmailResending() {}
  @Post('login')
  @HttpCode(200)
  async login() {}
  @Post('logout')
  @HttpCode(204)
  async logout() {}
  @Post('refresh-token')
  @HttpCode(200)
  async refreshToken() {}
  @Post('password-recovery')
  @HttpCode(204)
  async passwordRecovery() {}
  @Post('new-password')
  @HttpCode(204)
  async newPassword() {}
}
