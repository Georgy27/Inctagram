import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CheckoutDto } from '../dto/checkout.dto';
import { CreatePaymentCommand } from '../use-cases/create-payment.use-case';

@Controller('subscriptions')
export class SubscriptionsController {
  public constructor(private readonly commandBus: CommandBus) {}

  @Post('checkout-session')
  async createCheckoutSession(@Body() checkoutDto: CheckoutDto) {
    const { userId, priceId, paymentProvider, renew } = checkoutDto;

    const url = await this.commandBus.execute<
      CreatePaymentCommand,
      string | null
    >(new CreatePaymentCommand(paymentProvider, priceId, userId, renew));

    // return url;
  }

  @Post('/webhook')
  async webhook() {}
}
