import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RtPayload } from '../../../auth/strategies/types';

export const GetRtPayloadDecorator = createParamDecorator(
  (_: undefined, context: ExecutionContext): RtPayload => {
    const request = context.switchToHttp().getRequest();
    const user = request.user as RtPayload;
    return user;
  },
);
