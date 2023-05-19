import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { MailService } from '../src/mail/mail.service';
import { MailServiceMock } from './auth/mocks/mail-service-mock';
import cookieParser from 'cookie-parser';
import { useGlobalPipes } from '../src/common/pipes/global.pipe';
import { useGlobalFilters } from '../src/common/filters/global.filter';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

export const getApp = async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(MailService)
    .useValue(MailServiceMock)
    .compile();

  const app = moduleRef.createNestApplication();
  app.use(cookieParser());
  useGlobalPipes(app);
  useGlobalFilters(app);
  await app.init();

  return app;
};
