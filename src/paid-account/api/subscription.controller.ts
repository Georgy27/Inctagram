import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  RawBodyRequest,
  Req,
  UseGuards,
  Headers,
  Put,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CheckoutDto } from '../dto/checkout.dto';
import { CreatePaymentCommand } from '../use-cases/create-payment.use-case';
import { JwtAtGuard } from '../../common/guards/jwt-auth.guard';
import { ActiveUser } from '../../common/decorators/active-user.decorator';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { StripeEvent } from '../interfaces/events.interface';
import StripeService from '../services/stripe.service';
import { HandleStripePaymentEventsCommand } from '../use-cases/stripe-payment-event.use-case';
import { AddCreditCardDto } from '../dto/credit-cart.dto';
import { SubscriptionDto } from '../dto/subscription.dto';
import { ManageSubscriptionCommand } from '../use-cases/manage-subscription.use-case';

@Controller('/api/payments')
export class SubscriptionsController {
  public constructor(
    private readonly commandBus: CommandBus,
    private readonly stripeService: StripeService,
  ) {}

  @Post('checkout-session')
  @UseGuards(JwtAtGuard)
  @HttpCode(HttpStatus.OK)
  async createCheckoutSession(
    @Body() checkoutDto: CheckoutDto,
    @ActiveUser('userId') userId: string,
  ) {
    const { priceId, paymentProvider, renew } = checkoutDto;

    const url = await this.commandBus.execute<
      CreatePaymentCommand,
      string | null
    >(new CreatePaymentCommand(paymentProvider, priceId, userId, renew));

    return url;
  }

  @Put('update-subscription-plan')
  @UseGuards(JwtAtGuard)
  @HttpCode(HttpStatus.OK)
  async subscription(
    @Body() subscriptionDto: SubscriptionDto,
    @ActiveUser('userId') userId: string,
  ) {
    const { priceId, paymentProvider } = subscriptionDto;

    const url = await this.commandBus.execute<
      ManageSubscriptionCommand,
      string | null
    >(new ManageSubscriptionCommand(paymentProvider, priceId, userId));

    return url;
  }
  @ApiExcludeEndpoint()
  @Post('stripe-webhook')
  @HttpCode(HttpStatus.OK)
  async webhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    if (!req.rawBody) {
      throw new BadRequestException('Invalid payload');
    }
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    const result = await this.commandBus.execute(
      new HandleStripePaymentEventsCommand(signature, req.rawBody),
    );
  }
}
