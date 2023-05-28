import { PaymentProviderType } from '../dto/checkout.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import StripeService from '../services/stripe.service';
import { PrismaService } from '../../prisma/prisma.service';
import { SubscriptionQueryRepository } from '../repositories/subscription.query.repository';
import { NotFoundException } from '@nestjs/common';

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
  ) {
    // 	@Inject(PAYMENT_STRATEGIES) // private readonly paymentStrategies: PaymentStrategy[], // 	private readonly subscriptionsQueryRepository: SubscriptionsQueryRepository,
    // this.paymentStrategies.forEach((strategy) => {
    // 	this.paymentServices[strategy.name] = strategy;
    // });
  }

  public async execute(command: CreatePaymentCommand) {
    const { priceId, userId, paymentProvider, renew } = command;

    const paymentType = renew ? 'RECCURING' : 'ONETIME';
    // check that priceId exist in db
    const price =
      await this.subscriptionQueryRepository.getSubscriptionPriceById(priceId);

    if (!price)
      throw new NotFoundException('Price for subscription was not found');

    const pricingTarrif =
      await this.subscriptionQueryRepository.getPricingTarrif(
        priceId,
        paymentProvider,
        paymentType,
      );

    if (!pricingTarrif)
      throw new NotFoundException(
        'Pricing tarif for subscription was not found',
      );

    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          status: 'PENDING',
          userId,
          tarrifId: pricingTarrif.id,
        },
      });

      const session = await this.stripeService.stripeCheckout(
        priceId,
        pricingTarrif.providerPriceId,
        userId,
        renew,
      );

      console.log(session);
      return session.url;
    });
  }
}
