import { Body, Controller, HttpCode, Post } from '@nestjs/common';

@Controller('/api/auth')
export class AuthController {
  constructor() {}

  @Post('registration')
  @HttpCode(204)
  async registration() {}
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
