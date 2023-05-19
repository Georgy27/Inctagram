import {
  Body,
  Controller,
  HttpCode,
  Ip,
  Post,
  Res,
  UseGuards,
  Headers,
  UnauthorizedException,
  Req,
  Get,
  Inject,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { AuthDto } from '../dto/auth.dto';
import { ApiTags } from '@nestjs/swagger';
import { ConfirmationCodeDto } from '../dto/confirmation-code.dto';
import { EmailDto } from '../dto/email.dto';
import { NewPasswordDto } from '../dto/new-password.dto';
import {
  AuthGoogleDecorator,
  AuthLoginSwaggerDecorator,
  AuthLogoutSwaggerDecorator,
  AuthNewPasswordSwaggerDecorator,
  AuthPasswordRecoverySwaggerDecorator,
  AuthRefreshTokenSwaggerDecorator,
  AuthRegistrationConfirmationSwaggerDecorator,
  AuthRegistrationEmailResendingSwaggerDecorator,
  AuthRegistrationSwaggerDecorator,
} from '../../common/decorators/swagger/auth.decorator';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterUserCommand } from '../use-cases/register-user-use-case';
import { ConfirmRegistrationCommand } from '../use-cases/confirm-registration-use-case';
import { RegistrationEmailResendingCommand } from '../use-cases/registration-email-resending-use-case';
import { LoginUserCommand } from '../use-cases/login-user-use-case';
import { LoginDto } from '../dto/login.dto';
import { CookieOptions, Request, Response } from 'express';
import { LogoutUserCommand } from '../use-cases/logout-user-use-case';

import { JwtAdaptor } from '../../adaptors/jwt/jwt.adaptor';
import { PasswordRecoveryCommand } from '../use-cases/password-recovery.use-case';
import { NewPasswordCommand } from '../use-cases/new-password.use-case';
import { ActiveUser } from '../../common/decorators/active-user.decorator';
import { ActiveUserData, Oauth20UserData } from '../../user/types';
import { JwtRtGuard } from '../../common/guards/jwt-auth.guard';
import { RecaptchaGuard } from 'src/common/guards/recaptcha.guard';
import { CookieAuthGuard } from '../../common/guards/cookie-auth.guard';
import { githubOauthConfig } from 'src/config/github-oauth.config';
import { ConfigType } from '@nestjs/config';
import { SignUpWithGithubCommand } from '../use-cases/sign-up-user-with-github.use-case';
import { GithubCodeDto } from '../dto/github-code.dto';
import { TokensPair } from '../types';
import { MergeAccountCommand } from '../use-cases/merge-account.use-case';
import { SignInWithGithubCommand } from '../use-cases/sign-in-user-with-github.use-case';
import { GoogleCodeDto } from '../dto/google-code.dto';
import { SignInWithGoogleCommand } from '../use-cases/oauth20-login-user-use-case';
import querystring from 'querystring';
@ApiTags('Auth')
@Controller('/api/auth')
export class AuthController {
  private cookieOptions: Partial<CookieOptions> = {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  };

  constructor(
    private commandBus: CommandBus,
    private readonly jwtAdaptor: JwtAdaptor,
    @Inject(githubOauthConfig.KEY)
    private readonly githubConfig: ConfigType<typeof githubOauthConfig>,
  ) {}
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
  @UseGuards(CookieAuthGuard)
  @HttpCode(200)
  async login(
    @Body() loginDto: LoginDto,
    @Ip() ip: string,
    @Res({ passthrough: true }) res: Response,
    @Headers('user-agent') userAgent: string,
    @ActiveUser('deviceId') deviceId: string | null,
  ) {
    if (!userAgent) throw new UnauthorizedException();

    const { accessToken, refreshToken } = await this.commandBus.execute<
      LoginUserCommand,
      { accessToken: string; refreshToken: string }
    >(new LoginUserCommand(loginDto, ip, userAgent, deviceId));
    res.cookie('refreshToken', refreshToken, this.cookieOptions);
    return { accessToken };
  }

