import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RECAPTCHA_TOKEN } from '../constants';
import { NO_RECAPTCHA_TOKEN_ERROR } from '../errors';

@Injectable()
export class RecaptchaGuard implements CanActivate {
  public constructor(private readonly configService: ConfigService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const secret = this.configService.get<string>('RECAPTCHA_SECRET_KEY');
    const response = request.body[RECAPTCHA_TOKEN];

    if (!response) throw new BadRequestException(NO_RECAPTCHA_TOKEN_ERROR);

    const THRESHOLD = 0.8;

    await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${response}`,
      {
        method: 'POST',
      },
    )
      .then((res) => res.json())
      .then((data) => {
        if (!data.success || data.score < THRESHOLD)
          throw new Error(data['error-codes']);
      })
      .catch((e) => {
        throw new ForbiddenException(e);
      });

    return true;
  }
}
