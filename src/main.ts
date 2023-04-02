import { NestFactory } from '@nestjs/core';
import { setupSwagger } from './config/swagger.config';
import { AppModule } from './app.module';
import { useGlobalPipes } from './common/pipes/global.pipe';
import { useGlobalFilters } from './common/filters/global.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  setupSwagger(app);
  setupSwagger(app);
  useGlobalPipes(app);
  useGlobalFilters(app);
  await app.listen(4000);
}
bootstrap();
