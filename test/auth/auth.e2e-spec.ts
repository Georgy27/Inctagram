import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { useGlobalPipes } from '../../src/common/pipes/global.pipe';
import { useGlobalFilters } from '../../src/common/filters/global.filter';
import { PrismaService } from '../../src/prisma/prisma.service';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { MailBoxImap } from './helpers/imap.service';
import { isUUID } from 'class-validator';
describe('AuthsController', () => {
  jest.setTimeout(60 * 1000);
  let app: INestApplication;
  let httpServer: any;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    useGlobalPipes(app);
    useGlobalFilters(app);
    await app.init();
    const mailBox = new MailBoxImap();
    await mailBox.connectToMail();
    expect.setState({ mailBox });

    prisma = moduleRef.get(PrismaService);
    httpServer = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });
  beforeAll(async () => {
    await prisma.user.deleteMany({});
  });
  it('should register user', async () => {
    const response = await request(httpServer)
      .post('/api/auth/registration')
      .send({
        email: 'Aegoraa@yandex.ru',
        password: 'testpassword',
      });
    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
  });
  it('should read email and get validConfirmationCode', async () => {
    const mailBox: MailBoxImap = expect.getState().mailBox;
    const email = await mailBox.waitNewMessage(0.5);
    const html = await mailBox.getMessageHtml(email);
    expect(html).toBeDefined();
    expect(html).not.toBeNull();

    console.log(html);
    const validConfirmationCode = html!.split('code=')[1].split('"')[0];
    console.log(validConfirmationCode);
    expect(validConfirmationCode).toBeDefined();
    expect(isUUID(validConfirmationCode)).toBeTruthy();
    expect.setState({ validConfirmationCode });
  });
});
