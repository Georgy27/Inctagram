import { NestFactory } from '@nestjs/core';
import { setupSwagger } from './config/swagger.config';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './http-exception.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  setupSwagger(app);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      stopAtFirstError: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(4000);
}
bootstrap();
