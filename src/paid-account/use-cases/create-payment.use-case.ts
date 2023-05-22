import { PaymentSystemType } from '../dto/checkout.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import StripeService from '../services/stripe.service';
import { PrismaService } from '../../prisma/prisma.service';

export class CreatePaymentCommand {
  public constructor(
    public readonly paymentSystem: PaymentSystemType,
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
  ) {
    // 	@Inject(PAYMENT_STRATEGIES) // private readonly paymentStrategies: PaymentStrategy[], // 	private readonly subscriptionsQueryRepository: SubscriptionsQueryRepository,
    // this.paymentStrategies.forEach((strategy) => {
    // 	this.paymentServices[strategy.name] = strategy;
    // });
  }

  public async execute(command: CreatePaymentCommand) {
    const { priceId, userId, paymentSystem, renew } = command;

    try {
      // check that priceId exist in db
    } catch (error) {
      console.log(error);
    }
    // const price = await this.subscriptionsQueryRepository.getPriceById(priceId);
    //
    // if (!price) throw new SubscriptionNotFoundException();
    //
    // const result =
    //   (await this.paymentServices[paymentSystem]?.execute(
    //     new PaymentCommand(userId, price, renew),
    //   )) || null;
    //
    // return result;
  }
}
