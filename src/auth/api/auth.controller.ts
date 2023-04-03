import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthDto } from '../dto/auth.dto';
import { ApiTags } from '@nestjs/swagger';
import { ConfirmationCodeDto } from '../dto/confirmation-code.dto';
import { EmailDto } from '../dto/email.dto';
import { NewPasswordDto } from '../dto/new-password.dto';
import {
  AuthLoginSwaggerDecorator,
  AuthLogoutSwaggerDecorator,
  AuthNewPasswordSwaggerDecorator,
  AuthPasswordRecoverySwaggerDecorator,
  AuthRefreshTokenSwaggerDecorator,
  AuthRegistrationConfirmationSwaggerDecorator,
  AuthRegistrationEmailResendingSwaggerDecorator,
  AuthRegistrationSwaggerDecorator,
} from '../../common/decorators/swagger/auth.decorators';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterUserCommand } from '../use-cases/register-user-use-case';

@ApiTags('Auth')
@Controller('/api/auth')
export class AuthController {
  constructor(private commandBus: CommandBus) {}

  @Post('registration')
  @AuthRegistrationSwaggerDecorator()
  @HttpCode(204)
  async registration(@Body() authDto: AuthDto) {
    return this.commandBus.execute(new RegisterUserCommand(authDto));
  }

  @Post('registration-confirmation')
  @AuthRegistrationConfirmationSwaggerDecorator()
  @HttpCode(204)
  async registrationConfirmation(
    @Body() confirmationCodeDto: ConfirmationCodeDto,
  ) {}

  @Post('registration-email-resending')
  @AuthRegistrationEmailResendingSwaggerDecorator()
  @HttpCode(204)
  async registrationEmailResending(@Body() emailDto: EmailDto) {}

  @Post('login')
  @AuthLoginSwaggerDecorator()
  @HttpCode(200)
  async login(@Body() authDto: AuthDto) {}

  @Post('logout')
  @AuthLogoutSwaggerDecorator()
  @HttpCode(204)
  async logout() {}

  @Post('refresh-token')
  @AuthRefreshTokenSwaggerDecorator()
  @HttpCode(200)
  async refreshToken() {}

  @Post('password-recovery')
  @AuthPasswordRecoverySwaggerDecorator()
  @HttpCode(204)
  async passwordRecovery(@Body() emailDto: EmailDto) {}

  @Post('new-password')
  @AuthNewPasswordSwaggerDecorator()
  @HttpCode(204)
  async newPassword(@Body() newPasswordDto: NewPasswordDto) {}
}
