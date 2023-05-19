import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { getApp } from '../testing-connection';
import request from 'supertest';
import { authStub } from '../auth/stubs/auth.stub';
import { helperFunctionsForTesting } from '../auth/helpers/helper-functions';

const sampleProfile = {
  name: 'James',
  surname: 'Bond',
  birthday: '2007-07-07',
  city: 'London',
  aboutMe: 'Bond, James Bond...',
};
describe('UserController', () => {
  jest.setTimeout(60 * 1000);
  let app: INestApplication;
  let httpServer: any;
  let prisma: PrismaService;
  let jwtService: JwtService;

  beforeAll(async () => {
    app = await getApp();
    prisma = await app.resolve(PrismaService);
    jwtService = await app.resolve(JwtService);
    httpServer = app.getHttpServer();
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

  describe('As an authorized user, I want to be able to check and update my profile', () => {
    describe('The user successfully updates his profile', () => {
      it('should prepare the data', async () => {
        // create user
        const response = await request(httpServer)
          .post('/api/auth/registration')
          .send(authStub.registration.validUser);

        // manually confirm user
        const manuallyConfirmUser = await prisma.emailConfirmation.update({
          where: { userEmail: 'Aegoraa@yandex.ru' },
          data: {
            isConfirmed: true,
          },
        });
        // check that empty profile was created
        const isProfile = await prisma.profile.findFirst({
          where: { name: 'James' },
        });

        expect(isProfile).toBeDefined();
        // login user and save tokens
        const token_1 = await request(httpServer)
          .post('/api/auth/login')
          .set('User-Agent', 'agent007')
          .send(authStub.login);

        expect.setState({ token_1 });
      });
      it('/api/users/self/profile (PUT) should be able to update profile', async () => {
        const accessToken = expect.getState().token_1.body.accessToken;

        const response = await request(httpServer)
          .put('/api/users/self/profile')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(sampleProfile);

        expect(response.status).toBe(204);
      });
      it('/api/users/self/profile (GET) should be able to get profile', async () => {
        const accessToken = expect.getState().token_1.body.accessToken;

        const response = await request(httpServer)
          .get('/api/users/self/profile')
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual({
          username: 'George',
          name: 'James',
          surname: 'Bond',
          birthday: '2007-07-07',
          city: 'London',
          aboutMe: 'Bond, James Bond...',
          avatar: {
            previewUrl: null,
            url: null,
          },
        });
      });
    });
    describe('Alternative profile scenarios', () => {
      describe('The user tries to update profile with incorrect data types', () => {
        it('/api/users/self/profile (PUT) should not update the profile when data is of wrong type', async () => {
          const accessToken = expect.getState().token_1.body.accessToken;

          const response = await request(httpServer)
            .put('/api/users/self/profile')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
              name: true,
              surname: 23,
              birthday: '2007-07-07',
              city: false,
              aboutMe: false,
            });

          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            statusCode: 400,
            message: expect.any(Array),
            path: '/api/users/self/profile',
          });
          expect(response.body.message).toHaveLength(4);
        });
      });

      describe('The user tries to update profile with incorrect credentials', () => {
        it('/api/users/self/profile (PUT) should not update the profile if username, name, surname, city and aboutMe of the user are empty', async () => {
          const accessToken = expect.getState().token_1.body.accessToken;

          const response = await request(httpServer)
            .put('/api/users/self/profile')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
              ...sampleProfile,
              username: '',
              name: '',
              surname: '',
              city: '',
              aboutMe: '',
            });

          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            statusCode: 400,
            message: expect.any(Array),
            path: '/api/users/self/profile',
          });
          expect(response.body.message).toHaveLength(5);
        });
        it('/api/users/self/profile (PUT) should not update the profile if name of the user is too long', async () => {
          const accessToken = expect.getState().token_1.body.accessToken;

          const response = await request(httpServer)
            .put('/api/users/self/profile')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
              ...sampleProfile,
              name: helperFunctionsForTesting.generateString(41),
            });

          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            statusCode: 400,
            message: expect.any(Array),
            path: '/api/users/self/profile',
          });
          expect(response.body.message).toHaveLength(1);
        });
        it('/api/users/self/profile (PUT) should not update the profile if username, name, surname, city and aboutMe of the user are too long', async () => {
          const accessToken = expect.getState().token_1.body.accessToken;

          const response = await request(httpServer)
            .put('/api/users/self/profile')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
              ...sampleProfile,
              name: helperFunctionsForTesting.generateString(41),
              surname: helperFunctionsForTesting.generateString(41),
              city: helperFunctionsForTesting.generateString(61),
              aboutMe: helperFunctionsForTesting.generateString(201),
              username: helperFunctionsForTesting.generateString(31),
            });

          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            statusCode: 400,
            message: expect.any(Array),
            path: '/api/users/self/profile',
          });
          expect(response.body.message).toHaveLength(5);
        });
        it('/api/users/self/profile (PUT) should not update the profile if birthday of the user is incorrect', async () => {
          const accessToken = expect.getState().token_1.body.accessToken;

          const response = await request(httpServer)
            .put('/api/users/self/profile')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
              ...sampleProfile,
              birthday: '02-02-23',
            });

          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            statusCode: 400,
            message: expect.any(Array),
            path: '/api/users/self/profile',
          });
          expect(response.body.message).toHaveLength(1);
        });
        it('/api/users/self/profile (PUT) should not update the profile if username is already taken', async () => {
          // create user with username
          const user = await request(httpServer)
            .post('/api/auth/registration')
            .send({
              email: 'testuser@yandex.ru',
              username: 'test-user',
              password: 'test-password',
            });

          // manually confirm user
          const manuallyConfirmUser = await prisma.emailConfirmation.update({
            where: { userEmail: 'testuser@yandex.ru' },
            data: {
              isConfirmed: true,
            },
          });

          const accessToken = expect.getState().token_1.body.accessToken;

          const response = await request(httpServer)
            .put('/api/users/self/profile')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
              ...sampleProfile,
              username: 'test-user',
            });

          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            statusCode: 400,
            message: expect.any(Array),
            path: '/api/users/self/profile',
          });
          expect(response.body.message).toHaveLength(1);
        });
      });
    });
  });
});
