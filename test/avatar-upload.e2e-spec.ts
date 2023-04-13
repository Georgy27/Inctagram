import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import {
  CanActivate,
  createParamDecorator,
  INestApplication,
} from '@nestjs/common';
import fs from 'node:fs';

import { AuthDto } from 'src/auth/dto/auth.dto';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { BAD_DIMENSIONS } from 'src/common/errors';
import { API, FILE_FIELD } from 'src/common/constants';
import { UserTestUtils } from './utils/user.test-utils';
import { PrismaModule } from 'src/prisma/prisma.module';
import { useGlobalPipes } from 'src/common/pipes/global.pipe';
import { useGlobalFilters } from 'src/common/filters/global.filter';

let mockId = '';

let prismaClient: PrismaClient;
let userTestUtils: UserTestUtils;

const sampleUser: AuthDto = {
  email: 'fake.email@gmail.com',
  username: 'fakeUser',
  password: 'qwerty',
};

jest.mock('src/common/guards/jwt-auth.guard.ts', () => {
  class MockedGuard implements CanActivate {
    canActivate(): boolean {
      return true;
    }
  }

  return { JwtAtGuard: MockedGuard, JwtRtGuard: MockedGuard };
});

jest.mock('src/common/guards/confirmation.guard.ts', () => {
  class MockedGuard implements CanActivate {
    canActivate(): boolean {
      return true;
    }
  }
  return { ConfirmationGuard: MockedGuard };
});

jest.mock('src/common/decorators/active-user.decorator', () => {
  const mockedDecorator = createParamDecorator((field: 'userId') => {
    const user = { userId: mockId };

    return field ? user[field] : user;
  });

  return { ActiveUser: mockedDecorator };
});

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        AuthModule,
        UserModule,
        PrismaModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    useGlobalPipes(app);
    useGlobalFilters(app);

    prismaClient = app.get<PrismaClient>(PrismaClient);

    await app.init();
  });

  beforeAll(async () => {
    userTestUtils = new UserTestUtils(prismaClient);

    await prismaClient.user.deleteMany();

    const { id } = await userTestUtils.createConfirmedUser({
      authDto: sampleUser,
    });

    mockId = id;
  });

  afterAll(async () => {
    await app.close();
  });

  const imageSmall = fs.readFileSync('./test/assets/image-small.png');

  it(`/${API.USERS}/self/images/avatar (POST) should return 400 if the image is too small`, async () => {
    expect.assertions(1);

    return request(app.getHttpServer())
      .post(`/${API.USERS}/self/images/avatar`)
      .set('Content-Type', `multipart/form-data;`)
      .attach(FILE_FIELD, imageSmall, {
        filename: 'image-small.png',
        contentType: 'image/png',
      })
      .expect(400)
      .then((response) => {
        expect(response.body.message).toEqual(
          expect.arrayContaining([BAD_DIMENSIONS]),
        );
      });
  });

  it(`/${API.USERS}/self/images/avatar (POST) should return 400 if the image is too large`, async () => {
    const buffer = Buffer.alloc(1024 * 1024 * 2);

    const imageLarge = Buffer.concat([imageSmall, buffer]);

    return request(app.getHttpServer())
      .post(`/${API.USERS}/self/images/avatar`)
      .set('Content-Type', `multipart/form-data;`)
      .attach(FILE_FIELD, imageLarge, {
        filename: 'image-small.png',
        contentType: 'image/png',
      })
      .expect(400);
  });

  const imageNormal = fs.readFileSync('./test/assets/image-normal.png');

  it(`/${API.USERS}/self/images/avatar (POST) should return 201`, async () => {
    const { url, previewUrl } = await request(app.getHttpServer())
      .post(`/${API.USERS}/self/images/avatar`)
      .set('Content-Type', `multipart/form-data;`)
      .attach(FILE_FIELD, imageNormal, {
        filename: 'image-normal.png',
        contentType: 'image/png',
      })
      .expect(201)
      .then((response) => {
        return response.body;
      });

    expect(url).toMatch(
      /^https?:\/\/inctagram\.storage\.yandexcloud\.net\/content\/users\/.*\.png$/,
    );
    expect(previewUrl).toMatch(
      /^https?:\/\/inctagram\.storage\.yandexcloud\.net\/content\/users\/.*\.png$/,
    );
  });
});
