import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const exceptionGetResponse: any = exception.getResponse();
    const messageErrorArray =
      typeof exceptionGetResponse.message !== 'string'
        ? exceptionGetResponse.message
        : new Array(exceptionGetResponse.message);

    response.status(status).json({
      statusCode: status,
      message: messageErrorArray,
      path: request.url,
    });
  }
}
