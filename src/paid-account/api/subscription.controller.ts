import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CheckoutDto } from '../dto/checkout.dto';

@Controller('subscriptions')
export class SubscriptionsController {
  public constructor(private readonly commandBus: CommandBus) {}

  @Post('checkout-session')
  async createCheckoutSession(@Body() checkoutDto: CheckoutDto) {
    const { userId, priceId, paymentSystem, renew } = checkoutDto;

    // const url = await this.commandBus.execute<
    //   CreatePaymentCommand,
    //   string | null
    // >(new CreatePaymentCommand(paymentSystem, priceId, userId, renew));
    //
    // return url;
  }

  @Post('/webhook')
  async webhook() {}
}
