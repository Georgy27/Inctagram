import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SubscriptionsController } from './api/subscription.controller';
import StripeService from './services/stripe.service';
import { CreatePaymentUseCase } from './use-cases/create-payment.use-case';

const useCases = [CreatePaymentUseCase];
@Module({
  imports: [CqrsModule],
  controllers: [SubscriptionsController],
  providers: [StripeService, ...useCases],
  exports: [StripeService, ...useCases],
})
export class PaidAccountModule {}
