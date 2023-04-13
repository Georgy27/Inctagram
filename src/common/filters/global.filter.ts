import { HttpExceptionFilter } from '../../http-exception.filter';
import { INestApplication } from '@nestjs/common';

export function useGlobalFilters(app: INestApplication) {
  app.useGlobalFilters(new HttpExceptionFilter());
}
