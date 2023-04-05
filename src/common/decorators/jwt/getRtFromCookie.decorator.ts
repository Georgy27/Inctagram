import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RtPayload } from '../../../auth/strategies/types';

export const GetRtFromCookieDecorator = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return data ? request.cookies?.[data] : request.cookies;
  },
);
