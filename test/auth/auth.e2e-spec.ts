import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { useGlobalPipes } from '../../src/common/pipes/global.pipe';
import { useGlobalFilters } from '../../src/common/filters/global.filter';
import { PrismaService } from '../../src/prisma/prisma.service';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { MailBoxImap } from './helpers/imap.service';
import { isUUID } from 'class-validator';
import { authStub } from './stubs/auth.stub';
import { helperFunctionsForTesting } from './helpers/helper-functions';
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

  describe('As an unauthorised user, I want to register in the system to create the profile ', () => {
    describe('The user successfully registered and his/her email is confirmed', () => {
      it('should create new User and return 204 status code /api/auth/registration', async () => {
        const response = await request(httpServer)
          .post('/api/auth/registration')
          .send(authStub.registration.validUser);
        expect(response.status).toBe(204);
        expect(response.body).toEqual({});
      });
      it('should read email and get validConfirmationCode', async () => {
        const mailBox: MailBoxImap = expect.getState().mailBox;
        const email = await mailBox.waitNewMessage(0.5);
        const html = await mailBox.getMessageHtml(email);
        expect(html).toBeDefined();
        expect(html).not.toBeNull();

        const validConfirmationCode = html!.split('code=')[1].split('"')[0];
        expect(validConfirmationCode).toBeDefined();
        expect(isUUID(validConfirmationCode)).toBeTruthy();
        expect.setState({ validConfirmationCode });
      });
      it('should send validConfirmationCode to /api/auth/registration-confirmation', async () => {
        const validConfirmationCode = expect.getState().validConfirmationCode;
        const response = await request(httpServer)
          .post('/api/auth/registration-confirmation')
          .send({ code: validConfirmationCode });
        expect(response.status).toBe(204);
        expect(response.body).toEqual({});
      });
      it('should have user emailConfirmation isConfirmed to be true', async () => {
        const userEmailConfirmation = await prisma.emailConfirmation.findUnique(
          {
            where: { userEmail: process.env.IMAP_YANDEX_EMAIL },
          },
        );
        expect(userEmailConfirmation?.isConfirmed).toBeTruthy();
      });
    });
    describe('Alternative scenarios', () => {
      describe('The user with the given email already exists', () => {
        it('should fail to create a user with the same email', async () => {
          const response = await request(httpServer)
            .post('/api/auth/registration')
            .send(authStub.registration.validUser);
          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            statusCode: 400,
            message: expect.any(Array),
            path: '/api/auth/registration',
          });
          expect(response.body.message).toHaveLength(1);
        });
      });
      describe('The user did not receive email and tries to send it again', () => {
        it('should register user with new email', async () => {
          const response = await request(httpServer)
            .post('/api/auth/registration')
            .send({
              email: 'Aegoraaa@yandex.ru',
              password: 'newuser',
            });
          expect(response.status).toBe(204);
        });
        it('should send new email to the user /api/auth/registration-email-resending', async () => {
          const response = await request(httpServer)
            .post('/api/auth/registration-email-resending')
            .send({
              email: 'Aegoraaa@yandex.ru',
            });
          expect(response.status).toBe(204);
        });
      });
      describe('The user send incorrect data during registration', () => {
        it('should return 400 status code and array of error because the data was not sent', async () => {
          const response = await request(httpServer)
            .post('/api/auth/registration')
            .send({});
          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            statusCode: 400,
            message: expect.any(Array),
            path: '/api/auth/registration',
          });
          expect(response.body.message).toHaveLength(2);
        });
        it('should return 400 status code and array of error because the data was incorrect', async () => {
          const response = await request(httpServer)
            .post('/api/auth/registration')
            .send({
              email: 'email',
              password: 123456,
            });
          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            statusCode: 400,
            message: expect.any(Array),
            path: '/api/auth/registration',
          });
          expect(response.body.message).toHaveLength(2);
        });
        it('should return 400 status code because the password was too short', async () => {
          const response = await request(httpServer)
            .post('/api/auth/registration')
            .send({
              email: 'correct@email.com',
              password: helperFunctionsForTesting.generateString(4),
            });
          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            statusCode: 400,
            message: expect.any(Array),
            path: '/api/auth/registration',
          });
          expect(response.body.message).toHaveLength(1);
        });
        it('should return 400 status code because the password was too long', async () => {
          const response = await request(httpServer)
            .post('/api/auth/registration')
            .send({
              email: 'correct@email.com',
              password: helperFunctionsForTesting.generateString(21),
            });
          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            statusCode: 400,
            message: expect.any(Array),
            path: '/api/auth/registration',
          });
          expect(response.body.message).toHaveLength(1);
        });
      });
    });
  });
});
