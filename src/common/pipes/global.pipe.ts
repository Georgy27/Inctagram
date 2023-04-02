import { TrimPipe } from './trim.pipe';
import { INestApplication, ValidationPipe } from '@nestjs/common';

export function useGlobalPipes(app: INestApplication) {
  app.useGlobalPipes(
    new TrimPipe(),
    new ValidationPipe({
      whitelist: true,
      transform: true,
      stopAtFirstError: true,
    }),
  );
}
