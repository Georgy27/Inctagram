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
import { JwtService } from '@nestjs/jwt';

describe('AuthsController', () => {
  jest.setTimeout(60 * 1000);
  let app: INestApplication;
  let httpServer: any;
  let prisma: PrismaService;
  let jwtService: JwtService;
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
    jwtService = moduleRef.get(JwtService);
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
    describe('Alternative registration scenarios', () => {
      describe('The user tries to register with the same email', () => {
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
      describe('The user tries to confirm an email with wrong code', () => {
        const validConfirmationCode = expect.getState().validConfirmationCode;
        it('should fail to confirm an email that was already confirmed', async () => {
          const response = await request(httpServer)
            .post('/api/auth/registration-confirmation')
            .send({ code: validConfirmationCode });
          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            statusCode: 400,
            message: expect.any(Array),
            path: '/api/auth/registration-confirmation',
          });
          expect(response.body.message).toHaveLength(1);
        });
        it('should fail to confirm an email if the code is incorrect', async () => {
          const response = await request(httpServer)
            .post('/api/auth/registration-confirmation')
            .send({ code: '123' });
          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            statusCode: 400,
            message: expect.any(Array),
            path: '/api/auth/registration-confirmation',
          });
          expect(response.body.message).toHaveLength(1);
        });
      });
      describe('The user did not receive email and tries to send it again', () => {
        it('should register user with new email', async () => {
          const response = await request(httpServer)
            .post('/api/auth/registration')
            .send({
              userName: 'George123',
              email: 'Aegoraaa@yandex.ru',
              password: 'newuser',
            });
          expect(response.status).toBe(204);
        });
        it('should send 404 if the User does not exist', async () => {
          const response = await request(httpServer)
            .post('/api/auth/registration-email-resending')
            .send({
              email: 'Random123@yandex.ru',
            });
          expect(response.status).toBe(404);
          expect(response.body).toEqual({
            statusCode: 404,
            message: expect.any(Array),
            path: '/api/auth/registration-email-resending',
          });
          expect(response.body.message).toHaveLength(1);
        });
        it('should send new email to the user /api/auth/registration-email-resending', async () => {
          const response = await request(httpServer)
            .post('/api/auth/registration-email-resending')
            .send({
              email: 'Aegoraaa@yandex.ru',
            });
          expect(response.status).toBe(204);
        });
        it('should send 404 if the User does exist but has been confirmed', async () => {
          await prisma.emailConfirmation.update({
            where: { userEmail: 'Aegoraaa@yandex.ru' },
            data: {
              isConfirmed: true,
            },
          });
          const response = await request(httpServer)
            .post('/api/auth/registration-email-resending')
            .send({
              email: 'Aegoraaa@yandex.ru',
            });
          expect(response.status).toBe(404);
          expect(response.body).toEqual({
            statusCode: 404,
            message: expect.any(Array),
            path: '/api/auth/registration-email-resending',
          });
          expect(response.body.message).toHaveLength(1);
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
          expect(response.body.message).toHaveLength(3);
        });
        it('should return 400 status code and array of error because the data was incorrect', async () => {
          const response = await request(httpServer)
            .post('/api/auth/registration')
            .send({
              userName: true,
              email: 'email',
              password: 123456,
            });
          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            statusCode: 400,
            message: expect.any(Array),
            path: '/api/auth/registration',
          });
          expect(response.body.message).toHaveLength(3);
        });
        it('should return 400 status code because the password was too short', async () => {
          const response = await request(httpServer)
            .post('/api/auth/registration')
            .send({
              userName: 'correct',
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
              userName: 'correct',
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
        it('should return 400 status code because the userName was too short', async () => {
          const response = await request(httpServer)
            .post('/api/auth/registration')
            .send({
              userName: helperFunctionsForTesting.generateString(5),
              email: 'correct@email.com',
              password: 'correct123',
            });
          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            statusCode: 400,
            message: expect.any(Array),
            path: '/api/auth/registration',
          });
          expect(response.body.message).toHaveLength(1);
        });
        it('should return 400 status code because the userName was too long', async () => {
          const response = await request(httpServer)
            .post('/api/auth/registration')
            .send({
              userName: helperFunctionsForTesting.generateString(31),
              email: 'correct@email.com',
              password: 'correct123',
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
      describe('The user send incorrect data during registration-confirmation', () => {
        it('should return 400 if the code is empty', async () => {
          const response = await request(httpServer)
            .post('/api/auth/registration-confirmation')
            .send({});
          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            statusCode: 400,
            message: expect.any(Array),
            path: '/api/auth/registration-confirmation',
          });
          expect(response.body.message).toHaveLength(1);
        });
        it('should return 400 if the code is of incorrect type', async () => {
          const response = await request(httpServer)
            .post('/api/auth/registration-confirmation')
            .send({ code: true });
          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            statusCode: 400,
            message: expect.any(Array),
            path: '/api/auth/registration-confirmation',
          });
          expect(response.body.message).toHaveLength(1);
        });
      });
      describe('The user send incorrect data during registration-email-resending', () => {
        it('should return 400 if the email is empty', async () => {
          const response = await request(httpServer)
            .post('/api/auth/registration-email-resending')
            .send({});
          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            statusCode: 400,
            message: expect.any(Array),
            path: '/api/auth/registration-email-resending',
          });
          expect(response.body.message).toHaveLength(1);
        });
        it('should return 400 if the email is of incorrect type', async () => {
          const response = await request(httpServer)
            .post('/api/auth/registration-email-resending')
            .send({
              email: 'incorrect-email',
            });
          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            statusCode: 400,
            message: expect.any(Array),
            path: '/api/auth/registration-email-resending',
          });
          expect(response.body.message).toHaveLength(1);
        });
      });
    });
  });

  ////////////////////////////////////////////////////////////////////////////////
  // LOGIN

  describe('As an unauthorized user, I want to log in', () => {
    describe('drop database', () => {
      it('should drop database', async () => {
        await prisma.user.deleteMany({});
      });
    });
    describe('The user successfully logs in', () => {
      it('should prepare data', async () => {
        // create user
        const response = await request(httpServer)
          .post('/api/auth/registration')
          .send(authStub.registration.validUser);
        expect(response.status).toBe(204);
        expect(response.body).toEqual({});
        // manually confirm user
        const manuallyConfirmUser = await prisma.emailConfirmation.update({
          where: { userEmail: 'Aegoraa@yandex.ru' },
          data: {
            isConfirmed: true,
          },
        });
        expect(manuallyConfirmUser.isConfirmed).toBeTruthy();
      });
      it('should log in 3 times and return 200 with accessToken in body and refreshToken in a cookie', async () => {
        const token_1 = await request(httpServer)
          .post('/api/auth/login')
          .set('User-Agent', 'agent007')
          .send(authStub.login);
        expect(token_1.status).toBe(200);
        expect(isUUID(token_1.body.accessToken));
        expect(token_1.headers['set-cookie']).toBeDefined();
        const token_2 = await request(httpServer)
          .post('/api/auth/login')
          .set('User-Agent', 'agent007')
          .send(authStub.login);
        expect(token_2.status).toBe(200);
        expect(isUUID(token_2.body.accessToken));
        expect(token_2.headers['set-cookie']).toBeDefined();
        const token_3 = await request(httpServer)
          .post('/api/auth/login')
          .set('User-Agent', 'agent007')
          .send(authStub.login);
        expect(token_3.status).toBe(200);
        expect(isUUID(token_3.body.accessToken));
        expect(token_3.headers['set-cookie']).toBeDefined();

        expect.setState({ token_1 });
      });
      it('should have created deviceSessions', async () => {
        const token_1 = expect.getState().token_1.headers['set-cookie'][0];
        const cleanToken = token_1.split('refreshToken=')[1].split(';')[0];
        const RtPayload_1: any = await jwtService.decode(cleanToken);

        expect.setState({ RtPayload_1 });

        const session = await prisma.deviceSession.findUnique({
          where: { deviceId: RtPayload_1.deviceId },
        });
        expect(session).toBeDefined();

        const allSessions = await prisma.deviceSession.findMany({
          where: { userId: RtPayload_1.userID },
        });
        expect(allSessions).toBeDefined();
        // expect(allSessions).toBe(Array);
        expect(allSessions).toHaveLength(3);
      });
    });
    describe('Alternative log in scenarios', () => {
      describe('The user tries to refresh tokens /api/auth/refresh-token', () => {
        const token_1 = expect.getState().token_1.headers['set-cookie'][0];
        const RtPayload_1 = expect.getState().RtPayload_1;

        it('successfully refreshes tokens', async () => {
          const response = await request(httpServer)
            .post('/api/refresh-token')
            .set('Cookie', token_1);
          expect(response.status).toBe(200);
          expect(isUUID(response.body.accessToken));
          expect(response.headers['set-cookie']).toBeDefined();
        });
        it('should not find device session if old refreshToken is used', async () => {
          const session = await prisma.deviceSession.findUnique({
            where: { deviceId: RtPayload_1.deviceId },
          });
          expect(session).toBeNull();
        });
      });
    });
  });
});
