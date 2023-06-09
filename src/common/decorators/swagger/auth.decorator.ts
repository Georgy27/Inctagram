import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiGoneResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthDto } from 'src/auth/dto/auth.dto';
import { FieldError, LogginSuccessViewModel } from '../../../types';
import { applyDecorators } from '@nestjs/common';
import { ConfirmationCodeDto } from '../../../auth/dto/confirmation-code.dto';
import { EmailDto } from '../../../auth/dto/email.dto';
import { NewPasswordDto } from '../../../auth/dto/new-password.dto';
import { LoginDto } from '../../../auth/dto/login.dto';
import { GoogleCodeDto } from '../../../auth/dto/google-code.dto';

export function AuthRegistrationSwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary:
        'Registration in the system. Email with the registration code will be send to passed email address',
    }),
    ApiBody({ type: AuthDto }),
    ApiResponse({
      status: 204,
      description:
        'Input data is accepted. Email with confirmation code will be send to passed email address',
    }),
    ApiBadRequestResponse({
      description:
        'If the inputModel has incorrect values (in particular if the user with the given email already registered)',
      type: FieldError,
    }),
  );
}

export function AuthLoginSwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Try login user to the system',
    }),
    ApiBody({ type: LoginDto }),
    ApiResponse({
      status: 200,
      description:
        'Returns JWT accessToken (expires after 1 hour) in body and JWT refreshToken in cookie (http-only, secure) (expires after 2 hours).',
      type: LogginSuccessViewModel,
    }),
    ApiBadRequestResponse({
      description: 'inputModel has incorrect values',
      type: FieldError,
    }),
    ApiUnauthorizedResponse({
      description: 'The password or email is wrong',
    }),
  );
}

export function AuthLogoutSwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary:
        'In cookie client must send correct refreshToken that will be revoked',
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

export function AuthRegistrationConfirmationSwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Confirm registration',
    }),
    ApiBody({ type: ConfirmationCodeDto }),
    ApiResponse({
      status: 204,
      description: 'Email was verified. Account was activated',
    }),
    ApiBadRequestResponse({
      description: 'Confirmation code is incorrect or has been applied',
      type: FieldError,
    }),
    ApiGoneResponse({
      description: 'Confirmation code expired',
      type: FieldError,
    }),
  );
}

export function AuthRegistrationEmailResendingSwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Resend confirmation registration email if user exists',
    }),
    ApiBody({ type: EmailDto }),
    ApiResponse({
      status: 204,
      description:
        'Input data is accepted. Email with confirmation code will be send to passed email address.',
    }),
    ApiBadRequestResponse({
      description: 'inputModel has incorrect values',
      type: FieldError,
    }),
    ApiNotFoundResponse({
      description: 'User with the given email does not exist',
    }),
  );
}

export function AuthRefreshTokenSwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Generate new pair of access and refresh token',
    }),
    ApiResponse({
      status: 200,
      description:
        'Returns JWT accessToken (expires after 1 hour) in body and JWT refreshToken in cookie (http-only, secure) (expires after 2 hours).',
      type: LogginSuccessViewModel,
    }),
    ApiUnauthorizedResponse({
      description:
        'JWT refreshToken inside cookie is missing, expired or incorrect',
    }),
    ApiCookieAuth(),
  );
}

export function AuthPasswordRecoverySwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary:
        'Password recovery via Email confirmation. Email should be sent with the RecoveryCode inside',
    }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['email', 'recaptchaToken'],
        properties: {
          email: {
            type: 'string',
            example: 'Jamesbond@yandex.ru',
          },
          recaptchaToken: {
            type: 'string',
          },
        },
      },
    }),
    ApiResponse({
      status: 204,
      description:
        "Even if current email is not registered (for prevent user's email detection)",
    }),
    ApiBadRequestResponse({
      description:
        'InputModel has invalid email or recaptcha was not provided (for example 222^gmail.com)',
    }),
    ApiForbiddenResponse({
      description: 'invalid-input-response (recaptcha is not correct)',
    }),
    ApiGoneResponse({
      description: 'Code expired',
    }),
  );
}

export function AuthNewPasswordSwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Confirm password recovery',
    }),
    ApiBody({ type: NewPasswordDto }),
    ApiResponse({
      status: 204,
      description: 'If code is valid and new password is accepted',
    }),
    ApiBadRequestResponse({
      description:
        'If the inputModel has incorrect value (incorrect password length) or RecoveryCode is incorrect or expired',
    }),
  );
}

export function AuthGoogleDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Sign in via Google account',
    }),
    ApiBody({ type: GoogleCodeDto }),
    ApiResponse({
      status: 200,
      description:
        'If google credentials are correct, returns JWT accessToken (expires after 1 hour) in body and JWT refreshToken in cookie (http-only, secure) (expires after 2 hours). If user is already registered, returns an email with suggestion to merge accounts',
    }),
    ApiUnauthorizedResponse({
      description: 'If the code provided is incorrect',
    }),
  );
}
