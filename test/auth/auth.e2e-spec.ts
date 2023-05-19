import { PrismaService } from '../../src/prisma/prisma.service';
import request from 'supertest';
import { CanActivate, INestApplication } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { authStub } from './stubs/auth.stub';
import { delay, helperFunctionsForTesting } from './helpers/helper-functions';
import { JwtService } from '@nestjs/jwt';
import { MailServiceMock } from './mocks/mail-service-mock';
import { RecaptchaGuard } from '../../src/common/guards/recaptcha.guard';
import { getApp } from '../testing-connection';

describe('AuthsController', () => {
  jest.setTimeout(60 * 1000);
  let app: INestApplication;
  let httpServer: any;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let recaptchaGuard: RecaptchaGuard;
  beforeAll(async () => {
    app = await getApp();
    prisma = await app.resolve(PrismaService);
    jwtService = await app.resolve(JwtService);
    httpServer = app.getHttpServer();
    recaptchaGuard = app.get(RecaptchaGuard);
  });

  afterAll(async () => {
    await app.close();
  });
  afterEach(() => {
    jest.resetAllMocks();
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
        expect(MailServiceMock.sendUserConfirmation).toBeCalledTimes(1);
      });
      it('should get validConfirmationCode from DB', async () => {
        const emailConformation = await prisma.emailConfirmation.findUnique({
          where: { userEmail: authStub.registration.validUser.email },
        });

        expect(emailConformation?.confirmationCode).toBeDefined();
        expect(isUUID(emailConformation?.confirmationCode)).toBeTruthy();
        const validConfirmationCode = emailConformation?.confirmationCode;
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
            where: { userEmail: authStub.registration.validUser.email },
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
              username: 'George123',
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
        it('should send 400 if the User does exist but has been confirmed', async () => {
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

          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            statusCode: 400,
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
              username: true,
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
              username: 'correct',
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
              username: 'correct',
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
        it('should return 400 status code because the username was too short', async () => {
          const response = await request(httpServer)
            .post('/api/auth/registration')
            .send({
              username: helperFunctionsForTesting.generateString(5),
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
        it('should return 400 status code because the username was too long', async () => {
          const response = await request(httpServer)
            .post('/api/auth/registration')
            .send({
              username: helperFunctionsForTesting.generateString(31),
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
      it('/api/auth/refresh-token (POST) should be able to refresh-tokens', async () => {
        const token_1 = expect.getState().token_1.headers['set-cookie'];

        await delay(1000);

        const token_2 = await request(httpServer)
          .post('/api/auth/refresh-token')
          .set('Cookie', token_1);

        expect.setState({ token_2 });
        expect(token_2.status).toBe(200);
        expect(isUUID(token_2.body.accessToken));
        expect(token_2.headers['set-cookie']).toBeDefined();
      });
      it('/api/sessions/devices (GET) should not find devices if old refreshToken is used', async () => {
        const token_1 = expect.getState().token_1.headers['set-cookie'];

        const response = await request(httpServer)
          .get('/api/sessions/devices')
          .set('Cookie', token_1);

        expect(response.status).toBe(401);
      });
      it('/api/sessions/devices (GET) should find devices if new refreshToken is used', async () => {
        const token_2 = expect.getState().token_2.headers['set-cookie'];
        const response = await request(httpServer)
          .get('/api/sessions/devices')
          .set('Cookie', token_2);

        expect(response.status).toBe(200);
      });
    });

    describe('Alternative scenario', () => {
      describe('User provides incorrect data types during log in', () => {
        it('/api/auth/login (POST) should not log in if user email is of wrong type', async () => {
          const response = await request(httpServer)
            .post('/api/auth/login')
            .set('User-Agent', 'agent007')
            .send(authStub.login.invalidUserEmail);

          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            statusCode: 400,
            message: expect.any(Array),
            path: '/api/auth/login',
          });
          expect(response.body.message).toHaveLength(1);
        });
        it('/api/auth/login (POST) should not log in if user password is of wrong type', async () => {
          const response = await request(httpServer)
            .post('/api/auth/login')
            .set('User-Agent', 'agent007')
            .send(authStub.login.invalidUserPassword);

          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            statusCode: 400,
            message: expect.any(Array),
            path: '/api/auth/login',
          });
          expect(response.body.message).toHaveLength(1);
        });
        it('/api/auth/login (POST) should not log in if both user password and email are of wrong type', async () => {
          const response = await request(httpServer)
            .post('/api/auth/login')
            .set('User-Agent', 'agent007')
            .send(authStub.login.invalidUser);

          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            statusCode: 400,
            message: expect.any(Array),
            path: '/api/auth/login',
          });
          expect(response.body.message).toHaveLength(2);
        });
      });

      describe('User provides incorrect credentials', () => {
        it('/api/auth/login (POST) should not log in if user email is incorrect', async () => {
          const response = await request(httpServer)
            .post('/api/auth/login')
            .set('User-Agent', 'agent007')
            .send(authStub.login.incorrectUserEmail);

          expect(response.status).toBe(401);
          expect(response.body).toEqual({
            statusCode: 401,
            message: expect.any(Array),
            path: '/api/auth/login',
          });
          expect(response.body.message).toHaveLength(1);
        });
        it('/api/auth/login (POST) should not log in if user password is incorrect', async () => {
          const response = await request(httpServer)
            .post('/api/auth/login')
            .set('User-Agent', 'agent007')
            .send(authStub.login.incorrectUserPassword);

          expect(response.status).toBe(401);
          expect(response.body).toEqual({
            statusCode: 401,
            message: expect.any(Array),
            path: '/api/auth/login',
          });
          expect(response.body.message).toHaveLength(1);
        });
        it('/api/auth/login (POST) should not log in if user email and password are incorrect', async () => {
          const response = await request(httpServer)
            .post('/api/auth/login')
            .set('User-Agent', 'agent007')
            .send(authStub.login.incorrectUser);

          expect(response.status).toBe(401);
          expect(response.body).toEqual({
            statusCode: 401,
            message: expect.any(Array),
            path: '/api/auth/login',
          });
          expect(response.body.message).toHaveLength(1);
        });
      });
    });
  });

  ///////////////////////////////////////////////////////
  // Password-recovery
  describe('As an unauthorized user, I want to recover my password', () => {
    describe('drop database', () => {
      it('should drop database', async () => {
        await prisma.user.deleteMany({});
      });
    });

    describe('Successful password-recovery', () => {
      it('should prepare data', async () => {
        // create user
        const response = await request(httpServer)
          .post('/api/auth/registration')
          .send(authStub.registration.validUser);

        expect(response.status).toBe(204);
        expect(response.body).toEqual({});
        expect(MailServiceMock.sendUserConfirmation).toBeCalledTimes(1);
        // manually confirm user
        const manuallyConfirmUser = await prisma.emailConfirmation.update({
          where: { userEmail: 'Aegoraa@yandex.ru' },
          data: {
            isConfirmed: true,
          },
        });
        expect(manuallyConfirmUser.isConfirmed).toBeTruthy();
      });
      it('/api/auth/password-recovery (POST) should receive 204, email and have recovery code in DB', async () => {
        jest
          .spyOn(recaptchaGuard, 'canActivate')
          .mockReturnValueOnce(Promise.resolve(true));

        const response = await request(httpServer)
          .post('/api/auth/password-recovery')
          .send({
            email: authStub.registration.validUser.email,
            recaptchaToken: '123',
          });

        expect(response.status).toBe(204);
        expect(response.body).toEqual({});
        expect(MailServiceMock.sendPasswordRecovery).toBeCalledTimes(1);

        const user = await prisma.user.findUnique({
          where: { username: authStub.registration.validUser.username },
        });
        const passwordRecoveryCode = await prisma.passwordRecovery.findUnique({
          where: { userId: user!.id },
        });

        expect(passwordRecoveryCode?.recoveryCode).not.toBe(null);

        expect.setState({ userPassword: user?.hash });
        expect.setState({ recoveryCode: passwordRecoveryCode?.recoveryCode });
        authStub.setPasswordRecoveryCode(
          passwordRecoveryCode!.recoveryCode as string,
        );
      });
      it('/api/auth/new-password (POST) should receive 204 and have new password in DB', async () => {
        const recoveryCode = expect.getState().recoveryCode;
        const userPassword = expect.getState().userPassword;

        const response = await request(httpServer)
          .post('/api/auth/new-password')
          .send({ newPassword: 'newPassword', recoveryCode: recoveryCode });

        expect(response.status).toBe(204);
        expect(response.body).toEqual({});

        const user = await prisma.user.findUnique({
          where: { username: authStub.registration.validUser.username },
        });

        expect(user?.hash !== userPassword);
      });
    });

    describe('Alternative scenario', () => {
      describe('user provides incorrect data types during password-recovery or new-password', () => {
        it('/api/auth/password-recovery (POST) should receive 400 if email is of incorrect type', async () => {
          const response = await request(httpServer)
            .post('/api/auth/password-recovery')
            .send({ email: authStub.login.invalidUserEmail.email });

          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            statusCode: 400,
            message: expect.any(Array),
            path: '/api/auth/password-recovery',
          });
          expect(response.body.message).toHaveLength(1);
        });
        it('/api/auth/new-password (POST) should receive 400 if newPassword and recoveryCode are of incorrect type', async () => {
          const response = await request(httpServer)
            .post('/api/auth/new-password')
            .send({ newPassword: true, recoveryCode: 12345 });

          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            statusCode: 400,
            message: expect.any(Array),
            path: '/api/auth/new-password',
          });
          expect(response.body.message).toHaveLength(2);
        });
      });

      describe('user provides incorrect credentials during password-recovery or new-password', () => {
        it('/api/auth/password-recovery (POST) should receive 400 if recaptchaToken is not provided in body', async () => {
          const response = await request(httpServer)
            .post('/api/auth/password-recovery')
            .send({
              email: 'test-email@yandex.ru',
            });

          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            statusCode: 400,
            message: expect.any(Array),
            path: '/api/auth/password-recovery',
          });
          expect(response.body.message).toHaveLength(1);
        });
        it('/api/auth/password-recovery  (POST) should receive 400 if recaptchaToken is incorrect', async () => {
          const response = await request(httpServer)
            .post('/api/auth/password-recovery')
            .send({
              email: 'test-email@yandex.ru',
              recaptchaToken: 'randomToken',
            });

          expect(response.status).toBe(403);
          expect(response.body).toEqual({
            statusCode: 403,
            message: expect.any(Array),
            path: '/api/auth/password-recovery',
          });
        });
        it('/api/auth/password-recovery (POST) should receive 204 if email is incorrect to prevent user detection', async () => {
          jest
            .spyOn(recaptchaGuard, 'canActivate')
            .mockReturnValueOnce(Promise.resolve(true));

          const response = await request(httpServer)
            .post('/api/auth/password-recovery')
            .send({
              email: 'test-email@yandex.ru',
              recaptchaToken: 'mockedToken',
            });

          expect(response.status).toBe(204);
          expect(response.body).toEqual({});
        });
        it('/api/auth/new-password (POST) should receive 400 if newPassword is too short', async () => {
          const response = await request(httpServer)
            .post('/api/auth/new-password')
            .send({
              newPassword: helperFunctionsForTesting.generateString(5),
              recoveryCode: authStub.getPasswordRecoveryCode(),
            });

          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            statusCode: 400,
            message: expect.any(Array),
            path: '/api/auth/new-password',
          });
          expect(response.body.message).toHaveLength(1);
        });
        it('/api/auth/new-password (POST) should receive 400 if newPassword is too long', async () => {
          const response = await request(httpServer)
            .post('/api/auth/new-password')
            .send({
              newPassword: helperFunctionsForTesting.generateString(21),
              recoveryCode: authStub.getPasswordRecoveryCode(),
            });

          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            statusCode: 400,
            message: expect.any(Array),
            path: '/api/auth/new-password',
          });
          expect(response.body.message).toHaveLength(1);
        });
        it('/api/auth/new-password (POST) should receive 400 if passwordRecovery code is incorrect', async () => {
          const response = await request(httpServer)
            .post('/api/auth/new-password')
            .send({
              newPassword: helperFunctionsForTesting.generateString(7),
              recoveryCode: '123',
            });

          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            statusCode: 400,
            message: expect.any(Array),
            path: '/api/auth/new-password',
          });
          expect(response.body.message).toHaveLength(1);
        });
        it('/api/auth/new-password (POST) should receive 400 if both newPassword and recovery code are incorrect', async () => {
          const response = await request(httpServer)
            .post('/api/auth/new-password')
            .send({
              newPassword: helperFunctionsForTesting.generateString(1),
              recoveryCode: 123,
            });

          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            statusCode: 400,
            message: expect.any(Array),
            path: '/api/auth/new-password',
          });
          expect(response.body.message).toHaveLength(2);
        });
      });
    });
  });

  ///////////////////////////////////////////////////////
  // LOGOUT
  describe('As an unauthorized user, I want to be able to logout from the system', () => {
    describe('drop database', () => {
      it('should drop database', async () => {
        await prisma.user.deleteMany({});
      });
    });

    describe('Successful logout', () => {
      it('should prepare data', async () => {
        // create user
        const response = await request(httpServer)
          .post('/api/auth/registration')
          .send(authStub.registration.validUser);

        expect(response.status).toBe(204);
        expect(response.body).toEqual({});
        expect(MailServiceMock.sendUserConfirmation).toBeCalledTimes(1);
        // manually confirm user
        const manuallyConfirmUser = await prisma.emailConfirmation.update({
          where: { userEmail: 'Aegoraa@yandex.ru' },
          data: {
            isConfirmed: true,
          },
        });
        expect(manuallyConfirmUser.isConfirmed).toBeTruthy();

        // login user 2 times to create two different sessions
        const firstSession = await request(httpServer)
          .post('/api/auth/login')
          .set('User-Agent', 'agent007')
          .send(authStub.login);

        expect(firstSession.status).toBe(200);
        expect(isUUID(firstSession.body.accessToken));
        expect(firstSession.headers['set-cookie']).toBeDefined();

        authStub.setUserDeviceSession1Tokens(
          firstSession.headers['set-cookie'][0],
        );

        const secondSession = await request(httpServer)
          .post('/api/auth/login')
          .set('User-Agent', 'agent008')
          .send(authStub.login);

        expect(secondSession.status).toBe(200);
        expect(isUUID(secondSession.body.accessToken));
        expect(secondSession.headers['set-cookie']).toBeDefined();

        const deviceSessionsAmount = await prisma.deviceSession.count();
        expect(deviceSessionsAmount).toBe(2);

        authStub.setUserDeviceSession2Tokens(
          firstSession.headers['set-cookie'][0],
        );
      });
      it('/api/auth/logout (POST) should successfully logout from the system', async () => {
        const response = await request(httpServer)
          .post('/api/auth/logout')
          .set('Cookie', authStub.getUserDeviceSession1Tokens().refreshToken);

        expect(response.status).toBe(204);
        expect(response.headers['set-cookie']).toBeUndefined();

        const deviceSessionsAmount = await prisma.deviceSession.count();
        expect(deviceSessionsAmount).toBe(1);
      });
    });

    describe('Alternative scenarios', () => {
      it('/api/auth/logout (POST) should fail if refresh-token is missing', async () => {
        const response = await request(httpServer).post('/api/auth/logout');

        expect(response.status).toBe(401);
        expect(response.body).toEqual({
          statusCode: 401,
          message: expect.any(Array),
          path: '/api/auth/logout',
        });
        expect(response.body.message).toHaveLength(1);
      });
      it('/api/auth/logout (POST) should fail if refresh-token is expired', async () => {
        const response = await request(httpServer)
          .post('/api/auth/logout')
          .set('Cookie', authStub.getUserDeviceSession1Tokens().refreshToken);

        expect(response.status).toBe(401);
        expect(response.body).toEqual({
          statusCode: 401,
          message: expect.any(Array),
          path: '/api/auth/logout',
        });
        expect(response.body.message).toHaveLength(1);
      });
      it('/api/auth/logout (POST) should fail if refresh-token is incorrect', async () => {
        const response = await request(httpServer)
          .post('/api/auth/logout')
          .set('Cookie', '123456');

        expect(response.status).toBe(401);
        expect(response.body).toEqual({
          statusCode: 401,
          message: expect.any(Array),
          path: '/api/auth/logout',
        });
        expect(response.body.message).toHaveLength(1);
      });
    });
  });
});