  @UseGuards(CookieAuthGuard)
  @AuthGoogleDecorator()
  @Post('google/sign-in')
  async googleSignIn(
    @Ip() ip: string,
    @Body() googleCodeDto: GoogleCodeDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
    @Headers('user-agent')
    userAgent: string,
    @ActiveUser('deviceId') deviceId: string | null,
  ) {
    const { code } = googleCodeDto;

    const { accessToken, refreshToken } = await this.commandBus.execute(
      new SignInWithGoogleCommand({ code, deviceId, userAgent, ip }),
    );
    res.cookie('refreshToken', refreshToken, this.cookieOptions);
  }

  @UseGuards(JwtRtGuard)
  @Post('logout')
  @AuthLogoutSwaggerDecorator()
  @HttpCode(204)
  async logout(
    @ActiveUser('deviceId') deviceId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.commandBus.execute(new LogoutUserCommand(deviceId));
    res.clearCookie('refreshToken');
  }

  @UseGuards(JwtRtGuard)
  @Post('refresh-token')
  @AuthRefreshTokenSwaggerDecorator()
  @HttpCode(200)
  async refreshToken(
    @ActiveUser() user: ActiveUserData,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const { accessToken, refreshToken } = await this.jwtAdaptor.refreshToken(
      user,
    );
    res.cookie('refreshToken', refreshToken, this.cookieOptions);
    return { accessToken };
  }

  @Post('password-recovery')
  @AuthPasswordRecoverySwaggerDecorator()
  @UseGuards(RecaptchaGuard)
  @HttpCode(204)
  async passwordRecovery(@Body() emailDto: EmailDto) {
    const { email } = emailDto;

    return this.commandBus.execute(new PasswordRecoveryCommand(email));
  }

  @Post('new-password')
  @AuthNewPasswordSwaggerDecorator()
  @HttpCode(204)
  async newPassword(@Body() newPasswordDto: NewPasswordDto) {
    const { newPassword, recoveryCode } = newPasswordDto;

    return this.commandBus.execute(
      new NewPasswordCommand(newPassword, recoveryCode),
    );
  }

  @Post('github/sign-in')
  @UseGuards(CookieAuthGuard)
  async githubSignIn(
    @Ip() ip: string,
    @Body() githubCodeDto: GithubCodeDto,
    @Headers('user-agent') userAgent: string,
    @Res({ passthrough: true }) response: Response,
    @ActiveUser('deviceId') deviceId: string | null,
  ) {
    const { code } = githubCodeDto;

    const result = await this.commandBus.execute<
      SignInWithGithubCommand,
      TokensPair
    >(new SignInWithGithubCommand({ code, deviceId, ip, userAgent }));

    const { accessToken, refreshToken } = result;

    response.cookie('refreshToken', refreshToken, this.cookieOptions);
    response.status(HttpStatus.OK).json({ accessToken });
  }

  @Post('github/sign-up')
  @UseGuards(CookieAuthGuard)
  async githubSignUp(
    @Ip() ip: string,
    @Body() githubCodeDto: GithubCodeDto,
    @Headers('user-agent') userAgent: string,
    @Res({ passthrough: true }) response: Response,
    @ActiveUser('deviceId') deviceId: string | null,
  ) {
    const { code } = githubCodeDto;

    const result = await this.commandBus.execute<
      SignUpWithGithubCommand,
      TokensPair
    >(new SignUpWithGithubCommand({ code, deviceId, ip, userAgent }));

    if (!result) {
      response.sendStatus(HttpStatus.ACCEPTED);
      return;
    }

    const { accessToken, refreshToken } = result;

    response.cookie('refreshToken', refreshToken, this.cookieOptions);
    response.status(HttpStatus.OK).json({ accessToken });
  }

  @Post('merge-account')
  @HttpCode(HttpStatus.OK)
  async mergeAccounts(@Query('code') code: string) {
    return this.commandBus.execute(new MergeAccountCommand(code));
  }
}
