import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthDto } from '../dto/auth.dto';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNotFoundResponse,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FieldError, LogginSuccessViewModel } from '../../types';
import { ConfirmationCodeDto } from '../dto/confirmation-code.dto';
import { EmailDto } from '../dto/email.dto';
import { NewPasswordDto } from '../dto/new-password.dto';

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
  @ApiBadRequestResponse({
    description: 'User with this email is already registered',
    type: FieldError,
  })
  @HttpCode(204)
  async registration(@Body() authDto: AuthDto) {}
  @Post('registration-confirmation')
  @ApiBody({ type: ConfirmationCodeDto })
  @ApiResponse({
    status: 204,
    description: 'Email was verified. Account was activated',
  })
  @ApiBadRequestResponse({
    description:
      'Confirmation code is incorrect, expired or already been applied',
    type: FieldError,
  })
  @HttpCode(204)
  async registrationConfirmation(
    @Body() confirmationCodeDto: ConfirmationCodeDto,
  ) {}
  @Post('registration-email-resending')
  @ApiBody({ type: EmailDto })
  @ApiResponse({
    status: 204,
    description:
      'Input data is accepted. Email with confirmation code will be send to passed email address.',
  })
  @ApiBadRequestResponse({
    description: 'inputModel has incorrect values',
    type: FieldError,
  })
  @ApiNotFoundResponse({
    description:
      'User with the given email does not exist or email has already been verified',
  })
  @HttpCode(204)
  async registrationEmailResending(@Body() emailDto: EmailDto) {}
  @Post('login')
  @ApiBody({ type: AuthDto })
  @ApiResponse({
    status: 200,
    description:
      'Returns JWT accessToken (expires after 1 hour) in body and JWT refreshToken in cookie (http-only, secure) (expires after 2 hours).',
    type: LogginSuccessViewModel,
  })
  @ApiBadRequestResponse({
    description: 'inputModel has incorrect values',
    type: FieldError,
  })
  @ApiUnauthorizedResponse({
    description: 'The password or login is wrong',
  })
  @HttpCode(200)
  async login(@Body() authDto: AuthDto) {}
  @Post('logout')
  @ApiResponse({
    status: 204,
    description: 'No Content',
  })
  @ApiUnauthorizedResponse({
    description:
      'JWT refreshToken inside cookie is missing, expired or incorrect',
  })
  @HttpCode(204)
  async logout() {}
  @Post('refresh-token')
  @ApiResponse({
    status: 200,
    description:
      'Returns JWT accessToken (expires after 1 hour) in body and JWT refreshToken in cookie (http-only, secure) (expires after 2 hours).',
    type: LogginSuccessViewModel,
  })
  @ApiUnauthorizedResponse({
    description:
      'JWT refreshToken inside cookie is missing, expired or incorrect',
  })
  @HttpCode(200)
  async refreshToken() {}
  @Post('password-recovery')
  @ApiBody({ type: EmailDto })
  @ApiResponse({
    status: 204,
    description:
      "Even if current email is not registered (for prevent user's email detection)",
  })
  @ApiBadRequestResponse({
    description: 'inputModel has invalid email (for example 222^gmail.com)',
  })
  @HttpCode(204)
  async passwordRecovery(@Body() emailDto: EmailDto) {}
  @Post('new-password')
  @HttpCode(204)
  @ApiBody({ type: NewPasswordDto })
  @ApiResponse({
    status: 204,
    description: 'If code is valid and new password is accepted',
  })
  @ApiBadRequestResponse({
    description:
      'If the inputModel has incorrect value (incorrect password length) or RecoveryCode is incorrect or expired',
  })
  async newPassword(@Body() newPasswordDto: NewPasswordDto) {}
}
