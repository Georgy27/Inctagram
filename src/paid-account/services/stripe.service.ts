import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PaymentProviderType } from '../dto/checkout.dto';

@Injectable()
export default class StripeService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(
      configService.get<string>('STRIPE_SECRET_KEY') as string,
      {
        apiVersion: '2022-11-15',
      },
    );
  }

  async stripeCheckout(
    priceId: string,
    providerPriceId: string,
    userId: string,
    renew: boolean,
  ) {
    const mode = renew ? 'subscription' : 'payment';
    const session = await this.stripe.checkout.sessions.create({
      line_items: [
        {
          price: providerPriceId,
          quantity: 1,
        },
      ],
      metadata: {
        paymentId: priceId,
        userId: userId,
      },
      client_reference_id: priceId,
      expires_at: Math.floor((Date.now() + 1_800_000) / 1000),
      mode,
      success_url: 'https://example.com?success=true',
      cancel_url: 'https://example.com?success=true',
    });

    return session;
  }
}
