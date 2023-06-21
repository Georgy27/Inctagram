import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AdaptorModule } from './adaptors/adaptor.module';
import { githubOauthConfig } from './config/github-oauth.config';
import { configValidationSchema } from './config/validation-schema';
import { TestingModule } from './testing-remove-all-data/testing.module';
import { DeviceSessionsModule } from './deviceSessions/device-sessions.module';
import { googleOauthConfig } from './config/google-oauth.config';
import { stripeConfig } from './config/stripe.config';
import { SubscriptionModule } from './paid-account/subscription.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidationSchema,
      load: [githubOauthConfig, googleOauthConfig, stripeConfig],
    }),
    AuthModule,
    UserModule,
    PrismaModule,
    AdaptorModule,
    DeviceSessionsModule,
    SubscriptionModule,
    TestingModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
