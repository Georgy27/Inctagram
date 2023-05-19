import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { Oauth20UserData } from '../../user/types';

export const Oath20UserDecorator = createParamDecorator(
  (_: undefined, context: ExecutionContext): Oauth20UserData => {
    const request = context.switchToHttp().getRequest();
    const user: Oauth20UserData = request.user;
    if (!user) {
      throw new BadRequestException('Unauthenticated');
    }
    return user;
  },
);
