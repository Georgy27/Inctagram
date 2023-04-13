import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export function setupSwagger(app: INestApplication): void {
  const options = new DocumentBuilder()
    .setTitle('INCTAGRAM')
    .setDescription('API documentation for INCTAGRAM App')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      bearerFormat: 'jwt',
    })
    .addCookieAuth('refresh-token')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);
}
