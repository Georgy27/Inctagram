import {
  Body,
  Controller,
  HttpCode,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
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
import { RegistrationEmailResendingCommand } from '../use-cases/registration-email-resending-use-case';
import { ConfirmRegistrationCommand } from '../use-cases/confirm-registration-use-case';
import { Response } from 'express';
import { LoginUserCommand } from '../use-cases/login-user-use-case';
import { LoginDto } from '../dto/login.dto';
import { LogginSuccessViewModel } from '../../types';
import { AuthGuard } from '@nestjs/passport';
import { RtPayload } from '../strategies/types';
import { GetRtPayloadDecorator } from '../../common/decorators/jwt/getRtPayload.decorator';
import { LogoutUserCommand } from '../use-cases/logout-user-use-case';
import { GetRtFromCookieDecorator } from '../../common/decorators/jwt/getRtFromCookie.decorator';
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
  ) {
    return this.commandBus.execute(
      new ConfirmRegistrationCommand(confirmationCodeDto),
    );
  }

  @Post('registration-email-resending')
  @AuthRegistrationEmailResendingSwaggerDecorator()
  @HttpCode(204)
  async registrationEmailResending(@Body() emailDto: EmailDto) {
    return this.commandBus.execute(
      new RegistrationEmailResendingCommand(emailDto),
    );
  }

  @Post('login')
  @AuthLoginSwaggerDecorator()
  @HttpCode(200)
  @Post('login')
  @AuthLoginSwaggerDecorator()
  @HttpCode(200)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LogginSuccessViewModel> {
    const { accessToken, refreshToken } = await this.commandBus.execute<
      LoginUserCommand,
      { accessToken: string; refreshToken: string }
    >(new LoginUserCommand(loginDto));
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return { accessToken };
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('logout')
  @AuthLogoutSwaggerDecorator()
  @HttpCode(204)
  async logout(
    @GetRtPayloadDecorator() rtPayload: RtPayload,
    @GetRtFromCookieDecorator() refreshToken: { refreshToken: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    console.log(rtPayload, refreshToken);
    return this.commandBus.execute(
      new LogoutUserCommand(rtPayload.userId, refreshToken),
    );
  }

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
