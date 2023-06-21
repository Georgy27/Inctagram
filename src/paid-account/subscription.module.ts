import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SubscriptionsController } from './api/subscription.controller';
import StripeService from './services/stripe.service';
import { CreatePaymentUseCase } from './use-cases/create-payment.use-case';
import { SubscriptionQueryRepository } from './repositories/subscription.query.repository';
import { HandleStripePaymentEventsUseCase } from './use-cases/stripe-payment-event.use-case';
import { UserRepository } from '../user/repositories/user.repository';
import { UserModule } from '../user/user.module';
import { SubscriptionRepository } from './repositories/subscription.repository';
import { ManageSubscriptionUseCase } from './use-cases/manage-subscription.use-case';

const useCases = [
  CreatePaymentUseCase,
  HandleStripePaymentEventsUseCase,
  ManageSubscriptionUseCase,
];
@Module({
  imports: [CqrsModule, UserModule],
  controllers: [SubscriptionsController],
  providers: [
    StripeService,
    SubscriptionQueryRepository,
    SubscriptionRepository,
    ...useCases,
  ],
  exports: [
    StripeService,
    SubscriptionQueryRepository,
    SubscriptionRepository,
    ...useCases,
  ],
})
export class SubscriptionModule {}
