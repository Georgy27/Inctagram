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
export class ManageSubscriptionCommand {
  public constructor(
    public readonly paymentProvider: PaymentProviderType,
    public readonly priceId: string,
    public readonly userId: string,
  ) {}
}
@CommandHandler(ManageSubscriptionCommand)
export class ManageSubscriptionUseCase
  implements ICommandHandler<ManageSubscriptionCommand>
{
  // private paymentServices: PaymentServices = {};

  public constructor(
    private readonly stripeService: StripeService,
    private readonly prisma: PrismaService,
    private readonly subscriptionQueryRepository: SubscriptionQueryRepository,
  ) {}

  public async execute(command: ManageSubscriptionCommand) {
    const { priceId, userId, paymentProvider } = command;

    // check that priceId exist in db
    const pricingTarrif =
      await this.subscriptionQueryRepository.getPricingTarrif(
        priceId,
        paymentProvider,
        'RECCURING',
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
        currentSubscription?.endDate) ||
      new Date() > new Date()
    ) {
      throw new ForbiddenException('You already have active Subscription');
    }

    if (currentSubscription && currentSubscription.type === 'ONETIME') {
      return this.prisma.$transaction(async (tx) => {
        const payment = await tx.payment.create({
          data: {
            userId,
            priceId: priceId,
            pricingTarrifId: pricingTarrif.id,
            status: PaymentStatus.PENDING,
            provider: PaymentProviderType.Stripe,
            reference: 'RECCURING',
            subscriptionId: currentSubscription.id,
          },
        });

        // const session = await this.stripeService.stripeCheckout(
        //   priceId,
        //   pricingTarrif.providerPriceId,
        //   userId,
        //   payment.id,
        //   currentSubscription.customerId,
        //   'subscription',
        // );
        //
        // return session.url;
      });
    }
  }
}
