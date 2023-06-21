import { PaymentProviderType } from '../dto/checkout.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import StripeService from '../services/stripe.service';
import { PrismaService } from '../../prisma/prisma.service';
import { SubscriptionQueryRepository } from '../repositories/subscription.query.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import {
  SubscriptionStatus,
  SubscriptionType,
  PaymentStatus,
} from '@prisma/client';
import { SubscriptionRepository } from '../repositories/subscription.repository';
export class CreatePaymentCommand {
  public constructor(
    public readonly paymentProvider: PaymentProviderType,
    public readonly priceId: string,
    public readonly userId: string,
    public readonly renew: boolean,
  ) {}
}
@CommandHandler(CreatePaymentCommand)
export class CreatePaymentUseCase
  implements ICommandHandler<CreatePaymentCommand>
{
  // private paymentServices: PaymentServices = {};

  public constructor(
    private readonly stripeService: StripeService,
    private readonly prisma: PrismaService,
    private readonly subscriptionQueryRepository: SubscriptionQueryRepository,
  ) {}

  public async execute(command: CreatePaymentCommand) {
    const { priceId, userId, paymentProvider, renew } = command;

    const mode = renew ? 'subscription' : 'payment';
    const reference = renew ? 'RECCURING' : 'ONETIME';
    // check that priceId exist in db
    const pricingTarrif =
      await this.subscriptionQueryRepository.getPricingTarrif(
        priceId,
        paymentProvider,
        reference,
      );

    if (!pricingTarrif)
      throw new NotFoundException(
        'Pricing plan for subscription was not found',
      );
    const price =
      await this.subscriptionQueryRepository.getSubscriptionPriceById(priceId);

    if (!price) throw new NotFoundException();

    const currentSubscription =
      await this.subscriptionQueryRepository.getCurrentSubscription(userId);

    if (
      (currentSubscription?.type === 'RECCURING' &&
        currentSubscription?.endDate &&
        renew) ||
      new Date() > new Date()
    ) {
      throw new ForbiddenException(
        'You already have active subscription. If you want to change your subscription plan, choose different payment method',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      let subscription = currentSubscription;
      if (!subscription) {
        subscription = await tx.subscription.create({
          data: {
            status: SubscriptionStatus.PENDING,
            type: reference,
            userId,
            priceId: price.id,
          },
        });
      }
      const payment = await tx.payment.create({
        data: {
          userId,
          priceId: price.id,
          pricingTarrifId: pricingTarrif.id,
          status: PaymentStatus.PENDING,
          provider: PaymentProviderType.Stripe,
          reference: reference,
          subscriptionId: subscription.id,
        },
      });

      const session = await this.stripeService.stripeCheckout(
        subscription.id,
        priceId,
        price.period,
        pricingTarrif.providerPriceId,
        userId,
        payment.id,
        currentSubscription ? currentSubscription.customerId : null,
        mode,
      );

      return session.url;
    });
  }
}
